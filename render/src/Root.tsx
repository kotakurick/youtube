// 動画の一覧。部品の見本（demo）と、episodes/<回>/scenes/Episode.tsx を自動で登録する。
// Episode.tsx（版違いは Episode-v2.tsx）は `export default` で EpisodeDef を出す。thumb があれば、サムネイルの静止画（<回>-thumb、<回>-thumb-ink）も登録する。
// ショート（縦 1080×1920）は episodes/<回>/scenes/Short.tsx に書く（id は「<回>-short」のように回と別にする）。
// 注意：Remotion は props を JSON にするので、場面（関数）は props で渡さず、回ごとに部品を作る。
import React from "react";
import { Composition, Still } from "remotion";
import { Episode, EpisodeDef, episodeFrames } from "@lib/Episode";
import { FPS, H, W } from "@lib/theme";
import { THUMB, Thumbnail } from "@lib/Thumbnail";
import { withFont } from "@lib/FontGate";
import { demo } from "./demo/demo";
import { parts } from "./demo/parts";
import { parts2 } from "./demo/parts2";
import { demoShort } from "./demo/short";
import { demoDraft, demoNarrated } from "./demo/demo-narrated/episode";
import { GosaSheet } from "./demo/GosaSheet";
import { BackdropSheet, PoseSheet } from "./demo/partsStory";
import { Banner, BANNER } from "./channel/Banner";

const found = require.context("../../episodes", true, /scenes\/Episode(-[A-Za-z0-9]+)?\.tsx$/); // Episode-v2.tsx のような版違いも登録する
const foundShorts = require.context("../../episodes", true, /scenes\/Short\.tsx$/);
const load = (ctx: ReturnType<typeof require.context>) => ctx.keys().filter((k) => !k.startsWith("./_")).map((k) => ctx(k).default as EpisodeDef);
const episodes: EpisodeDef[] = [demo, parts, parts2, demoNarrated, demoDraft, ...load(found)];
const shorts: EpisodeDef[] = [demoShort, ...load(foundShorts)];
const comps = [...episodes.map((ep) => ({ ep, w: W, h: H })), ...shorts.map((ep) => ({ ep, w: H, h: W }))]
  .map(({ ep, w, h }) => ({ ep, w, h, Comp: withFont(() => <Episode ep={ep} />) }));
// どの動画・静止画も、フォントを読み込んでから描く（FontGate.tsx）
const GosaSheetF = withFont(GosaSheet), PoseSheetF = withFont(PoseSheet), BackdropSheetF = withFont(BackdropSheet);
const ThumbnailF = withFont(Thumbnail);
const BannerF = withFont(Banner);

export const Root: React.FC = () => (
  <>
    {comps.map(({ ep, w, h, Comp }) => (
      <Composition key={ep.id} id={ep.id} component={Comp}
        durationInFrames={episodeFrames(ep)} fps={FPS} width={w} height={h} />
    ))}
    <Still id="gosa-sheet" component={GosaSheetF} width={W} height={H} />
    <Still id="pose-sheet" component={PoseSheetF} width={W} height={H} />
    <Still id="backdrop-sheet" component={BackdropSheetF} width={W} height={H} />
    <Still id="channel-banner" component={BannerF} width={BANNER.w} height={BANNER.h} />
    {episodes.filter((ep) => ep.thumb).flatMap((ep) => [
      <Still key={`${ep.id}-thumb`} id={`${ep.id}-thumb`} component={ThumbnailF} width={THUMB.w} height={THUMB.h}
        defaultProps={{ ...ep.thumb!, ground: "paper" as const }} />,
      <Still key={`${ep.id}-thumb-ink`} id={`${ep.id}-thumb-ink`} component={ThumbnailF} width={THUMB.w} height={THUMB.h}
        defaultProps={{ ...ep.thumb!, ground: "ink" as const }} />,
    ])}
  </>
);
