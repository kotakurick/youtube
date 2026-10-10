"""絵コンテ（scenes/Storyboard.tsx）の場面ごとの秒数（sec）を、timing.json（仮通し）の文の時刻から入れ直す。
場面の lines（最初の文の頭）を、timing の字幕の行から順に探し、次の場面の頭までを秒数にする。章の扉（2.8秒）は含めない。
    python -I episodes/007-data-leaks/data/sb_secs.py
"""
import json, os, re
d = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = json.load(open(os.path.join(d, 'timing.json'), encoding='utf-8'))
rows, off = [], 0.0
for sc in t['scenes']:
    for a, b, txt in sc['lines']:
        rows.append((off + a, off + b, txt))
    off += sc['seconds']
end = off
p = os.path.join(d, 'scenes', 'Storyboard.tsx')
src = open(p, encoding='utf-8').read()
pat = re.compile(r'(\{ (?:key: "\w+", )?title: "([^"]*)", C: S\w+, sec: )([\d.]+)(, lines: ")([^"]*)(")')
ms = list(pat.finditer(src))
norm = lambda s: re.sub(r'〔[^〕]*〕|[「」？?！。、\s]', '', s)
starts, i = [], 0
for m in ms:
    key = norm(m.group(5))[:8]
    while i < len(rows) and not norm(''.join(r[2] for r in rows[i:i + 2])).startswith(key):
        i += 1
    if i >= len(rows) and m is ms[-1]:
        starts.append(end); break  # 締めのひと言（字幕なし）は timing にない
    if i >= len(rows):
        raise SystemExit(f'見つからない：{m.group(2)} {m.group(5)}')
    starts.append(rows[i][0]); i += 1
secs = [round((starts[k + 1] if k + 1 < len(starts) else end) - starts[k], 1) for k in range(len(starts))]
secs[-1] = 5  # 締めのひと言
out, last = [], 0
for m, s in zip(ms, secs):
    out.append(src[last:m.start()]); out.append(f'{m.group(1)}{s}{m.group(4)}{m.group(5)}{m.group(6)}'); last = m.end()
out.append(src[last:])
open(p, 'w', encoding='utf-8').write(''.join(out))
for m, s in zip(ms, secs):
    print(m.group(2), s, '⚠' if s > 30 else '')
print('合計', round(sum(secs), 1), '秒')
