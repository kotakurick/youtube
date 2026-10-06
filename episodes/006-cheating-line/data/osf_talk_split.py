"""ミクロの計算（osf_talk.csv）の確かめ：食い違いやすい項目を半分の人で選び、残り半分の人で一致率を測る（20回の平均）。
    python -I episodes/006-cheating-line/data/osf_talk_split.py <data.csv>  → osf_talk_split.csv
"""
import csv, os, random, sys
from collections import Counter
rows = list(csv.DictReader(open(sys.argv[1], encoding='utf-8', errors='replace')))
items = [k for k in rows[0] if k.startswith('DIQ') and k not in ('DIQSEX', 'DIQTECH', 'DIQAFF', 'DIQSOLIT')]
def num(x):
    try: return float(x)
    except ValueError: return None
M, W = [], []
for r in rows:
    v = [num(r[i]) for i in items]
    if None in v or r['SEXORIEN'] != '1.0': continue
    b = sum(1 << i for i, x in enumerate(v) if x >= 5)
    (M if r['SEX'] == '1.0' else W if r['SEX'] == '2.0' else []).append(b)
share = lambda P, i: sum((p >> i) & 1 for p in P) / len(P)
def agree(A, B, idx):
    mask = sum(1 << i for i in idx); ca, cb = Counter(x & mask for x in A), Counter(x & mask for x in B)
    return sum(ca[k] * cb[k] for k in ca) / (len(A) * len(B))
rng = random.Random(6); K = (0, 3, 8); acc = {k: [0, 0] for k in K}; R = 20
for _ in range(R):
    m, w = M[:], W[:]; rng.shuffle(m); rng.shuffle(w)
    m1, m2, w1, w2 = m[:len(m)//2], m[len(m)//2:], w[:len(w)//2], w[len(w)//2:]
    order = sorted(range(32), key=lambda i: -(share(m1, i) * (1 - share(w1, i)) + (1 - share(m1, i)) * share(w1, i)))
    for k in K:
        acc[k][0] += agree(m2, w2, order[k:])
        acc[k][1] += sum(agree(m2, w2, [i for i in range(32) if i not in set(rng.sample(range(32), k))]) for _ in range(20)) / 20
out = [[k, round(a / R * 100, 2), round(b / R * 100, 2)] for k, (a, b) in acc.items()]
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'osf_talk_split.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    wr = csv.writer(f); wr.writerow(['そろえた項目数', '食い違いやすい順（別の半分で選んだ）(%)', '無作為(%)']); wr.writerows(out)
print(out)
