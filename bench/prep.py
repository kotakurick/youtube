"""AIに読ませる前に、1本ごとの材料を小さくまとめる（標準ライブラリ＋ffmpeg）。

使い方:
    python bench/prep.py                 # 全チャンネル
    python bench/prep.py lovebynumbers   # チャンネルを指定

入力:  $YT_DATA_DIR/bench/<チャンネル>/<ID>/（bench.sh の出力）
出力:  $YT_DATA_DIR/bench/<チャンネル>/<ID>/prep/
    meta.json       タイトル・再生数・長さ・投稿日・チャプター・概要欄の冒頭など（info.json は大きいので読ませない）
    transcript.txt  字幕から時刻と重複行を除き、30秒ごとにまとめた本文
    tiles/          960x540 に縮めたタイル。最初の2分ぶんはすべて、以降は均等に間引いて最大10枚
                    ファイル名は t01_0000-0115.jpg（番号_開始秒-終了秒）
"""
import argparse
import csv
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("YT_DATA_DIR", REPO / "_local"))
BENCH = DATA / "bench"

MAX_TILES = 10
INTRO_SEC = 120
TILE_WIDTH = 960
BLOCK_SEC = 30


def parse_ts(ts: str) -> float:
    parts = ts.replace(",", ".").split(":")
    sec = 0.0
    for p in parts:
        sec = sec * 60 + float(p)
    return sec


def clean_transcript(vtt: Path) -> str:
    """自動字幕は同じ行が次の字幕にも繰り返し出るので、直近に出た行は捨てる。"""
    blocks: dict[int, list[str]] = {}
    recent: list[str] = []
    start = 0.0
    for raw in vtt.read_text(encoding="utf-8", errors="ignore").splitlines():
        if "-->" in raw:
            start = parse_ts(raw.split("-->")[0].strip())
            continue
        line = re.sub(r"<[^>]+>", "", raw).strip()
        if not line or line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")) or line.isdigit():
            continue
        if line in recent:
            continue
        recent = (recent + [line])[-3:]
        blocks.setdefault(int(start // BLOCK_SEC), []).append(line)
    out = []
    for b in sorted(blocks):
        s = b * BLOCK_SEC
        out.append(f"[{s // 60:02d}:{s % 60:02d}] " + " ".join(blocks[b]))
    return "\n".join(out) + "\n"


def pick_vtt(vdir: Path, vid: str) -> Path | None:
    for name in (f"{vid}.ja-orig.vtt", f"{vid}.ja.vtt"):
        if (vdir / name).exists():
            return vdir / name
    found = sorted(vdir.glob("*.ja*.vtt"))
    return found[0] if found else None


def make_meta(info: dict, channel: str, cuts: int) -> dict:
    up = info.get("upload_date")
    up_date = datetime.strptime(up, "%Y%m%d").date() if up else None
    views = info.get("view_count")
    age = max((date.today() - up_date).days, 1) if up_date else None
    return {
        "channel": channel,
        "id": info.get("id"),
        "title": info.get("title"),
        "upload_date": up_date.isoformat() if up_date else None,
        "duration_sec": info.get("duration"),
        "views": views,
        "views_per_day": round(views / age, 1) if views is not None and age else None,
        "likes": info.get("like_count"),
        "comments": info.get("comment_count"),
        "scene_cuts": cuts,
        "chapters": [
            {"start_sec": int(c.get("start_time", 0)), "title": c.get("title")}
            for c in (info.get("chapters") or [])
        ],
        "tags": (info.get("tags") or [])[:15],
        "description_head": (info.get("description") or "")[:600],
    }


def read_times(path: Path) -> dict[int, tuple[float, float]]:
    """times.tsv → {タイル番号: (最初のコマの秒, 最後のコマの秒)}"""
    ranges: dict[int, tuple[float, float]] = {}
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            s, sec = int(row["sheet"]), float(row["sec"])
            lo, hi = ranges.get(s, (sec, sec))
            ranges[s] = (min(lo, sec), max(hi, sec))
    return ranges


def pick_tiles(ranges: dict[int, tuple[float, float]]) -> list[int]:
    sheets = sorted(ranges)
    intro = [s for s in sheets if ranges[s][0] < INTRO_SEC]
    rest = [s for s in sheets if s not in intro]
    room = MAX_TILES - len(intro)
    if room <= 0:
        return intro[:MAX_TILES]
    if len(rest) <= room:
        return intro + rest
    step = len(rest) / room
    return intro + [rest[int(i * step)] for i in range(room)]


def shrink(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(src),
         "-vf", f"scale={TILE_WIDTH}:-2", "-q:v", "4", str(dst)],
        check=True,
    )


def prep_video(vdir: Path, channel: str) -> str:
    vid = vdir.name
    info_path = vdir / f"{vid}.info.json"
    if not info_path.exists():
        return "no_info"
    out = vdir / "prep"
    if (out / "meta.json").exists():
        return "skip"
    if out.exists():
        shutil.rmtree(out)
    (out / "tiles").mkdir(parents=True)

    times = vdir / "times.tsv"
    ranges = read_times(times) if times.exists() else {}
    for i, s in enumerate(pick_tiles(ranges), 1):
        lo, hi = ranges[s]
        shrink(vdir / f"sheet_{s:03d}.jpg", out / "tiles" / f"t{i:02d}_{int(lo):04d}-{int(hi):04d}.jpg")

    vtt = pick_vtt(vdir, vid)
    if vtt:
        (out / "transcript.txt").write_text(clean_transcript(vtt), encoding="utf-8")

    info = json.loads(info_path.read_text(encoding="utf-8"))
    meta = make_meta(info, channel, sum(1 for _ in times.open(encoding="utf-8")) - 1 if times.exists() else 0)
    meta["has_transcript"] = vtt is not None
    meta["tiles"] = sorted(p.name for p in (out / "tiles").glob("*.jpg"))
    # meta.json は最後に書く（途中で止まった回は次回やり直す）
    (out / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    return "ok"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("channels", nargs="*", help="チャンネル名（@なし）。省略時は全部")
    args = ap.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg が見つかりません")

    chans = args.channels or sorted(p.name for p in BENCH.iterdir() if p.is_dir())
    for ch in chans:
        counts: dict[str, int] = {}
        for vdir in sorted(p for p in (BENCH / ch).iterdir() if p.is_dir() and p.name != "thumbs"):
            r = prep_video(vdir, ch)
            counts[r] = counts.get(r, 0) + 1
        print(f"{ch}: " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))


if __name__ == "__main__":
    main()
