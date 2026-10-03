// 字幕。lines は [開始フレーム, 終了フレーム, 文] の並び。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";

export type Line = [number, number, string];

export const Subtitle: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const cur = lines.find(([a, b]) => frame >= a && frame < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", bottom: 44, left: 160, right: 160, textAlign: "center" }}>
      <span style={{
        fontFamily: FONT, fontSize: 50, fontWeight: 700, lineHeight: 1.45, color: C.white,
        background: "rgba(29,35,51,.9)", padding: "8px 26px", borderRadius: 12,
        boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
      }}>{cur[2]}</span>
    </div>
  );
};
