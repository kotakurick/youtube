// webpack の設定の追加（remotion.config.ts と scripts/check-layout.mjs の両方で使う）。
// エピソードの場面のコードは ../episodes/<回>/scenes/ に置くので、そこからも render/node_modules の部品と @lib を読めるようにする。
import path from "path";

export const webpackOverride = (c) => {
  const here = process.cwd();
  return {
    ...c,
    resolve: {
      ...c.resolve,
      modules: [path.join(here, "node_modules"), "node_modules"],
      alias: { ...(c.resolve?.alias ?? {}), "@lib": path.join(here, "src/lib") },
    },
  };
};
