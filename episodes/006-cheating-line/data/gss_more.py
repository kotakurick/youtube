"""gss_evstray.py の続き（台本第1稿のレビューで足した計算。2026-10-06）。同じ集団（いま既婚・離婚歴なし、2010–22）での男女差、幸福度ごとの男女差、浮気経験者の幸福度の内訳、同じ60代での年代比較。
    python -I episodes/006-cheating-line/data/gss_more.py <gss7224_r3a.dta>   （結果は標準出力。sources.csv の S17 に写した）
"""
import sys, numpy as np, pandas as pd
df = pd.read_stata(sys.argv[1], columns=['year','evstray','sex','marital','divorce','hapmar','age','cohort','wtssps'], convert_categoricals=False)
d = df[df.evstray.isin([1,2]) & (df.year>=2010)].copy(); d['y']=(d.evstray==1).astype(float)
w=lambda g: round(100*np.average(g.y,weights=g.wtssps),1)
m = d[(d.marital==1)&(d.divorce==2)&d.hapmar.isin([1,2,3])]
print('現在既婚・離婚歴なし 男女', w(m[m.sex==1]), w(m[m.sex==2]), len(m))
for h in (1,2,3):
    g=m[m.hapmar==h]; print('幸福度',h,'男',w(g[g.sex==1]),'女',w(g[g.sex==2]))
c=m[m.y==1]; tot=c.wtssps.sum()
print('浮気経験者の幸福度の内訳(%)', {h: round(100*c[c.hapmar==h].wtssps.sum()/tot,1) for h in (1,2,3)}, '人数', len(c))
print('全体の幸福度の内訳(%)', {h: round(100*m[m.hapmar==h].wtssps.sum()/m.wtssps.sum(),1) for h in (1,2,3)})
# all ever-married, happiness only for currently married
for lo,hi in ((60,69),):
  for y0,y1 in ((1991,2000),(2010,2022)):
    g=df[df.evstray.isin([1,2])&df.year.between(y0,y1)&df.age.between(lo,hi)].copy(); g['y']=(g.evstray==1).astype(float)
    print('60代',y0,y1,'男',w(g[g.sex==1]),'女',w(g[g.sex==2]))
