"""浮気の線（32項目のうち「浮気だ」＝5以上とした数）が、どの要素で動くか。公開データ（S8 と同じ）。
要素：誰の行動か（自分・パートナー・他人。無作為に割り当てた実験条件）、自分の浮気の経験（INFEXP）、性別、年齢、交際の満足度、交際の長さ。
    python -I episodes/006-cheating-line/data/osf_factors.py <data.csv>  → osf_factors.csv
"""
import csv, os, random, sys, statistics as st
rows = list(csv.DictReader(open(sys.argv[1], encoding='utf-8', errors='replace')))
items = [k for k in rows[0] if k.startswith('DIQ') and k not in ('DIQSEX', 'DIQTECH', 'DIQAFF', 'DIQSOLIT')]
def num(x):
    try: return float(x)
    except ValueError: return None
P = []
for r in rows:
    v = [num(r[i]) for i in items]
    if None in v: continue
    P.append(dict(n=sum(x >= 5 for x in v), mean=sum(v) / 32, cond={'1.0': '自分の行動', '2.0': 'パートナーの行動', '3.0': '他人の行動'}.get(r['AOMANIP']),
                  sex={'1.0': '男', '2.0': '女'}.get(r['SEX']), age=num(r['AGE']), inf=num(r['INFEXP']), sat=num(r['ROMSAT']), len_=num(r['RELLENGT'])))
rng = random.Random(6)
def ci(xs):
    bs = sorted(st.mean(rng.choice(xs) for _ in xs) for _ in range(1000)); return round(bs[25], 1), round(bs[974], 1)
out = []
def add(factor, level, sub):
    xs = [p['n'] for p in sub]
    if len(xs) >= 10: out.append([factor, level, len(xs), round(st.mean(xs), 1), ci(xs)])
for c in ('自分の行動', 'パートナーの行動', '他人の行動'): add('誰の行動か', c, [p for p in P if p['cond'] == c])
for c in ('自分の行動', 'パートナーの行動'):
    for s in ('男', '女'): add('誰の行動か×性別', f'{c}・{s}', [p for p in P if p['cond'] == c and p['sex'] == s])
add('自分の浮気の経験', '0人', [p for p in P if p['inf'] == 0])
add('自分の浮気の経験', '1人以上', [p for p in P if p['inf'] is not None and p['inf'] >= 1])
add('自分の浮気の経験', '3人以上', [p for p in P if p['inf'] is not None and p['inf'] >= 3])
for s in ('男', '女'): add('性別', s, [p for p in P if p['sex'] == s])
for lo, hi in ((18, 29), (30, 39), (40, 49), (50, 99)): add('年齢', f'{lo}〜{hi}', [p for p in P if p['age'] and lo <= p['age'] <= hi])
for v, l in ((1, 'まったく'), (2, '少し'), (3, 'まあまあ'), (4, 'とても')): add('交際の満足度', l, [p for p in P if p['sat'] == v])
for lo, hi, l in ((0, 11, '1年未満'), (12, 59, '1〜5年'), (60, 9999, '5年以上')): add('交際の長さ', l, [p for p in P if p['len_'] is not None and lo <= p['len_'] <= hi])
# 浮気の経験の割合（1人以上）
exp = []
for name, f in (('男', lambda p: p['sex'] == '男'), ('女', lambda p: p['sex'] == '女'),
                ('満足度 とても', lambda p: p['sat'] == 4), ('満足度 まあまあ以下', lambda p: p['sat'] in (1, 2, 3)),
                ('18〜29歳', lambda p: p['age'] and p['age'] < 30), ('30歳以上', lambda p: p['age'] and p['age'] >= 30)):
    sub = [p for p in P if f(p) and p['inf'] is not None]
    if sub: exp.append(['浮気の経験1人以上の割合', name, len(sub), round(sum(p['inf'] >= 1 for p in sub) / len(sub) * 100, 1), ''])
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'osf_factors.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['要素', '水準', '人数', '浮気だとした項目の数（32項目の平均）／割合(%)', '95%区間'])
    w.writerows(out + exp)
for o in out + exp: print(o)
