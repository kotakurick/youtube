// 条件を1つずつ重ねて、100人のうち何人が残るか（「普通の相手」の条件など）。
// 条件ごとに「満たす人の割合」（share）を一次資料から入れる。条件どうしの重なり方（相関）は rho で変えられる：
//   rho = 0 … 条件は独立（年収と身長は関係ない、と仮定）。重ねるほど急に減る
//   rho > 0 … 条件が同じ人に集まりやすい（年収と学歴など）。独立のときより多く残る
// 仮定（独立か、rho をいくつにしたか）は必ず画面に出す。
import { rng } from "../random";

export type Condition = { label: string; share: number };
export type FilterStep = { label: string; pass: boolean[]; left: number };

/** 標準正規分布の分位点（Acklam の近似） */
const qnorm = (p: number) => {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const q = p < 0.02425 ? Math.sqrt(-2 * Math.log(p)) : p > 1 - 0.02425 ? Math.sqrt(-2 * Math.log(1 - p)) : 0;
  if (p < 0.02425) return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  if (p > 1 - 0.02425) return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  const r = p - 0.5, s = r * r;
  return (((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
};

/** n人に条件を順に重ねる。各段階で「ここまでの条件を全部満たす人」が pass */
export const filterPeople = (n: number, conds: Condition[], opts: { rho?: number; seed?: number } = {}): FilterStep[] => {
  const rho = opts.rho ?? 0;
  const r = rng(opts.seed ?? 1);
  const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const common = Array.from({ length: n }, normal); // 人ごとの共通の要素（相関の元）
  let alive = Array.from({ length: n }, () => true);
  return conds.map((c) => {
    const cut = qnorm(1 - c.share);
    alive = alive.map((ok, i) => ok && Math.sqrt(rho) * common[i] + Math.sqrt(1 - rho) * normal() >= cut);
    return { label: c.label, pass: [...alive], left: alive.filter(Boolean).length };
  });
};
