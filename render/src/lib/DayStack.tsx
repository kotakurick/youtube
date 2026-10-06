// 一日の時間の中身（積み上げの柱。4本目「40代、夫婦の満足」で作った。2026-10-06）。
// 1本の柱＝1人の1日の「家事・育児・仕事…」の合計。高さ＝分（面積＝量。1つの場面の中は同じ物差し k）。縦軸は0から。
// 柱を並べ、同じ人の「前 → 後」を links で結ぶと、区分ごとの増減が帯の傾きで見える（中身の入れ替わり）。
// 区分の文字は、高さが足りれば柱の中、足りなければ柱の右に出す。focus の区分だけ墨の太い枠（声で言う区分）。
// 色は呼ぶ側が決める（男女の回：育児＝性別の濃い色、家事＝性別の淡い色、仕事・通勤＝otherTint）。
// 印：区分の四角は data-qa="mark"。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type DaySeg = { key: string; label: string; min: number; color: string; focus?: boolean; textColor?: string };
export type DayCol = { title: string; sub?: string; segs: DaySeg[]; titleColor?: string; total?: string };

const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}時間${m % 60 ? `${m % 60}分` : ""}` : `${m}分`);

export const DayStack: React.FC<{
  x: number; base: number; cols: DayCol[]; colW?: number; gap?: number[] | number; k?: number;
  links?: [number, number][];     // 結ぶ柱の組（前の柱の番号, 後の柱の番号）
  showMinutes?: boolean;           // 区分の中に分を書く
}> = ({ x, base, cols, colW = 150, gap = 120, k = 0.8, links = [], showMinutes = true }) => {
  const gaps = Array.isArray(gap) ? gap : cols.map(() => gap);
  const xs: number[] = [];
  cols.reduce((acc, _, i) => { xs.push(acc); return acc + colW + (gaps[i] ?? 0); }, x);
  // 区分ごとの上下の位置
  const geo = cols.map((c) => {
    let acc = 0;
    return c.segs.map((s) => { const h = s.min * k; const g = { y0: base - acc - h, y1: base - acc, h }; acc += h; return g; });
  });
  return (
    <g>
      {/* 前と後をつなぐ帯（同じ区分どうし） */}
      {links.map(([a, b], li) => cols[a].segs.map((s, si) => {
        const j = cols[b].segs.findIndex((t) => t.key === s.key);
        if (j < 0) return null;
        const g0 = geo[a][si], g1 = geo[b][j];
        const x0 = xs[a] + colW, x1 = xs[b];
        return <path key={`${li}-${si}`} d={`M${x0} ${g0.y0} L${x1} ${g1.y0} L${x1} ${g1.y1} L${x0} ${g0.y1} Z`} fill={s.color} opacity={0.35} />;
      }))}
      <line x1={x - 30} x2={xs[xs.length - 1] + colW + 30} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
      {cols.map((c, ci) => {
        const total = c.segs.reduce((a, s) => a + s.min, 0);
        const top = base - total * k;
        return (
          <g key={ci}>
            {c.segs.map((s, si) => {
              const g = geo[ci][si];
              const inside = g.h >= (showMinutes ? 104 : 50);
              return (
                <g key={s.key}>
                  <rect data-qa="mark" data-qa-label={`${c.title}：${s.label}`} x={xs[ci]} y={g.y0} width={colW} height={Math.max(2, g.h)} fill={s.color}
                    stroke={s.focus ? C.ink : C.white} strokeWidth={s.focus ? LINE.base : 2} rx={si === c.segs.length - 1 ? R.sm : 0} />
                  {inside && (
                    <>
                      <text x={xs[ci] + colW / 2} y={g.y0 + g.h / 2 + (showMinutes ? -6 : 14)} textAnchor="middle" style={font("label", s.textColor ?? C.ink)}>{s.label}</text>
                      {showMinutes && <text x={xs[ci] + colW / 2} y={g.y0 + g.h / 2 + 44} textAnchor="middle" style={font("label", s.textColor ?? C.ink)}>{fmt(s.min)}</text>}
                    </>
                  )}
                </g>
              );
            })}
            <text x={xs[ci] + colW / 2} y={top - 22} textAnchor="middle" style={font("label")}>{c.total ?? fmt(total)}</text>
            <text x={xs[ci] + colW / 2} y={base + 50} textAnchor="middle" style={font("label", c.titleColor ?? C.ink)}>{c.title}</text>
            {c.sub && <text x={xs[ci] + colW / 2} y={base + 96} textAnchor="middle" style={font("label", C.ink2)}>{c.sub}</text>}
          </g>
        );
      })}
    </g>
  );
};

export const dayFmt = fmt;
