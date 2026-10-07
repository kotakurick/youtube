"""サムネイルの人物画像（画像生成AIで緑の背景に作ったもの）から緑を抜き、透明な PNG にする（2026-10-07）。

人の白は残し、緑の地を透明に、縁に残る緑のにじみを灰色に戻す。人の外側の余白は切り落とす。
--flip で左右を返す（向きを変えたいとき）。

使い方（pillow は uv で一時的に使う）:
    uv run --no-project --python 3.12 --with pillow python scripts/thumb_key.py 入力.jpg 出力.png [--flip]
置き場所：$YT_DATA_DIR/episodes/<回>/thumb/（Git の外。npm run sync が render/public へ運ぶ）
"""
import sys

from PIL import Image, ImageOps


def key(src: str, dst: str, flip: bool = False) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h))
    po = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            green = g - max(r, b)  # 緑の強さ（地は約200、白い人は0付近）
            a = 255 if green < 30 else 0 if green > 90 else int(255 * (90 - green) / 60)
            if a and green > 0:  # 縁のにじみ：緑を r・b の大きいほうまで下げて灰色に戻す
                g = max(r, b)
            po[x, y] = (r, g, b, a)
    box = out.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
    if box:
        out = out.crop(box)
    if flip:
        out = ImageOps.mirror(out)
    out.save(dst)
    print(f"{dst}: {out.size[0]}×{out.size[1]}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2:
        sys.exit(__doc__)
    key(args[0], args[1], flip="--flip" in sys.argv)
