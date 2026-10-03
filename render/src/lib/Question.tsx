// 問いの見出し。上からすべり込む。
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

export const Question: React.FC<{ text: string; start?: number; size?: number }> = ({ text, start = 0, size = 66 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - start, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", top: 56, left: 90, right: 90, fontFamily: FONT, fontWeight: 900,
      fontSize: size, color: C.ink, opacity: t, transform: `translateY(${(1 - t) * -40}px)` }}>
      {text}
    </div>
  );
};
