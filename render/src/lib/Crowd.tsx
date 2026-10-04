// 群衆。1人ずつ「出発点 → 到着点」をばね（SPRING.move）で移す。標準は100人（1人＝1%）。
import React, { useMemo } from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Age, Figure, Kind, kindColor, Pose } from "./Figure";
import { overlaps, Pt } from "./layout";
import { CROWD_SIZE, sp } from "./theme";

export type Person = {
  kind: Kind;
  from: Pt;
  to?: Pt;          // 省略すると動かない
  delay?: number;   // 動き出すまでのフレーム
  dim?: boolean | number; // 話の対象外：true ならずっと薄い色、数字ならそのフレームから薄い色に変わる
  highlight?: boolean;    // 追う1人（主人公。番号で呼ばない）
  label?: string;         // 追う1人の名札
  pose?: Pose | [number, Pose][]; // 姿勢。[フレーム, 姿勢] の並びなら、その時刻に姿勢が変わる（主人公が座る・スマホを見る など）
  facing?: -1 | 0 | 1;
  age?: Age;
};

/** いまの姿勢（[フレーム, 姿勢] の並びなら時刻で選ぶ） */
const poseAt = (pose: Person["pose"], frame: number): Pose => {
  if (!pose) return "stand";
  if (typeof pose === "string") return pose;
  let cur: Pose = "stand";
  for (const [f, p] of pose) if (frame >= f) cur = p;
  return cur;
};

export const Crowd: React.FC<{
  people: Person[]; start?: number; size?: number;
  allowOverlap?: boolean; // わざと重ねる演出のときだけ true
}> = ({ people, start = 0, size = CROWD_SIZE, allowOverlap = false }) => {
  // 出発点・到着点で人が重なっていないかを確かめる。重なっていれば止めて、どの2人かを知らせる。
  useMemo(() => {
    if (allowOverlap) return;
    for (const [name, pts] of [["出発点", people.map((p) => p.from)], ["到着点", people.map((p) => p.to ?? p.from)]] as const) {
      const hit = overlaps(pts, size);
      if (hit.length) {
        const [i, j] = hit[0];
        throw new Error(`Crowd: ${name}で ${hit.length} 組が重なっています（例：${i}番と${j}番）。layout.ts の scatter/grid/hundred/separate を使ってください。`);
      }
    }
  }, [people, size, allowOverlap]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {/* 追う1人は最後に描いて、いちばん手前に出す */}
      {people.map((p, i) => [p, i] as const).sort((a, b) => Number(!!a[0].highlight) - Number(!!b[0].highlight)).map(([p, i]) => {
        const t = p.to ? sp("move", frame - start - (p.delay ?? 0), fps) : 0;
        const to = p.to ?? p.from;
        const color = typeof p.dim === "number"
          ? interpolateColors(frame - start, [p.dim, p.dim + 10], [kindColor(p.kind), kindColor(p.kind, true)])
          : kindColor(p.kind, p.dim === true);
        const moving = p.to !== undefined && t > 0.001 && t < 0.98;
        return (
          <g key={i} data-qa-skip={moving ? "" : undefined}>
          <Figure kind={p.kind} size={size} highlight={p.highlight} label={p.label} color={color}
            pose={poseAt(p.pose, frame - start)} facing={p.facing} age={p.age} phase={((frame + i * 7) % 20) / 20}
            x={p.from.x + (to.x - p.from.x) * t} y={p.from.y + (to.y - p.from.y) * t} />
          </g>
        );
      })}
    </>
  );
};
