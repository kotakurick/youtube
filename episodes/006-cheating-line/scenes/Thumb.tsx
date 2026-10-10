// 6本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 絵は冒頭の物語：夜、明かりを落とした部屋でドラマを見ていた2人。彼は手を開いて「セーフでしょ」、彼女は腕を組んで彼を見る。
// 人形とソファ（からし色）は1枚の画像（Gemini の API、緑の背景 → scripts/chroma_key.py。Git の外。指示文は meta.md）。
// 2人は同じ白・同じ光にして、どちらも悪く見せない（男女の回。ゴサは出さない）。
// 言葉は2案（meta.md）：A「男女で／基準は同じ？」・B「どこから／浮気？」。
// npx remotion still src/index.ts 006-cheating-line-thumb-a out/006-thumb-a.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cutout, TYELLOW, ThumbStage, ThumbWord, Vignette } from "@lib/ThumbKit";

const T = "episodes/006-cheating-line/thumb/";
// ソファはからし色（2026-10-10 オーナー「人間と家具は同じ色でわかりにくいから家具は色付けていい」）。男女の色（青・橙）と緑は避けた
const SOFA = { src: `${T}sofa-mustard.png`, aspect: 818 / 672 };

type Line = { text: string; size: number; color?: string };
// 2026-10-10 レビュー（review/thumbnail-gemini.md）：地を明るく、左下に橙の光（人形には当てない）、人形を大きく
const Scene: React.FC<{ lines: [Line, Line]; top: number }> = ({ lines, top }) => (
  <ThumbStage ground={["#1A2658", "#5B2A5A"]}>
    <div style={{
      position: "absolute", left: 280 - 350, top: 560 - 350, width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,179,71,.18) 0%, rgba(255,179,71,0) 70%)",
    }} />
    {/* 手前のテレビの光（青白い光が2人を照らす） */}
    <div style={{
      position: "absolute", left: 950 - 460, top: 330 - 420, width: 920, height: 840, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(140,180,255,.30) 0%, rgba(120,150,255,.12) 40%, rgba(120,150,255,0) 68%)",
    }} />
    {/* 床の影 */}
    <div style={{
      position: "absolute", left: 950 - 330, top: 615, width: 660, height: 80, borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 70%)",
    }} />
    <AbsoluteFill style={{ filter: "brightness(1.1) contrast(1.05)" }}>
      <Cutout {...SOFA} cx={950} top={150} h={500} rim="rgba(150,185,255,.35)" />
    </AbsoluteFill>
    <Vignette strength={0.75} />
    <ThumbWord {...lines[0]} top={top} />
    <ThumbWord {...lines[1]} top={top + lines[0].size * 1.22} />
  </ThumbStage>
);

const ThumbA: React.FC = () => <Scene lines={[{ text: "男女で", size: 104 }, { text: "基準は同じ？", size: 104 }]} top={210} />;
// B：白・同じ大きさの2行（2026-10-10 オーナー「色や大きさの強調もなくていいかも」）
const ThumbB: React.FC = () => <Scene lines={[{ text: "どこから", size: 132 }, { text: "浮気？", size: 132 }]} top={190} />;
// B2：レビューの案（「浮気？」を黄・大きく）。比べる用
const ThumbB2: React.FC = () => <Scene lines={[{ text: "どこから", size: 116 }, { text: "浮気？", size: 160, color: TYELLOW }]} top={190} />;

export default [
  { id: "006-cheating-line-thumb-a", component: ThumbA },
  { id: "006-cheating-line-thumb-b", component: ThumbB },
  { id: "006-cheating-line-thumb-b2", component: ThumbB2 },
];
