"""スマホで聞く仮の音声を作る。narrate.py で作った場面ごとの音声を、通しの1本と章ごとの mp3 にまとめ、
「何分何秒にどの場面か」の早見表を書く。時刻は動画と同じ（声のない場面は無音で入れる）。

使い方:
    python tts/narrate.py episodes/001-xxx --voice eleven-yui   # 先に場面ごとの音声を作る
    python tts/preview.py episodes/001-xxx                       # 聞く用にまとめる
    python tts/preview.py episodes/001-xxx --script script-v2.md # 台本の版違い

出力（Git の外）:
    $YT_DATA_DIR/episodes/<回>/preview/00-通し.mp3
    $YT_DATA_DIR/episodes/<回>/preview/01-冒頭.mp3, 02-第1章.mp3 …
    $YT_DATA_DIR/episodes/<回>/preview/早見表.md
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tts"))
import tts  # noqa: E402

# 場面の id の頭（ハイフンの前）→ 章の名前。ここにない頭はそのまま章の名前にする
GROUPS = {
    "opening": "冒頭", "hook": "冒頭", "today": "冒頭", "quiz": "冒頭",
    "ch1": "第1章", "ch2": "第2章", "ch3": "第3章", "ch4": "第4章", "ch5": "第5章",
    "verdict": "答え合わせ", "lesson": "教訓", "end": "教訓",
}
END = "。！？!?」』）"  # 字幕のかたまりがこの字で終わったら1文とみなす


def clock(sec: float) -> str:
    return f"{int(sec // 60)}:{int(sec % 60):02d}"


def scene_frames(sc: dict, audio_dir: Path) -> bytes:
    """場面の音声を、timing.json の秒数ちょうどの長さにして返す（足りない分は無音）。"""
    want = int(round((sc["seconds"] or 0) * tts.RATE))
    data = b""
    if sc.get("audio"):
        with wave.open(str(audio_dir / sc["audio"])) as r:
            if (r.getnchannels(), r.getsampwidth(), r.getframerate()) != (1, 2, tts.RATE):
                raise RuntimeError(f"{sc['audio']} の形式が想定と違います")
            data = r.readframes(r.getnframes())
    return data[: want * 2] + b"\x00\x00" * max(0, want - len(data) // 2)


def to_mp3(frames: bytes, out: Path, tmp: Path) -> None:
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(tts.RATE)
        w.writeframes(frames)
    # 声だけなので 64kbps のモノラルで十分（15分で約7MB）
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-ac", "1", "-b:a", "64k", str(out)], check=True)
    tmp.unlink()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode", type=Path, help="episodes/<回> のフォルダ")
    ap.add_argument("--script", default="script.md", help="台本のファイル名（narrate.py と同じ。script-v2.md なら timing-v2.json を読む）")
    a = ap.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg が見つかりません")
    ep = a.episode.resolve()
    m = re.fullmatch(r"script(-[A-Za-z0-9]+)?\.md", a.script)
    suffix = (m.group(1) or "") if m else ""
    timing = json.loads((ep / f"timing{suffix}.json").read_text(encoding="utf-8"))
    if timing.get("voice") == "silent":
        sys.exit("timing の声が silent です。先に narrate.py を本番の声（--voice eleven-yui）で走らせてください")
    data = tts.DATA / "episodes" / (ep.name + suffix)
    audio_dir, out_dir = data / "audio", data / "preview"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    groups: list[tuple[str, bytearray]] = []
    rows = [f"# {ep.name}{suffix} 早見表", "", f"声：{timing['voice']}。時刻は動画と同じ（声のない場面は無音）。1行＝1文。"]
    t = 0.0
    full = bytearray()
    for sc in timing["scenes"]:
        name = GROUPS.get(sc["id"].split("-")[0], sc["id"].split("-")[0])
        if not groups or groups[-1][0] != name:
            groups.append((name, bytearray()))
            rows += ["", f"## {len(groups):02d} {name}（{clock(t)}〜）", "", "| 時刻 | 文 |", "|---|---|"]
        frames = scene_frames(sc, audio_dir)
        groups[-1][1].extend(frames)
        full.extend(frames)
        if not sc["lines"]:
            rows.append(f"| {clock(t)} | （{sc['id']}・声なし） |")
        start, buf = None, ""
        for st, _, x in sc["lines"]:
            start = st if start is None else start
            buf += x
            if buf.rstrip()[-1:] in END or (st, _, x) == tuple(sc["lines"][-1]):
                rows.append(f"| {clock(t + start)} | {buf.replace('|', '｜')} |")
                start, buf = None, ""
        t += sc["seconds"] or 0

    tmp = out_dir / "_tmp.wav"
    to_mp3(bytes(full), out_dir / "00-通し.mp3", tmp)
    for i, (name, frames) in enumerate(groups, 1):
        to_mp3(bytes(frames), out_dir / f"{i:02d}-{name}.mp3", tmp)
    rows += ["", f"合計 {clock(t)}"]
    (out_dir / "早見表.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"{out_dir} に通し1本・章{len(groups)}本・早見表（合計 {clock(t)}）")


if __name__ == "__main__":
    main()
