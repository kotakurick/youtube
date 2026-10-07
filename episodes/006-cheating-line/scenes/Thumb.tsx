// 6本目のサムネイル案（2026-10-07。クラウドで決めきる：docs/process.md の16）。
// 1本目と同じ作り：白い人・はっきりした2色の地・明朝体の文字。ゴサは出さない（男女の話の回）。
// 地を斜めの線2本で3つに分け、左（彼の青）と右（彼女の橙）の間の灰色のくさびが「2人の線がずれる所」（本編の灰色の行動と同じ意味）。
// 2人は同じ大きさ・同じ白・同じ姿勢（腕を組んで外を向く）にして、片方だけを悪く見せない。
// 人は仮にコードのシルエット。オーナーが画像生成AIで作った人形（meta.md の指示文）を _local/episodes/006-cheating-line/thumb/ に置いたら AI 版に差し替える。
// npx remotion still 006-cheating-line-thumb-match out/thumb-match.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Joints, Silhouette } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const BLUE = ["#0A2A6B", "#2F6FDE"], RED = ["#5A1A08", C.female], GRAY = ["#3A3A3E", "#77767A"];
// 2本の境目（上の x・下の x）。間が灰色のくさび
const L1 = [560, 470], L2 = [700, 820];

/** 腕を組んで、顔を少し外へ向ける（正面）。flip で左右を返す */
const ARMS_CROSSED = (hair: "short" | "long", skirt = false): Joints => ({
  head: [10, hair === "long" ? -900 : -905], headR: hair === "long" ? [52, 64] : [56, 60], headTilt: 8, neck: [2, -835],
  shoulderL: [-96, -780], shoulderR: [96, -780], hipL: [-66, -478], hipR: [66, -478], waist: hair === "long" ? 0.2 : 0.05,
  elbowL: [-112, -620], handL: [70, -650], elbowR: [112, -612], handR: [-66, -668],
  kneeL: [-44, -240], footL: [-54, 0], kneeR: [46, -240], footR: [58, 0],
  hair, skirt,
});

const Ground: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="tB" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={BLUE[1]} /><stop offset="100%" stopColor={BLUE[0]} /></linearGradient>
      <linearGradient id="tR" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={RED[1]} /><stop offset="100%" stopColor={RED[0]} /></linearGradient>
      <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRAY[0]} /><stop offset="100%" stopColor={GRAY[1]} /></linearGradient>
      <linearGradient id="tShade" gradientUnits="userSpaceOnUse" x1="-160" y1="-1000" x2="200" y2="-300"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#F1F3F7" /><stop offset="100%" stopColor="#C9CFDB" /></linearGradient>
      <filter id="tDrop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.45" /></filter>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#tR)" />
    <polygon points={`${L1[0]},0 ${L2[0]},0 ${L2[1]},${H} ${L1[1]},${H}`} fill="url(#tG)" />
    <polygon points={`0,0 ${L1[0]},0 ${L1[1]},${H} 0,${H}`} fill="url(#tB)" />
    <line x1={L1[0]} y1={0} x2={L1[1]} y2={H} stroke="#FFFFFF" strokeWidth={6} />
    <line x1={L2[0]} y1={0} x2={L2[1]} y2={H} stroke="#FFFFFF" strokeWidth={6} />
    {/* 2人：同じ大きさ・同じ白。腰から下は画面の外 */}
    <g filter="url(#tDrop)"><Silhouette j={ARMS_CROSSED("short")} x={250} y={H + 404} size={0.75} color="url(#tShade)" gap="rgba(10,20,60,.85)" /></g>
    <g filter="url(#tDrop)"><Silhouette j={ARMS_CROSSED("long", true)} x={1030} y={H + 404} size={0.75} color="url(#tShade)" gap="rgba(60,10,0,.85)" flip /></g>
  </svg>
);

const Band: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center" }}>
    <span style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 80, color: C.ink, background: C.white, padding: "0 28px", borderRadius: 8 }}>{text}</span>
  </div>
);
const Big: React.FC<{ text: string; top: number; size: number; color?: string }> = ({ text, top, size, color = C.white }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size,
    lineHeight: 1.1, whiteSpace: "nowrap", color, WebkitTextStroke: color === C.white ? undefined : `6px ${C.ink}`, paintOrder: "stroke fill",
    filter: "drop-shadow(0 6px 8px rgba(0,0,0,.6))" }}>{text}</div>
);

/** 案1：本編の主役の数字（無作為の男女の組で、32の行動の線が全部そろうのは約170組に1組）。そろう＝金（本編と同じ意味の色） */
const Match: React.FC = () => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground />
    <Band text="どこからが浮気？" />
    <Big text="線がぴったり合う" top={138} size={84} />
    <Big text="170組に1組" top={238} size={160} color={C.gold} />
  </AbsoluteFill>
);

/** 案2：逆説（ずれる数は男女の組でも同性どうしでも同じ）。数字なし */
const NotSex: React.FC = () => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground />
    <Band text="どこからが浮気？" />
    <Big text="ずれるのは" top={138} size={84} />
    <Big text="男女の差じゃない" top={246} size={136} />
  </AbsoluteFill>
);

export default [
  { id: "006-cheating-line-thumb-match", component: Match },
  { id: "006-cheating-line-thumb-notsex", component: NotSex },
];
