// 案内役ゴサ。表情は assets/characters/gosa/svg（npm run sync で public/gosa に写る）。
// 表情が切り替わるたびに小さく弾む。登場はばねで下から。
import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type Expression =
  | "normal" | "surprised" | "assertive" | "thinking" | "skeptical" | "depends"
  | "happy" | "down" | "panic" | "idea" | "point";

/** cues: [開始フレーム, 表情] を時刻順に。最初の cue のフレームで登場する。 */
export const Gosa: React.FC<{
  cues: [number, Expression][]; x: number; y: number; width?: number; dark?: boolean; exit?: number;
  flip?: boolean; // 左右反転（左にあるものを指すとき）
}> = ({ cues, x, y, width = 300, dark = false, exit, flip = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!cues.length || frame < cues[0][0]) return null;
  let idx = 0;
  cues.forEach(([f], i) => { if (frame >= f) idx = i; });
  const [since, expr] = cues[idx];
  const enter = spring({ frame: frame - cues[0][0], fps, config: { damping: 12 } });
  const leave = exit === undefined ? 0 : spring({ frame: frame - exit, fps, config: { damping: 14 } });
  const pop = idx === 0 ? 0 : Math.sin(Math.min(1, (frame - since) / 8) * Math.PI) * 0.08;
  const breathe = Math.sin(frame / 18) * 0.015;
  return (
    <Img src={staticFile(`gosa/${expr}${dark ? "_dark" : ""}.svg`)} style={{
      position: "absolute", left: x - width / 2, top: y - width * 0.35, width,
      transform: `translateY(${(1 - enter + leave) * 400}px) scale(${(1 + pop + breathe) * (flip ? -1 : 1)}, ${1 + pop + breathe})`,
    }} />
  );
};
