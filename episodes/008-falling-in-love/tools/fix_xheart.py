# xheart-before.png（キー直後）→ xheart.png
# 1. 紙の明るさのむらをならす（線・罫線・✗は残す）→ 明るい暖かい白
# 2. 4つ目の✗の箱を消し、同じ傾き・間隔の罫線を描き足す
# 3. 赤を #D62828 寄りに  4. 右のふちの黄緑のにじみを透明に
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src)).astype(np.float32)
rgb, A = a[..., :3].copy(), a[..., 3].copy()
h, w = A.shape
X, Y = np.meshgrid(np.arange(w), np.arange(h))
L = rgb.mean(-1)
red = rgb[..., 0] - np.maximum(rgb[..., 1], rgb[..., 2])
def blur(v, s):
    # ガウスに近いぼかし（PIL は浮動小数の画像をぼかせないので、行と列に畳み込む）
    k = np.exp(-0.5 * (np.arange(-3 * s, 3 * s + 1) / s) ** 2); k /= k.sum()
    v = np.apply_along_axis(lambda r: np.convolve(r, k, "same"), 1, v.astype(np.float64))
    return np.apply_along_axis(lambda c: np.convolve(c, k, "same"), 0, v)
lmax = np.asarray(Image.fromarray(np.clip(L, 0, 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(25))).astype(np.float32)
ink = (L < 0.6 * lmax) | (red > 25)  # 紙の明るさは場所で100〜160と違うので、周りとの比で見る
ink = np.asarray(Image.fromarray(ink.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7))) > 0
m = ((A > 240) & ~ink & (X < 345)).astype(np.float32)
est = blur(L * m, 18) / np.maximum(blur(m, 18), 1e-3)
ratio = np.clip(L / np.maximum(est, 1), 0, 1.05)
# 罫線の形：y = 128 + i*P + SL*(x − 330)
SL, P, Y0 = -0.155, 43.08, 128.0
ph = ((Y - (Y0 + SL * (X - 330))) % P)
ph = np.where(ph > P / 2, ph - P, ph)  # 罫線からの距離（符号つき）
clean = (m > 0) & (X > 285) & (X < 340) & (Y > 120) & (Y < 640)
prof = {d: float(np.median(ratio[clean & (np.round(ph) == d)])) for d in range(-4, 5)}
print("罫線の断面", {k: round(v, 3) for k, v in prof.items()})
synth = np.interp(ph, list(prof.keys()), list(prof.values()))
# 紙の粒：きれいな所の細かいむらと同じ強さの雑音を足す（足さないと描き足した所だけ平らで四角が見える）
grain = float(np.std((ratio - synth)[clean & (np.abs(ph) > 3)]))
noise = np.random.default_rng(8).normal(0, 1, (h, w))
noise = blur(noise, 0.7); noise *= grain / noise.std()
synth = synth + noise
print("紙の粒", round(grain, 4))
box4 = (X >= 160) & (X <= 296) & (Y >= 474) & (Y <= 580)
box4f = np.clip(blur(box4.astype(np.float32) * 255, 2) / 255, 0, 1)
# 左下のふち（y 410〜700）は直線で引き直す：x = 158 + 0.975 (y − 480)（実測。元のふちは✗の跡で切れ込んでいた）
xe = 158 + 0.975 * (Y - 480)
band = (Y >= 410) & (X < 350) & (X < xe + 14)
d = (X - xe) / np.hypot(1, 0.975)
ratio = ratio * (1 - box4f) + synth * box4f
ratio = np.where(band, synth, ratio)
red = red * (1 - box4f)
# 紙の色（むらを7割ならし、少しだけ元の陰影を残す）
shade = (est / np.median(est[m > 0])) ** 0.3
paper = np.array([249, 245, 236])
out = ratio[..., None] * paper * np.clip(shade, 0.85, 1.05)[..., None]
wr = np.clip((red - 25) / 50, 0, 1)[..., None]
out = out * (1 - wr) + np.array([214, 40, 40]) * np.clip(ratio[..., None] * 1.6, 0.72, 1.05) * wr
xr = np.clip((356 - X) / 10, 0, 1)[..., None]  # 折り目の手前から結晶は元のまま
rgb = rgb * (1 - xr) + out * xr
# 右のふち（31px 以内）の黄緑のにじみ
inner = np.asarray(Image.fromarray((A > 128).astype(np.uint8) * 255).filter(ImageFilter.MinFilter(63))) > 0
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
A = np.where(~inner & (np.minimum(r, g) - b > 40) & (g - r > -12) & (X > 400), 0, A)
# にじみ消しで結晶の中にあいた小さな穴を埋める（閉じる処理）。外のもや（薄い所）は落とす
Au = np.clip(A, 0, 255).astype(np.uint8)
closed = np.asarray(Image.fromarray(Au).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))).astype(np.float32)
A = np.where(X > 400, np.maximum(A, closed), A)
# 外のもや：ふち31px 以内で、黄土色（青が赤の6割未満）か薄い所は消す
# 外とつながる所だけ消す（結晶の中の黄色い面は残す）。輪の黄緑（G ≧ R で暗い）も対象
olive = (g >= r - 5) & (b < 0.75 * g) & (rgb.mean(-1) < 150)
cand = (X > 400) & ~inner & ((b < 0.6 * r) | (A < 90) | olive)
out_ = Image.fromarray(np.where(cand | (A <= 40), 255, 0).astype(np.uint8)).copy()
ImageDraw.floodfill(out_, (w - 1, 0), 128)
A = np.where(np.asarray(out_) == 128, 0, A)
# 本体とつながらない切れ端（輪の残り）を消す：本体の中の1点から塗りつぶして届く所だけ残す
solid = Image.fromarray(np.where(A > 40, 255, 0).astype(np.uint8)).copy()  # fromarray のままでは塗れない
ImageDraw.floodfill(solid, (500, 350), 128)
A = np.where(np.asarray(solid) == 128, A, 0)
# 紙の左のふちのギザギザをならす（折り目より左だけ）
As = np.clip((blur(A, 1.6) - 128) * 1.6 + 128, 0, 255)
A = np.where(X < 350, As, A)
A = np.where(band, 255 * np.clip(d / 1.4 + 0.5, 0, 1), A)
o = np.dstack([np.clip(rgb, 0, 255), A]).astype(np.uint8)
Image.fromarray(o, "RGBA").save(dst)
im = Image.open(dst); bg = Image.new("RGBA", im.size, (40, 40, 90, 255)); bg.alpha_composite(im); bg.convert("RGB").save(dst.replace(".png", "-view.png"))
