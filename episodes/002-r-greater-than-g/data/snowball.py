"""第2章「雪玉と降る雪」の計算（仮定の世界。台本の数字の元）。

入力：単身20代の金融資産の分布（J-FLEC 2025、research-2.md の1。100人に直したもの）。
仮定：r（資産の利回り）年5%、毎年の貯金（降る雪）50万円、全員同じ。税・手数料・物価は引かない。無回答の3人は中央値（37万円）に置く。
各階級の人は階級の真ん中の額に置く（3000万円以上は3000万円）。
使い方：python episodes/002-r-greater-than-g/data/snowball.py
"""
R, SNOW, YEARS = 0.05, 50, 10   # 万円
BRACKETS = [  # (人数, 額：万円)
    (33, 0), (25, 50), (10, 150), (7, 250), (6, 350), (3, 450), (6, 600), (3, 850),
    (2, 1250), (1, 1750), (0, 2500), (1, 3000), (3, 37),
]
people = [a for n, a in BRACKETS for _ in range(n)]
assert len(people) == 100


def grow(a0, snow=SNOW, r=R, years=YEARS):
    a, interest, snowed = a0, 0.0, 0.0
    for _ in range(years):
        i = a * r
        a += i + snow
        interest += i
        snowed += snow
    return a, interest, snowed


rows = sorted((grow(a)[1] / (grow(a)[1] + grow(a)[2]), a) for a in people)
med = sorted(people)[50]
a, i, s = grow(37)
print(f"平均の雪玉 {sum(people)/100:.0f}万円、中央値 {med}万円")
print(f"37万円の人の10年：雪玉 {a:.0f}万円。増えた分のうち 利息 {i:.0f}万円（{i/(i+s):.0%}）、降った雪 {s:.0f}万円（{s/(i+s):.0%}）")
for a0 in (0, 50, 150, 600, 1250, 3000):
    a, i, s = grow(a0)
    print(f"  {a0:>5}万円から：10年後 {a:.0f}万円、増えた分の利息の割合 {i/(i+s):.0%}")
over_half = sum(1 for p in people if (lambda g: g[1] > g[2])(grow(p)))
print(f"10年で増えた分の半分以上が利息だった人：100人中 {over_half}人")
# 大きな雪玉（相続）の人：1億円を持ち、利息の2割だけ足して残りは使う（ピケティの g/r の例）
big = 10000
for y in range(1, 11):
    big += big * R * 0.2
print(f"1億円の人：利息は年 {10000*R:.0f}万円（20代の平均年収 約371万円より多い）。利息の2割だけ足して8割を使っても、10年後 {big:.0f}万円（年1%で増える）")


# ---- レビュー（depth・rival・facts）を受けた追加の計算 ----
def split(a0, snow=SNOW, r=R, years=YEARS):
    """10年の利息を「はじめの雪玉が生んだ分」と「途中で降った雪が生んだ分」に分ける"""
    base = a0 * ((1 + r) ** years - 1)          # はじめの雪玉だけを転がした利息
    a, i, s = grow(a0, snow, r, years)
    return base, i - base


b, f = split(37)
print(f"37万円の人の10年の利息 {b+f:.0f}万円のうち、はじめの37万円が生んだ分 {b:.0f}万円、途中で降った雪が生んだ分 {f:.0f}万円（{f/(b+f):.0%}）")
# 分かれ目：10年で増えた分の半分以上が利息になる、はじめの雪玉の額
lo, hi = 0.0, 5000.0
for _ in range(60):
    mid = (lo + hi) / 2
    a, i, s = grow(mid)
    lo, hi = (mid, hi) if i < s else (lo, mid)
print(f"分かれ目（10年で利息＞降った雪になる、はじめの雪玉）：約{hi:.0f}万円。1年なら利息＝降る雪になる額 {SNOW/R:.0f}万円")
# 境目ちょうどの人の数え方で変わる（facts の指摘）：分かれ目より上の人数を、階級の下端・上端で数える
for snow in (20, 30, 50, 100):
    n = sum(1 for p in people if grow(p, snow)[1] > grow(p, snow)[2])
    print(f"  降る雪 年{snow}万円 → 利息が半分以上の人 {n}人")
# 大きな雪玉と彼を並べる：1億円で利息の8割を毎年使う／彼は37万円で毎年50万円
big, me = 10000.0, 37.0
for y in range(10):
    big += big * R * 0.2
    me += me * R + SNOW
print(f"10年後：1億円の人 {big:.0f}万円（毎年 利息の8割、約{10000*R*0.8:.0f}万円を使っても）、彼 {me:.0f}万円")
