"""第3章「六つの村」のシミュレーション（仮定の世界。台本と画面の数字の元）。

百人の二十代が、25歳から44歳の終わり（45歳）までの20年を、六つの暮らし方の村で過ごす。
運（株の当たり年・外れ年、転職の成否、事業が続くか、空室、物件の値段）を、過去のデータの幅からランダムに引いて、何度も回す。
同じ「世界」の中では、全員が同じ相場を生きる（株・預金・物件の値動きは村の全員で共通。給料・転職・事業は1人ずつ）。

金額はすべて実質（2025年の物価）・税引き前・手数料なし。単位は万円。
材料は research-villages.md（B の各表と D の入力案）、research-startup.md、research-2.md。

★仮定（画面に「仮定」と出し、つまみで変えられるようにするもの）
- 給料：所定内給与（月給。ボーナス・残業を除く）×12。25歳で 25〜29歳の分布から順位を引き、その順位のまま年齢の帯の分位をたどる（断面の表を使う仮定）。
- 貯める額：年収の1割（全部の村で同じ）。
- 転職：毎年の確率は年齢別の転職入職率（男女の平均）。転職したら、雇用動向調査 表6 の年齢別5区分から増減を引く。
  増減の大きさは公表がないので仮定：1割以上の増加 +10〜30%、1割未満の増加 0〜10%、変わらない 0、1割未満の減少 0〜−10%、1割以上の減少 −10〜−30%（一様）。
- 稼ぐ力の村：転職の確率が平均の2倍（自分から動く人の仮定）。自己啓発・副業の効果は公的データがないので入れない（つまみ）。
- 積立の村：日本株（配当込みTOPIX）の実質の対数リターン。基本は 1971〜2025年（平均5.0%・標準偏差23.4%）。比べる用に 1990〜2025年（平均1.3%・標準偏差23%）。
  新NISA の積立の多くは全世界株・米国株とみられ、日本株とは別物（research-villages.md B-3 の注意）。
- 預金の村：実質の利回り 平均−0.3%・標準偏差1.5%（1994〜2025年の実績）。
- 起業の村：25歳で、500万円を借りて始める。毎年の廃業の確率は、5年後に85%が残る値（日本の調査。高めに出る）。
  比べる用にアメリカ（5年後に50%）。残った人の月の稼ぎは公庫の5年目の分布から1人ずつ引く。
  やめたら同じ順位で会社員に戻る（給料が下がらない。アメリカの研究）。借金が残る割合は半分（つまみ。日本のデータなし）。
- 不動産の村：25歳で、首都圏の新築の投資用ワンルーム（平均3,703万円）を、頭金100万円・金利3%・35年のローンで買う（金利は公的な統計なし）。
  表面利回り4.5%（新築の公的な数字なし）、経費は家賃の2割、空室は年ごとに5%の確率で1年空く（つまみ）。
  買った直後に価値が15%下がり（新築の上乗せ分）、その後は築年で毎年1%目減りし、相場の動きが加わる。
  相場：長い期間の公的な指数がないので、基本は「横ばい」（実質の平均0%・標準偏差4.9%）とし、両側を並べる：
  上がる型＝東京の区分マンション 2008〜2025年（平均+4.7%・標準偏差4.9%。名目。物価の平均0.5%を引いて実質+4.2%）、
  下がる型＝1990年型（毎年−8%前後で15年下がる。六大都市の地価が15年で約4分の3下がった時期）。家賃の手取りがローンより少ない年は、貯金から払う。
- 両方の村：稼ぐ力の村の給料の動き＋積立の村の運用（独立に組み合わせる。両方をした人のデータはない）。

使い方：python episodes/002-r-greater-than-g/data/villages.py
"""
import math
import random

YEARS, PEOPLE, WORLDS, SEED = 20, 100, 2000, 7
SAVE = 0.10
# 年齢の帯ごとの所定内給与の分位（千円、2025年、男女計）：p10, p25, p50, p75, p90
WAGE = {
    25: (202.6, 232.8, 267.9, 308.1, 361.8),
    30: (207.2, 245.3, 291.4, 348.0, 427.0),
    35: (211.2, 254.1, 310.1, 384.8, 488.2),
    40: (213.0, 259.5, 325.5, 416.6, 546.9),
}
QS = (0.10, 0.25, 0.50, 0.75, 0.90)
# 転職入職率（男女の平均）と、転職したときの増減の5区分（1割以上増／1割未満増／同じ／1割未満減／1割以上減。不詳を除いて割合を直す）
JOB_RATE = {25: 0.156, 30: 0.122, 35: 0.085, 40: 0.089}
JOB_MOVE = {
    25: (34.2, 15.6, 25.0, 7.4, 16.5),
    30: (32.8, 15.8, 20.8, 9.9, 19.0),
    35: (32.8, 10.7, 28.1, 7.8, 16.1),
    40: (29.9, 15.1, 24.6, 9.8, 17.6),
}
MOVE_SIZE = ((1.10, 1.30), (1.00, 1.10), (1.00, 1.00), (0.90, 1.00), (0.70, 0.90))
# 起業：公庫 5年目の月収の分布（万円の区間と割合%）
BIZ = ((0, 0, 10.8), (1, 20, 19.5), (20, 30, 15.2), (30, 40, 15.3), (40, 50, 8.8), (50, 60, 11.2), (60, 150, 19.2))


def band(age):
    return 40 if age >= 40 else 35 if age >= 35 else 30 if age >= 30 else 25


def quantile(age, u):
    """年齢の帯の分位を順位 u で補間した月給（千円）。端は少し外に伸ばす"""
    q = WAGE[band(age)]
    xs = (0.0,) + QS + (1.0,)
    ys = (q[0] * 0.85,) + q + (q[-1] * 1.25,)
    for i in range(len(xs) - 1):
        if xs[i] <= u <= xs[i + 1]:
            t = (u - xs[i]) / (xs[i + 1] - xs[i])
            return ys[i] + t * (ys[i + 1] - ys[i])
    return ys[-1]


def job_change(rng, age, factor, rate_x):
    if rng.random() >= JOB_RATE[band(age)] * rate_x:
        return factor
    w = JOB_MOVE[band(age)]
    k = rng.choices(range(5), weights=w)[0]
    lo, hi = MOVE_SIZE[k]
    return factor * rng.uniform(lo, hi)


def market(rng, stock):
    """1つの世界の相場（20年分）"""
    mu, sd = stock
    return {
        "stock": [math.exp(rng.gauss(mu, sd)) - 1 for _ in range(YEARS)],
        "deposit": [rng.gauss(-0.003, 0.015) for _ in range(YEARS)],
    }


def run(village, rng, mk, opt):
    out = []
    for _ in range(PEOPLE):
        u = rng.random()
        factor, assets, invested, debt = 1.0, 0.0, 0.0, 0.0
        biz_alive, biz_income = village == "起業", 0.0
        if village == "起業":
            lo, hi, _ = rng.choices(BIZ, weights=[b[2] for b in BIZ])[0]
            biz_income = rng.uniform(lo, hi) * 12
            debt = 500.0
        prop_value, loan = 0.0, 0.0
        if village == "不動産":
            price = 3703.0
            assets -= 100.0           # 頭金（貯金から。足りない分はマイナスの貯金＝借りたのと同じ）
            loan = price - 100.0
            prop_value = price * 0.85
        rate_x = 2.0 if village in ("稼ぐ力", "両方") else 1.0
        for y in range(YEARS):
            age = 25 + y
            wage = quantile(age, u) * factor * 12 / 10   # 万円/年
            income = wage
            if village == "起業":
                if biz_alive:
                    income = biz_income
                    if rng.random() < opt["biz_hazard"]:
                        biz_alive = False
                        if rng.random() < opt["debt_left"]:
                            assets -= debt     # 借金が残る
                        debt = 0.0
                else:
                    factor = job_change(rng, age, factor, rate_x)
            else:
                factor = job_change(rng, age, factor, rate_x)
            save = income * SAVE
            r = mk["stock"][y] if village in ("積立", "両方") else mk["deposit"][y]
            if village == "不動産":
                rent = 3703.0 * 0.045 * (0 if rng.random() < opt["vacancy"] else 1) * 0.8
                pay = loan_payment(3603.0, 0.03, 35)
                interest = loan * 0.03
                loan = max(0.0, loan - (pay - interest))
                save += rent - pay
                prop_value *= (1 + opt["prop"][y]) * 0.99
            assets = assets * (1 + r) + save
            invested += income * SAVE
        net = assets + prop_value - loan
        out.append((net, invested, wage))
    return out


def loan_payment(p, i, n):
    return p * i / (1 - (1 + i) ** -n)


def pct(xs, q):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(q * len(xs)))]


def simulate(stock=(0.050, 0.234), biz_hazard=1 - 0.85 ** 0.2, debt_left=0.5, vacancy=0.05, prop="flat", label=""):
    rng = random.Random(SEED)
    res = {v: [] for v in ("預金", "積立", "稼ぐ力", "起業", "不動産", "両方")}
    for _ in range(WORLDS // 10):
        mk = market(rng, stock)
        if prop == "tokyo":
            p = [rng.gauss(0.042, 0.049) for _ in range(YEARS)]
        elif prop == "flat":
            p = [rng.gauss(0.0, 0.049) for _ in range(YEARS)]
        else:   # 1990年型：15年下がって、その後は横ばい
            p = [rng.gauss(-0.08, 0.04) if y < 15 else rng.gauss(0.0, 0.04) for y in range(YEARS)]
        opt = {"biz_hazard": biz_hazard, "debt_left": debt_left, "vacancy": vacancy, "prop": p}
        for v in res:
            res[v] += run(v, rng, mk, opt)
    print(f"\n## {label}")
    print("| 村 | 45歳の資産 下位1割 | 真ん中 | 上位1割 | 貯めた額より減った人 | 44歳の年収 真ん中 | 上位1割 |")
    print("|---|---:|---:|---:|---:|---:|---:|")
    for v, xs in res.items():
        nets = [n for n, _, _ in xs]
        lost = sum(1 for n, inv, _ in xs if n < inv) / len(xs)
        wages = [w for _, _, w in xs]
        print(f"| {v} | {pct(nets, .1):,.0f} | {pct(nets, .5):,.0f} | {pct(nets, .9):,.0f} | {lost:.0%} | {pct(wages, .5):,.0f} | {pct(wages, .9):,.0f} |")


if __name__ == "__main__":
    simulate(label="基本（日本株は1971〜2025年の幅、起業は日本の存続率、物件の相場は横ばい）")
    simulate(prop="tokyo", label="物件の相場を上がる型（東京 2008〜2025年）にした場合")
    simulate(stock=(0.013, 0.23), label="日本株を1990〜2025年の幅にした場合")
    simulate(biz_hazard=1 - 0.50 ** 0.2, label="起業の存続をアメリカ並み（5年で半分）にした場合")
    simulate(prop="1990", label="物件の相場を1990年型（15年下がる）にした場合")
    simulate(vacancy=0.15, label="ワンルームの空室を年15%にした場合")
