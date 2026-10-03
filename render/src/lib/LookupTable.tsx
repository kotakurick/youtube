// 自分に当てはめる表（3×3まで）。指が行の見出し → 列の見出し → 該当するマスの順にたどり、マスに蛍光ペンが敷かれる。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R, sp, useZ } from "./theme";

export const LookupTable: React.FC<{
  rowLabel: string; colLabel: string; rows: string[]; cols: string[]; values: string[][];
  target: [number, number]; start?: number;
}> = ({ rowLabel, colLabel, rows, cols, values, target, start = 0 }) => {
  if (rows.length > 3 || cols.length > 3) throw new Error("LookupTable: 表は3×3までにしてください。");
  const frame = useCurrentFrame() - start;
  const { fps, width, height } = useVideoConfig();
  const Z = useZ();
  const box = Z.stageWithGosa;
  const hw = Z.vertical ? 200 : 300; // 見出しの列の幅
  const cw = Math.min(300, (box.w - hw) / cols.length), rh = 120;
  const x0 = box.x + (box.w - hw - cw * cols.length) / 2, y0 = box.y + 60;
  const [tr, tc] = target;
  const appear = sp("enter", frame, fps);
  // 指の道筋：行の見出し → 列の見出し → マス
  const pts = [
    { x: x0 + hw / 2, y: y0 + rh * (tr + 1) + rh / 2 },
    { x: x0 + hw + cw * tc + cw / 2, y: y0 + rh / 2 },
    { x: x0 + hw + cw * tc + cw / 2, y: y0 + rh * (tr + 1) + rh / 2 },
  ];
  const seg = (a: number) => interpolate(frame - a, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const s1 = seg(30), s2 = seg(60), s3 = seg(90);
  const fx = s3 > 0 ? pts[1].x + (pts[2].x - pts[1].x) * s3 : s2 > 0 ? pts[0].x + (pts[1].x - pts[0].x) * s2 : pts[0].x;
  const fy = s3 > 0 ? pts[1].y + (pts[2].y - pts[1].y) * s3 : s2 > 0 ? pts[0].y + (pts[1].y - pts[0].y) * s2 : pts[0].y;
  const hit = interpolate(frame - 112, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cell = (x: number, y: number, w: number, fill: string, text: string, role: "label" | "value", key: string, mark = 0) => (
    <g key={key}>
      <rect x={x + 4} y={y + 4} width={w - 8} height={rh - 8} rx={R.md} fill={fill} />
      {mark > 0 && <rect x={x + 4} y={y + 4} width={(w - 8) * mark} height={rh - 8} rx={R.md} fill={C.marker} />}
      <text x={x + w / 2} y={y + rh / 2 + (role === "value" ? 22 : 14)} textAnchor="middle" style={font(role)}>{text}</text>
    </g>
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }} opacity={appear}>
      <text x={x0} y={y0 - 16} style={font("label", C.ink2)}>{rowLabel} ＼ {colLabel}</text>
      {cols.map((c, j) => cell(x0 + hw + cw * j, y0, cw, C.paper2, c, "label", `c${j}`))}
      {rows.map((r, i) => (
        <g key={i}>
          {cell(x0, y0 + rh * (i + 1), hw, C.paper2, r, "label", `r${i}`)}
          {cols.map((_, j) => cell(x0 + hw + cw * j, y0 + rh * (i + 1), cw, C.white, values[i][j], "value", `v${i}${j}`, i === tr && j === tc ? hit : 0))}
        </g>
      ))}
      {s1 > 0 && hit < 1 && (
        <g transform={`translate(${fx},${fy})`} opacity={s1}>
          <circle r={26} fill="none" stroke={C.ink} strokeWidth={LINE.base} />
        </g>
      )}
    </svg>
  );
};
