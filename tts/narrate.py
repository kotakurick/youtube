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

GAP = 0.25        # 文と文の間（秒）
TAIL = 0.6        # 場面の最後の余韻（秒）
SUB_MAX = 24      # 字幕1枚の字数（1行。縦長のショートは --vertical で16字）
SECTION_IDS = {
    "冒頭の物語": "opening", "今日の答え合わせ": "today", "予想タイム": "quiz",
    "第1章": "ch1", "第2章": "ch2", "第3章": "ch3", "答え合わせ": "verdict", "教訓": "lesson",
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
        cur["lines"].append(lint.strip_tags(lint.unicodedata.normalize("NFKC", line)).strip())
    ids = [s["id"] for s in scenes]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        sys.exit(f"場面の id が重なっています：{', '.join(sorted(dup))}（<!-- 場面: … --> で別の id にする）")
    return [s for s in scenes if s["lines"] or s["seconds"]]


def split_sentences(lines: list[str]) -> list[str]:
    out = []
    for line in lines:
        out += [s.strip() for s in re.split(r"(?<=[。？?！!])", line) if s.strip()]
    return out


PARTICLES = ("は", "が", "を", "に", "で", "と", "も", "へ", "や", "の", "から", "まで", "より", "けど", "ので")


def subtitle_parts(s: str, limit: int = SUB_MAX) -> list[str]:
    """字幕は1行（横長24字・縦長16字）。長い文は、読点 → 助詞のあと の順に、真ん中に近い所で分ける。"""
    if len(s) <= limit:
        return [s]
    lo, hi, mid = len(s) - limit, limit, len(s) / 2  # 前も後ろも limit 以下になる範囲で切る
    depth, inside = 0, set()  # 「」（）の中では切らない
    for i, ch in enumerate(s):
        depth += ch in "「（(『" ; depth -= ch in "」）)』"
        if depth > 0:
            inside.add(i + 1)
    rng = [i for i in range(max(1, lo), min(len(s) - 1, hi) + 1) if i not in inside]
    commas = [i for i in rng if s[i - 1] == "、"]
    parts = [i for i in rng if any(s[:i].endswith(p) for p in PARTICLES) and s[i] not in "、。？！"]
    for cands in (commas, parts):
        if cands:
            cut = min(cands, key=lambda i: abs(i - mid))
            return subtitle_parts(s[:cut], limit) + subtitle_parts(s[cut:], limit)
    return subtitle_parts(s[:limit], limit) + subtitle_parts(s[limit:], limit)  # 切れ目がなければ字数で


def silent_wav(text: str, out: Path) -> float:
    sec = max(0.6, len(text) / lint.CHARS_PER_MIN * 60)
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(tts.RATE)
        w.writeframes(b"\x00\x00" * int(tts.RATE * sec))
    return sec


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as r:
        return r.getnframes() / r.getframerate()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode", type=Path, help="episodes/<回> のフォルダ")
    ap.add_argument("--voice", required=True, help="engines.json の声の名前、または silent（仮の無音）")
    ap.add_argument("--vertical", action="store_true", help="縦長のショート（字幕を1行16字で区切る）")
    a = ap.parse_args()
    ep = a.episode.resolve()
    ep_id = ep.name
    scenes = parse(ep / ("short.md" if a.vertical else "script.md"))
    cfg = tts.load_cfg()
    v = None if a.voice == "silent" else tts.find_voice(cfg, a.voice)
    data = tts.DATA / "episodes" / ep_id
    cache = data / "tts_cache" / a.voice
    audio_dir = data / "audio"
    paid_chars = 0
    out_scenes = []
    for sc in scenes:
        if not sc["lines"]:  # 声のない場面
            out_scenes.append({"id": sc["id"], "seconds": sc["seconds"], "audio": None, "lines": []})
            continue
        parts, lines, t = [], [], 0.0
        for s in split_sentences(sc["lines"]):
            spoken = tts.apply_yomi(s)  # 読み間違いを直した文で音声を作る（字幕は元の表記）
            key = hashlib.sha1(f"{a.voice}\n{spoken}".encode()).hexdigest()[:16]
            wav = cache / f"{key}.wav"
            if not wav.exists():
                if v is None:
                    silent_wav(spoken, wav)
                else:
                    tts.synthesize(spoken, v, wav)
                    paid_chars += len(spoken)
            dur = wav_seconds(wav)
            subs = subtitle_parts(s, 16 if a.vertical else SUB_MAX)
            total = sum(len(x) for x in subs)
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
    (ep / ("timing-short.json" if a.vertical else "timing.json")).write_text(text + "\n", encoding="utf-8")
    total = sum(s["seconds"] or 0 for s in out_scenes)
    cost = "" if v is None else f"、今回作った分 {paid_chars}字・約{tts.cost_usd(v['engine'], 'あ' * paid_chars, cfg['pricing']) * cfg['jpy_per_usd']:.0f}円"
    print(f"\n{len(out_scenes)}場面、合計 {int(total // 60)}分{total % 60:.0f}秒{cost}")
    print(f"→ {ep / 'timing.json'}（音声は {audio_dir}）")
    if a.voice == "silent":
        print("※ 仮の無音です。声が決まったら --voice を変えて作り直すと、尺と字幕も声に合わせて変わります。")


if __name__ == "__main__":
    main()
