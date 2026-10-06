// 夜のワンルーム（物語の冒頭と締めで同じ部屋・同じ窓を使う。2本目 r > g で作った。2026-10-05）。
// 窓の中に雪・雲を出せる（締めで「窓の外に雪」）。主人公は Cat を BEDROOM.bed の上や窓の前に置く。
// 色は theme.ts の物語の場面の色（wall・floor・night）。
import React from "react";
import { C, LINE, R } from "./theme";
import { Cloud, Snow } from "./Snowball";

export const BEDROOM = { floor: 880, win: { x: 1080, y: 150, w: 520, h: 400 }, bed: { x: 180, y: 690, w: 700, h: 120 } };
export const Bedroom: React.FC<{ snow?: boolean; cloud?: boolean; moonlight?: boolean }> = ({ snow = false, cloud = false, moonlight = false }) => {
  const { win, bed, floor } = BEDROOM;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={floor} fill={C.wall} />
      <rect x={0} y={floor} width={1920} height={1080 - floor} fill={C.floor} />
      <line x1={0} x2={1920} y1={floor} y2={floor} stroke={C.ink2} strokeWidth={LINE.thin} />
      {/* 窓：夜の空（墨）、三日月 */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={R.sm} fill={C.night} stroke={C.ink} strokeWidth={LINE.base} />
      <path d={`M${win.x + 420} ${win.y + 70} a44 44 0 1 0 30 76 a36 36 0 1 1 -30 -76 Z`} fill={C.white} />
      {cloud && <Cloud x={win.x + 210} y={win.y + 110} w={300} />}
      {snow && <Snow x={win.x + 30} y={win.y + (cloud ? 180 : 40)} w={win.w - 60} h={cloud ? 190 : 330} n={cloud ? 22 : 34} s={9} color={C.white} />}
      <line x1={win.x + win.w / 2} x2={win.x + win.w / 2} y1={win.y} y2={win.y + win.h} stroke={C.paper2} strokeWidth={LINE.thin} />
      <rect x={win.x - 16} y={win.y + win.h} width={win.w + 32} height={18} fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} />
      {/* 窓から床へ落ちる光（最後の場面） */}
      {moonlight && <path d={`M${win.x + 40} ${floor} L${win.x + win.w - 40} ${floor} L${win.x + win.w + 140} 1000 L${win.x - 60} 1000 Z`} fill={C.white} opacity={0.7} />}
      {/* ベッド */}
      <rect x={bed.x} y={bed.y} width={bed.w} height={bed.h} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={bed.x + 20} y={bed.y - 40} width={170} height={60} rx={30} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={bed.x} y={bed.y + bed.h} width={24} height={floor - bed.y - bed.h} fill={C.ink} />
      <rect x={bed.x + bed.w - 24} y={bed.y + bed.h} width={24} height={floor - bed.y - bed.h} fill={C.ink} />
      {/* 時計：1時10分 */}
      <g transform="translate(700,230)">
        <circle r={56} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <line x1={0} y1={0} x2={22} y2={-30} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
        <line x1={0} y1={0} x2={40} y2={14} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};
