import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const r = rng(3);
const P = Array.from({ length: 1000 }, (_, i) => ({ m: i % 2 === 0, x: 60 + r() * 1800, y: 80 + r() * 900, tx: 60 + (i % 50) * 36, ty: 120 + Math.floor(i / 50) * 44, d: r() * 60 }));
export const Crowd: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (<AbsoluteFill style={{ background: "#F5F2EA" }}><svg width={1920} height={1080}>
    {P.map((p, i) => { const t = spring({ frame: f - p.d, fps, config: { damping: 16 } }); const x = p.x + (p.tx - p.x) * t, y = p.y + (p.ty - p.y) * t;
      return (<g key={i} transform={`translate(${x},${y}) scale(.6)`} fill={p.m ? "#2F6FDE" : "#D9541E"}><circle cy={-36} r={9} /><rect x={-10} y={-25} width={20} height={30} rx={8} /></g>); })}
  </svg></AbsoluteFill>);
};
