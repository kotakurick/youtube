// 男女2本ずつ並べる縦棒（区分ごとに 男性｜女性）。縦軸は0から（誇張しない）。値は棒の上に直接書く。
// 男女の左右は固定（男性が左）。どちらの棒かは、最初の区分の上に人型と「男性」「女性」を置いて示す（凡例の箱は使わない）。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./Figure";
import { C, EASE, font, LINE, R } from "./theme";

export const PairedBars: React.FC<{
  rows: { label: string; male: number; female: number }[]; max?: number; x: number; y: number; width: number; height: number;
  format?: (v: number) => string; start?: number;
  names?: [string, string]; // 凡例の名前（既定「男性」「女性」。夫婦の回は「夫」「妻」。2026-10-06）
}> = ({ rows, max, x, y, width, height, format = (v) => `${Math.round(v)}%`, start = 0, names = ["男性", "女性"] }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const top = max ?? Math.max(...rows.flatMap((r) => [r.male, r.female]));
  const slot = width / rows.length, bw = Math.min(110, slot * 0.32), base = y + height;
  const H_ = (v: number) => (v / top) * height;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      {rows.map((r, i) => {
        const p = interpolate(frame - i * 6, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const cx = x + slot * i + slot / 2;
        const bars = [{ v: r.male, c: C.male, dx: -bw - 4, k: "男性" }, { v: r.female, c: C.female, dx: 4, k: "女性" }];
        return (
          <g key={r.label}>
            {bars.map((b) => {
              const h = H_(b.v) * p;
              return (
                <g key={b.k}>
                  <rect data-qa="mark" data-qa-label={`${b.k}：${r.label}`} x={cx + b.dx} y={base - h} width={bw} height={h} rx={R.sm / 2} fill={b.c} />
                  <text x={cx + b.dx + bw / 2} y={base - h - 16} textAnchor="middle" style={font("label")} opacity={p}>{format(b.v * p)}</text>
                </g>
              );
            })}
            <text x={cx} y={base + 52} textAnchor="middle" style={font("label")}>{r.label}</text>
          </g>
        );
      })}
      <line x1={x} x2={x + width} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      <g transform={`translate(${x},${y - 60})`}>
        <Figure kind="male" x={14} y={10} size={0.9} /><text x={36} y={6} style={font("label", C.male)}>{names[0]}</text>
        {/* 2つ目の凡例は1つ目の名前の長さに合わせて右へ（「男性どうし」のように長い名前で重なったので。2026-10-06） */}
        <Figure kind="female" x={Math.max(164, 36 + names[0].length * 40 + 50)} y={10} size={0.9} />
        <text x={Math.max(186, 58 + names[0].length * 40 + 50)} y={6} style={font("label", C.female)}>{names[1]}</text>
      </g>
    </svg>
  );
};
