# 006 のサムネイルのソファの画像だけの抜き方（緑の割合をならしてから閾値を固定。外周につながる弱い緑も消す）。
# uv run --no-project --python 3.12 --with pillow --with numpy python episodes/006-cheating-line/data/key_sofa.py sofa2-raw3.png sofa-mustard.png 0.155 0.195 0.12
import sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, "scripts")
from chroma_key import main_island, PAD
src, dst, lo, hi = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
ratio = (g - np.maximum(r, b)) / np.maximum(g, 1)
ratio = np.asarray(Image.fromarray(ratio.astype(np.float32)).filter(ImageFilter.MedianFilter(5)))
alpha = 1 - np.clip((ratio - lo) / (hi - lo), 0, 1)
# 外周からつながる弱い緑（床など）は低い閾値で消す。人形の中の照り返しは外周とつながらないので残る
if len(sys.argv) > 5:
    lo2 = float(sys.argv[5])
    weak = ratio > lo2
    seed = np.zeros_like(weak); seed[0] = weak[0]; seed[-1] = weak[-1]; seed[:, 0] = weak[:, 0]; seed[:, -1] = weak[:, -1]
    while True:
        gr = seed.copy(); gr[1:] |= seed[:-1]; gr[:-1] |= seed[1:]; gr[:, 1:] |= seed[:, :-1]; gr[:, :-1] |= seed[:, 1:]
        gr &= weak
        if (gr == seed).all(): break
        seed = gr
    alpha = np.where(seed, np.minimum(alpha, 1 - np.clip((ratio - lo2) / 0.04, 0, 1)), alpha)
alpha = main_island(alpha)
im[..., 1] = np.minimum(g, np.maximum(r, b) + 2)
a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).convert("RGBA")
out.putalpha(a)
l, t, rr, bb = a.point(lambda v: 255 if v > 16 else 0).getbbox()
out = out.crop((max(l - PAD, 0), max(t - PAD, 0), min(rr + PAD, out.width), min(bb + PAD, out.height)))
out.save(dst); print(out.size)
