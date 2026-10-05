"""台本のチェック（docs/script-style.md の決まりのうち、機械で確かめられるもの）。

使い方:
    python scripts/lint_script.py episodes/001-xxx/script.md
    python scripts/lint_script.py episodes/001-xxx/script.md --tts-out 原稿.txt   # 読み上げ用のテキストも書き出す

台本の書き方:
    読み上げる文はそのまま書く。次の行は読み上げない（チェックもしない）:
      「#」で始まる見出し、「>」で始まるメモ、「※」で始まる注、<!-- --> のコメント、``` で囲んだ部分
    数字を出す文には [S1] のように sources.csv の id を付ける（読み上げ用テキストでは消える）。

結果:
    エラー（直してから進む）と注意（読んで判断する）を行番号つきで出す。エラーが1つでもあれば終了コード1。
"""
import argparse
import re
import sys
import unicodedata
from pathlib import Path

CHARS_PER_MIN = 395          # 読み上げの速さ（1分390〜400字）
NUM_PER_MIN = 5              # 読み上げる数字は1分に4〜5個まで
SENT_MAX = 40                # 1文の長さの目安
COMMA_MAX = 2                # 1文の読点の数
KANJI_RUN = 8                # 漢字がこれ以上続いたら注意（熟語3つ以上の目安）

# 煽り・助言・見下し（使わない）
BANNED = [
    (r"衝撃", "煽りの言葉"), (r"悲報|朗報", "煽りの言葉"), (r"ヤバ|やば", "煽りの言葉"),
    (r"すべき|するべき", "助言（〜すべき）"), (r"おすすめ|オススメ", "助言（おすすめ）"),
    (r"(?<!考えて)(?<!想像して)(?<!予想して)(?<!思い浮かべて)みてください", "助言・依頼（〜してみてください）"),
    (r"ましょう", "助言・勧め（〜しましょう）"),
    (r"(女|男)(は|って)(みんな|全員|結局)", "性別全体の決めつけ"),
    (r"チャンネル登録|高評価", "声での登録・高評価の呼びかけ（画面の文字で1行だけにする）"),
]

# AIっぽい言い回し（yomiyasu https://github.com/nanaism/yomiyasu MIT License を参考に、ナレーション向けに作り直し）
SLOP = [
    (r"重要なのは|大事なのは|注目すべきは|ポイントは", "前置きのラベル：要点から言う（評価なら述語に移す）"),
    (r"結論から言うと|正直に言うと|実を言うと", "前置きのラベル"),
    (r"というわけです|に他なりません|と言えるでしょう|と言っても過言ではありません", "後置きのラベル"),
    (r"いかがでしたか|いかがでしたでしょうか|参考になれば幸い", "決まり文句の締め"),
    (r"真実|真理|宿命|究極|深淵|極致|残酷な現実", "大げさな熟語"),
    (r"本質|解像度|腹落ち|肌感|熱量|温度感|手触り", "中身のない言葉"),
    (r"効いてくる|溶かす|浮き彫り|紐解|ひもと|踏み込", "AIが好む比喩の動詞"),
    (r"した瞬間|示唆して", "英語の直訳調"),
    (r"(データ|数字|統計|グラフ)(が|は)(語|教えて|物語)", "擬人化：「データを見ると、〜です」"),
]

SYMBOLS = r"[〜～／【】！!―—…]|[\U0001F300-\U0001FAFF]"
POLITE = r"(です|ます|でした|ました|ません|でしょう|ください)(か|ね|よ)?$"
QUESTION = r"(か|[?？])$"
NOUN_STOP = r"[一-龥ァ-ヶー0-9]$"
STAT = r"%|割|倍|万|億|人に\d人"   # 統計らしい数字の目印


def narration(text: str) -> list[tuple[int, str]]:
    """読み上げる行だけを (行番号, 本文) で返す。"""
    out, in_code, in_comment = [], False, False
    for i, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if in_comment or line.startswith("<!--"):
            in_comment = "-->" not in line
            continue
        if not line or line.startswith(("#", ">", "※")):
            continue
        out.append((i, unicodedata.normalize("NFKC", line)))
    return out


SOURCE_TAG = re.compile(r"\[S\d+(?:[,，]\s*S?\d+)*\]")
VOICE_TAG = re.compile(r"〔[^〕]*〕")  # 声への指示（〔間〕〔間・長〕〔thoughtful〕など）。読み上げない


def strip_sources(s: str) -> str:
    return SOURCE_TAG.sub("", s)


def strip_tags(s: str) -> str:
    return VOICE_TAG.sub("", strip_sources(s)).replace("｜", "")  # ｜は字幕を切る印（読み上げない）


def sentences(lines: list[tuple[int, str]]) -> list[tuple[int, str]]:
    out = []
    for no, line in lines:
        for s in re.split(r"(?<=[。？?])", strip_tags(line)):
            s = s.strip()
            if s:
                out.append((no, s))
    return out


def numbers(s: str) -> list[str]:
    return re.findall(r"\d+(?:[.,]\d+)*", s)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", type=Path)
    ap.add_argument("--tts-out", type=Path, help="読み上げ用のテキスト（タグ・見出し・メモを除いたもの）の書き出し先")
    a = ap.parse_args()
    lines = narration(a.script.read_text(encoding="utf-8"))
    if not lines:
        sys.exit("読み上げる文がありません。")
    sents = sentences(lines)
    body = "".join(strip_tags(t) for _, t in lines)
    chars = len(re.sub(r"\s", "", body))
    minutes = chars / CHARS_PER_MIN
    errors, notes = [], []

    # 数字
    all_nums = [(no, n) for no, s in sents for n in numbers(s)]
    per_min = len(all_nums) / minutes if minutes else 0
    if per_min > NUM_PER_MIN:
        (errors if minutes >= 3 else notes).append((0, f"読み上げる数字が1分に{per_min:.1f}個（{NUM_PER_MIN}個まで）。数字を減らし、1つの数字に時間をかける"))
    window, acc, start_no = CHARS_PER_MIN, [], None
    for no, s in sents:   # 約1分ごとに区切って、数字が多すぎる所を探す
        acc.append((no, s))
        if sum(len(x) for _, x in acc) >= window:
            k = sum(len(numbers(x)) for _, x in acc)
            if k > NUM_PER_MIN + 1:
                notes.append((acc[0][0], f"{acc[0][0]}〜{no}行目の約1分に数字が{k}個"))
            acc = []
    for no, s in sents:
        for n in numbers(s):
            if "." in n:
                errors.append((no, f"小数を読み上げている（{n}）。丸めて言い、細かい値は画面に出す"))
        if re.search(r"\d", s) and re.search(STAT, s):
            src_line = next(t for n2, t in lines if n2 == no)
            if not re.search(r"\[S\d+", src_line):
                notes.append((no, "統計らしい数字に出典の id（[S1] など）がない（物語の中の数字なら問題なし）"))

    # 文体・文の形
    plain = []
    run, prev_end = 0, None
    for no, s in sents:
        core = re.sub(r"[。？?！!」』）)]+$", "", s)
        if not (re.search(POLITE, core) or re.search(QUESTION, s) or re.search(NOUN_STOP, core)):
            plain.append((no, s))
        length = len(s)
        if length > SENT_MAX:
            notes.append((no, f"文が{length}字（{SENT_MAX}字まで）：{s[:30]}…"))
        if s.count("、") > COMMA_MAX:
            notes.append((no, f"読点が{s.count('、')}個（{COMMA_MAX}個まで）"))
        m = re.search(r"[一-龥]{%d,}" % KANJI_RUN, s)
        if m:
            notes.append((no, f"漢字が続いて聞き取りにくい：{m.group(0)}"))
        end = core[-2:]
        run = run + 1 if end == prev_end else 1
        prev_end = end
        if run == 4:
            notes.append((no, f"同じ文末「{end}」が4回続いている。体言止めか問いかけを混ぜる"))
    if plain and len(plain) / len(sents) > 0.1:
        errors.append((plain[0][0], f"です・ます調でない文が{len(plain)}文（{len(plain) / len(sents):.0%}）。例：{plain[0][1][:30]}"))
    else:
        for no, s in plain:
            notes.append((no, f"です・ます調でない：{s[:30]}"))

    # 言葉
    for no, t in lines:
        t2 = strip_tags(t)
        for pat, why in BANNED:
            for m in re.finditer(pat, t2):
                errors.append((no, f"{why}：「{m.group(0)}」"))
        for pat, why in SLOP:
            for m in re.finditer(pat, t2):
                notes.append((no, f"{why}：「{m.group(0)}」"))
        for m in re.finditer(SYMBOLS, t2):
            notes.append((no, f"読み方が揺れる記号「{m.group(0)}」：言葉で書く"))

    # 冒頭と締め
    first = sents[0][1]
    if re.search(r"\d", first) and re.search(STAT, first):
        notes.append((sents[0][0], "1文目が統計の数字。冒頭は物語（人物・情景）から入る"))
    head, acc_len = [], 0
    for no, s in sents:
        head.append(s)
        acc_len += len(s)
        if acc_len >= chars * 0.1:
            break
    if minutes >= 3 and not any(numbers(s) for s in head):
        notes.append((0, "最初の1割に具体的な数字がない（物語の中で1つ出す）"))
    last = sents[-1][1]
    if re.search(QUESTION, last):
        notes.append((sents[-1][0], "最後の文が問いかけ。締めは教訓（一般化）で終える"))

    # 出力
    print(f"{a.script}：{chars:,}字、読み上げ約{minutes:.1f}分、数字{len(all_nums)}個（1分に{per_min:.1f}個）、{len(sents)}文")
    if minutes >= 10 and not (5500 <= chars <= 7500):
        notes.append((0, f"全体が{chars:,}字（15〜20分なら約5,500〜7,500字）"))
    errors, notes = list(dict.fromkeys(errors)), list(dict.fromkeys(notes))   # 同じ行の同じ指摘は1つに
    for label, items in (("エラー", errors), ("注意", notes)):
        if items:
            print(f"\n## {label}（{len(items)}）")
            for no, msg in sorted(items, key=lambda x: x[0]):
                print(f"  {str(no) + '行目' if no else '全体'}：{msg}")
    if not errors and not notes:
        print("問題は見つかりませんでした。")
    if a.tts_out:
        a.tts_out.write_text("\n".join(strip_tags(t).strip() for _, t in lines) + "\n", encoding="utf-8")
        print(f"\n読み上げ用テキスト: {a.tts_out}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
