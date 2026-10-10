// 地図と国境線の比喩（2026-10-06 6本目「どこからが浮気」で作った。第2版：絵コンテの3役の見直しで、地図に見えるように描き直した）。
// ひとりひとりが持つ「浮気の線」を、紙の地図に引いた国境線で見せる。
// 決まり：
//   - どの地図にも、同じ位置に同じ「行動の目印」（食事・手・気持ち・キス・体）が載っている（同じ土地に、人ごとに違う国境）。
//   - 国境線は上から下へ。線の左＝セーフ、右＝アウト。右側をその人の色で淡く塗る（tint）。2枚を重ねると、色が1枚分だけの帯＝食い違う所。
//   - 線の形は seed、位置は shift（左へ動かす＝厳しい）。同じ seed で shift だけ変えると、2本は交わらない（締めの「重ならない」）。
//   - 紙は折り目のある地図（縦の折り目2本）。色は紙色・墨・その人の色だけ。
import React from "react";
import { rng } from "./random";
import { C, font, LINE, R } from "./theme";

export const MAP_MARKS = [
  { key: "食事", fx: 0.16, fy: 0.3 }, { key: "手", fx: 0.33, fy: 0.62 }, { key: "気持ち", fx: 0.5, fy: 0.28 },
  { key: "キス", fx: 0.68, fy: 0.64 }, { key: "体", fx: 0.85, fy: 0.34 },
] as const;

const pts = (w: number, h: number, seed: number, shift: number): [number, number][] => {
  const r = rng(seed * 97 + 13);
  const n = 6, out: [number, number][] = [];
  for (let i = 0; i <= n; i++) out.push([w * 0.5 + shift + (r() - 0.5) * w * 0.16, (h * i) / n]);
  return out;
};
const curve = (p: [number, number][]) => {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i];
    d += ` C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`;
  }
  return d;
};
/** 国境線の道（上から下へ） */
export const borderPath = (w: number, h: number, seed: number, shift = 0) => curve(pts(w, h, seed, shift));

export type MapLine = { color: string; tint: string; seed: number; shift?: number };
/** 1枚の地図。左上を x,y に。lines：国境線（色・塗りの色・形）。label：地図の下の名札。sides：上に「セーフ／アウト」 */
export const BorderMap: React.FC<{
  x: number; y: number; w?: number; h?: number; lines: MapLine[]; label?: string; labelColor?: string; tilt?: number; sides?: boolean; marks?: boolean;
}> = ({ x, y, w = 520, h = 360, lines, label, labelColor = C.ink, tilt = 0, sides = false, marks = true }) => {
  const id = `bm${x}_${y}_${w}`;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt},${w / 2},${h / 2})`}>
      <defs><clipPath id={id}><rect x={0} y={0} width={w} height={h} rx={R.md} /></clipPath></defs>
      <rect data-qa="mark" data-qa-label={`地図${label ? "：" + label : ""}`} x={0} y={0} width={w} height={h} rx={R.md} fill={C.white} />
      <g clipPath={`url(#${id})`}>
        {/* 折り目：3つの面を少しずつ違う紙色に */}
        <rect x={w / 3} y={0} width={w / 3} height={h} fill={C.bg} />
        {/* アウト側（線の右）をその人の色で淡く塗る */}
        {lines.map((l, i) => {
          const p = pts(w, h, l.seed, l.shift ?? 0);
          return <path key={`t${i}`} d={`${curve(p)} L${w},${h} L${w},0 Z`} fill={l.tint} opacity={0.55} />;
        })}
        <line x1={w / 3} y1={0} x2={w / 3} y2={h} stroke={C.rest} strokeWidth={LINE.hair} strokeDasharray="6 8" />
        <line x1={(2 * w) / 3} y1={0} x2={(2 * w) / 3} y2={h} stroke={C.rest} strokeWidth={LINE.hair} strokeDasharray="6 8" />
        {lines.map((l, i) => (
          <path key={`l${i}`} data-qa="mark" data-qa-allow="mark text" data-qa-label="国境線" d={borderPath(w, h, l.seed, l.shift ?? 0)} fill="none"
            stroke={l.color} strokeWidth={LINE.base} strokeLinecap="round" />
        ))}
        {marks && MAP_MARKS.map((m) => (
          <g key={m.key} transform={`translate(${m.fx * w},${m.fy * h})`}>
            <circle r={10} fill={C.ink} />
            <text data-qa-allow="mark" y={44} textAnchor="middle" style={font("note", C.ink)} fontWeight={700}>{m.key}</text>
          </g>
        ))}
      </g>
      <rect x={0} y={0} width={w} height={h} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      {sides && <>
        <text x={14} y={-14} style={font("note", C.ink2)} fontWeight={700}>← セーフ</text>
        <text x={w - 14} y={-14} textAnchor="end" style={font("note", C.ink2)} fontWeight={700}>アウト →</text>
      </>}
      {label && <text x={w / 2} y={h + 54} textAnchor="middle" style={font("label", labelColor)}>{label}</text>}
    </g>
  );
};
/** 男女の線の色（よく使う組み合わせ） */
export const MALE_LINE = { color: C.male, tint: C.maleTint };
export const FEMALE_LINE = { color: C.female, tint: C.femaleTint };
