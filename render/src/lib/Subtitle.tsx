// 字幕（常に焼き込み）。帯は幅を固定（文の長さで変わらない）、位置は SUB の区画。1行24字・2行まで。
// lines は [開始フレーム, 終了フレーム, 文] の並び。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C, font, R, useZ } from "./theme";

export type Line = [number, number, string];
export const SUB_MAX = 48; // 2行×24字

export const Subtitle: React.FC<{ lines: Line[] }> = ({ lines }) => {
  for (const [, , t] of lines) {
    if (t.length > SUB_MAX) throw new Error(`Subtitle: 「${t}」が${t.length}字です。1枚は${SUB_MAX}字（24字×2行）までに分けてください。`);
  }
  const frame = useCurrentFrame();
  const Z = useZ();
  const cur = lines.find(([a, b]) => frame >= a && frame < b);
  if (!cur) return null;
  return (
    <div data-qa="sub" data-qa-label="字幕" style={{
      position: "absolute", left: (Z.W - Z.sub.w) / 2, width: Z.sub.w, bottom: Z.H - (Z.sub.y + Z.sub.h),
      minHeight: Z.sub.h, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
      background: "rgba(29,35,51,.92)", borderRadius: R.md, padding: "6px 48px",
    }}>
      <div style={{ ...font("sub", C.white), lineHeight: 1.35, textAlign: "center", maxWidth: Math.min(24 * 54 + 4, Z.sub.w - 96) }}>{cur[2]}</div>
    </div>
  );
};
