// 暮らし方の村の目印（預金・積立・稼ぐ力・起業・不動産・両方）。1つ約120px（s=1）。2本目 r > g で作った（2026-10-05）。
// 冒頭の「分かれ道の札」と第3章の村の札に同じ絵を使い、つなぎにする。
// 色はお金の意味の色：資産で増やす村＝金、稼ぐ力＝青緑、お金を借りる村（起業・不動産）＝赤、預金＝灰（増えないお金）。
export const VILLAGE_COLOR: Record<string, string> = { 預金: C.other, 積立: C.gold, 稼ぐ力: C.teal, 起業: C.debt, 不動産: C.debt, 両方: C.teal };
import React from "react";
import { C, LINE } from "./theme";

export type VillageKind = "預金" | "積立" | "稼ぐ力" | "起業" | "不動産" | "両方";
export const VILLAGES: VillageKind[] = ["預金", "積立", "稼ぐ力", "起業", "不動産", "両方"];
export const VillageIcon: React.FC<{ kind: VillageKind; x: number; y: number; s?: number }> = ({ kind, x, y, s = 1 }) => {
  const st = { stroke: C.ink, strokeWidth: LINE.thin / s, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const chart = (ox: number, oy: number, k = 1) => (
    <g transform={`translate(${ox},${oy}) scale(${k})`}>
      <rect x={-34} y={-30} width={68} height={60} rx={6} fill={C.goldTint} {...st} />
      <polyline points="-24,16 -10,2 2,10 22,-18" fill="none" {...st} stroke={C.gold} strokeWidth={8 / s} />
    </g>
  );
  const door = (ox: number, oy: number, k = 1) => (
    <g transform={`translate(${ox},${oy}) scale(${k})`}>
      <rect x={-24} y={-40} width={48} height={80} fill={C.tealTint} {...st} />
      <path d="M-24 -40 L8 -30 L8 48 L-24 40 Z" fill={C.teal} {...st} />
      <path d="M14 0 L34 0 M26 -8 L34 0 L26 8" fill="none" {...st} />
    </g>
  );
  let body: React.ReactNode;
  switch (kind) {
    case "預金": body = (<g>
      <rect x={-40} y={-30} width={80} height={60} rx={4} fill={C.goldTint} {...st} />
      <line x1={-40} x2={40} y1={-14} y2={-14} {...st} />
      {[0, 10].map((d) => <line key={d} x1={-28} x2={28} y1={2 + d} y2={2 + d} stroke={C.ink2} strokeWidth={3 / s} />)}
    </g>); break;
    case "積立": body = chart(0, 0); break;
    case "稼ぐ力": body = door(-6, 0); break;
    case "起業": body = (<g>
      <rect x={-40} y={-6} width={80} height={44} fill={C.white} {...st} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-44 + i * 22} -30 h22 v20 a11 11 0 0 1 -22 0 Z`} fill={i % 2 ? C.white : C.debt} {...st} />)}
      <rect x={-10} y={10} width={20} height={28} fill={C.ink} />
    </g>); break;
    case "不動産": body = (<g>
      <rect x={-28} y={-40} width={56} height={80} fill={C.debtTint} {...st} />
      {[-24, -6, 12].map((yy) => [-14, 6].map((xx) => <rect key={`${xx}${yy}`} x={xx} y={yy} width={9} height={11} fill={C.debt} />))}
    </g>); break;
    case "両方": body = (<g>{door(-26, 0, 0.75)}{chart(24, 0, 0.75)}</g>); break;
  }
  return <g transform={`translate(${x},${y}) scale(${s})`}>{body}</g>;
};

