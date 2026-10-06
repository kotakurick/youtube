// 天秤（2つの量を比べる比喩。4本目「40代、夫婦の満足」で作った。2026-10-06）。
// 左右の皿に「おもり」（Weight＝分銅）を積む。おもりは横幅をそろえ、高さ＝量（面積＝量。1つの天秤の中は同じ物差し k）。
// 傾きは量の差から決まる（tiltOf）。答えを見せない場面（動いている途中）は tilt で角度を決め、moving を付ける。
// 色：おもりの色は呼ぶ側が決める（男女の回なら 夫＝male、妻＝female）。内訳は濃い・淡いでなく塗りの種類（fill：塗り／斜線／水玉。Fills.tsx）で分ける。
// 印：おもりは data-qa="mark"、台・梁・皿・目盛りは部分ごとに "prop"（全体には付けない）。おもりの中の文字は高さが足りるときだけ中に、足りないときは横に出す。
// 2026-10-06 第2版（絵コンテの3役の見直し）：
//   - 皿の吊りは梁の端の1点から三角に開くひも（縦2本＋横棒の枠は箱に見えた）。分銅のいちばん上につまみ（量には入れない）。
//   - 針と目盛りは支点の下（梁の上に伸びると見出しの行にかかった）。
//   - 動いている途中（moving）は、前の角度の梁を淡く残し（from）、下がっていく側の皿の外に下向きの曲がった矢印、針の先に「？」。
//   - 中身を隠す分銅（veiled）：量に関係なく同じ大きさの「？」の袋。答え合わせの前に高さで答えが見えないようにする。
//   - 量り忘れの分銅（dashed）：点線の形だけ（中は塗らない）。mark で中に「？」など。
//   - 細い線は縮めても細くならない（vector-effect: non-scaling-stroke）。小さい版は <g transform="scale()"> で縮めて使う。
import React from "react";
import { FillDefs, fillOf, FillKind, textHalo } from "./Fills";
import { C, font, LINE, R } from "./theme";

export type Weight = {
  label: string; value: number; color: string;
  text?: string; textColor?: string;   // text は \n で2行に
  fill?: FillKind;                     // 塗りの種類（既定 solid）
  dashed?: boolean;                    // 量り忘れ（点線の形だけ）
  veiled?: boolean;                    // 中身を隠す（同じ大きさの「？」の袋）
  mark?: string;                       // 点線の分銅の中の文字（「？」など）
};

export const BALANCE = { L: 560, string: 300, panW: 380, blockW: 240, veilH: 160 } as const;

/** 量の差から傾き（度）。右が重いと正（右が下がる）。±max で止める */
export const tiltOf = (left: number, right: number, max = 10) => {
  const sum = left + right;
  if (sum <= 0) return 0;
  return Math.max(-max, Math.min(max, ((right - left) / sum) * 40));
};

const sum = (ws: Weight[]) => ws.reduce((a, w) => a + w.value, 0);
const NS = { vectorEffect: "non-scaling-stroke" } as const;

const Sack: React.FC<{ x: number; top: number; h: number; label: string }> = ({ x, top, h, label }) => {
  const w = BALANCE.blockW;
  const neck = top + 34;
  return (
    <g data-qa="mark" data-qa-label={`おもり：${label}（隠す）`}>
      <path d={`M${x - w / 2 + 10} ${top + h} Q${x - w / 2 - 6} ${neck + 30} ${x - 40} ${neck} L${x - 26} ${top + 8} H${x + 26} L${x + 40} ${neck} Q${x + w / 2 + 6} ${neck + 30} ${x + w / 2 - 10} ${top + h} Z`}
        fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} strokeLinejoin="round" {...NS} />
      <path d={`M${x - 44} ${neck} H${x + 44}`} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" {...NS} />
      <text data-qa-allow="mark" x={x} y={neck + (h - 34) / 2 + 30} textAnchor="middle" style={font("value", C.ink)}>？</text>
    </g>
  );
};

const Stack: React.FC<{ x: number; y: number; ws: Weight[]; k: number; side: -1 | 1 }> = ({ x, y, ws, k, side }) => {
  let acc = 0;
  const bw = BALANCE.blockW;
  return (
    <g>
      {ws.map((w, i) => {
        const h = w.veiled ? BALANCE.veilH : Math.max(4, w.value * k);
        const top = y - acc - h;
        acc += h;
        if (w.veiled) return <Sack key={i} x={x} top={top} h={h} label={w.label} />;
        const lines = (w.text ?? "").split("\n");
        const inside = h >= lines.length * 48 + 16;
        const last = i === ws.length - 1;
        const solid = !w.fill || w.fill === "solid";
        // 横に出すときは天秤の内側（柱の側）へ。外側は画面の端に近い
        const sx = x - side * (BALANCE.panW / 2 + 12);
        const tc = w.textColor ?? (solid ? C.white : C.ink);
        return (
          <g key={i}>
            {/* つまみ（いちばん上の分銅だけ。量には入れない） */}
            {last && !w.dashed && (
              <g data-qa="mark" data-qa-label={`つまみ：${w.label}`}>
                <rect x={x - 26} y={top - 18} width={52} height={20} rx={R.sm} fill={w.color} stroke={C.ink} strokeWidth={3} {...NS} />
                <circle cx={x} cy={top - 30} r={14} fill={w.color} stroke={C.ink} strokeWidth={3} {...NS} />
              </g>
            )}
            <rect data-qa="mark" data-qa-label={`おもり：${w.label}`} x={x - bw / 2} y={top} width={bw} height={h} rx={R.md}
              fill={w.dashed ? "none" : fillOf(w.fill, w.color)} stroke={w.dashed ? w.color : C.ink} strokeWidth={w.dashed ? LINE.base : 3}
              strokeDasharray={w.dashed ? "16 12" : undefined} {...NS} />
            {w.dashed && w.mark && <text data-qa-allow="mark" x={x} y={top + h / 2 + 22} textAnchor="middle" style={font("value", C.ink2)}>{w.mark}</text>}
            {w.text && lines.map((l, kk) => (inside
              ? <text key={kk} data-qa-allow="mark" x={x} y={top + h / 2 + 14 + (kk - (lines.length - 1) / 2) * 48} textAnchor="middle"
                style={{ ...font("label", tc), ...(solid ? {} : textHalo) }}>{l}</text>
              : <text key={kk} x={sx} y={top + h / 2 + 14 + (kk - (lines.length - 1) / 2) * 48} textAnchor={side > 0 ? "end" : "start"} style={font("label")}>{l}</text>))}
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
  moving?: boolean;              // 動いている途中（前の角度の残像・下向きの矢印・「？」）
  from?: number;                 // 動いている途中の、前の角度（既定は tilt の2倍）
  leftName?: string; rightName?: string; leftColor?: string; rightColor?: string;
}> = ({ x, y, left, right, k = 0.45, tilt, moving = false, from, leftName, rightName, leftColor = C.ink, rightColor = C.ink }) => {
  const th = tilt ?? tiltOf(sum(left), sum(right));
  const rad = (d: number) => (d * Math.PI) / 180;
  const a = rad(th);
  const { L, string: S, panW } = BALANCE;
  const endsAt = (ang: number) => [{ x: x - L * Math.cos(ang), y: y - L * Math.sin(ang) }, { x: x + L * Math.cos(ang), y: y + L * Math.sin(ang) }];
  const ends = endsAt(a);
  const base = y + 470;
  const DR = 120; // 目盛りの半径
  const colors = Array.from(new Set([...left, ...right].filter((w) => w.fill && w.fill !== "solid").map((w) => w.color)));
  const prev = from ?? th * 2;
  // 下がっていく側：前の角度より左が下がる（角度が小さくなる）なら左
  const goSide: -1 | 1 = th < prev ? -1 : 1;
  const ge = ends[goSide < 0 ? 0 : 1];
  return (
    <g>
      {colors.length > 0 && <FillDefs colors={colors} />}
      {/* 台と柱 */}
      <g data-qa="prop" data-qa-label="天秤の台">
        <path d={`M${x - 150} ${base} H${x + 150} L${x + 90} ${base - 40} H${x - 90} Z`} fill={C.ink2} />
        <rect x={x - 12} y={y} width={24} height={base - y - 40} fill={C.ink2} />
      </g>
      {/* 目盛り（支点の下の扇形）と針（梁と一緒に回る） */}
      <g data-qa="prop" data-qa-label="天秤の目盛り">
        <path d={`M${x} ${y} L${x - DR * Math.sin(rad(40))} ${y + DR * Math.cos(rad(40))} A ${DR} ${DR} 0 0 0 ${x + DR * Math.sin(rad(40))} ${y + DR * Math.cos(rad(40))} Z`}
          fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} strokeLinejoin="round" {...NS} />
        {[-30, -15, 0, 15, 30].map((d) => (
          <line key={d} x1={x + (DR - (d ? 14 : 26)) * Math.sin(rad(d))} y1={y + (DR - (d ? 14 : 26)) * Math.cos(rad(d))} x2={x + DR * Math.sin(rad(d))} y2={y + DR * Math.cos(rad(d))}
            stroke={C.ink} strokeWidth={LINE.hair} {...NS} />
        ))}
        <line x1={x} y1={y} x2={x - (DR - 10) * Math.sin(a)} y2={y + (DR - 10) * Math.cos(a)} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      </g>
      {/* 動いている途中：前の角度の梁（残像） */}
      {moving && (() => { const pe = endsAt(rad(prev)); return <line x1={pe[0].x} y1={pe[0].y} x2={pe[1].x} y2={pe[1].y} stroke={C.rest} strokeWidth={LINE.heavy} strokeLinecap="round" />; })()}
      {/* 梁 */}
      <line data-qa="prop" data-qa-label="天秤の梁" x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" />
      <circle cx={x} cy={y} r={20} fill={C.ink} />
      {/* 皿のひも（梁の端の1点から三角に）と皿 */}
      {ends.map((e, i) => (
        <g key={i}>
          <path d={`M${e.x - panW / 2 + 12} ${e.y + S} L${e.x} ${e.y} L${e.x + panW / 2 - 12} ${e.y + S}`} stroke={C.ink2} strokeWidth={LINE.thin} fill="none" strokeLinejoin="round" {...NS} />
          <circle cx={e.x} cy={e.y} r={10} fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} {...NS} />
          <path data-qa="prop" data-qa-label="天秤の皿" d={`M${e.x - panW / 2} ${e.y + S} H${e.x + panW / 2} Q${e.x + panW / 2 - 20} ${e.y + S + 34} ${e.x} ${e.y + S + 34} Q${e.x - panW / 2 + 20} ${e.y + S + 34} ${e.x - panW / 2} ${e.y + S} Z`}
            fill={C.white} stroke={C.ink} strokeWidth={LINE.base} {...NS} />
        </g>
      ))}
      <Stack x={ends[0].x} y={ends[0].y + S} ws={left} k={k} side={-1} />
      <Stack x={ends[1].x} y={ends[1].y + S} ws={right} k={k} side={1} />
      {/* 動いている途中：下がっていく側の皿の外に下向きの曲がった矢印、針の先に「？」 */}
      {moving && (() => {
        const ax = ge.x + goSide * (panW / 2 + 50), ay = ge.y + S - 150;
        return (
          <g data-qa="mark" data-qa-label="動きの矢印">
            <path d={`M${ax - goSide * 30} ${ay} Q${ax + goSide * 40} ${ay + 60} ${ax} ${ay + 120}`} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
            <path d={`M${ax - 18} ${ay + 104} L${ax} ${ay + 138} L${ax + 18} ${ay + 104} Z`} fill={C.ink} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          </g>
        );
      })()}
      {moving && <text x={x + DR + 50} y={y + DR - 10} style={font("value")}>？</text>}
      {/* 皿の名前（皿の下） */}
      {leftName && <text x={ends[0].x} y={ends[0].y + S + 96} textAnchor="middle" style={font("value", leftColor)}>{leftName}</text>}
      {rightName && <text x={ends[1].x} y={ends[1].y + S + 96} textAnchor="middle" style={font("value", rightColor)}>{rightName}</text>}
    </g>
  );
};

/** 皿にのっていない分銅（量り忘れたもの）。点線の形とつまみ、中に mark（「？」など）。x,y は底の中央 */
export const LooseWeight: React.FC<{ x: number; y: number; color: string; label: string; w?: number; h?: number; mark?: string }> = ({ x, y, color, label, w = 200, h = 110, mark = "？" }) => (
  <g data-qa="mark" data-qa-label={`量り忘れ：${label}`}>
    <circle cx={x} cy={y - h - 30} r={14} fill="none" stroke={color} strokeWidth={LINE.thin} strokeDasharray="8 6" {...NS} />
    <rect x={x - 26} y={y - h - 18} width={52} height={20} rx={R.sm} fill="none" stroke={color} strokeWidth={LINE.thin} strokeDasharray="8 6" {...NS} />
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={R.md} fill="none" stroke={color} strokeWidth={LINE.base} strokeDasharray="16 12" {...NS} />
    {mark && <text data-qa-allow="mark" x={x} y={y - h / 2 + 22} textAnchor="middle" style={font("value", C.ink2)}>{mark}</text>}
  </g>
);
