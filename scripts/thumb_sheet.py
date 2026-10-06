"""サムネイルのレビュー用の見本を作る（2026-10-06）。

候補のサムネイルを、競合のサムネイル（_local/bench の取得物）の間に並べ、
スマホのホーム（横 360px）と関連動画（横 168px）の大きさに縮めた一覧の画像にする。
レビュー役（.claude/agents/review-thumbnail.md）はこの画像を見て判定する。

使い方（pillow は uv で一時的に使う）:
    uv run --no-project --python 3.12 --with pillow python scripts/thumb_sheet.py out.png 候補1.png 候補2.png ...
    （--pin <競合の jpg> で、比べたい1枚を候補の左隣に必ず置く）
"""
import glob
import json
import os
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("YT_DATA_DIR", ROOT / "_local")) / "bench"
RIVALS = ["kangaesugiruashi", "DataStickFigure", "lovebynumbers", "love_observation"]


def rivals(n: int, seed: int = 1) -> list[Path]:
    """競合の恋愛・結婚系の回のサムネイル（タイトルに恋愛の語があるもの）"""
    words = ("恋愛", "モテ", "婚", "マッチング", "アプリ", "男", "女", "デート", "結婚")
    out = []
    for ch in RIVALS:
        for js in glob.glob(str(DATA / ch / "*" / "*.info.json")):
            j = json.load(open(js, encoding="utf-8"))
            jpg = Path(js).parent / f"{Path(js).parent.name}.jpg"
            if jpg.exists() and any(w in (j.get("title") or "") for w in words):
                out.append(jpg)
    random.Random(seed).shuffle(out)
    return out[:n]


def main():
    args = sys.argv[1:]
    pin = None  # --pin <jpg>：比べたい1枚を、候補のすぐ隣に必ず置く
    if "--pin" in args:
        k = args.index("--pin"); pin = Path(args[k + 1]); del args[k:k + 2]
    dst, cands = args[0], [Path(p) for p in args[1:]]
    font = ImageFont.truetype("C:/Windows/Fonts/meiryo.ttc", 22) if os.path.exists("C:/Windows/Fonts/meiryo.ttc") else ImageFont.load_default()
    rows = []
    # 1段目：候補を大きく（640幅）
    big = [Image.open(c).convert("RGB").resize((640, 360)) for c in cands]
    # 2・3段目：候補ごとに、競合3枚と並べた「スマホのホーム（360幅）」と「関連動画（168幅）」
    W = max(640 * len(cands), 4 * 370 + 10)
    H = 360 + 40 + len(cands) * (203 + 40 + 94 + 40)
    m = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(m)
    for i, b in enumerate(big):
        m.paste(b, (i * 640, 0))
        d.text((i * 640 + 8, 362), f"候補{i + 1}：{cands[i].name}", fill=(0, 0, 0), font=font)
    y = 400
    for i, c in enumerate(cands):
        feed = rivals(3, seed=i + 1)
        if pin:
            feed = [pin] + [f for f in feed if f != pin][:2]
        pos = 1 if pin else 1 + i % 3  # 候補の位置を少しずらす（--pin のときは、比べる1枚の右隣）
        items = feed[:pos] + [c] + feed[pos:]
        d.text((8, y - 2), f"候補{i + 1}：スマホのホーム（360幅）と関連動画（168幅）。競合の間に置いた", fill=(0, 0, 0), font=font)
        y += 30
        for k, p in enumerate(items):
            m.paste(Image.open(p).convert("RGB").resize((360, 203)), (k * 370, y))
        y += 213
        for k, p in enumerate(items):
            m.paste(Image.open(p).convert("RGB").resize((168, 94)), (k * 180, y))
        y += 94 + 40
    m = m.crop((0, 0, W, y))
    m.save(dst)
    print(dst)


if __name__ == "__main__":
    main()
