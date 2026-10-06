"""日本の民間調査（項目ごと・男女別の「浮気だと思う」割合）から、
無作為に選んだ2人が項目ごとに食い違う確率を計算する。jp_items.csv → jp_mismatch.csv

食い違う確率＝ p1(1-p2) + (1-p1)p2。項目どうしは独立と仮定（全項目の一致は過小に出る。
公開データでは実際の一致は掛け算の数十〜数百倍。osf_pairs_summary.csv）。
注意：どちらの調査も複数回答。選ばなかった＝浮気ではない、とは限らない。
    python -I episodes/006-cheating-line/data/jp_mismatch.py
"""
import csv, os
from math import prod
d = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(d, 'jp_items.csv'), encoding='utf-8-sig')))
def mis(p, q): return p * (1 - q) + (1 - p) * q
out = []
for r in rows:
    m, w = float(r['男(%)']) / 100, float(r['女(%)']) / 100
    out.append([r['調査'], r['項目'], r['男(%)'], r['女(%)'],
                round(mis(m, w) * 100, 1), round(mis(m, m) * 100, 1), round(mis(w, w) * 100, 1)])
for s in ('raison2025', 'albona2023'):
    sub = [r for r in rows if r['調査'] == s]
    for kind, f in (('男×女', lambda m, w: mis(m, w)), ('男×男', lambda m, w: mis(m, m)), ('女×女', lambda m, w: mis(w, w))):
        p = prod(1 - f(float(r['男(%)']) / 100, float(r['女(%)']) / 100) for r in sub)
        out.append([s, f'全{len(sub)}項目が一致（独立と仮定）{kind}', '', '', round(p * 100, 3), '', ''])
with open(os.path.join(d, 'jp_mismatch.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['調査', '項目', '男(%)', '女(%)', '男×女で食い違う(%)', '男×男(%)', '女×女(%)'])
    w.writerows(out)
for o in out: print(o)
