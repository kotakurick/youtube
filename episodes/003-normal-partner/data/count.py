"""「普通」の条件を重ねると、25〜34歳の未婚の100人に何人残るか（一次資料の表から数える）。

使い方:  python episodes/003-normal-partner/data/count.py > episodes/003-normal-partner/data/count_result.md

数え方
- 母集団：25〜34歳の未婚者（有業者＋無業者）。令和4年就業構造基本調査。
  - 有業者：第40表（男女・配偶関係・年齢・雇用形態・所得・教育）→ shugyo2022_t040_25-34.csv
  - 無業者：第118表（男女・配偶関係・年齢・教育）→ shugyo2022_t118_mugyo_25-34.csv
  - 無業者は「正社員」「年収」の条件を満たさないものとして数える。
- 正社員・年収・学歴・年齢は、表の**実際の重なり**で数える（独立と仮定しない）。
- 身長・喫煙・体型は就業構造基本調査にないので、令和5年国民健康・栄養調査（kenko2023.csv）の割合を
  **独立と仮定して掛ける**（画面に前提を出す）。身長は平均と標準偏差から正規分布で割合を出す。
  年齢は20〜29歳・30〜39歳の値を、25〜29歳・30〜34歳の人数で重みづけする。
- 年収は「主な仕事からの年間収入・収益」（税込み。副業や資産の収入は入らない）。
"""
import csv
import math
from pathlib import Path

HERE = Path(__file__).parent
AGES = ("03_25～29歳", "04_30～34歳")
UNI = ("18_大学（卒業者）", "19_大学院（卒業者）")
SEIKI = "22_うち正規の職員・従業員"


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0  # 「-」は0


def load():
    t40 = list(csv.DictReader(open(HERE / "shugyo2022_t040_25-34.csv", encoding="utf-8-sig")))
    t118 = list(csv.DictReader(open(HERE / "shugyo2022_t118_mugyo_25-34.csv", encoding="utf-8-sig")))
    kenko = {}
    for r in csv.DictReader(open(HERE / "kenko2023.csv", encoding="utf-8-sig")):
        kenko[(r["表"][:3] + r["表"].split()[-1], r["性別"], r["年齢"], r["区分"])] = float(r["値"])
    return t40, t118, kenko


def inc_ge(lo):
    """年収 lo 万円以上の所得区分（区分の番号で判定）。"""
    start = {0: 1, 300: 7, 400: 8, 500: 9, 600: 10}[lo]
    return lambda code: code != "00_総数" and int(code[:2]) >= start


def norm_sf(x, mu, sd):
    return 0.5 * math.erfc((x - mu) / (sd * math.sqrt(2)))


class Pool:
    def __init__(self, t40, t118, sex, mar="1_うち未婚", ages=AGES):
        self.w = [r for r in t40 if r["男女"] == sex and r["配偶関係"] == mar and r["年齢"] in ages]
        self.nw = [r for r in t118 if r["男女"] == sex and r["年齢"] in ages] if mar == "1_うち未婚" else []
        self.ages = ages

    def workers(self, age=None):
        return sum(num(r["0_総数"]) for r in self.w
                   if r["従業上の地位・雇用形態"] == "0_総数" and r["所得"] == "00_総数" and (age is None or r["年齢"] == age))

    def nonworkers(self, age=None, edu=None):
        return sum(num(r["無業者_総数"]) for r in self.nw
                   if r["教育"] == (edu or "0_総数") and (age is None or r["年齢"] == age))

    def total(self, age=None):
        return self.workers(age) + self.nonworkers(age)

    def count(self, seiki=False, inc=None, uni=False, age=None):
        """正社員・年収・大卒以上・年齢の条件を実際の重なりで数える。"""
        emp = SEIKI if seiki else "0_総数"
        edu = UNI if uni else ("0_総数",)
        s = 0.0
        for r in self.w:
            if r["従業上の地位・雇用形態"] != emp or (age and r["年齢"] != age):
                continue
            if inc is None:
                if r["所得"] != "00_総数":
                    continue
            elif not inc(r["所得"]):
                continue
            s += sum(num(r[e]) for e in edu)
        if not seiki and inc is None:  # 無業者も入る条件だけ
            s += sum(self.nonworkers(age, e) for e in edu)
        return s


def health_share(kenko, sex, key, ages_w):
    """国民健康・栄養調査の割合を、25〜29歳・30〜34歳の人数で重みづけ。"""
    a, b = ages_w
    if key[0] == "身長":
        cm, side = key[1], key[2]
        out = 0.0
        for w, band in ((a, "20-29歳"), (b, "30-39歳")):
            mu = kenko[("第14身長", sex, band, "平均")]
            sd = kenko[("第14身長", sex, band, "標準偏差")]
            p = norm_sf(cm, mu, sd)
            out += w * (p if side == "以上" else 1 - p)
        return out / (a + b)
    if key[0] == "非喫煙":
        out = 0.0
        for w, band in ((a, "20-29歳"), (b, "30-39歳")):
            out += w * (kenko[("第73喫煙", sex, band, "吸わない")] + kenko[("第73喫煙", sex, band, "以前は吸っていた")]) / 100
        return out / (a + b)
    if key[0] == "BMI標準":
        return kenko[("第17BMI", sex, "20-39歳", "18.5以上25未満")] / 100
    raise KeyError(key)


def run(title, pool, sex_kenko, steps, kenko):
    """steps：条件のリスト。('表', 名前, dict(seiki/inc/uni/age)) か ('健康', 名前, key)。上から順に重ねる。"""
    n = pool.total()
    wa = (pool.total(AGES[0]), pool.total(AGES[1]))
    print(f"### {title}\n")
    print(f"母集団：{n:,.0f}人（就業構造基本調査 2022）\n")
    print("| 重ねた条件 | その条件だけ | 独立と仮定して掛けた数 | 実際に重ねた数 | 100人中 |")
    print("|---|---:|---:|---:|---:|")
    cond = {}
    indep = 1.0
    health = 1.0
    singles = []
    for kind, name, arg in steps:
        if kind == "表":
            single = pool.count(**arg) / n
            cond.update(arg)
            actual_tab = pool.count(**cond) / n
        else:
            single = health_share(kenko, sex_kenko, arg, wa)
            health *= single
            actual_tab = pool.count(**cond) / n if cond else 1.0
        singles.append((name, single))
        indep *= single
        actual = actual_tab * health
        print(f"| ＋{name} | {single:.1%} | {indep * 100:.1f} | {actual * 100:.1f} | {round(actual * 100)} |")
    final = actual
    print(f"\n全部そろうのは100人中 **{final * 100:.1f}人**（独立と仮定すると {indep * 100:.1f}人）。人数にすると約{final * n / 10000:.0f}万人。\n")
    # 1つだけ外したら
    print("| 1つだけ外したら | 100人中 | 何倍 |")
    print("|---|---:|---:|")
    for i, (kind, name, arg) in enumerate(steps):
        c, h = {}, 1.0
        for j, (k2, _, a2) in enumerate(steps):
            if j == i:
                continue
            if k2 == "表":
                c.update(a2)
            else:
                h *= health_share(kenko, sex_kenko, a2, wa)
        v = (pool.count(**c) / n if c else 1.0) * h
        print(f"| {name} を外す | {v * 100:.1f} | {v / final:.1f} |")
    print()
    return final


def distribution(pool, sex_kenko, kenko):
    """同じ5条件で、満たす数（0〜5個）ごとの人数。表の3条件は実際の重なり、健康の2条件は独立と仮定。"""
    n = pool.total()
    wa = (pool.total(AGES[0]), pool.total(AGES[1]))
    inc = inc_ge(300)
    # 表の3条件（正社員 s・年収300万円以上 i・大卒以上 u）の8通りを、包除で出す
    def c(s=False, i=False, u=False):
        return pool.count(seiki=s, inc=inc if i else None, uni=u) / n
    tab = {}
    for s in (0, 1):
        for i in (0, 1):
            for u in (0, 1):
                # ちょうど (s,i,u) の割合 = 包除
                tot = 0.0
                for s2 in range(s, 2):
                    for i2 in range(i, 2):
                        for u2 in range(u, 2):
                            sign = (-1) ** ((s2 - s) + (i2 - i) + (u2 - u))
                            tot += sign * c(bool(s2), bool(i2), bool(u2))
                tab[(s, i, u)] = tot
    hb = [health_share(kenko, sex_kenko, ("BMI標準",), wa), health_share(kenko, sex_kenko, ("非喫煙",), wa)]
    dist = [0.0] * 6
    for k, v in tab.items():
        for b in (0, 1):
            for m in (0, 1):
                p = v * (hb[0] if b else 1 - hb[0]) * (hb[1] if m else 1 - hb[1])
                dist[sum(k) + b + m] += p
    return dist


def main():
    t40, t118, kenko = load()
    men = Pool(t40, t118, "1_男")
    women = Pool(t40, t118, "2_女")

    print("# 数えた結果（count.py の出力。手で直さない）\n")
    print("## 0. 未婚でしぼると、年収の線はどう変わるか（25〜34歳、有業者）\n")
    print("| | 有業者 | 年収500万円以上 | 400万円以上 | 300万円以上 |")
    print("|---|---:|---:|---:|---:|")
    for sex, lab in (("1_男", "男性"), ("2_女", "女性")):
        for mar, ml in (("0_総数", "全体"), ("1_うち未婚", "未婚")):
            p = Pool(t40, t118, sex, mar)
            w = p.workers()
            cnt = lambda lo: sum(num(r["0_総数"]) for r in p.w if r["従業上の地位・雇用形態"] == "0_総数" and inc_ge(lo)(r["所得"]))
            print(f"| {lab}・{ml} | {w:,.0f} | {cnt(500) / w:.1%} | {cnt(400) / w:.1%} | {cnt(300) / w:.1%} |")
    print()

    print("## 0b. 未婚でない人（既婚・離死別）と比べる（有業者。総数から未婚を引いた）\n")
    print("| | 年齢 | 未婚でない有業者 | 年収500万円以上 | 未婚の有業者 | 年収500万円以上 |")
    print("|---|---|---:|---:|---:|---:|")
    for sex, lab in (("1_男", "男性"), ("2_女", "女性")):
        for ages, al in ((AGES, "25〜34歳"), ((AGES[0],), "25〜29歳"), ((AGES[1],), "30〜34歳")):
            a = Pool(t40, t118, sex, "0_総数", ages)
            u = Pool(t40, t118, sex, "1_うち未婚", ages)
            c = lambda p: sum(num(r["0_総数"]) for r in p.w if r["従業上の地位・雇用形態"] == "0_総数" and inc_ge(500)(r["所得"]))
            wm = a.workers() - u.workers()
            cm = c(a) - c(u)
            print(f"| {lab} | {al} | {wm:,.0f} | {cm / wm:.1%} | {u.workers():,.0f} | {c(u) / u.workers():.1%} |")
    print()

    print("## 1. 女性がよく聞く「普通の男性」（25〜34歳の未婚男性）\n")
    for lo in (500, 400, 300):
        run(f"年収{lo}万円以上の線", men, "男性", [
            ("表", "正社員", dict(seiki=True)),
            ("表", f"年収{lo}万円以上", dict(inc=inc_ge(lo))),
            ("表", "大卒以上", dict(uni=True)),
            ("健康", "身長170cm以上", ("身長", 170, "以上")),
            ("健康", "たばこを吸わない", ("非喫煙",)),
        ], kenko)

    print("## 2. 男性がよく聞く「普通の女性」（25〜34歳の未婚女性）\n")
    run("20代・正社員・体型が標準・たばこを吸わない", women, "女性", [
        ("表", "20代（25〜29歳）", dict(age=AGES[0])),
        ("表", "正社員", dict(seiki=True)),
        ("健康", "体型が標準（BMI 18.5〜25）", ("BMI標準",)),
        ("健康", "たばこを吸わない", ("非喫煙",)),
    ], kenko)
    run("上に「年収300万円以上」を足す（5条件）", women, "女性", [
        ("表", "20代（25〜29歳）", dict(age=AGES[0])),
        ("表", "正社員", dict(seiki=True)),
        ("表", "年収300万円以上", dict(inc=inc_ge(300))),
        ("健康", "体型が標準（BMI 18.5〜25）", ("BMI標準",)),
        ("健康", "たばこを吸わない", ("非喫煙",)),
    ], kenko)

    print("## 3. 同じ物差し：男女とも同じ5条件（正社員・年収300万円以上・大卒以上・体型が標準・たばこを吸わない）\n")
    for pool, lab, sk in ((men, "未婚男性", "男性"), (women, "未婚女性", "女性")):
        run(lab, pool, sk, [
            ("表", "正社員", dict(seiki=True)),
            ("表", "年収300万円以上", dict(inc=inc_ge(300))),
            ("表", "大卒以上", dict(uni=True)),
            ("健康", "体型が標準（BMI 18.5〜25）", ("BMI標準",)),
            ("健康", "たばこを吸わない", ("非喫煙",)),
        ], kenko)

    print("## 5. 物差しを変えると、男女の人数はどう動くか（同じ条件を男女に。100人中）\n")
    print("| 物差し | 未婚男性 | 未婚女性 |")
    print("|---|---:|---:|")
    import contextlib, io
    variants = [
        ("正社員・年収300万円以上・大卒以上・体型が標準・たばこを吸わない", [("表", "a", dict(seiki=True)), ("表", "b", dict(inc=inc_ge(300))), ("表", "c", dict(uni=True)), ("健康", "d", ("BMI標準",)), ("健康", "e", ("非喫煙",))]),
        ("年収の線を400万円に", [("表", "a", dict(seiki=True)), ("表", "b", dict(inc=inc_ge(400))), ("表", "c", dict(uni=True)), ("健康", "d", ("BMI標準",)), ("健康", "e", ("非喫煙",))]),
        ("年収の条件なし（正社員・大卒以上・体型・たばこ）", [("表", "a", dict(seiki=True)), ("表", "c", dict(uni=True)), ("健康", "d", ("BMI標準",)), ("健康", "e", ("非喫煙",))]),
        ("たばこの条件なし（正社員・300万円以上・大卒以上・体型）", [("表", "a", dict(seiki=True)), ("表", "b", dict(inc=inc_ge(300))), ("表", "c", dict(uni=True)), ("健康", "d", ("BMI標準",))]),
        ("体型の条件なし（正社員・300万円以上・大卒以上・たばこ）", [("表", "a", dict(seiki=True)), ("表", "b", dict(inc=inc_ge(300))), ("表", "c", dict(uni=True)), ("健康", "e", ("非喫煙",))]),
    ]
    for lab, steps in variants:
        vals = []
        for pool, sk in ((men, "男性"), (women, "女性")):
            with contextlib.redirect_stdout(io.StringIO()):
                vals.append(run("", pool, sk, steps, kenko))
        print(f"| {lab} | {vals[0] * 100:.1f} | {vals[1] * 100:.1f} |")
    print()


    print("## 6. 条件どうしは、どれくらい一緒に動くか（25〜34歳の未婚者。表の実際の重なり）\n")
    print("相関係数はφ（2つの「満たす・満たさない」の相関。0なら無関係、1なら完全に一緒）。")
    print("「Aを満たす人のうちBも満たす割合」と「全体でBを満たす割合」を並べる。\n")
    print("| | A | B | 全体でB | Aを満たす人のうちB | φ |")
    print("|---|---|---|---:|---:|---:|")
    for pool, lab in ((men, "未婚男性"), (women, "未婚女性")):
        n = pool.total()
        conds = {"正社員": dict(seiki=True), "年収500万円以上": dict(inc=inc_ge(500)), "年収300万円以上": dict(inc=inc_ge(300)), "大卒以上": dict(uni=True)}
        if lab == "未婚女性":
            conds["20代（25〜29歳）"] = dict(age=AGES[0])
        names = list(conds)
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                if {a, b} == {"年収500万円以上", "年収300万円以上"}:
                    continue
                pa = pool.count(**conds[a]) / n
                pb = pool.count(**conds[b]) / n
                pab = pool.count(**{**conds[a], **conds[b]}) / n
                phi = (pab - pa * pb) / math.sqrt(pa * (1 - pa) * pb * (1 - pb))
                print(f"| {lab} | {a} | {b} | {pb:.1%} | {pab / pa:.1%} | {phi:.2f} |")
    print()

    print("## 7. 身長と年収に弱い相関があったら（見積もり。二変量正規分布で、年収500万円以上の人のうち170cm以上の割合）\n")
    print("身長は就業構造基本調査にないので、相関の強さを仮定して見積もる。研究（research-academic.md）の効果の大きさ（1cmで時給約0.7%、1インチで年収1.4%）は、相関にすると0.1前後の弱さ。Judge & Cable の β＝.26 は上限の目安。\n")
    print("| 相関 | 年収500万円以上の人のうち170cm以上 |")
    print("|---:|---:|")
    import random
    rng = random.Random(1)
    p_inc = men.count(inc=inc_ge(500)) / men.total()
    p_h = health_share(kenko, "男性", ("身長", 170, "以上"), (men.total(AGES[0]), men.total(AGES[1])))
    def ppf(p):
        lo, hi = -10.0, 10.0
        for _ in range(80):
            mid = (lo + hi) / 2
            if 0.5 * (1 + math.erf(mid / math.sqrt(2))) < p:
                lo = mid
            else:
                hi = mid
        return (lo + hi) / 2
    a, b = ppf(1 - p_inc), ppf(1 - p_h)
    for rho in (0.0, 0.1, 0.2, 0.26):
        both = inc = 0
        for _ in range(200_000):
            x = rng.gauss(0, 1)
            if x <= a:
                continue
            inc += 1
            if rho * x + math.sqrt(1 - rho * rho) * rng.gauss(0, 1) > b:
                both += 1
        print(f"| {rho} | {both / inc:.1%} |")
    print()
    print("## 4. 同じ5条件で、満たす数ごとの人数（100人中）\n")
    print("| 満たす数 | 0個 | 1個 | 2個 | 3個 | 4個 | 5個 |")
    print("|---|---:|---:|---:|---:|---:|---:|")
    for pool, lab, sk in ((men, "未婚男性", "男性"), (women, "未婚女性", "女性")):
        dist = distribution(pool, sk, kenko)
        print(f"| {lab} | " + " | ".join(f"{x * 100:.1f}" for x in dist) + " |")
    print()


if __name__ == "__main__":
    main()
