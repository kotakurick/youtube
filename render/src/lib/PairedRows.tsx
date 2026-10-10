// 男女2本ずつの横棒（2026-10-06 6本目「どこからが浮気」で作った）。項目が多い（10〜13個）ときの PairedBars の横向き。
// 上から順に項目を並べ、項目名を左、男性の棒（上）と女性の棒（下）を右に伸ばす。値は棒の先に書く。
// focus を付けた項目は、項目名を墨の太字＋下線で目立たせる（色は男女の色だけ。蛍光ペンは使わない）。
// mark：棒の右にもう1つ書く値（例：男女で食い違う確率）。markTitle がその列の見出し。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R } from "./theme";

export type PRow = { label: string; male: number; female: number; focus?: boolean; mark?: string };
export const PairedRows: React.FC<{
  rows: PRow[]; x: number; y: number; width: number; rowH?: number; max?: number; labelW?: number; start?: number;
  names?: [string, string]; markTitle?: string; format?: (v: number) => string;
}> = ({ rows, x, y, width, rowH = 56, max = 100, labelW = 520, start = 0, names = ["男性", "女性"], markTitle, format = (v) => `${Math.round(v)}%` }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const barX = x + labelW, barW = width - labelW - (markTitle ? 300 : 120);
  const bh = (rowH - 10) / 2;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      {/* 凡例（右上） */}
      <g transform={`translate(${barX},${y - 20})`}>
        <rect x={0} y={-24} width={28} height={22} rx={4} fill={C.male} />
        <text x={38} y={-4} style={font("note", C.male)} fontWeight={700}>{names[0]}</text>
        <rect x={130} y={-24} width={28} height={22} rx={4} fill={C.female} />
        <text x={168} y={-4} style={font("note", C.female)} fontWeight={700}>{names[1]}</text>
      </g>
      {markTitle && <text x={x + width - 10} y={y - 24} textAnchor="end" style={font("note", C.ink2)} fontWeight={700}>{markTitle}</text>}
      {rows.map((r, i) => {
        const p = interpolate(frame - i * 3, [0, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const ry = y + i * rowH;
        // 値の文字の左端。男女の棒の先が近く、上下の値の文字が横で重なるときは、女性の値を男性の値の右へずらす（2026-10-07 6本目「11%」と「19%」）
        const endX = (v: number) => barX + (v / max) * barW * p + 10;
        const textW = (v: number) => format(v).length * 28 * 0.62 + 12;
        const valX = { 男性: endX(r.male), 女性: Math.max(endX(r.female), endX(r.male) + textW(r.male)) };
        return (
          <g key={r.label}>
            <text x={barX - 20} y={ry + rowH / 2 + 4} textAnchor="end" style={font("note", r.focus ? C.ink : C.ink2)} fontWeight={r.focus ? 900 : 500}
              textDecoration={r.focus ? "underline" : undefined}>{r.label}</text>
            {[{ v: r.male, c: C.male, dy: 2, k: "男性" }, { v: r.female, c: C.female, dy: 4 + bh, k: "女性" }].map((b) => (
              <g key={b.k}>
                <rect data-qa="mark" data-qa-label={`${b.k}：${r.label}`} x={barX} y={ry + b.dy} width={Math.max(2, (b.v / max) * barW * p)} height={bh}
                  rx={R.sm / 2} fill={b.c} />
                {/* 男女が同じ値のときは、値を1つだけ（2本の棒の間に墨で）書く。上下に同じ数字が並ぶと詰まって見えるため（2026-10-06） */}
                {r.male === r.female
                  ? b.k === "女性" && <text x={barX + (b.v / max) * barW * p + 10} y={ry + rowH / 2 + 8} style={font("note", C.ink)} fontWeight={700}>{`両方 ${format(b.v)}`}</text>
                  : <text x={valX[b.k as "男性" | "女性"]} y={ry + b.dy + bh - 3} style={font("note", b.c)} fontWeight={700}>{format(b.v)}</text>}
              </g>
            ))}
            {r.mark && <text x={x + width - 10} y={ry + rowH / 2 + 8} textAnchor="end" style={font("label", C.ink)}>{r.mark}</text>}
            <line x1={barX} y1={ry + rowH - 2} x2={barX + barW} y2={ry + rowH - 2} stroke={C.paper2} strokeWidth={LINE.hair} />
          </g>
        );
      })}
    </svg>
  );
};
