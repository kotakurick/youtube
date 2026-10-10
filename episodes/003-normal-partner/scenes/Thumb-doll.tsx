// 3本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル）。
// 人形は Canva の画像生成（緑の背景）→ scripts/chroma_key.py で抜いた PNG。render/public/episodes/003-normal-partner/thumb/（Git の外）。
// 情景：夜、2人とも同じようにスマホで相手を探している。地は夜の紺から紫、後ろに街のぼけ。光はスマホの黄と、逆光の青。
// 置き方を2通り：side（2人が並んで同じ向き）と back（背中合わせで、間を空ける。推し）。テストと比較にかけるならこの2枚。
// npx remotion still 003-normal-partner-thumb-doll-side out/thumb003/doll-side.png
import React from "react";
import { Bokeh, CountRow, Cutout, ThumbStage, ThumbWord, Vignette } from "@lib/ThumbKit";

const T = "episodes/003-normal-partner/thumb/";
const MAN = { src: `${T}man.png`, aspect: 904 / 1484, glow: { x: 0.31, y: 0.57, r: 140 } };
const WOMAN = { src: `${T}woman.png`, aspect: 833 / 1480, glow: { x: 0.25, y: 0.59, r: 130 } };

const WORD = 104;
const Words: React.FC = () => (
  <>
    {/* 2026-10-10 オーナー：「のに、」で行を分けるのと、色・大きさの強調は変な感じ。2行で、同じ色・同じ大きさに */}
    <ThumbWord text="普通でいいのに" size={WORD} top={236} />
    <ThumbWord text="いない" size={WORD} top={236 + WORD * 1.22} />
  </>
);

const Scene: React.FC<{ back?: boolean }> = ({ back = false }) => (
  <ThumbStage ground={["#0B0E2A", "#2B1A4C"]}>
    <Bokeh seed={3} />
    {/* 2026-10-10 レビュー r3：寄り添って見えると「いない」と食い違うので、2人の間に暗い隙間を空ける */}
    <Cutout {...WOMAN} cx={back ? 1140 : 1150} top={back ? 120 : 44} h={back ? 600 : 760} flip={back} z={back ? 1 : 3} />
    <Cutout {...MAN} cx={back ? 850 : 840} top={back ? 80 : 18} h={back ? 620 : 790} z={2} />
    <Vignette />
    <Words />
    <CountRow lit={6} />
  </ThumbStage>
);

export default [
  { id: "003-normal-partner-thumb-doll-side", component: () => <Scene /> },
  { id: "003-normal-partner-thumb-doll-back", component: () => <Scene back /> },
];
