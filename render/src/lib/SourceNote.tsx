// 出典の表示（画面右上の決まった位置。字幕やグラフとぶつからない）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";

export const SourceNote: React.FC<{ text: string; start?: number }> = ({ text, start = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - start, [0, 10], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 36, right: 48, maxWidth: 760, textAlign: "right",
      fontFamily: FONT, fontSize: 24, color: C.ink, opacity: o }}>
      出典：{text}
    </div>
  );
};
