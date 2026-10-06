"""同じ額面の年収を、1995年と2025年の制度で手取りに直す。

会社員・独身・扶養なし。制度の値と出典は research-rules.md の8章。
簡略化（画面の隅と概要欄に書く）:
- 住民税は前年の所得にかかるが、「その年の所得に、その年の制度」で計算する。
- 標準報酬月額の等級は使わず、月給そのものに率をかける（400〜600万円は上限・下限にかからない）。
- 給与所得控除・社会保険料控除のほかの控除（生命保険料など）は入れない。
- 1995年の健康保険の賞与の率は未確認（労使計0.8%という二次資料のみ）。本人分は半分の0.4%と仮定し、0%・0.8%で幅を出す。

使い方: python episodes/005-take-home-30-years/data/takehome.py
  → 同じフォルダに takehome_result.md と takehome.csv を書く。
"""
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
INF = float("inf")


def progressive(amount, brackets):
    """累進税率（brackets は [上限, 率] の並び）。"""
    tax, lower = 0.0, 0.0
    for upper, rate in brackets:
        if amount <= lower:
            break
        tax += (min(amount, upper) - lower) * rate
        lower = upper
    return tax


def kyuyo_shotoku(gross, year):
    """給与所得＝年収−給与所得控除（年収400〜1000万円の範囲で使う式）。"""
    if year == 1995:
        table = [(1800000, 0.40, 0), (3600000, 0.30, 180000), (6600000, 0.20, 540000),
                 (10000000, 0.10, 1200000), (INF, 0.05, 1700000)]
        floor = 650000
    else:
        table = [(1900000, 0.0, 650000), (3600000, 0.30, 80000), (6600000, 0.20, 440000),
                 (8500000, 0.10, 1100000), (INF, 0.0, 1950000)]
        floor = 650000
    for upper, rate, add in table:
        if gross <= upper:
            return gross - max(gross * rate + add, floor)
    raise ValueError


BASIC_2025 = [(1320000, 950000), (3360000, 880000), (4890000, 680000), (6550000, 630000),
              (23500000, 580000), (INF, 0)]


def takehome(gross, bonus_months, age, year, special_cut=False, health_bonus_1995=0.004):
    """手取りと内訳（円）。bonus_months は年収のうち賞与が月給の何か月分か。"""
    monthly = gross / (12 + bonus_months)
    bonus = monthly * bonus_months
    if year == 1995:
        pension = monthly * 12 * 0.0825 + bonus * 0.005
        health = monthly * 12 * 0.041 + bonus * health_bonus_1995
        care = 0.0
        employment = gross * 0.004
    else:
        pension = gross * 0.0915
        health = gross * 0.050
        care = gross * 0.00795 if 40 <= age <= 64 else 0.0
        employment = gross * 0.0055
    social = pension + health + care + employment

    shotoku = kyuyo_shotoku(gross, year)
    if year == 1995:
        it_base = max(shotoku - social - 380000, 0)
        it = progressive(it_base, [(3300000, 0.10), (9000000, 0.20), (18000000, 0.30),
                                   (30000000, 0.40), (INF, 0.50)])
        if special_cut:
            it -= min(it * 0.15, 50000)
        rt_base = max(shotoku - social - 330000, 0)
        rt = progressive(rt_base, [(2000000, 0.05), (7000000, 0.10), (INF, 0.15)])
        if special_cut:
            rt -= min(rt * 0.15, 20000)
        rt += 700 + 2000  # 均等割（道府県700円＋市町村。人口5万〜50万の2,000円とした）
    else:
        basic = next(a for upper, a in BASIC_2025 if shotoku <= upper)
        it_base = max(shotoku - social - basic, 0)
        it = progressive(it_base, [(1950000, 0.05), (3300000, 0.10), (6950000, 0.20),
                                   (9000000, 0.23), (18000000, 0.33), (40000000, 0.40),
                                   (INF, 0.45)])
        it *= 1.021  # 復興特別所得税
        rt_base = max(shotoku - social - 430000, 0)
        rt = rt_base * 0.10 - 2500 + 4000 + 1000  # 調整控除・均等割・森林環境税
    tax = it + rt
    return {
        "gross": gross, "pension": pension, "health": health, "care": care,
        "employment": employment, "social": social, "income_tax": it,
        "resident_tax": rt, "tax": tax, "takehome": gross - social - tax,
    }


def ladder(gross, bm, age):
    """1995年の制度から、厚生年金 → 健康保険 → 介護保険 → 雇用保険 → 税 の順に2025年の制度へ置き換える。"""
    monthly = gross / (12 + bm)
    bonus = monthly * bm
    p95 = monthly * 12 * 0.0825 + bonus * 0.005
    h95 = monthly * 12 * 0.041 + bonus * 0.004
    p25, h25 = gross * 0.0915, gross * 0.050
    c25 = gross * 0.00795 if 40 <= age <= 64 else 0.0
    e95, e25 = gross * 0.004, gross * 0.0055
    b95, b25 = takehome(gross, bm, age, 1995), takehome(gross, bm, age, 2025)


    steps = [("1995年の制度", p95, h95, 0.0, e95, 1995),
             ("厚生年金を今の率に（月給8.25→9.15%、賞与にも同じ率）", p25, h95, 0.0, e95, 1995),
             ("健康保険を今の率に（4.1→5.0%、賞与にも同じ率）", p25, h25, 0.0, e95, 1995),
             ("介護保険を足す（40歳以上 0.8%）", p25, h25, c25, e95, 1995),
             ("雇用保険を今の率に（0.4→0.55%）", p25, h25, c25, e25, 1995),
             ("所得税・住民税を今の制度に", p25, h25, c25, e25, 2025)]
    out = []
    for label, p, h, c, e, ty in steps:
        social = p + h + c + e
        out.append((label, gross - social - _tax_only(gross, social, ty)))
    assert abs(out[0][1] - b95["takehome"]) < 1 and abs(out[-1][1] - b25["takehome"]) < 1
    return out


def _tax_only(gross, social, year):
    """保険料を与えたときの所得税＋住民税（takehome と同じ式）。"""
    shotoku = kyuyo_shotoku(gross, year)
    if year == 1995:
        it = progressive(max(shotoku - social - 380000, 0), [(3300000, 0.10), (9000000, 0.20), (18000000, 0.30),
                                                             (30000000, 0.40), (INF, 0.50)])
        rt = progressive(max(shotoku - social - 330000, 0), [(2000000, 0.05), (7000000, 0.10), (INF, 0.15)]) + 2700
        return it + rt
    basic = next(a for upper, a in BASIC_2025 if shotoku <= upper)
    it = progressive(max(shotoku - social - basic, 0), [(1950000, 0.05), (3300000, 0.10), (6950000, 0.20),
                                                        (9000000, 0.23), (18000000, 0.33), (40000000, 0.40),
                                                        (INF, 0.45)]) * 1.021
    rt = max(shotoku - social - 430000, 0) * 0.10 - 2500 + 5000
    return it + rt


# 男性・学歴計の賞与の月数（賃金構造基本統計調査 2025年：年間賞与 ÷ きまって支給する現金給与額。wage_by_age.csv）
def bonus_months_from_census(year, age_band):
    path = os.path.join(HERE, "wage_by_age.csv")
    with open(path, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if (r["year"] == str(year) and r["sex"] == "男" and r["education"] == "学歴計"
                    and r["age"] == age_band and r["series"] in ("新推計", "旧推計")):
                return float(r["bonus"]) / float(r["kimatte"]), float(r["annual_est"]) * 1000
    raise KeyError((year, age_band))


# 2年間だけの上乗せ（令和7・8年分）を除いた基礎控除（本則。合計所得132万円以下は95万円、2,350万円以下は58万円）
BASIC_2025_HONSOKU = [(1320000, 950000), (23500000, 580000), (INF, 0)]

CPI_2025_PER_1995 = 1.167
DEFLATOR_2025_PER_1995 = 1.086  # 家計最終消費支出デフレーター 2025年÷1995年（内閣府 国民経済計算。research-papers-thinktank.md）  # 消費者物価指数 総合 2025年平均÷1995年平均（research-macro.md）


def man(x):
    return f"{x / 10000:.1f}"


def main():
    rows, lines = [], ["# 手取りの計算（1995年と2025年の制度）", "",
                       "`takehome.py` が書いたファイル。手で直さない。単位は万円。", ""]

    lines += ["## 1. 同じ額面を、2つの制度で", "",
              "賞与の月数は、2025年の男性・学歴計の同じ年齢の値（賃金構造基本統計調査）。",
              "1995年は本則（特別減税なし）と、特別減税ありの両方。", "",
              "| 額面 | 年齢 | 賞与(か月) | 手取り1995 | 手取り1995(減税込) | 手取り2025 | 差 | 社会保険料1995→2025 | 税1995→2025 |",
              "|---|---|---|---|---|---|---|---|---|"]
    for gross in (3000000, 4000000, 5000000, 6000000):
        for age, band in ((30, "30-34"), (45, "45-49")):
            bm, _ = bonus_months_from_census(2025, band)
            a = takehome(gross, bm, age, 1995)
            a2 = takehome(gross, bm, age, 1995, special_cut=True)
            b = takehome(gross, bm, age, 2025)
            lines.append(f"| {man(gross)} | {age} | {bm:.1f} | {man(a['takehome'])} | {man(a2['takehome'])} | "
                         f"{man(b['takehome'])} | {man(b['takehome'] - a['takehome'])} | "
                         f"{man(a['social'])}→{man(b['social'])} | {man(a['tax'])}→{man(b['tax'])} |")
            for y, d in ((1995, a), ("1995減税込", a2), (2025, b)):
                rows.append({"case": "same_gross", "age": age, "rule_year": y, "bonus_months": round(bm, 2),
                             **{k: round(v) for k, v in d.items()}})

    lines += ["", "## 2. 1995年の健康保険の賞与の率（未確認）で、どれだけ動くか", "",
              "| 額面 | 年齢 | 本人0% | 本人0.4%（採用） | 本人0.8% |", "|---|---|---|---|---|"]
    for gross in (4000000, 5000000):
        for age, band in ((30, "30-34"), (45, "45-49")):
            bm, _ = bonus_months_from_census(2025, band)
            vals = [man(takehome(gross, bm, age, 1995, health_bonus_1995=r)["takehome"]) for r in (0, 0.004, 0.008)]
            lines.append(f"| {man(gross)} | {age} | " + " | ".join(vals) + " |")

    lines += ["", "## 3. 賞与の月数で、どれだけ動くか（1995年の制度は賞与に保険料がほぼかからない）", "",
              "| 額面 | 年齢 | 賞与(か月) | 手取り1995 | 手取り2025 | 差 |", "|---|---|---|---|---|---|"]
    for gross in (4000000, 5000000):
        for age in (30, 45):
            for bm in (0, 2, 4, 6):
                a = takehome(gross, bm, age, 1995)
                b = takehome(gross, bm, age, 2025)
                lines.append(f"| {man(gross)} | {age} | {bm} | {man(a['takehome'])} | {man(b['takehome'])} | "
                             f"{man(b['takehome'] - a['takehome'])} |")

    lines += ["", "## 4. 30年前の同い年（男性・学歴計の平均の年収）を、その年の制度で", "",
              "年収の目安＝きまって支給する現金給与額×12＋年間賞与（wage_by_age.csv）。",
              f"実質は2025年の物価に直した値（消費者物価指数 総合 {CPI_2025_PER_1995}倍）。", "",
              "| 年齢 | 額面1995 | 額面2025 | 額面の差 | 手取り1995 | 手取り2025 | 手取りの差 | 手取り1995(2025年の物価) | 実質の差 |",
              "|---|---|---|---|---|---|---|---|---|"]
    for age, band in ((22, "20-24"), (27, "25-29"), (32, "30-34"), (37, "35-39"), (42, "40-44"),
                      (47, "45-49"), (52, "50-54"), (57, "55-59")):
        bm95, g95 = bonus_months_from_census(1995, band)
        bm25, g25 = bonus_months_from_census(2025, band)
        a = takehome(g95, bm95, age, 1995)
        b = takehome(g25, bm25, age, 2025)
        real95 = a["takehome"] * CPI_2025_PER_1995
        lines.append(f"| {band} | {man(g95)} | {man(g25)} | {(g25 / g95 - 1) * 100:+.0f}% | {man(a['takehome'])} | "
                     f"{man(b['takehome'])} | {(b['takehome'] / a['takehome'] - 1) * 100:+.0f}% | {man(real95)} | "
                     f"{(b['takehome'] / real95 - 1) * 100:+.0f}% |")
        for y, d, bm in ((1995, a, bm95), (2025, b, bm25)):
            rows.append({"case": "same_age_avg", "age": band, "rule_year": y, "bonus_months": round(bm, 2),
                         **{k: round(v) for k, v in d.items()}})

    lines += ["", "## 5. 会社が払う総額で数え直す（額面＋会社負担の厚生年金・健康保険・介護保険）", "",
              "会社負担は本人と同じ率（労使折半）。雇用保険・労災・子ども子育て拠出金の会社負担は入れていない（未確認のため）。",
              "1995年の健康保険の賞与の会社負担は0.4%と仮定。", "",
              "| 年齢 | 会社が払う総額1995 | 会社が払う総額2025 | 総額の差 | 額面の差 | 手取りの差 | 手取り÷総額1995 | 手取り÷総額2025 |",
              "|---|---|---|---|---|---|---|---|"]
    for age, band in ((27, "25-29"), (32, "30-34"), (37, "35-39"), (47, "45-49"), (52, "50-54")):
        bm95, g95 = bonus_months_from_census(1995, band)
        bm25, g25 = bonus_months_from_census(2025, band)
        a = takehome(g95, bm95, age, 1995)
        b = takehome(g25, bm25, age, 2025)
        t95 = g95 + a["pension"] + a["health"]
        t25 = g25 + b["pension"] + b["health"] + b["care"]
        lines.append(f"| {band} | {man(t95)} | {man(t25)} | {(t25 / t95 - 1) * 100:+.0f}% | {(g25 / g95 - 1) * 100:+.0f}% | "
                     f"{(b['takehome'] / a['takehome'] - 1) * 100:+.0f}% | {a['takehome'] / t95 * 100:.0f}% | {b['takehome'] / t25 * 100:.0f}% |")

    lines += ["", "## 6. はしご：1995年の制度から、1つずつ2025年の制度に置き換える", "",
              "額面は同じ（2025年の同じ年齢の男性の賞与の月数）。上から順に置き換えた手取りと、その段で動いた額。", ""]
    for gross, age, band in ((5000000, 45, "45-49"), (5000000, 38, "35-39"), (5000000, 30, "30-34")):
        bm, _ = bonus_months_from_census(2025, band)
        lines += [f"### 額面{man(gross)}万円・{age}歳（賞与{bm:.1f}か月）", "", "| 段 | 手取り | この段の差 |", "|---|---|---|"]
        prev = None
        for label, d in ladder(gross, bm, age):
            diff = "" if prev is None else f"{(d - prev) / 10000:+.1f}"
            lines.append(f"| {label} | {man(d)} | {diff} |")
            prev = d
        lines.append("")

    lines += ["## 7. 会社が払う総額を物価で直すと", "",
              "| 年齢 | 総額1995（2025年の物価） | 総額2025 | 差 |", "|---|---|---|---|"]
    for age, band in ((27, "25-29"), (32, "30-34"), (37, "35-39"), (47, "45-49"), (52, "50-54")):
        bm95, g95 = bonus_months_from_census(1995, band)
        bm25, g25 = bonus_months_from_census(2025, band)
        a = takehome(g95, bm95, age, 1995)
        b = takehome(g25, bm25, age, 2025)
        t95 = (g95 + a["pension"] + a["health"]) * CPI_2025_PER_1995
        t25 = g25 + b["pension"] + b["health"] + b["care"]
        lines.append(f"| {band} | {man(t95)} | {man(t25)} | {(t25 / t95 - 1) * 100:+.0f}% |")

    global BASIC_2025
    lines += ["", "## 8. 基礎控除の2年間だけの上乗せを除くと（はしごの税の段）", "",
              "| 額面・年齢 | 税の段（上乗せあり） | 税の段（本則） | 手取り2025（本則） |", "|---|---|---|---|"]
    for gross, age, band in ((4000000, 38, "35-39"), (5000000, 38, "35-39"), (5000000, 45, "45-49"), (6000000, 38, "35-39")):
        bm, _ = bonus_months_from_census(2025, band)
        with_top = ladder(gross, bm, age)
        saved, BASIC_2025 = BASIC_2025, BASIC_2025_HONSOKU
        try:
            honsoku = ladder(gross, bm, age)
        finally:
            BASIC_2025 = saved
        lines.append(f"| {man(gross)}・{age} | {(with_top[-1][1] - with_top[-2][1]) / 10000:+.1f} | "
                     f"{(honsoku[-1][1] - honsoku[-2][1]) / 10000:+.1f} | {man(honsoku[-1][1])} |")

    lines += ["", f"## 9. 物価の物差しを替えると（CPI {CPI_2025_PER_1995}倍／家計最終消費支出デフレーター {DEFLATOR_2025_PER_1995}倍）", "",
              "30年前の同い年の手取り（4章）を、2つの物差しで今の物価に直した差。", "",
              "| 年齢 | 名目の差 | CPIで直す | デフレーターで直す |", "|---|---|---|---|"]
    for age, band in ((22, "20-24"), (27, "25-29"), (32, "30-34"), (37, "35-39"), (42, "40-44"),
                      (47, "45-49"), (52, "50-54"), (57, "55-59")):
        bm95, g95 = bonus_months_from_census(1995, band)
        bm25, g25 = bonus_months_from_census(2025, band)
        a = takehome(g95, bm95, age, 1995)["takehome"]
        b = takehome(g25, bm25, age, 2025)["takehome"]
        lines.append(f"| {band} | {(b / a - 1) * 100:+.0f}% | {(b / (a * CPI_2025_PER_1995) - 1) * 100:+.0f}% | "
                     f"{(b / (a * DEFLATOR_2025_PER_1995) - 1) * 100:+.0f}% |")

    with open(os.path.join(HERE, "takehome_result.md"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    with open(os.path.join(HERE, "takehome.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print("\n".join(lines))


if __name__ == "__main__":
    main()
