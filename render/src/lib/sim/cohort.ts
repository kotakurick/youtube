// 年齢ごとの割合で1年ずつ進める（「25歳で始めた100人」と「35歳で始めた100人」の、その後10年など）。
// rateAt(年齢) は、その年齢の1年のうちに起きる割合（例：年齢別の初婚率）。一次資料の値を入れる。
import { rng } from "../random";

/** n人を startAge から years 年進め、起きた年（0始まり）を返す。起きなければ null */
export const cohort = (n: number, startAge: number, years: number, rateAt: (age: number) => number, seed = 1): (number | null)[] => {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    for (let y = 0; y < years; y++) if (r() < rateAt(startAge + y)) return y;
    return null;
  });
};

/** y 年目までに起きた人数 */
export const doneBy = (events: (number | null)[], y: number) => events.filter((e) => e !== null && e <= y).length;
