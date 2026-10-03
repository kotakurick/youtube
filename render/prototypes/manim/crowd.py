import random
from manim import *
config.background_color = "#F5F2EA"
def px(x, y): return np.array([(x - 960) / 1080 * 8, (540 - y) / 1080 * 8, 0])
class Crowd(Scene):
    def construct(self):
        r = random.Random(3); figs, anims = [], []
        for i in range(1000):
            c = "#2F6FDE" if i % 2 == 0 else "#D9541E"
            f = VGroup(Circle(radius=0.04, fill_color=c, fill_opacity=1, stroke_width=0).shift(UP * 0.12),
                       RoundedRectangle(width=0.09, height=0.13, corner_radius=0.035, fill_color=c, fill_opacity=1, stroke_width=0))
            f.move_to(px(60 + r.random() * 1800, 80 + r.random() * 900)); figs.append(f)
            anims.append(f.animate.move_to(px(60 + (i % 50) * 36, 120 + (i // 50) * 44)))
        self.add(*figs)
        self.play(LaggedStart(*anims, lag_ratio=0.002), run_time=5)
