// 条件の盤（2×2）：仮定を2つ動かしたとき、どちらが勝つかを4つのマスで見せる（2026-10-06。1本目 v3 の第3章で作った）。
// 「条件によって答えが変わる」回で使う（docs/script-style.md の深さの型）。マスの中は2本の横棒（a と b）で、勝った側の棒だけ意味の色、負けた側は rest。focus のマスの枠を墨で囲む。
//   rows / cols：行と列の見出し（例：保証あり／なし、基準がいまのまま／半分）
//   cells[行][列] = { a, b }：2つの値（例：紹介の町とアプリの町の組数）
//   reveal：マスが1つずつ出始めるフレーム。focus：強調するマス [行, 列]（focusAt から）
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, LINE, R, sp } from "./theme";

export type GridCell = { a: number; b: number };

export const ConditionGrid: React.FC<{
  x: number; y: number; w?: number; h?: number;
  rows: [string, string]; cols: [string, string]; rowTitle: string; colTitle: string;
  cells: [[GridCell, GridCell], [GridCell, GridCell]];
  aLabel: string; bLabel: string; aColor: string; bColor: string; unit?: string; max?: number;
  reveal?: number; every?: number; focus?: [number, number]; focusAt?: number;
}> = ({ x, y, w = 1400, h = 560, rows, cols, rowTitle, colTitle, cells, aLabel, bLabel, aColor, bColor, unit = "組", max, reveal = 0, every = 18, focus, focusAt = Infinity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = 320, top = 70; // 行の見出しの幅・列の見出しの高さ
  const cw = (w - head) / 2, ch = (h - top) / 2;
  const top_ = max ?? Math.max(...cells.flat().flatMap((c) => [c.a, c.b]));
  const barW = cw - 400;
  return (
    <div data-qa="mark" data-qa-label="条件の盤" style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", left: head, top: -64, width: w - head, textAlign: "center", ...font("label", C.ink2) }}>{colTitle}</div>
      <div style={{ position: "absolute", left: 0, top: -64, width: head - 20, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{rowTitle}</div>
      {cols.map((c, j) => (
        <div key={c} style={{ position: "absolute", left: head + j * cw, top: 0, width: cw, textAlign: "center", ...font("label") }}>{c}</div>
      ))}
      {rows.map((r, i) => (
        <div key={r} style={{ position: "absolute", left: 0, top: top + i * ch + ch / 2 - 26, width: head - 20, ...font("label"), whiteSpace: "pre" }}>{r}</div>
      ))}
      {cells.map((row, i) => row.map((cell, j) => {
        const t = sp("enter", frame - reveal - (i * 2 + j) * every, fps);
        const aWin = cell.a > cell.b;
        const on = focus && focus[0] === i && focus[1] === j && frame >= focusAt;
        const bar = (v: number, label: string, color: string, win: boolean, k: number) => (
          <div style={{ position: "absolute", left: 24, top: 36 + k * 76, display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
            <div style={{ width: 210, ...font("label", win ? C.ink : C.ink2) }}>{label}</div>
            <div style={{ width: barW * (v / top_) * t, height: 40, borderRadius: R.sm, background: win ? color : C.rest }} />
            <div style={{ ...font("label", win ? C.ink : C.ink2), fontWeight: win ? 900 : 700 }}>{v}{unit}</div>
          </div>
        );
        return (
          <div key={`${i}${j}`} style={{ position: "absolute", left: head + j * cw + 8, top: top + i * ch + 8, width: cw - 16, height: ch - 16, opacity: t,
            background: C.white, borderRadius: R.md, boxSizing: "border-box", border: `${on ? LINE.heavy : LINE.thin}px solid ${on ? C.ink : C.rest}` }}>
            {bar(cell.a, aLabel, aColor, aWin, 0)}
            {bar(cell.b, bLabel, bColor, !aWin, 1)}
          </div>
        );
      }))}
    </div>
  );
};
