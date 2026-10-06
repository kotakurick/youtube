// 小道具（墨の線＋白・紙色だけ。データの色は使わない）。人物・背景と組み合わせて自由に置く。
// 家具（Table・Chair・Desk）は人物と同じ大きさの単位で描く：size に人物の size を渡せば、人と家具の大きさがそろう。
// 線は拡大しても太さが変わらない（4px）。原点は床の中央。
import React from "react";
import { C, font, LINE, R } from "./theme";

const line = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ns = { vectorEffect: "non-scaling-stroke" as const };

/** スマホ（原点＝中心、h＝高さ px）。画面は一覧（list）・いいね（like）・メッセージ（message） */
export const Phone: React.FC<{ x: number; y: number; h?: number; screen?: "list" | "like" | "message" | "blank"; likes?: number }> = (
  { x, y, h = 360, screen = "list", likes = 3 },
) => {
  const w = h * 0.5, k = h / 360;
  const sx = -w / 2 + 12 * k, sy = -h / 2 + 30 * k, sw = w - 24 * k, sh = h - 60 * k;
  return (
    <g data-qa="prop" data-qa-label="スマホ" transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.16} fill={C.ink} />
      <rect x={sx} y={sy} width={sw} height={sh} rx={6 * k} fill={C.white} />
      {screen === "list" && [0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${sx + 14 * k},${sy + 18 * k + i * 66 * k})`}>
          <circle cx={18 * k} cy={18 * k} r={18 * k} fill={C.rest} />
          <rect x={46 * k} y={6 * k} width={sw - 80 * k} height={10 * k} rx={5 * k} fill={C.ink2} />
          <rect x={46 * k} y={24 * k} width={(sw - 80 * k) * 0.6} height={8 * k} rx={4 * k} fill={C.rest} />
        </g>
      ))}
      {screen === "like" && (
        <g transform={`translate(0,${-10 * k})`}>
          <path transform={`scale(${2.2 * k})`} d="M0 14 C-22 0 -18 -18 -6 -16 C-2 -15 0 -12 0 -10 C0 -12 2 -15 6 -16 C18 -18 22 0 0 14 Z"
            fill={C.white} {...line} {...ns} />
          <text x={0} y={90 * k} textAnchor="middle" style={{ ...font("value"), fontSize: Math.max(28, 52 * k) }}>{likes}</text>
        </g>
      )}
      {screen === "message" && (
        <g>
          <rect x={sx + 12 * k} y={sy + 24 * k} width={sw * 0.62} height={44 * k} rx={14 * k} fill={C.paper2} />
          <rect x={sx + sw - 12 * k - sw * 0.5} y={sy + 84 * k} width={sw * 0.5} height={44 * k} rx={14 * k} fill={C.ink2} />
          <rect x={sx + 12 * k} y={sy + 144 * k} width={sw * 0.45} height={44 * k} rx={14 * k} fill={C.paper2} />
        </g>
      )}
    </g>
  );
};

/** テーブル（人物の単位で高さ19・幅 w）。人物の横に置く。上に物を置くときの高さは tableTop(size) */
export const tableTop = (size: number) => -21 * size;
export const Table: React.FC<{ x: number; y: number; size?: number; w?: number }> = ({ x, y, size = 1, w = 60 }) => (
  <g data-qa="prop" data-qa-label="テーブル" transform={`translate(${x},${y}) scale(${size})`}>
    <path d={`M${-w / 2 + 5} -19 V5 M${w / 2 - 5} -19 V5`} {...line} {...ns} />
    <rect x={-w / 2} y={-21} width={w} height={3} rx={1} fill={C.white} {...line} {...ns} />
  </g>
);

/** 椅子（人物の単位。座面の高さ9＝Figure の座る姿勢と同じ）。人物より先に描くと、背もたれが人物の後ろになる */
export const Chair: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 1 }) => (
  <g data-qa="prop" data-qa-label="椅子" transform={`translate(${x},${y}) scale(${size})`}>
    <rect x={-14} y={-40} width={28} height={30} rx={3} fill={C.paper2} {...line} {...ns} />
    <path d="M-16 -9 H16 M-12 -9 V5 M12 -9 V5" {...line} {...ns} />
  </g>
);

/** 机とモニター（人物の単位）。人物の横か後ろに置く */
export const Desk: React.FC<{ x: number; y: number; size?: number; w?: number }> = ({ x, y, size = 1, w = 70 }) => (
  <g data-qa="prop" data-qa-label="机" transform={`translate(${x},${y}) scale(${size})`}>
    <path d={`M${-w / 2 + 4} -20 V5 M${w / 2 - 4} -20 V5`} {...line} {...ns} />
    <rect x={-w / 2} y={-22} width={w} height={3} rx={1} fill={C.paper2} {...line} {...ns} />
    <rect x={-14} y={-46} width={28} height={19} rx={2} fill={C.white} {...line} {...ns} />
    <path d="M0 -27 V-22 M-5 -22 H5" {...line} {...ns} />
  </g>
);

/** 掛け時計（原点＝中心、r は px） */
export const Clock: React.FC<{ x: number; y: number; r?: number; hour?: number; minute?: number }> = ({ x, y, r = 50, hour = 9, minute = 0 }) => {
  const a = (deg: number, len: number) => `L${Math.sin((deg * Math.PI) / 180) * len} ${-Math.cos((deg * Math.PI) / 180) * len}`;
  return (
    <g data-qa="prop" data-qa-label="時計" transform={`translate(${x},${y})`}>
      <circle r={r} fill={C.white} {...line} />
      <path d={`M0 0 ${a((hour % 12) * 30 + minute / 2, r * 0.5)} M0 0 ${a(minute * 6, r * 0.75)}`} {...line} strokeWidth={LINE.base - 2} />
      <circle r={4} fill={C.ink} />
    </g>
  );
};

/** 壁のカレンダー（原点＝左上、w は px） */
export const Calendar: React.FC<{ x: number; y: number; w?: number; label?: string }> = ({ x, y, w = 120, label = "" }) => (
  <g data-qa="prop" data-qa-label="カレンダー" transform={`translate(${x},${y})`}>
    <rect width={w} height={w * 1.1} rx={R.sm} fill={C.white} {...line} />
    <rect width={w} height={w * 0.28} rx={R.sm} fill={C.ink} />
    {label
      ? <text x={w / 2} y={w * 0.85} textAnchor="middle" style={{ ...font("value"), fontSize: Math.max(28, w * 0.4) }}>{label}</text>
      : [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={10 + c * (w - 20) / 4} y={w * 0.4 + r * w * 0.2} width={(w - 20) / 4 - 6} height={w * 0.12} rx={2} fill={C.paper2} />))}
  </g>
);

/** カップ（原点＝底の中央、人物の単位。テーブルの上なら y に tableTop(size) を足す） */
export const Cup: React.FC<{ x: number; y: number; size?: number; steam?: boolean }> = ({ x, y, size = 1, steam = true }) => (
  <g data-qa="prop" data-qa-label="カップ" transform={`translate(${x},${y}) scale(${size / 5})`}>
    <path d="M-16 -36 H16 V-8 Q16 0 8 0 H-8 Q-16 0 -16 -8 Z" fill={C.white} {...line} {...ns} />
    <path d="M16 -28 Q28 -28 28 -18 Q28 -10 16 -10" fill="none" {...line} {...ns} />
    {steam && <path d="M-6 -46 Q-10 -54 -6 -62 M6 -46 Q2 -54 6 -62" fill="none" {...line} {...ns} strokeWidth={LINE.hair + 1} stroke={C.ink2} />}
  </g>
);

/** ベンチ（人物の単位。座面の高さ9＝座る姿勢と同じ。背もたれと脚つき。2026-10-06 4本目で追加）。w は座面の幅。猫より先に描く */
export const Bench: React.FC<{ x: number; y: number; size?: number; w?: number }> = ({ x, y, size = 1, w = 120 }) => (
  <g data-qa="prop" data-qa-label="ベンチ" transform={`translate(${x},${y}) scale(${size})`}>
    <rect x={-w / 2} y={-34} width={w} height={14} rx={3} fill={C.paper2} {...line} {...ns} />
    <rect x={-w / 2} y={-11} width={w} height={5} rx={2} fill={C.floor} {...line} {...ns} />
    <path d={`M${-w / 2 + 8} -6 V5 M${w / 2 - 8} -6 V5 M${-w / 2 + 14} -20 V-11 M${w / 2 - 14} -20 V-11`} {...line} {...ns} />
  </g>
);
