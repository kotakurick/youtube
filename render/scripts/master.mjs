// 書き出した動画の音量を YouTube の基準にそろえる（-14 LUFS、ピーク -1 dBTP）。映像はそのまま。
// 使い方：npm run master -- out/001.mp4   → out/001.master.mp4
// ffmpeg は Remotion に入っているもの（npx remotion ffmpeg）を使うので、別に入れなくてよい。
import { spawnSync } from "child_process";

const src = process.argv[2];
if (!src) { console.error("使い方：npm run master -- out/<回>.mp4"); process.exit(1); }
const dst = src.replace(/\.mp4$/, "") + ".master.mp4";
// Windows では npx を shell 経由で呼ぶので、空白や記号を含む引数（ファイル名など）を引用符で囲む
const q = (a) => (process.platform === "win32" && /[\s,;=&|<>^()'"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const r = spawnSync("npx", ["remotion", "ffmpeg", "-y", "-i", src, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11",
  "-ar", "48000", "-c:a", "aac", "-b:a", "320k", dst].map(q), { stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("できました:", dst);
