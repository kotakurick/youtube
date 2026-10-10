"""緑の背景で作った画像から、人物だけを抜き出す（クロマキー。2026-10-10）。

サムネイルの人形は Canva の画像生成で緑（#00B140）の背景にして作り、ここで抜いて透明の PNG にする。
Canva の背景の削除は有料プランだけなので、自分で抜く。抜いた PNG は Remotion の型で重ねる。

    uv run --no-project --python 3.12 --with pillow --with numpy python scripts/chroma_key.py 入力.png 出力.png [LO HI]

Gemini の緑はくすんで淡い（G − max(R, B) が30〜55）ので、`12 26` のように境目を下げて使う（2026-10-10、008）。

やること：
1. 緑の強さ（G − max(R, B)）で透明度を決める（弱い所は人物、強い所は背景、その間はなめらかに）
2. ふちに残る緑を消す（G を max(R, B) まで下げる）
3. 外の背景とつながっていない所（人物の中の影に緑が映った所）は透かさない（2026-10-10、008。Gemini の画像は影が緑がかる）
4. ふちを1px 内側に寄せて、緑のにじみを残さない
5. 人物の外接の四角で切り抜く（余白は少し残す）
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LO, HI = 28, 80  # 緑の強さがこれ以下は人物（不透明）、これ以上は背景（透明）
PAD = 12


def key(src: str, dst: str, lo: float = LO, hi: float = HI) -> None:
    im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    excess = g - np.maximum(r, b)
    alpha = 1 - np.clip((excess - lo) / (hi - lo), 0, 1)
    # 外のふちから塗りつぶして届く背景だけを背景とする。届かない所（3px 以上内側）は不透明に
    h, w = excess.shape
    seed = np.zeros((h + 2, w + 2), np.uint8)  # まわりに1px の背景を足して、ふちのどこからでも塗れるようにする
    seed[1:-1, 1:-1] = np.where(excess >= hi + 2, 0, 255)  # 影の緑（008 で約26まで）より強い所だけ
    bg = Image.fromarray(255 - seed).copy()  # fromarray のままだと読み取り専用で塗れない
    ImageDraw.floodfill(bg, (0, 0), 128)
    bg = Image.fromarray(np.asarray(bg)[1:-1, 1:-1])
    reach = np.asarray(Image.fromarray(np.where(np.asarray(bg) == 128, 255, 0).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    alpha = np.where(~reach & (excess < hi * 1.6), 1.0, alpha)
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
    key(sys.argv[1], sys.argv[2], *(float(v) for v in sys.argv[3:5]))
