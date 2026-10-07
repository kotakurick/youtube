// 二本の物差し（3本目「普通の相手」で作った。2026-10-06。アニメーター・イラストレーター役の案）。
// 横の物差し（お金：金）と縦の物差し（身長：青緑）を直角に組み、その間に100人を並べた模式図。
//   - 横の並び＝お金の物差しの順（右ほど年収・学歴が上）。縦の並び＝身長の順（上ほど高い）。2つは別の物差し。
//   - 同じ物差しの上の条件（大学・年収）は縦の切り線どうしが平行で、きつい方（年収）の右に、ゆるい方（大学）を通った人がほぼそろう。
//   - 別の物差しの条件（身長）は横の切り線で、残った人をさらに上下に分ける。
// 決まり：模式図なので、場面の側で「模式図」と出す（人数の正確な値は別の場面とメモで）。人は Figure（男女の色）。
//   cuts.x は横の物差しの切り線（列の位置 0〜cols）、cuts.y は縦の物差しの切り線（行の位置 0〜rows、上から）。
//   原点は左上。人の高さは64px以上（size 1.3）。
import React from "react";
import { Figure, Kind } from "./Figure";
import { C, font, LINE, R } from "./theme";

export const TwoRulers: React.FC<{
  x: number; y: number; kind?: Kind; cols?: number; rows?: number; dx?: number; dy?: number; size?: number;
  xCuts?: { at: number; label: string; on: boolean }[]; yCut?: { at: number; label: string; on: boolean };
  xTitle?: string; yTitle?: string;
}> = ({ x, y, kind = "male", cols = 20, rows = 5, dx = 62, dy = 92, size = 1.3, xCuts = [], yCut, xTitle = "お金の物差し", yTitle = "身長" }) => {
  const gx = x + 120, gy = y + 20; // 人を並べる左上
  const W = cols * dx, Hh = rows * dy;
  const xOn = xCuts.filter((c) => c.on).reduce((m, c) => Math.max(m, c.at), -1);
  const pass = (c: number, r: number) => (xOn < 0 || c >= xOn) && (!yCut || !yCut.on || r < yCut.at);
  return (
    <g data-qa="mark" data-qa-label="二本の物差し">
      {/* 縦の物差し（身長） */}
      <rect x={x} y={gy} width={56} height={Hh} rx={R.sm} fill={C.tealTint} stroke={C.teal} strokeWidth={LINE.thin} />
      {Array.from({ length: rows * 2 + 1 }, (_, i) => <line key={i} x1={x + 56} x2={x + (i % 2 ? 40 : 28)} y1={gy + (i * Hh) / (rows * 2)} y2={gy + (i * Hh) / (rows * 2)} stroke={C.teal} strokeWidth={3} />)}
      <text x={x + 28} y={gy - 16} textAnchor="middle" style={font("label", C.teal)}>{yTitle}</text>
      {/* 横の物差し（お金） */}
      <rect x={gx} y={gy + Hh + 16} width={W} height={52} rx={R.sm} fill={C.goldTint} stroke={C.gold} strokeWidth={LINE.thin} />
      {Array.from({ length: cols + 1 }, (_, i) => <line key={i} x1={gx + i * dx} x2={gx + i * dx} y1={gy + Hh + 16} y2={gy + Hh + (i % 5 ? 32 : 44)} stroke={C.gold} strokeWidth={3} />)}
      <text x={gx + W} y={gy + Hh + 108} textAnchor="end" style={font("label", C.gold)}>{`${xTitle} →`}</text>
      {/* 人 */}
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        return <Figure key={i} kind={kind} x={gx + c * dx + dx / 2} y={gy + r * dy + dy - 14} size={size} dim={!pass(c, r)} />;
      })}
      {/* 切り線 */}
      {xCuts.map((c) => (
        <g key={c.label} opacity={c.on ? 1 : 0.35}>
          <line x1={gx + c.at * dx} x2={gx + c.at * dx} y1={gy - 10} y2={gy + Hh + 70} stroke={C.gold} strokeWidth={LINE.heavy} strokeDasharray={c.on ? undefined : "12 10"} />
          <text x={gx + c.at * dx} y={gy - 24} textAnchor="middle" style={font("label")}>{c.label}</text>
        </g>
      ))}
      {yCut && (
        <g opacity={yCut.on ? 1 : 0.35}>
          <line x1={gx - 10} x2={gx + W + 10} y1={gy + yCut.at * dy} y2={gy + yCut.at * dy} stroke={C.teal} strokeWidth={LINE.heavy} strokeDasharray={yCut.on ? undefined : "12 10"} />
          <text x={gx + W + 20} y={gy + yCut.at * dy + 14} style={font("label")}>{yCut.label}</text>
        </g>
      )}
    </g>
  );
};
