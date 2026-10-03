"""同じチャンネルの中で、伸びた動画と伸びなかった動画を比べる。

使い方:
    python bench/within.py --out research/benchmark/within.md

考え方:
    チャンネルの規模・絵柄・声・時期をそろえるため、同じチャンネルの中だけで比べる。
    チャンネル自体が伸びていく途中なので、再生数そのものではなく「近所比」を使う：
    その動画の再生数 ÷ 投稿日の前後5本ずつ（自分を除く）の再生数の中央値。
    近所比の上位25%を「ヒット」、下位25%を「不発」として、bench-analyst の判定とタイトルの特徴を比べる。
    公開から14日未満の動画は除く。
"""
import argparse
import json
import re
import statistics
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path

from analyze import BENCH, REPO

VIDEOS = REPO / "research/benchmark/videos"
CHANNELS = ["kangaesugiruashi", "DataStickFigure", "lovebynumbers"]
NEIGHBORS = 5
MIN_AGE = 14
CATEGORICAL = ["topic", "title_type", "hook_type", "ending_type", "source_on_screen"]
LISTS = ["policy_flags", "chart_types", "source_kinds"]
WORDS = ["男", "女", "恋愛", "結婚", "お金", "年収", "日本", "人生", "残酷", "脳", "心理"]


def load(ch: str) -> list[dict]:
    rows = []
    for m in (BENCH / ch).glob("*/prep/meta.json"):
        meta = json.loads(m.read_text(encoding="utf-8"))
        if not meta.get("upload_date") or meta.get("views") is None:
            continue
        if (date.today() - date.fromisoformat(meta["upload_date"])).days < MIN_AGE:
            continue
        j = VIDEOS / f"{ch}-{meta['id']}.json"
        a = json.loads(j.read_text(encoding="utf-8")) if j.exists() else {}
        rows.append({**meta, "a": a})
    rows.sort(key=lambda r: r["upload_date"])
    for i, r in enumerate(rows):
        near = [x["views"] for x in rows[max(0, i - NEIGHBORS):i] + rows[i + 1:i + 1 + NEIGHBORS]]
        r["ratio"] = r["views"] / statistics.median(near) if near and statistics.median(near) else None
    return [r for r in rows if r["ratio"] is not None]


def title_features(t: str) -> dict:
    t = unicodedata.normalize("NFKC", t)  # 「せ」＋濁点のように分かれた文字をそろえる
    return {
        "タイトルの文字数": len(t),
        "数字がある": bool(re.search(r"[0-9０-９]", t)),
        "【】がある": "【" in t,
        "？がある": bool(re.search(r"[?？]", t)),
        "「」がある": "「" in t,
        "なぜ・なのかで始まる/含む": bool(re.search(r"なぜ|なのか", t)),
        **{f"「{w}」を含む": w in t for w in WORDS},
    }


def share(rs: list[dict], pred) -> float:
    return sum(1 for r in rs if pred(r)) / len(rs) if rs else 0.0


def section(ch: str, rows: list[dict]) -> list[str]:
    rows = sorted(rows, key=lambda r: -r["ratio"])
    q = max(len(rows) // 4, 2)
    hit, flop = rows[:q], rows[-q:]
    md = [f"## {ch}（{len(rows)}本、ヒット・不発 各{q}本）", "",
          f"近所比の中央値：ヒット {statistics.median(r['ratio'] for r in hit):.2f}、"
          f"不発 {statistics.median(r['ratio'] for r in flop):.2f}", "",
          "### 数値", "", "| 項目 | ヒット | 不発 |", "|---|---:|---:|"]
    nums = {
        "長さ（分）": lambda r: (r.get("duration_sec") or 0) / 60,
        "出典の数": lambda r: r["a"].get("n_sources"),
        "最初のグラフ（秒）": lambda r: r["a"].get("first_chart_sec"),
        "いちばん意外な事実（秒）": lambda r: r["a"].get("surprise_sec"),
        "場面転換の回数": lambda r: r.get("scene_cuts"),
    }
    for label, f in nums.items():
        a = [v for v in map(f, hit) if isinstance(v, (int, float))]
        b = [v for v in map(f, flop) if isinstance(v, (int, float))]
        if a and b:
            md.append(f"| {label} | {statistics.median(a):.1f} | {statistics.median(b):.1f} |")
    md += ["", "### タイトル", "", "| 特徴 | ヒット | 不発 | 差 |", "|---|---:|---:|---:|"]
    feats = []
    for k in title_features("").keys():
        if k == "タイトルの文字数":
            a = statistics.median(len(r["title"]) for r in hit)
            b = statistics.median(len(r["title"]) for r in flop)
            md.append(f"| {k}（中央値） | {a:.0f} | {b:.0f} | {a - b:+.0f} |")
            continue
        a = share(hit, lambda r: title_features(r["title"])[k])
        b = share(flop, lambda r: title_features(r["title"])[k])
        feats.append((abs(a - b), f"| {k} | {a:.0%} | {b:.0%} | {a - b:+.0%} |"))
    md += [line for _, line in sorted(feats, reverse=True)]
    md += ["", "### 判定（bench-analyst）", "", "| 項目 | 値 | ヒット | 不発 | 差 |", "|---|---|---:|---:|---:|"]
    cat = []
    for k in CATEGORICAL:
        vals = Counter(r["a"].get(k) for r in hit + flop if r["a"].get(k))
        for v in vals:
            a = share(hit, lambda r: r["a"].get(k) == v)
            b = share(flop, lambda r: r["a"].get(k) == v)
            cat.append((abs(a - b), f"| {k} | {v} | {a:.0%} | {b:.0%} | {a - b:+.0%} |"))
    for k in LISTS:
        vals = Counter(x for r in hit + flop for x in (r["a"].get(k) or []))
        for v in vals:
            a = share(hit, lambda r: v in (r["a"].get(k) or []))
            b = share(flop, lambda r: v in (r["a"].get(k) or []))
            cat.append((abs(a - b), f"| {k} | {v} | {a:.0%} | {b:.0%} | {a - b:+.0%} |"))
    md += [line for d, line in sorted(cat, reverse=True) if d >= 0.15]
    md += ["", "### ヒット（近所比の高い順）", "", "| 近所比 | 再生数 | 投稿日 | タイトル |", "|---:|---:|---|---|"]
    md += [f"| {r['ratio']:.2f} | {r['views']:,} | {r['upload_date']} | {r['title'].replace('|', '｜')} |" for r in hit]
    md += ["", "### 不発（近所比の低い順）", "", "| 近所比 | 再生数 | 投稿日 | タイトル |", "|---:|---:|---|---|"]
    md += [f"| {r['ratio']:.2f} | {r['views']:,} | {r['upload_date']} | {r['title'].replace('|', '｜')} |"
           for r in reversed(flop)]
    return md + [""]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    md = [f"# 同じチャンネルの中のヒットと不発（{date.today().isoformat()}）", "",
          f"近所比＝その動画の再生数 ÷ 前後{NEIGHBORS}本ずつの再生数の中央値。上位25%をヒット、下位25%を不発とした。",
          "判定の表は差が15ポイント以上の行だけ。1チャンネルの中の比較なので本数が少なく、偶然の差も混じる。", ""]
    for ch in CHANNELS:
        rows = load(ch)
        if len(rows) >= 8:
            md += section(ch, rows)
    text = "\n".join(md) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
