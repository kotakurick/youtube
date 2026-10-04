// 画面の品質チェック。動画の各場面から何コマかを書き出し、重なり・小さすぎる文字・はみ出しを探す。
//   npm run check -- <動画のid>            例：npm run check -- demo
//   npm run check -- <動画のid> --every 2  場面ごとのコマに加えて、2秒ごとにも調べる
// 結果：out/qa/<id>/report.md と、問題のあったコマの画像（赤い枠＝直すもの、橙の枠＝確かめるもの）。
// 直すものが1つでもあれば終了コード1（書き出しの前に必ず通す）。
// 調べ方の決まりは src/lib/qa.ts、部品の印（data-qa）の付け方もそこに書いてある。
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "../webpack-override.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) { console.error("使い方：npm run check -- <動画のid>（例：demo）"); process.exit(2); }
const every = Number(args[args.indexOf("--every") + 1]) || 0;
const outDir = path.join("out", "qa", id);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// クラウドの作業環境ではこのブラウザを使う（オーナーのパソコンでは Remotion が自分で用意する）
const pw = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = fs.existsSync(pw) ? pw : null;

console.log("準備中（まとめて読み込む）…");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride, publicDir: path.resolve("public") });
const inputProps = { qa: true };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, logLevel: "error" });
const browser = await openBrowser("chrome", { browserExecutable, logLevel: "error" });

let logs = [];
const onBrowserLog = (l) => { if (l.text.startsWith("QA")) logs.push(l.text); };
const shoot = async (frame, keep) => {
  logs = [];
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, frame, output, inputProps, puppeteerInstance: browser, onBrowserLog, scale: 0.5,
    timeoutInMilliseconds: 120000, logLevel: "error" });
  const qa = logs.map((t) => t.startsWith("QA:") ? JSON.parse(t.slice(3)) : null).filter(Boolean).find((q) => q.frame === frame);
  const scenes = logs.find((t) => t.startsWith("QA_SCENES:"));
  const issues = qa?.issues ?? [];
  if (!issues.length && !keep) fs.rmSync(output);
  return { issues, scenes: scenes ? JSON.parse(scenes.slice(10)) : null, output };
};

// 調べるコマ：場面ごとに「真ん中」と「終わりの0.5秒前」（動き終わって、次へ移る前の画面）。場面の区切りがなければ1秒ごと
const first = await shoot(0, false);
const fps = composition.fps;
const frames = new Set([0]);
const sceneOf = new Map();
if (first.scenes) {
  for (const s of first.scenes) {
    for (const f of [s.from + Math.floor(s.len / 2), s.from + s.len - 15]) { frames.add(Math.max(s.from, f)); sceneOf.set(Math.max(s.from, f), s.id); }
  }
} else if (composition.durationInFrames > 1) {
  for (let f = 0; f < composition.durationInFrames; f += fps) frames.add(f);
}
if (every > 0) for (let f = 0; f < composition.durationInFrames; f += Math.round(every * fps)) frames.add(f);
const list = [...frames].filter((f) => f < composition.durationInFrames).sort((a, b) => a - b);

const results = [];
for (const f of list) {
  const r = f === 0 ? first : await shoot(f, false);
  const sceneId = sceneOf.get(f) ?? first.scenes?.find((s) => f >= s.from && f < s.from + s.len)?.id ?? "";
  results.push({ frame: f, scene: sceneId, ...r });
  const e = r.issues.filter((i) => i.level === "error").length, w = r.issues.length - e;
  process.stdout.write(`  ${String(f).padStart(5)}コマ目 ${sceneId.padEnd(12)} ${e ? `直す ${e}` : ""}${w ? ` 確かめる ${w}` : ""}${!e && !w ? "OK" : ""}\n`);
}
await browser.close({ silent: true });

const errors = results.flatMap((r) => r.issues.filter((i) => i.level === "error"));
const warns = results.flatMap((r) => r.issues.filter((i) => i.level === "warn"));
const sec = (f) => `${Math.floor(f / fps / 60)}:${String(Math.floor((f / fps) % 60)).padStart(2, "0")}`;
const md = [
  `# 画面のチェック：${id}`, "",
  `調べたコマ：${list.length}（場面ごとに真ん中と終わり）。直すもの ${errors.length}件、確かめるもの ${warns.length}件。`, "",
  ...results.filter((r) => r.issues.length).flatMap((r) => [
    `## ${sec(r.frame)}（${r.frame}コマ目、場面 ${r.scene}）`, "", `![](${path.basename(r.output)})`, "",
    ...r.issues.map((i, k) => `${k + 1}. ${i.level === "error" ? "【直す】" : "【確かめる】"}${i.message}`), "",
  ]),
].join("\n");
fs.writeFileSync(path.join(outDir, "report.md"), md);
console.log(`\n直すもの ${errors.length}件、確かめるもの ${warns.length}件 → ${path.join(outDir, "report.md")}`);
process.exit(errors.length ? 1 : 0);
