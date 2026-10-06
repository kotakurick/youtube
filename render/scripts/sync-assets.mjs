// 描画に使う素材を public/ にそろえる（public/ は作り直せるので Git に入れない）。
//  - ゴサの SVG：assets/characters/gosa/svg → public/gosa
//  - フォント：Noto Sans JP → public/fonts（無ければダウンロード）
//  - 各回の音声：$YT_DATA_DIR/episodes/<回>/audio → public/episodes/<回>/audio（あれば）
//  - 各回のサムネイルの人物画像：$YT_DATA_DIR/episodes/<回>/thumb → public/episodes/<回>/thumb（あれば）
//  - BGM：$YT_DATA_DIR/bgm → public/bgm（YouTube オーディオライブラリから落とした曲。あれば）
//  - 効果音：scripts/make-sfx.mjs で作る → public/sfx
import fs from "fs";
import path from "path";
import { makeSfx } from "./make-sfx.mjs";

const render = process.cwd();
const repo = path.resolve(render, "..");
const pub = path.join(render, "public");
const copyDir = (src, dst) => {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dst, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) n += copyDir(s, d);
    else { fs.copyFileSync(s, d); n++; }
  }
  return n;
};

let n = copyDir(path.join(repo, "assets/characters/gosa/svg"), path.join(pub, "gosa"));
const dataDir = process.env.YT_DATA_DIR || path.join(repo, "_local");
const epRoot = path.join(dataDir, "episodes");
if (fs.existsSync(epRoot)) {
  for (const ep of fs.readdirSync(epRoot)) {
    n += copyDir(path.join(epRoot, ep, "audio"), path.join(pub, "episodes", ep, "audio"));
    // サムネイルの人物画像（画像生成AIで作ったもの。サムネイルだけに使ってよい。2026-10-06）
    n += copyDir(path.join(epRoot, ep, "thumb"), path.join(pub, "episodes", ep, "thumb"));
  }
}
n += copyDir(path.join(dataDir, "bgm"), path.join(pub, "bgm"));
n += makeSfx(path.join(pub, "sfx"));
// フォント（無ければ一度だけダウンロード。約9.6MB、SIL Open Font License）
// 明朝体（Noto Serif JP）はサムネイルの文字に使う（2026-10-06 オーナー「文字は明朝体がよい」）
for (const [file, url] of [
  ["NotoSansJP.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"],
  ["NotoSerifJP.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf"],
]) {
const fontPath = path.join(pub, "fonts", file);
if (!fs.existsSync(fontPath)) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.mkdirSync(path.dirname(fontPath), { recursive: true });
    fs.writeFileSync(fontPath, Buffer.from(await res.arrayBuffer()));
    console.log("フォントを取得しました:", fontPath);
  } catch (e) {
    console.error(`フォントを取得できませんでした（${e.message}）。${url} を手で ${fontPath} に置いてください。`);
    process.exit(1);
  }
}
}
console.log(`素材を ${n} 件そろえました → ${pub}`);
