// 4本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 言葉は「妻の不満が／増える時期」（2026-10-07 オーナー決定。心の声「うん」はなし）。白・同じ大きさの2行。
// 人形は Gemini の API（scripts/gemini_image.py、緑の背景。2人とも白い髪あり）→ scripts/chroma_key.py で抜いた PNG
// （render/public/episodes/004-marriage-forty-dip/thumb/。Git の外。指示文は meta.md）。
// 情景：土曜の夕方の帰り道（冒頭の車）。地は夕暮れの紺から赤紫、後ろに街の灯のぼけ。夫は正面で落ち着いて立ち、妻は少し離れて外を見る。
// 2人は同じ白・同じ光にして、どちらも悪く見せない（男女の回。ゴサは出さない）。
// npx remotion still src/index.ts 004-marriage-forty-dip-thumb out/004-thumb.png
import React from "react";
import { Bokeh, Cutout, ThumbStage, ThumbWord, Vignette } from "@lib/ThumbKit";

const T = "episodes/004-marriage-forty-dip/thumb/";
const HUSBAND = { src: `${T}husband.png`, aspect: 492 / 1205 };
const WIFE = { src: `${T}wife.png`, aspect: 387 / 1189 };

const WORD = 112;
const Thumb: React.FC = () => (
  <ThumbStage ground={["#18204A", "#7A3358"]}>
    {/* 妻の視線の先（右上）に暖かい灯、夫の後ろは少しだけ */}
    <Bokeh seed={4} n={12} x0={600} x1={930} colors={["#7FB2FF", "#FFB347"]} />
    <Bokeh seed={7} n={18} x0={930} x1={1280} y0={40} y1={420} colors={["#FFB347", "#FF8A5C", "#FFE08A"]} />
    {/* 妻が主役（大きく）、夫は一歩引いて、2人の間を空ける。ふちの光は同じ強さ（r3 2026-10-10） */}
    <Cutout {...WIFE} cx={1140} top={55} h={780} rim="rgba(255,175,125,.8)" z={1} />
    <Cutout {...HUSBAND} cx={815} top={95} h={700} rim="rgba(150,185,255,.95)" z={2} />
    <Vignette strength={0.65} />
    <ThumbWord text="妻の不満が" size={WORD} top={220} />
    <ThumbWord text="増える時期" size={WORD} top={220 + WORD * 1.22} />
  </ThumbStage>
);

export default [{ id: "004-marriage-forty-dip-thumb", component: Thumb }];
