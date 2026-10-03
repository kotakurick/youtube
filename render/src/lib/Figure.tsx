// 群衆の1人。丸い頭＋角丸の胴。女性は胴の裾を少し広げる（色だけに頼らない）。
import React from "react";
import { C } from "./theme";

export type Kind = "male" | "female" | "other";

export const Figure: React.FC<{
  kind: Kind; x: number; y: number; size?: number; opacity?: number;
  highlight?: boolean; color?: string;
}> = ({ kind, x, y, size = 1, opacity = 1, highlight = false, color }) => {
  const fill = color ?? (kind === "male" ? C.male : kind === "female" ? C.female : C.other);
  const stroke = highlight ? { stroke: C.ink, strokeWidth: 3.5 / size } : {};
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity} fill={fill} {...stroke}>
      <circle cx={0} cy={-36} r={9} />
      {kind === "female"
        ? <path d="M-9 -25 h18 q2 0 3 3 l3 24 q0 3 -3 3 h-24 q-3 0 -3 -3 l3 -24 q1 -3 3 -3 z" />
        : <rect x={-10} y={-25} width={20} height={30} rx={8} />}
      {highlight && <path d="M0 12 l-6 10 h12 z" fill={C.ink} stroke="none" />}
    </g>
  );
};
