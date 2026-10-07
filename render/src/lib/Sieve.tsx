// ふるい（3本目「普通の相手」で作った。2026-10-06。イラストレーター役の案）。
// 楕円の縁・斜めの網・取っ手。台形はボウルや電灯の笠に見えた（第1版）ので、縁と網で「ふるい」と分かる形にする。
// 決まり：墨の線＋白・紙色。dashed は「見えていない／数え忘れている」ふるい（相手の側）。原点は縁の中心、w は幅 px。
import React from "react";
import { C, font, LINE } from "./theme";

export const Sieve: React.FC<{ x: number; y: number; w?: number; label?: string; dashed?: boolean; tilt?: number }> = (
  { x, y, w = 420, label, dashed = false, tilt = 0 },
) => {
  const rx = w / 2, ry = w * 0.16, depth = w * 0.28;
  const dash = dashed ? "14 10" : undefined;
  const id = `mesh-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g data-qa="prop" data-qa-label={label ? `ふるい：${label}` : "ふるい"} transform={`translate(${x},${y}) rotate(${tilt})`}>
      <defs>
        <pattern id={id} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={18} stroke={C.ink2} strokeWidth={2} />
          <line x1={0} y1={0} x2={18} y2={0} stroke={C.ink2} strokeWidth={2} />
        </pattern>
      </defs>
      {/* 取っ手 */}
      <rect x={rx - 6} y={-10} width={w * 0.32} height={20} rx={10} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={dash} />
      {/* 胴（浅い鉢） */}
      <path d={`M${-rx} 0 Q${-rx * 0.9} ${depth} 0 ${depth} Q${rx * 0.9} ${depth} ${rx} 0`} fill={dashed ? C.paper2 : C.white} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray={dash} />
      {/* 網 */}
      <ellipse cx={0} cy={0} rx={rx - 10} ry={ry - 6} fill={`url(#${id})`} />
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeDasharray={dash} />
      {label && <text x={0} y={-ry - 22} textAnchor="middle" style={font("label")}>{label}</text>}
    </g>
  );
};
