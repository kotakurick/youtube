"""米国 GSS の EVSTRAY（結婚中に配偶者以外と性交したことがあるか）を、性別・年齢・属性ごとに集計する。
research-why.md の [自前計算] の数字はこれで作った。

データ：GSS 1972-2024 累積ファイル（Release 3a）の Stata 版
  https://gss.norc.org/content/dam/gss/get-the-data/documents/stata/GSS_stata.zip （約48MB、展開後600MB。Gitに入れない）
使い方：
  python -I episodes/006-cheating-line/data/gss_evstray.py <gss7224_r3a.dta>   → 同じフォルダに gss_evstray.csv

決まり：
- 分母は「結婚したことがある人」（EVSTRAY 1=はい, 2=いいえ。3=結婚したことがない は除く）
- 重みは wtssps（全年にある事後層化の重み）
- EVSTRAY は 1991〜2022 年に聞かれている（2024 年版には無い）。2021 年はウェブ調査が中心で、方法が違う
"""
import os, sys
import numpy as np
import pandas as pd

COLS = ['year', 'evstray', 'sex', 'age', 'marital', 'divorce', 'attend', 'hapmar',
        'family16', 'degree', 'realinc', 'xmarsex', 'cohort', 'wtssps']
df = pd.read_stata(sys.argv[1], columns=COLS, convert_categoricals=False)
d = df[df.evstray.isin([1, 2])].copy()
d['y'] = (d.evstray == 1).astype(float)
d['性別'] = d.sex.map({1: '男', 2: '女'})
rows = []


def add(table, sub, by, labeler=None):
    for key, g in sub.groupby(by, observed=True):
        key = key if isinstance(key, tuple) else (key,)
        rows.append({'表': table, '区分': ' / '.join(str(labeler(k) if labeler else k) for k in key[:-1]) if len(key) > 1 else '',
                     '性別': key[-1], '経験あり%': round(100 * np.average(g.y, weights=g.wtssps), 1), '人数': len(g)})


d['期間'] = pd.cut(d.year, [1990, 1999, 2009, 2018, 2022], labels=['1991-98', '2000-08', '2010-18', '2021-22'])
d['年齢'] = pd.cut(d.age, [17, 29, 39, 49, 59, 69, 79, 120], labels=['18-29', '30代', '40代', '50代', '60代', '70代', '80+'])
add('期間別', d, ['期間', '性別'])
for lo, hi in [(1991, 2000), (2010, 2022), (2016, 2022)]:
    add(f'年齢別 {lo}-{hi}', d[d.year.between(lo, hi)], ['年齢', '性別'])
add('18-29歳の期間別', d[d['年齢'] == '18-29'], ['期間', '性別'])
add('60代の期間別', d[d['年齢'] == '60代'], ['期間', '性別'])

s = d[d.year >= 2010].copy()
add('2010-22 全体', s.assign(全体='全体'), ['全体', '性別'])
s['生まれ年'] = pd.cut(s.cohort, [1900, 1939, 1949, 1959, 1969, 1979, 1989, 2010],
                     labels=['-1939', '1940年代', '1950年代', '1960年代', '1970年代', '1980年代', '1990年代+'])
add('2010-22 生まれ年別', s, ['生まれ年', '性別'])
s['礼拝'] = pd.cut(s.attend, [-1, 0, 2, 5, 8], labels=['行かない', '年1回以下', '年数回〜月2-3回', 'ほぼ毎週以上'])
add('2010-22 礼拝の頻度別', s, ['礼拝', '性別'])
m = s[(s.marital == 1) & (s.divorce == 2)]
add('2010-22 結婚の幸福度別（現在既婚・離婚歴なし）', m.assign(幸福度=m.hapmar.map({1: 'とても幸せ', 2: 'まあ幸せ', 3: 'あまり幸せでない'})), ['幸福度', '性別'])
add('2010-22 16歳時に両親と同居', s[s.family16.notna()].assign(家庭=lambda x: np.where(x.family16 == 1, '両親と同居', 'それ以外')), ['家庭', '性別'])
add('2010-22 学歴別', s.assign(学歴=s.degree.map({0: '高卒未満', 1: '高卒', 2: '短大', 3: '学士', 4: '大学院'})), ['学歴', '性別'])
q = s[s.realinc.notna()].copy()
q['世帯収入'] = q.groupby('year').realinc.transform(lambda x: pd.qcut(x.rank(method='first'), 4, labels=['下位1/4', '2', '3', '上位1/4']))
add('2010-22 世帯収入（年ごとの4分位）', q, ['世帯収入', '性別'])
add('2010-22 不倫への態度別', s.assign(態度=s.xmarsex.map({1: 'いつも悪い', 2: 'ほとんど悪い', 3: '時々悪い', 4: '全く悪くない'})), ['態度', '性別'])

out = pd.DataFrame(rows)
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gss_evstray.csv')
out.to_csv(p, index=False, encoding='utf-8-sig')
print(out.to_string())
