// 2本目だけの絵の部品（雪玉・雪・雲・夜の部屋・村の目印・借金・持ち分の箱）。絵コンテ（Storyboard.tsx）と本編（Episode.tsx）で使う。
// 2026-10-05：絵コンテ第1版を3役（アニメーター・イラストレーター・デザイナー）が見直した指摘で作り直した（review/storyboard-summary.md）。
//   - 雪玉は扇形をやめ、内から外へ「芯（はじめの額）→ 利息（黒）→ 降った雪（白）」と重ねる。面積＝金額（半径＝k×√万円）。
//     同心円なので、回さずに横へ動かすだけで転がって見える（回転は決まりで使わない）。
//   - 雪は丸ではなく、6本の線の雪片。雲から雪玉の上へまっすぐ落ちる。
//   - 色は theme.ts の C だけ。蛍光ペン色はデータの塗りに使わない。
import React from "react";
import { C, font, LINE, R } from "@lib/theme";

/** SVG の画面（1920×1080）。SVG の部品はこの中に置く */
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
export const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（左上の決まった位置。Z.header） */
export const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1500, ...font("question") }}>{children}</div>
);

// ---- 雪玉 ----
/** 雪玉の半径（面積＝金額）。k は 1万円あたりの物差し。1つの場面の中では同じ k を使う */
export const ballR = (man: number, k = 3) => k * Math.sqrt(Math.max(0, man));

/** 雪玉。金額は万円。core＝はじめの額（灰）、interest＝利息（黒）、snow＝降った雪（白）。内から外へ重ねる。
 *  split を渡すと、利息を「芯が生んだ分（黒）」と「雪が生んだ分（墨2）」に分ける。 */
export const Snowball: React.FC<{
  x: number; y: number; core?: number; interest?: number; snow?: number; k?: number;
  split?: { fromCore: number; fromSnow: number }; empty?: boolean; label?: string;
}> = ({ x, y, core = 0, interest = 0, snow = 0, k = 3, split, empty = false, label }) => {
  if (empty) return <circle cx={x} cy={y} r={Math.max(8, k * 3)} fill="none" stroke={C.ink2} strokeWidth={3} strokeDasharray="6 6" />;
  const layers = split
    ? [[core, C.other], [split.fromCore, C.ink], [split.fromSnow, C.ink2], [snow, C.white]]
    : [[core, C.other], [interest, C.ink], [snow, C.white]];
  let sum = 0;
  const rings = layers.map(([v, color]) => { sum += v as number; return { r: ballR(sum, k), color: color as string, v: v as number }; });
  const outer = rings[rings.length - 1].r;
  return (
    <g data-qa="mark" data-qa-label={label ?? "雪玉"}>
      {[...rings].reverse().filter((g) => g.v > 0).map((g, i) => (
        <circle key={i} cx={x} cy={y} r={g.r} fill={g.color} stroke={g.color === C.white ? "none" : C.ink} strokeWidth={g.r > 30 ? 2 : 1} />
      ))}
      <circle cx={x} cy={y} r={outer} fill="none" stroke={C.ink} strokeWidth={outer > 40 ? LINE.thin : 2} />
    </g>
  );
};

// ---- 雪・雲 ----
/** 雪片1つ（6本の線） */
export const Flake: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 10, color = C.ink2 }) => (
  <g stroke={color} strokeWidth={Math.max(2, s / 4)} strokeLinecap="round">
    {[0, 60, 120].map((a) => {
      const dx = Math.cos((a * Math.PI) / 180) * s, dy = Math.sin((a * Math.PI) / 180) * s;
      return <line key={a} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} />;
    })}
  </g>
);
/** 降る雪（決まった並び。毎回同じ位置に出る） */
export const Snow: React.FC<{ x: number; y: number; w: number; h: number; n?: number; s?: number; color?: string }> = ({ x, y, w, h, n = 30, s = 10, color }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Flake key={i} x={x + (((i * 97) % 100) / 100) * w} y={y + (((i * 61 + 13) % 100) / 100) * h} s={s * (0.8 + ((i * 37) % 10) / 25)} color={color} />
    ))}
  </g>
);
/** 雲（給料）。w は横幅。label は雲の中の文字 */
export const Cloud: React.FC<{ x: number; y: number; w: number; label?: string; dashed?: boolean }> = ({ x, y, w, label, dashed = false }) => {
  const k = w / 400;
  return (
    <g data-qa="mark" data-qa-label="雲">
      <g transform={`translate(${x},${y}) scale(${k})`} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin / k} strokeDasharray={dashed ? `${10 / k} ${8 / k}` : undefined}>
        <path d="M-170 40 C-220 40 -220 -30 -160 -30 C-160 -90 -70 -100 -50 -60 C-30 -120 70 -120 80 -60 C130 -90 200 -50 170 0 C220 10 210 40 170 40 Z" />
      </g>
      {label && <text x={x} y={y + 10 * k + 6} textAnchor="middle" style={font("label")}>{label}</text>}
    </g>
  );
};

// ---- 夜の部屋（01 と最後の場面は同じ部屋・同じ窓） ----
export const ROOM = { floor: 880, win: { x: 1080, y: 150, w: 520, h: 400 }, bed: { x: 180, y: 690, w: 700, h: 120 } };
export const NightRoom: React.FC<{ snow?: boolean; cloud?: boolean; moonlight?: boolean }> = ({ snow = false, cloud = false, moonlight = false }) => {
  const { win, bed, floor } = ROOM;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={floor} fill={C.paper2} />
      <line x1={0} x2={1920} y1={floor} y2={floor} stroke={C.ink2} strokeWidth={LINE.thin} />
      {/* 窓：夜の空（墨）、三日月 */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={R.sm} fill={C.ink} stroke={C.ink} strokeWidth={LINE.base} />
      <path d={`M${win.x + 420} ${win.y + 70} a44 44 0 1 0 30 76 a36 36 0 1 1 -30 -76 Z`} fill={C.white} />
      {cloud && <Cloud x={win.x + 210} y={win.y + 110} w={300} />}
      {snow && <Snow x={win.x + 30} y={win.y + (cloud ? 180 : 40)} w={win.w - 60} h={cloud ? 190 : 330} n={cloud ? 22 : 34} s={9} color={C.white} />}
      <line x1={win.x + win.w / 2} x2={win.x + win.w / 2} y1={win.y} y2={win.y + win.h} stroke={C.paper2} strokeWidth={LINE.thin} />
      <rect x={win.x - 16} y={win.y + win.h} width={win.w + 32} height={18} fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} />
      {/* 窓から床へ落ちる光（最後の場面） */}
      {moonlight && <path d={`M${win.x + 40} ${floor} L${win.x + win.w - 40} ${floor} L${win.x + win.w + 140} 1000 L${win.x - 60} 1000 Z`} fill={C.white} opacity={0.7} />}
      {/* ベッド */}
      <rect x={bed.x} y={bed.y} width={bed.w} height={bed.h} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={bed.x + 20} y={bed.y - 40} width={170} height={60} rx={30} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={bed.x} y={bed.y + bed.h} width={24} height={floor - bed.y - bed.h} fill={C.ink} />
      <rect x={bed.x + bed.w - 24} y={bed.y + bed.h} width={24} height={floor - bed.y - bed.h} fill={C.ink} />
      {/* 時計：1時10分 */}
      <g transform="translate(700,230)">
        <circle r={56} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <line x1={0} y1={0} x2={22} y2={-30} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
        <line x1={0} y1={0} x2={40} y2={14} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};
/** スマホの光（画面から顔へ向かう白い扇） */
export const PhoneLight: React.FC<{ x: number; y: number; dx: number; dy: number }> = ({ x, y, dx, dy }) => (
  <path d={`M${x} ${y} L${x + dx - 40} ${y + dy} L${x + dx + 40} ${y + dy + 30} Z`} fill={C.white} opacity={0.85} />
);

// ---- 村の目印（1つ約120px。冒頭の「分かれ道の札」と同じ形） ----
export type VillageKind = "預金" | "積立" | "稼ぐ力" | "起業" | "不動産" | "両方";
export const VILLAGES: VillageKind[] = ["預金", "積立", "稼ぐ力", "起業", "不動産", "両方"];
export const VillageIcon: React.FC<{ kind: VillageKind; x: number; y: number; s?: number }> = ({ kind, x, y, s = 1 }) => {
  const st = { stroke: C.ink, strokeWidth: LINE.thin / s, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const chart = (ox: number, oy: number, k = 1) => (
    <g transform={`translate(${ox},${oy}) scale(${k})`}>
      <rect x={-34} y={-30} width={68} height={60} rx={6} fill={C.white} {...st} />
      <polyline points="-24,16 -10,2 2,10 22,-18" fill="none" {...st} />
    </g>
  );
  const door = (ox: number, oy: number, k = 1) => (
    <g transform={`translate(${ox},${oy}) scale(${k})`}>
      <rect x={-24} y={-40} width={48} height={80} fill={C.white} {...st} />
      <path d="M-24 -40 L8 -30 L8 48 L-24 40 Z" fill={C.ink} />
      <path d="M14 0 L34 0 M26 -8 L34 0 L26 8" fill="none" {...st} />
    </g>
  );
  let body: React.ReactNode;
  switch (kind) {
    case "預金": body = (<g>
      <rect x={-40} y={-30} width={80} height={60} rx={4} fill={C.white} {...st} />
      <line x1={-40} x2={40} y1={-14} y2={-14} {...st} />
      {[0, 10].map((d) => <line key={d} x1={-28} x2={28} y1={2 + d} y2={2 + d} stroke={C.ink2} strokeWidth={3 / s} />)}
    </g>); break;
    case "積立": body = chart(0, 0); break;
    case "稼ぐ力": body = door(-6, 0); break;
    case "起業": body = (<g>
      <rect x={-40} y={-6} width={80} height={44} fill={C.white} {...st} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-44 + i * 22} -30 h22 v20 a11 11 0 0 1 -22 0 Z`} fill={i % 2 ? C.white : C.ink} {...st} />)}
      <rect x={-10} y={10} width={20} height={28} fill={C.ink} />
    </g>); break;
    case "不動産": body = (<g>
      <rect x={-28} y={-40} width={56} height={80} fill={C.white} {...st} />
      {[-24, -6, 12].map((yy) => [-14, 6].map((xx) => <rect key={`${xx}${yy}`} x={xx} y={yy} width={9} height={11} fill={C.ink} />))}
    </g>); break;
    case "両方": body = (<g>{door(-26, 0, 0.75)}{chart(24, 0, 0.75)}</g>); break;
  }
  return <g transform={`translate(${x},${y}) scale(${s})`}>{body}</g>;
};

// ---- 借金（鎖の玉） ----
export const DebtBall: React.FC<{ x: number; y: number; r?: number; from?: { x: number; y: number }; label?: boolean }> = ({ x, y, r = 34, from, label = false }) => (
  <g data-qa="mark" data-qa-label="借金" data-qa-allow="figure">
    {from && <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={C.ink} strokeWidth={4} strokeDasharray="10 6" />}
    <circle cx={x} cy={y} r={r} fill={C.ink} />
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
      <rect x={x} y={solidTop} width={w} height={Math.min(price, debt) * k} fill={C.ink2} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={x + w / 2} y={solidTop + 70} textAnchor="middle" style={font("label", C.white)}>借金</text>
      {eq >= 0
        ? <rect x={x} y={base - price * k} width={w} height={eq * k} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        // 値段が借金より安い：家を売っても返せない借金（点線の箱）
        : <rect x={x} y={base - debt * k} width={w} height={-eq * k} fill={C.bg} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 8" />}
      {title && <text x={x + w / 2} y={base + 56} textAnchor="middle" style={font("label")}>{title}</text>}
    </g>
  );
};
