"""ベンチマーク取得物を集計する（標準ライブラリのみ）。

使い方:
    python bench/analyze.py                       # 集計を画面に表示
    python bench/analyze.py --out research/benchmark/summary.md

入力:  $YT_DATA_DIR/bench/<チャンネル>/<ID>/<ID>.info.json（bench.sh の出力）
出力:  $YT_DATA_DIR/bench/videos.csv（1動画1行。Gitの外）
       --out を付けると集計の Markdown を保存（Gitで管理してよい分析メモ）
"""
import argparse
import csv
import json
import os
import re
import statistics
from datetime import date, datetime
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("YT_DATA_DIR", REPO / "_local"))
BENCH = DATA / "bench"


def caption_chars(video_dir: Path) -> int | None:
    """自動字幕(vtt)の文字数。自動字幕は同じ行が繰り返し出るので、連続する重複行を除く。"""
    vtts = sorted(video_dir.glob("*.ja*.vtt"))
    if not vtts:
        return None
    lines, prev = [], None
    for line in vtts[0].read_text(encoding="utf-8", errors="ignore").splitlines():
        line = re.sub(r"<[^>]+>", "", line).strip()
        if not line or "-->" in line or line.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        if line != prev:
            lines.append(line)
        prev = line
    return sum(len(re.sub(r"\s", "", l)) for l in lines)


def load_videos() -> list[dict]:
    today = date.today()
    rows = []
    for info_path in sorted(BENCH.glob("*/*/*.info.json")):
        info = json.loads(info_path.read_text(encoding="utf-8"))
        vdir = info_path.parent
        dur = info.get("duration") or 0
        up = info.get("upload_date")
        up_date = datetime.strptime(up, "%Y%m%d").date() if up else None
        age = max((today - up_date).days, 1) if up_date else None
        views = info.get("view_count")
        times = vdir / "times.tsv"
        cuts = len(times.read_text(encoding="utf-8").splitlines()) - 1 if times.exists() else 0
        chars = caption_chars(vdir)
        rows.append({
            "channel": vdir.parent.name,
            "id": info.get("id"),
            "upload_date": up_date.isoformat() if up_date else "",
            "title": info.get("title", ""),
            "duration_min": round(dur / 60, 1),
            "views": views,
            "views_per_day": round(views / age, 1) if views is not None and age else None,
            "likes": info.get("like_count"),
            "comments": info.get("comment_count"),
            "cuts": cuts or None,
            "sec_per_cut": round(dur / cuts, 1) if cuts else None,
            "chars_per_min": round(chars / (dur / 60)) if chars and dur else None,
        })
    return rows


def spearman(xs, ys):
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    if len(pairs) < 3:
        return None

    def rank(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and v[order[j + 1]] == v[order[i]]:
                j += 1
            for k in range(i, j + 1):
                r[order[k]] = (i + j) / 2
            i = j + 1
        return r

    rx, ry = rank([p[0] for p in pairs]), rank([p[1] for p in pairs])
    try:
        return round(statistics.correlation(rx, ry), 2)
    except statistics.StatisticsError:
        return None


def med(values):
    v = [x for x in values if x is not None]
    return statistics.median(v) if v else None


def fmt(x, digits=0):
    if x is None:
        return "-"
    return f"{x:,.{digits}f}"


def summarize(rows: list[dict]) -> str:
    out = [f"# ベンチマーク集計（{date.today().isoformat()} 時点）", ""]
    out.append("再生数は取得時点の累計。古い動画ほど有利なので、比較には「1日あたり再生数」も見る。")
    out.append("")
    for ch in sorted({r["channel"] for r in rows}):
        rs = [r for r in rows if r["channel"] == ch]
        dates = sorted(r["upload_date"] for r in rs if r["upload_date"])
        gaps = [
            (date.fromisoformat(b) - date.fromisoformat(a)).days
            for a, b in zip(dates, dates[1:])
        ]
        out += [
            f"## {ch}（{len(rs)}本）",
            "",
            "| 指標 | 値 |",
            "|---|---|",
            f"| 期間 | {dates[0] if dates else '-'} 〜 {dates[-1] if dates else '-'} |",
            f"| 再生数 中央値 / 最大 | {fmt(med(r['views'] for r in rs))} / {fmt(max((r['views'] or 0) for r in rs))} |",
            f"| 長さ 中央値（分） | {fmt(med(r['duration_min'] for r in rs), 1)} |",
            f"| 投稿間隔 中央値（日） | {fmt(med(gaps), 1)} |",
            f"| 場面転換の間隔 中央値（秒） | {fmt(med(r['sec_per_cut'] for r in rs), 1)} |",
            f"| 字幕の文字数 中央値（字/分） | {fmt(med(r['chars_per_min'] for r in rs))} |",
            f"| 長さと再生数の順位相関 | {fmt(spearman([r['duration_min'] for r in rs], [r['views'] for r in rs]), 2)} |",
            "",
            "再生数の上位10本:",
            "",
            "| 再生数 | 1日あたり | 長さ（分） | 投稿日 | タイトル |",
            "|---:|---:|---:|---|---|",
        ]
        top = sorted(rs, key=lambda r: r["views"] or 0, reverse=True)[:10]
        for r in top:
            out.append(
                f"| {fmt(r['views'])} | {fmt(r['views_per_day'])} | {r['duration_min']} "
                f"| {r['upload_date']} | {r['title'].replace('|', '｜')} |"
            )
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path, help="集計 Markdown の保存先")
    args = ap.parse_args()

    rows = load_videos()
    if not rows:
        raise SystemExit(f"info.json が見つかりません: {BENCH}（先に bench/bench.sh を実行）")

    csv_path = BENCH / "videos.csv"
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:  # BOM付き：Excelで文字化けしない
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    md = summarize(rows)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(md + "\n", encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(md)
    print(f"\n動画ごとの表: {csv_path}")


if __name__ == "__main__":
    main()
