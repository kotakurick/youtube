"""案内役「ゴサ」（ひげが誤差棒の黒猫）の SVG を作る。標準ライブラリのみ。

使い方:
    python assets/characters/gosa/make_gosa.py

出力（このフォルダの下）:
    svg/<表情>.svg        表情ごとの立ち絵（明るい背景用）
    svg/<表情>_dark.svg   暗い背景用の反転版（白い体に墨の目。2026-10-04 決定）
    watermark.svg         動画の透かし（紙色の円に棒グラフ。assets/channel/watermark_300.png に書き出す）
    watermark_face.svg    透かしの別案（ゴサの顔）
    icon.svg              チャンネルのアイコン（ゴサが棒グラフを見ている。小さく表示してもひげが見えるよう太め）
    gosa.json             表情の設定。動画の部品（render/src/lib/Gosa.tsx）がこれを読み、表情の間をなめらかにつなぐ

決まり（docs/concepts/2026-10-04-gosa-cat.html の案C を仕上げたもの）:
    - 原点＝体の中心。どの表情も viewBox は同じ（-130 -100 260 180）なので、差し替えても位置がずれない。
    - 色は墨 #1D2333 と白だけ。データの色（男性の青・女性のオレンジ）は使わない。
    - ひげ＝横向きの誤差棒。ひげの長さ＝確かさ（短い＝言い切り、長く垂れる＝条件次第）。
"""
import json
from pathlib import Path

INK = "#1D2333"
WHITE = "#FFFFFF"
HERE = Path(__file__).resolve().parent
VIEWBOX = "-130 -100 260 180"

BODY_R = 32
WHISKER_Y = 8          # ひげの付け根の高さ
WHISKER_W = 6          # ひげの太さ
CAP = 12               # ひげの先の縦棒の半分の長さ


# ---------- 部品 ----------

EAR_TIPS = {
    "normal": ((-25, -46), (25, -46)),
    "tall": ((-28, -56), (28, -56)),
    "down": ((-36, -34), (36, -34)),
    "flat": ((-40, -24), (40, -24)),
}


def ears(kind: str) -> str:
    (lx, ly), (rx, ry) = EAR_TIPS[kind]
    # 角を丸める（同じ色の線を太さ6・丸い角で重ねる＝半径3の丸み）
    return (f'<path d="M-28 -12 L{lx} {ly} L-6 -28 Z M28 -12 L{rx} {ry} L6 -28 Z" fill="{INK}" '
            f'stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>')


def whisker(side: int, length: float, dy: float = 0, bend: float = 0, jitter: bool = False,
            width: float = WHISKER_W, cap: float = CAP) -> str:
    """片側のひげ。side=-1 左, 1 右。dy=先の上下（負で上）、bend=途中のふくらみ（正で下）。"""
    WHISKER_W, CAP = width, cap  # noqa: N806（アイコンだけ太くする）
    x0, y0 = side * 20, WHISKER_Y
    x1, y1 = side * length, WHISKER_Y + dy
    if jitter:
        n = 6
        pts = []
        for i in range(n + 1):
            t = i / n
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t + (0 if i in (0, n) else (5 if i % 2 else -5))
            pts.append(f"{x:.1f} {y:.1f}")
        line = f'<polyline points="{" ".join(pts)}" fill="none" stroke="{INK}" stroke-width="{WHISKER_W}" stroke-linecap="round" stroke-linejoin="round"/>'
    else:
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + bend
        line = f'<path d="M{x0} {y0} Q{cx:.1f} {cy:.1f} {x1:.1f} {y1:.1f}" fill="none" stroke="{INK}" stroke-width="{WHISKER_W}" stroke-linecap="round"/>'
    cap = f'<line x1="{x1:.1f}" y1="{y1 - CAP:.1f}" x2="{x1:.1f}" y2="{y1 + CAP:.1f}" stroke="{INK}" stroke-width="{WHISKER_W}" stroke-linecap="round"/>'
    return line + cap


def eyes(kind: str, look=(0, 0)) -> str:
    dx, dy = look
    if kind == "normal":
        return "".join(f'<circle cx="{x}" cy="-4" r="7" fill="{WHITE}"/><circle cx="{x + 1 + dx}" cy="{-3 + dy}" r="3.5" fill="{INK}"/>' for x in (-11, 11))
    if kind == "big":
        return "".join(f'<circle cx="{x}" cy="-6" r="10" fill="{WHITE}"/><circle cx="{x + dx}" cy="{-6 + dy}" r="3.5" fill="{INK}"/>' for x in (-11, 11))
    if kind == "sparkle":
        return "".join(f'<circle cx="{x}" cy="-6" r="9.5" fill="{WHITE}"/><circle cx="{x}" cy="-5" r="4.5" fill="{INK}"/><circle cx="{x + 1.6}" cy="-6.8" r="1.6" fill="{WHITE}"/>' for x in (-11, 11))
    if kind == "happy":   # ^ ^
        return f'<path d="M-18 -2 q7 -8 14 0 M4 -2 q7 -8 14 0" stroke="{WHITE}" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    if kind == "flat":    # ー ー
        return f'<path d="M-18 -4 h13 M5 -4 h13" stroke="{WHITE}" stroke-width="4.5" stroke-linecap="round"/>'
    if kind == "half":    # ジト目
        return "".join(f'<path d="M{x - 7} -5 h14 a7 7 0 0 1 -14 0 z" fill="{WHITE}"/><circle cx="{x + dx}" cy="-1.5" r="3" fill="{INK}"/>' for x in (-11, 11))
    if kind == "sad":
        return ("".join(f'<circle cx="{x}" cy="-2" r="6.5" fill="{WHITE}"/><circle cx="{x}" cy="1" r="3.2" fill="{INK}"/>' for x in (-11, 11))
                + f'<path d="M-19 -13 L-6 -17 M19 -13 L6 -17" stroke="{WHITE}" stroke-width="3.5" stroke-linecap="round"/>')
    if kind == "dots":
        return f'<circle cx="-14" cy="-4" r="3.6" fill="{WHITE}"/><circle cx="14" cy="-4" r="3.6" fill="{WHITE}"/>'
    raise ValueError(kind)


def mouth(kind: str) -> str:
    s = f'stroke="{WHITE}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"'
    return {
        "w": f'<path d="M-6 12 q3 4 6 0 q3 4 6 0" {s}/>',
        "o": f'<ellipse cx="0" cy="15" rx="4" ry="5" fill="{WHITE}"/>',
        "line": f'<path d="M-5 13 h10" {s}/>',
        "wavy": f'<path d="M-8 14 q2 -3 4 0 q2 3 4 0 q2 -3 4 0 q2 3 4 0" {s}/>',
        "smile": f'<path d="M-9 10 q9 12 18 0 z" fill="{WHITE}"/>',
        "frown": f'<path d="M-6 16 q6 -6 12 0" {s}/>',
        "open": f'<path d="M-7 10 q7 10 14 0 z" fill="{WHITE}"/>',
    }[kind]


def legs(short=False) -> str:
    y2 = 46 if short else 52
    return f'<path d="M-16 30 V{y2} M16 30 V{y2}" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'


# 体の外に出る記号（文字ではなく図形で描くので、フォントに左右されない）
def mark(kind: str) -> str:
    if kind == "!":
        return f'<g transform="translate(46,-66)"><rect x="-4" y="-22" width="8" height="24" rx="4" fill="{INK}"/><circle cx="0" cy="10" r="4.5" fill="{INK}"/></g>'
    if kind == "?":
        return (f'<g transform="translate(48,-64)"><path d="M-9 -12 q0 -12 10 -12 q10 0 10 10 q0 7 -10 11 v6" '
                f'stroke="{INK}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="1" cy="15" r="4" fill="{INK}"/></g>')
    if kind == "sweat":
        return f'<path d="M44 -40 q9 13 0 19 q-9 -6 0 -19 z" fill="{WHITE}" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>'
    if kind == "sparkle":
        star = "M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z"
        return (f'<path transform="translate(48,-62)" d="{star}" fill="{INK}"/>'
                f'<path transform="translate(-50,-60) scale(.6)" d="{star}" fill="{INK}"/>')
    if kind == "idea":
        rays = "".join(f'<line x1="0" y1="-74" x2="0" y2="-88" stroke="{INK}" stroke-width="5" stroke-linecap="round" transform="rotate({a})"/>' for a in (-40, -20, 0, 20, 40))
        return rays
    raise ValueError(kind)


# ---------- 表情 ----------

EXPRESSIONS = {
    # 名前: (説明, 設定)
    "normal":    ("ふつう", dict(ears="normal", L=(70, 70), eyes="normal", mouth="w")),
    "surprised": ("驚き：ひげが跳ね上がる", dict(ears="tall", L=(72, 72), dy=(-18, -18), eyes="big", mouth="o", marks=["!"])),
    "assertive": ("言い切り：ひげが短い＝確か", dict(ears="normal", L=(46, 46), eyes="happy", mouth="w")),
    "thinking":  ("考え中：ひげが片方ずつ上下", dict(ears="normal", L=(70, 70), dy=(-12, 10), eyes="flat", mouth="line", marks=["?"], tilt=-8)),
    "skeptical": ("ジト目：疑っている", dict(ears="normal", L=(64, 64), eyes="half", look=(3, 0), mouth="line")),
    "depends":   ("条件次第：ひげが長く垂れる＝不確か", dict(ears="down", L=(96, 96), dy=(18, 18), bend=(4, 4), eyes="normal", look=(-2, 0), mouth="wavy")),
    "happy":     ("喜び", dict(ears="tall", L=(70, 70), dy=(-8, -8), eyes="happy", mouth="smile", marks=["sparkle"])),
    "down":      ("落胆：ひげも耳も下がる", dict(ears="flat", L=(66, 66), dy=(26, 26), bend=(6, 6), eyes="sad", mouth="frown", squash=True)),
    "panic":     ("焦り：ひげが震える", dict(ears="tall", L=(74, 74), jitter=True, eyes="dots", mouth="wavy", marks=["sweat"])),
    "idea":      ("ひらめき", dict(ears="tall", L=(70, 70), dy=(-10, -10), eyes="sparkle", mouth="open", marks=["idea"])),
    "point":     ("指し示し：右のひげを伸ばして指す", dict(ears="normal", L=(60, 118), dy=(0, -4), eyes="normal", look=(3, 0), mouth="w", tilt=-6)),
}


def draw(cfg: dict) -> str:
    L = cfg["L"]
    dy = cfg.get("dy", (0, 0))
    bend = cfg.get("bend", (0, 0))
    jitter = cfg.get("jitter", False)
    body = (ears(cfg["ears"]) + f'<circle r="{BODY_R}" fill="{INK}"/>'
            + eyes(cfg["eyes"], cfg.get("look", (0, 0))) + mouth(cfg["mouth"]))
    if cfg.get("squash"):
        body = f'<g transform="translate(0,4) scale(1.06,0.92)">{body}</g>'
    parts = (whisker(-1, L[0], dy[0], bend[0], jitter) + whisker(1, L[1], dy[1], bend[1], jitter)
             + legs(short=cfg.get("squash", False)) + body)
    if cfg.get("tilt"):
        parts = f'<g transform="rotate({cfg["tilt"]})">{parts}</g>'
    return parts + "".join(mark(m) for m in cfg.get("marks", []))


def invert(inner: str) -> str:
    """暗い背景用の反転版：墨と白を入れ替える（白い体に墨の目）。"""
    return inner.replace(INK, "#TMP#").replace(WHITE, INK).replace("#TMP#", WHITE)


def svg(inner: str, title: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEWBOX}" width="260" height="180">'
            f"<title>{title}</title>{inner}</svg>\n")


# アイコン：ゴサが棒グラフを見ている。棒は灰色2本と、伸びた最後の1本だけ蛍光ペンの黄（画面の強調色と同じ）
PAPER = "#F5F2EA"
GREY = "#B9B4A8"
MARKER = "#FFD23F"


def bar(x: float, h: float, base: float, w: float, fill: str, r: float = 4) -> str:
    """上の角だけ丸い棒（docs/brand.md のグラフの決まりと同じ）"""
    return (f'<path d="M{x - w / 2} {base} V{base - h + r} q0 -{r} {r} -{r} H{x + w / 2 - r} '
            f'q{r} 0 {r} {r} V{base} Z" fill="{fill}"/>')


def icon() -> str:
    """チャンネル「吾輩は数える猫である」のアイコン（2026-10-04、オーナーが選んだ案）。
    猫を大きく真ん中寄りに、下に小さな棒グラフ。円に切り抜いても欠けない位置に収める。"""
    face = (ears("normal") + whisker(-1, 46, width=9, cap=15) + whisker(1, 46, width=9, cap=15)
            + f'<circle r="{BODY_R}" fill="{INK}"/>'
            + eyes("normal", look=(0, 2)) + mouth("w"))
    base, w, xs, hs = 66, 17, (-22, 0, 22), (12, 21, 32)
    chart = (bar(xs[0], hs[0], base, w, GREY) + bar(xs[1], hs[1], base, w, GREY) + bar(xs[2], hs[2], base, w, MARKER)
             + f'<line x1="{xs[0] - w / 2 - 6}" y1="{base}" x2="{xs[2] + w / 2 + 6}" y2="{base}" '
               f'stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -80 160 160" width="512" height="512">'
            '<title>吾輩は数える猫である アイコン</title>'
            f'<circle r="80" fill="{PAPER}"/>'
            f'<g transform="translate(0,-12) scale(1.15)">{face}</g>{chart}</svg>\n')


def watermark() -> str:
    """動画の透かし（YouTube が動画の右下に小さく出し、押すと登録できる）。
    画面の右下にはゴサがいるので、猫が2匹並ばないよう、アイコンの棒グラフだけにする（2026-10-04）。
    明るい場面でも暗い場面でも見えるよう、紙色の円に墨の縁を付ける。"""
    base, w, xs, hs = 38, 28, (-30, 0, 30), (34, 56, 82)
    chart = (bar(xs[0], hs[0], base, w, GREY, 6) + bar(xs[1], hs[1], base, w, GREY, 6) + bar(xs[2], hs[2], base, w, MARKER, 6)
             + f'<line x1="-52" y1="{base}" x2="52" y2="{base}" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -80 160 160" width="300" height="300">'
            '<title>吾輩は数える猫である 透かし</title>'
            f'<circle r="76" fill="{PAPER}" stroke="{INK}" stroke-width="6"/>{chart}</svg>\n')


def watermark_face() -> str:
    """透かしの別案：紙色の円にゴサの顔（画面のゴサと並ぶので、今は使わない）。"""
    face = (ears("normal") + whisker(-1, 46, width=10, cap=16) + whisker(1, 46, width=10, cap=16)
            + f'<circle r="{BODY_R}" fill="{INK}"/>' + eyes("normal") + mouth("w"))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -80 160 160" width="300" height="300">'
            '<title>吾輩は数える猫である 透かし（ゴサの顔）</title>'
            f'<circle r="76" fill="{PAPER}" stroke="{INK}" stroke-width="6"/>'
            f'<g transform="translate(0,6) scale(1.2)">{face}</g></svg>\n')


def main():
    out = HERE / "svg"
    out.mkdir(exist_ok=True)
    for name, (label, cfg) in EXPRESSIONS.items():
        inner = draw(cfg)
        (out / f"{name}.svg").write_text(svg(inner, f"ゴサ：{label}"), encoding="utf-8")
        (out / f"{name}_dark.svg").write_text(svg(invert(inner), f"ゴサ：{label}（暗い背景用・反転版）"), encoding="utf-8")
    (HERE / "icon.svg").write_text(icon(), encoding="utf-8")
    (HERE / "watermark.svg").write_text(watermark(), encoding="utf-8")
    (HERE / "watermark_face.svg").write_text(watermark_face(), encoding="utf-8")
    rig = dict(BODY_R=BODY_R, WHISKER_Y=WHISKER_Y, WHISKER_W=WHISKER_W, CAP=CAP, EAR_TIPS=EAR_TIPS,
               expressions={k: dict(label=v[0], **v[1]) for k, v in EXPRESSIONS.items()})
    (HERE / "gosa.json").write_text(json.dumps(rig, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(EXPRESSIONS)} 種類 × 2 と icon.svg を書き出しました: {out}")


if __name__ == "__main__":
    main()
