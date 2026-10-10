// スピードデートの部屋（2026-10-10、8本目「人を好きになる」の場面のコードで作った）。
// 小さなテーブルをはさんで猫が向かい合う。砂時計が落ちきるたびに、右の列の猫が1つ横のテーブルへずれる（相手を替える）。
// 決まり：
//   - 猫は紫 plain（男女の回でない回）。左の列は動かず、右の列だけが動く。端の1匹は消えて、最初のテーブルに新しく現れる（opacity は出入りのときだけ）。
//   - 砂時計は round フレームで1回落ちきる。動かさないときは still。砂は灰（金などの意味の色を使わない）。
//   - テーブル・砂時計に data-qa="prop" の印。猫には Cat が figure の印を付ける。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cat } from "./Cat";
import { C, LINE, sp } from "./theme";

export const SpeedDateRoom: React.FC<{
  pairs?: number; x?: number; y?: number; gap?: number; size?: number;
  round?: number;          // 1回の会話の長さ（フレーム。画面の上の時間。4分を縮めて見せる）
  still?: boolean;         // 動かさない（絵コンテ・静止画）
  hourglass?: { x: number; y: number } | false;
}> = ({ pairs = 4, x = 260, y = 640, gap = 330, size = 2.4, round = 150, still = false, hourglass = { x: 1640, y: 520 } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = still ? 0 : Math.floor(frame / round);              // 何回替わったか
  const local = still ? round : frame - k * round;               // この回の中のフレーム
  const sand = still ? 0.5 : Math.min(1, local / (round - 20));  // 砂の落ちた割合
  const move = still || k === 0 ? 1 : sp("move", local, fps);    // 替わるときのずれ（0→1）
  const right = (i: number) => x + i * gap + 105;
  return (
    <g>
      {Array.from({ length: pairs }, (_, i) => {
        const tx = x + i * gap;
        return (
          <g key={i}>
            <rect data-qa="prop" data-qa-label="テーブル" x={tx - 60} y={y - 70} width={120} height={14} rx={4} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
            <Cat kind="plain" x={tx - 105} y={y} size={size} pose="sit" face="normal" turn={0.6} label={`左${i}`} seed={i} />
          </g>
        );
      })}
      {Array.from({ length: pairs }, (_, j) => {
        // 右の列の j 番目の猫（相手）。k 回替わったあとは (j + k) 番目のテーブルにいる
        const at = j + k, prev = at - 1;
        const table = at % pairs, from = prev % pairs;
        const wrap = k > 0 && table === 0;                         // 端から最初のテーブルへ：消えて現れる
        const cx = wrap || k === 0 ? right(table) : right(from) + (right(table) - right(from)) * move;
        const op = wrap ? Math.min(1, move) : 1;
        return (
          <g key={`r${j}`} opacity={op} data-qa-skip={move < 0.98 ? "" : undefined}>
            <Cat kind="plain" x={cx} y={y} size={size} pose="sit" face={j % 2 ? "smile" : "normal"} turn={-0.6} label={`右${j}`} seed={j + 5} />
          </g>
        );
      })}
      {hourglass && (
        <g data-qa="prop" data-qa-label="砂時計" transform={`translate(${hourglass.x},${hourglass.y})`}>
          <path d="M-40,-60 h80 l-40,60 l40,60 h-80 l40,-60 Z" fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          {/* 上の砂（減る）と下の砂（増える） */}
          <path d={`M${-34 * (1 - sand)},${-54 + 54 * sand} h${68 * (1 - sand)} L0,-4 Z`} fill={C.rest} />
          <path d={`M${-34 * sand},54 h${68 * sand} L0,${54 - 50 * sand} Z`} fill={C.rest} />
        </g>
      )}
    </g>
  );
};
