"""タイトルの言葉づかいを、伸びた／伸びていないチャンネルと、同じチャンネルの上位／下位で比べる。

使い方:
    python bench/trajectory.py fetch      # 先に動画一覧（日本語タイトル）を取る
    python bench/titles.py --out research/benchmark/titles.md

入力:  research/benchmark/compare/trajectory.tsv（全動画のタイトル・再生数）
考え方:
    チャンネルごとの割合を出し、群の値はチャンネルの中央値にする（本数の多いチャンネルに引っぱられないため）。
    同じチャンネルの中の比較は、新しい10本を除いた動画の再生数の上位25%と下位25%。
    サムネイルの絵柄は画像を見て判断したので、この表には入っていない（research/benchmark/thumbnails.md に手書き）。
"""
import argparse
import csv
import re
import statistics
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TSV = REPO / "research/benchmark/compare/trajectory.tsv"
SKIP_NEW = 10

FEATURES = {
    "？で終わる・含む": lambda t: bool(re.search(r"[?？]", t)),
    "数字がある": lambda t: bool(re.search(r"[0-9０-９]|[一二三四五六七八九十百千万億]+(人|割|倍|歳|年|万)", t)),
    "【】がある": lambda t: "【" in t,
    "「」がある": lambda t: "「" in t,
    "なぜ・理由": lambda t: bool(re.search(r"なぜ|理由|わけ", t)),
    "強い言葉（残酷・正体・真実・現実・裏側・ヤバい・地獄・闇）": lambda t: bool(re.search(r"残酷|正体|真実|現実|裏側|ヤバ|地獄|闇", t)),
    "パラドックス": lambda t: "パラドックス" in t,
    "男・女": lambda t: bool(re.search(r"男|女", t)),
    "恋愛・結婚・モテ": lambda t: bool(re.search(r"恋愛|結婚|婚|モテ|彼女|彼氏|恋人|童貞|告白|デート|マッチング", t)),
    "お金・仕事": lambda t: bool(re.search(r"お金|年収|給|貯金|資産|株|税|年金|仕事|転職|副業|稼|富|貧", t)),
    "心理・脳・科学": lambda t: bool(re.search(r"心理|脳|科学|進化", t)),
    "「あなた」に向ける（〜な人・あなた・自分）": lambda t: bool(re.search(r"な人|い人|る人|あなた|自分", t)),
}


def load() -> dict[str, list[dict]]:
    by = {}
    for r in csv.DictReader(TSV.open(encoding="utf-8-sig"), delimiter="\t"):
        try:
            r["v"] = float(r["views"])
        except ValueError:
            continue
        r["title"] = unicodedata.normalize("NFKC", r["title"])  # 「せ」＋濁点のように分かれた文字をそろえる
        by.setdefault(r["channel"], []).append(r)
    return by


def share(rs, f) -> float:
    return sum(1 for r in rs if f(r["title"])) / len(rs) if rs else 0.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    by = load()
    group = {ch: rs[0]["group"] for ch, rs in by.items()}
    md = ["# タイトルの言葉づかい", "",
          "`bench/titles.py` が全動画のタイトルから自動で数えた表。サムネイルは画像を見て書いた `thumbnails.md` を参照。", "",
          "## 群の比較（チャンネルごとの割合の中央値）", "",
          "| 特徴 | 伸びた | 伸びていない | 差 |", "|---|---:|---:|---:|"]
    lens = {g: statistics.median(statistics.median(len(r["title"]) for r in rs) for ch, rs in by.items() if group[ch] == g)
            for g in ("伸びた", "伸びていない")}
    md.append(f"| タイトルの文字数（中央値） | {lens['伸びた']:.0f} | {lens['伸びていない']:.0f} | {lens['伸びた'] - lens['伸びていない']:+.0f} |")
    rows = []
    for k, f in FEATURES.items():
        a = statistics.median(share(rs, f) for ch, rs in by.items() if group[ch] == "伸びた")
        b = statistics.median(share(rs, f) for ch, rs in by.items() if group[ch] == "伸びていない")
        rows.append((abs(a - b), f"| {k} | {a:.0%} | {b:.0%} | {a - b:+.0%} |"))
    md += [l for _, l in sorted(rows, reverse=True)]

    md += ["", "## 同じチャンネルの中の上位25%と下位25%（再生数、新しい10本を除く）", "",
           "チャンネルごとの差（上位−下位）の中央値。伸びたチャンネルだけ。", "",
           "| 特徴 | 差の中央値 | 上位が多いチャンネル数 | 下位が多いチャンネル数 |", "|---|---:|---:|---:|"]
    rows = []
    for k, f in FEATURES.items():
        diffs = []
        for ch, rs in by.items():
            if group[ch] != "伸びた":
                continue
            old = sorted(rs, key=lambda r: int(r["n"]))[:-SKIP_NEW]
            if len(old) < 12:
                continue
            old.sort(key=lambda r: -r["v"])
            q = len(old) // 4
            diffs.append(share(old[:q], f) - share(old[-q:], f))
        if diffs:
            m = statistics.median(diffs)
            rows.append((abs(m), f"| {k} | {m:+.0%} | {sum(d > 0 for d in diffs)} | {sum(d < 0 for d in diffs)} |"))
    md += [l for _, l in sorted(rows, reverse=True)]

    md += ["", "## チャンネル別", "", "| チャンネル | 群 | 本数 | 文字数 | " + " | ".join(list(FEATURES)[:6]) + " |",
           "|---|---|---:|---:|" + "---:|" * 6]
    for ch, rs in by.items():
        md.append(f"| {ch} | {group[ch]} | {len(rs)} | {statistics.median(len(r['title']) for r in rs):.0f} | "
                  + " | ".join(f"{share(rs, f):.0%}" for f in list(FEATURES.values())[:6]) + " |")
    text = "\n".join(md) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
