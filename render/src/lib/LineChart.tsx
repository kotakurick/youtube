// 推移の折れ線。線は7px、約45fかけて左から描く。端に点を付け、ラベルは線の端に直接書く（凡例は使わない）。
// 注目の1本（focus）は墨か性別の色、ほかは rest。eras で時代の札（縦の点線＋札）を付けられる。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R } from "./theme";

export type Series = { label: string; points: [number, number][]; color?: string; focus?: boolean };

export const LineChart: React.FC<{
  series: Series[]; x: number; y: number; width: number; height: number;
  xDomain: [number, number]; yDomain: [number, number]; xTicks?: number[]; format?: (v: number) => string;
  eras?: { x: number; label: string }[]; start?: number; duration?: number;
}> = ({ series, x, y, width, height, xDomain, yDomain, xTicks = [], format = (v) => `${v}`, eras = [], start = 0, duration = 45 }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const X = (v: number) => x + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * width;
  const Y = (v: number) => y + height - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * height;
  const p = interpolate(frame, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const done = interpolate(frame - duration, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 描き出しは x の位置で切る（全部の線が同じ速さで右へ伸びる）
  const cut = xDomain[0] + (xDomain[1] - xDomain[0]) * p;
  const clip = (pts: [number, number][]) => {
    const out: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      const [a, b] = pts[i];
      if (a <= cut) { out.push([a, b]); continue; }
      if (i > 0) { const [a0, b0] = pts[i - 1]; out.push([cut, b0 + ((b - b0) * (cut - a0)) / (a - a0)]); }
      break;
    }
    return out;
  };
  // 線の端のラベルが重ならないように、上から順に間をあける（注目の線は2行なので広く）
  const labelY = new Map<string, number>();
  const ends = series.map((s) => ({ s, pts: clip(s.points) })).filter((e) => e.pts.length >= 2)
    .map(({ s, pts }) => ({ s, y: Y(pts[pts.length - 1][1]) })).sort((a, b) => a.y - b.y);
  let prev = -Infinity;
  for (const e of ends) {
    const y = Math.max(e.y, prev);
    labelY.set(e.s.label, y);
    prev = y + (e.s.focus ? 100 : 50);
  }
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      {eras.map((e) => (
        <g key={e.label} opacity={done}>
          <line x1={X(e.x)} x2={X(e.x)} y1={y} y2={y + height} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="6 8" />
          <rect x={X(e.x) + 8} y={y - 4} width={e.label.length * 30 + 24} height={44} rx={R.sm} fill={C.paper2} />
          <text x={X(e.x) + 20} y={y + 30} style={font("note", C.ink)}>{e.label}</text>
        </g>
      ))}
      <line x1={x} x2={x + width} y1={y + height} y2={y + height} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      {xTicks.map((t) => <text key={t} x={X(t)} y={y + height + 48} textAnchor="middle" style={font("label", C.ink2)}>{t}</text>)}
      {/* 注目しない線を先に、注目の線を手前に */}
      {[...series].sort((a, b) => Number(!!a.focus) - Number(!!b.focus)).map((s) => {
        const pts = clip(s.points);
        if (pts.length < 2) return null;
        const color = s.color ?? (s.focus ? C.ink : C.rest);
        const [ex, ey] = pts[pts.length - 1];
        return (
          <g key={s.label}>
            <polyline data-qa="mark" data-qa-label={`線：${s.label}`} points={pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")} fill="none" stroke={color} strokeWidth={LINE.base} strokeLinecap="round" strokeLinejoin="round" />
            <circle data-qa="mark" data-qa-label={`線の端：${s.label}`} cx={X(ex)} cy={Y(ey)} r={10} fill={color} />
            {done > 0 && (
              <text x={X(ex) + 22} y={(labelY.get(s.label) ?? Y(ey)) + 14} style={font(s.focus ? "value" : "label", s.focus ? C.ink : C.ink2)} opacity={done}>
                {format(ey)}{s.focus ? "" : ` ${s.label}`}
              </text>
            )}
            {done > 0 && s.focus && <text x={X(ex) + 22} y={(labelY.get(s.label) ?? Y(ey)) + 56} style={font("label")} opacity={done}>{s.label}</text>}
          </g>
        );
      })}
    </svg>
  );
};
