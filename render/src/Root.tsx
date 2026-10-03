// 動画の一覧。部品の見本（demo）と、episodes/<回>/scenes/Episode.tsx を自動で登録する。
// Episode.tsx は `export default` で EpisodeDef を出す。
// 注意：Remotion は props を JSON にするので、場面（関数）は props で渡さず、回ごとに部品を作る。
import React from "react";
import { Composition } from "remotion";
import { Episode, EpisodeDef, episodeFrames } from "@lib/Episode";
import { FPS, H, W } from "@lib/theme";
import { demo } from "./demo/demo";

const found = require.context("../../episodes", true, /scenes\/Episode\.tsx$/);
const episodes: EpisodeDef[] = [demo, ...found.keys().filter((k) => !k.startsWith("./_")).map((k) => found(k).default as EpisodeDef)];
const comps = episodes.map((ep) => ({ ep, Comp: () => <Episode ep={ep} /> }));

export const Root: React.FC = () => (
  <>
    {comps.map(({ ep, Comp }) => (
      <Composition key={ep.id} id={ep.id} component={Comp}
        durationInFrames={episodeFrames(ep)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
