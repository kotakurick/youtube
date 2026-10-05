// 猫の主人公（lib/Cat.tsx）のポーズと表情の一覧（確認用の静止画）
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cat, CatFace, CatPose } from "@lib/Cat";
import { Figure } from "@lib/Figure";
import { C, FONT } from "@lib/theme";

const POSES: CatPose[] = ["stand", "phone", "walk", "down"];
const FACES: CatFace[] = ["normal", "happy", "surprised", "think", "sad"];
const T: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) =>
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={700} fill={C.ink2}>{t}</text>;

export const CatPoses: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <svg width={1920} height={1080}>
      <text x={40} y={60} fontFamily={FONT} fontSize={36} fontWeight={900} fill={C.ink}>猫の主人公（案A）　ポーズと表情</text>
      {POSES.map((p, i) => (
        <g key={p}><Cat kind={i % 2 ? "female" : "male"} x={200 + i * 300} y={440} size={5} pose={p} phase={0.25} face={p === "down" ? "sad" : "normal"} seed={i * 7} /><T x={200 + i * 300} y={490} t={p} /></g>
      ))}
      <Cat kind="male" x={1400} y={440} size={5} facing={1} seed={3} />
      <Cat kind="female" x={1700} y={440} size={5} facing={-1} seed={9} />
      <T x={1550} y={490} t="向き合う（facing）" />
      {FACES.map((f, i) => (
        <g key={f}><Cat kind={i % 2 ? "female" : "male"} x={200 + i * 300} y={920} size={5} face={f} seed={i * 11} /><T x={200 + i * 300} y={970} t={f} /></g>
      ))}
      <Cat kind="other" x={1660} y={920} size={5} seed={5} />
      <Figure kind="male" x={1800} y={920} size={2} />
      <T x={1700} y={970} t="other／群衆の人型" />
    </svg>
  </AbsoluteFill>
);
