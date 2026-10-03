// まとまりに付ける括弧とラベル（100マスや群衆の固まりに「ペア成立 38人」のように付ける）。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, LINE, sp } from "./theme";

export const Bracket: React.FC<{ x1: number; x2: number; y: number; label: string; side?: "top" | "bottom"; color?: string; start?: number }> = (
  { x1, x2, y, label, side = "top", color = C.ink, start = 0 },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  const d = side === "top" ? -1 : 1;
  const mid = (x1 + x2) / 2;
  return (
    <g opacity={t}>
      <path d={`M${x1} ${y} v${14 * d} H${x2} v${-14 * d}`} transform={`translate(0,${d * 4})`}
        fill="none" stroke={color} strokeWidth={LINE.thin} strokeLinecap="round" strokeLinejoin="round" />
      <text x={mid} y={y + d * (side === "top" ? 32 : 70)} textAnchor="middle" style={font("label", color)}>{label}</text>
    </g>
  );
};
