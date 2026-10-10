"""緑の背景で作った画像から、人物だけを抜き出す（クロマキー。2026-10-10）。

サムネイルの人形は Canva の画像生成で緑（#00B140）の背景にして作り、ここで抜いて透明の PNG にする。
Canva の背景の削除は有料プランだけなので、自分で抜く。抜いた PNG は Remotion の型で重ねる。

    uv run --no-project --python 3.12 --with pillow --with numpy python scripts/chroma_key.py 入力.png 出力.png

やること：
1. 緑の強さ（G − max(R, B)）で透明度を決める（弱い所は人物、強い所は背景、その間はなめらかに）
2. ふちに残る緑を消す（G を max(R, B) まで下げる）
3. ふちを1px 内側に寄せて、緑のにじみを残さない
4. 人物の外接の四角で切り抜く（余白は少し残す）
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

LO, HI = 28, 80  # 緑の強さがこれ以下は人物（不透明）、これ以上は背景（透明）
PAD = 12


def key(src: str, dst: str) -> None:
    im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    excess = g - np.maximum(r, b)
    alpha = 1 - np.clip((excess - LO) / (HI - LO), 0, 1)
    # ふちの緑を消す：緑が赤・青より強い分を削る
    im[..., 1] = np.minimum(g, np.maximum(r, b) + 4)
    a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).convert("RGBA")
    out.putalpha(a)
    box = a.point(lambda v: 255 if v > 16 else 0).getbbox()
    if box:
        l, t, rr, bb = box
        out = out.crop((max(l - PAD, 0), max(t - PAD, 0), min(rr + PAD, out.width), min(bb + PAD, out.height)))
    out.save(dst)
    print(f"{dst}: {out.width}x{out.height}")


if __name__ == "__main__":
    key(sys.argv[1], sys.argv[2])
