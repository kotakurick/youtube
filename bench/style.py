"""台本の言葉づかい（文末・文の長さ・問いかけ・数字の密度など）を、伸びた／伸びていないチャンネルと、
同じチャンネルの中のヒット／不発で比べる。

使い方:
    python bench/style.py --out research/benchmark/style.md

入力:  $YT_DATA_DIR/bench/<ch>/<ID>/prep/transcript.txt（自動字幕）、research/benchmark/compare/groups.tsv
注意:
    自動字幕なので誤字が多く、句点（。）の位置も音声認識の推測。漢字の言葉より、文末や数字のように
    誤認識されにくいものを数える。句点がほとんどない動画（千字あたり5未満）は外す。
    群の値は「チャンネルごとの中央値」の中央値（本数の多いチャンネルに引っぱられないため）。
"""
import argparse
import csv
import re
import statistics
import unicodedata
from datetime import date
from pathlib import Path

from analyze import BENCH, REPO
import within

GROUPS = REPO / "research/benchmark/compare/groups.tsv"

# 文末は上から順に当てはめ、どれか1つに分ける
ENDS = {
    "問いの文（か・？で終わる）": r"(か|かね|かな|の\?|[?？])$",
    "です・ます調の文": r"(です|ます|でした|ました|ません|でしょう|ください|ましょう)$",
    "「のです・んです・のだ・んだ」の文": r"(のです|んです|のだ|んだ)$",
    "誘いの文（〜しよう・見てみよう）": r"(よう|ろう|こう|そう)$",
    "名詞・数字で終わる文（体言止め）": r"[一-龥ァ-ヶー0-9%]$",
}
PER_K = {  # 千字あたりの回数
    "数字": r"[0-9０-９]+(?:[.,][0-9]+)?",
    "%・倍・割": r"[%％倍割]",
    "あなた": r"あなた",
    "皆さん・みんな": r"皆さん|みなさん|みんな",
    "実は・本当は": r"実は|本当は",
    "つまり・要するに": r"つまり|要するに",
    "例えば": r"例えば|たとえば",
    "しかし・ところが・でも（逆接）": r"しかし|ところが|ですが|けれど|でも[、,]",
    "調査・研究・データ": r"調査|研究|データ|統計",
    "ぼかし（かもしれ・と言われ・可能性・とされ）": r"かもしれ|と言われ|可能性|とされ|と考えられ",
    "呼びかけ（想像して・考えてみて・〜ませんか）": r"想像して|考えてみて|思いませんか|ませんか|でしょうか",
    "笑い・感情語（ヤバ・驚き・衝撃・残酷）": r"ヤバ|やば|驚|衝撃|残酷|怖",
}


def text_of(p: Path) -> tuple[str, str]:
    raw = unicodedata.normalize("NFKC", p.read_text(encoding="utf-8"))
    blocks = re.split(r"\[\d+:\d+(?::\d+)?\]", raw)
    clean = lambda s: re.sub(r"\s+", "", s)
    return clean("".join(blocks)), clean(blocks[1] if len(blocks) > 1 else "")


def features(p: Path) -> dict | None:
    t, head = text_of(p)
    if len(t) < 1000 or t.count("。") / len(t) * 1000 < 5:
        return None
    sents = [s for s in re.split(r"(?<=[。？?！!])", t) if len(s) > 1]
    f = {"文の長さ（字）": statistics.median(len(s) for s in sents)}
    kinds = []
    for s in sents:
        s2 = re.sub(r"[。！!]+$", "", s)
        kinds.append(next((k for k, pat in ENDS.items() if re.search(pat, s2)), "ふつうの言い切り（だ・る・た・ない など）"))
    for k in list(ENDS) + ["ふつうの言い切り（だ・る・た・ない など）"]:
        f[k] = kinds.count(k) / len(kinds)
    for k, pat in PER_K.items():
        f[k] = len(re.findall(pat, t)) / len(t) * 1000
    nums = re.findall(r"[0-9]+(?:\.[0-9]+)?", t)
    f["小数つきの数字の割合"] = sum("." in n for n in nums) / len(nums) if nums else 0.0
    f["最初の30秒に数字がある"] = 1.0 if re.search(r"[0-9]", head) else 0.0
    f["最初の30秒に問いがある"] = 1.0 if re.search(r"か[。？?]|[？?]", head) else 0.0
    return f


PCT = set(ENDS) | {"小数つきの数字の割合", "ふつうの言い切り（だ・る・た・ない など）"} | {"最初の30秒に数字がある", "最初の30秒に問いがある"}


def fmt(k, v):
    return f"{v:.0%}" if k in PCT else f"{v:.1f}"


def diff_fmt(k, v):
    return f"{v * 100:+.0f}pt" if k in PCT else f"{v:+.1f}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    groups = list(csv.DictReader(GROUPS.open(encoding="utf-8-sig"), delimiter="\t"))
    per_ch = {}
    for g in groups:
        fs = [x for x in (features(p) for p in (BENCH / g["channel"]).glob("*/prep/transcript.txt")) if x]
        if fs:
            per_ch[g["channel"]] = (g["group"], len(fs), {k: statistics.median(f[k] for f in fs) for k in fs[0]})
    keys = list(next(iter(per_ch.values()))[2])
    md = [f"# 台本の言葉づかい（{date.today().isoformat()}）", "",
          "自動字幕から数えた。誤字が多いので、文末・数字など誤認識されにくいものだけを見ている。", "",
          f"## 伸びた／伸びていない（{sum(1 for v in per_ch.values() if v[0] == '伸びた')}対"
          f"{sum(1 for v in per_ch.values() if v[0] != '伸びた')}チャンネル、"
          f"{sum(v[1] for v in per_ch.values())}本）", "",
          "値はチャンネルごとの中央値の、さらに中央値。「そろい」＝伸びた側の全チャンネルが伸びていない側の中央値より上（または下）にある数。", "",
          "| 項目 | 伸びた | 伸びていない | 差 | 伸びた側で同じ向きのチャンネル |", "|---|---:|---:|---:|---:|"]
    rows = []
    for k in keys:
        a_vals = [v[2][k] for v in per_ch.values() if v[0] == "伸びた"]
        b_vals = [v[2][k] for v in per_ch.values() if v[0] != "伸びた"]
        a, b = statistics.median(a_vals), statistics.median(b_vals)
        same = sum(1 for x in a_vals if (x > b) == (a > b) and x != b)
        scale = max(abs(a), abs(b)) or 1
        rows.append((abs(a - b) / scale, f"| {k} | {fmt(k, a)} | {fmt(k, b)} | {diff_fmt(k, a - b)} | {same}/{len(a_vals)} |"))
    md += [l for _, l in sorted(rows, reverse=True)]

    md += ["", "## チャンネル別", "", "| チャンネル | 群 | 本数 | " + " | ".join(keys) + " |",
           "|---|---|---:|" + "---:|" * len(keys)]
    for ch, (grp, n, v) in per_ch.items():
        md.append(f"| {ch} | {grp} | {n} | " + " | ".join(fmt(k, v[k]) for k in keys) + " |")

    md += ["", "## 同じチャンネルの中のヒットと不発（近所比の上位25%と下位25%、`within.py` と同じ分け方）", ""]
    for ch in ["kangaesugiruashi", "DataStickFigure"]:
        rs = sorted(within.load(ch), key=lambda r: -r["ratio"])
        q = max(len(rs) // 4, 2)
        def fs_of(part):
            out = []
            for r in part:
                p = BENCH / ch / r["id"] / "prep" / "transcript.txt"
                f = features(p) if p.exists() else None
                if f:
                    out.append(f)
            return out
        hit, flop = fs_of(rs[:q]), fs_of(rs[-q:])
        if min(len(hit), len(flop)) < 10:
            md += [f"### {ch}", "", f"字幕の句点が取れた動画がヒット{len(hit)}本・不発{len(flop)}本で、10本に届かないので出さない。", ""]
            continue
        md += [f"### {ch}（ヒット{len(hit)}本・不発{len(flop)}本）", "", "| 項目 | ヒット | 不発 | 差 |", "|---|---:|---:|---:|"]
        rows = []
        for k in keys:
            a, b = statistics.median(f[k] for f in hit), statistics.median(f[k] for f in flop)
            scale = max(abs(a), abs(b)) or 1
            rows.append((abs(a - b) / scale, f"| {k} | {fmt(k, a)} | {fmt(k, b)} | {diff_fmt(k, a - b)} |"))
        md += [l for _, l in sorted(rows, reverse=True)] + [""]
    text = "\n".join(md) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"保存しました: {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
