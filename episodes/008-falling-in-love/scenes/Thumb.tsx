// 8本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 人形は Gemini の API（scripts/gemini_image.py。指示文は meta.md）→ scripts/chroma_key.py で抜いた PNG
// （render/public/episodes/008-falling-in-love/thumb/。Git の外。元は _local/episodes/008-falling-in-love/thumb/doll-src3.png）。
// 情景：夜。長い条件の表（ケプラーの表）を手に持ったまま、顔は表ではなく右上の光を見上げている。
// 光は暖かい色、空は紺から紫。星は少しだけ（冒頭の天文学者）。男女の対立の回ではないので、人形は1人・性別を強く出さない。
// npx remotion still src/index.ts 008-falling-in-love-thumb-after out/008-thumb.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cutout, ThumbStage, ThumbWord, TW, TYELLOW, Vignette } from "@lib/ThumbKit";

const DOLL = { src: "episodes/008-falling-in-love/thumb/doll.png", aspect: 378 / 1088 };

/** 右上の暖かい光と、まばらな星 */
const Sky: React.FC = () => {
  let s = 8 * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 1150px 70px, rgba(255,214,140,.95) 0%, rgba(255,150,120,.55) 20%, rgba(200,90,150,.30) 46%, rgba(0,0,0,0) 66%)" }} />
      <svg width={TW} height={720} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={560 + rnd() * 700} cy={rnd() * 360} r={1.2 + rnd() * 2.2} fill="#FFF6DD" opacity={0.35 + rnd() * 0.5} />
        ))}
      </svg>
    </>
  );
};

const WORD = 132;
// レビュー r1（review/thumbnail-r1.md）：地を明るく・光を文字の側へ広げる・人形を右下から少し離す・字を大きく。
// hi＝黄にする行（全部白だと何が言いたいか立たない。r1）
const Thumb: React.FC<{ lines: [string, string]; size?: number; hi?: 0 | 1 }> = ({ lines, size = WORD, hi }) => (
  <ThumbStage ground={["#1B2258", "#5A2E78"]}>
    <Sky />
    <Cutout {...DOLL} cx={990} top={24} h={720} rim="rgba(255,200,140,.75)" glow={{ x: 0.62, y: 0.1, r: 120 }} />
    <Vignette strength={0.4} />
    <ThumbWord text={lines[0]} size={size} top={210} color={hi === 0 ? TYELLOW : undefined} />
    <ThumbWord text={lines[1]} size={size} top={210 + size * 1.22} color={hi === 1 ? TYELLOW : undefined} />
  </ThumbStage>
);

export default [
  // A：締め（結晶は好きになったあとから付きはじめる。S68 スタンダール・S65 フランクファート・S16 の読み直し）。
  // 「条件の表は当たらない」は、好みが網としてある程度当たる（S20）ので言い過ぎとしてやめた
  { id: "008-falling-in-love-thumb-after", component: () => <Thumb lines={["好きな理由は", "あとから付く"]} size={114} /> },
  // B：第3章の山（好きになった人に合わせて、好みの条件のほうが変わる。S20 Gerlach 2019）。タイトル B と分担
  { id: "008-falling-in-love-thumb-rewrite", component: () => <Thumb lines={["好みのほうが", "書き換わる"]} hi={1} /> },
  // B'（r1 の任意の案）：「ほう」の比べる相手を見せる。本編の「動いたのは、条件のほうだった」と同じ語
  { id: "008-falling-in-love-thumb-joken", component: () => <Thumb lines={["条件のほうが", "書き換わる"]} hi={1} /> },
  // C：B を自分に当てはめる言い方
  { id: "008-falling-in-love-thumb-type", component: () => <Thumb lines={["理想のタイプは", "あとで変わる"]} size={100} /> },
];
