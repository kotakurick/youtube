// 群衆の並べ方。どれも決まった種で同じ配置になる。
import { rng } from "./random";
import type { Kind } from "./Figure";

export type Pt = { x: number; y: number };

/** n人を男女半々（余りは other）で作る */
export const kinds = (n: number, others = 0): Kind[] =>
  Array.from({ length: n }, (_, i) => (i < others ? "other" : (i - others) % 2 === 0 ? "male" : "female"));

/** 長方形の中にばらまく */
export const scatter = (n: number, box: { x: number; y: number; w: number; h: number }, seed = 1): Pt[] => {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: box.x + r() * box.w, y: box.y + r() * box.h }));
};

/** 格子に並べる（左上から行ごと） */
export const grid = (n: number, o: { x: number; y: number; cols: number; dx: number; dy: number }): Pt[] =>
  Array.from({ length: n }, (_, i) => ({ x: o.x + (i % o.cols) * o.dx, y: o.y + Math.floor(i / o.cols) * o.dy }));
