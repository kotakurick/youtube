// 字幕（常に焼き込み）。帯は幅を固定（文の長さで変わらない）、位置は SUB の区画。1枚は1行（横長は26字、縦長は16字）まで。
// 文字は48px（2026-10-07 54→48。オーナー「字幕をちょっと小さくしてもよい」。台本の文を字幕のために短く切らないため）。
// 2行にすると帯が上に伸びて絵にかかるので、長い文は tts/narrate.py が自動で区切る（手で書くときも1行にする）。
// lines は [開始フレーム, 終了フレーム, 文] の並び。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C, font, R, useZ } from "./theme";

export type Line = [number, number, string];
export const SUB_MAX = 26; // 横長の1行
const SUB_PX = 48; // 字幕の文字の大きさ（ほかの所の font("sub") は54のまま）
export const SUB_MAX_V = 16; // 縦長（ショート）の1行

export const Subtitle: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const Z = useZ();
  const max = Z.vertical ? SUB_MAX_V : SUB_MAX;
  for (const [, , t] of lines) {
    if (t.length > max) throw new Error(`Subtitle: 「${t}」が${t.length}字です。字幕は1行${max}字までに分けてください（tts/narrate.py は自動で分ける）。`);
  }
  const cur = lines.find(([a, b]) => frame >= a && frame < b);
  if (!cur) return null;
  return (
    <div data-qa="sub" data-qa-label="字幕" style={{
      position: "absolute", left: (Z.W - Z.sub.w) / 2, width: Z.sub.w, bottom: Z.H - (Z.sub.y + Z.sub.h),
      minHeight: Z.sub.h, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
      background: "rgba(29,35,51,.92)", borderRadius: R.md, padding: "6px 48px",
    }}>
      <div style={{ ...font("sub", C.white), fontSize: SUB_PX, lineHeight: 1.35, textAlign: "center", maxWidth: Math.min(SUB_MAX * SUB_PX + 4, Z.sub.w - 96) }}>{cur[2]}</div>
    </div>
  );
};
