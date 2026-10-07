"""台本から、場面ごとの読み上げ音声と字幕の時刻（timing.json）を作る。動画の長さと字幕は、これで自動で決まる。

使い方:
    python tts/narrate.py episodes/001-xxx --voice aivis-1     # 文ごとに音声を作り、場面ごとにつなぐ
    python tts/narrate.py episodes/001-xxx --voice silent      # 仮の無音（1分395字の速さで尺だけ決める。声が決まる前の通し確認用）

台本（script.md）の場面の分け方:
    - 「## 見出し」が場面の区切り。標準構成の見出しは決まった id になる（冒頭の物語→opening、第1章→ch1 …）。
    - 見出しの中をさらに分けるときは、その位置に <!-- 場面: ch1-crowd --> と書く（id は英数字とハイフン）。
    - 声のない場面（章の扉・終了画面など）は <!-- 場面: ch2-card 2.8秒 --> のように長さを書く。
    - 読み上げない行（「#」「>」「※」、コメント、[S1] の出典の印）は scripts/lint_script.py と同じ決まり。

出力:
    $YT_DATA_DIR/episodes/<回>/audio/<場面>.wav   … 場面ごとの音声（npm run sync で render/public に写る）
    $YT_DATA_DIR/episodes/<回>/tts_cache/<声>/   … 文ごとの音声。同じ文は作り直さない（料金を払い直さない）
    episodes/<回>/timing.json                   … 場面の長さ・音声・字幕の時刻（Git に入れる。render の fromTiming が読む）
    episodes/<回>/subtitles.srt                 … YouTube に上げる字幕ファイル（焼き込みと同じ文と時刻）
"""
import argparse
import hashlib
import importlib.util
import json
import re
import sys
import wave
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tts"))
import tts  # noqa: E402

spec = importlib.util.spec_from_file_location("lint_script", REPO / "scripts" / "lint_script.py")
lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lint)

GAP = 0.5         # 文と文の間（秒）。0.25 では詰まって聞こえた（2026-10-05 オーナー「文と文の間はもっと長く」）
TAIL = 0.6        # 場面の最後の余韻（秒）
SUB_MAX = 26      # 字幕1枚の字数（1行。縦長のショートは --vertical で16字。2026-10-07 24→26、文字は48px）
SECTION_IDS = {
    "冒頭の物語": "opening", "今日の答え合わせ": "today", "予想タイム": "quiz",
    "第1章": "ch1", "第2章": "ch2", "第3章": "ch3", "第4章": "ch4", "第5章": "ch5", "答え合わせ": "verdict", "教訓": "lesson",
}
MARK = re.compile(r"<!--\s*場面[:：]\s*([A-Za-z0-9-]+)\s*(?:([\d.]+)\s*秒)?\s*-->")


def parse(script: Path) -> list[dict]:
    """台本を場面に分ける。[{id, seconds(声なしのとき), lines:[本文の行]}]"""
    scenes: list[dict] = []
    cur = None
    in_code = in_comment = False
    for raw in script.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        m = MARK.search(line)
        if m:
            cur = {"id": m.group(1), "seconds": float(m.group(2)) if m.group(2) else None, "lines": []}
            scenes.append(cur)
            continue
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if in_comment or line.startswith("<!--"):
            in_comment = "-->" not in line
            continue
        if line.startswith("## "):
            title = line[3:].strip()
            sid = SECTION_IDS.get(title, f"s{len(scenes) + 1}")
            cur = {"id": sid, "seconds": None, "lines": []}
            scenes.append(cur)
            continue
        if not line or line.startswith(("#", ">", "※")):
            continue
        if cur is None:
            cur = {"id": "opening", "seconds": None, "lines": []}
            scenes.append(cur)
        cur["lines"].append(lint.strip_sources(lint.unicodedata.normalize("NFKC", line)).strip())
    ids = [s["id"] for s in scenes]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        sys.exit(f"場面の id が重なっています：{', '.join(sorted(dup))}（<!-- 場面: … --> で別の id にする）")
    return [s for s in scenes if s["lines"] or s["seconds"]]


# 台本に書く声への指示（docs/script-style.md）。〔間〕は文のあとの無音、それ以外の〔…〕は語り方のタグ
PAUSES = {"間・短": 1.0, "間": 1.5, "間・長": 2.2}
NOSUB = "字幕なし"  # 〔字幕なし〕：次の1文は字幕を出さない（読み上げはする）  # 文の終わりから次の文までの秒数（指示がなければ GAP）


def split_sentences(lines: list[str]) -> list[tuple[str, str]]:
    """[(種類, 中身)]。種類は "s"（読む文）、"pause"（〔間〕の名前）、"tag"（〔thoughtful〕などの語り方）。"""
    out = []
    for line in lines:
        for tok in re.split(r"(〔[^〕]*〕)", line):
            if tok.startswith("〔"):
                name = tok[1:-1].strip()
                if name in PAUSES:
                    out.append(("pause", name))
                elif name.startswith("間"):
                    sys.exit(f"間の指示は {'・'.join('〔' + k + '〕' for k in PAUSES)} のどれかにしてください：{tok}")
                else:
                    out.append(("tag", name))
                continue
            out += [("s", s.strip()) for s in re.split(r"(?<=[。？?！!])(?![」』）)])", tok) if s.strip()]
    return out


def with_tag(text: str, tag: str | None, v: dict | None) -> str:
    """語り方のタグを付ける（ElevenLabs v4 のように tags: true の声だけ。ほかの声には付けない）。
    1文ずつ作るので、毎回の文の頭に「その場面で最後に指示した語り方＋声ごとの速さ」を付ける。"""
    if not v or not v.get("tags"):
        return text
    parts = [tag or v.get("default_tag")] + ([v["pace"]] if v.get("pace") else [])
    parts = [p for p in parts if p]
    return f"[{', '.join(parts)}] {text}" if parts else text


PARTICLES = ("は", "が", "を", "に", "で", "と", "も", "へ", "や", "の", "から", "まで", "より", "けど", "ので")


BREAK = "｜"  # 台本の中で「字幕をここで切る」印（読み上げない。docs/script-style.md の7章）
KANA = re.compile(r"[ぁ-ゖ]")


def subtitle_parts(s: str, limit: int = SUB_MAX) -> list[str]:
    """字幕は1行（横長26字・縦長16字）。長い文は、台本の｜ → 読点 → 助詞のあと の順に、真ん中に近い所で分ける。
    助詞で切るのは、助詞の前が漢字・カタカナ・数字・閉じかっこのときだけ（「ひと｜つ」「ふたり｜とも」のような語の途中で切らない）。"""
    if BREAK in s:
        marks = [p for p in s.split(BREAK) if p]
        if all(len(p) <= limit for p in marks):
            return marks
        return [x for p in marks for x in subtitle_parts(p, limit)]
    if len(s) <= limit:
        return [s]
    lo, hi, mid = len(s) - limit, limit, len(s) / 2  # 前も後ろも limit 以下になる範囲で切る
    depth, inside = 0, set()  # 「」（）の中では切らない
    for i, ch in enumerate(s):
        depth += ch in "「（(『" ; depth -= ch in "」）)』"
        if depth > 0:
            inside.add(i + 1)
    narrow = [i for i in range(max(1, lo), min(len(s) - 1, hi) + 1) if i not in inside]
    wide = [i for i in range(1, len(s) - 1) if i not in inside]  # 3枚以上に分かれる長い文（2026-10-05「なぜ現｜実の」のような語の途中の切れを防ぐ）
    commas = lambda rng: [i for i in rng if s[i - 1] == "、"]
    parts = lambda rng: [i for i in rng if s[i] not in "、。？！」" and any(
        s[:i].endswith(p) and i - len(p) > 0 and not KANA.match(s[i - len(p) - 1]) for p in PARTICLES)]
    for cands in (commas(narrow), parts(narrow), commas(wide), parts(wide)):
        if cands:
            cut = min(cands, key=lambda i: abs(i - mid))
            return subtitle_parts(s[:cut], limit) + subtitle_parts(s[cut:], limit)
    cut = limit - 1 if s[limit] in "、。？！」）" else limit  # 切れ目がなければ字数で（句読点で始めない）
    return subtitle_parts(s[:cut], limit) + subtitle_parts(s[cut:], limit)


def silent_wav(text: str, out: Path) -> float:
    sec = max(0.6, len(text) / lint.CHARS_PER_MIN * 60)
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(tts.RATE)
        w.writeframes(b"\x00\x00" * int(tts.RATE * sec))
    return sec


def silent_seconds(sec: float, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(tts.RATE)
        w.writeframes(b"\x00\x00" * int(tts.RATE * sec))


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as r:
        return r.getnframes() / r.getframerate()


def write_srt(scenes: list[dict], out: Path) -> None:
    """YouTube に上げる字幕ファイル（SRT）。動画に焼き込んだ字幕と同じ時刻・文。"""
    def ts(x: float) -> str:
        ms = int(round(x * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    rows, t0, n = [], 0.0, 0
    for sc in scenes:
        for a_, b_, text in sc["lines"]:
            n += 1
            rows.append(f"{n}\n{ts(t0 + a_)} --> {ts(t0 + b_)}\n{text}\n")
        t0 += sc["seconds"] or 0
    out.write_text("\n".join(rows), encoding="utf-8")


def suspicious_lines(rows: list[tuple[str, float]], ratio: float = 1.3, extra: float = 0.5) -> list[tuple[int, float]]:
    """[(読む文, 秒)] から、長さの割に音声が長すぎる文を探す（同じ言葉を2回読んだ・言い直した疑い）。
    1本の中の全部の文で「秒 ＝ a ＋ b×字数 ＋ c×読点の数」を当てはめ、予想より ratio 倍以上かつ extra 秒以上長い文を返す。
    2026-10-06：「では、一年後。」が「では、では、一年後。」になっていた（予想の1.36倍・＋0.6秒。ほかの文は数字の多い文で1.25倍まで）。
    長い文の頭の1語の繰り返しは差が小さく、ここでは見つからない（台本の側で防ぐ：lint_script.py）。戻り値は [(rows の番号, 予想の何倍か)]"""
    if len(rows) < 20:
        return []
    feats = [(1.0, len(re.sub(r"[、。？！?!「」（）・\s]", "", y)), y.count("、")) for y, _ in rows]
    ys = [d for _, d in rows]
    # 正規方程式（3×3）を解く
    m = [[sum(f[i] * f[j] for f in feats) for j in range(3)] + [sum(f[i] * y for f, y in zip(feats, ys))] for i in range(3)]
    for i in range(3):
        if abs(m[i][i]) < 1e-9:
            return []
        m[i] = [x / m[i][i] for x in m[i]]
        for j in range(3):
            if j != i:
                m[j] = [x - m[j][i] * z for x, z in zip(m[j], m[i])]
    co = [m[i][3] for i in range(3)]
    out = []
    for k, (f, d) in enumerate(zip(feats, ys)):
        pred = co[0] + co[1] * f[1] + co[2] * f[2]
        if pred > 0 and d / pred >= ratio and d - pred >= extra:
            out.append((k, d / pred))
    return out


def report_suspicious(log: list, out_scenes: list[dict]) -> None:
    starts, acc = [], 0.0
    for sc in out_scenes:
        starts.append(acc)
        acc += sc["seconds"] or 0
    hits = suspicious_lines([(y, d) for _, _, _, y, d in log])
    if not hits:
        return
    print("\n聞いて確かめる文（長さの割に音声が長い。同じ言葉を2回読んでいないか）：")
    for k, r in hits:
        i, t, s, _, d = log[k]
        at = starts[i] + t
        print(f"  {int(at // 60)}:{int(at % 60):02d}  {out_scenes[i]['id']:<12} {d:4.1f}秒（予想の{r:.2f}倍）  {s}")
    print("  2回読んでいたら、台本の言い方を変えて作り直す（同じ文のままだとキャッシュの音声が使われる）")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode", type=Path, help="episodes/<回> のフォルダ")
    ap.add_argument("--voice", required=True, help="engines.json の声の名前、または silent（仮の無音）")
    ap.add_argument("--vertical", action="store_true", help="縦長のショート（字幕を1行16字で区切る）")
    ap.add_argument("--script", default=None, help="台本のファイル名（既定は script.md）。script-v2.md なら timing-v2.json・subtitles-v2.srt を書き、音声は <回>-v2 に置く")
    a = ap.parse_args()
    ep = a.episode.resolve()
    name = a.script or ("short.md" if a.vertical else "script.md")
    m = re.fullmatch(r"script(-[A-Za-z0-9]+)?\.md", name)
    suffix = m.group(1) or "" if m else ""
    ep_id = ep.name + suffix  # 台本の版ごとに音声の置き場を分ける（render の動画の id と同じ）
    scenes = parse(ep / name)
    cfg = tts.load_cfg()
    v = None if a.voice == "silent" else tts.find_voice(cfg, a.voice)
    data = tts.DATA / "episodes" / ep_id
    cache = data / "tts_cache" / a.voice
    audio_dir = data / "audio"
    paid_chars = 0
    out_scenes = []
    spoken_log = []  # [(場面の番号, 場面の中の秒, 文, 読む文, 秒)]：長すぎる文を探す（suspicious_lines）
    for sc in scenes:
        if not sc["lines"]:  # 声のない場面
            out_scenes.append({"id": sc["id"], "seconds": sc["seconds"], "audio": None, "lines": []})
            continue
        parts, lines, t, tag, nosub = [], [], 0.0, None, False
        for kind, s in split_sentences(sc["lines"]):
            if kind == "tag":
                if s == NOSUB:  # 次の1文は字幕を出さない（毎回の締めのひと言など、画面に大きく出す文。2026-10-05）
                    nosub = True
                else:
                    tag = s
                continue
            if kind == "pause":  # 前後の GAP と合わせて PAUSES の秒数になる無音をはさむ
                if parts:
                    sil = cache.parent / "_pause" / f"{s}.wav"
                    silent_seconds(max(0.0, PAUSES[s] - 2 * GAP), sil)
                    parts.append(sil)
                    t += wav_seconds(sil) + GAP
                continue
            spoken = with_tag(tts.apply_yomi(s.replace(BREAK, "")), tag, v)  # 読み間違いを直した文で音声を作る（字幕は元の表記）
            key = hashlib.sha1(f"{a.voice}\n{spoken}".encode()).hexdigest()[:16]
            wav = cache / f"{key}.wav"
            if not wav.exists():
                if v is None:
                    silent_wav(spoken, wav)
                else:
                    tts.synthesize(spoken, v, wav)
                    paid_chars += len(spoken)
            dur = wav_seconds(wav)
            spoken_log.append((len(out_scenes), t, s.replace(BREAK, ""), tts.apply_yomi(s.replace(BREAK, "")), dur))
            subs = [] if nosub else subtitle_parts(s, 16 if a.vertical else SUB_MAX)
            nosub = False
            total = sum(len(x) for x in subs) or 1
            st = t
            for x in subs:  # 文を字幕に分けたときは、字数の割合で時間を分ける
                d = dur * len(x) / total
                lines.append([round(st, 3), round(st + d, 3), x])
                st += d
            parts.append(wav)
            t += dur + GAP
        out_wav = audio_dir / f"{sc['id']}.wav"
        sec = tts.concat_wavs(parts, out_wav, GAP)
        out_scenes.append({"id": sc["id"], "seconds": round(sec + TAIL, 3), "audio": f"{sc['id']}.wav", "lines": lines})
        print(f"  {sc['id']:<14} {sec:6.1f}秒  {len(lines)}枚の字幕")
    timing = {"voice": a.voice, "scenes": out_scenes}
    text = json.dumps(timing, ensure_ascii=False, indent=1)
    # 字幕の1枚は1行にまとめて読みやすくする
    text = re.sub(r'\[\n\s+([\d.]+),\n\s+([\d.]+),\n\s+(".*?")\n\s+\]', r"[\1, \2, \3]", text)
    timing_name = "timing-short.json" if a.vertical else f"timing{suffix}.json"
    (ep / timing_name).write_text(text + "\n", encoding="utf-8")
    write_srt(out_scenes, ep / ("subtitles-short.srt" if a.vertical else f"subtitles{suffix}.srt"))
    total = sum(s["seconds"] or 0 for s in out_scenes)
    cost = "" if v is None else f"、今回作った分 {paid_chars}字・約{tts.cost_usd(v['engine'], 'あ' * paid_chars, cfg['pricing']) * cfg['jpy_per_usd']:.0f}円"
    print(f"\n{len(out_scenes)}場面、合計 {int(total // 60)}分{total % 60:.0f}秒{cost}")
    print(f"→ {ep / timing_name}（音声は {audio_dir}）")
    if v is not None:
        report_suspicious(spoken_log, out_scenes)
    if a.voice == "silent":
        print("※ 仮の無音です。声が決まったら --voice を変えて作り直すと、尺と字幕も声に合わせて変わります。")


if __name__ == "__main__":
    main()
