// 夫婦の組の並び（100組＝200人。4本目「40代、夫婦の満足」で作った。2026-10-06）。
//   CouplePairs：1組＝妻と夫が並んで立ち、足元に1枚の床（組の印）。行ごとに左から並べる。
//   PeopleRows ：組にする前の、妻だけ・夫だけの列（100人を1行25人×4行など）。
// 色：妻＝female、夫＝male。on（注目：例「満足していない」）は濃い色、それ以外は淡い色（Figure の dim）。
// 大きさは100人の場面の決まり（1人の高さ64px以上＝CROWD_SIZE）。人は Figure なので data-qa="figure"。組の床は "bg"。
import React from "react";
import { Figure } from "./Figure";
import { C, CROWD_SIZE, R } from "./theme";

export type Couple = { wife: boolean; husband: boolean }; // true＝注目（濃い色）

/** 組の並べ方：最初に bothOn 組（二人とも注目）、次に wifeOnly 組、husbandOnly 組、残りは二人とも淡い */
export const couples = (n: number, bothOn: number, wifeOnly: number, husbandOnly = 0): Couple[] =>
  Array.from({ length: n }, (_, i) => ({
    wife: i < bothOn + wifeOnly,
    husband: i < bothOn || (i >= bothOn + wifeOnly && i < bothOn + wifeOnly + husbandOnly),
  }));

export const PAIR = { inner: 38, pitch: 86, row: 84 } as const;

export const CouplePairs: React.FC<{ x: number; y: number; items: Couple[]; cols?: number; size?: number; pitch?: number }> = ({ x, y, items, cols = 20, size = CROWD_SIZE, pitch = PAIR.pitch }) => (
  <g>
    {items.map((c, i) => {
      const px = x + (i % cols) * pitch, py = y + Math.floor(i / cols) * PAIR.row;
      const fw = Math.min(PAIR.inner + 44, pitch - 8); // 組の床（隣の組と離す）
      return (
        <g key={i}>
          <rect data-qa="bg" x={px + PAIR.inner / 2 - fw / 2} y={py - 2} width={fw} height={14} rx={R.sm} fill={C.paper2} />
          <Figure kind="female" x={px} y={py} size={size} dim={!c.wife} />
          <Figure kind="male" x={px + PAIR.inner} y={py} size={size} dim={!c.husband} />
        </g>
      );
    })}
  </g>
);

/** 組にする前の1つの性別の列。on 人が濃い色（左上から） */
export const PeopleRows: React.FC<{ x: number; y: number; kind: "male" | "female"; n?: number; on: number; cols?: number; dx?: number; dy?: number; size?: number }> = (
  { x, y, kind, n = 100, on, cols = 25, dx = 44, dy = 76, size = CROWD_SIZE },
) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Figure key={i} kind={kind} x={x + (i % cols) * dx} y={y + Math.floor(i / cols) * dy} size={size} dim={i >= on} />
    ))}
  </g>
);
