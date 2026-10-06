// 夫婦の組の並び（100組＝200人。4本目「40代、夫婦の満足」で作った。2026-10-06）。
//   CouplePairs：1組＝夫と妻が肩を接して立ち、足元に1枚の床（組の印）。組と組のあいだは空ける。行ごとに左から並べる。
//   PeopleRows ：組にする前の、妻だけ・夫だけの列（100人を1行25人×4行など）。
// 色：妻＝female、夫＝male。on（注目：例「満足していない」）は濃い色、それ以外は淡い色（Figure の dim）。
// 大きさは100人の場面の決まり（1人の高さ64px以上＝CROWD_SIZE）。人は Figure なので data-qa="figure"。組の床は "bg"。
import React from "react";
import { Figure } from "./Figure";
import { C, CROWD_SIZE, LINE, R } from "./theme";

export type Couple = { wife: boolean; husband: boolean; mark?: boolean; gold?: boolean; goldFrame?: boolean }; // true＝注目（濃い色）。mark＝組の床を墨の線でふち取る（声で言う組）。
// gold＝「そろった組」：床を金で塗る。goldFrame＝さらに金の太い枠で囲む（1組だけ目立たせるとき。たくさんの組に付けると枠がつながる）（6本目。紙色の地で目立つよう、枠は LINE.base。2026-10-06 オーナー「目立てばいい」）

/** 組の並べ方：最初に bothOn 組（二人とも注目）、次に wifeOnly 組、husbandOnly 組、残りは二人とも淡い */
export const couples = (n: number, bothOn: number, wifeOnly: number, husbandOnly = 0): Couple[] =>
  Array.from({ length: n }, (_, i) => ({
    wife: i < bothOn + wifeOnly,
    husband: i < bothOn || (i >= bothOn + wifeOnly && i < bothOn + wifeOnly + husbandOnly),
  }));

/** 1人の幅（Figure の胴の幅 26＋足元の影 × size）。組の中は肩を接して並べる */
const PERSON = 30;
export const PAIR = { row: 84, gap: 24 } as const;
/** 1組の横の送り（組の中の2人＋組と組のあいだ） */
export const pairPitch = (size = CROWD_SIZE, gap: number = PAIR.gap) => PERSON * size * 2 + gap;

// 2026-10-06 第2版（絵コンテの3役の見直し）：組の区切りが見えなかった（妻と夫が同じ間隔で続き、縞に見えた）ので、
// 1組＝肩を接した2人＋足元の床、組と組のあいだは gap 空ける。どの段もこの単位。左右は夫が左・妻が右（車・天秤とそろえる）。
export const CouplePairs: React.FC<{ x: number; y: number; items: Couple[]; cols?: number; size?: number; gap?: number; row?: number }> = (
  { x, y, items, cols = 20, size = CROWD_SIZE, gap = PAIR.gap, row = PAIR.row },
) => {
  const inner = PERSON * size, pitch = pairPitch(size, gap);
  return (
    <g>
      {items.map((c, i) => {
        const px = x + (i % cols) * pitch, py = y + Math.floor(i / cols) * row;
        const fw = inner * 2 + 8;
        return (
          <g key={i}>
            {c.goldFrame && <rect data-qa="bg" x={px - inner / 2 - 10} y={py - 50 * size - 8} width={fw + 12} height={50 * size + 26} rx={R.sm}
              fill="none" stroke={C.gold} strokeWidth={LINE.base} />}
            <rect data-qa="bg" x={px - inner / 2 - 4} y={py - 3} width={fw} height={c.gold ? 14 : 12} rx={R.sm / 2} fill={c.gold ? C.gold : C.paper2}
              stroke={c.mark ? C.ink : "none"} strokeWidth={LINE.hair} />
            <Figure kind="male" x={px} y={py} size={size} dim={!c.husband} />
            <Figure kind="female" x={px + inner} y={py} size={size} dim={!c.wife} />
          </g>
        );
      })}
    </g>
  );
};

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
