// シミュレーションのばらつきを見せる。条件ごとに1行：やり直した結果を小さな点で1つずつ打ち、
// 最後に「9割が入る幅」を誤差棒（ゴサのひげと同じ形）で引き、平均を大きな点で示す。
// 2つの条件の幅が重なれば「条件次第」、離れていれば言い切れる（rangesOverlap）。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { rng } from "./random";
import type { Spread } from "./sim/spread";
import { C, EASE, font, LINE } from "./theme";

export const SimSpread: React.FC<{
  rows: { label: string; spread: Spread; color?: string }[]; domain: [number, number];
  x: number; y: number; width: number; rowH?: number; unit?: string; ticks?: number[]; start?: number; duration?: number;
}> = ({ rows, domain, x, y, width, rowH = 150, unit = "人", ticks = [], start = 0, duration = 90 }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const labelW = 300, ax = x + labelW, aw = width - labelW;
  const X = (v: number) => ax + ((v - domain[0]) / (domain[1] - domain[0])) * aw;
  const runs = rows[0]?.spread.values.length ?? 0;
  const shown = Math.round(interpolate(frame, [0, duration], [0, runs], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }));
  const bar = interpolate(frame - duration, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const axisY = y + rows.length * rowH;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      <text x={ax} y={y - 24} style={font("label", C.ink2)}>やり直し {shown}回</text>
      {rows.map((r, i) => {
        const cy = y + i * rowH + rowH / 2, color = r.color ?? C.ink;
        const jit = rng(i + 3);
        const s = r.spread;
        return (
          <g key={r.label}>
            <text x={x} y={cy + 14} style={font("label")}>{r.label}</text>
            {s.values.slice(0, shown).map((v, k) => (
              <circle key={k} data-qa="mark" data-qa-label="1回の結果" cx={X(v)} cy={cy - 30 + (jit() - 0.5) * 30} r={5} fill={color} opacity={0.35} />
            ))}
            {bar > 0 && (
              <g data-qa="mark" data-qa-label={`9割の幅：${r.label}`} stroke={color} strokeWidth={LINE.base} strokeLinecap="round">
                <line x1={X(s.mean) - (X(s.mean) - X(s.lo)) * bar} x2={X(s.mean) + (X(s.hi) - X(s.mean)) * bar} y1={cy + 20} y2={cy + 20} />
                <line x1={X(s.mean) - (X(s.mean) - X(s.lo)) * bar} x2={X(s.mean) - (X(s.mean) - X(s.lo)) * bar} y1={cy + 6} y2={cy + 34} />
                <line x1={X(s.mean) + (X(s.hi) - X(s.mean)) * bar} x2={X(s.mean) + (X(s.hi) - X(s.mean)) * bar} y1={cy + 6} y2={cy + 34} />
              </g>
            )}
            {bar > 0 && <circle data-qa="mark" data-qa-label={`平均：${r.label}`} cx={X(s.mean)} cy={cy + 20} r={13 * bar} fill={color} />}
            {bar >= 1 && (
              <text x={X(s.hi) + 28} y={cy + 34} style={font("label")}>
                {Math.round(s.mean)}{unit}<tspan style={font("note", C.ink2)}>（9割は{Math.round(s.lo)}〜{Math.round(s.hi)}{unit}）</tspan>
              </text>
            )}
          </g>
        );
      })}
      <line x1={ax} x2={ax + aw} y1={axisY} y2={axisY} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      {ticks.map((t) => <text key={t} x={X(t)} y={axisY + 48} textAnchor="middle" style={font("label", C.ink2)}>{t}{unit}</text>)}
    </svg>
  );
};
