// シミュレーションのばらつき：同じ条件で種（seed）だけ変えて何回もやり直し、結果の幅を出す。
// 1回の結果を言い切らず、「100回やると、9割はこの幅に入る」と誤差棒で見せる（チャンネルの「誤差」の看板）。
export type Spread = { values: number[]; mean: number; lo: number; hi: number; level: number };

/** f(seed) を runs 回呼んで集める */
export const runMany = (runs: number, f: (seed: number) => number, seed0 = 1): number[] =>
  Array.from({ length: runs }, (_, i) => f(seed0 + i * 7919));

/** 値の並びから、平均と「真ん中の level の割合」が入る幅（標準は9割＝5%〜95%） */
export const spread = (values: number[], level = 0.9): Spread => {
  const v = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const i = (v.length - 1) * p, a = Math.floor(i), b = Math.ceil(i);
    return v[a] + (v[b] - v[a]) * (i - a);
  };
  return { values, mean: values.reduce((s, x) => s + x, 0) / values.length, lo: q((1 - level) / 2), hi: q(1 - (1 - level) / 2), level };
};

/** 2つの幅が重なるか（重なれば「条件次第」＝△、離れていれば言い切れる） */
export const rangesOverlap = (a: Spread, b: Spread) => a.lo <= b.hi && b.lo <= a.hi;
