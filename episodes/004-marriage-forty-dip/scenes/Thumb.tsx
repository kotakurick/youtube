// 4本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 言葉は「妻の不満が／増える時期」（2026-10-07 オーナー決定。心の声「うん」はなし）。白・同じ大きさの2行。
// 絵は案C「食卓」（2026-10-10 オーナー）：夜の食卓で、夫はあごに手を当てて考え込み、妻はカップを持って別の方を見る。
// 2人は同じ食卓にいるのに目が合わない。手前に子どもの空いた椅子（末っ子が手を離れたころ）。
// 人形・食卓・椅子は1枚の画像（Gemini の API、緑の背景 → scripts/chroma_key.py。Git の外。指示文は meta.md）。
// 2人は同じ白・同じ光にして、どちらも悪く見せない（男女の回。ゴサは出さない）。
// npx remotion still src/index.ts 004-marriage-forty-dip-thumb out/004-thumb.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cutout, ThumbStage, ThumbWord, Vignette } from "@lib/ThumbKit";

const T = "episodes/004-marriage-forty-dip/thumb/";
const TABLE = { src: `${T}table.png`, aspect: 669 / 580 };

const WORD = 112;
const Thumb: React.FC = () => (
  <ThumbStage ground={["#141A36", "#3A2438"]}>
    {/* 食卓の上の灯（暖かい光が食卓だけを照らす） */}
    <div style={{
      position: "absolute", left: 935 - 420, top: 120 - 300, width: 840, height: 840, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,196,120,.42) 0%, rgba(255,170,90,.16) 38%, rgba(255,170,90,0) 68%)",
    }} />
    {/* 床の影 */}
    <div style={{
      position: "absolute", left: 935 - 330, top: 610, width: 660, height: 90, borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 70%)",
    }} />
    <AbsoluteFill style={{ filter: "brightness(1.14) contrast(1.06)" }}>
      <Cutout {...TABLE} cx={935} top={95} h={570} rim="rgba(255,190,130,.22)" />
    </AbsoluteFill>
    <Vignette strength={0.6} />
    <ThumbWord text="妻の不満が" size={WORD} top={205} />
    <ThumbWord text="増える時期" size={WORD} top={205 + WORD * 1.22} />
  </ThumbStage>
);

export default [{ id: "004-marriage-forty-dip-thumb", component: Thumb }];
