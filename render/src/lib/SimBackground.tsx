// シミュレーションの場面の背景（方眼）。実データの場面は無地の紙。出典の位置に SourceNote sim を合わせて出す。
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, LINE } from "./theme";

export const SimBackground: React.FC<{ step?: number }> = ({ step = 40 }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <svg width={1920} height={1080}>
      <defs>
        <pattern id="sim-grid" width={step} height={step} patternUnits="userSpaceOnUse">
          <path d={`M${step} 0 H0 V${step}`} fill="none" stroke={C.paper2} strokeWidth={LINE.hair} />
        </pattern>
      </defs>
      <rect width={1920} height={1080} fill="url(#sim-grid)" />
    </svg>
  </AbsoluteFill>
);
