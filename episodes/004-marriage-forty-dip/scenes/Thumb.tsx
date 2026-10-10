// 4本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 言葉は「妻の不満が／増える時期」（2026-10-07 オーナー決定。心の声「うん」はなし）。白・同じ大きさの2行。
// 人形は Canva の画像生成（緑の背景）→ scripts/chroma_key.py で抜いた PNG（render/public/episodes/004-marriage-forty-dip/thumb/。Git の外。
// 元の画像は Canva のデザイン DAHXnUuZzE8 の2・3ページ）。
// 情景：土曜の夕方の帰り道（冒頭の車）。地は夕暮れの紺から赤紫、後ろに街の灯のぼけ。夫は正面で落ち着いて立ち、妻は少し離れて外を見る。
// 2人は同じ白・同じ光にして、どちらも悪く見せない（男女の回。ゴサは出さない）。
// npx remotion still src/index.ts 004-marriage-forty-dip-thumb out/004-thumb.png
import React from "react";
import { Bokeh, Cutout, ThumbStage, ThumbWord, Vignette } from "@lib/ThumbKit";

const T = "episodes/004-marriage-forty-dip/thumb/";
const HUSBAND = { src: `${T}husband.png`, aspect: 717 / 1471 };
const WIFE = { src: `${T}wife.png`, aspect: 599 / 1518 };

const WORD = 112;
const Thumb: React.FC = () => (
  <ThumbStage ground={["#141A3A", "#5A2846"]}>
    <Bokeh seed={4} colors={["#FFB347", "#FF8A5C", "#FFE08A", "#7FB2FF"]} />
    <Cutout {...WIFE} cx={1135} top={95} h={720} rim="rgba(255,170,120,.7)" z={1} />
    <Cutout {...HUSBAND} cx={835} top={70} h={760} rim="rgba(130,170,255,.7)" z={2} />
    <Vignette />
    <ThumbWord text="妻の不満が" size={WORD} top={220} />
    <ThumbWord text="増える時期" size={WORD} top={220 + WORD * 1.22} />
  </ThumbStage>
);

export default [{ id: "004-marriage-forty-dip-thumb", component: Thumb }];
