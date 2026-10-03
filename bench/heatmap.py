"""「よく再生された部分」（YouTube のヒートマップ）から、視聴者がどこで見返し、どこで離れるかを見る。

使い方:
    python bench/heatmap.py --out research/benchmark/heatmap.md

入力:  $YT_DATA_DIR/bench/<ch>/<ID>/<ID>.info.json の heatmap（100区間、値は0〜1。その動画の最大を1とした相対値）
       research/benchmark/videos/*.json（sections・surprise_sec・hook_type）

注意:
    ヒートマップは「何人がその区間を見たか（＋見返したか）」の相対値で、視聴維持率そのものではない。
    冒頭が高く、だんだん下がり、山があるのが普通の形。山は「見返された・飛ばして来た」場所。
    YouTube が一定以上の再生数の動画にしか出さないので、取れるのは一部のチャンネルだけ。
"""
import argparse
import json
import statistics
from datetime import date
from pathlib import Path

from analyze import BENCH, REPO

VIDEOS = REPO / "research/benchmark/videos"
BINS = 20          # 5%ごとにならす
PEAK_MIN = 0.6     # 山とみなす高さ（その動画の最大を1として）
SKIP_HEAD = 0.05   # 冒頭5%は山の候補から外す（冒頭はいつも高いので）


def load() -> list[dict]:
    rows = []
    for f in BENCH.glob("*/*/*.info.json"):
        info = json.loads(f.read_text(encoding="utf-8"))
        hm = info.get("heatmap")
        if not hm or not info.get("duration"):
            continue
        ch, vid = f.parent.parent.name, info["id"]
        j = VIDEOS / f"{ch}-{vid}.json"
        a = json.loads(j.read_text(encoding="utf-8")) if j.exists() else {}
        meta_p = f.parent / "prep" / "meta.json"
        meta = json.loads(meta_p.read_text(encoding="utf-8")) if meta_p.exists() else {}
        rows.append({"channel": ch, "id": vid, "title": info.get("title", ""), "dur": info["duration"],
                     "views_per_day": meta.get("views_per_day"), "hm": hm, "a": a})
    return rows


def curve(r: dict) -> list[float]:
    """100区間を BINS 区間にならす。"""
    vals = [h["value"] for h in r["hm"]]
    step = len(vals) / BINS
    return [statistics.mean(vals[int(i * step):int((i + 1) * step)] or [0]) for i in range(BINS)]


def peaks(r: dict) -> list[tuple[float, float]]:
    """(秒, 高さ) の山。前後より高く、PEAK_MIN 以上、冒頭5%より後。"""
    hm = r["hm"]
    out = []
    for i in range(1, len(hm) - 1):
        v = hm[i]["value"]
        if hm[i]["start_time"] < r["dur"] * SKIP_HEAD:
            continue
        if v >= PEAK_MIN and v >= hm[i - 1]["value"] and v >= hm[i + 1]["value"]:
            out.append(((hm[i]["start_time"] + hm[i]["end_time"]) / 2, v))
    return out


def section_at(r: dict, sec: float) -> str:
    secs = sorted((s for s in r["a"].get("sections") or [] if isinstance(s.get("start_sec"), (int, float))),
                  key=lambda s: s["start_sec"])
    label = "-"
    for s in secs:
        if s["start_sec"] <= sec:
            label = s.get("label") or "-"
    return label


def drop_at(r: dict, frac: float) -> float:
    """冒頭（最初の区間）を1としたときの、動画の frac の位置の高さ。"""
    hm = r["hm"]
    head = max(h["value"] for h in hm[:2]) or 1
    i = min(int(frac * len(hm)), len(hm) - 1)
    return hm[i]["value"] / head


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    rows = load()
    md = [f"# よく再生された部分（{date.today().isoformat()}、{len(rows)}本）", "",
          "値は各動画の最大を1とした相対値。視聴維持率そのものではなく、「その区間がどれだけ見られたか（見返しを含む）」。", ""]
    for ch in sorted({r["channel"] for r in rows}):
        rs = [r for r in rows if r["channel"] == ch]
        cs = [curve(r) for r in rs]
        avg = [statistics.median(c[i] for c in cs) for i in range(BINS)]
        md += [f"## {ch}（{len(rs)}本）", "", "### 平均の形（5%ごと、中央値）", "",
               "| 位置 | " + " | ".join(f"{i * 5}%" for i in range(0, BINS, 2)) + " |",
               "|---|" + "---:|" * (BINS // 2),
               "| 高さ | " + " | ".join(f"{avg[i]:.2f}" for i in range(0, BINS, 2)) + " |", ""]
        d10 = [drop_at(r, 0.10) for r in rs]
        d50 = [drop_at(r, 0.50) for r in rs]
        md += [f"- 冒頭を1としたとき、10%の位置で {statistics.median(d10):.2f}、50%の位置で {statistics.median(d50):.2f}（中央値）。", ""]

        # 冒頭の下がり方と伸び（1日あたり再生数）の関係
        vs = [(drop_at(r, 0.10), r["views_per_day"]) for r in rs if r["views_per_day"]]
        if len(vs) >= 8:
            vs.sort()
            half = len(vs) // 2
            lo = statistics.median(v for _, v in vs[:half])
            hi = statistics.median(v for _, v in vs[half:])
            md += [f"- 10%の位置での残り方が下半分の動画は1日あたり再生数の中央値 {lo:,.0f}、上半分は {hi:,.0f}。", ""]

        # 山の位置
        all_peaks = [(r, s, v) for r in rs for s, v in peaks(r)]
        pos = [s / r["dur"] for r, s, _ in all_peaks]
        if pos:
            buckets = [sum(1 for p in pos if i / 5 <= p < (i + 1) / 5) for i in range(5)]
            md += ["### 山（見返された場所）の位置", "",
                   "| 0-20% | 20-40% | 40-60% | 60-80% | 80-100% |", "|---:|---:|---:|---:|---:|",
                   "| " + " | ".join(str(b) for b in buckets) + " |", ""]
        near = [abs(s - r["a"]["surprise_sec"]) <= 30 for r, s, _ in all_peaks
                if isinstance(r["a"].get("surprise_sec"), (int, float))]
        with_s = [r for r in rs if isinstance(r["a"].get("surprise_sec"), (int, float)) and peaks(r)]
        if with_s:
            hit_s = sum(1 for r in with_s if any(abs(s - r["a"]["surprise_sec"]) <= 30 for s, _ in peaks(r)))
            md += [f"- 「いちばん意外な事実」（bench-analyst の判定）の前後30秒に山がある動画：{hit_s}/{len(with_s)}本。", ""]

        labels = {}
        for r, s, v in all_peaks:
            labels.setdefault(section_at(r, s), []).append(v)
        md += ["### 山が出た章（多い順、上位15）", "", "| 章（bench-analyst の区切り） | 山の数 |", "|---|---:|"]
        for lab, vs_ in sorted(labels.items(), key=lambda kv: -len(kv[1]))[:15]:
            md.append(f"| {lab.replace('|', '｜')} | {len(vs_)} |")
        md += ["", "### いちばん高い山（動画ごと、上位15）", "", "| 動画 | 秒 | 位置 | 高さ | 章 |", "|---|---:|---:|---:|---|"]
        tops = sorted(((r, *max(peaks(r), key=lambda p: p[1])) for r in rs if peaks(r)), key=lambda x: -x[2])[:15]
        for r, s, v in tops:
            md.append(f"| {r['title'][:28].replace('|', '｜')} | {s:.0f} | {s / r['dur']:.0%} | {v:.2f} | "
                      f"{section_at(r, s).replace('|', '｜')} |")
        md.append("")
    text = "\n".join(md) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
