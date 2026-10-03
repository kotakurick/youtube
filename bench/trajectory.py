"""チャンネルの立ち上がり方を調べる（最初の何本で、どの動画が最初に伸びたか）。

使い方:
    python bench/trajectory.py fetch              # groups.tsv の全チャンネルの動画一覧と、古い順20本の投稿日を取る
    python bench/trajectory.py report --out research/benchmark/compare/trajectory.md

出力:
    research/benchmark/compare/trajectory.tsv   1動画1行（チャンネル・古い順の番号・ID・投稿日・長さ・再生数・タイトル）
    trajectory.md                               チャンネルごとの最初の20本と「最初のヒット」の位置

「最初のヒット」：そのチャンネルの最初の5本の再生数の中央値の5倍を、初めて超えた動画。
再生数は取得時点の累計なので、古い動画ほど有利。立ち上がりの比較は「何本目で、どのテーマで」に絞って読む。
"""
import argparse
import csv
import statistics
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DIR = REPO / "research/benchmark/compare"
TSV = DIR / "trajectory.tsv"
EARLY = 20
HIT_X = 5


def ytdlp(args: list[str], ja: bool = False) -> str:
    # 一覧のタイトルは英訳されることがある。lang=ja にすると日本語になるが、再生数が読めなくなる（NA）。
    # そこで一覧は2回取り、再生数は通常の取得、タイトルは lang=ja の取得から使う。
    lang = ["--extractor-args", "youtube:lang=ja"] if ja else []
    r = subprocess.run(["yt-dlp", "--no-warnings", "--sleep-requests", "1", "--encoding", "utf-8", *lang, *args],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout


def handle_url(ch: str) -> str:
    return f"https://www.youtube.com/channel/{ch}/videos" if ch.startswith("UC") else f"https://www.youtube.com/@{ch}/videos"


def fetch() -> None:
    groups = list(csv.DictReader((DIR / "groups.tsv").open(encoding="utf-8-sig"), delimiter="\t"))
    rows = []
    # 前回取った投稿日は使い回す（1本ずつ取るので時間がかかる）
    known = ({r["id"]: r["upload_date"] for r in csv.DictReader(TSV.open(encoding="utf-8-sig"), delimiter="\t")}
             if TSV.exists() else {})
    for g in groups:
        ch = g["channel"]
        out = ytdlp(["--flat-playlist", "--print", "%(id)s\t%(duration)s\t%(view_count)s\t%(title)s", handle_url(ch)])
        vids = [line.split("\t", 3) for line in out.splitlines() if line.count("\t") >= 3]
        out = ytdlp(["--flat-playlist", "--print", "%(id)s\t%(title)s", handle_url(ch)], ja=True)
        ja = dict(line.split("\t", 1) for line in out.splitlines() if "\t" in line)
        vids = [[vid, dur, views, ja.get(vid, title)] for vid, dur, views, title in vids]
        vids.reverse()  # 新しい順 → 古い順
        dates = {k: v for k, v in known.items() if v}
        ids = [v[0] for v in vids[:EARLY] if v[0] not in dates]
        if ids:
            out = ytdlp(["--skip-download", "--print", "%(id)s\t%(upload_date)s",
                         *[f"https://www.youtube.com/watch?v={i}" for i in ids]])
            dates.update(line.split("\t", 1) for line in out.splitlines() if "\t" in line)
        for n, (vid, dur, views, title) in enumerate(vids, 1):
            rows.append({"channel": ch, "group": g["group"], "n": n, "id": vid,
                         "upload_date": dates.get(vid, ""), "duration": dur, "views": views, "title": title})
        print(f"  {ch}: {len(vids)} 本", file=sys.stderr)
    with TSV.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    print(f"保存しました: {TSV}（{len(rows)} 本）")


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def fmt_date(d: str) -> str:
    return f"{d[:4]}-{d[4:6]}-{d[6:]}" if len(d) == 8 else "-"


def report(out: Path | None) -> None:
    rows = list(csv.DictReader(TSV.open(encoding="utf-8-sig"), delimiter="\t"))
    md = ["# チャンネルの立ち上がり方", "",
          f"最初のヒット＝最初の5本の再生数の中央値の{HIT_X}倍を初めて超えた動画。再生数は取得時点の累計。", "",
          "## まとめ", "",
          "| チャンネル | 群 | 本数 | 開始 | 最初の5本（中央値） | 最初の20本（中央値） | 最初のヒット | その再生数 | 最新6本（中央値） |",
          "|---|---|---:|---|---:|---:|---|---:|---:|"]
    detail = []
    for ch in dict.fromkeys(r["channel"] for r in rows):
        # 再生数が取れない動画（メンバー限定・プレミア公開待ちなど）は数えない
        rs = [r for r in rows if r["channel"] == ch and num(r["views"]) is not None]
        v = [num(r["views"]) for r in rs]
        base = statistics.median(v[:5]) if v else 0
        hit = next((r for r, x in zip(rs, v) if base and x >= base * HIT_X), None)
        hit_n = f"{hit['n']}本目" if hit else "なし"
        hit_v = f"{num(hit['views']):,.0f}" if hit else "-"
        md.append(f"| {ch} | {rs[0]['group']} | {len(rs)} | {fmt_date(rs[0]['upload_date'])} | {base:,.0f} "
                  f"| {statistics.median(v[:EARLY]):,.0f} | {hit_n} | {hit_v} | {statistics.median(v[-6:]):,.0f} |")
        detail += [f"### {ch}（{rs[0]['group']}）", "", "| # | 投稿日 | 分 | 再生数 | タイトル |", "|---:|---|---:|---:|---|"]
        for r in rs[:EARLY]:
            mark = " ★" if hit and r["id"] == hit["id"] else ""
            dur = num(r["duration"])
            detail.append(f"| {r['n']} | {fmt_date(r['upload_date'])} | {dur / 60:.0f} | {num(r['views']) or 0:,.0f}{mark} "
                          f"| {r['title'].replace('|', '｜')} |" if dur else
                          f"| {r['n']} | {fmt_date(r['upload_date'])} | - | {num(r['views']) or 0:,.0f}{mark} | {r['title'].replace('|', '｜')} |")
        detail.append("")
    text = "\n".join(md + ["", "## 最初の20本（★＝最初のヒット）", ""] + detail) + "\n"
    if out:
        out.write_text(text, encoding="utf-8")
        print(f"保存しました: {out}")
    else:
        print(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    r = sub.add_parser("report")
    r.add_argument("--out", type=Path)
    a = ap.parse_args()
    fetch() if a.cmd == "fetch" else report(a.out)


if __name__ == "__main__":
    main()
