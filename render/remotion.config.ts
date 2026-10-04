// Remotion の設定。エピソードの場面のコードは ../episodes/<回>/scenes/ に置くので、
// そこからも render/node_modules の部品（remotion など）と @lib を読めるようにする。
import { Config } from "@remotion/cli/config";
import path from "path";

const here = process.cwd();
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(null); // CPU のコア数に合わせる
Config.setDelayRenderTimeoutInMilliseconds(120000); // 待ちの上限（フォントは FontGate.tsx で動画ごとに待つ）
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    modules: [path.join(here, "node_modules"), "node_modules"],
    alias: { ...(c.resolve?.alias ?? {}), "@lib": path.join(here, "src/lib") },
  },
}));
