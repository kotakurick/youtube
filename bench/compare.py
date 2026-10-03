"""「伸びた」チャンネルと「伸びていない」チャンネルの差を、大きい順に並べる。

使い方:
    python bench/compare.py --out research/benchmark/compare/differences.md

入力:
    research/benchmark/compare/groups.tsv   比べるチャンネルと群（channel・group・type・memo）
                                            channel は $YT_DATA_DIR/bench/ のフォルダ名、group は「伸びた」か「伸びていない」
    $YT_DATA_DIR/bench/<ch>/…               bench.sh・prep.py の出力
    research/benchmark/videos/*.json        bench-analyst の判定
    research/benchmark/compare/voice.tsv    voice.py measure の出力（あれば）
    research/benchmark/compare/listening.csv と $YT_DATA_DIR/bench/listening/key.tsv（採点済みなら）

考え方:
    どちらの群も「各チャンネルの新しい順に N 本」（既定6本）で比べる。伸びた側だけヒット作を選ぶと差が水増しされるため。
    大きいチャンネルの本数に引っ張られないよう、まずチャンネルごとに中央値（または割合）を出し、
    それを群どうしで比べる。差の大きさは、数値は Cliff's delta（-1〜1）、
    種類の項目は「その値の動画の割合」の差（-1〜1）。どちらも正なら「伸びた」側に多い。
"""
import argparse
import csv
import json
import re
import statistics
from datetime import date
from pathlib import Path

from analyze import BENCH, REPO, load_videos

DIR = REPO / "research/benchmark/compare"
VIDEOS = REPO / "research/benchmark/videos"
UP, DOWN = "伸びた", "伸びていない"

CATEGORICAL = ["title_type", "hook_type", "ending_type", "source_on_screen", "narration_style",
               "originality", "voice_kind"]
LISTS = ["script_flags", "visual_flags", "source_kinds", "chart_types", "policy_flags"]
NUMERIC_LABELS = {
    "duration_min": "長さ（分）",
    "chars_per_min": "話す速さ（字/分）",
    "sec_per_cut": "場面転換の間隔（秒）",
    "max_static_sec": "最も長く絵が変わらない時間（秒）",
    "few_cuts": "場面転換が18回未満の動画の割合",
    "like_rate": "高評価率（%）",
    "comment_rate": "コメント率（%）",
    "title_len": "タイトルの文字数",
    "title_has_number": "タイトルに数字",
    "title_has_bracket": "タイトルに【】",
    "first_chart_sec": "最初のグラフ（秒）",
    "n_sources": "出典の数",
    "mix_stick_figure": "画面：棒人間（%）",
    "mix_chart": "画面：グラフ（%）",
    "mix_text_only": "画面：文字だけ（%）",
    "mix_ai_or_photo": "画面：AI画像・写真（%）",
    "pauses_per_min": "声：無音の回数（回/分）",
    "pause_mean_sec": "声：無音の平均（秒）",
    "lra": "声：音量の幅（LU）",
    "pitch_range_st": "声：抑揚の幅（半音）",
    "listen_natural": "聞き比べ：自然さ（1-5）",
    "listen_keep": "聞き比べ：聞き続けたいか（1-5）",
    "upload_gap_days": "投稿間隔（日）",
}


def read_tsv(path: Path, delimiter="\t") -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=delimiter))


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def voice_kind(credit: str) -> str:
    if not credit:
        return "記載なし"
    if re.search(r"ゆっくり|AquesTalk", credit):
        return "ゆっくり"
    if re.search(r"ElevenLabs|にじボイス|CoeFont|Style-?Bert", credit):
        return "自然系の合成音声"
    return "キャラ系の合成音声（VOICEVOXなど）"


def max_static(d: Path, duration: float | None) -> float | None:
    rows = read_tsv(d / "times.tsv")
    secs = sorted(float(r["sec"]) for r in rows)
    if not secs or not duration:
        return None
    points = [0.0, *secs, float(duration)]
    return round(max(b - a for a, b in zip(points, points[1:])), 1)


def collect(recent: int) -> list[dict]:
    groups = {g["channel"]: g for g in read_tsv(DIR / "groups.tsv") if g.get("group") in (UP, DOWN)}
    voice = {(v["channel"], v["id"]): v for v in read_tsv(DIR / "voice.tsv")}
    key = {r["code"]: (r["channel"], r["id"]) for r in read_tsv(BENCH / "listening/key.tsv")}
    scores = {}
    for r in read_tsv(DIR / "listening.csv", ","):
        if r["code"] in key:
            scores[key[r["code"]]] = (num(r.get("自然さ(1-5)")), num(r.get("聞き続けたいか(1-5)")))
    analyst = {}
    for p in VIDEOS.glob("*.json"):
        a = json.loads(p.read_text(encoding="utf-8"))
        analyst[(a.get("channel"), a.get("id"))] = a

    latest: dict[str, list[dict]] = {}
    for v in sorted(load_videos(), key=lambda v: v["upload_date"] or "", reverse=True):
        if v["channel"] in groups and len(latest.setdefault(v["channel"], [])) < recent:
            latest[v["channel"]].append(v)

    rows = []
    for v in (v for vs in latest.values() for v in vs):
        ch = v["channel"]
        k = (ch, v["id"])
        views = v["views"] or 0
        title = v["title"] or ""
        a = analyst.get(k, {})
        mix = a.get("visual_mix") or {}
        vo = voice.get(k, {})
        ls = scores.get(k, (None, None))
        rows.append({
            "channel": ch, "group": groups[ch]["group"], "upload_date": v["upload_date"],
            "duration_min": v["duration_min"], "chars_per_min": v["chars_per_min"],
            "sec_per_cut": v["sec_per_cut"],
            "max_static_sec": None if v["few_cuts"] else max_static(BENCH / ch / v["id"], v["duration_min"] * 60),
            "few_cuts": 1 if v["few_cuts"] else 0,
            "like_rate": round(100 * v["likes"] / views, 2) if v["likes"] and views else None,
            "comment_rate": round(100 * v["comments"] / views, 3) if v["comments"] and views else None,
            "title_len": len(title),
            "title_has_number": 1 if re.search(r"[0-9０-９]", title) else 0,
            "title_has_bracket": 1 if "【" in title else 0,
            "first_chart_sec": num(a.get("first_chart_sec")),
            "n_sources": num(a.get("n_sources")),
            **{f"mix_{m}": num(mix.get(m)) for m in ("stick_figure", "chart", "text_only", "ai_or_photo")},
            **{m: num(vo.get(m)) for m in ("pauses_per_min", "pause_mean_sec", "lra", "pitch_range_st")},
            "listen_natural": ls[0], "listen_keep": ls[1],
            "voice_kind": voice_kind(vo.get("voice_credit", "")) if vo else None,
            **{c: a.get(c) for c in CATEGORICAL if c != "voice_kind"},
            **{c: a.get(c) or [] for c in LISTS},
            "_analyzed": bool(a),
        })
    return rows


def per_channel(rows: list[dict]) -> dict[str, dict]:
    chans: dict[str, dict] = {}
    for ch in sorted({r["channel"] for r in rows}):
        rs = [r for r in rows if r["channel"] == ch]
        c = {"group": rs[0]["group"], "n": len(rs)}
        for k in NUMERIC_LABELS:
            vals = [r[k] for r in rs if r.get(k) is not None]
            c[k] = statistics.median(vals) if vals else None
        dates = sorted(r["upload_date"] for r in rs if r["upload_date"])
        gaps = [(date.fromisoformat(b) - date.fromisoformat(a)).days for a, b in zip(dates, dates[1:])]
        c["upload_gap_days"] = statistics.median(gaps) if gaps else None
        for k in CATEGORICAL:
            vals = [r[k] for r in rs if r.get(k)]
            for v in set(vals):
                c[f"{k}={v}"] = vals.count(v) / len(vals)
            c[f"_{k}_n"] = len(vals)
        for k in LISTS:
            judged = [r for r in rs if r["_analyzed"]]
            for v in {x for r in judged for x in r[k]}:
                c[f"{k}={v}"] = sum(v in r[k] for r in judged) / len(judged)
            c[f"_{k}_n"] = len(judged)
        chans[ch] = c
    return chans


def cliffs(a: list[float], b: list[float]) -> float | None:
    if not a or not b:
        return None
    gt = sum(x > y for x in a for y in b)
    lt = sum(x < y for x in a for y in b)
    return (gt - lt) / (len(a) * len(b))


def compare(chans: dict[str, dict]) -> list[dict]:
    up = [c for c in chans.values() if c["group"] == UP]
    down = [c for c in chans.values() if c["group"] == DOWN]
    out = []
    for k, label in NUMERIC_LABELS.items():
        a = [c[k] for c in up if c.get(k) is not None]
        b = [c[k] for c in down if c.get(k) is not None]
        d = cliffs(a, b)
        if d is not None:
            out.append({"item": label, "kind": "数値", "up": statistics.median(a), "down": statistics.median(b),
                        "effect": d, "n": f"{len(a)}対{len(b)}"})
    keys = {k for c in chans.values() for k in c if "=" in k}
    for k in sorted(keys):
        base = k.split("=")[0]
        a = [c.get(k, 0.0) for c in up if c.get(f"_{base}_n")]
        b = [c.get(k, 0.0) for c in down if c.get(f"_{base}_n")]
        if a and b:
            ma, mb = statistics.mean(a), statistics.mean(b)
            out.append({"item": k.replace("=", "："), "kind": "割合", "up": ma, "down": mb,
                        "effect": ma - mb, "n": f"{len(a)}対{len(b)}"})
    return sorted(out, key=lambda r: -abs(r["effect"]))


def fmt_val(r: dict, v: float) -> str:
    return f"{v:.0%}" if r["kind"] == "割合" else f"{v:,.1f}"


def render(rows: list[dict], chans: dict[str, dict], diffs: list[dict], top: int) -> str:
    n_up = sum(c["group"] == UP for c in chans.values())
    n_down = sum(c["group"] == DOWN for c in chans.values())
    md = [f"# 伸びた／伸びていないチャンネルの差（{date.today().isoformat()}）", "",
          f"チャンネル数：伸びた {n_up}、伸びていない {n_down}。動画数 {len(rows)}。",
          "差の大きさは -1〜1。正は「伸びた」側に多い・大きい。チャンネル数が少ないので、",
          "差が大きくても偶然の可能性がある。因果ではなく「伸びたチャンネルにはこういう特徴が多い」という読み方をする。", "",
          f"## 差の大きい項目（上位{top}）", "",
          "| 項目 | 伸びた | 伸びていない | 差の大きさ | チャンネル数 |", "|---|---:|---:|---:|---:|"]
    for r in diffs[:top]:
        md.append(f"| {r['item']} | {fmt_val(r, r['up'])} | {fmt_val(r, r['down'])} | {r['effect']:+.2f} | {r['n']} |")
    md += ["", "## すべての項目", "", "| 項目 | 伸びた | 伸びていない | 差の大きさ | チャンネル数 |",
           "|---|---:|---:|---:|---:|"]
    for r in diffs:
        md.append(f"| {r['item']} | {fmt_val(r, r['up'])} | {fmt_val(r, r['down'])} | {r['effect']:+.2f} | {r['n']} |")
    md += ["", "## チャンネル一覧", "", "| チャンネル | 群 | 動画数 |", "|---|---|---:|"]
    for ch, c in chans.items():
        md.append(f"| {ch} | {c['group']} | {c['n']} |")
    return "\n".join(md) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--top", type=int, default=15)
    ap.add_argument("--recent", type=int, default=6, help="各チャンネルの新しい順に何本使うか")
    args = ap.parse_args()
    rows = collect(args.recent)
    if not rows:
        raise SystemExit(f"比較する動画がありません。{DIR / 'groups.tsv'} と取得データを確認してください。")
    chans = per_channel(rows)
    text = render(rows, chans, compare(chans), args.top)
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
