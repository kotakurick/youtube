// 004 のサムネイル案（2026-10-07）。様式は 001 の Duo にそろえる：左右2色の地（夫＝青・妻＝赤）・白い人・明朝体の大きな文字。
// 主題は本編の天秤：夫婦の時間はつり合っている（水平）のに、妻の側だけ心が離れる。人は仮のシルエット（オーナーが画像生成AIで作った人形に差し替える。指示文は meta.md）。
// 2人は同じ白・同じ大きさにして、片方だけをみじめに見せない。ゴサは出さない（男女の話の回）。
// npx remotion still src/index.ts 004-marriage-forty-dip-thumb-a out/004-thumb-a.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { MAN_STAND, Silhouette, WOMAN_HUG } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const SPLIT = { blue: ["#0E2A5C", "#2F6FDE"], red: ["#5C0E14", "#D8261A"] } as const;
// 2026-10-07 レビュー r1：人を大きく（高さ約300px）、梁を太く、糸は外側の台形にして頭と重ねない
const BEAM = { y: 360, l: 300, r: 980, t: 22 }, PAN = { y: 680, w: 320 }, HANG = 40;
const WHITE = "rgba(255,255,255,.95)", YELLOW = "#FFE36A";
const SHADOW = "drop-shadow(0 8px 8px rgba(0,0,0,.8))";

/** 水平の天秤（白）。皿の上に2人が立つ */
const Scale: React.FC = () => (
  <g fill={WHITE} stroke={WHITE}>
    <rect x={W / 2 - 10} y={BEAM.y} width={20} height={H - BEAM.y} stroke="none" />
    <rect x={BEAM.l - HANG} y={BEAM.y - BEAM.t / 2} width={BEAM.r - BEAM.l + HANG * 2} height={BEAM.t} rx={BEAM.t / 2} stroke="none" />
    <circle cx={W / 2} cy={BEAM.y} r={26} stroke="none" />
    {[BEAM.l, BEAM.r].map((x) => (
      <g key={x}>
        <line x1={x - HANG} y1={BEAM.y} x2={x - PAN.w / 2} y2={PAN.y} strokeWidth={5} />
        <line x1={x + HANG} y1={BEAM.y} x2={x + PAN.w / 2} y2={PAN.y} strokeWidth={5} />
        <path d={`M${x - PAN.w / 2 - 10} ${PAN.y} H${x + PAN.w / 2 + 10} Q${x} ${PAN.y + 56} ${x - PAN.w / 2 - 10} ${PAN.y} Z`} stroke="none" />
      </g>
    ))}
  </g>
);

type Run = { t: string; px: number; hi?: boolean };
/** 大きな文字（明朝体）。1行の中で大きさと色に強弱をつける */
const Big: React.FC<{ lines: Run[][] }> = ({ lines }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, lineHeight: 1.0 }}>
    {lines.map((l, i) => (
      <div key={i} style={{ letterSpacing: -2, filter: SHADOW, marginTop: i ? 6 : 0 }}>
        {l.map((r) => <span key={r.t} style={{ fontSize: r.px, color: r.hi ? YELLOW : C.white }}>{r.t}</span>)}
      </div>
    ))}
  </div>
);

const Duo: React.FC<{ lines: Run[][]; voice?: string }> = ({ lines, voice }) => (
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
      {/* 夫：背すじを伸ばして正面（うまくいっていると思っている）。妻：肘を抱えて顔を外へそらす（助手席の窓）。同じ白・同じ大きさ */}
      <Silhouette j={MAN_STAND} x={BEAM.l} y={PAN.y + 4} size={0.31} color={WHITE} />
      <Silhouette j={WOMAN_HUG} x={BEAM.r} y={PAN.y + 4} size={0.31} color={WHITE} />
    </svg>
    <Big lines={lines} />
    {voice && (
      <div style={{ position: "absolute", left: 1032, top: 400, fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 80, whiteSpace: "nowrap", color: C.white,
        WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill", filter: SHADOW }}>{voice}</div>
    )}
  </AbsoluteFill>
);

// A：時期を伏せる。主語は「妻の不満」にして、本編の数字（不満の妻は15人に1人 → 4人に1人近く）の範囲で言う
const A: React.FC = () => <Duo lines={[[{ t: "妻の不満が", px: 132, hi: true }], [{ t: "増える時期", px: 132 }]]} voice="うん。" />;
// B：2分を出す。主語を置かず、2人とも冷める本編の判定と合わせる
const B: React.FC = () => (
  <Duo lines={[[{ t: "差は", px: 120 }, { t: "2分", px: 160, hi: true }], [{ t: "なのに", px: 96 }, { t: "冷める", px: 140, hi: true }]]} voice="うん。" />
);

export default [
  { id: "004-marriage-forty-dip-thumb-a", component: A },
  { id: "004-marriage-forty-dip-thumb-b", component: B },
];
