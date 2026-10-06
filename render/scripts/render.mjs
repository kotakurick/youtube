// npm run render -- <回のid> <出力先>：書き出しの前に、合流していない作業がないかを知らせてから remotion render を呼ぶ（2026-10-06）
import { spawnSync } from "child_process";
import { checkUnmerged } from "./unmerged.mjs";

const args = process.argv.slice(2);
checkUnmerged(args.find((a) => !a.startsWith("--")));
const r = spawnSync("npx", ["remotion", "render", "src/index.ts", ...args], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
