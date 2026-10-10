// 書き出した動画の音量を YouTube の基準にそろえる（-14 LUFS、ピーク -1 dBTP）。映像はそのまま。
// 使い方：npm run master -- out/001.mp4   → out/001.master.mp4（回の id だけでもよい：npm run master -- 001）
// できたら元の out/001.mp4 は消す（音量をそろえる前の途中のもの。2026-10-11 ファイルの置き場所の決まり、docs/process.md）。残すときは --keep。
// ffmpeg は Remotion に入っているもの（npx remotion ffmpeg）を使うので、別に入れなくてよい。
import { spawnSync } from "child_process";
import { existsSync, unlinkSync } from "fs";

const args = process.argv.slice(2);
const keep = args.includes("--keep");
let src = args.find((a) => !a.startsWith("--"));
if (!src) { console.error("使い方：npm run master -- out/<回>.mp4"); process.exit(1); }
if (!src.endsWith(".mp4")) src = `out/${src}.mp4`;
if (!existsSync(src)) { console.error("見つかりません:", src); process.exit(1); }
const dst = src.replace(/\.mp4$/, "") + ".master.mp4";
// Windows では npx を shell 経由で呼ぶので、空白や記号を含む引数（ファイル名など）を引用符で囲む
const q = (a) => (process.platform === "win32" && /[\s,;=&|<>^()'"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const r = spawnSync("npx", ["remotion", "ffmpeg", "-y", "-i", src, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11",
  "-ar", "48000", "-c:a", "aac", "-b:a", "320k", dst].map(q), { stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("できました:", dst);
if (!keep) { unlinkSync(src); console.log("音量をそろえる前の動画を消しました:", src); }
