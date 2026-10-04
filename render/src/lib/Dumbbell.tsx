// 理想と実際を線でつなぐグラフ（ダンベル）。行ごとに2つの点（a＝白抜き、b＝塗り）と、その間の線。差が目で分かる。
// 軸は0から。値は点の外側に書く。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE } from "./theme";

export const Dumbbell: React.FC<{
  rows: { label: string; a: number; b: number }[]; aLabel: string; bLabel: string; max: number;
  x: number; y: number; width: number; rowH?: number; format?: (v: number) => string; start?: number; color?: string;
}> = ({ rows, aLabel, bLabel, max, x, y, width, rowH = 100, format = (v) => v.toFixed(1), start = 0, color = C.ink }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const labelW = 260, ax = x + labelW, aw = width - labelW - 120;
  const X = (v: number) => ax + (v / max) * aw;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${ax},${y - 30})`}>
        <circle cx={12} cy={-12} r={12} fill={C.bg} stroke={color} strokeWidth={LINE.thin} /><text x={34} y={0} style={font("label", C.ink2)}>{aLabel}</text>
        <circle cx={232} cy={-12} r={12} fill={color} /><text x={254} y={0} style={font("label", C.ink2)}>{bLabel}</text>
      </g>
      {rows.map((r, i) => {
        const cy = y + 40 + i * rowH;
        const p = interpolate(frame - 10 - i * 8, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const xb = X(r.a) + (X(r.b) - X(r.a)) * p;
        const left = Math.min(r.a, r.b) === r.a ? "a" : "b";
        return (
          <g key={r.label}>
            <text x={x} y={cy + 14} style={font("label")}>{r.label}</text>
            <line x1={ax} x2={ax + aw} y1={cy} y2={cy} stroke={C.paper2} strokeWidth={LINE.hair} />
            <line data-qa="mark" data-qa-label={`差：${r.label}`} x1={X(r.a)} x2={xb} y1={cy} y2={cy} stroke={color} strokeWidth={LINE.base} strokeLinecap="round" />
            <circle data-qa="mark" data-qa-label={`${aLabel}：${r.label}`} cx={X(r.a)} cy={cy} r={14} fill={C.bg} stroke={color} strokeWidth={LINE.thin} />
            <circle data-qa="mark" data-qa-label={`${bLabel}：${r.label}`} cx={xb} cy={cy} r={14 * Math.min(1, p * 2)} fill={color} />
            <text x={(left === "a" ? X(r.a) : xb) - 28} y={cy + 12} textAnchor="end" style={font("label", C.ink2)}>{format(left === "a" ? r.a : r.b)}</text>
            {p >= 1 && <text x={(left === "a" ? xb : X(r.a)) + 28} y={cy + 12} style={font("label")}>{format(left === "a" ? r.b : r.a)}</text>}
          </g>
        );
      })}
    </svg>
  );
};
