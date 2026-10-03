// 主役の数字（200px）。ナレーションが言う数字だけを数え上げる。単位は半分の大きさで下をそろえる。
// 数え終わると 1.06→1 倍に戻り、下に蛍光ペンが引かれる。細かい値（detail）は小さく下に出す。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE, font, T } from "./theme";

export const HeroNumber: React.FC<{
  value: number; unit?: string; prefix?: string; from?: number; x: number; y: number; // x,y は数字の左下（ベースライン）
  start?: number; duration?: number; decimals?: number; detail?: string; color?: string;
}> = ({ value, unit = "", prefix = "", from = 0, x, y, start = 0, duration = 40, decimals = 0, detail, color = C.ink }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const done = interpolate(frame - start - duration, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < start) return null;
  const v = (from + (value - from) * p).toFixed(decimals);
  const [size] = T.hero;
  const w = (prefix.length * size + v.length * size * 0.6 + unit.length * size * 0.5);
  const pop = 1 + 0.06 * Math.sin(done * Math.PI);
  return (
    <div style={{ position: "absolute", left: x, top: y - size, transformOrigin: "left bottom", transform: `scale(${pop})`, opacity: Math.min(1, p * 4) }}>
      <div style={{ position: "absolute", left: 0, top: size * 0.82, height: size * 0.16, width: w * done, background: C.marker, borderRadius: 6 }} />
      <div style={{ position: "relative", ...font("hero", color), lineHeight: 1, whiteSpace: "nowrap" }}>
        {prefix && <span style={{ fontSize: size / 2 }}>{prefix}</span>}{v}<span style={{ fontSize: size / 2 }}>{unit}</span>
      </div>
      {detail && <div style={{ ...font("note", C.ink2), marginTop: 18 }}>{detail}</div>}
    </div>
  );
};
