// 終了画面（20秒、ナレーションなし、BGMだけ）。左に教訓の1行とゴサ、右に YouTube の終了画面の要素（次の1本・再生リスト）を置く枠。
// 枠は YouTube Studio で要素を重ねる場所の目印で、要素が上に乗るので見えなくなる。黒い画面にはしない。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { C, font, LINE, R, sp } from "./theme";

export const END_FRAMES = 600; // 20秒

export const EndScreen: React.FC<{ lesson: string }> = ({ lesson }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  const slot = (y: number, label: string) => (
    <div style={{ position: "absolute", left: 1080, top: y, width: 704, height: 396, boxSizing: "border-box", border: `${LINE.thin}px dashed ${C.rest}`,
      borderRadius: R.md, display: "flex", alignItems: "center", justifyContent: "center", ...font("label", C.rest) }}>{label}</div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 96, top: 200, width: 900, ...font("question"), lineHeight: 1.35, whiteSpace: "pre-line", opacity: t }}>{lesson}</div>
      {slot(120, "次の1本")}
      {slot(560, "再生リスト")}
      <Gosa cues={[[10, "happy"]]} size="M" x={420} foot={880} sfx={false} />
    </>
  );
};
