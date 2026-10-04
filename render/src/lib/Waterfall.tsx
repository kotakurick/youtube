// 要因を分けるグラフ（滝グラフ）。最初の値 → 要因ごとの増減 → 最後の値。増減の棒は宙に浮き、隣と細い線でつながる。
// 例：出生数の減少を「結婚の減少」と「夫婦の子どもの数の減少」に分ける。focus の要因だけ墨、ほかは rest。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R } from "./theme";

export const Waterfall: React.FC<{
  from: { label: string; value: number }; steps: { label: string; delta: number }[]; to: string;
  x: number; y: number; width: number; height: number; min?: number; max?: number; focus?: number; format?: (v: number) => string; start?: number;
}> = ({ from, steps, to, x, y, width, height, min = 0, max, focus, format = (v) => `${Math.round(v)}`, start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const vals = [from.value];
  for (const s of steps) vals.push(vals[vals.length - 1] + s.delta);
  const top = max ?? Math.max(...vals) * 1.1;
  const Y = (v: number) => y + height - ((v - min) / (top - min)) * height;
  const n = steps.length + 2, slot = width / n, bw = Math.min(160, slot * 0.6);
  const cols = [
    { label: from.label, a: min, b: from.value, kind: "total" as const, text: format(from.value) },
    ...steps.map((s, i) => ({ label: s.label, a: vals[i], b: vals[i + 1], kind: "step" as const, i, text: `${s.delta >= 0 ? "＋" : "−"}${format(Math.abs(s.delta))}` })),
    { label: to, a: min, b: vals[vals.length - 1], kind: "total" as const, text: format(vals[vals.length - 1]) },
  ];
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      {cols.map((c, k) => {
        const p = interpolate(frame - k * 14, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const cx = x + slot * k + slot / 2;
        const y0 = Y(Math.max(c.a, c.b)), y1 = Y(Math.min(c.a, c.b));
        const fill = c.kind === "total" ? C.ink : "i" in c && c.i === focus ? C.ink2 : C.rest;
        const next = cols[k + 1];
        return (
          <g key={k} opacity={p > 0 ? 1 : 0}>
            <rect data-qa="mark" data-qa-label={c.label} x={cx - bw / 2} y={y0 + (y1 - y0) * (1 - p)} width={bw} height={(y1 - y0) * p} rx={R.sm / 2} fill={fill} />
            {next && p >= 1 && <line x1={cx + bw / 2} x2={cx + slot - bw / 2} y1={Y(c.b)} y2={Y(c.b)} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="6 6" />}
            <text x={cx} y={y0 - 16} textAnchor="middle" style={font(c.kind === "total" ? "value" : "label")} opacity={p}>{c.text}</text>
            <text x={cx} y={y + height + 52} textAnchor="middle" style={font("label", C.ink)}>{c.label}</text>
          </g>
        );
      })}
      <line x1={x} x2={x + width} y1={Y(min)} y2={Y(min)} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
    </svg>
  );
};
