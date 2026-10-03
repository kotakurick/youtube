// 日ごとの再現：日めくり（「3日目」）と時計。perDay フレームで1日進み、そのたびに新しいページが上から重なる。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./Sfx";
import { C, font, LINE, R, sp } from "./theme";

export const DayReplay: React.FC<{ days: string[]; perDay: number; x: number; y: number; start?: number }> = (
  { days, perDay, x, y, start = 0 },
) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  if (frame < 0) return null;
  const i = Math.min(days.length - 1, Math.floor(frame / perDay));
  const inDay = frame - i * perDay;
  const drop = i === 0 ? 1 : sp("enter", inDay, fps);
  const hand = interpolate(Math.min(frame, days.length * perDay), [0, perDay], [0, 360]);
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: 260, height: 280 }}>
        {i > 0 && <Page text={days[i - 1]} />}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - drop) * -40}px)`, opacity: drop }}><Page text={days[i]} /></div>
      </div>
      <svg width={200} height={200} style={{ position: "absolute", left: x + 300, top: y + 40 }}>
        <circle cx={100} cy={100} r={84} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
        <line x1={100} y1={100} x2={100} y2={40} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" transform={`rotate(${hand} 100 100)`} />
        <line x1={100} y1={100} x2={100} y2={62} stroke={C.ink} strokeWidth={LINE.heavy - 4} strokeLinecap="round" transform={`rotate(${hand / 12} 100 100)`} />
        <circle cx={100} cy={100} r={8} fill={C.ink} />
      </svg>
      {days.map((_, k) => k > 0 && <Sfx key={k} name="flip" at={start + k * perDay} volume={0.4} />)}
    </>
  );
};

const Page: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", inset: 0, background: C.white, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.md, overflow: "hidden" }}>
    <div style={{ height: 56, background: C.ink }} />
    <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", ...font("value"), fontSize: 80 }}>{text}</div>
  </div>
);
