"""似た戦略のチャンネルを、伸びたものも伸びていないものも含めて集める。

使い方:
    python bench/find_channels.py                 # research/benchmark/compare/queries.txt の検索語で探す

やること:
  1. 検索語ごとに2回検索する。「関連度順」だけだと伸びた動画ばかり出るので、「新しい順」も混ぜる。
  2. 見つかったチャンネルごとに、最新12本（通常動画）の再生数・長さ・登録者数を取る。
  3. 再生数の中央値で「伸びた」「伸びていない」「中間」に仮分けする。

出力: research/benchmark/compare/channels.tsv（公開データの集計。Gitで管理してよい）
"""
import csv
import json
import statistics
import subprocess
import sys
import urllib.parse
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DIR = REPO / "research/benchmark/compare"
PER_QUERY = 30
RECENT = 12
MIN_LONG_SEC = 360          # 6分未満（Shorts や短尺）は数えない
GROW = 10_000               # 最新12本の中央値がこれ以上 → 伸びた
LOW = 1_000                 # これ未満 → 伸びていない
MIN_VIDEOS_FOR_LOW = 8      # 本数が少ないチャンネルは「まだ分からない」扱い
SLEEP = ["--sleep-requests", "1"]


def ytdlp(args: list[str]) -> str:
    r = subprocess.run(["yt-dlp", *SLEEP, "--encoding", "utf-8", *args],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout


def search(query: str) -> list[dict]:
    fields = "%(channel_id)s\t%(channel)s\t%(duration)s\t%(view_count)s\t%(title)s"
    by_date = ("https://www.youtube.com/results?search_query="
               + urllib.parse.quote(query) + "&sp=CAI%253D")
    hits = []
    for src in (f"ytsearch{PER_QUERY}:{query}", by_date):
        out = ytdlp(["--flat-playlist", "--playlist-end", str(PER_QUERY), "--print", fields, src])
        for line in out.splitlines():
            cid, name, dur, views, title = (line.split("\t") + [""] * 5)[:5]
            if not cid.startswith("UC"):
                continue
            try:
                if float(dur) < MIN_LONG_SEC:
                    continue
            except ValueError:
                continue
            hits.append({"channel_id": cid, "name": name, "title": title})
    return hits


def channel_stats(cid: str) -> dict | None:
    out = ytdlp(["--flat-playlist", "--playlist-end", str(RECENT * 2), "-J",
                 f"https://www.youtube.com/channel/{cid}/videos"])
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        return None
    long = [e for e in data.get("entries") or []
            if (e.get("duration") or 0) >= MIN_LONG_SEC and e.get("view_count") is not None][:RECENT]
    if not long:
        return None
    views = [e["view_count"] for e in long]
    med = statistics.median(views)
    n = len(long)
    group = ("伸びた" if med >= GROW
             else "伸びていない" if med < LOW and n >= MIN_VIDEOS_FOR_LOW
             else "中間・不明")
    return {
        "handle": data.get("uploader_id") or "",
        "subs": data.get("channel_follower_count") or "",
        "recent_n": n,
        "median_views": int(med),
        "max_views": max(views),
        "median_min": round(statistics.median(e["duration"] for e in long) / 60, 1),
        "group": group,
        "recent_titles": " / ".join(e.get("title", "") for e in long[:3]),
    }


def main():
    queries = [q.strip() for q in (DIR / "queries.txt").read_text(encoding="utf-8").splitlines()
               if q.strip() and not q.startswith("#")]
    found: dict[str, dict] = {}
    for q in queries:
        hits = search(q)
        print(f"検索: {q} → {len(hits)} 本", file=sys.stderr)
        for h in hits:
            c = found.setdefault(h["channel_id"], {"channel_id": h["channel_id"], "name": h["name"],
                                                    "queries": set(), "hit_titles": []})
            c["queries"].add(q)
            if len(c["hit_titles"]) < 2 and h["title"] not in c["hit_titles"]:
                c["hit_titles"].append(h["title"])

    print(f"チャンネル {len(found)} 件の最新動画を取得します", file=sys.stderr)
    rows = []
    for i, c in enumerate(found.values(), 1):
        st = channel_stats(c["channel_id"])
        print(f"  [{i}/{len(found)}] {c['name']}: {st['group'] if st else '取得失敗'}", file=sys.stderr)
        if not st:
            continue
        rows.append({"channel_id": c["channel_id"], "name": c["name"], **st,
                     "queries": " / ".join(sorted(c["queries"])),
                     "hit_titles": " / ".join(c["hit_titles"])})

    rows.sort(key=lambda r: -r["median_views"])
    out = DIR / "channels.tsv"
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    counts = {g: sum(r["group"] == g for r in rows) for g in ("伸びた", "伸びていない", "中間・不明")}
    print(f"保存しました: {out}  " + "、".join(f"{k} {v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
