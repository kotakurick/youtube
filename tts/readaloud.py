"""台本から、スマホのブラウザで無料で聞ける「読み上げ用の台本」のページ（HTML）を作る。
声はスマホやブラウザに入っている声（Edge なら Nanami など）。音声の料金はかからない。

使い方:
    python tts/readaloud.py episodes/001-xxx                        # script.md から
    python tts/readaloud.py episodes/001-xxx --script script-v3.md  # 台本の版違い

出力（Git の外）: $YT_DATA_DIR/episodes/<回>/preview/読み上げ.html
    クラウドの Claude がこれを Artifact として公開し、リンクをオーナーに渡す（docs/process.md の8b）。
    ページの中身：章ごとの文に番号（2-14 なら上から2つ目の見出しの14文目）。再生ボタン・速さ・タップした文から再生。
    番号をタップすると「いらない」の印が付き、印の番号をまとめてコピーしてチャットに貼れる。
    台本の印（〔間〕・[S1]・場面の印・｜）は消し、読みは tts/yomi.tsv で直した文を声に渡す（画面は元の表記）。
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tts"))
import narrate  # noqa: E402
import tts  # noqa: E402


class _Text:
    """narrate.parse に文字列を渡すための入れ物（parse は read_text を呼ぶだけ）"""
    def __init__(self, text: str):
        self.text = text

    def read_text(self, encoding="utf-8") -> str:
        return self.text


def chapters(script: Path) -> list[dict]:
    """[{name, sentences:[(表示する文, 読ませる文)]}]。章は台本の「## 見出し」ごと。"""
    blocks: list[tuple[str, list[str]]] = [("はじめ", [])]
    for line in script.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            blocks.append((line[3:].strip(), []))
        blocks[-1][1].append(line)
    out = []
    for name, lines in blocks:
        sentences = []
        for sc in narrate.parse(_Text("\n".join(lines))):
            for kind, s in narrate.split_sentences(sc["lines"]):
                if kind == "s":
                    shown = s.replace(narrate.BREAK, "")
                    sentences.append((shown, tts.apply_yomi(shown)))
        if sentences:
            out.append({"name": name, "sentences": sentences})
    return out


def page(title: str, chs: list[dict]) -> str:
    body = []
    for ci, c in enumerate(chs, 1):
        body.append(f'<section class="ch" id="c{ci}"><h2>{html.escape(c["name"])}</h2>')
        for si, (shown, _) in enumerate(c["sentences"], 1):
            body.append(f'<p class="s" data-n="{ci}-{si}"><button class="n" type="button" aria-label="{ci}-{si} に印">{ci}-{si}</button>'
                        f'<span class="t">{html.escape(shown)}</span></p>')
        body.append("</section>")
    speak = [[f"{ci}-{si}", spoken] for ci, c in enumerate(chs, 1) for si, (_, spoken) in enumerate(c["sentences"], 1)]
    nav = "".join(f'<a href="#c{ci}">{html.escape(c["name"])}</a>' for ci, c in enumerate(chs, 1))
    total = sum(len(s[0]) for c in chs for s in c["sentences"])
    return TEMPLATE.replace("{{TITLE}}", html.escape(title)).replace("{{NAV}}", nav).replace("{{BODY}}", "\n".join(body)) \
        .replace("{{INFO}}", f"{len(speak)}文・約{total}字・1分395字なら約{total / 395:.0f}分") \
        .replace("{{DATA}}", json.dumps(speak, ensure_ascii=False).replace("</", "<\\/")).replace("{{KEY}}", json.dumps(title, ensure_ascii=False))


TEMPLATE = r"""<title>{{TITLE}}</title>
<style>
/* 1段組の台本。下に再生の帯。読んでいる文に黄色、いらない印は打ち消し線と朱。 */
:root {
  --bg: #F3F5F8; --fg: #1B2230; --sub: #5A6476; --line: #D5DBE4;
  --now: #FFE58A; --cut: #C2410C; --bar: #FFFFFF; --btn: #1B2230; --btn-fg: #FFFFFF;
  --body: "Hiragino Sans", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #12161E; --fg: #E6E9EF; --sub: #A2AABA; --line: #2C3442; --now: #5C4A0E; --cut: #F28C5B; --bar: #1B2130; --btn: #E6E9EF; --btn-fg: #12161E; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #12161E; --fg: #E6E9EF; --sub: #A2AABA; --line: #2C3442; --now: #5C4A0E; --cut: #F28C5B; --bar: #1B2130; --btn: #E6E9EF; --btn-fg: #12161E; color-scheme: dark; }
body { background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 17px; line-height: 1.8; }
main { max-width: 40rem; margin: 0 auto; padding-inline: 16px; padding-block: 20px 200px; display: grid; gap: 28px; }
h1 { font-size: 1.3rem; margin: 0; text-wrap: balance; }
.info { color: var(--sub); font-size: .85rem; margin: 4px 0 0; }
nav { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: .9rem; }
nav a { color: var(--fg); }
h2 { font-size: 1.05rem; margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--line); }
.ch { display: grid; gap: 2px; }
.s { margin: 0; display: grid; grid-template-columns: 3.4em 1fr; gap: 8px; padding: 4px 6px; border-radius: 6px; cursor: pointer; }
.s .t { min-width: 0; }
.s.now { background: var(--now); }
.n { font: inherit; font-size: .78rem; color: var(--sub); background: none; border: 1px solid var(--line); border-radius: 6px; height: 2em; margin-top: .25em; font-variant-numeric: tabular-nums; cursor: pointer; }
.s.cut .t { text-decoration: line-through; color: var(--sub); }
.s.cut .n { border-color: var(--cut); color: var(--cut); font-weight: 700; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; background: var(--bar); border-top: 1px solid var(--line);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 8px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; max-width: 40rem; margin: 0 auto; width: 100%; }
.bar button, .bar select { font: inherit; font-size: .95rem; padding: 8px 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); }
.bar button.main { background: var(--btn); color: var(--btn-fg); border-color: var(--btn); min-width: 6em; }
.bar select { min-width: 0; max-width: 100%; flex: 1 1 10em; }
.msg { font-size: .85rem; color: var(--sub); }
button:focus-visible, select:focus-visible, a:focus-visible { outline: 2px solid var(--cut); outline-offset: 2px; }
</style>
<main>
  <header>
    <h1>{{TITLE}}</h1>
    <p class="info">{{INFO}}。文をタップするとそこから読みます。番号をタップすると「いらない」の印。</p>
  </header>
  <nav>{{NAV}}</nav>
  {{BODY}}
</main>
<div class="bar">
  <div class="row">
    <button class="main" id="play" type="button">▶ 再生</button>
    <select id="rate" aria-label="速さ"><option value="1">1.0倍</option><option value="1.2">1.2倍</option><option value="1.4" selected>1.4倍</option><option value="1.6">1.6倍</option><option value="1.8">1.8倍</option></select>
    <select id="voice" aria-label="声"></select>
  </div>
  <div class="row">
    <button id="copy" type="button">印の番号をコピー</button>
    <button id="all" type="button">全文をコピー</button>
    <span class="msg" id="msg">印 0 文</span>
  </div>
</div>
<script>
const DATA = {{DATA}};
const KEY = "cut:" + {{KEY}};
const els = [...document.querySelectorAll(".s")];
const synth = window.speechSynthesis;
let idx = 0, playing = false, voices = [];
let cut = new Set();
try { cut = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) {}
const msg = document.getElementById("msg"), playBtn = document.getElementById("play"), voiceSel = document.getElementById("voice");
function save() { try { localStorage.setItem(KEY, JSON.stringify([...cut])); } catch (e) {} }
function paint() { els.forEach(e => e.classList.toggle("cut", cut.has(e.dataset.n))); msg.textContent = "印 " + cut.size + " 文"; }
function loadVoices() {
  if (!synth) { voiceSel.hidden = true; return; }
  voices = synth.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("ja"));
  const best = voices.findIndex(v => /Nanami|Natural|Online|Kyoko|O-ren|Google/.test(v.name));
  voiceSel.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name}</option>`).join("") || "<option>日本語の声が見つかりません</option>";
  if (best >= 0) voiceSel.value = String(best);
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
function mark(i) { els.forEach(e => e.classList.remove("now")); if (els[i]) { els[i].classList.add("now"); els[i].scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } }
function say(t) { msg.textContent = t; }
function speak() {
  if (!playing || idx >= DATA.length) { stop(); return; }
  const u = new SpeechSynthesisUtterance(DATA[idx][1]);
  u.lang = "ja-JP"; u.rate = parseFloat(document.getElementById("rate").value);
  if (voices[+voiceSel.value]) u.voice = voices[+voiceSel.value];
  u.onend = () => { if (playing) { idx++; speak(); } };
  u.onerror = ev => { if (playing && ev.error !== "interrupted" && ev.error !== "canceled") { stop(); say("読み上げが止まりました（" + ev.error + "）。Edge か Safari・Chrome で開くか、「全文をコピー」を使ってください"); } };
  mark(idx); synth.speak(u);
}
const NO_SPEECH = "ここでは読み上げが使えません。リンクを Edge・Safari・Chrome で開くか、「全文をコピー」でほかの読み上げに貼ってください";
function start(i) {
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") { say(NO_SPEECH); return; }
  if (synth.speaking || synth.pending) synth.cancel();  // 何も読んでいないときに cancel すると、iPhone で最初の1文が消えることがある
  idx = i; playing = true; playBtn.textContent = "■ 止める"; say("読んでいます：" + DATA[i][0]);
  speak();
  setTimeout(() => { if (playing && !synth.speaking && !synth.pending) { stop(); say(NO_SPEECH); } }, 2500);
}
function stop() { playing = false; if (synth) synth.cancel(); playBtn.textContent = "▶ 再生"; }
playBtn.addEventListener("click", () => playing ? stop() : start(idx));
document.getElementById("rate").addEventListener("change", () => { if (playing) start(idx); });
voiceSel.addEventListener("change", () => { if (playing) start(idx); });
els.forEach((e, i) => {
  e.addEventListener("click", ev => {
    if (ev.target.closest(".n")) { const n = e.dataset.n; cut.has(n) ? cut.delete(n) : cut.add(n); save(); paint(); return; }
    start(i);
  });
});
document.getElementById("all").addEventListener("click", async () => {
  const text = els.map(e => e.querySelector(".t").textContent).join("\n");
  try { await navigator.clipboard.writeText(text); say("全文をコピーしました（" + els.length + "文）"); }
  catch (e) { say("コピーできませんでした。ページの文を長押しして選んでください"); }
});
document.getElementById("copy").addEventListener("click", async () => {
  const list = els.filter(e => cut.has(e.dataset.n)).map(e => e.dataset.n + " " + e.querySelector(".t").textContent.slice(0, 15));
  const text = "いらない：\n" + (list.join("\n") || "（なし）");
  try { await navigator.clipboard.writeText(text); msg.textContent = "コピーしました。チャットに貼ってください"; }
  catch (e) { msg.textContent = "コピーできませんでした：" + list.map(x => x.split(" ")[0]).join(", "); }
});
paint();
</script>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode", type=Path, help="episodes/<回> のフォルダ")
    ap.add_argument("--script", default="script.md", help="台本のファイル名（既定は script.md）")
    ap.add_argument("--title", default=None, help="ページの名前（既定は「<回> 読み上げ」）")
    a = ap.parse_args()
    ep = a.episode.resolve()
    m = re.fullmatch(r"script(-[A-Za-z0-9]+)?\.md", a.script)
    suffix = (m.group(1) or "") if m else ""
    chs = chapters(ep / a.script)
    out = tts.DATA / "episodes" / (ep.name + suffix) / "preview" / "読み上げ.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(a.title or f"{ep.name}{suffix} 読み上げ", chs), encoding="utf-8")
    n = sum(len(c["sentences"]) for c in chs)
    print(f"{out}（{len(chs)}章・{n}文）")


if __name__ == "__main__":
    main()
