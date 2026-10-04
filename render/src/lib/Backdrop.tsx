// 背景（物語の冒頭の情景）。墨2（ink2）の細い線と紙色2（paper2）の面だけで描き、データの色（男女・注目）と混ざらない。
// 部屋・駅のホーム・夜の街・職場の机。variant で窓の数・建物の高さなどが変わるので、毎回の構図を変えられる。
// 人物（Figure・Crowd）と小道具（Props）は別に置く。floor は床（人の足元）の高さ。
import React from "react";
import { useVideoConfig } from "remotion";
import { rng } from "./random";
import { C, LINE, R } from "./theme";

export type BackdropKind = "room" | "station" | "night" | "office" | "washitsu" | "wedding";

/** 部屋・職場の背景で、壁に何も描かない横の範囲（時計・カレンダーを置く場所） */
export const WALL_FREE = { x1: 0.45, x2: 0.7 } as const;

const st = { stroke: C.ink2, strokeWidth: LINE.thin, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const thin = { ...st, strokeWidth: LINE.hair };

export const Backdrop: React.FC<{ kind: BackdropKind; floor?: number; variant?: number }> = ({ kind, floor = 880, variant = 0 }) => {
  const { width: W, height: H } = useVideoConfig();
  const r = rng(variant * 31 + kind.length);
  const pick = (a: number, b: number) => a + r() * (b - a);
  let body: React.ReactNode = null;
  if (kind === "room") {
    // 窓は片側、扉は反対側。真ん中（横 45〜70%）の壁は空けておく（時計・カレンダー用。WALL_FREE）
    const flip = variant % 2 === 1;
    const X = (x: number, w: number) => (flip ? W - x - w : x);
    const ww = pick(260, 380), wx = X(pick(0.08, 0.2) * W, ww), dx = X(W - 330 - pick(0, 80), 190);
    body = (
      <>
        <line x1={0} x2={W} y1={floor - 6} y2={floor - 6} {...st} />
        <line x1={0} x2={W} y1={floor - 30} y2={floor - 30} {...thin} />
        <rect x={wx} y={floor - 560} width={ww} height={300} rx={R.sm} fill={C.paper2} {...st} />
        <path d={`M${wx + ww / 2} ${floor - 560} V${floor - 260} M${wx} ${floor - 410} H${wx + ww}`} {...thin} />
        <rect x={dx} y={floor - 470} width={190} height={440} rx={R.sm} fill="none" {...st} />
      </>
    );
  } else if (kind === "station") {
    const n = 3 + Math.floor(r() * 2);
    body = (
      <>
        {/* 屋根と柱 */}
        <line x1={0} x2={W} y1={floor - 640} y2={floor - 640} {...st} />
        {Array.from({ length: n }, (_, i) => {
          const x = ((i + 0.5) / n) * W + pick(-40, 40);
          return <rect key={i} x={x - 18} y={floor - 640} width={36} height={640 - 40} fill={C.paper2} {...thin} />;
        })}
        {/* 駅名の看板（文字は入れない） */}
        <rect x={pick(0.2, 0.6) * W} y={floor - 560} width={360} height={90} rx={R.sm} fill={C.white} {...st} />
        <line x1={0} x2={W} y1={floor - 40} y2={floor - 40} {...st} />
        {/* 点字ブロックの線と、ホームの端 */}
        <line x1={0} x2={W} y1={floor + 30} y2={floor + 30} {...st} strokeDasharray="18 14" />
        <rect x={0} y={floor + 60} width={W} height={H - floor - 60} fill={C.paper2} />
        <line x1={0} x2={W} y1={floor + 60} y2={floor + 60} {...st} />
      </>
    );
  } else if (kind === "night") {
    const xs: number[] = [];
    for (let x = -40; x < W; x += pick(160, 260)) xs.push(x);
    body = (
      <>
        <circle cx={pick(0.6, 0.9) * W} cy={pick(140, 220)} r={46} fill="none" {...st} />
        {xs.map((x, i) => {
          const w = pick(140, 240), h = pick(260, 560);
          return (
            <g key={i}>
              <rect x={x} y={floor - h} width={w} height={h} fill={C.paper2} {...thin} />
              {Array.from({ length: Math.floor(h / 70) }, (_, row) => Array.from({ length: Math.floor(w / 60) }, (_, col) => (
                r() < 0.45 ? <rect key={`${row}-${col}`} x={x + 18 + col * 60} y={floor - h + 24 + row * 70} width={28} height={36} rx={3} fill={C.white} /> : null
              )))}
            </g>
          );
        })}
        {[0.25, 0.75].map((f) => {
          const x = f * W + pick(-60, 60);
          return <path key={f} d={`M${x} ${floor} V${floor - 330} Q${x} ${floor - 360} ${x + 40} ${floor - 360} H${x + 60}`} fill="none" {...st} />;
        })}
        <line x1={0} x2={W} y1={floor} y2={floor} {...st} />
      </>
    );
  } else if (kind === "washitsu") {
    // 和室（昔の見合いの情景）：障子・畳・床の間と掛け軸
    const flip = variant % 2 === 1;
    const X = (x: number, w: number) => (flip ? W - x - w : x);
    const n = 4;
    body = (
      <>
        <line x1={0} x2={W} y1={floor - 6} y2={floor - 6} {...st} />
        {/* 障子 */}
        {Array.from({ length: n }, (_, i) => {
          const x0 = X(120 + i * 230, 220);
          return (
            <g key={i}>
              <rect x={x0} y={floor - 600} width={220} height={590} fill={C.white} {...st} />
              {[1, 2, 3, 4, 5].map((r) => <line key={r} x1={x0} x2={x0 + 220} y1={floor - 600 + r * 98} y2={floor - 600 + r * 98} {...thin} />)}
              {[1, 2].map((c) => <line key={c} x1={x0 + c * 73} x2={x0 + c * 73} y1={floor - 600} y2={floor - 10} {...thin} />)}
            </g>
          );
        })}
        {/* 床の間と掛け軸 */}
        <rect x={X(W - 560, 380)} y={floor - 640} width={380} height={634} fill={C.paper2} {...st} />
        <rect x={X(W - 430, 120)} y={floor - 580} width={120} height={380} rx={4} fill={C.white} {...st} />
        <rect x={X(W - 560, 380)} y={floor - 60} width={380} height={54} fill={C.white} {...st} />
        {/* 畳の目 */}
        <path d={`M0 ${floor + 50} H${W} M${W * 0.3} ${floor} L${W * 0.25} ${H} M${W * 0.7} ${floor} L${W * 0.75} ${H}`} {...thin} />
      </>
    );
  } else if (kind === "wedding") {
    // 結婚式場：アーチ、バージンロード、両側の席
    const cx = W / 2 + (variant % 3 - 1) * 120;
    body = (
      <>
        <path d={`M${cx - 260} ${floor} V${floor - 420} Q${cx - 260} ${floor - 640} ${cx} ${floor - 660} Q${cx + 260} ${floor - 640} ${cx + 260} ${floor - 420} V${floor}`}
          fill={C.white} {...st} />
        <path d={`M${cx - 200} ${floor} V${floor - 400} Q${cx - 200} ${floor - 580} ${cx} ${floor - 596} Q${cx + 200} ${floor - 580} ${cx + 200} ${floor - 400} V${floor}`}
          fill="none" {...thin} />
        {[-1, 1].map((s) => [0, 1, 2].map((k) => (
          <circle key={`${s}${k}`} cx={cx + s * (300 + k * 40)} cy={floor - 430 + k * 60} r={26} fill={C.paper2} {...thin} />
        )))}
        <path d={`M${cx - 90} ${floor} L${cx - 260} ${H} M${cx + 90} ${floor} L${cx + 260} ${H}`} {...st} />
        <rect x={cx - 90} y={floor} width={180} height={H - floor} fill={C.paper2} />
        {[-1, 1].map((s) => [0, 1, 2, 3].map((k) => (
          <rect key={`b${s}${k}`} x={s < 0 ? cx - 420 - k * 260 : cx + 160 + k * 260} y={floor - 70} width={240} height={64} rx={R.sm} fill={C.paper2} {...thin} />
        )))}
        <line x1={0} x2={W} y1={floor} y2={floor} {...st} />
      </>
    );
  } else {
    // 職場（机は小道具の Desk を人物と一緒に置く）
    const flip = variant % 2 === 1;
    const X = (x: number, w: number) => (flip ? W - x - w : x);
    body = (
      <>
        <line x1={0} x2={W} y1={floor - 6} y2={floor - 6} {...st} />
        <rect x={X(W - 620, 440)} y={floor - 640} width={440} height={320} rx={4} fill={C.paper2} {...st} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={X(W - 620, 440)} x2={X(W - 620, 440) + 440} y1={floor - 600 + i * 40} y2={floor - 600 + i * 40} {...thin} />)}
        <path d={`M${X(120, 300)} ${floor - 520} h300 M${X(120, 300)} ${floor - 400} h300`} {...st} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={X(120, 300) + 20 + i * 50} y={floor - 600 + (i % 2) * 10} width={36} height={80 - (i % 2) * 10} fill={C.paper2} {...thin} />)}
      </>
    );
  }
  return (
    <svg data-qa="bg" width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={W} height={H} fill={C.bg} />
      {body}
    </svg>
  );
};
