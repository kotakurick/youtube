// 雪玉・雪・雲（資産と給料の比喩。2本目 r > g で作った。2026-10-05）。
// 決まり（3役の絵コンテ見直しから。episodes/002-r-greater-than-g/review/storyboard-summary.md）：
//   - 雪玉は扇形にしない（円グラフ・時計に見える）。内から外へ「芯＝はじめの額（灰）→ 利息（金）→ 降った雪（青緑の淡い色）」と重ねる。
//     色はお金の意味の色（theme.ts の gold・teal。2026-10-05 オーナー「淡白すぎる」で墨と白から替えた）。
//   - 面積＝金額（半径＝k×√万円）。1つの場面の中では同じ k を使い、大きさの比をごまかさない。
//   - 同心円なので、回さずに横へ動かすだけで転がって見える（回転は決まりで使わない）。
//   - 雪は丸ではなく6本の線の雪片。雲から雪玉の上へまっすぐ落ちる。
import React from "react";
import { C, font, LINE } from "./theme";

/** 雪玉の半径（面積＝金額）。k は 1万円あたりの物差し。1つの場面の中では同じ k を使う */
export const ballR = (man: number, k = 3) => k * Math.sqrt(Math.max(0, man));

/** 雪玉。金額は万円。core＝はじめの額（灰）、interest＝利息（金）、snow＝降った雪（淡い青緑）。内から外へ重ねる。
 *  split を渡すと、利息を「芯が生んだ分（金）」と「雪が生んだ分（淡い金）」に分ける。 */
export const Snowball: React.FC<{
  x: number; y: number; core?: number; interest?: number; snow?: number; k?: number;
  split?: { fromCore: number; fromSnow: number }; empty?: boolean; label?: string;
}> = ({ x, y, core = 0, interest = 0, snow = 0, k = 3, split, empty = false, label }) => {
  if (empty) return <circle cx={x} cy={y} r={Math.max(8, k * 3)} fill="none" stroke={C.ink2} strokeWidth={3} strokeDasharray="6 6" />;
  const layers = split
    ? [[core, C.other], [split.fromCore, C.gold], [split.fromSnow, C.goldTint], [snow, C.tealTint]]
    : [[core, C.other], [interest, C.gold], [snow, C.tealTint]];
  let sum = 0;
  const rings = layers.map(([v, color]) => { sum += v as number; return { r: ballR(sum, k), color: color as string, v: v as number }; });
  const outer = rings[rings.length - 1].r;
  return (
    <g data-qa="mark" data-qa-label={label ?? "雪玉"}>
      {[...rings].reverse().filter((g) => g.v > 0).map((g, i) => (
        <circle key={i} cx={x} cy={y} r={g.r} fill={g.color} stroke={C.ink} strokeWidth={g.r > 30 ? 2 : 1} />
      ))}
      <circle cx={x} cy={y} r={outer} fill="none" stroke={C.ink} strokeWidth={outer > 40 ? LINE.thin : 2} />
    </g>
  );
};

/** 雪片1つ（6本の線） */
export const Flake: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 10, color = C.teal }) => (
  <g stroke={color} strokeWidth={Math.max(2, s / 4)} strokeLinecap="round">
    {[0, 60, 120].map((a) => {
      const dx = Math.cos((a * Math.PI) / 180) * s, dy = Math.sin((a * Math.PI) / 180) * s;
      return <line key={a} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} />;
    })}
  </g>
);
/** 降る雪（決まった並び。毎回同じ位置に出る） */
export const Snow: React.FC<{ x: number; y: number; w: number; h: number; n?: number; s?: number; color?: string }> = ({ x, y, w, h, n = 30, s = 10, color }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Flake key={i} x={x + (((i * 97) % 100) / 100) * w} y={y + (((i * 61 + 13) % 100) / 100) * h} s={s * (0.8 + ((i * 37) % 10) / 25)} color={color} />
    ))}
  </g>
);
/** 雲（給料）。w は横幅。label は雲の中の文字 */
export const Cloud: React.FC<{ x: number; y: number; w: number; label?: string; dashed?: boolean }> = ({ x, y, w, label, dashed = false }) => {
  const k = w / 400;
  return (
    <g data-qa="mark" data-qa-label="雲">
      <g transform={`translate(${x},${y}) scale(${k})`} fill={dashed ? C.bg : C.tealTint} stroke={C.ink} strokeWidth={LINE.thin / k} strokeDasharray={dashed ? `${10 / k} ${8 / k}` : undefined}>
        <path d="M-170 40 C-220 40 -220 -30 -160 -30 C-160 -90 -70 -100 -50 -60 C-30 -120 70 -120 80 -60 C130 -90 200 -50 170 0 C220 10 210 40 170 40 Z" />
      </g>
      {label && <text x={x} y={y + 10 * k + 6} textAnchor="middle" style={font("label")}>{label}</text>}
    </g>
  );
};

