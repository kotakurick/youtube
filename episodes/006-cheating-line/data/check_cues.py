"""場面のコード（scenes/Episode.tsx）で絵を切り替える語が、字幕（timing.json）の1行の中にあるかを確かめる。
字幕の2行にまたがる語は useCue().find で見つからず、予備の時刻（前の区切りの5秒後）で切り替わってしまう（2026-10-06 6本目で起きた）。
    python -I episodes/006-cheating-line/data/check_cues.py
"""
import json, os, re, sys
d = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = json.load(open(os.path.join(d, 'timing.json'), encoding='utf-8'))
src = open(os.path.join(d, 'scenes', 'Episode.tsx'), encoding='utf-8').read()
words = re.findall(r'\["([^"]+)", <', src) + re.findall(r'find\("([^"]+)"', src)
lines = [x[2] for s in t['scenes'] for x in s['lines']]
bad = [w for w in words if not any(w in l for l in lines)]
print(f'切り替えの語 {len(words)} 個', '／見つからない語：' + '、'.join(bad) if bad else '／すべて字幕の1行の中にある')
sys.exit(1 if bad else 0)
