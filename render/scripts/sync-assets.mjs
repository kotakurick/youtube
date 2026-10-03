// 描画に使う素材を public/ にそろえる（public/ は作り直せるので Git に入れない）。
//  - ゴサの SVG：assets/characters/gosa/svg → public/gosa
//  - フォント：Noto Sans JP → public/fonts（無ければダウンロード）
//  - 各回の音声：$YT_DATA_DIR/episodes/<回>/audio → public/episodes/<回>/audio（あれば）
import fs from "fs";
import path from "path";

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
  }
}
// フォント（無ければ一度だけダウンロード。約9.6MB、SIL Open Font License）
const fontPath = path.join(pub, "fonts", "NotoSansJP.ttf");
if (!fs.existsSync(fontPath)) {
  const url = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf";
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
console.log(`素材を ${n} 件そろえました → ${pub}`);
