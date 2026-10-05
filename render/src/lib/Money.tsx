// お金の図解：借金（鎖の玉）と、持ち分の箱（借金で買ったときの「てこ」）。2本目 r > g で作った（2026-10-05）。
import React from "react";
import { C, font, LINE } from "./theme";

export const DebtBall: React.FC<{ x: number; y: number; r?: number; from?: { x: number; y: number }; label?: boolean }> = ({ x, y, r = 34, from, label = false }) => (
  <g data-qa="mark" data-qa-label="借金" data-qa-allow="figure">
    {from && <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={C.ink} strokeWidth={4} strokeDasharray="10 6" />}
    <circle cx={x} cy={y} r={r} fill={C.debt} stroke={C.ink} strokeWidth={3} />
    {label && <text x={x} y={y + 10} textAnchor="middle" style={font("note", C.white)} fontWeight={700}>借金</text>}
  </g>
);

// ---- 持ち分の箱（不動産のてこ） ----
/** 物件全体の高さのうち、借金（墨2）と持ち分（白）。値段が動くと持ち分だけが伸び縮みする。金額は万円 */
export const EquityBox: React.FC<{ x: number; base: number; price: number; debt: number; k: number; w?: number; title?: string }> = (
  { x, base, price, debt, k, w = 220, title },
) => {
  const eq = price - debt, solidTop = base - Math.min(price, debt) * k;
  return (
    <g data-qa="mark" data-qa-label="持ち分の箱">
      <rect x={x} y={solidTop} width={w} height={Math.min(price, debt) * k} fill={C.debtTint} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={x + w / 2} y={solidTop + 70} textAnchor="middle" style={font("label", C.debt)}>借金</text>
      {eq >= 0
        ? <rect x={x} y={base - price * k} width={w} height={eq * k} fill={C.gold} stroke={C.ink} strokeWidth={LINE.thin} />
        // 値段が借金より安い：家を売っても返せない借金（点線の箱）
        : <rect x={x} y={base - debt * k} width={w} height={-eq * k} fill={C.debt} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 8" />}
      {title && <text x={x + w / 2} y={base + 56} textAnchor="middle" style={font("label")}>{title}</text>}
    </g>
  );
};
