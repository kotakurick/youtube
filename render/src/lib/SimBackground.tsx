// シミュレーションの場面の背景（方眼）。実データの場面は無地の紙。出典の位置に SourceNote sim を合わせて出す。
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, LINE } from "./theme";

export const SimBackground: React.FC<{ step?: number }> = ({ step = 40 }) => {
  const { width, height } = useVideoConfig();
  return (
  <AbsoluteFill data-qa="bg" style={{ background: C.bg }}>
    <svg width={width} height={height}>
      <defs>
        <pattern id="sim-grid" width={step} height={step} patternUnits="userSpaceOnUse">
          <path d={`M${step} 0 H0 V${step}`} fill="none" stroke={C.paper2} strokeWidth={LINE.hair} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#sim-grid)" />
    </svg>
  </AbsoluteFill>
);
};
