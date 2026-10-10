"""osf_pairs.py の続き（構成案のライバル役の指摘で足した計算）。
1) 男女・男男・女女の一致率と食い違う項目数の、人を選び直すブートストラップの95%区間
2) 「性別で線が決まる世界」：男は全員が男の多数派の並び、女は全員が女の多数派の並び、としたときの食い違う項目数
3) 項目ごとの男×男・女×女の食い違う確率の差と、その95%区間（全条件）
4) 自分の線の位置（浮気だとした項目の数）ごとの、無作為の異性との全項目一致率
    python -I episodes/006-cheating-line/data/osf_more.py <data.csv>   → osf_more_*.csv
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
    if r['SEX'] == '1.0': M.append(b)
    elif r['SEX'] == '2.0': W.append(b)
pc = lambda x: bin(x).count('1')
def stats(A, B, same):
    ca, cb = Counter(A), Counter(B); n = full = mis = 0
    for x, nx in ca.items():
        for y, ny in cb.items():
            c = nx * ny if not same or x != y else nx * (nx - 1)
            n += c; mis += c * pc(x ^ y); full += c * (x == y)
    return full / n * 100, mis / n
d = os.path.dirname(os.path.abspath(__file__))
rng = random.Random(6)
B = 1000
res = {k: [] for k in ('男×女', '男×男', '女×女', '差 男男−男女', '差 女女−男女')}
def boot_same(P):
    # 同じ人を2回引いたときの「自分どうしの組」は数えない
    idx = Counter(rng.randrange(len(P)) for _ in P)
    ca = Counter()
    for i, c in idx.items(): ca[P[i]] += c
    n = full = mis = 0
    for x, nx in ca.items():
        for y, ny in ca.items():
            c = nx * ny if x != y else nx * (nx - 1)
            n += c; mis += c * pc(x ^ y); full += c * (x == y)
    self_pairs = sum(c * (c - 1) for c in idx.values())
    n -= self_pairs; full -= self_pairs
    return full / n * 100, mis / n, [P[i] for i, c in idx.items() for _ in range(c)]
for _ in range(B):
    b0, b1, m = boot_same(M); c0, c1, w = boot_same(W)
    a, b, c = stats(m, w, False), (b0, b1), (c0, c1)
    res['男×女'].append(a); res['男×男'].append(b); res['女×女'].append(c)
    res['差 男男−男女'].append((b[0] - a[0], b[1] - a[1])); res['差 女女−男女'].append((c[0] - a[0], c[1] - a[1]))
def ci(xs):
    xs = sorted(xs); return round(xs[int(.025 * len(xs))], 3), round(xs[int(.975 * len(xs)) - 1], 3)
pt = {'男×女': stats(M, W, False), '男×男': stats(M, M, True), '女×女': stats(W, W, True)}
with open(os.path.join(d, 'osf_more_ci.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['組み合わせ', '全32項目一致(%)', '95%区間', '食い違う項目数の平均', '95%区間'])
    for k, v in res.items():
        p = pt.get(k, (None, None))
        w.writerow([k, round(p[0], 3) if p[0] is not None else '', ci([x[0] for x in v]), round(p[1], 2) if p[1] is not None else '', ci([x[1] for x in v])])
# 2) 性別で線が決まる世界
share = lambda P, i: sum((p >> i) & 1 for p in P) / len(P)
mmaj = [share(M, i) >= .5 for i in range(32)]; wmaj = [share(W, i) >= .5 for i in range(32)]
diff_items = [items[i] for i in range(32) if mmaj[i] != wmaj[i]]
# 3) 項目ごと
per = []
for i, k in enumerate(items):
    def mm(P): p = share(P, i); return 2 * p * (1 - p)
    bs = []
    for _ in range(B):
        m = [rng.choice(M) for _ in M]; w_ = [rng.choice(W) for _ in W]
        bs.append(mm(m) - mm(w_))
    pm, pw = share(M, i), share(W, i)
    per.append([k, round(pm * 100, 1), round(pw * 100, 1), round((pm * (1 - pw) + (1 - pm) * pw) * 100, 1),
                round(mm(M) * 100, 1), round(mm(W) * 100, 1), round((mm(M) - mm(W)) * 100, 1),
                tuple(round(x * 100, 1) for x in ci(bs))])
with open(os.path.join(d, 'osf_more_items.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['項目', '男 浮気だ(%)', '女 浮気だ(%)', '男×女 食い違う(%)', '男×男(%)', '女×女(%)', '男男−女女(ポイント)', '95%区間'])
    w.writerows(per)
# 4) 自分の線の位置ごと
groups = {}
for sex, P, O in (('男', M, W), ('女', W, M)):
    co = Counter(O)
    for x in P:
        k = pc(x)
        band = '0〜8' if k <= 8 else '9〜12' if k <= 12 else '13〜16' if k <= 16 else '17〜20' if k <= 20 else '21〜32'
        g = groups.setdefault((sex, band), [0, 0.0])
        g[0] += 1; g[1] += co[x] / len(O)
with open(os.path.join(d, 'osf_more_position.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['性別', '浮気だとした項目の数', '人数', '無作為の異性と32項目すべて一致(%)'])
    for (s, b), (n, t) in sorted(groups.items()):
        w.writerow([s, b, n, round(t / n * 100, 2)])
print('性別で決まる世界：男女の多数派が違う項目', len(diff_items), diff_items)
for f_ in ('osf_more_ci.csv', 'osf_more_position.csv'):
    print(open(os.path.join(d, f_), encoding='utf-8-sig').read())
