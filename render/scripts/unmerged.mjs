// ほかのブランチに、まだ合流していない作業がないかを調べる（2026-10-06）。
// 1本目 v3 で、別のセッションが直した締めのアニメーション（ゴサ）を合流しないまま書き出してしまったため。
// 調べる範囲：描画の部品（render/src/lib）・音声（tts）・その回のフォルダ（episodes/<回>）。決まり（docs）は決まったらすぐ本線に入れるので見ない。
// ブランチの側で変えたファイルのうち、いまの中身とまだ違うものだけを出す（手で取りこみ済みのものは出さない）。
// npm run check と npm run render の最初に呼ぶ。止めはしない（ほかの回の作業中のブランチもあるので）。見つかったら合流するか判断する。
//   単独で：node scripts/unmerged.mjs <回のid>
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const git = (...a) => execFileSync("git", a, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const lines = (s) => s.split(/\r?\n/).filter(Boolean);

/** 回の id（001-where-couples-meet-v3）から、回のフォルダ（episodes/001-where-couples-meet） */
const episodeDir = (id) => (id ? `episodes/${id.replace(/-v\d+$/, "").replace(/-(short|thumb.*)$/, "")}` : null);

export const checkUnmerged = (id, base = "HEAD") => {
  try { git("fetch", "-q", "--prune"); } catch { console.log("（ほかのブランチの確認：git fetch できなかったので、手元にある情報で調べます）"); }
  let branches;
  try { branches = lines(git("branch", "-r", "--format=%(refname:short)")).filter((b) => b !== "origin" && !b.endsWith("/HEAD")); } catch { return; }
  const paths = ["render/src/lib", "tts", episodeDir(id)].filter(Boolean);
  const found = [];
  for (const b of branches) {
    let files = [];
    try { files = lines(git("diff", "--name-only", `${base}...${b}`, "--", ...paths)); } catch { continue; }
    // ブランチで足した行が、いまのファイルにすべてあれば取りこみ済み（両方で書き足したファイルもあるので、ファイル全体では比べない）
    files = files.filter((f) => {
      let added = [], now = "";
      try { added = lines(git("diff", "-U0", `${base}...${b}`, "--", f)).filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1).trim()).filter(Boolean); } catch { return true; }
      try { now = git("show", `${base}:${f}`); } catch { return added.length > 0; } // いまはないファイル
      return added.some((l) => !now.includes(l));
    });
    if (!files.length) continue;
    let commits = [];
    try { commits = lines(git("log", "--format=%h %ad %s", "--date=short", `${base}..${b}`, "--", ...files)); } catch { /* なし */ }
    found.push({ b, files, commits });
  }
  if (!found.length) return;
  console.log("\n⚠ ほかのブランチに、まだ合流していない作業があります（部品・音声" + (id ? `・${episodeDir(id)}` : "") + "）：");
  for (const { b, files, commits } of found) {
    console.log(`  ${b}（${files.slice(0, 4).join("、")}${files.length > 4 ? ` ほか${files.length - 4}` : ""}）`);
    for (const c of commits.slice(0, 5)) console.log(`    ${c}`);
    if (commits.length > 5) console.log(`    ほか${commits.length - 5}件`);
  }
  console.log("  この回に関係する作業なら、合流してから書き出す（git merge <ブランチ>）。関係なければそのまま進めてよい。\n");
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  checkUnmerged(process.argv.slice(2).find((a) => !a.startsWith("--")));
}
