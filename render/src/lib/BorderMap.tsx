// 地図と国境線の比喩（2026-10-06 6本目「どこからが浮気」で作った）。
// ひとりひとりが持つ「浮気の線」を、紙の地図に引いた国境線で見せる。線の形は seed で変わる（人ごとに違う線）。
// 2枚を重ねる（overlay）と、線がずれている所が見える。線の色は持ち主の色（男女の色。人でない話のときは墨）。
// 地図の地は紙色（C.white）、海は描かない。国の名前は書かない（何の線かは札で言う）。
import React from "react";
import { rng } from "./random";
import { C, font, LINE, R } from "./theme";

/** 国境線の点（上から下へ、横に揺れる）。w,h は地図の大きさ、seed で形が変わる、shift で線全体を左右にずらす */
export const borderPath = (w: number, h: number, seed: number, shift = 0) => {
  const r = rng(seed * 97 + 13);
  const n = 7, pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) pts.push([w * 0.5 + shift + (r() - 0.5) * w * 0.28, (h * i) / n]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += ` C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`;
  }
  return d;
};

/** 1枚の地図。左上を x,y に。lines：重ねる国境線（色・seed）。label：地図の下の名札 */
export const BorderMap: React.FC<{
  x: number; y: number; w?: number; h?: number; lines: { color: string; seed: number; shift?: number; dash?: boolean }[];
  label?: string; labelColor?: string; tilt?: number;
}> = ({ x, y, w = 420, h = 300, lines, label, labelColor = C.ink, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt},${w / 2},${h / 2})`}>
    <rect data-qa="mark" data-qa-label={`地図${label ? "：" + label : ""}`} x={0} y={0} width={w} height={h} rx={R.md}
      fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
    {/* 地図らしさ：等高線を2本、道を1本（墨2の細線） */}
    <path d={`M${w * 0.08},${h * 0.72} q${w * 0.14},-${h * 0.18} ${w * 0.3},0 t${w * 0.3},0`} fill="none" stroke={C.rest} strokeWidth={LINE.hair} />
    <path d={`M${w * 0.6},${h * 0.18} q${w * 0.12},${h * 0.12} ${w * 0.3},${h * 0.04}`} fill="none" stroke={C.rest} strokeWidth={LINE.hair} />
    <path d={`M0,${h * 0.42} L${w},${h * 0.5}`} fill="none" stroke={C.rest} strokeWidth={LINE.hair} strokeDasharray="10 8" />
    {lines.map((l, i) => (
      <path key={i} data-qa="mark" data-qa-allow="mark" data-qa-label="国境線" d={borderPath(w, h, l.seed, l.shift ?? 0)} fill="none"
        stroke={l.color} strokeWidth={LINE.heavy * 0.7} strokeLinecap="round" strokeDasharray={l.dash ? "18 14" : undefined} />
    ))}
    {label && <text x={w / 2} y={h + 54} textAnchor="middle" style={font("label", labelColor)}>{label}</text>}
  </g>
);
