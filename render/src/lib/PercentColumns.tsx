// 100%の柱（区分ごとに、全体を100%とした内訳を縦に積む。4本目「40代、夫婦の満足」で作った。2026-10-06）。
// 割合は100%と合わせる（柱の高さはどれも同じ＝100%）。下の区分の割合を柱の上に値で書く（声で言う値だけ big）。
// 使い方の例：満足（淡い色・下）と満足でない（濃い色・上）／夫が受け持つ家事（male）と妻（female）。
// groups で柱の下に括り（「小学校に上がる前」など）を付けられる。ghost で別の年の値を点線の横棒で重ねる。
// 印：柱の四角は data-qa="mark"。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type PCol = { label: string; value: number; big?: boolean; ghost?: number; sub?: string; text?: string }; // text：値の書き方を変えるとき（「約85%」など）

export const PercentColumns: React.FC<{
  x: number; y: number; width: number; height: number; cols: PCol[];
  lower: string; upper: string;             // 下（value）と上（100−value）の色
  colW?: number; format?: (v: number) => string;
  groups?: { from: number; to: number; label: string }[];
  lowerName?: string; upperName?: string;   // 区分の名前（最後の柱の右に書く）
  valueInside?: boolean;                    // 値を下の区分の中（上端の少し下）に書く
}> = ({ x, y, width, height, cols, lower, upper, colW = 120, format = (v) => `${v}%`, groups = [], lowerName, upperName, valueInside = false }) => {
  const slot = width / cols.length;
  const cx = (i: number) => x + slot * i + slot / 2;
  const Y = (v: number) => y + height - (v / 100) * height;
  return (
    <g>
      {cols.map((c, i) => (
        <g key={i}>
          <rect data-qa="mark" data-qa-label={`柱：${c.label}`} x={cx(i) - colW / 2} y={y} width={colW} height={Y(c.value) - y} fill={upper} rx={R.sm} />
          <rect data-qa="mark" data-qa-label={`柱：${c.label}`} x={cx(i) - colW / 2} y={Y(c.value)} width={colW} height={y + height - Y(c.value)} fill={lower} />
          <line x1={cx(i) - colW / 2} x2={cx(i) + colW / 2} y1={Y(c.value)} y2={Y(c.value)} stroke={C.white} strokeWidth={3} />
          {c.ghost !== undefined && <line x1={cx(i) - colW / 2 - 14} x2={cx(i) + colW / 2 + 14} y1={Y(c.ghost)} y2={Y(c.ghost)} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 8" />}
          <text x={cx(i)} y={valueInside ? Y(c.value) + (c.big ? 70 : 50) : y - 20} textAnchor="middle" style={font(c.big ? "value" : "label", valueInside ? C.ink : C.ink)}>{c.text ?? format(c.value)}</text>
          <text x={cx(i)} y={y + height + 48} textAnchor="middle" style={font("label", C.ink2)}>{c.label}</text>
          {c.sub && <text x={cx(i)} y={y + height + 86} textAnchor="middle" style={font("note", C.ink2)}>{c.sub}</text>}
        </g>
      ))}
      {groups.map((g, k) => (
        <g key={k}>
          <path d={`M${cx(g.from) - colW / 2} ${y + height + 100} v14 H${cx(g.to) + colW / 2} v-14`} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
          <text x={(cx(g.from) + cx(g.to)) / 2} y={y + height + 160} textAnchor="middle" style={font("label")}>{g.label}</text>
        </g>
      ))}
      {upperName && <text x={cx(cols.length - 1) + colW / 2 + 24} y={y + 40} style={font("label", C.ink2)}>{upperName}</text>}
      {lowerName && <text x={cx(cols.length - 1) + colW / 2 + 24} y={y + height - 16} style={font("label", C.ink2)}>{lowerName}</text>}
    </g>
  );
};
