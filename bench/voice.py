"""声（読み上げ音声）の比較。Claude は音を聞けないので、コードで測れる数字と、オーナーの聞き比べを組み合わせる。

使い方:
    python bench/voice.py fetch <チャンネル> [--max 6]   # 各動画の30〜90秒目の音声だけを取る
    python bench/voice.py measure                       # 数字を測る → research/benchmark/compare/voice.tsv
    python bench/voice.py listen                        # 聞き比べ用の20秒クリップを、名前を伏せて作る
    python bench/voice.py listen --add                  # 採点表を残したまま、後から作った声だけを足す

測る数字（1分間の音声から）:
    chars_per_min   話す速さ（字幕の文字数）
    pauses_per_min  0.2秒以上の無音の回数。少なすぎると息継ぎのない機械的な読み上げに聞こえやすい
    pause_mean_sec  無音の平均の長さ
    lufs / lra      音量と、音量の幅（小さいほど平板）
    pitch_range_st  声の高さの幅（半音。10〜90%の幅）。小さいほど抑揚がない。numpy があるときだけ測る
    voice_credit    概要欄のクレジット（VOICEVOX:ずんだもん など）から分かる音声の種類

自分たちの声の候補（tts/tts.py trial の出力、$YT_DATA_DIR/bench/_tts/）も、競合と同じ扱いで measure・listen に入る。
チャンネル名は「候補-<名前>」になる。

聞き比べ:
    $YT_DATA_DIR/bench/listening/clips/ にランダムな番号のクリップを作り、
    research/benchmark/compare/listening.csv に採点欄を作る。番号とチャンネルの対応（答え）は
    $YT_DATA_DIR/bench/listening/key.tsv に置く（先入観なく聞くため、採点が終わるまで開かない）。
"""
import argparse
import csv
import json
import random
import re
import statistics
import subprocess
import sys
import wave
from pathlib import Path

from analyze import BENCH, REPO
from prep import parse_ts, pick_vtt

DIR = REPO / "research/benchmark/compare"
CLIP_START, CLIP_END = 30, 90
LISTEN_FROM, LISTEN_SEC = 10, 20       # クリップ内の10秒目から20秒間を聞き比べに使う
VOICE_PATTERNS = [
    r"VOICEVOX\s*[:：]\s*[^\s/、,）)]+", r"COEIROINK\s*[:：]\s*[^\s/、,）)]+",
    r"ずんだもん", r"四国めたん", r"春日部つむぎ", r"青山龍星", r"玄野武宏", r"冥鳴ひまり",
    r"ゆっくり", r"AquesTalk", r"CoeFont", r"ElevenLabs", r"にじボイス", r"A\.I\.VOICE",
    r"VOICEPEAK", r"VOICEROID", r"音読さん", r"CeVIO", r"Style-?Bert-?VITS",
]


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def video_dirs(channel: str) -> list[Path]:
    """list.tsv の順（新しい順）に、メタデータのある動画フォルダを返す。"""
    ch = BENCH / channel
    ids = [line.split("\t")[0] for line in (ch / "list.tsv").read_text(encoding="utf-8").splitlines() if line]
    return [ch / i for i in ids if (ch / i / f"{i}.info.json").exists()]


def fetch(channel: str, max_n: int) -> None:
    for d in video_dirs(channel)[:max_n]:
        wav = d / "voice.wav"
        if wav.exists():
            continue
        for old in d.glob("a.*"):
            old.unlink()
        r = run(["yt-dlp", "-q", "--no-warnings", "--sleep-requests", "1", "-f", "ba[ext=m4a]/ba",
                 "--download-sections", f"*{CLIP_START}-{CLIP_END}", "-o", str(d / "a.%(ext)s"),
                 f"https://www.youtube.com/watch?v={d.name}"])
        src = next(iter(d.glob("a.*")), None)
        if r.returncode or not src:
            print(f"  失敗: {d.name}", file=sys.stderr)
            continue
        run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(src),
             "-ac", "1", "-ar", "44100", str(wav)])   # 候補の声と同じ音質で比べる
        src.unlink()
        print(f"  済: {d.name}")


def loudness(wav: Path) -> tuple[float | None, float | None]:
    err = run(["ffmpeg", "-nostdin", "-i", str(wav), "-af", "ebur128", "-f", "null", "-"]).stderr
    summary = err.split("Summary:")[-1]
    i = re.search(r"I:\s*(-?[\d.]+) LUFS", summary)
    lra = re.search(r"LRA:\s*([\d.]+) LU", summary)
    return (float(i.group(1)) if i else None, float(lra.group(1)) if lra else None)


def pauses(wav: Path, dur: float) -> tuple[float, float | None]:
    err = run(["ffmpeg", "-nostdin", "-i", str(wav), "-af", "silencedetect=noise=-35dB:d=0.2",
               "-f", "null", "-"]).stderr
    ds = [float(x) for x in re.findall(r"silence_duration:\s*([\d.]+)", err)]
    return round(len(ds) / (dur / 60), 1), (round(statistics.mean(ds), 2) if ds else None)


def pitch_range(wav: Path) -> float | None:
    """自己相関で声の高さを推定し、10〜90%の幅を半音で返す。numpy がなければ測らない。"""
    try:
        import numpy as np
    except ImportError:
        return None
    with wave.open(str(wav)) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    win, hop = int(sr * 0.04), int(sr * 0.01)
    lo, hi = int(sr / 400), int(sr / 70)       # 70〜400Hz
    f0 = []
    for start in range(0, len(x) - win, hop):
        frame = x[start:start + win]
        frame = frame - frame.mean()
        energy = float((frame ** 2).sum())
        if energy < 1e6:
            continue
        spec = np.fft.rfft(frame, n=2 * win)
        ac = np.fft.irfft(spec * np.conj(spec))[:win]
        ac = ac / ac[0]
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.5:
            f0.append(sr / lag)
    if len(f0) < 50:
        return None
    st = 12 * np.log2(np.array(f0) / np.median(f0))
    return round(float(np.percentile(st, 90) - np.percentile(st, 10)), 1)


def chars_in_window(d: Path) -> int | None:
    vtt = pick_vtt(d, d.name)
    if not vtt:
        return None
    seen, total, start = [], 0, 0.0
    for raw in vtt.read_text(encoding="utf-8", errors="ignore").splitlines():
        if "-->" in raw:
            start = parse_ts(raw.split("-->")[0].strip())
            continue
        line = re.sub(r"<[^>]+>", "", raw).strip()
        if not line or line.startswith(("WEBVTT", "Kind:", "Language:")) or line in seen[-3:]:
            continue
        seen.append(line)
        if CLIP_START <= start < CLIP_END:
            total += len(re.sub(r"\s", "", line))
    return total


def all_voices() -> list[tuple[str, str, Path]]:
    """(チャンネル名, 動画ID, voice.wav) の一覧。競合の動画と、自分たちの声の候補。"""
    out = [(w.parent.parent.name, w.parent.name, w) for w in sorted(BENCH.glob("*/*/voice.wav"))
           if not w.parent.parent.name.startswith("_")]
    out += [(f"候補-{w.parent.parent.name}", w.parent.name, w) for w in sorted(BENCH.glob("_tts/*/*/voice.wav"))]
    return out


def voice_credit(d: Path) -> str:
    meta = d / "meta.json"
    if meta.exists():
        return json.loads(meta.read_text(encoding="utf-8")).get("voice_credit", "")
    info_path = d / f"{d.name}.info.json"
    if not info_path.exists():
        return ""
    info = json.loads(info_path.read_text(encoding="utf-8"))
    text = info.get("description") or ""
    found = []
    for pat in VOICE_PATTERNS:
        for m in re.findall(pat, text):
            if not any(m in f for f in found):   # 「VOICEVOX:ずんだもん」があれば「ずんだもん」は足さない
                found.append(m)
    return " / ".join(found[:4])


def measure() -> None:
    rows = []
    for channel, vid, wav in all_voices():
        d = wav.parent
        with wave.open(str(wav)) as w:
            dur = w.getnframes() / w.getframerate()
        if dur < 20:
            continue
        lufs, lra = loudness(wav)
        ppm, pmean = pauses(wav, dur)
        chars = chars_in_window(d)
        rows.append({
            "channel": channel, "id": vid,
            "chars_per_min": round(chars / ((CLIP_END - CLIP_START) / 60)) if chars else None,
            "pauses_per_min": ppm, "pause_mean_sec": pmean,
            "lufs": lufs, "lra": lra, "pitch_range_st": pitch_range(wav),
            "voice_credit": voice_credit(d),
        })
        print(f"  {channel}/{vid}", file=sys.stderr)
    if not rows:
        sys.exit("voice.wav がありません。先に fetch を実行してください。")
    out = DIR / "voice.tsv"
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    print(f"保存しました: {out}（{len(rows)} 本）")


def listen(per_channel: int, add: bool = False) -> None:
    """add=True のときは、key.tsv にまだない声（後から作った候補など）だけを、番号を続けて足す。
    採点済みの行は消さない。"""
    root = BENCH / "listening"
    clips = root / "clips"
    clips.mkdir(parents=True, exist_ok=True)
    key_path = root / "key.tsv"
    sheet = DIR / "listening.csv"
    header = ["code", "自然さ(1-5)", "聞き続けたいか(1-5)", "不気味さ(1-5、5が不気味)", "読み間違い・不自然な箇所", "メモ"]
    def long_enough(wav: Path) -> bool:
        with wave.open(str(wav)) as w:
            return w.getnframes() / w.getframerate() >= LISTEN_FROM + LISTEN_SEC
    old_key = list(csv.reader(key_path.open(encoding="utf-8"), delimiter="\t"))[1:] if add and key_path.exists() else []
    done = {(c, v) for _, c, v in old_key}
    voices = [v for v in all_voices() if long_enough(v[2]) and (v[0], v[1]) not in done]
    have = {c for _, c, _ in old_key}
    picked = []
    for ch in sorted({c for c, _, _ in voices}):
        if add and ch in have:
            continue
        picked += [v for v in voices if v[0] == ch][:per_channel]
    random.shuffle(picked)
    key = []
    for i, (channel, vid, wav) in enumerate(picked, len(old_key) + 1):
        code = f"{i:03d}"
        run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-ss", str(LISTEN_FROM), "-t", str(LISTEN_SEC),
             "-i", str(wav), "-b:a", "96k", str(clips / f"{code}.mp3")])
        key.append((code, channel, vid))
    with key_path.open("w", encoding="utf-8", newline="") as f:
        csv.writer(f, delimiter="\t").writerows([("code", "channel", "id"), *[tuple(k) for k in old_key], *key])
    old_rows = list(csv.reader(sheet.open(encoding="utf-8-sig")))[1:] if add and sheet.exists() else []
    old_rows = [r + [""] * (len(header) - len(r)) for r in old_rows]
    with sheet.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(old_rows + [[code] + [""] * (len(header) - 1) for code, _, _ in key])
    print(f"クリップ {len(key)} 本を{'追加' if add else '作成'}: {clips}\n採点表: {sheet}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fetch")
    f.add_argument("channel")
    f.add_argument("--max", type=int, default=6)
    sub.add_parser("measure")
    l = sub.add_parser("listen")
    l.add_argument("--per-channel", type=int, default=2)
    l.add_argument("--add", action="store_true", help="採点表を消さず、まだない声だけを足す")
    a = ap.parse_args()
    if a.cmd == "fetch":
        fetch(a.channel, a.max)
    elif a.cmd == "measure":
        measure()
    else:
        listen(a.per_channel, a.add)


if __name__ == "__main__":
    main()
