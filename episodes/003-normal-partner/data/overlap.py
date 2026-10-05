"""「普通」の条件を重ねると100人に何人残るか（仮の試算）。

使い方:  python episodes/003-normal-partner/data/overlap.py
- 条件ごとの「満たす割合」は仮の値（research.md の「仮」の列）。一次資料で確かめたら CONDITIONS を差し替える。
- 条件どうしの重なり方は2通りで比べる。
  独立：満たす割合をそのまま掛ける。
  相関あり：ガウス・コピュラ（正規分布の相関で条件どうしを結ぶ）。相関の強さ rho は仮。
  本番では、就業構造基本調査の表04000（配偶関係×年齢×雇用形態×所得×教育の同時の分布）で、
  年収・正社員・学歴の重なりを直接数える。相関の仮定が要るのは、表にない身長・喫煙だけ。
- 外部ライブラリは使わない（numpy なしで動く）。
"""
import math
import random

N = 200_000
SEED = 4

# (名前, 満たす割合, 相関のグループ)。同じグループどうしだけ相関 rho で結ぶ。仮の値。
CONDITIONS = {
    "女性が挙げる「普通の男性」（25〜34歳の未婚男性から）": [
        ("年収500万円以上", 0.15, "仕事"),
        ("正社員", 0.75, "仕事"),
        ("大卒以上", 0.45, "仕事"),
        ("身長170cm以上", 0.57, "体"),
        ("たばこを吸わない", 0.72, "なし"),
    ],
    "男性が挙げる「普通の女性」（25〜34歳の未婚女性から）": [
        ("29歳以下", 0.55, "なし"),
        ("正社員（共働きできる）", 0.60, "仕事"),
        ("体型が標準（BMI 18.5〜25）", 0.72, "体"),
        ("たばこを吸わない", 0.90, "なし"),
        ("身長が自分より低い（165cm以下）", 0.85, "体"),
    ],
}


def norm_ppf(p):
    """標準正規分布の分位点（二分法。精度は試算に十分）。"""
    lo, hi = -10.0, 10.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if 0.5 * (1 + math.erf(mid / math.sqrt(2))) < p:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def simulate(conds, rho, rng):
    """条件を全部満たす人の割合と、1つだけ外したときの割合を返す。"""
    cut = [norm_ppf(1 - p) for _, p, _ in conds]
    groups = sorted({g for _, _, g in conds if g != "なし"})
    all_ok = 0
    drop_ok = [0] * len(conds)
    for _ in range(N):
        shared = {g: rng.gauss(0, 1) for g in groups}
        ok = []
        for (_, _, g), c in zip(conds, cut):
            if g == "なし":
                z = rng.gauss(0, 1)
            else:
                z = math.sqrt(rho) * shared[g] + math.sqrt(1 - rho) * rng.gauss(0, 1)
            ok.append(z > c)
        if all(ok):
            all_ok += 1
        for i in range(len(conds)):
            if all(o for j, o in enumerate(ok) if j != i):
                drop_ok[i] += 1
    return all_ok / N, [d / N for d in drop_ok]


def main():
    for title, conds in CONDITIONS.items():
        print(f"## {title}")
        indep = 1.0
        print("| 条件 | 満たす割合 | 重ねたあと（独立なら100人中） |")
        print("|---|---:|---:|")
        for name, p, _ in conds:
            indep *= p
            print(f"| {name} | {p:.0%} | {indep * 100:.1f} |")
        for rho in (0.0, 0.3, 0.6):
            share, drops = simulate(conds, rho, random.Random(SEED))
            print(f"\n相関 rho={rho}：全部満たすのは100人中 {share * 100:.1f} 人")
            for (name, _, _), d in zip(conds, drops):
                print(f"  - 「{name}」だけ外すと {d * 100:.1f} 人（{d / share:.1f}倍）" if share else f"  - {name}: {d * 100:.1f}")
        print()


if __name__ == "__main__":
    main()
