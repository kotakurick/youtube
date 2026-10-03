// 群衆の1人。丸い頭＋胴。男女は色だけでなく胴の形でも見分ける。
// 男女の面積はそろえる（誇張しない）：男性＝幅22の角丸、女性＝上16・裾26の台形。「その他・無回答」は丸い胴。
import React from "react";
import { C, FONT, LINE } from "./theme";

export type Kind = "male" | "female" | "other";

export const kindColor = (kind: Kind, dim = false) =>
  dim ? (kind === "male" ? C.maleTint : kind === "female" ? C.femaleTint : C.otherTint)
    : (kind === "male" ? C.male : kind === "female" ? C.female : C.other);

/** 原点＝足元の中心。頭の上は -45、足元は +5。 */
export const Figure: React.FC<{
  kind: Kind; x: number; y: number; size?: number; opacity?: number;
  dim?: boolean;        // 話の対象外（薄い色。opacity では薄くしない）
  highlight?: boolean;  // 追う1人（○番さん）：輪で囲んで1.25倍
  label?: string;       // 追う1人の名札（例：「27番さん（32）」）
  color?: string;
}> = ({ kind, x, y, size = 1, opacity = 1, dim = false, highlight = false, label, color }) => {
  const fill = color ?? kindColor(kind, dim);
  const s = highlight ? size * 1.25 : size;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      {highlight && (
        <>
          <circle cx={0} cy={-20} r={36} fill="none" stroke={C.bg} strokeWidth={12} />
          <circle cx={0} cy={-20} r={36} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
        </>
      )}
      <g fill={fill}>
        <circle cx={0} cy={-36} r={9} />
        {kind === "female" ? <path d="M-8 -25 h16 q2 0 2.4 2 l4.4 25 q0.4 3 -2.6 3 h-22.4 q-3 0 -2.6 -3 l4.4 -25 q0.4 -2 2.4 -2 z" />
          : kind === "male" ? <rect x={-11} y={-25} width={22} height={30} rx={8} />
          : <ellipse cx={0} cy={-10} rx={13} ry={15} />}
      </g>
      {highlight && label && (
        <g transform="translate(0,-70)">
          <rect x={-label.length * 11 - 14} y={-22} width={label.length * 22 + 28} height={40} rx={20} fill={C.ink} />
          <text x={0} y={7} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.white}>{label}</text>
        </g>
      )}
    </g>
  );
};
