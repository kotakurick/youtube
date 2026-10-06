"""百人の町のシミュレーション（第1章）。延べの漏えいを配ったとき、何回漏れた人が何人いるか。

条件（概要欄と画面の表に出す）
- 配る点の数：上場企業の公表分の延べ2億1,313万人分（S11）÷ 人口1億2,265万人（S2）≒ 1.74 → 百人で約170個
- 町1：だれにでも同じ確率で点が付く（ポアソン分布、平均1.7）
- 町2：点は使っているサービスの数に比例して付く。百人を3つの層に分ける
  （ヤフー 2022年の調べ「ログインするサービス 1〜10個 59.6%、11〜20個 18.2%、それ以上 15.6%」に近い形。
   百人は64・19・17人（3区分の合計93.4%を100に割り直した）。層の代表値は 5個・15個・30個。平均は約11個で、トレンドマイクロ 2023年の平均14サービスに近い）
使い方: python data/town_sim.py
"""
from math import exp, factorial

TOTAL = 213_130_000 / 122_650_000   # 1人あたりの延べ回数


def pois(lam, k):
    return exp(-lam) * lam ** k / factorial(k)


def row(name, people, lam):
    p0 = pois(lam, 0)
    p3 = 1 - sum(pois(lam, k) for k in range(3))
    return name, people, lam, people * p0, people * p3


def main():
    print(f"1人あたりの延べ回数 {TOTAL:.2f}（百人で {TOTAL*100:.0f} 個）")
    t1 = row("町1 全員", 100, TOTAL)
    print(f"町1：0回 {t1[3]:.1f}人、3回以上 {t1[4]:.1f}人")
    # 59.6・18.2・15.6%（合計93.4%）を100人に割り直した
    layers = [("少ない（5個）", 64, 5), ("ふつう（15個）", 19, 15), ("多い（30個）", 17, 30)]
    mean = sum(p * n for _, p, n in layers) / 100
    z = th = 0
    for name, p, n in layers:
        r = row(name, p, TOTAL * n / mean)
        z += r[3]; th += r[4]
        print(f"町2 {name}：{p}人、平均{r[2]:.2f}回、0回 {r[3]:.1f}人、3回以上 {r[4]:.1f}人")
    print(f"町2 合計：0回 {z:.1f}人、3回以上 {th:.1f}人（サービスの平均 {mean:.0f}個）")


if __name__ == "__main__":
    main()
