// 「紹介の町」と「アプリの町」のシミュレーション（計算だけ。描画は TownsSim.tsx）。1本目 v2 の第1〜3章で使う。
// 同じ100人を2つの町に住ませ、12か月でペアが何組できるかを数える。同じ種なら毎回同じ結果になる（純粋な関数）。
// 画面には「シミュレーション：仮定の世界」と出す。仮定の根拠は episodes/001-where-couples-meet/research-mechanism.md。
//
// 共通：100人（男女50人ずつ）。1人ずつ「魅力の点数」（平均0・ばらつき1）を持つ。相手の点数は人ごとに少しずれて見える。
//   10人ずつの「知り合いの輪」（友人・職場）に分かれ、輪は隣の輪とだけつながる（共通の友人）。
//
// 紹介の町（intro）：
//   - 毎月、輪ごとに世話役が、相手のいない男性1人に、輪の中か隣の輪の女性を「この人いいよ」と引き合わせる（点数の近い人を選ぶ）。
//   - 引き合わせには保証があるので、見え方のずれが小さく（vouchNoise）、自分より少し下まで受け入れる（tolerance）。
//   - 2人とも受け入れたらペア。会ったことのある相手には二度と引き合わせない。
// アプリの町（app）：
//   - 全員が全員を見られる。毎月、相手のいない人が、異性の中から browse 人のプロフィールを見て、
//     自分より aim だけ上に見える人にだけ「いいね」を送る（男性 likes.male 件、女性 likes.female 件まで）。
//     根拠：自分より約25%望ましい相手に送る・最初のメッセージの8割は男性（Bruch & Newman 2018）。
//   - いいねを受けた人は、そのいいねの相手が「自分の基準」に届けば返す。基準は 自分の点数−reply に、
//     これまでに受け取ったいいねが多いほど上がる分（raise × log2(1＋受け取った累計)）を足す（Pronk & Denissen 2020）。
//   - 両思い（マッチ）になった人のうち、相手が多い人はいちばん良く見える1人を選ぶ。選ばれた2人がペア。
//   - 見え方のずれは紹介より大きい（noise）。相手は他人どうしで、保証がないため。
//
// 3つの仕組みを1つずつ止める「もしも」（第3章）：
//   noAim（少し上を狙わない：aim=0）、noRaise（候補が多くても基準が上がらない：raise=0）、vouch（保証がある：noise=vouchNoise）。
import { rng, shuffle } from "../random";

export type Sex = "male" | "female";
export type Resident = { id: number; kind: Sex; score: number; circle: number };

export type TownOptions = {
  months: number;
  noise: number;       // アプリの町の見え方のずれ（±）
  vouchNoise: number;  // 紹介の見え方のずれ（±）
  tolerance: number;   // 紹介：自分より tolerance 下まで受け入れる
  perCircle: number;   // 紹介：1か月に1つの輪で世話役が引き合わせる組数
  matchmaker: number;  // 紹介：その月に世話役が動く確率（1＝毎月。職場や地域の世話役が減ると下がる）
  aim: number;         // アプリ：自分より aim 上だけにいいね
  reply: number;       // アプリ：いいねを受けたとき、自分より reply 下まで返す（受け取るのが少ないとき）
  raise: number;       // アプリ：受け取ったいいねが倍になるごとに基準が上がる幅
  browse: number;      // アプリ：1か月に見るプロフィールの数
  likes: Record<Sex, number>; // アプリ：1か月に送るいいねの上限
  /** アプリ：1人だけやり方を変える（「もしも彼だけが〜したら」）。住人の id → その人だけの値 */
  personal?: Record<number, Personal>;
};
export type Personal = { aim?: number; raise?: number; reply?: number; likes?: number; browse?: number; consider?: number }; // consider：1か月に見る届いたいいねの数の上限（候補を絞る）

export const DEFAULTS: TownOptions = {
  months: 12, noise: 0.6, vouchNoise: 0.25, tolerance: 0.15, perCircle: 1, matchmaker: 1,
  aim: 0.3, reply: 0.3, raise: 0.2, browse: 25, likes: { male: 8, female: 3 },
};

/** 月ごとの記録。pairs は [男性, 女性]、累計。 */
export type Month = {
  month: number;
  pairs: [number, number][];
  newPairs: [number, number][];
  /** 紹介の町：その月の引き合わせ [男性, 女性, ペアになったか] */
  intros?: [number, number, boolean][];
  /** アプリの町：その月にいいねを送った [送った人, 受けた人]（両方向） */
  likes?: [number, number][];
  /** アプリの町：その月の両思い [男性, 女性] */
  matches?: [number, number][];
};
export type TownResult = { town: "intro" | "app"; residents: Resident[]; months: Month[]; final: Month };

/** 100人の住人（男女50人ずつ。10人ずつの輪に男女5人ずつ） */
export const makeResidents = (seed = 1, n = 100, circleSize = 10): Resident[] => {
  const r = rng(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const nc = n / circleSize;
  const men = shuffle(Array.from({ length: n / 2 }, (_, i) => i % nc), seed + 11);
  const women = shuffle(Array.from({ length: n / 2 }, (_, i) => i % nc), seed + 12);
  return Array.from({ length: n }, (_, id) => {
    const kind: Sex = id % 2 === 0 ? "male" : "female";
    const k = Math.floor(id / 2);
    return { id, kind, score: normal(), circle: kind === "male" ? men[k] : women[k] };
  });
};

const circles = (rs: Resident[]) => Math.max(...rs.map((a) => a.circle)) + 1;
/** 知り合いの範囲：同じ輪か、隣の輪（輪は円く並ぶ） */
export const reachable = (a: Resident, b: Resident, nc: number) => {
  const d = Math.abs(a.circle - b.circle);
  return Math.min(d, nc - d) <= 1;
};

/** i から見た j の点数（人ごと・相手ごとに決まったずれ。同じ2人なら毎回同じ） */
const viewer = (seed: number, amp: number) => {
  const memo = new Map<string, number>();
  return (i: Resident, j: Resident) => {
    const k = `${i.id}:${j.id}`;
    if (!memo.has(k)) memo.set(k, rng(seed * 100003 + i.id * 1009 + j.id)() * 2 - 1);
    return j.score + amp * memo.get(k)!;
  };
};

export const simulateIntro = (rs: Resident[], o: Partial<TownOptions> = {}, seed = 7): TownResult => {
  const opt = { ...DEFAULTS, ...o };
  const nc = circles(rs);
  const view = viewer(seed, opt.vouchNoise);
  const partner = new Map<number, number>();
  const met = new Set<string>();
  const months: Month[] = [];
  const all: [number, number][] = [];
  for (let m = 1; m <= opt.months; m++) {
    const intros: [number, number, boolean][] = [];
    const busy = new Set<number>();
    const newPairs: [number, number][] = [];
    // 輪ごとに世話役が perCircle 組まで引き合わせる（相手のいない男性を1人選び、届く範囲の女性から相手を探す）
    const men: Resident[] = [];
    const act = rng(seed * 4099 + m);
    for (let c = 0; c < nc; c++) {
      if (act() >= opt.matchmaker) continue; // この月は世話役が動かない
      men.push(...shuffle(rs.filter((a) => a.kind === "male" && a.circle === c && !partner.has(a.id)), seed * 31 + m * 101 + c).slice(0, opt.perCircle));
    }
    for (const p of shuffle(men, seed * 37 + m)) {
      const cands = rs.filter((q) => q.kind === "female" && !partner.has(q.id) && !busy.has(q.id)
        && !met.has(`${p.id}:${q.id}`) && reachable(p, q, nc));
      if (!cands.length) continue;
      // 世話役は点数の近い人を選ぶ（釣り合いそうな人を紹介する）
      const q = cands.reduce((b, c) => (Math.abs(c.score - p.score) < Math.abs(b.score - p.score) ? c : b));
      busy.add(q.id);
      met.add(`${p.id}:${q.id}`);
      const ok = view(p, q) >= p.score - opt.tolerance && view(q, p) >= q.score - opt.tolerance;
      intros.push([p.id, q.id, ok]);
      if (ok) { partner.set(p.id, q.id); partner.set(q.id, p.id); newPairs.push([p.id, q.id]); all.push([p.id, q.id]); }
    }
    months.push({ month: m, pairs: [...all], newPairs, intros });
  }
  return { town: "intro", residents: rs, months, final: months[months.length - 1] };
};

export const simulateApp = (rs: Resident[], o: Partial<TownOptions> = {}, seed = 7): TownResult => {
  const opt = { ...DEFAULTS, ...o };
  const view = viewer(seed + 1, opt.noise);
  const partner = new Map<number, number>();
  const seen = new Map<number, number>(); // これまでに受け取ったいいねの累計（見てきた候補の数）
  const byId = new Map(rs.map((a) => [a.id, a])); // rs は町の一部（混ざった町）でもよい
  const months: Month[] = [];
  const all: [number, number][] = [];
  for (let m = 1; m <= opt.months; m++) {
    const singles = rs.filter((a) => !partner.has(a.id));
    const likes: [number, number][] = [];
    const got = new Map<number, number[]>();
    for (const p of singles) {
      const me = opt.personal?.[p.id] ?? {};
      const pool = shuffle(singles.filter((q) => q.kind !== p.kind), seed * 131 + m * 17 + p.id).slice(0, me.browse ?? opt.browse);
      // 見た順に、自分より aim 上に見える人へ送る（上限まで）。いちばん上の人だけを選ぶわけではない
      const sent = pool.filter((q) => view(p, q) >= p.score + (me.aim ?? opt.aim)).slice(0, me.likes ?? opt.likes[p.kind]);
      for (const q of sent) { likes.push([p.id, q.id]); got.set(q.id, [...(got.get(q.id) ?? []), p.id]); }
    }
    // 受けた人は、自分の基準（自分より reply 下まで）に届く相手にだけ返す。いいねを多く受け取ってきた人ほど基準が上がる
    const matches: [number, number][] = [];
    for (const q of singles) {
      const mq0 = opt.personal?.[q.id] ?? {};
      const from = (got.get(q.id) ?? []).slice(0, mq0.consider ?? Infinity); // 候補を絞る人は、届いた順に上限まで見る
      seen.set(q.id, (seen.get(q.id) ?? 0) + from.length);
      const mq = opt.personal?.[q.id] ?? {};
      const bar = q.score - (mq.reply ?? opt.reply) + (mq.raise ?? opt.raise) * Math.log2(1 + seen.get(q.id)!);
      for (const pid of from) {
        const p = byId.get(pid)!;
        if (view(q, p) >= bar) matches.push(p.kind === "male" ? [p.id, q.id] : [q.id, p.id]);
      }
    }
    // 両思いが重なる人は、いちばん良く見える相手を選ぶ（2人の好みの合計が高い順に決める）
    const uniq = [...new Map(matches.map((x) => [`${x[0]}:${x[1]}`, x])).values()];
    const R = (id: number) => byId.get(id)!;
    uniq.sort((a, b) => (view(R(b[0]), R(b[1])) + view(R(b[1]), R(b[0]))) - (view(R(a[0]), R(a[1])) + view(R(a[1]), R(a[0]))));
    const newPairs: [number, number][] = [];
    for (const [a, b] of uniq) {
      if (partner.has(a) || partner.has(b)) continue;
      partner.set(a, b); partner.set(b, a); newPairs.push([a, b]); all.push([a, b]);
    }
    months.push({ month: m, pairs: [...all], newPairs, likes, matches: uniq });
  }
  return { town: "app", residents: rs, months, final: months[months.length - 1] };
};

/** いいねを受け取った数（12か月の合計）。人気の集中を見せるのに使う */
export const likesReceived = (res: TownResult) => {
  const n = new Map(res.residents.map((a) => [a.id, 0]));
  for (const m of res.months) for (const [, q] of m.likes ?? []) n.set(q, n.get(q)! + 1);
  return n;
};
/** いいねを送った数（12か月の合計） */
export const likesSent = (res: TownResult) => {
  const n = new Map(res.residents.map((a) => [a.id, 0]));
  for (const m of res.months) for (const [p] of m.likes ?? []) n.set(p, n.get(p)! + 1);
  return n;
};
/** 両思いになった数（12か月の合計） */
export const matchesOf = (res: TownResult) => {
  const n = new Map(res.residents.map((a) => [a.id, 0]));
  for (const m of res.months) for (const [a, b] of m.matches ?? []) { n.set(a, n.get(a)! + 1); n.set(b, n.get(b)! + 1); }
  return n;
};
