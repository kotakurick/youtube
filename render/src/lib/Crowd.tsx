// 群衆。1人ずつ「出発点 → 到着点」をばねの動きで移す。標準は100人（1人＝1%）。
import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Kind } from "./Figure";
import { overlaps, Pt } from "./layout";

export type Person = {
  kind: Kind;
  from: Pt;
  to?: Pt;          // 省略すると動かない
  delay?: number;   // 動き出すまでのフレーム
  dim?: boolean;    // 薄く（話の対象外）
  highlight?: boolean; // 追う1人（墨色の縁取り）
};

export const Crowd: React.FC<{
  people: Person[]; start?: number; size?: number; dimOpacity?: number;
  allowOverlap?: boolean; // わざと重ねる演出のときだけ true
}> = ({ people, start = 0, size = 1, dimOpacity = 0.25, allowOverlap = false }) => {
  // 出発点・到着点で人が重なっていないかを確かめる。重なっていれば止めて、どの2人かを知らせる。
  useMemo(() => {
    if (allowOverlap) return;
    for (const [name, pts] of [["出発点", people.map((p) => p.from)], ["到着点", people.map((p) => p.to ?? p.from)]] as const) {
      const hit = overlaps(pts, size);
      if (hit.length) {
        const [i, j] = hit[0];
        throw new Error(`Crowd: ${name}で ${hit.length} 組が重なっています（例：${i}番と${j}番）。layout.ts の scatter/grid/separate を使ってください。`);
      }
    }
  }, [people, size, allowOverlap]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {people.map((p, i) => {
        const t = p.to ? spring({ frame: frame - start - (p.delay ?? 0), fps, config: { damping: 18 } }) : 0;
        const to = p.to ?? p.from;
        return (
          <Figure key={i} kind={p.kind} size={size} highlight={p.highlight}
            x={p.from.x + (to.x - p.from.x) * t} y={p.from.y + (to.y - p.from.y) * t}
            opacity={p.dim ? dimOpacity : 1} />
        );
      })}
    </>
  );
};
