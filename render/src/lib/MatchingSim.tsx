// マッチングのシミュレーションの描画。計算は sim/matching.ts（純粋な関数）で、ここは結果を群衆の動きにするだけ。
// 1回ごとに、ペアになった人が右の「ペア」の場所へ並び直し、相手のいない人は左に残る。乗り換えで外れた人は左へ戻る。
// MatchingCompare は「現実」と「もしも」を左右に並べ、同じ人たちで結果を比べる。
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Crowd, Person } from "./Crowd";
import { FOOT, GAP, Pt, scatter } from "./layout";
import type { MatchResult } from "./sim/matching";
import { C, EASE, font, R } from "./theme";

type Box = { x: number; y: number; w: number; h: number };

/** 各回の位置（0回目＝全員が左） */
const usePositions = (res: MatchResult, singles: Box, pairs: Box, size: number, seed: number) => useMemo(() => {
  const home = scatter(res.agents.length, singles, seed, size);
  // ペアの場所：受けた側1人に1つ（初めてペアになった順）。2人を少し離して並べる
  const off = (FOOT.w * size + 4) / 2;
  const slotW = 2 * off + FOOT.w * size + GAP * size * 2, slotH = (FOOT.top + FOOT.bottom + GAP) * size * 1.1;
  const cols = Math.max(1, Math.floor(pairs.w / slotW)), rows = Math.max(1, Math.floor(pairs.h / slotH));
  const order: number[] = [];
  for (const r of res.rounds) for (const [, q] of r.pairs) if (!order.includes(q)) order.push(q);
  if (order.length > cols * rows) {
    throw new Error(`MatchingSim: ペアの場所が足りません（${order.length}組に対して ${cols * rows} か所）。pairs の箱を広げるか size を小さくしてください。`);
  }
  const slot = (q: number): Pt => {
    const k = order.indexOf(q);
    return { x: pairs.x + slotW / 2 + (k % cols) * slotW, y: pairs.y + (FOOT.top + GAP / 2) * size + Math.floor(k / cols) * slotH };
  };
  const states: Pt[][] = [home];
  for (const r of res.rounds) {
    const pos = [...home];
    for (const [p, q] of r.pairs) { const s = slot(q); pos[p] = { x: s.x - off, y: s.y }; pos[q] = { x: s.x + off, y: s.y }; }
    states.push(pos);
  }
  return states;
}, [res, singles.x, singles.y, singles.w, singles.h, pairs.x, pairs.y, pairs.w, pairs.h, size, seed]);

export const MatchingSim: React.FC<{
  result: MatchResult; box: Box; start?: number; framesPerRound?: number; size?: number; seed?: number;
  highlight?: { id: number; label: string }; title?: string; compact?: boolean;
}> = ({ result, box, start = 0, framesPerRound = 45, size = 1, seed = 5, highlight, title, compact = false }) => {
  const frame = useCurrentFrame() - start;
  const head = compact ? 120 : 150; // 上に「○回目」、その下に「残り／ペア」の数
  const singles = { x: box.x, y: box.y + head, w: box.w * 0.52, h: box.h - head };
  const pairs = { x: box.x + box.w * 0.56, y: box.y + head, w: box.w * 0.44, h: box.h - head };
  const states = usePositions(result, singles, pairs, size, seed);
  const R_ = result.rounds.length;
  const k = Math.max(1, Math.min(R_, Math.floor(frame / framesPerRound) + 1)); // いま動いている回（1〜R）
  const roundStart = start + (k - 1) * framesPerRound;
  const people: Person[] = useMemo(() => result.agents.map((a) => ({
    kind: a.kind, from: states[k - 1][a.id], to: states[k][a.id], delay: Math.round((a.id % 40) * 0.35),
    highlight: highlight?.id === a.id, label: highlight?.id === a.id ? highlight.label : undefined,
  })), [result, states, k, highlight]);
  // 数字は回の切り替わりから数える
  const t = interpolate(frame - (k - 1) * framesPerRound, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const prevPairs = k > 1 ? result.rounds[k - 2].pairs.length : 0, curPairs = result.rounds[k - 1].pairs.length;
  const pairsNow = Math.round(prevPairs + (curPairs - prevPairs) * t);
  const singlesNow = result.agents.length - pairsNow * 2;
  const role = compact ? "label" : "value";
  return (
    <>
      <div style={{ position: "absolute", left: box.x, top: box.y, display: "flex", gap: 24, alignItems: "baseline", whiteSpace: "nowrap" }}>
        {title && <span style={{ ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "2px 14px" }}>{title}</span>}
        <span style={font(role)}>{k}回目</span>
      </div>
      <div style={{ position: "absolute", left: singles.x, top: box.y + head - 50, ...font("label", C.ink2) }}>残り {singlesNow}人</div>
      <div style={{ position: "absolute", left: pairs.x, top: box.y + head - 50, ...font("label") }}>ペア {pairsNow}組</div>
      <svg width={box.x + box.w + 40} height={box.y + box.h + 40} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <Crowd people={people} start={roundStart} size={size} />
      </svg>
    </>
  );
};

/** 「現実」と「もしも」を左右に並べる（同じ人たちで比べる） */
export const MatchingCompare: React.FC<{
  left: { title: string; result: MatchResult }; right: { title: string; result: MatchResult };
  box: Box; start?: number; framesPerRound?: number; size?: number;
}> = ({ left, right, box, start = 0, framesPerRound = 45, size = 0.85 }) => {
  const gap = 60, w = (box.w - gap) / 2;
  const end = start + Math.max(left.result.rounds.length, right.result.rounds.length) * framesPerRound;
  const frame = useCurrentFrame();
  const done = interpolate(frame - end, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const share = (r: MatchResult) => Math.round(((r.final.pairs.length * 2) / r.agents.length) * 100);
  return (
    <>
      <MatchingSim result={left.result} box={{ x: box.x, y: box.y, w, h: box.h }} start={start} framesPerRound={framesPerRound} size={size} title={left.title} compact />
      <MatchingSim result={right.result} box={{ x: box.x + w + gap, y: box.y, w, h: box.h }} start={start} framesPerRound={framesPerRound} size={size} title={right.title} compact />
      <div style={{ position: "absolute", left: box.x + w + gap / 2 - 2, top: box.y, width: 4, height: box.h, background: C.paper2 }} />
      {[left, right].map((s, i) => (
        <div key={i} style={{ position: "absolute", left: box.x + i * (w + gap) + w * 0.56, top: box.y + box.h - 170, opacity: done, ...font("value") }}>
          <span style={{ background: `linear-gradient(transparent 62%, ${C.marker} 62%)` }}>{share(s.result)}%</span>
          <span style={{ ...font("label", C.ink2), marginLeft: 12 }}>がペアに</span>
        </div>
      ))}
    </>
  );
};
