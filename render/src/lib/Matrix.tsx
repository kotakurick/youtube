// 組み合わせの表（夫婦の学歴の組み合わせなど）。行×列は5×5まで。値が大きいほど濃い墨。対角（同じどうし）を枠で強調できる。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, LINE, R } from "./theme";
import { SHADES } from "./TileMap";

export const Matrix: React.FC<{
  rowLabel: string; colLabel: string; rows: string[]; cols: string[]; values: number[][]; max?: number;
  x: number; y: number; cell?: number; diagonal?: boolean; format?: (v: number) => string; start?: number;
}> = ({ rowLabel, colLabel, rows, cols, values, max, x, y, cell = 120, diagonal = false, format = (v) => `${Math.round(v)}%`, start = 0 }) => {
  if (rows.length > 5 || cols.length > 5) throw new Error("Matrix: 表は5×5までにしてください。");
  const frame = useCurrentFrame() - start;
  const { width, height } = useVideoConfig();
  const top = max ?? Math.max(...values.flat());
  const hw = 220, x0 = x + hw, y0 = y + 130;
  // 列の見出しはマスの幅に収まる大きさにする（28px 未満にはしない）
  const colFont = (c: string) => Math.max(28, Math.min(40, Math.floor((cell - 12) / c.length)));
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      <text x={x0} y={y + 40} style={font("label", C.ink2)}>{colLabel} →</text>
      <text x={x} y={y0 - 20} style={font("label", C.ink2)}>{rowLabel} ↓</text>
      {cols.map((c, j) => <text key={c} x={x0 + j * cell + cell / 2} y={y0 - 20} textAnchor="middle" style={{ ...font("label"), fontSize: colFont(c) }}>{c}</text>)}
      {rows.map((r, i) => (
        <g key={r}>
          <text x={x0 - 20} y={y0 + i * cell + cell / 2 + 14} textAnchor="end" style={font("label")}>{r}</text>
          {cols.map((_, j) => {
            const v = values[i][j];
            const t = interpolate(frame - (i + j) * 4, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const level = Math.min(4, Math.floor((v / top) * 5));
            return (
              <g key={j} opacity={t} data-qa-allow="mark">
                <rect data-qa="mark" data-qa-label={`${r}×${cols[j]}`} x={x0 + j * cell + 3} y={y0 + i * cell + 3} width={cell - 6} height={cell - 6} rx={R.sm} fill={SHADES[level]} />
                <text x={x0 + j * cell + cell / 2} y={y0 + i * cell + cell / 2 + 14} textAnchor="middle" style={font("label", level >= 3 ? C.white : C.ink)}>{format(v)}</text>
              </g>
            );
          })}
        </g>
      ))}
      {diagonal && rows.map((_, i) => i < cols.length && (
        <rect key={i} x={x0 + i * cell - 2} y={y0 + i * cell - 2} width={cell + 4} height={cell + 4} rx={R.sm + 2} fill="none" stroke={C.marker} strokeWidth={LINE.base} />
      ))}
    </svg>
  );
};
