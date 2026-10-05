// 静止画の絵コンテ。動画を書き出す前に、場面ごとに2〜3枚の静止画を作って、重なりや違和感を確かめる（2026-10-05）。
//   npm run storyboard -- <動画のid>                 例：npm run storyboard -- 001-where-couples-meet-v2
//   npm run storyboard -- <動画のid> --only ch2,ch3   場面をしぼる
// 場面ごとに、長さの 20%・55%・90% のコマ（章の扉など声のない短い場面は真ん中の1枚）を書き出す。
// 同時に画面のチェック（src/lib/qa.ts の決まり：重なり・28px未満の文字・はみ出し）も行い、結果を一覧に書く。
// 結果：out/storyboard/<id>/ に PNG（半分の大きさ）と index.html（一覧。字幕と時刻つき）、report.md。
// クラウドでも動く（音声・BGM がなくても描ける。フォントは初回にダウンロード）。
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "../webpack-override.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) { console.error("使い方：npm run storyboard -- <動画のid>"); process.exit(2); }
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const outDir = path.join("out", "storyboard", id);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const pw = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = fs.existsSync(pw) ? pw : null;

console.log("準備中（まとめて読み込む）…");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride, publicDir: path.resolve("public") });
const inputProps = { qa: true };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, logLevel: "error" });
const browser = await openBrowser("chrome", { browserExecutable, logLevel: "error" });
const fps = composition.fps;

let logs = [];
const onBrowserLog = (l) => { if (l.text.startsWith("QA")) logs.push(l.text); };
const shoot = async (frame, name) => {
  logs = [];
  const output = path.join(outDir, name);
  await renderStill({ composition, serveUrl, frame, output, inputProps, puppeteerInstance: browser, onBrowserLog, scale: 0.5,
    timeoutInMilliseconds: 120000, logLevel: "error" });
  const qa = logs.map((t) => t.startsWith("QA:") ? JSON.parse(t.slice(3)) : null).filter(Boolean).find((q) => q.frame === frame);
  const scenes = logs.find((t) => t.startsWith("QA_SCENES:"));
  return { issues: qa?.issues ?? [], scenes: scenes ? JSON.parse(scenes.slice(10)) : null };
};

const first = await shoot(0, "_first.png");
fs.rmSync(path.join(outDir, "_first.png"));
if (!first.scenes) { console.error("場面の区切りが取れませんでした（Episode でない動画？）"); process.exit(2); }
// 字幕（どのコマで何を読んでいるか）は timing を Episode から取れないので、episodes/<回>/timing*.json から探す
const subsOf = (() => {
  const ep = id.replace(/-v\d+$/, ""), suffix = id.slice(ep.length);
  const f = path.resolve("..", "episodes", ep, `timing${suffix}.json`);
  if (!fs.existsSync(f)) return () => "";
  const t = JSON.parse(fs.readFileSync(f, "utf8"));
  return (sceneId, sec) => t.scenes.find((s) => s.id === sceneId)?.lines.find(([a, b]) => sec >= a && sec < b)?.[2] ?? "";
})();
const mmss = (f) => `${Math.floor(f / fps / 60)}:${String(Math.floor((f / fps) % 60)).padStart(2, "0")}`;

const shots = [];
let n = 0;
for (const s of first.scenes) {
  if (only && !only.some((o) => s.id.startsWith(o))) continue;
  const ratios = s.len < 4 * fps ? [0.5] : [0.2, 0.55, 0.9];
  for (const r of ratios) {
    const frame = s.from + Math.min(s.len - 1, Math.floor(s.len * r));
    const name = `${String(++n).padStart(3, "0")}-${s.id}-${mmss(frame).replace(":", "m")}.png`;
    const { issues } = await shoot(frame, name);
    const sub = subsOf(s.id, (frame - s.from) / fps);
    shots.push({ frame, scene: s.id, name, issues, sub });
    const e = issues.filter((i) => i.level === "error").length, w = issues.length - e;
    process.stdout.write(`  ${mmss(frame)} ${s.id.padEnd(12)} ${name}  ${e ? `直す ${e}` : ""}${w ? ` 確かめる ${w}` : ""}${!e && !w ? "OK" : ""}\n`);
  }
}
await browser.close({ silent: true });

const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const html = `<!doctype html><meta charset="utf-8"><title>絵コンテ ${id}</title>
<style>body{font-family:sans-serif;background:#F5F2EA;color:#1D2333;margin:24px}h1{font-size:22px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(480px,1fr));gap:20px}
figure{margin:0;background:#fff;border-radius:12px;padding:10px}img{width:100%;border-radius:6px;display:block}
figcaption{font-size:14px;margin-top:6px;line-height:1.5}.e{color:#c0392b}.w{color:#b9770e}</style>
<h1>絵コンテ：${id}（${shots.length}枚）</h1><div class="g">
${shots.map((s) => `<figure><img src="${s.name}" loading="lazy"><figcaption><b>${mmss(s.frame)}　${s.scene}</b>　${esc(s.sub)}
${s.issues.map((i) => `<div class="${i.level === "error" ? "e" : "w"}">${i.level === "error" ? "【直す】" : "【確かめる】"}${esc(i.message)}</div>`).join("")}</figcaption></figure>`).join("\n")}
</div>`;
fs.writeFileSync(path.join(outDir, "index.html"), html);
const errors = shots.flatMap((s) => s.issues.filter((i) => i.level === "error").map((i) => ({ ...i, s })));
const warns = shots.flatMap((s) => s.issues.filter((i) => i.level !== "error").map((i) => ({ ...i, s })));
fs.writeFileSync(path.join(outDir, "report.md"), [`# 絵コンテのチェック：${id}`, "", `${shots.length}枚。直すもの ${errors.length}件、確かめるもの ${warns.length}件。`, "",
  ...[...errors, ...warns].map((i) => `- ${mmss(i.s.frame)} ${i.s.scene}（${i.s.name}）${i.level === "error" ? "【直す】" : "【確かめる】"}${i.message}`)].join("\n") + "\n");
console.log(`\n${shots.length}枚 → ${outDir}/index.html（直すもの ${errors.length}件、確かめるもの ${warns.length}件）`);
