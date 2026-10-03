"""bench-analyst が書いた動画ごとの JSON をまとめ、どの型が伸びているかを表にする。

使い方:
    python bench/aggregate.py --out research/benchmark/aggregate.md

入力:  research/benchmark/videos/*.json と $YT_DATA_DIR/bench/<チャンネル>/<ID>/prep/meta.json
指標:  「チャンネル内倍率」＝ その動画の1日あたり再生数 ÷ 同じチャンネルの中央値。
       チャンネルの規模の差を消して、型どうしを比べるため。
"""
import argparse
import json
import statistics
from pathlib import Path

from analyze import BENCH, REPO, fmt, spearman

VIDEOS = REPO / "research/benchmark/videos"
CATEGORIES = ["topic", "title_type", "hook_type", "ending_type", "source_on_screen"]
LISTS = ["source_kinds", "chart_types", "policy_flags"]
NUMBERS = ["first_chart_sec", "n_sources", "surprise_sec"]


def load() -> list[dict]:
    rows = []
    for p in sorted(VIDEOS.glob("*.json")):
        a = json.loads(p.read_text(encoding="utf-8"))
        meta_path = BENCH / a["channel"] / a["id"] / "prep" / "meta.json"
        if not meta_path.exists():
            continue
        a["_meta"] = json.loads(meta_path.read_text(encoding="utf-8"))
        rows.append(a)
    by_ch: dict[str, list[float]] = {}
    for r in rows:
        v = r["_meta"].get("views_per_day")
        if v is not None:
            by_ch.setdefault(r["channel"], []).append(v)
    for r in rows:
        v, base = r["_meta"].get("views_per_day"), statistics.median(by_ch.get(r["channel"]) or [0])
        r["_ratio"] = round(v / base, 2) if v is not None and base else None
    return rows


def table(rows: list[dict], key: str, is_list: bool) -> list[str]:
    groups: dict[str, list[float]] = {}
    for r in rows:
        vals = (r.get(key) or []) if is_list else [r.get(key)]
        for v in vals:
            if v is not None and r["_ratio"] is not None:
                groups.setdefault(str(v), []).append(r["_ratio"])
    out = [f"### {key}", "", "| 値 | 本数 | チャンネル内倍率（中央値） |", "|---|---:|---:|"]
    for k, vs in sorted(groups.items(), key=lambda kv: -statistics.median(kv[1])):
        out.append(f"| {k} | {len(vs)} | {statistics.median(vs):.2f} |")
    return out + [""]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()

    rows = load()
    if not rows:
        raise SystemExit(f"分析済みの JSON がありません: {VIDEOS}")
    md = [f"# 型ごとの伸び方（{len(rows)}本）", "",
          "倍率1.0がそのチャンネルの中央値。本数が少ない行は偶然の可能性が高いので、3本未満は参考程度に見る。", ""]
    for k in CATEGORIES:
        md += table(rows, k, False)
    for k in LISTS:
        md += table(rows, k, True)
    md += ["### 数値の項目と倍率の順位相関", "", "| 項目 | 相関 |", "|---|---:|"]
    for k in NUMBERS:
        md.append(f"| {k} | {fmt(spearman([r.get(k) for r in rows], [r['_ratio'] for r in rows]), 2)} |")
    for k in ["stick_figure", "flat_person", "character", "chart", "text_only", "ai_or_photo"]:
        xs = [(r.get("visual_mix") or {}).get(k) for r in rows]
        md.append(f"| visual_mix.{k} | {fmt(spearman(xs, [r['_ratio'] for r in rows]), 2)} |")
    text = "\n".join(md) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
