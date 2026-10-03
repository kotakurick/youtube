// 問いの見出し（HEADER の区画、左寄せ、1行18字・2行まで）。冒頭と「今日の答え合わせ」のカードのときだけ出す。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { font, sp, useZ } from "./theme";

export const Question: React.FC<{ text: string; start?: number; exit?: number }> = ({ text, start = 0, exit }) => {
  if (text.length > 36) throw new Error(`Question: 「${text}」が${text.length}字です。36字（18字×2行）までにしてください。`);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Z = useZ();
  const t = sp("enter", frame - start, fps) - (exit === undefined ? 0 : sp("enter", frame - exit, fps));
  return (
    <div style={{ position: "absolute", top: Z.header.y, left: Z.header.x, width: Z.header.w, ...font("question"),
      lineHeight: 1.25, opacity: t, transform: `translateY(${(1 - t) * -24}px)` }}>
      {text}
    </div>
  );
};
