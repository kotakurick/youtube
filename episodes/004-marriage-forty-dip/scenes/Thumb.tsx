// 004 のサムネイル案（2026-10-07）。様式は 001 の Duo にそろえる：左右2色の地（夫＝青・妻＝赤）・白い人・明朝体の大きな文字。
// 主題は本編の天秤：夫婦の時間はつり合っている（水平）のに、妻の側だけ心が離れる。人は仮のシルエット（オーナーが画像生成AIで作った人形に差し替える。指示文は meta.md）。
// 2人は同じ白・同じ大きさにして、片方だけをみじめに見せない。ゴサは出さない（男女の話の回）。
// npx remotion still src/index.ts 004-marriage-forty-dip-thumb-a out/004-thumb-a.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { MAN_SLUMP, Silhouette, WOMAN_PHONE } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const SPLIT = { blue: ["#0E2A5C", "#2F6FDE"], red: ["#5C0E14", "#D8261A"] } as const;
const BEAM = { y: 352, l: 250, r: 1030 }, PAN = { y: 650, w: 300 };
const WHITE = "rgba(255,255,255,.95)";

/** 水平の天秤（白）。皿の上に2人が立つ */
const Scale: React.FC = () => (
  <g fill={WHITE} stroke={WHITE}>
    {/* 柱と台 */}
    <rect x={W / 2 - 9} y={BEAM.y} width={18} height={H - BEAM.y} stroke="none" />
    <circle cx={W / 2} cy={BEAM.y} r={20} stroke="none" />
    {/* 梁（水平） */}
    <rect x={BEAM.l} y={BEAM.y - 7} width={BEAM.r - BEAM.l} height={14} rx={7} stroke="none" />
    {/* 糸と皿 */}
    {[BEAM.l, BEAM.r].map((x) => (
      <g key={x}>
        <line x1={x} y1={BEAM.y} x2={x - PAN.w / 2} y2={PAN.y} strokeWidth={4} />
        <line x1={x} y1={BEAM.y} x2={x + PAN.w / 2} y2={PAN.y} strokeWidth={4} />
        <path d={`M${x - PAN.w / 2 - 10} ${PAN.y} H${x + PAN.w / 2 + 10} Q${x} ${PAN.y + 60} ${x - PAN.w / 2 - 10} ${PAN.y} Z`} stroke="none" />
      </g>
    ))}
  </g>
);

const Big: React.FC<{ lines: [string, string]; accent: 0 | 1 }> = ({ lines, accent }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, lineHeight: 1.08 }}>
    {lines.map((l, i) => (
      <div key={l} style={{ fontSize: 132, letterSpacing: -2, color: i === accent ? "#FFE36A" : C.white, filter: "drop-shadow(0 8px 8px rgba(0,0,0,.8))" }}>{l}</div>
    ))}
  </div>
);

const Duo: React.FC<{ lines: [string, string]; accent: 0 | 1 }> = ({ lines, accent }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        {[SPLIT.blue, SPLIT.red].map((c) => (
          <radialGradient key={c[0]} id={`g${c[0]}`} cx="50%" cy="85%" r="85%">
            <stop offset="0%" stopColor={c[1]} /><stop offset="100%" stopColor={c[0]} />
          </radialGradient>
        ))}
      </defs>
      <rect x={0} y={0} width={W / 2} height={H} fill={`url(#g${SPLIT.blue[0]})`} />
      <rect x={W / 2} y={0} width={W / 2} height={H} fill={`url(#g${SPLIT.red[0]})`} />
      <Scale />
      {/* 夫：スマホを見下ろす。妻：額に手を当てる。同じ白・同じ大きさ */}
      <Silhouette j={MAN_SLUMP} x={BEAM.l} y={PAN.y + 4} size={0.27} color={WHITE} />
      <Silhouette j={WOMAN_PHONE} x={BEAM.r} y={PAN.y + 4} size={0.255} color={WHITE} />
    </svg>
    <Big lines={lines} accent={accent} />
  </AbsoluteFill>
);

// A：時期を伏せる（タイトルに「2分」を入れる組み合わせ）
const A: React.FC = () => <Duo lines={["妻が冷める", "時期がある"]} accent={0} />;
// B：2分を出す（タイトルに数字を入れない組み合わせ）
const B: React.FC = () => <Duo lines={["差は2分", "なのに冷める"]} accent={1} />;

export default [
  { id: "004-marriage-forty-dip-thumb-a", component: A },
  { id: "004-marriage-forty-dip-thumb-b", component: B },
];
