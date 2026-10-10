// 猫の群衆（男女の回でない回の群衆。2026-10-10、8本目「人を好きになる」の場面のコードで作った）。
// 人型の Crowd と同じく、1匹ずつ「出発点 → 到着点」をばね（SPRING.move）で移す（群衆が並び直す）。
// 決まり：
//   - 猫は紫 plain（男女の回でない回。docs/brand.md「物語の主人公」）。意味の色で分けるときは color で胴の色だけ替える。
//   - 出てくる順は delay（フレーム）。出るときは「enter」のばねで下から少し上がる（opacity は出入りのときだけ）。
//   - 追う1匹は ring（墨の輪）。番号で呼ばない。輪は at（フレーム）から描かれる。
//   - 輪は絵の飾りなので data-qa の印を付けない。猫には Cat が figure の印を付ける。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cat, CatFace, CatKind, CatPose } from "./Cat";
import { ramp } from "./Motion";
import type { Pt } from "./layout";
import { C, LINE, sp } from "./theme";

export type CatMember = {
  from: Pt;
  to?: Pt;            // 省略すると動かない
  delay?: number;     // 出てくる（動き出す）までのフレーム
  face?: CatFace;
  pose?: CatPose;
  turn?: number;
  color?: string;
  label?: string;
};

/** 横に並ぶ席の座標（cols 列 × 必要な段。stagger で段ごとに横へずらす） */
export const catGrid = (n: number, o: { x: number; y: number; cols: number; dx: number; dy: number; stagger?: number }): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const c = i % o.cols, r = Math.floor(i / o.cols);
    return { x: o.x + c * o.dx + (r % 2) * (o.stagger ?? 0), y: o.y + r * o.dy };
  });

export const CatCrowd: React.FC<{
  cats: CatMember[];
  size?: number;
  kind?: CatKind;
  enter?: boolean;                  // true なら delay の時刻に1匹ずつ現れる（false なら最初からいる）
  ring?: { index: number; at?: number; r?: number }; // 追う1匹の墨の輪
}> = ({ cats, size = 2, kind = "plain", enter = false, ring }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <g>
      {cats.map((m, i) => {
        const d = m.delay ?? 0;
        if (enter && frame < d) return null;
        const e = enter ? sp("enter", frame - d, fps) : 1;
        const t = m.to ? sp("move", frame - d, fps) : 0;
        const to = m.to ?? m.from;
        const x = m.from.x + (to.x - m.from.x) * t, y = m.from.y + (to.y - m.from.y) * t + (1 - e) * 24;
        const moving = (m.to !== undefined && t > 0.001 && t < 0.98) || e < 0.98;
        return (
          <g key={i} opacity={e} data-qa-skip={moving ? "" : undefined}>
            <Cat kind={kind} x={x} y={y} size={size} pose={m.pose ?? "stand"} face={m.face ?? "normal"} turn={m.turn}
              color={m.color} label={m.label ?? `群衆${i}`} seed={i} />
          </g>
        );
      })}
      {ring && cats[ring.index] && (() => {
        const m = cats[ring.index], p = m.to ?? m.from;
        const k = ramp(frame, ring.at ?? 0, 18);
        if (k <= 0) return null;
        const r = ring.r ?? 40 * size, cy = p.y - 25 * size;
        const len = 2 * Math.PI * r;
        return <circle cx={p.x} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={LINE.heavy}
          strokeDasharray={len} strokeDashoffset={len * (1 - k)} transform={`rotate(-90 ${p.x} ${cy})`} />;
      })()}
    </g>
  );
};
