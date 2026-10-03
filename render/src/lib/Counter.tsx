// 人数カウンター（「ペア成立：12組」のように、群衆の動きに合わせて数え上がる）。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE, font, T } from "./theme";

export const Counter: React.FC<{
  label: string; value: number; unit?: string; x: number; y: number; start?: number; duration?: number;
  role?: keyof typeof T; color?: string; align?: "left" | "center" | "right";
}> = ({ label, value, unit = "人", x, y, start = 0, duration = 45, role = "label", color = C.ink, align = "left" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  if (frame < start) return null;
  const tx = align === "left" ? "0" : align === "center" ? "-50%" : "-100%";
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${tx})`, ...font(role, color), whiteSpace: "nowrap" }}>
      {label ? `${label}：` : ""}{Math.round(value * p)}{unit}
    </div>
  );
};
