// 割合の線（年齢などの区分ごと。夫と妻・男女の2本を比べる。4本目「40代、夫婦の満足」で作った。2026-10-06）。
// LineChart（推移）と違い、縦軸は0〜100%で固定（割合は100%と合わせる。頭打ち・底上げで差を変えない）。
// 線の色は性別の色（male・female）。ほかの調査の点（ghost）は白抜きの点で重ねる。upTo で途中の区分まで描く（線が伸びる途中の姿）。
// callouts で決めた点に値を書く（声で言う数字だけ）。band で区分の範囲に帯を敷く（「あなたの年ごろ」など）。
// 印：線と点は data-qa="mark"。値の文字は点の上か下（above）に置く。
// 2026-10-06 第2版（絵コンテの3役の見直し）：
//   - 値は100%の線より上に出さない（100%を超えた値に見える）。上に置くと線の外に出るときは dx・dy で点の横・下へ。
//   - 2本が同じ点で重なるときは、片方を ring（太い輪）にして、中にもう片方の点が入る形で見せる（片方が隠れない）。
//   - 別の調査の点（ghost）は、つながない・別の色（墨の灰）にする（聞き方が違う値を同じ線の仲間に見せない）。
//   - 横軸の区分の名前は、縦軸のいちばん下の目盛り（「0%」「1点」）と上下16px以上空ける（+74）。
//   - 線の右端の名前（夫・妻）は、近いときは上下に押し広げる（58px以上の送り）。2026-10-06
//   - 帯の見出しは labelAt="bottom" で帯の中の下に（上に置くと値の文字とぶつかる）。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type GLSeries = { label: string; color: string; values: (number | null)[]; xs?: number[]; ghost?: boolean; dashed?: boolean; ring?: boolean; thin?: boolean }; // xs：区分の番号（小数可）。省くと 0,1,2…。thin：細い線（重ねる比べ用）
export type GLCallout = { s: number; i: number; text: string; above?: boolean; dx?: number; dy?: number; anchor?: "start" | "middle" | "end"; color?: string };

export const GenderLines: React.FC<{
  x: number; y: number; width: number; height: number;
  ticks: string[];                 // 横軸の区分の名前（値と同じ数）
  series: GLSeries[];
  upTo?: number;                   // この区分まで描く（0始まり、含む）
  callouts?: GLCallout[];
  band?: { from: number; to: number; label?: string; labelAt?: "top" | "bottom" };
  axisTitle?: string;              // 横軸の題（右下）
  endLabels?: boolean;             // 線の右端に名前（夫・妻）
  domain?: [number, number];       // 縦軸（既定 0〜100%。平均点などは尺度の端から端まで：例 [1, 4]）
  yTicks?: number[]; yFormat?: (v: number) => string;
}> = ({ x, y, width, height, ticks, series, upTo, callouts = [], band, axisTitle, endLabels = true, domain = [0, 100], yTicks = [0, 50, 100], yFormat = (v) => `${v}%` }) => {
  const n = ticks.length;
  const X = (i: number) => x + (n === 1 ? width / 2 : (i / (n - 1)) * width);
  const Y = (v: number) => y + height - ((v - domain[0]) / (domain[1] - domain[0])) * height;
  const last = upTo ?? n - 1;
  // 線の右端の名前の高さ：近すぎる組は上下に押し広げる（文字の上下を16px以上。40px の文字で58px送り）
  const ends = series.map((s, si) => {
    const pts = s.values.map((v, i) => [s.xs?.[i] ?? i, v] as const).filter(([i, v]) => v !== null && i <= last) as [number, number][];
    return !endLabels || s.ghost || !s.label || !pts.length ? null : { si, y: Y(pts[pts.length - 1][1]) + 14 };
  }).filter((e): e is { si: number; y: number } => e !== null).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) {
    const need = 58 - (ends[k].y - ends[k - 1].y);
    if (need > 0) { ends[k].y += need / 2; for (let j = k - 1; j >= 0 && ends[j + 1].y - ends[j].y < 58; j--) ends[j].y = ends[j + 1].y - 58; }
  }
  const endY = new Map(ends.map((e) => [e.si, e.y]));
  return (
    <g>
      {band && (
        <g>
          <rect x={X(band.from) - 30} y={y} width={X(band.to) - X(band.from) + 60} height={height} rx={R.md} fill={C.paper2} />
          {band.label && <text x={(X(band.from) + X(band.to)) / 2} y={band.labelAt === "bottom" ? y + height - 28 : y - 18} textAnchor="middle"
            style={font("label", band.labelAt === "bottom" ? C.ink2 : C.ink)}>{band.label}</text>}
        </g>
      )}
      {/* 目盛り（既定は 0・50・100%） */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={x - 20} x2={x + width + 20} y1={Y(v)} y2={Y(v)} stroke={v === domain[0] ? C.ink : C.paper2} strokeWidth={v === domain[0] ? LINE.thin : LINE.hair} />
          <text x={x - 50} y={Y(v) + 14} textAnchor="end" style={font("label", C.ink2)}>{yFormat(v)}</text>
        </g>
      ))}
      {ticks.map((t, i) => <text key={i} x={X(i)} y={y + height + 74} textAnchor="middle" style={font("label", C.ink2)}>{t}</text>)}
      {axisTitle && <text x={x + width + 20} y={y + height + 120} textAnchor="end" style={font("note", C.ink2)}>{axisTitle}</text>}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => [s.xs?.[i] ?? i, v] as const).filter(([i, v]) => v !== null && i <= last) as [number, number][];
        if (!pts.length) return null;
        const [ei] = pts[pts.length - 1];
        return (
          <g key={si}>
            {!s.ghost && pts.length > 1 && (
              <polyline data-qa="mark" data-qa-label={`線：${s.label}`} points={pts.map(([i, v]) => `${X(i)},${Y(v)}`).join(" ")} fill="none"
                stroke={s.color} strokeWidth={s.thin ? LINE.thin : LINE.base} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? "14 12" : undefined} />
            )}
            {!s.thin && pts.map(([i, v]) => (
              <circle key={i} data-qa="mark" data-qa-label={`点：${s.label}`} cx={X(i)} cy={Y(v)} r={s.ring ? 19 : s.ghost ? 12 : 10}
                fill={s.ghost ? C.white : s.ring ? "none" : s.color} stroke={s.color} strokeWidth={s.ring ? LINE.base : s.ghost ? 5 : 0} />
            ))}
            {endY.has(si) && <text x={X(ei) + 28} y={endY.get(si)} style={font("label", s.color)}>{s.label}</text>}
          </g>
        );
      })}
      {callouts.map((c, k) => {
        const v = series[c.s].values[c.i];
        const xi = series[c.s].xs?.[c.i] ?? c.i;
        if (v === null || xi > last) return null;
        const above = c.above ?? true;
        return (
          <text key={k} x={X(xi) + (c.dx ?? 0)} y={(above ? Y(v) - 30 : Y(v) + 62) + (c.dy ?? 0)} textAnchor={c.anchor ?? "middle"} style={font("label", c.color ?? series[c.s].color)}>{c.text}</text>
        );
      })}
    </g>
  );
};
