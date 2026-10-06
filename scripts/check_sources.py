"""台本の数字と出典（sources.csv）を突き合わせる。

使い方:
    python scripts/check_sources.py episodes/<回>
    python scripts/check_sources.py episodes/<回> script-v2.md   # 台本のファイル名が script.md でないとき

確かめること:
    エラー（直してから進む）
      - 台本の [S1] などの印が sources.csv にない
      - sources.csv の id が重なっている、URL が空
    注意（読んで判断する）
      - 印を付けた文で読み上げる量（約3割、4人に1人、半分、100組に1組…）が、
        その id の「値」の欄のどの数字とも近くない（丸め違い・写し間違いの疑い）
      - 「倍」は元の値どうしの比なので、機械では確かめず一覧に出す
      - sources.csv にあるのに台本で使っていない id
      - 照合（オーナー）の欄が空の id（★工程の残り）

丸めの近さ：読み上げた量と元の値の差が、元の値の2割以内か、2ポイント以内なら近いとみなす。
"""
import csv
import re
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "scripts"))
import lint_script as lint  # noqa: E402

KANJI_NUM = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}


def to_num(s: str) -> float:
    s = s.replace(",", "")
    if s in KANJI_NUM:
        return KANJI_NUM[s]
    return float(s)


N = r"(\d+(?:\.\d+)?|[一二三四五六七八九十])"


def spoken_amounts(s: str) -> list[tuple[str, float]]:
    """文の中の「割合を表す読み上げ」を、パーセントに直して返す。[(元の言い方, %)]"""
    out = []
    for m in re.finditer(N + r"(?:人|組|世帯|件)?に" + N + r"(?:人|組|世帯|件)?", s):  # 4人に3人、100組に1組
        a, b = to_num(m.group(1)), to_num(m.group(2))
        if a and b < a:
            out.append((m.group(0), b / a * 100))
    for m in re.finditer(N + r"割(?:" + N + r"分)?", s):  # 3割、2割5分
        out.append((m.group(0), to_num(m.group(1)) * 10 + (to_num(m.group(2)) if m.group(2) else 0)))
    for m in re.finditer(r"(\d+(?:\.\d+)?)(?:%|パーセント)", s):
        out.append((m.group(0), float(m.group(1))))
    for word, v in (("半分", 50), ("ほぼゼロ", 0.5), ("ほとんどゼロ", 0.5)):
        if word in s:
            out.append((word, v))
    return out


def near(spoken: float, value: float) -> bool:
    return abs(spoken - value) <= max(2.0, value * 0.2)


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    ep = Path(sys.argv[1])
    script, src = ep / (sys.argv[2] if len(sys.argv) == 3 else "script.md"), ep / "sources.csv"
    with src.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    errors, notes, doubles = [], [], []
    ids = [r["id"] for r in rows]
    for i in {x for x in ids if ids.count(x) > 1}:
        errors.append(f"sources.csv：id {i} が重なっている")
    by_id = {r["id"]: r for r in rows}
    for r in rows:
        if not r.get("URL", "").strip():
            errors.append(f"sources.csv：{r['id']} の URL が空")
    values = {i: [float(x) for x in re.findall(r"\d+(?:\.\d+)?", unicodedata.normalize("NFKC", r.get("値", "")))] for i, r in by_id.items()}

    used = set()
    for no, line in lint.narration(script.read_text(encoding="utf-8")):
        line = unicodedata.normalize("NFKC", line)
        tags = re.findall(r"\[(S\d+[a-z]?(?:[,，]\s*S?\d+[a-z]?)*)\]", line)
        tag_ids = [("S" + t.lstrip("S")) for g in tags for t in re.split(r"[,，]\s*", g)]
        for t in tag_ids:
            used.add(t)
            if t not in by_id:
                errors.append(f"{no}行目：[{t}] が sources.csv にない")
        text = lint.strip_tags(line)
        if not tag_ids:
            continue
        cand = [v for t in tag_ids for v in values.get(t, [])]
        for said, pct in spoken_amounts(text):
            if not any(near(pct, v) for v in cand):
                notes.append(f"{no}行目：「{said}」（約{pct:.1f}%）が {','.join(tag_ids)} の値のどれとも近くない：{text[:30]}…")
        if "倍" in text:
            doubles.append(f"{no}行目：{text[:40]}")

    for i in ids:
        if i not in used:
            notes.append(f"{i} は台本で使っていない（画面だけで使うなら問題なし）")
    pending = [r["id"] for r in rows if not r.get("照合（オーナー）", "").strip()]

    print(f"{script}：出典の印 {len(used)} 種類、sources.csv {len(rows)} 件")
    print(f"\n## エラー（{len(errors)}）" if errors else "\nエラーはありません。")
    for e in errors:
        print("  " + e)
    if notes:
        print(f"\n## 注意（{len(notes)}）")
        for n in notes:
            print("  " + n)
    if doubles:
        print(f"\n## 「倍」は元の値どうしの比を目で確かめる（{len(doubles)}）")
        for d in doubles:
            print("  " + d)
    if pending:
        print(f"\n★ オーナーの照合がまだ：{', '.join(pending)}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
