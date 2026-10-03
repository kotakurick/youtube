// もう一方の側：男女を左右対称に並べて比べる（男女を扱う回は、両側のデータを必ず出す決まり）。
// 真ん中に項目名、左に男性・右に女性の棒が中央から外へ伸びる。男女の左右は固定（男性が左）。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./Figure";
import { C, EASE, font, R, useZ } from "./theme";

export type SideRow = { label: string; male: number; female: number };

export const BothSides: React.FC<{ rows: SideRow[]; max: number; format?: (v: number) => string; start?: number; title?: string }> = (
  { rows, max, format = (v) => `${Math.round(v)}%`, start = 0, title },
) => {
  const frame = useCurrentFrame() - start;
  const { width, height } = useVideoConfig();
  const Z = useZ();
  const box = Z.stageWithGosa;
  const mid = box.x + box.w / 2, labelW = Z.vertical ? 240 : 320, barMax = box.w / 2 - labelW / 2 - 130;
  const rh = Math.min(110, (box.h - 120) / rows.length);
  const y0 = box.y + 110;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      {title && <text x={mid} y={box.y + 10} textAnchor="middle" style={font("label", C.ink2)}>{title}</text>}
      <Figure kind="male" x={mid - labelW / 2 - 60} y={box.y + 78} size={1.1} />
      <text x={mid - labelW / 2 - 100} y={box.y + 70} textAnchor="end" style={font("label", C.male)}>男性</text>
      <Figure kind="female" x={mid + labelW / 2 + 60} y={box.y + 78} size={1.1} />
      <text x={mid + labelW / 2 + 100} y={box.y + 70} style={font("label", C.female)}>女性</text>
      {rows.map((r, i) => {
        const p = interpolate(frame - 8 - i * 6, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const cy = y0 + i * rh + rh / 2;
        const wm = (r.male / max) * barMax * p, wf = (r.female / max) * barMax * p;
        return (
          <g key={r.label}>
            <text x={mid} y={cy + 14} textAnchor="middle" style={font("label")}>{r.label}</text>
            <rect x={mid - labelW / 2 - wm} y={cy - 26} width={wm} height={52} rx={R.sm} fill={C.male} />
            <rect x={mid + labelW / 2} y={cy - 26} width={wf} height={52} rx={R.sm} fill={C.female} />
            <text x={mid - labelW / 2 - wm - 16} y={cy + 14} textAnchor="end" style={font("label")} opacity={p}>{format(r.male * p)}</text>
            <text x={mid + labelW / 2 + wf + 16} y={cy + 14} style={font("label")} opacity={p}>{format(r.female * p)}</text>
          </g>
        );
      })}
    </svg>
  );
};
