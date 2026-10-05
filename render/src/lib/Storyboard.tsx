// 絵コンテ（音声・動画にする前に、場面ごとの見た目を静止画で決める。2026-10-05 の決定）。
// 各回の episodes/<回>/scenes/Storyboard.tsx が StoryboardDef を export default する。Root が次を登録する：
//   - <回>-sb-<key>：場面1枚ずつ（1920×1080。最後のコマ＝動きが終わった姿を絵コンテに使う）
//   - <回>-storyboard：場面の画像を4列に並べた一覧（オーナーに見せる用）
// 書き出し：cd render && npm run storyboard -- <回>（場面を1枚ずつ書き出して画面のチェックもしてから、一覧を作る）
// 一覧は場面の画像（public/sb/<回>/<key>.png）を並べるだけ。部品は画面の大きさ（1920×1080）を前提に置き場所を
// 決めるので、一覧の中で直接描くと位置がずれる。
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, font } from "./theme";

export type Panel = { key: string; title: string; note?: string; C: React.FC };
export type StoryboardDef = { id: string; title: string; panels: Panel[] };
export const SB_FRAMES = 240;          // 1枚の場面の長さ（この最後のコマを絵コンテに使う）
export const SB_COLS = 4;
const CELL_W = 1920 / SB_COLS, CELL_H = CELL_W * 9 / 16, CAP = 96;
export const sheetSize = (n: number) => ({ w: 1920, h: 120 + Math.ceil(n / SB_COLS) * (CELL_H + CAP) });
export const sbImage = (id: string, key: string) => `sb/${id}/${key}.png`;

const Cell: React.FC<{ id: string; p: Panel; i: number }> = ({ id, p, i }) => {
  const x = (i % SB_COLS) * CELL_W, y = 120 + Math.floor(i / SB_COLS) * (CELL_H + CAP);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CELL_W, height: CELL_H + CAP }}>
      <Img src={staticFile(sbImage(id, p.key))} style={{ position: "absolute", left: 6, top: 6, width: CELL_W - 12, height: (CELL_W - 12) * 9 / 16,
        outline: `3px solid ${C.ink2}`, background: C.bg }} />
      <div style={{ position: "absolute", left: 10, top: CELL_H + 4, right: 10, ...font("note"), fontWeight: 700, lineHeight: 1.25 }}>
        {String(i + 1).padStart(2, "0")} {p.title}
      </div>
    </div>
  );
};

export const StoryboardSheet: React.FC<{ def: StoryboardDef }> = ({ def }) => (
  <AbsoluteFill style={{ background: C.paper2 }}>
    <div style={{ position: "absolute", left: 24, top: 28, ...font("question") }}>{def.title}　絵コンテ</div>
    {def.panels.map((p, i) => <Cell key={p.key} id={def.id} p={p} i={i} />)}
  </AbsoluteFill>
);
