// 7本目のサムネイル案（2026-10-10。クラウドで決めきる：docs/process.md の16）。
// 1本目・6本目と同じ作り：はっきりした2色の地・明朝体の文字・主題は1つ。男女の回ではないので、色は本編の意味の色
// （青緑＝情報、金＝盗む側のお金）。地は暗い紺から青緑へ。
// 主題は「値札の付いた、盗まれたカード」（本編の最初の驚き：日本のカードは売り場で1枚約3,400円）。カードは架空の柄で、実在の会社に似せない。
// 人（where 案）は仮にコードのシルエット。オーナーが画像生成AIで作った人形（meta.md の指示文）を _local/episodes/007-data-leaks/thumb/ に置いたら差し替える。
// npx remotion still 007-data-leaks-thumb-price out/thumb-price.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Joints, Silhouette } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const NAVY = "#0B1E3A", TEAL = "#1E9483";
// サムネイル用の明るい金（暗い地から浮かせる。6本目と同じ。本編の C.gold は変えない）
const GOLD = "#FFC83D";

/** はっきりした2色の地（レビュー r1：上の紺と下の青緑を斜めに切る）。split を省くと前のグラデーション */
const Split: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    <rect x={0} y={0} width={W} height={H} fill={NAVY} />
    <polygon points={`0,${H * 0.55} ${W},${H * 0.42} ${W},${H} 0,${H}`} fill="#1FA390" />
    <line x1={0} y1={H * 0.55} x2={W} y2={H * 0.42} stroke={C.white} strokeWidth={6} />
  </svg>
);
const Ground: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="g7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={NAVY} /><stop offset="55%" stopColor="#0E3B4A" /><stop offset="100%" stopColor={TEAL} /></linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#g7)" />
  </svg>
);

/** 盗まれたカード（架空の柄）と、ひもで下げた値札。cx, cy はカードの中心 */
const PricedCard: React.FC<{ cx: number; cy: number; s?: number; price?: string; band?: string; bigTag?: boolean }> = ({ cx, cy, s = 1, price, band = TEAL, bigTag }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    <defs>
      <filter id="cd" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="10" dy="16" stdDeviation="12" floodColor="#000" floodOpacity="0.5" /></filter>
      <linearGradient id="cardG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F4F6FA" /><stop offset="100%" stopColor="#C9D3DE" /></linearGradient>
    </defs>
    <g transform={`translate(${cx} ${cy}) rotate(-10) scale(${s})`} filter="url(#cd)">
      <rect x={-260} y={-165} width={520} height={330} rx={30} fill="url(#cardG)" stroke={C.ink} strokeWidth={6} />
      <rect x={-260} y={-110} width={520} height={56} fill={band} />
      {/* ICチップ */}
      <rect x={-200} y={-20} width={86} height={66} rx={12} fill={GOLD} stroke={C.ink} strokeWidth={4} />
      <path d="M-200 13 H-114 M-157 -20 V46" stroke={C.ink} strokeWidth={3} />
      {/* 番号は伏せ字（実在の番号に見せない） */}
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-200 + k * 112} y={86} width={92} height={22} rx={11} fill="#8C97A6" />)}
      {/* ひも */}
      <path d="M215 -130 C 300 -150, 330 -60, 300 10" stroke={C.ink} strokeWidth={5} fill="none" />
      <circle cx={215} cy={-130} r={10} fill={NAVY} />
    </g>
    {price && bigTag && (
      // 値札を主役に（レビュー r1：幅450・高さ150、130px。r2：札を金に、「？円」は墨一色）
      <g transform={`translate(${cx + 210 * s} ${cy + 30 * s}) rotate(10)`} filter="url(#cd)">
        <path d="M0 0 L80 -75 H450 V75 H80 Z" fill={GOLD} stroke={C.ink} strokeWidth={7} />
        <circle cx={70} cy={0} r={14} fill={NAVY} />
        <text x={280} y={46} textAnchor="middle" style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 130 }}>
          <tspan fill={C.ink}>？円</tspan>
        </text>
      </g>
    )}
    {price && !bigTag && (
      <g transform={`translate(${cx + 230 * s} ${cy + 40 * s}) rotate(12)`} filter="url(#cd)">
        <path d="M0 0 L60 -50 H330 V50 H60 Z" fill={C.white} stroke={C.ink} strokeWidth={6} />
        <circle cx={58} cy={0} r={11} fill={NAVY} />
        <text x={200} y={26} textAnchor="middle" style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 72, fill: C.ink }}>{price}</text>
      </g>
    )}
  </svg>
);

const line = (size: number, color: string = C.white): React.CSSProperties => ({
  position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.1,
  whiteSpace: "nowrap", color, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))",
});

/** 案1：本編の最初の驚きの数字。上に主題、下に値段（数字はこの1つ） */
const Price: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Ground />
    <PricedCard cx={330} cy={480} s={0.85} />
    <div style={{ ...line(110), top: 30 }}>盗まれたカード</div>
    <div style={{ ...line(100), top: 250, left: 620, right: 0 }}>1枚</div>
    <div style={{ ...line(140, GOLD), top: 380, left: 600, right: 0 }}>約3,400円</div>
  </AbsoluteFill>
);

/** 案2：問いの形（数字なし）。値札は「？」 */
// レビュー r1：絵は実物のカードなので中身とのずれを「情報」で直す。「売れる」（売る側の目線）→「売られる」。金は「いくら」へ
const PriceQ: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Split />
    <PricedCard cx={400} cy={500} s={0.82} price="？円" band={NAVY} bigTag />
    <div style={{ ...line(108), top: 20 }}>盗まれたカード情報</div>
    <div style={{ ...line(112), top: 150 }}><span style={{ color: GOLD }}>いくら</span>で売られる？</div>
  </AbsoluteFill>
);

/** スマホを見下ろす人（仮。オーナーの人形の画像に差し替える） */
const PHONE: Joints = {
  head: [30, -900], headR: [56, 60], headTilt: 14, neck: [10, -835],
  shoulderL: [-96, -780], shoulderR: [96, -780], hipL: [-66, -478], hipR: [66, -478], waist: 0.05,
  elbowL: [-110, -600], handL: [40, -700], elbowR: [120, -600], handR: [60, -690],
  kneeL: [-44, -240], footL: [-54, 0], kneeR: [46, -240], footR: [58, 0], hair: "short",
};
/** 案3：行き先（数字なし）。人がスマホのおわびを見ていて、その先へ情報が流れていく */
const Where: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Ground />
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <defs><filter id="wd"><feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.45" /></filter></defs>
      <g filter="url(#wd)"><Silhouette j={PHONE} x={270} y={H + 560} size={1.25} color="#F1F3F7" gap="rgba(10,20,60,.85)" /></g>
      <rect x={300} y={-700 * 1.25 + H + 560 - 70} width={70} height={120} rx={12} fill={C.ink} transform={`rotate(-12 335 ${-700 * 1.25 + H + 560})`} />
    </svg>
    <PricedCard cx={800} cy={530} s={0.6} price="？円" />
    <div style={{ ...line(130), top: 24, left: 380, right: 0 }}>漏れた情報の</div>
    <div style={{ ...line(130, GOLD), top: 170, left: 380, right: 0 }}>行き先</div>
  </AbsoluteFill>
);

export default [
  { id: "007-data-leaks-thumb-price", component: Price },
  { id: "007-data-leaks-thumb-priceq", component: PriceQ },
  { id: "007-data-leaks-thumb-where", component: Where },
];
