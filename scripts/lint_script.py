"""台本のチェック（docs/script-style.md の決まりのうち、機械で確かめられるもの）。

使い方:
    python scripts/lint_script.py episodes/001-xxx/script.md
    python scripts/lint_script.py episodes/001-xxx/script.md --tts-out 原稿.txt   # 読み上げ用のテキストも書き出す

台本の書き方:
    読み上げる文はそのまま書く。次の行は読み上げない（チェックもしない）:
      「#」で始まる見出し、「>」で始まるメモ、「※」で始まる注、<!-- --> のコメント、``` で囲んだ部分
    数字を出す文には [S1] のように sources.csv の id を付ける（読み上げ用テキストでは消える）。

面白さの仕掛け（docs/script-style.md の11章）:
    置いた所に <!-- 仕掛け: 先回り --> のように印を書く（読み上げない）。10分以上の台本では、
    必須の仕掛け（先回り・比喩・回収・ミクロ・締め）の印がないとエラー。比喩は名前を付け、同じ名前で回収する
    （<!-- 仕掛け: 比喩 ケーキ --> … <!-- 仕掛け: 回収 ケーキ -->）。健康・お金の回はミクロの代わりに <!-- 仕掛け: 示唆 --> を置く。

クイズは冒頭の予想タイムだけ（2026-10-07 オーナー「クイズ的なのは最初の答え合わせでよい。それ以降はくどい」）:
    第N章の中で、答えを当てさせる問い（「〜だと思いますか」「考えてみてください」）と「答えは、」で明かす文はエラー。
    問いかけてすぐ〔間〕で答える形は注意。

回ごとの呼び名の表（2026-10-07）:
    episodes/<回>/wording.tsv（scripts/wording.tsv と同じ形）に、その回で使わない言い方と呼び名を書くと、
    共通の表と同じくエラーにする。同じものを途中で別の名前で呼ばない・比喩の言葉を字義どおりに使わないため。

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
    # 翻訳調・抽象名詞で逃げる言い方（2026-10-07 オーナー「日本語の使い方に違和感がある所が多い」。13章）
    (r"することができ|において|における|を持っています|となります", "翻訳調・説明書調：ふだんの話し言葉にする"),
    (r"という形|の形です|の形に|という構造|という構図", "抽象名詞で逃げている：何が起きているかを動詞で言う"),
]

# クイズの形（13章。章の中では使わない）
QUIZ_ASK = r"だと思いますか|考えてみてください|予想して(みて)?ください|当てて(みて)?ください|どれでしょう"
QUIZ_REVEAL = r"^(答えは|正解は)"
NO_PARTICLE = re.compile(r"[こそあど]の|もの|のです|ので|のに|のは")

SYMBOLS = r"[〜～／【】！!―—…]|[\U0001F300-\U0001FAFF]"
POLITE = r"(です|ます|でした|ました|ません|でしょう|ください)(か|ね|よ)?$"
QUESTION = r"(か|[?？])$"
NOUN_STOP = r"[一-龥ァ-ヶー0-9]$"
STAT = r"%|割|倍|万|億|人に\d人"   # 統計らしい数字の目印

# 声が読み間違えやすい漢字（2026-10-06 オーナー「側をそばと読む」）。tts/yomi.tsv に読みがなければ知らせる。
# 読みは文脈で変わるので、一括では直さず、語ごとに yomi.tsv に足す（例：「女性の側」→「女性のがわ」）
# 「入れ」「入っ」は いれ／はいれ、いっ／はいっ の読み分け（2026-10-07 003 オーナー「考えに入れる」）
AMBIGUOUS = ["側", "他", "何人", "入れ", "入っ", "一日", "上手", "下手", "市場", "大分", "心中", "最中", "目下", "生物", "方々"]
ROOT = Path(__file__).resolve().parent.parent


def load_tsv(path: Path, key: str) -> list[dict]:
    import csv
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        return [r for r in csv.DictReader(f, delimiter="\t") if r.get(key)]


def unread(s: str, yomi: list[str]) -> list[str]:
    """読み間違えやすい漢字のうち、yomi.tsv の表記に含まれていないもの"""
    covered = [False] * len(s)
    for w in yomi:
        for m in re.finditer(re.escape(w), s):
            for i in range(m.start(), m.end()):
                covered[i] = True
    out = []
    for w in AMBIGUOUS:
        for m in re.finditer(re.escape(w), s):
            if not all(covered[m.start():m.end()]):
                out.append(w)
    return out


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


SOURCE_TAG = re.compile(r"\[S\d+[a-z]?(?:[,，]\s*S?\d+[a-z]?)*\]")
VOICE_TAG = re.compile(r"〔[^〕]*〕")  # 声への指示（〔間〕〔間・長〕〔thoughtful〕など）。読み上げない


def strip_sources(s: str) -> str:
    return SOURCE_TAG.sub("", s)


def strip_tags(s: str) -> str:
    return VOICE_TAG.sub("", strip_sources(s)).replace("｜", "")  # ｜は字幕を切る印（読み上げない）


def sentences(lines: list[tuple[int, str]]) -> list[tuple[int, str]]:
    out = []
    for no, line in lines:
        for s in re.split(r"(?<=[。？?])(?![」』）)])", strip_tags(line)):
            s = s.strip()
            if s:
                out.append((no, s))
    return out


TRICK = re.compile(r"<!--\s*仕掛け[:：]\s*(\S+)(?:\s+([^>]*?))?\s*-->")
TRICK_REQUIRED = {"先回り": "見る人の予想を言葉にしてから裏切る所", "比喩": "身近な物への置き換え", "回収": "比喩を締めでもう一度使う所",
                  "ミクロ": "1人ひとりの戦い方を比べて見せる所", "締め": "最後の短い逆説の一文"}
CHAPTER = re.compile(r"^##\s*第\s*\d+\s*章")


def tricks(text: str, long: bool) -> tuple[list, list]:
    """面白さの仕掛けの印を調べる（docs/script-style.md の11章）。(エラー, 注意) を返す。"""
    errors, notes = [], []
    found: dict[str, list[tuple[int, str]]] = {}
    chapter, chapter_metaphors = None, {}
    for i, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if line.startswith("## "):
            chapter = line[3:].strip()
        for m in TRICK.finditer(line):
            kind, name = m.group(1), (m.group(2) or "").strip()
            found.setdefault(kind, []).append((i, name))
            if kind == "比喩":
                chapter_metaphors.setdefault(chapter, []).append(i)
    if "示唆" in found:   # 健康・お金の回は、ミクロの代わりに示唆を置く（11章）
        found.setdefault("ミクロ", found["示唆"])
    for no, name in found.get("ミクロ", []):   # オーナーが冗長として外した回は「ミクロ なし（理由）」と書く（2026-10-07 003）
        if name.startswith("なし"):
            notes.append((no, f"ミクロを置いていない：{name}"))
    for kind, why in TRICK_REQUIRED.items():
        if kind not in found:
            (errors if long else notes).append((0, f"仕掛け「{kind}」の印がない（{why}。<!-- 仕掛け: {kind} --> を置く）"))
    for no, name in found.get("比喩", []):
        if not name:
            notes.append((no, "比喩に名前がない（<!-- 仕掛け: 比喩 ケーキ --> のように書き、同じ名前で回収する）"))
        elif name not in {n for _, n in found.get("回収", [])}:
            errors.append((no, f"比喩「{name}」を回収していない（締めで <!-- 仕掛け: 回収 {name} --> を置いて、もう一度使う）"))
    for ch, nos in chapter_metaphors.items():
        if len(nos) > 1:
            notes.append((nos[1], f"「{ch}」に比喩が{len(nos)}つ（章に1つまで）"))
    return errors, notes


def chapter_ends(text: str) -> list[tuple[int, str, str]]:
    """第N章の最後の読み上げ文を (行番号, 章, 文) で返す。章の最後は次への問いにする（11章）。"""
    out, chapter, last = [], None, None
    for no, line in narration_with_headings(text):
        if line.startswith("## "):
            if chapter and last:
                out.append((last[0], chapter, last[1]))
            chapter, last = (line[3:].strip() if CHAPTER.match(line) else None), None
        elif chapter:
            ss = [x for x in re.split(r"(?<=[。？?])(?![」』）)])", strip_tags(line)) if x.strip()]
            if ss:
                last = (no, ss[-1].strip())
    if chapter and last:
        out.append((last[0], chapter, last[1]))
    return out


def narration_with_headings(text: str) -> list[tuple[int, str]]:
    """読み上げる行と、## の見出しの行を (行番号, 本文) で返す。"""
    heads = {i: raw.strip() for i, raw in enumerate(text.splitlines(), 1) if raw.strip().startswith("## ")}
    return sorted([(i, h) for i, h in heads.items()] + narration(text))


# ラベルの数字（年齢・時刻・期間・回・章・年代・西暦・「3つ」のような個数、「〇人に1人」の1）は、覚えるデータではないので数えない。
# 数字は算用数字にそろえて書く（漢字とまぜない。2026-10-07 オーナー指摘）。
# 数を表す漢数字（「二割」「千人」「三つ」）。決まった言い方（一緒・一番・もう一度・十分・一人ひとり など）は除く。
KANJI_NUM = re.compile(
    r"(?<![\d,.唯同統均単第一-九十百千万])(?<!もう)[一二三四五六七八九十百千万]+(?=割|人|組|つ|倍|歳|年|か月|回|章|位|個|件|本|円|分の|パーセント|%)"
)
KANJI_NUM_OK = re.compile(r"一人ひとり|一人暮らし|一つひとつ|一人っ子|一人目|一つ目|十分|一年中")
LABEL = re.compile(r"(?:歳|時|か月|ヶ月|カ月|週間|回目|度目|章|代|つ)|(?<=\d{4})年")


def numbers(s: str, labels: bool = False, keys: bool = False) -> list[str]:
    """読み上げる数字。labels=False ならラベルの数字を除く。keys=True なら「数字＋続く1字」（同じ量かの目印）で返す。"""
    out = []
    for m in re.finditer(r"\d+(?:[.,]\d+)*", s):
        if not labels:
            if LABEL.match(s, m.end()) or (len(m.group()) == 4 and s[m.end():m.end() + 1] == "年"):
                continue
            if s[max(0, m.start() - 2):m.start()] == "人に" and m.group() == "1":
                continue
        out.append(m.group() + s[m.end():m.end() + 1] if keys else m.group())
    return out


def new_numbers(sents) -> dict:
    """文ごとの「新しい数字」の数。前に言った数字を同じ単位でもう一度言うのは数えない
    （基準の「1000人」や、本命の数字の言い直し。1つの数字に時間をかける、の決まりどおり。2026-10-07）。"""
    seen, out = set(), {}
    for no, s in sents:
        ks = numbers(s, keys=True)
        out[(no, s)] = sum(1 for k in ks if k not in seen)
        seen.update(ks)
    return out


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
    fresh = new_numbers(sents)
    all_nums = [(no, n) for no, s in sents for n in numbers(s)]
    n_fresh = sum(fresh.values())
    per_min = n_fresh / minutes if minutes else 0
    if per_min > NUM_PER_MIN:
        (errors if minutes >= 3 else notes).append((0, f"読み上げる数字が1分に{per_min:.1f}個（{NUM_PER_MIN}個まで）。数字を減らし、1つの数字に時間をかける"))
    window, acc, start_no = CHARS_PER_MIN, [], None
    for no, s in sents:   # 約1分ごとに区切って、数字が多すぎる所を探す
        acc.append((no, s))
        if sum(len(x) for _, x in acc) >= window:
            k = sum(fresh[(n2, x)] for n2, x in acc)
            if k > NUM_PER_MIN + 1:
                notes.append((acc[0][0], f"{acc[0][0]}〜{no}行目の約1分に数字が{k}個"))
            acc = []
    for no, s in sents:
        for n in numbers(s, labels=True):
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
        if s.startswith("では、"):  # eleven-yui が「では、では」と2回読むことがある（2026-10-06。docs/script-style.md の7章）
            errors.append((no, f"文の頭の「では、」は声が2回読むことがある。前置きなしで始めるか「それなら、」などにする：{s[:30]}"))
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

    # 1文の中の「の」の重なりと、同じ語のくり返し（13章）
    for i, (no, s) in enumerate(sents):
        for clause in re.split(r"[、。？?]", s):
            if len(re.findall("の", NO_PARTICLE.sub("", clause))) >= 3:
                notes.append((no, f"「の」が3つ以上重なる：{clause[:30]}"))
        words = re.findall(r"[一-龥]{2,}|[ァ-ヶー]{3,}", s)
        for w in dict.fromkeys(words):
            if words.count(w) >= 2:
                notes.append((no, f"1文に同じ語「{w}」が2回。わざとの対句でなければ言い換えるか省く"))
        near = [w for _, x in sents[max(0, i - 2):i + 1] for w in dict.fromkeys(re.findall(r"[一-龥]{2,}|[ァ-ヶー]{3,}", x))]
        for w in dict.fromkeys(near):
            if near.count(w) >= 3:
                notes.append((no, f"同じ語「{w}」が3文続けて出る。わざとでなければ言い換えるか省く"))

    # クイズは冒頭の予想タイムだけ（13章。2026-10-07 オーナー）
    raw_lines = a.script.read_text(encoding="utf-8").splitlines()
    in_ch, ch_name, asks = False, None, {}
    for no, line in narration_with_headings("\n".join(raw_lines)):
        if line.startswith("## "):
            in_ch, ch_name = bool(CHAPTER.match(line)), line[3:].strip()
            continue
        if not in_ch:
            continue
        ss = [x.strip() for x in re.split(r"(?<=[。？?])(?![」』）)])", strip_tags(line)) if x.strip()]
        for x in ss:
            if re.search(QUIZ_ASK, x):
                errors.append((no, f"章の中のクイズ（答えを当てさせる問い）。クイズは冒頭の予想タイムだけ：{x[:30]}"))
            if re.match(QUIZ_REVEAL, x):
                errors.append((no, f"章の中で「答えは」と明かしている（クイズの形）。答えを先に言い、意外さを語る：{x[:30]}"))
            if re.search(QUESTION, re.sub(r"[。」』）)]+$", "", x)):
                asks.setdefault(ch_name, []).append(no)
        nxt = raw_lines[no].strip() if no < len(raw_lines) else ""
        if ss and re.search(QUESTION, re.sub(r"[。」』）)]+$", "", ss[-1])) and nxt.startswith("〔間"):
            notes.append((no, f"問いかけて〔間〕ですぐ答えている（クイズの形になっていないか）：{ss[-1][:30]}"))
    for ch, nos in asks.items():
        if len(nos) > 3:
            notes.append((nos[0], f"「{ch}」に問いかけが{len(nos)}つ（くどくなる。章の終わりの問いを入れて3つまで）"))

    # 言い換えの辞書（scripts/wording.tsv。オーナーの指摘から足していく。回ごとの呼び名は episodes/<回>/wording.tsv）と、読み間違えやすい漢字（tts/yomi.tsv）
    wording = load_tsv(ROOT / "scripts" / "wording.tsv", "表記") + load_tsv(a.script.parent / "wording.tsv", "表記")
    yomi = [r["表記"] for r in load_tsv(ROOT / "tts" / "yomi.tsv", "表記")]
    for no, t in lines:
        t2 = strip_tags(t)
        for r in wording:
            if r["表記"] in t2:
                errors.append((no, f"言い換える：「{r['表記']}」→「{r['言い換え']}」（{r['理由']}）"))
        for w in dict.fromkeys(unread(t2, yomi)):
            notes.append((no, f"読み間違えやすい「{w}」：声で聞いて確かめ、違えば tts/yomi.tsv に語ごとに読みを足す"))

    # 言葉
    for no, t in lines:
        t2 = strip_tags(t)
        for m in KANJI_NUM.finditer(KANJI_NUM_OK.sub("", t2)):
            errors.append((no, f"数字は算用数字で書く（漢字とまぜない。2026-10-07 オーナー）：「{m.group(0)}」"))
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

    # 面白さの仕掛け（11章）
    raw_text = a.script.read_text(encoding="utf-8")
    e2, n2 = tricks(raw_text, long=minutes >= 10)
    errors += e2
    notes += n2
    for no, ch, s_last in chapter_ends(raw_text):
        if not re.search(QUESTION, re.sub(r"[。」』）)]+$", "", s_last)):
            notes.append((no, f"「{ch}」の最後の文が問いになっていない。次の章への問いで終える：{s_last[:30]}"))

    # 出力
    print(f"{a.script}：{chars:,}字、読み上げ約{minutes:.1f}分、数字{len(all_nums)}個（言い直しを除く{n_fresh}個、1分に{per_min:.1f}個）、{len(sents)}文")
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
