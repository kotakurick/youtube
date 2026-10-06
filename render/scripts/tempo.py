# 仮通し（docs/process.md の11）のテンポのチェック。絵コンテを2秒ごとに撮った静止画から、絵が止まっている所を探す。
#   cd render && npm run storyboard -- <回のid> --every 2
#   python scripts/tempo.py <回のid>
# 隣り合う静止画の差（字幕の帯から下は除く）が小さいまま続く区間を「止まっている」とみなし、
#   20秒以上 → 直す（場面転換は10〜20秒ごと。CLAUDE.md）
#   12秒以上 → 確かめる
# を書き出す。差は ImageMagick の compare（RMSE）。結果は out/storyboard/<回のid>/tempo.md。
import re
import subprocess
import sys
from pathlib import Path

STILL = 0.012   # これより小さい差は「動いていない」
FIX, WARN = 20, 12

ep = sys.argv[1]
d = Path(__file__).resolve().parent.parent / "out" / "storyboard" / ep
shots = []
for p in sorted(d.glob("*.png")):
    m = re.match(r"\d+-(.+)-(\d+)m(\d+)\.png$", p.name)
    if m:
        shots.append((int(m[2]) * 60 + int(m[3]), m[1], p))
if len(shots) < 3:
    sys.exit("静止画が足りません。先に npm run storyboard -- <回のid> --every 2 を走らせてください")


def diff(a: Path, b: Path) -> float:
    # 字幕の帯（y 900〜）より上だけを比べる（静止画は半分の大きさ）
    r = subprocess.run(["compare", "-metric", "RMSE", f"{a}[960x445+0+0]", f"{b}[960x445+0+0]", "null:"],
                       capture_output=True, text=True)
    m = re.search(r"\(([\d.e-]+)\)", r.stderr)
    return float(m[1]) if m else 1.0


runs, start = [], 0
for i in range(1, len(shots)):
    moving = diff(shots[i - 1][2], shots[i][2]) >= STILL
    if moving:
        if shots[i - 1][0] - shots[start][0] >= WARN:
            runs.append((shots[start], shots[i - 1]))
        start = i
if shots[-1][0] - shots[start][0] >= WARN:
    runs.append((shots[start], shots[-1]))

fmt = lambda s: f"{s // 60}:{s % 60:02d}"
lines = [f"# テンポのチェック：{ep}", "", f"{len(shots)}枚（2秒ごと）。絵がほぼ止まっている区間（字幕は除く）。20秒以上は直す、12秒以上は確かめる。", ""]
nfix = 0
for a, b in runs:
    sec = b[0] - a[0]
    level = "直す" if sec >= FIX else "確かめる"
    nfix += level == "直す"
    lines.append(f"- 【{level}】{fmt(a[0])}〜{fmt(b[0])}（{sec}秒）{a[1]}{'' if a[1] == b[1] else ' → ' + b[1]}（{a[2].name}）")
if not runs:
    lines.append("止まっている区間はありません。")
(d / "tempo.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines[2:]))
print(f"\n→ {d / 'tempo.md'}（直すもの {nfix}件）")
