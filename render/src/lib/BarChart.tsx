// 縦棒グラフ。棒は上の角だけ丸く、底は平らで 4px の基準線に乗せる。値は棒の上に直接書く（目盛りの線は使わない）。
// 注目の1本（focus）は墨か性別の色・64px、ほかは rest の色・40px。注目の値には誤差棒（95%の範囲）を付けられる。
// 伸びと数え上げは同じ曲線（EASE）。伸び終わると注目の値が 1.06→1 倍に戻り、下に墨の線が引かれる（蛍光ペンの黄は見えにくいので使わない。2026-10-06）。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE, font, LINE, R, T } from "./theme";

export type Bar = { label: string; value: number; color?: string; focus?: boolean; err?: [number, number] };
export type BarChartProps = {
  bars: Bar[]; x: number; y: number; width: number; height: number; max?: number; start?: number;
  duration?: number; format?: (v: number) => string; barWidth?: number;
};

/** 棒ごとの位置（ゴサのひげで値を指すときなどに使う）。top は値の文字のすぐ上。 */
export const barGeometry = ({ bars, x, y, width, height, max, barWidth }: BarChartProps) => {
  const top = max ?? Math.max(...bars.map((b) => b.err?.[1] ?? b.value));
  const slot = width / bars.length;
  const bw = barWidth ?? Math.min(slot * 0.6, 280);
  return bars.map((b, i) => {
    const cx = x + slot * i + slot / 2;
    const h = (b.value / top) * height;
    const fs = b.focus ? T.value[0] : T.label[0];
    const hLabel = (Math.max(b.value, b.err?.[1] ?? 0) / top) * height; // 値の文字は誤差棒の上に置く
    return { cx, bw, h, hLabel, base: y + height, top: y + height - h, valueY: y + height - hLabel - 24 - fs, scale: height / top };
  });
};

/** 上の角だけ丸い棒 */
const barPath = (x: number, w: number, base: number, h: number) => {
  const r = Math.min(R.sm, h, w / 2);
  return `M${x} ${base} V${base - h + r} Q${x} ${base - h} ${x + r} ${base - h} H${x + w - r} Q${x + w} ${base - h} ${x + w} ${base - h + r} V${base} Z`;
};

export const BarChart: React.FC<BarChartProps> = (props) => {
  const { bars, x, y, width, height, start = 0, duration = 45, format = (v) => `${Math.round(v)}%` } = props;
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const done = interpolate(frame - start - duration, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const geo = barGeometry(props);
  const base = y + height;
  return (
    <g>
      {bars.map((b, i) => {
        const g = geo[i];
        const h = g.h * p;
        const fill = b.color ?? (b.focus ? C.ink : C.rest);
        const role = b.focus ? "value" : "label";
        const ty = base - g.hLabel * p - 24;
        const label = format(b.value * p);
        const pop = b.focus ? 1 + 0.06 * Math.sin(done * Math.PI) : 1;
        const tw = label.length * T[role][0] * 0.62;
        return (
          <g key={b.label}>
            <path data-qa="mark" data-qa-label={`棒：${b.label}`} d={barPath(g.cx - g.bw / 2, g.bw, base, h)} fill={fill} />
            {b.err && p > 0.98 && [{ c: C.bg, w: LINE.base + 6 }, { c: C.ink, w: LINE.base }].map(({ c, w }) => (
              // 誤差棒（95%の範囲）。紙色の縁で、濃い棒の上でも見える
              <g key={c} data-qa="mark" data-qa-label="誤差棒" stroke={c} strokeWidth={w} strokeLinecap="round" opacity={done}>
                <line x1={g.cx} x2={g.cx} y1={base - b.err![0] * g.scale} y2={base - b.err![1] * g.scale} />
                {b.err!.map((e) => <line key={e} x1={g.cx - LINE.base * 2} x2={g.cx + LINE.base * 2} y1={base - e * g.scale} y2={base - e * g.scale} />)}
              </g>
            ))}
            {b.focus && <rect x={g.cx - tw / 2} y={ty + 6} width={tw * done} height={8} rx={4} fill={C.ink} />}
            <text x={g.cx} y={ty} textAnchor="middle" style={font(role, b.focus ? C.ink : C.ink2)} opacity={Math.min(1, p * 3)}
              transform={`translate(${g.cx},${ty}) scale(${pop}) translate(${-g.cx},${-ty})`}>{label}</text>
            <text x={g.cx} y={base + 56} textAnchor="middle" style={font("label")}>{b.label}</text>
          </g>
        );
      })}
      <line x1={x} y1={base} x2={x + width} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
    </g>
  );
};
