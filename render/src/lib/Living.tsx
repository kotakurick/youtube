// 居間の小道具（2026-10-06 6本目「どこからが浮気」で作った）：テレビ（Tv）とソファ（Sofa）。
// 決まりは Props.tsx と同じ：墨の線＋白・紙色・壁の色だけ。データの色（男女）は画面の中の人物だけに使う。
// 原点は床の中央。size は人物（Cat・Figure）の size と同じ物差し（size 1 で人の高さ約50px）。
// テレビの画面には、ドラマの1場面（ふたりで食卓を囲む人影）を小さく描ける（scene）。
import React from "react";
import { C, LINE, R } from "./theme";

const line = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** テレビ（台つき）。scene：画面の中身（"dinner"＝ふたりで夕食、"blank"＝消えている、"glow"＝光だけ） */
export const Tv: React.FC<{ x: number; y: number; size?: number; scene?: "dinner" | "blank" | "glow"; night?: boolean }> = (
  { x, y, size = 1, scene = "dinner", night = true },
) => {
  const k = size;
  const w = 150 * k, h = 86 * k, standH = 34 * k, legH = 18 * k;
  const top = -standH - legH - h;
  const scr = scene === "blank" ? C.ink : night ? "#3A4566" : C.white;
  return (
    <g data-qa="prop" data-qa-label="テレビ" transform={`translate(${x},${y})`}>
      {/* 台 */}
      <rect x={-w * 0.55} y={-standH} width={w * 1.1} height={standH} rx={R.sm} fill={C.paper2} {...line} />
      <line x1={-w * 0.55} y1={-standH / 2} x2={w * 0.55} y2={-standH / 2} {...line} strokeWidth={LINE.hair} />
      {/* 脚と枠 */}
      <rect x={-8 * k} y={-standH - legH} width={16 * k} height={legH} fill={C.ink} />
      <rect x={-w / 2} y={top} width={w} height={h} rx={R.sm} fill={C.ink} />
      <rect x={-w / 2 + 6 * k} y={top + 6 * k} width={w - 12 * k} height={h - 12 * k} rx={4} fill={scr} />
      {scene === "dinner" && (
        <g transform={`translate(0,${top + h - 14 * k})`}>
          {/* 食卓と、向かい合うふたり（人影。色はつけない） */}
          <rect x={-34 * k} y={-16 * k} width={68 * k} height={6 * k} rx={2} fill={C.wall} />
          <circle cx={-44 * k} cy={-40 * k} r={9 * k} fill={C.wall} />
          <rect x={-54 * k} y={-30 * k} width={20 * k} height={24 * k} rx={6 * k} fill={C.wall} />
          <circle cx={44 * k} cy={-40 * k} r={9 * k} fill={C.wall} />
          <rect x={34 * k} y={-30 * k} width={20 * k} height={24 * k} rx={6 * k} fill={C.wall} />
          <circle cx={0} cy={-58 * k} r={5 * k} fill="#FFE7A3" />
        </g>
      )}
    </g>
  );
};

/** テレビの光（夜の部屋で、画面から手前に広がる淡い扇形）。テレビの後ろに置く */
export const TvGlow: React.FC<{ x: number; y: number; size?: number; toX: number; spread?: number }> = ({ x, y, size = 1, toX, spread = 260 }) => (
  <path data-qa="bg" d={`M${x},${y - 110 * size} L${toX},${y - 110 * size - spread} L${toX},${y + 40} Z`} fill="#FFFFFF" opacity={0.08} />
);

/** ソファ（2人掛け）。原点＝床の中央。座面の高さは seatY(size) */
export const seatY = (size = 1) => -26 * size;
export const Sofa: React.FC<{ x: number; y: number; size?: number; w?: number }> = ({ x, y, size = 1, w = 150 }) => {
  const k = size, W = w * k;
  return (
    <g data-qa="prop" data-qa-label="ソファ" transform={`translate(${x},${y})`}>
      <rect x={-W / 2} y={-62 * k} width={W} height={40 * k} rx={14 * k} fill={C.paper2} {...line} />
      <rect x={-W / 2 + 4 * k} y={-30 * k} width={W - 8 * k} height={22 * k} rx={8 * k} fill={C.paper2} {...line} />
      <rect x={-W / 2 - 14 * k} y={-46 * k} width={22 * k} height={40 * k} rx={9 * k} fill={C.paper2} {...line} />
      <rect x={W / 2 - 8 * k} y={-46 * k} width={22 * k} height={40 * k} rx={9 * k} fill={C.paper2} {...line} />
      <line x1={-W / 2 + 6 * k} y1={-6 * k} x2={-W / 2 + 6 * k} y2={0} {...line} />
      <line x1={W / 2 - 6 * k} y1={-6 * k} x2={W / 2 - 6 * k} y2={0} {...line} />
    </g>
  );
};
