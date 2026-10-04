// 「ふつうの幅」：自分に当てはめる場面。目盛りの上に、ふつうの幅（例：真ん中の半分の人）を誤差棒で描く（ゴサのひげと同じ形）。
// 指（▼）が端から端まで動いて止まるので、見る人は自分の値と見比べる。you を渡すと、その位置に「あなた」を出す。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, sp, useZ } from "./theme";

export const NormalRange: React.FC<{
  min: number; max: number; step: number; lo: number; hi: number; mid?: number; unit?: string;
  label?: string; note?: string; you?: number; start?: number; format?: (v: number) => string;
}> = ({ min, max, step, lo, hi, mid, unit = "", label = "ふつうの幅", note, you, start = 0, format = (v) => `${v}` }) => {
  const frame = useCurrentFrame() - start;
  const { fps, width, height } = useVideoConfig();
  const Z = useZ();
  const box = Z.stageWithGosa;
  const x0 = box.x + 40, x1 = box.x + box.w - 40, axisY = box.y + box.h * 0.62;
  const X = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const axis = sp("enter", frame, fps);
  const band = interpolate(frame - 15, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const cx = (X(lo) + X(hi)) / 2, half = ((X(hi) - X(lo)) / 2) * band;
  const by = axisY - 190;
  // 指が端から端まで動く（考える間）→ you があればそこで止まる
  const sweep = interpolate(frame - 60, [0, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const target = you ?? max;
  const px = X(min) + (X(target) - X(min)) * sweep;
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      <g opacity={axis}>
        <line x1={x0} x2={x1} y1={axisY} y2={axisY} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X(v)} x2={X(v)} y1={axisY} y2={axisY + 14} stroke={C.ink} strokeWidth={LINE.hair} />
            <text x={X(v)} y={axisY + 60} textAnchor="middle" style={font("label", C.ink2)}>{format(v)}{unit}</text>
          </g>
        ))}
      </g>
      {/* ふつうの幅（誤差棒） */}
      <g data-qa="mark" data-qa-label="ふつうの幅" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" opacity={band > 0 ? 1 : 0}>
        <line x1={cx - half} x2={cx + half} y1={by} y2={by} />
        <line x1={cx - half} x2={cx - half} y1={by - LINE.base * 2} y2={by + LINE.base * 2} />
        <line x1={cx + half} x2={cx + half} y1={by - LINE.base * 2} y2={by + LINE.base * 2} />
      </g>
      {mid !== undefined && <circle cx={X(mid)} cy={by} r={14 * band} fill={C.ink} />}
      <rect x={cx - 120} y={by - 92} width={240} height={20} rx={4} fill={C.marker} opacity={band} />
      <text x={cx} y={by - 70} textAnchor="middle" style={font("value")} opacity={band}>{label}</text>
      <text x={cx} y={by + 70} textAnchor="middle" style={font("label", C.ink2)} opacity={band}>{format(lo)}〜{format(hi)}{unit}</text>
      {note && <text x={x0} y={axisY + 130} style={font("body", C.ink2)} opacity={band}>{note}</text>}
      {/* 指 */}
      {sweep > 0 && (
        <g transform={`translate(${px},${axisY - 20})`}>
          <path d="M-16 -26 H16 L0 0 Z" fill={C.ink} />
          {you !== undefined && sweep >= 1 && <text x={0} y={-40} textAnchor="middle" style={font("label")}>あなた</text>}
        </g>
      )}
    </svg>
  );
};
