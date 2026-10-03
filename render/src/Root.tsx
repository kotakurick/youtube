// 動画の一覧。部品の見本（demo）と、episodes/<回>/scenes/Episode.tsx を自動で登録する。
// Episode.tsx は `export default` で EpisodeDef を出す。thumb があれば、サムネイルの静止画（<回>-thumb、<回>-thumb-ink）も登録する。
// 注意：Remotion は props を JSON にするので、場面（関数）は props で渡さず、回ごとに部品を作る。
import React from "react";
import { Composition, Still } from "remotion";
import { Episode, EpisodeDef, episodeFrames } from "@lib/Episode";
import { FPS, H, W } from "@lib/theme";
import { THUMB, Thumbnail } from "@lib/Thumbnail";
import { demo } from "./demo/demo";
import { GosaSheet } from "./demo/GosaSheet";

const found = require.context("../../episodes", true, /scenes\/Episode\.tsx$/);
const episodes: EpisodeDef[] = [demo, ...found.keys().filter((k) => !k.startsWith("./_")).map((k) => found(k).default as EpisodeDef)];
const comps = episodes.map((ep) => ({ ep, Comp: () => <Episode ep={ep} /> }));

export const Root: React.FC = () => (
  <>
    {comps.map(({ ep, Comp }) => (
      <Composition key={ep.id} id={ep.id} component={Comp}
        durationInFrames={episodeFrames(ep)} fps={FPS} width={W} height={H} />
    ))}
    <Still id="gosa-sheet" component={GosaSheet} width={W} height={H} />
    {episodes.filter((ep) => ep.thumb).flatMap((ep) => [
      <Still key={`${ep.id}-thumb`} id={`${ep.id}-thumb`} component={Thumbnail} width={THUMB.w} height={THUMB.h}
        defaultProps={{ ...ep.thumb!, ground: "paper" as const }} />,
      <Still key={`${ep.id}-thumb-ink`} id={`${ep.id}-thumb-ink`} component={Thumbnail} width={THUMB.w} height={THUMB.h}
        defaultProps={{ ...ep.thumb!, ground: "ink" as const }} />,
    ])}
  </>
);
