// 群衆の並べ方。どれも決まった種で同じ配置になり、人どうしが重ならない。
// 重ならない仕組み：
//   - scatter は1人ずつ、候補の場所をいくつも出して「いちばん周りから離れた、誰とも重ならない場所」に置く（自然にばらける）。
//     置けなかったときは、場所を「1人分＋すきま」以上のマスに分けて1マスに1人ずつ置く方法に切り替える。
//   - grid は間隔が1人分＋すきまより狭いとエラーにする。
//   - Crowd.tsx は描く前に出発点と到着点を overlaps() で確かめ、重なっていればエラーで止める。
import { rng, shuffle } from "./random";
import type { Kind } from "./Figure";

export type Pt = { x: number; y: number };

/** 1人分の大きさ（size=1 のとき）。Figure.tsx の絵に合わせる：横 ±13（女性の裾）、縦は頭の上 -45 から足元 +5。 */
export const FOOT = { w: 26, top: 45, bottom: 5 };
/** 人と人のすきま（size=1 のとき） */
export const GAP = 8;

const footH = (size: number) => (FOOT.top + FOOT.bottom) * size;
const footW = (size: number) => FOOT.w * size;

/** n人を男女半々（先頭の others 人は「その他」）で作る */
export const kinds = (n: number, others = 0): Kind[] =>
  Array.from({ length: n }, (_, i) => (i < others ? "other" : (i - others) % 2 === 0 ? "male" : "female"));

/** 長方形の中に、重ならないように自然にばらまく */
export const scatter = (
  n: number, box: { x: number; y: number; w: number; h: number }, seed = 1, size = 1, gap = GAP,
): Pt[] => {
  const fw = footW(size) + gap * size, fh = footH(size) + gap * size;
  const r = rng(seed);
  // 足元の位置（Figure の原点）が取れる範囲
  const x0 = box.x + fw / 2, x1 = box.x + box.w - fw / 2;
  const y0 = box.y + (FOOT.top + gap / 2) * size, y1 = box.y + box.h - (FOOT.bottom + gap / 2) * size;
  if (x1 < x0 || y1 < y0) return scatterCells(n, box, seed, size, gap);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    let best: Pt | null = null, bestD = -1;
    // ふだんは60か所を試し、詰まってきたら（重ならない場所がない）最大600か所まで試す
    for (let k = 0; k < 600 && (k < 60 || bestD < 1); k++) {
      const c = { x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0) };
      // 周りとの近さ（1以上なら重ならない）。いちばん近い人との距離をマスの大きさで割ったもの
      let d = Infinity;
      for (const q of pts) d = Math.min(d, Math.max(Math.abs(c.x - q.x) / fw, Math.abs(c.y - q.y) / fh));
      if (d > bestD) { bestD = d; best = c; }
    }
    if (!best || bestD < 1) return scatterCells(n, box, seed, size, gap); // 置けなかった → マス方式へ
    pts.push(best);
  }
  return pts;
};

/** マスに分けて1マスに1人ずつ置く（必ず重ならない。scatter が置けないときの予備） */
export const scatterCells = (
  n: number, box: { x: number; y: number; w: number; h: number }, seed = 1, size = 1, gap = GAP,
): Pt[] => {
  const fw = footW(size) + gap * size, fh = footH(size) + gap * size;
  // マスの数を、1人分より小さくならない範囲で、ずらせる余白がいちばん大きくなるように選ぶ
  let best: { cols: number; rows: number; slack: number } | null = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cw = box.w / cols, ch = box.h / rows;
    if (cw < fw || ch < fh) continue;
    const slack = Math.min((cw - fw) / fw, (ch - fh) / fh);
    if (!best || slack > best.slack) best = { cols, rows, slack };
  }
  if (!best) throw new Error(`scatter: ${n}人が ${box.w}x${box.h} に入りません（size=${size}）。箱を広げるか size を小さくしてください。`);
  const { cols, rows } = best;
  const cw = box.w / cols, ch = box.h / rows;
  const r = rng(seed);
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i), seed + 1).slice(0, n);
  return cells.map((c) => {
    const col = c % cols, row = Math.floor(c / cols);
    return {
      x: box.x + col * cw + fw / 2 + r() * (cw - fw),
      y: box.y + row * ch + (FOOT.top + gap / 2) * size + r() * (ch - fh),
    };
  });
};

/** 格子に並べる（左上から行ごと）。間隔が狭すぎるとエラー。 */
export const grid = (n: number, o: { x: number; y: number; cols: number; dx: number; dy: number }, size = 1): Pt[] => {
  if (o.dx < footW(size) + GAP * size || o.dy < footH(size) + GAP * size) {
    throw new Error(`grid: 間隔 ${o.dx}x${o.dy} が1人分より狭いです（size=${size}）。`);
  }
  return Array.from({ length: n }, (_, i) => ({ x: o.x + (i % o.cols) * o.dx, y: o.y + Math.floor(i / o.cols) * o.dy }));
};

/** 100マス（看板のグラフ）：左下から行の順に埋める。x,bottom は左下の人の足元。
 *  群衆をここへ並び直す動きがチャンネルの決まり手。棒の代わりに積むときは cols を小さくする。 */
export const hundred = (
  n: number, o: { x: number; bottom: number; cols?: number; dx?: number; dy?: number }, size = 1,
): Pt[] => {
  const cols = o.cols ?? 10;
  const dx = o.dx ?? (footW(size) + GAP * size) * 1.15, dy = o.dy ?? (footH(size) + GAP * size);
  return grid(n, { x: o.x, y: 0, cols, dx, dy }, size).map((p) => ({ x: p.x, y: o.bottom - p.y }));
};

/** 重なっている組を返す（見つからなければ空） */
export const overlaps = (pts: Pt[], size = 1, gap = 2): [number, number][] => {
  const w = footW(size) + gap, h = footH(size) + gap;
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (Math.abs(pts[i].x - pts[j].x) < w && Math.abs(pts[i].y - pts[j].y) < h) out.push([i, j]);
    }
  }
  return out;
};

/** 好きな位置（シミュレーションの結果など）を、重ならないように少しずつ押し広げる */
export const separate = (pts: Pt[], size = 1, rounds = 200): Pt[] => {
  const p = pts.map((q) => ({ ...q }));
  const w = footW(size) + GAP * size, h = footH(size) + GAP * size;
  for (let k = 0; k < rounds; k++) {
    let moved = false;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[j].x - p[i].x, dy = p[j].y - p[i].y;
        const ox = w - Math.abs(dx), oy = h - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          moved = true;
          if (ox / w < oy / h) { const s = (dx >= 0 ? 1 : -1) * ox / 2; p[i].x -= s; p[j].x += s; }
          else { const s = (dy >= 0 ? 1 : -1) * oy / 2; p[i].y -= s; p[j].y += s; }
        }
      }
    }
    if (!moved) break;
  }
  return p;
};
