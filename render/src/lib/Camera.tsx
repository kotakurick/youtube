// カメラ（寄り・引き・横移動）。中に置いたもの全体を動かす。止まった画面を減らす要。
// keys：[開始フレーム, ショット] を時刻順に。各ショットへ dur フレームかけて移る（曲線は EASE）。
// drift を付けると、その長さでゆっくり 1.00→1.04 倍に寄る（30秒近く続く場面用）。
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "./theme";

/** x,y＝画面の中心に来る点、scale＝倍率 */
export type Shot = { x: number; y: number; scale: number };

export const Camera: React.FC<{ keys?: [number, Shot][]; dur?: number; drift?: number; children: React.ReactNode }> = (
  { keys = [], dur = 24, drift, children },
) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const home: Shot = { x: width / 2, y: height / 2, scale: 1 };
  let cur = keys.length ? keys[0][1] : home;
  for (let i = 1; i < keys.length; i++) {
    const [f, to] = keys[i];
    if (frame < f) break;
    const t = interpolate(frame - f, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: EASE });
    cur = { x: cur.x + (to.x - cur.x) * t, y: cur.y + (to.y - cur.y) * t, scale: cur.scale + (to.scale - cur.scale) * t };
  }
  const d = drift ? interpolate(frame, [0, drift], [1, 1.04], { extrapolateRight: "clamp" }) : 1;
  const s = cur.scale * d;
  return (
    // 寄りの画面（1.05倍より大きい）では、絵が字幕の帯の下に入るのは当たり前なので、チェックで見逃す
    <AbsoluteFill data-qa-allow={s > 1.05 ? "sub" : undefined} style={{ transformOrigin: "0 0", transform: `translate(${width / 2}px,${height / 2}px) scale(${s}) translate(${-cur.x}px,${-cur.y}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
