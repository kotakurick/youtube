// 絵コンテを書き出す。場面（<回>-sb-<key>）を1枚ずつ最後のコマで書き出し、画面のチェック（src/lib/qa.ts）もかけてから、
// 4列の一覧（<回>-storyboard）を作る。
//   npm run storyboard -- <回のid>                例：npm run storyboard -- 002-r-greater-than-g
//   npm run storyboard -- <回のid> out/sb.png     一覧の置き場所を変える（既定は out/<回>-storyboard.png）
// 結果：一覧の画像と、out/qa/<回>-storyboard.md（場面ごとの「直すもの」「確かめるもの」）。直すものがあれば終了コード1。
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "../webpack-override.mjs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [id, outArg] = args;
if (!id) { console.error("使い方：npm run storyboard -- <回のid>"); process.exit(2); }
const out = outArg ?? path.join("out", `${id}-storyboard.png`);
const pw = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = fs.existsSync(pw) ? pw : null;
const imgDir = path.join("public", "sb", id);
fs.rmSync(imgDir, { recursive: true, force: true });
fs.mkdirSync(imgDir, { recursive: true });

const pack = () => bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride, publicDir: path.resolve("public") });
console.log("準備中…");
let serveUrl = await pack();
const browser = await openBrowser("chrome", { browserExecutable, logLevel: "error" });
const inputProps = { qa: true };
const prefix = `${id}-sb-`;
const comps = (await getCompositions(serveUrl, { inputProps, browserExecutable, puppeteerInstance: browser, logLevel: "error" }))
  .filter((c) => c.id.startsWith(prefix));
if (!comps.length) { console.error(`場面が見つからない：episodes/${id}/scenes/Storyboard.tsx`); process.exit(2); }

const report = [`# 絵コンテの画面チェック：${id}`, ""];
let errors = 0;
for (const composition of comps) {
  const key = composition.id.slice(prefix.length);
  const frame = composition.durationInFrames - 1;
  const logs = [];
  await renderStill({ composition, serveUrl, frame, output: path.join(imgDir, `${key}.png`), inputProps, puppeteerInstance: browser,
    onBrowserLog: (l) => { if (l.text.startsWith("QA:")) logs.push(l.text); }, logLevel: "error" });
  const issues = logs.map((t) => JSON.parse(t.slice(3))).find((q) => q.frame === frame)?.issues ?? [];
  const e = issues.filter((i) => i.level === "error").length, w = issues.length - e;
  errors += e;
  console.log(`  場面 ${key}  ${e ? `直す ${e}` : ""}${w ? ` 確かめる ${w}` : ""}${!e && !w ? "OK" : ""}`);
  if (issues.length) report.push(`## 場面 ${key}`, "", ...issues.map((i, k) => `${k + 1}. ${i.level === "error" ? "【直す】" : "【確かめる】"}${i.message}`), "");
}

// 場面の画像がそろったので、もう一度まとめ直して一覧を作る（public の中身はまとめるときに写される）
serveUrl = await pack();
const sheet = await selectComposition({ serveUrl, id: `${id}-storyboard`, browserExecutable, puppeteerInstance: browser, logLevel: "error" });
fs.mkdirSync(path.dirname(out), { recursive: true });
await renderStill({ composition: sheet, serveUrl, output: out, puppeteerInstance: browser, logLevel: "error" });
await browser.close({ silent: true });
fs.mkdirSync(path.join("out", "qa"), { recursive: true });
fs.writeFileSync(path.join("out", "qa", `${id}-storyboard.md`), report.join("\n") + (errors ? "" : "直すものはなし。\n"));
console.log(`一覧：${out}　チェック：out/qa/${id}-storyboard.md（直すもの ${errors}件）`);
process.exit(errors ? 1 : 0);
