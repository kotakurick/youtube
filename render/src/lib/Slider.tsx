// 「もしも」の条件のつまみ。目盛り（stops）の上をつまみが動き、いまの条件を大きく出す。
// 3本目「普通の相手」では、相談所の検索画面の「年収のつまみ」（比喩：目盛り）にも使う。線とつまみに data-qa="mark"（2026-10-07）。
// keys：[フレーム, 目盛りの番号]。群衆の組み直しは場面の側で、同じフレームに合わせて Crowd を動かす。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, LINE, sp } from "./theme";

export const Slider: React.FC<{ label: string; stops: string[]; keys: [number, number][]; x: number; y: number; w: number }> = (
  { label, stops, keys, x, y, w },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const X = (i: number) => x + (stops.length === 1 ? 0 : (i / (stops.length - 1)) * w);
  let pos = keys.length ? keys[0][1] : 0;
  for (let k = 1; k < keys.length; k++) {
    const [f, to] = keys[k];
    if (frame < f) break;
    pos = pos + (to - pos) * sp("enter", frame - f, fps);
  }
  const cur = Math.round(pos);
  return (
    <svg width={x + w + 200} height={y + 160} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <text x={x} y={y - 70} style={font("label", C.ink2)}>{label}</text>
      <text x={x + w} y={y - 64} textAnchor="end" style={font("value")}>{stops[cur]}</text>
      {/* 線はひげ（誤差棒）と同じ形 */}
      <g data-qa="mark" data-qa-label="つまみの線" stroke={C.ink} strokeLinecap="round">
        <line x1={x} x2={x + w} y1={y} y2={y} strokeWidth={LINE.base} />
        <line x1={x} x2={x} y1={y - 14} y2={y + 14} strokeWidth={LINE.base} />
        <line x1={x + w} x2={x + w} y1={y - 14} y2={y + 14} strokeWidth={LINE.base} />
      </g>
      {stops.map((s, i) => (
        <text key={s} x={X(i)} y={y + 60} textAnchor="middle" style={font("label", i === cur ? C.ink : C.ink2)}>{s}</text>
      ))}
      <circle data-qa="mark" data-qa-label="つまみ" cx={X(pos)} cy={y} r={24} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
    </svg>
  );
};
