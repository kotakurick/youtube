"""音声合成。声（エンジン）を切り替えられるようにして、台本から wav を作る。標準ライブラリ＋ffmpeg のみ。

使い方:
    python tts/tts.py say  --voice google-1 --in 原稿.txt --out 出力.wav   # 1本分を作る
    python tts/tts.py trial                                                 # 候補の声を全部試して比べる
    python tts/tts.py trial --only fish-1,google-1                          # 一部だけ

声の候補と料金は tts/engines.json。APIキーは環境変数から読む（Gitにもチャットにも入れない）:
    FISH_API_KEY / ELEVENLABS_API_KEY / GOOGLE_TTS_API_KEY
パソコン内で動くエンジンはアプリを起動しておく（AivisSpeech: 127.0.0.1:10101、VOICEVOX: 127.0.0.1:50021）。

読み間違いの対策:
    tts/yomi.tsv の「表記 → 読み」を、送る前に置き換える（長い表記から順に）。trial は置き換えずに素の強さを見る。

trial の出力:
    $YT_DATA_DIR/bench/_tts/<候補名>/sample01/voice.wav  … bench/voice.py の measure・listen にそのまま入る
    research/benchmark/compare/tts_trial.tsv           … 1本・1か月あたりの料金の試算
"""
import argparse
import base64
import csv
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TTS = REPO / "tts"
DATA = Path(os.environ.get("YT_DATA_DIR", REPO / "_local"))
TRIAL_DIR = DATA / "bench" / "_tts"
RATE = 44100

# 1回のリクエストに入れる最大文字数（各社の上限より小さめ）
MAX_CHARS = {"fish": 1000, "elevenlabs": 1500, "google": 1200, "aivis": 400, "voicevox": 400}


# ---------- HTTP ----------

def http(url: str, body: bytes | None, headers: dict, retries: int = 3) -> bytes:
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            detail = e.read()[:300].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code}: {detail}") from None
    raise RuntimeError("unreachable")


def need_key(name: str) -> str:
    key = os.environ.get(name)
    if not key:
        raise RuntimeError(f"環境変数 {name} が設定されていません")
    return key


# ---------- エンジンごとの呼び出し（戻り値は音声ファイルのバイト列と拡張子） ----------

def synth_fish(text: str, v: dict) -> tuple[bytes, str]:
    url = os.environ.get("FISH_API_URL", "https://api.fish.audio") + "/v1/tts"
    req = {"text": text, "reference_id": v["voice"], "format": "wav", "sample_rate": RATE}
    if v.get("speed"):  # 話す速さの倍率（engines.json の speed）。ルールの1分390〜400字に合わせる
        req["prosody"] = {"speed": float(v["speed"]), "volume": 0}
    for k in ("temperature", "top_p"):  # 低いほど毎回の出力がそろう（Fish の初期値は 0.7）
        if v.get(k) is not None:
            req[k] = float(v[k])
    body = json.dumps(req).encode()
    headers = {"Authorization": f"Bearer {need_key('FISH_API_KEY')}", "Content-Type": "application/json",
               "model": v.get("model", "s2.1-pro")}
    return http(url, body, headers), "wav"


def synth_elevenlabs(text: str, v: dict) -> tuple[bytes, str]:
    base = os.environ.get("ELEVENLABS_API_URL", "https://api.elevenlabs.io")
    url = f"{base}/v1/text-to-speech/{urllib.parse.quote(v['voice'])}?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": v.get("model", "eleven_v3"), **v.get("options", {})}).encode()
    headers = {"xi-api-key": need_key("ELEVENLABS_API_KEY"), "Content-Type": "application/json"}
    return http(url, body, headers), "mp3"


def synth_google(text: str, v: dict) -> tuple[bytes, str]:
    url = os.environ.get("GOOGLE_TTS_API_URL", "https://texttospeech.googleapis.com") + "/v1/text:synthesize"
    body = json.dumps({
        "input": {"text": text},
        "voice": {"languageCode": "ja-JP", "name": v["voice"]},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": RATE},
    }).encode()
    headers = {"X-Goog-Api-Key": need_key("GOOGLE_TTS_API_KEY"), "Content-Type": "application/json"}
    data = json.loads(http(url, body, headers))
    return base64.b64decode(data["audioContent"]), "wav"


def synth_local(base: str):
    """AivisSpeech と VOICEVOX は同じ形の API（audio_query → synthesis）。"""
    def synth(text: str, v: dict) -> tuple[bytes, str]:
        q = urllib.parse.urlencode({"text": text, "speaker": v["voice"]})
        query = http(f"{base}/audio_query?{q}", b"", {})
        if v.get("speed"):  # 話す速さの倍率（engines.json の speed）。ルールの1分390〜400字に合わせる
            qd = json.loads(query)
            qd["speedScale"] = float(v["speed"])
            query = json.dumps(qd).encode()
        sp = urllib.parse.urlencode({"speaker": v["voice"]})
        return http(f"{base}/synthesis?{sp}", query, {"Content-Type": "application/json"}), "wav"
    return synth


ENGINES = {
    "fish": synth_fish,
    "elevenlabs": synth_elevenlabs,
    "google": synth_google,
    "aivis": synth_local(os.environ.get("AIVIS_URL", "http://127.0.0.1:10101")),
    "voicevox": synth_local(os.environ.get("VOICEVOX_URL", "http://127.0.0.1:50021")),
}


# ---------- 原稿の下ごしらえ ----------

def load_yomi() -> list[tuple[str, str]]:
    path = TTS / "yomi.tsv"
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        rows = [(r["表記"], r["読み"]) for r in csv.DictReader(f, delimiter="\t") if r.get("表記")]
    return sorted(rows, key=lambda r: -len(r[0]))


KANA_DIGIT = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"]
# 「十・百・千」の前の音の変化（さんびゃく、はっぴゃく、さんぜん…）
KANA_PLACE = {
    1000: {1: "せん", 3: "さんぜん", 8: "はっせん"},
    100: {1: "ひゃく", 3: "さんびゃく", 6: "ろっぴゃく", 8: "はっぴゃく"},
    10: {1: "じゅう"},
}
KANA_PLACE_NAME = {1000: "せん", 100: "ひゃく", 10: "じゅう"}
KANA_FRAC = ["ぜろ", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"]


def int_to_kana(n: int) -> str:
    """0〜9999 をひらがなに。それより大きい数は数字のまま返す（万・億は声のほうが正しく読む）。"""
    if n == 0:
        return "ぜろ"
    if n > 9999:
        return str(n)
    out = ""
    for place in (1000, 100, 10):
        d, n = divmod(n, place)
        if d:
            out += KANA_PLACE[place].get(d, KANA_DIGIT[d] + KANA_PLACE_NAME[place])
    return out + KANA_DIGIT[n]


def decimal_to_kana(m: re.Match) -> str:
    """28.3 → にじゅうはってんさん。声に任せると「点」が抜けたり「にじゅうはち、さん」になったりする。"""
    head = "れい" if m.group(1) == "0" else int_to_kana(int(m.group(1)))
    # 「点」の前の促音（いってん、はってん、じゅってん）
    for a, b in (("いち", "いっ"), ("はち", "はっ"), ("じゅう", "じゅっ")):
        if head.endswith(a):
            head = head[: -len(a)] + b
            break
    return head + "てん" + "".join(KANA_FRAC[int(c)] for c in m.group(2))


def apply_yomi(text: str) -> str:
    for src, dst in load_yomi():
        text = text.replace(src, dst)
    # 小数（台本の決まりでは読み上げないが、残っていても正しく読ませる）
    return re.sub(r"(?<![\d.,])(\d{1,4})\.(\d+)(?![\d.])", decimal_to_kana, text)


def chunks(text: str, limit: int) -> list[str]:
    """文の切れ目（。！？と改行）で、limit 文字以下のかたまりに分ける。"""
    sentences = [s for s in re.split(r"(?<=[。！？!?])|\n", text) if s and s.strip()]
    out, cur = [], ""
    for s in sentences:
        while len(s) > limit:              # 1文が長すぎるときは読点で切る
            cut = s.rfind("、", 0, limit)
            cut = cut + 1 if cut > 0 else limit
            if cur:
                out.append(cur)
                cur = ""
            out.append(s[:cut])
            s = s[cut:]
        if len(cur) + len(s) > limit and cur:
            out.append(cur)
            cur = ""
        cur += s
    if cur.strip():
        out.append(cur)
    return out


# ---------- 音声ファイル ----------

def to_wav(src: Path, dst: Path) -> None:
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(src),
                    "-ac", "1", "-ar", str(RATE), "-sample_fmt", "s16", str(dst)], check=True)


def concat_wavs(parts: list[Path], out: Path, gap_sec: float = 0.25) -> float:
    """同じ形式の wav をつなぐ。かたまりの間に短い無音を入れる。戻り値は秒数。"""
    out.parent.mkdir(parents=True, exist_ok=True)
    silence = b"\x00\x00" * int(RATE * gap_sec)
    frames = 0
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        for i, p in enumerate(parts):
            with wave.open(str(p)) as r:
                data = r.readframes(r.getnframes())
            if i:
                w.writeframes(silence)
                frames += len(silence) // 2
            w.writeframes(data)
            frames += len(data) // 2
    return frames / RATE


def synthesize(text: str, v: dict, out: Path) -> float:
    engine = ENGINES[v["engine"]]
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for i, part in enumerate(chunks(text, MAX_CHARS[v["engine"]])):
            audio, ext = engine(part, v)
            raw = Path(tmp) / f"raw{i:03d}.{ext}"
            raw.write_bytes(audio)
            wav = Path(tmp) / f"part{i:03d}.wav"
            to_wav(raw, wav)
            parts.append(wav)
        return concat_wavs(parts, out)


# ---------- 料金 ----------

def cost_usd(engine: str, text: str, pricing: dict) -> float:
    p = pricing[engine]
    if p["unit"] == "usd_per_million_bytes":
        return len(text.encode("utf-8")) / 1e6 * p["price"]
    if p["unit"] == "usd_per_1k_chars":
        return len(text) / 1000 * p["price"]
    if p["unit"] == "usd_per_million_chars":
        return len(text) / 1e6 * p["price"]
    return 0.0


def monthly_usd(engine: str, per_video_usd: float, per_video_chars: int, cfg: dict) -> float:
    p = cfg["pricing"][engine]
    n = cfg["videos_per_month"]
    chars = per_video_chars * n
    free = p.get("free_chars_per_month", 0)
    usage = per_video_usd * n * (max(chars - free, 0) / chars if chars else 0)
    return usage + p.get("monthly_usd", 0)


# ---------- コマンド ----------

def load_cfg() -> dict:
    return json.loads((TTS / "engines.json").read_text(encoding="utf-8"))


def find_voice(cfg: dict, name: str) -> dict:
    for v in cfg["voices"]:
        if v["name"] == name:
            return v
    sys.exit(f"engines.json に {name} がありません")


def cmd_say(args) -> None:
    cfg = load_cfg()
    v = find_voice(cfg, args.voice)
    text = apply_yomi(Path(args.inp).read_text(encoding="utf-8"))
    sec = synthesize(text, v, Path(args.out))
    print(f"{args.out}（{sec:.1f}秒、{len(text)}字、約{cost_usd(v['engine'], text, cfg['pricing']) * cfg['jpy_per_usd']:.1f}円）")


def cmd_trial(args) -> None:
    cfg = load_cfg()
    sample = Path(args.sample)
    text = sample.read_text(encoding="utf-8").strip()
    only = set(args.only.split(",")) if args.only else None
    per_video_chars = cfg["chars_per_video"]
    scale = per_video_chars / len(text.replace("\n", ""))
    rows = []
    for v in cfg["voices"]:
        if only and v["name"] not in only:
            continue
        if not v.get("voice"):
            print(f"  飛ばす: {v['name']}（voice が未設定）")
            continue
        out = TRIAL_DIR / v["name"] / sample.stem / "voice.wav"
        try:
            t0 = time.time()
            sec = synthesize(text, v, out)
            took = time.time() - t0
        except Exception as e:  # 1つの失敗で全体を止めない
            print(f"  失敗: {v['name']}: {e}")
            continue
        credit = " ".join(x for x in ("TTS候補", v["engine"], v.get("model"), v["voice"]) if x)
        (out.parent / "meta.json").write_text(json.dumps({"voice_credit": credit}, ensure_ascii=False), encoding="utf-8")
        usd = cost_usd(v["engine"], text, cfg["pricing"]) * scale
        rows.append({
            "name": v["name"], "engine": v["engine"], "model": v.get("model", ""), "voice": v["voice"],
            "sample_sec": round(sec, 1),
            "chars_per_min": round(len(text.replace("\n", "")) / (sec / 60)),
            "gen_sec": round(took, 1),
            "jpy_per_video": round(usd * cfg["jpy_per_usd"]),
            "jpy_per_month": round(monthly_usd(v["engine"], usd, per_video_chars, cfg) * cfg["jpy_per_usd"]),
            "pricing_checked": cfg["pricing"][v["engine"]]["checked"],
        })
        print(f"  済: {v['name']}（{sec:.1f}秒、1本約{rows[-1]['jpy_per_video']}円）")
    if not rows:
        sys.exit("作れた候補がありません。engines.json の voice と APIキーを確認してください。")
    path = REPO / "research/benchmark/compare/tts_trial.tsv"
    path.parent.mkdir(parents=True, exist_ok=True)
    # 今回作らなかった候補の行は残す（--only で一部だけ作り直しても前の結果が消えない）
    if path.exists():
        done = {r["name"] for r in rows}
        with path.open(encoding="utf-8-sig", newline="") as f:
            old = [r for r in csv.DictReader(f, delimiter="\t") if r["name"] not in done]
        rows = old + rows
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    print(f"保存しました: {path}\n1本 {per_video_chars}字・月{cfg['videos_per_month']}本で試算。"
          f"次は python bench/voice.py measure と listen で、競合の声と並べて聞き比べる。")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("say")
    s.add_argument("--voice", required=True)
    s.add_argument("--in", dest="inp", required=True)
    s.add_argument("--out", required=True)
    t = sub.add_parser("trial")
    t.add_argument("--sample", default=str(TTS / "samples/sample01.txt"))
    t.add_argument("--only")
    a = ap.parse_args()
    cmd_say(a) if a.cmd == "say" else cmd_trial(a)


if __name__ == "__main__":
    main()
