// 棒グラフ。数字は伸びに合わせて数え上げる。読み上げは丸めた数字、画面には細かい値、の決まりに合わせて
// format で表示を変えられる。
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";

export type Bar = { label: string; value: number; color?: string };

export const BarChart: React.FC<{
  bars: Bar[]; x: number; y: number; width: number; height: number; max?: number; start?: number;
  duration?: number; format?: (v: number) => string; barWidth?: number;
}> = ({ bars, x, y, width, height, max, start = 0, duration = 45, format = (v) => `${Math.round(v)}%`, barWidth }) => {
  const frame = useCurrentFrame();
  const top = max ?? Math.max(...bars.map((b) => b.value));
  const p = interpolate(frame - start, [0, duration], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const slot = width / bars.length;
  const bw = barWidth ?? slot * 0.6;
  return (
    <g transform={`translate(${x},${y + height})`}>
      {bars.map((b, i) => {
        const h = (b.value / top) * height * p;
        const cx = slot * i + slot / 2;
        return (
          <g key={b.label}>
            <rect x={cx - bw / 2} y={-h} width={bw} height={h} rx={10} fill={b.color ?? C.ink} />
            <text x={cx} y={-h - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill={C.ink} opacity={p}>
              {format(b.value * p)}
            </text>
            <text x={cx} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.ink}>{b.label}</text>
          </g>
        );
      })}
      <line x1={0} y1={0} x2={width} y2={0} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
