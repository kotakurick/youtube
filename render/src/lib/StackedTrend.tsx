// 構成比の推移（100%積み上げの横帯）。調査回ごとに1本、上から順に帯が左から伸びる。
// 区分は6つまで。注目の区分（focus）だけ色を付け、ほかは墨の濃淡（色はデータの意味にだけ使う）。
// 注目の区分は、帯と帯の間を線でつないで推移を見せる。区分名は最後の帯の下に直接書く（凡例は使わない）。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R } from "./theme";

export type TrendRow = { label: string; values: number[] }; // values は区分の順。合計が100でなくても割合に直す

/** 注目しない区分の色（薄い→濃い）。注目の区分の色は focusColor */
const GRAYS = ["#E2DDD0", "#CFC9BC", "#B9B8B5", "#9C9C9A", "#7E8290"];

export const StackedTrend: React.FC<{
  categories: string[]; rows: TrendRow[]; focus: number; focusColor?: string;
  x: number; y: number; width: number; barH?: number; gap?: number; start?: number; stagger?: number; duration?: number;
}> = ({ categories, rows, focus, focusColor = C.ink, x, y, width, barH = 56, gap = 34, start = 0, stagger = 18, duration = 30 }) => {
  if (categories.length > 6) throw new Error("StackedTrend: 区分は6つまでにしてください。");
  for (const r of rows) if (r.values.length !== categories.length) throw new Error(`StackedTrend: ${r.label} の値の数が区分の数と違います。`);
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const labelW = 150, bx = x + labelW, bw = width - labelW;
  let gi = 0;
  const colors = categories.map((_, i) => (i === focus ? focusColor : GRAYS[(gi++ * 2) % GRAYS.length]));
  // 各帯の区分の左端と幅（0〜1）
  const segs = rows.map((r) => {
    const sum = r.values.reduce((a, b) => a + b, 0);
    let acc = 0;
    return r.values.map((v) => { const s = { x0: acc / sum, w: v / sum, v: (v / sum) * 100 }; acc += v; return s; });
  });
  const prog = rows.map((_, i) => interpolate(frame - i * stagger, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }));
  const Y = (i: number) => y + i * (barH + gap);
  const last = segs[segs.length - 1], lastY = Y(rows.length - 1) + barH;
  const allDone = prog[prog.length - 1];
  // 区分名の位置（最後の帯の区分の中央。近すぎたら右へずらす）
  const names: { x: number; i: number }[] = [];
  let minX = -Infinity;
  last.forEach((s, i) => {
    const cx = Math.max(bx + (s.x0 + s.w / 2) * bw, minX);
    names.push({ x: cx, i });
    minX = cx + categories[i].length * 34 + 24;
  });
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      {/* 注目の区分の推移（帯の間を線でつなぐ） */}
      {rows.slice(1).map((_, k) => {
        const i = k + 1, a = segs[i - 1][focus], b = segs[i][focus];
        const t = prog[i];
        if (t < 1) return null;
        return (
          <g key={i} stroke={focusColor} strokeWidth={LINE.hair} opacity={0.8}>
            <line x1={bx + a.x0 * bw} y1={Y(i - 1) + barH} x2={bx + b.x0 * bw} y2={Y(i)} />
            <line x1={bx + (a.x0 + a.w) * bw} y1={Y(i - 1) + barH} x2={bx + (b.x0 + b.w) * bw} y2={Y(i)} />
          </g>
        );
      })}
      {rows.map((r, i) => (
        <g key={r.label} opacity={prog[i] > 0 ? 1 : 0}>
          <text x={x} y={Y(i) + barH / 2 + 14} style={font("label", C.ink2)}>{r.label}</text>
          {/* 帯は左から伸びる（区分が順に増えて見える） */}
          <clipPath id={`trend-${i}`}><rect x={bx} y={Y(i)} width={bw * prog[i]} height={barH} /></clipPath>
          <g clipPath={`url(#trend-${i})`}>
            {segs[i].map((s, j) => (
              <rect key={j} x={bx + s.x0 * bw + (j ? 1.5 : 0)} y={Y(i)} width={Math.max(0, s.w * bw - (j ? 1.5 : 0))} height={barH} fill={colors[j]}
                rx={j === 0 || j === segs[i].length - 1 ? R.sm : 0} />
            ))}
          </g>
          {/* 注目の区分の値 */}
          {prog[i] >= 1 && (
            <text x={bx + (segs[i][focus].x0 + segs[i][focus].w) * bw + 14} y={Y(i) + barH / 2 + 14}
              style={font("label", C.ink)} opacity={interpolate(frame - i * stagger - duration, [0, 8], [0, 1], { extrapolateRight: "clamp" })}>
              {Math.round(segs[i][focus].v)}%
            </text>
          )}
        </g>
      ))}
      {/* 区分名（最後の帯の下） */}
      <g opacity={allDone}>
        {names.map(({ x: nx, i }) => (
          <g key={i}>
            <line x1={bx + (last[i].x0 + last[i].w / 2) * bw} x2={nx} y1={lastY + 6} y2={lastY + 22} stroke={C.ink2} strokeWidth={LINE.hair} />
            <text x={nx} y={lastY + 62} textAnchor="middle" style={font("label", i === focus ? C.ink : C.ink2)}>{categories[i]}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};
