// 天秤（2つの量を比べる比喩。4本目「40代、夫婦の満足」で作った。2026-10-06）。
// 左右の皿に「おもり」（Weight）を積む。おもりは横幅をそろえ、高さ＝量（面積＝量。1つの天秤の中は同じ物差し k）。
// 傾きは量の差から決まる（tiltOf）。答えを見せない場面（動いている途中）は tilt で角度を決め、moving で揺れの弧と「？」を出す。
// 色：おもりの色は呼ぶ側が決める（男女の回なら 夫＝male 系、妻＝female 系。仕事など男女に関係ない量は otherTint）。
// 印：おもりは data-qa="mark"、台・梁・皿は部分ごとに "prop"（全体には付けない）。おもりの中の文字は高さが足りるときだけ中に、足りないときは横に出す。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type Weight = { label: string; value: number; color: string; text?: string; textColor?: string; dashed?: boolean }; // text は \n で2行に

export const BALANCE = { L: 560, string: 300, panW: 380, blockW: 240 } as const;

/** 量の差から傾き（度）。右が重いと正（右が下がる）。±max で止める */
export const tiltOf = (left: number, right: number, max = 10) => {
  const sum = left + right;
  if (sum <= 0) return 0;
  return Math.max(-max, Math.min(max, ((right - left) / sum) * 40));
};

const sum = (ws: Weight[]) => ws.reduce((a, w) => a + w.value, 0);

const Stack: React.FC<{ x: number; y: number; ws: Weight[]; k: number; side: -1 | 1 }> = ({ x, y, ws, k, side }) => {
  let acc = 0;
  const bw = BALANCE.blockW;
  return (
    <g>
      {ws.map((w, i) => {
        const h = Math.max(4, w.value * k);
        const top = y - acc - h;
        acc += h;
        const lines = (w.text ?? "").split("\n");
        const inside = h >= lines.length * 48 + 16;
        // 横に出すときは天秤の内側（柱の側）へ。外側は画面の端に近い
        const sx = x - side * (BALANCE.panW / 2 + 12);
        return (
          <g key={i}>
            <rect data-qa="mark" data-qa-label={`おもり：${w.label}`} x={x - bw / 2} y={top} width={bw} height={h} rx={R.sm}
              fill={w.dashed ? "none" : w.color} stroke={C.ink} strokeWidth={w.dashed ? LINE.thin : 3} strokeDasharray={w.dashed ? "12 10" : undefined} />
            {w.text && lines.map((l, k) => (inside
              ? <text key={k} x={x} y={top + h / 2 + 14 + (k - (lines.length - 1) / 2) * 48} textAnchor="middle" style={font("label", w.textColor ?? C.ink)}>{l}</text>
              : <text key={k} x={sx} y={top + h / 2 + 14 + (k - (lines.length - 1) / 2) * 48} textAnchor={side > 0 ? "end" : "start"} style={font("label")}>{l}</text>))}
          </g>
        );
      })}
    </g>
  );
};

export const Balance: React.FC<{
  x: number; y: number;          // 支点（梁の真ん中）
  left: Weight[]; right: Weight[];
  k?: number;                    // 1分（1単位）あたりの高さ px
  tilt?: number;                 // 角度を決めるとき（動いている途中など）。省くと量から
  moving?: boolean;              // 動いている途中（揺れの弧と「？」）
  leftName?: string; rightName?: string; leftColor?: string; rightColor?: string;
}> = ({ x, y, left, right, k = 0.45, tilt, moving = false, leftName, rightName, leftColor = C.ink, rightColor = C.ink }) => {
  const th = tilt ?? tiltOf(sum(left), sum(right));
  const a = (th * Math.PI) / 180;
  const { L, string: S, panW } = BALANCE;
  const ends = [{ x: x - L * Math.cos(a), y: y - L * Math.sin(a) }, { x: x + L * Math.cos(a), y: y + L * Math.sin(a) }];
  const base = y + 470;
  return (
    <g>
      {/* 印は部分ごとに付ける（全体に付けると、傾いた梁と皿の外側の箱が画面の半分を覆い、まわりの文字がすべて重なりになる） */}
      <g>
        {/* 台と柱 */}
        <g data-qa="prop" data-qa-label="天秤の台">
          <path d={`M${x - 150} ${base} H${x + 150} L${x + 90} ${base - 40} H${x - 90} Z`} fill={C.ink2} />
          <rect x={x - 12} y={y} width={24} height={base - y - 40} fill={C.ink2} />
        </g>
        {/* 目盛り（針の後ろの弧） */}
        <path d={`M${x - 90} ${y - 110} A 140 140 0 0 1 ${x + 90} ${y - 110}`} fill="none" stroke={C.ink2} strokeWidth={LINE.hair} />
        <line x1={x} x2={x} y1={y - 150} y2={y - 128} stroke={C.ink2} strokeWidth={LINE.hair} />
        {/* 針（梁と一緒に回る） */}
        <line x1={x} y1={y} x2={x + 130 * Math.sin(a)} y2={y - 130 * Math.cos(a)} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
        {/* 梁 */}
        <line data-qa="prop" data-qa-label="天秤の梁" x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" />
        <circle cx={x} cy={y} r={20} fill={C.ink} />
        {/* 皿のひもと皿 */}
        {ends.map((e, i) => (
          <g key={i}>
            <path d={`M${e.x} ${e.y} V${e.y + 40} M${e.x - panW / 2 + 16} ${e.y + 40} H${e.x + panW / 2 - 16} M${e.x - panW / 2 + 16} ${e.y + 40} V${e.y + S} M${e.x + panW / 2 - 16} ${e.y + 40} V${e.y + S}`}
              stroke={C.ink2} strokeWidth={LINE.hair} fill="none" />
            <path data-qa="prop" data-qa-label="天秤の皿" d={`M${e.x - panW / 2} ${e.y + S} H${e.x + panW / 2} Q${e.x + panW / 2 - 20} ${e.y + S + 34} ${e.x} ${e.y + S + 34} Q${e.x - panW / 2 + 20} ${e.y + S + 34} ${e.x - panW / 2} ${e.y + S} Z`}
              fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          </g>
        ))}
      </g>
      {/* 揺れの弧と「？」（止まる位置は見せない） */}
      {moving && (
        <g>
          {ends.map((e, i) => (
            <path key={i} d={`M${e.x + (i ? 40 : -40)} ${e.y - 90} q ${i ? 30 : -30} 60 0 120`} fill="none" stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="10 10" strokeLinecap="round" />
          ))}
          <text x={x + 140} y={y - 70} style={font("value")}>？</text>
        </g>
      )}
      <Stack x={ends[0].x} y={ends[0].y + S} ws={left} k={k} side={-1} />
      <Stack x={ends[1].x} y={ends[1].y + S} ws={right} k={k} side={1} />
      {/* 皿の名前（皿の下） */}
      {leftName && <text x={ends[0].x} y={ends[0].y + S + 96} textAnchor="middle" style={font("value", leftColor)}>{leftName}</text>}
      {rightName && <text x={ends[1].x} y={ends[1].y + S + 96} textAnchor="middle" style={font("value", rightColor)}>{rightName}</text>}
    </g>
  );
};
