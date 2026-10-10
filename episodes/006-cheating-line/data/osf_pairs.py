"""公開データ（Kulibert & Thompson 2019、OSF https://osf.io/t7dkp/ ）で、
2人の「浮気の線」が全項目で一致する確率を数える。

元のファイルには MTurk の作業者IDが入っているので Git に入れない。
CSV に直したもの（列名は SPSS のまま）を引数で渡す。結果の集計だけを data/ に書く。

    python -I episodes/006-cheating-line/data/osf_pairs.py <data.csv> [--thr 5]

「浮気だ」＝7段階で thr 以上（既定 5）。異性愛の回答者（SEXORIEN=1）、32項目に欠けのない人。
"""
import argparse, csv, os, random
from collections import Counter
from math import prod

ap = argparse.ArgumentParser()
ap.add_argument('csv')
ap.add_argument('--thr', type=float, default=5)
ap.add_argument('--attn', action='store_true', help='注意の設問（INF_2=2）を通った人だけ')
a = ap.parse_args()

rows = list(csv.DictReader(open(a.csv, encoding='utf-8', errors='replace')))
items = [k for k in rows[0] if k.startswith('DIQ') and k not in ('DIQSEX', 'DIQTECH', 'DIQAFF', 'DIQSOLIT')]
assert len(items) == 32, items
JP12 = ['DIQ_2S', 'DIQ_7S', 'DIQ_23A', 'DIQ_6S', 'DIQ_9T', 'DIQ_14T', 'DIQ_17A',
        'DIQ_15A', 'DIQ_16A', 'DIQ_21A', 'DIQ_19A', 'DIQI_25A']

def num(x):
    try: return float(x)
    except ValueError: return None

def people(sub):
    out = {'M': [], 'W': []}
    for r in sub:
        v = [num(r[i]) for i in items]
        if None in v or r['SEXORIEN'] != '1.0': continue
        if a.attn and r.get('INF_2') != '2.0': continue
        s = {'1.0': 'M', '2.0': 'W'}.get(r['SEX'])
        if s: out[s].append(sum(1 << i for i, x in enumerate(v) if x >= a.thr))
    return out

# 人は32ビットの数（i ビット目＝項目 i を浮気だとした）。同じ並びの人はまとめて数える
def agree_all(A, B, same, idx):
    mask = sum(1 << i for i in idx)
    ca, cb = Counter(x & mask for x in A), Counter(x & mask for x in B)
    n = full = mis = 0
    for x, nx in ca.items():
        for y, ny in cb.items():
            c = nx * ny if not same or x != y else nx * (nx - 1)
            n += c; mis += c * bin(x ^ y).count('1'); full += c * (x == y)
    if same: n, full, mis = n / 2, full / 2, mis / 2
    return full / n, mis / n, int(n)

def share(P, i): return sum((p >> i) & 1 for p in P) / len(P)

conds = {
    'all': rows,
    'partner': [r for r in rows if r['AOMANIP'] == '2.0'],
}
out_dir = os.path.dirname(os.path.abspath(__file__))
summary = []
for cname, sub in conds.items():
    P = people(sub)
    M, W = P['M'], P['W']
    for label, idx in (('32', list(range(32))), ('12', [items.index(k) for k in JP12])):
        for kind, A, B, same in (('男×女', M, W, False), ('男×男', M, M, True), ('女×女', W, W, True)):
            p, mis, n = agree_all(A, B, same, idx)
            summary.append([cname, label, kind, len(M), len(W), n, round(p * 100, 3), round(mis, 2)])
        # 独立と仮定した掛け算（男×女）
        ind = prod(share(M, i) * share(W, i) + (1 - share(M, i)) * (1 - share(W, i)) for i in idx)
        summary.append([cname, label, '男×女（独立と仮定した掛け算）', len(M), len(W), '', round(ind * 100, 5), ''])

with open(os.path.join(out_dir, 'osf_pairs_summary.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['条件', '項目数', '組み合わせ', '男の人数', '女の人数', '組の数', '全項目一致(%)', '食い違う項目数の平均'])
    w.writerows(summary)

# 項目ごと（パートナーの行動の条件）：浮気だとした割合と、男女の組で食い違う確率
P = people(conds['partner']); M, W = P['M'], P['W']
per = []
for i, k in enumerate(items):
    pm, pw = share(M, i), share(W, i)
    per.append([k, round(pm * 100, 1), round(pw * 100, 1),
                round((pm * (1 - pw) + (1 - pm) * pw) * 100, 1),
                round(2 * pm * (1 - pm) * 100, 1), round(2 * pw * (1 - pw) * 100, 1)])
with open(os.path.join(out_dir, 'osf_items_partner.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['項目', '男 浮気だ(%)', '女 浮気だ(%)', '男×女で食い違う確率(%)', '男×男(%)', '女×女(%)'])
    w.writerows(per)

# ミクロ：k 項目だけ2人で「そろえた」とき、残りで全項目一致する確率（男×女、全条件）
# そろえる項目は (a) 食い違いやすい順 (b) 無作為（50回の平均）
P = people(rows); M, W = P['M'], P['W']
mis_rate = []
for i in range(32):
    pm, pw = share(M, i), share(W, i)
    mis_rate.append((pm * (1 - pw) + (1 - pm) * pw, i))
order = [i for _, i in sorted(mis_rate, reverse=True)]
rng = random.Random(6)
talk = []
for k in (0, 1, 2, 3, 5, 8, 12, 16, 24, 32):
    rest = order[k:]
    p_top, _, _ = agree_all(M, W, False, rest) if rest else (1.0, 0, 0)
    pr = []
    for _ in range(50 if 0 < k < 32 else 1):
        aligned = set(rng.sample(range(32), k))
        rest_r = [i for i in range(32) if i not in aligned]
        pr.append(agree_all(M, W, False, rest_r)[0] if rest_r else 1.0)
    talk.append([k, round(p_top * 100, 2), round(sum(pr) / len(pr) * 100, 2)])
with open(os.path.join(out_dir, 'osf_talk.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['そろえた項目数', '食い違いやすい順にそろえた(%)', '無作為にそろえた(%)'])
    w.writerows(talk)
print('食い違いやすい順:', [items[i] for i in order[:8]])
for r in summary: print(r)
for r in talk: print(r)
