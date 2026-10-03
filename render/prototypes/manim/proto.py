"""Remotion の試作と同じ10秒の場面を Manim で作る。"""
import random
from manim import *

INK = "#1D2333"
BG = "#F5F2EA"
MALE = "#2F6FDE"
FEMALE = "#D9541E"
FONT = "IPAGothic"
GOSA = "/home/user/youtube/assets/characters/gosa/svg/"

config.background_color = BG
N, PAIRS = 120, 23


def px(x, y):
    """1920x1080 の座標を Manim の座標へ。"""
    return np.array([(x - 960) / 1080 * 8, (540 - y) / 1080 * 8, 0])


def figure(male: bool):
    c = MALE if male else FEMALE
    head = Circle(radius=0.067, fill_color=c, fill_opacity=1, stroke_width=0).shift(UP * 0.2)
    body = (RoundedRectangle(width=0.15, height=0.22, corner_radius=0.06) if male
            else Polygon([-0.07, 0.11, 0], [0.07, 0.11, 0], [0.11, -0.11, 0], [-0.11, -0.11, 0]))
    body.set_fill(c, 1).set_stroke(width=0)
    return VGroup(head, body)


def subtitle(text):
    t = Text(text, font=FONT, weight=BOLD, font_size=34, color=WHITE)
    box = SurroundingRectangle(t, buff=0.15, corner_radius=0.08, fill_color=INK, fill_opacity=0.88, stroke_width=0)
    return VGroup(box, t).move_to(px(960, 1000))


class Proto(Scene):
    def construct(self):
        r = random.Random(7)
        title = Text("1000人で婚活したら、何人がペアになる？", font=FONT, weight=BOLD, font_size=44, color=INK)
        title.to_corner(UL, buff=0.5)
        people = [figure(i % 2 == 0).move_to(px(140 + r.random() * 760, 280 + r.random() * 520)) for i in range(N)]
        crowd = VGroup(*people)
        gosa = SVGMobject(GOSA + "thinking.svg").scale(0.9).move_to(px(1700, 820))
        sub = subtitle("1000人で婚活を始めたら、")

        # 0〜2秒
        self.play(FadeIn(title), FadeIn(crowd), gosa.animate(rate_func=rate_functions.ease_out_back).shift(UP * 0), run_time=0.5)
        self.add(sub)
        self.wait(1.5)

        # 2〜6秒：ペアになった人が右へ移る
        men = [p for i, p in enumerate(people) if i % 2 == 0]
        women = [p for i, p in enumerate(people) if i % 2 == 1]
        r.shuffle(men); r.shuffle(women)
        tracker = ValueTracker(0)
        ctr = always_redraw(lambda: Text(f"ペア成立：{round(tracker.get_value())}組", font=FONT, weight=BOLD,
                                         font_size=32, color=INK).move_to(px(1200, 230)))
        self.add(ctr)
        moves = []
        for k in range(PAIRS):
            bx, by = 1060 + (k % 6) * 110, 330 + (k // 6) * 120
            moves.append(AnimationGroup(men[k].animate.move_to(px(bx, by)), women[k].animate.move_to(px(bx + 40, by))))
        sub2 = subtitle("人気は条件の上位に集中して、")
        self.play(Transform(sub, sub2), run_time=0.1)
        self.play(LaggedStart(*moves, lag_ratio=0.15), tracker.animate.set_value(PAIRS), run_time=3.9)

        # 6〜8.5秒：棒グラフ
        self.play(crowd.animate.set_opacity(0.12), 
                  Transform(sub, subtitle("ペアになれたのは、たった38%でした。")), run_time=0.4)
        base = px(560, 860)
        bars = VGroup()
        for i, (v, c, name) in enumerate([(0.38, INK, "ペア成立"), (0.62, "#9A958C", "相手が見つからない")]):
            h = 520 * v / 1080 * 8
            bar = Rectangle(width=260 / 1080 * 8, height=h, fill_color=c, fill_opacity=1, stroke_width=0)
            bar.move_to(base + RIGHT * (i * 420 + 130) / 1080 * 8, aligned_edge=DOWN)
            num = Text(f"{round(v * 100)}%", font=FONT, weight=BOLD, font_size=48, color=INK).next_to(bar, UP, buff=0.15)
            lab = Text(name, font=FONT, font_size=24, color=INK).next_to(bar, DOWN, buff=0.2)
            bars.add(VGroup(bar, num, lab))
        src = Text("出典：試作用の仮の数字（シミュレーション）", font=FONT, font_size=18, color=INK).move_to(px(330, 930))
        self.play(*[GrowFromEdge(b[0], DOWN) for b in bars], *[FadeIn(VGroup(b[1], b[2])) for b in bars], FadeIn(src), run_time=1.8)

        # 8.5〜10秒：ゴサが驚く
        surprised = SVGMobject(GOSA + "surprised.svg").scale(0.9).move_to(gosa)
        self.play(Transform(gosa, surprised), run_time=0.3)
        self.play(gosa.animate.scale(1.12), rate_func=there_and_back, run_time=0.4)
        self.wait(0.8)
