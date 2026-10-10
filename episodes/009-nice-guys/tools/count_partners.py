"""内閣府 令和3年度調査（白書 特－38図）の「これまでの恋人の人数」から、偏りを数え直す。
答えたくない等を除いた回答者の中で、0人の割合と、恋人の多い上位の人が恋人の総数の何割を持つかを出す。
15人以上は15人として数える（上位の取り分は少なめに出る＝下限）。
使い方: python -I episodes/009-nice-guys/tools/count_partners.py
"""
import csv, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / "data" / "naikaku_r03_fig_toku38_koibito_date.csv"
rows = list(csv.reader(open(p, encoding="utf-8-sig")))
section = None
for r in rows:
    if r and r[0].startswith("＜"):
        section = r[0]
        continue
    if len(r) > 17 and "/" in r[1]:
        pct = [float(x) for x in r[2:18]]
        tot = sum(pct)
        share = [x / tot for x in pct]           # 回答者の中の割合
        n = list(range(16))                       # 15人以上=15
        total_partners = sum(s * k for s, k in zip(share, n))
        top6 = sum(share[6:]); top6_part = sum(s * k for s, k in zip(share[6:], n[6:])) / total_partners
        top5 = sum(share[5:]); top5_part = sum(s * k for s, k in zip(share[5:], n[5:])) / total_partners
        mean = total_partners
        print(f"{section[:8]} {r[1]:<14} 0人 {share[0]*100:5.1f}%  平均 {mean:4.2f}人  6人以上 {top6*100:4.1f}% が {top6_part*100:4.1f}%  5人以上 {top5*100:4.1f}% が {top5_part*100:4.1f}%  (回答計 {tot:.1f}%)")
