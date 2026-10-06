// 結婚相談所・婚活サービスの「会員を探す画面」（3本目「普通の相手」で作った。2026-10-06）。
// 上に「条件に合う人数」、下にチェックの行。チェックを入れるたびに人数が変わる場面の、動き終わりの姿を描く。
// 決まり：
//   - 実在のサービスの画面に似せない（ロゴ・配色・項目名をまねない）。色は墨・白・紙色だけ。人数は墨。
//   - 人数は国の統計の割合を置き換えた架空の数で出す場面が多いので、場面の側で SourceNote に断りを出す。
//   - rows の dim は「この行は話の外」（薄く）。この条件で消える1人の札は、場面の側で画面の外に置く（画面の中は詰まるので）。
//   - count に文字（"？" など）を渡すと、人数の代わりに出す（相手の画面など、中身が分からないとき）。
//   - 原点は画面の中心。h は高さ px（幅は h×0.62）。文字は h に合わせて縮むが、28px より小さくしない（qa.ts）。
//     h=600 で行の文字が画面からはみ出した（2026-10-06 イラストレーター・デザイナー役）ので、文字の大きさを h で決める。
//   - axis：その条件がどの物差しの上にあるかの色（行の左に細い帯）。3本目は お金＝C.gold、身長＝C.teal（意味の色）。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type SearchRow = { label: string; on: boolean; dim?: boolean; mark?: boolean; axis?: string };

export const SearchScreen: React.FC<{
  x: number; y: number; h?: number; count: number | string; unit?: string; title?: string;
  rows: SearchRow[]; prev?: number;      // 直前の人数（人数の下に小さく出す。減り方を見せる）
}> = ({ x, y, h = 820, count, unit = "人", title = "条件に合う会員", rows, prev }) => {
  const w = h * 0.62, k = h / 820;
  const left = x - w / 2, top = y - h / 2;
  const rowH = 76 * k, rowsTop = top + 372 * k;
  const fs = Math.max(28, 40 * k);
  return (
    <g data-qa="prop" data-qa-label="検索画面">
      <rect x={left} y={top} width={w} height={h} rx={56 * k} fill={C.ink} />
      <rect x={left + 18 * k} y={top + 40 * k} width={w - 36 * k} height={h - 80 * k} rx={18 * k} fill={C.white} />
      <text x={x} y={top + 104 * k} textAnchor="middle" style={{ ...font("label", C.ink2), fontSize: fs }}>{title}</text>
      <text x={x} y={top + 262 * k} textAnchor="middle" style={{ ...font("hero"), fontSize: 130 * k }}>
        {typeof count === "number" ? count.toLocaleString() : count}<tspan style={{ fontSize: 56 * k }}>{unit}</tspan>
      </text>
      {prev !== undefined && (
        <text x={x} y={top + 322 * k} textAnchor="middle" style={{ ...font("note", C.ink2), fontSize: 28 }}>{`${prev.toLocaleString()}${unit}から`}</text>
      )}
      <line x1={left + 44 * k} x2={left + w - 44 * k} y1={rowsTop - 24 * k} y2={rowsTop - 24 * k} stroke={C.paper2} strokeWidth={LINE.thin} />
      {rows.map((r, i) => {
        const cy = rowsTop + i * rowH + rowH / 2;
        const bx = left + 60 * k, s = 44 * k;
        const ink = r.dim ? C.rest : C.ink;
        return (
          <g key={i} data-qa="mark" data-qa-label={`条件：${r.label}`}>
            <rect x={bx} y={cy - s / 2} width={s} height={s} rx={8 * k} fill={r.on ? ink : C.white} stroke={ink} strokeWidth={LINE.thin} />
            {r.on && <path d={`M${bx + s * 0.22} ${cy} L${bx + s * 0.44} ${cy + s * 0.22} L${bx + s * 0.8} ${cy - s * 0.24}`} fill="none"
              stroke={C.white} strokeWidth={LINE.base} strokeLinecap="round" strokeLinejoin="round" />}
            {r.axis && <rect x={left + 30 * k} y={cy - s / 2} width={12 * k} height={s} rx={4 * k} fill={r.axis} />}
            <text x={bx + s + 24 * k} y={cy + fs * 0.35} style={{ ...font("label", r.dim ? C.ink2 : C.ink), fontSize: fs }}>{r.label}</text>
            {r.mark && <rect x={bx - 14 * k} y={cy - rowH / 2 + 6 * k} width={w - 92 * k} height={rowH - 12 * k} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.base} />}
          </g>
        );
      })}
    </g>
  );
};
