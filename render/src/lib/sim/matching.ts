// 婚活のマッチングのシミュレーション（計算だけ。描画は MatchingSim.tsx）。
// 同じ条件・同じ種なら、毎回同じ結果になる（純粋な関数）。
//
// しくみ（安定マッチング／Gale–Shapley を基本にする）：
//   - 1人ずつ「魅力の点数」（ふつうの分布）を持つ。相手の点数は、人それぞれ少しずれて見える（noise）。
//   - 「自分より aim だけ上」の相手しか受け入れない（aim が大きいほど、みんなが少し上を狙う）。
//     ageRange があれば、年齢の差が ageRange 歳を超える相手も受け入れない。
//   - 1回ごとに、相手のいない男性が、受け入れられる中で好きな順に perRound 人まで申し込む。
//     女性は、申し込みと今の相手のうち、いちばん好きな人を残す（乗り換えもある）。
//   - 申し込める相手がいなくなった人は、そのまま残る。決まった回数（rounds）か、動きがなくなったら終わり。
// 男女の役割を入れ替えても全体の組数はほぼ同じになるが、どちらが申し込むかで有利不利が出る（安定マッチングの性質）。
import { rng } from "../random";
import type { Kind } from "../Figure";

export type Agent = { id: number; kind: Kind; score: number; age: number };
export type MatchCondition = {
  aim: number;          // 受け入れる相手の下限（自分の点数＋aim）。0＝自分と同じ以上、負＝自分より下も受け入れる
  ageRange?: number;    // 年齢の差の上限（歳）
  noise?: number;       // 相手の見え方のずれ（大きいほど好みが人それぞれ）
  perRound?: number;    // 1回（1回のパーティー）で1人が申し込める人数
  proposer?: "male" | "female";
};
export type MatchRound = { round: number; pairs: [number, number][]; single: number[] }; // pairs は [申し込んだ人, 受けた人]
export type MatchResult = { agents: Agent[]; rounds: MatchRound[]; final: MatchRound };

/** n人（男女半々）を作る。点数は平均0・ばらつき1、年齢は ages の範囲で一様 */
export const makeAgents = (n: number, seed = 1, ages: [number, number] = [25, 45]): Agent[] => {
  const r = rng(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  return Array.from({ length: n }, (_, id) => ({
    id, kind: id % 2 === 0 ? "male" : "female", score: normal(), age: Math.round(ages[0] + r() * (ages[1] - ages[0])),
  }));
};

export const simulateMatching = (agents: Agent[], cond: MatchCondition, rounds = 6, seed = 7): MatchResult => {
  const r = rng(seed);
  const noise = cond.noise ?? 0.6;
  const perRound = cond.perRound ?? 4;
  const proposerKind = cond.proposer ?? "male";
  const P = agents.filter((a) => a.kind === proposerKind), Q = agents.filter((a) => a.kind !== proposerKind && a.kind !== "other");
  // 見え方（i から見た j の点数）。人ごと・相手ごとに少しずれる
  const seen = new Map<string, number>();
  const view = (i: Agent, j: Agent) => {
    const k = `${i.id}:${j.id}`;
    if (!seen.has(k)) seen.set(k, j.score + noise * (r() * 2 - 1));
    return seen.get(k)!;
  };
  const ok = (i: Agent, j: Agent) =>
    view(i, j) >= i.score + cond.aim && (cond.ageRange === undefined || Math.abs(i.age - j.age) <= cond.ageRange);
  // 申し込む側の好きな順（受け入れられる相手だけ）
  const prefs = new Map(P.map((p) => [p.id, Q.filter((q) => ok(p, q)).sort((a, b) => view(p, b) - view(p, a)).map((q) => q.id)]));
  const next = new Map(P.map((p) => [p.id, 0]));
  const holder = new Map<number, number>(); // 受ける側 → 今の相手
  const byId = new Map(agents.map((a) => [a.id, a]));
  const out: MatchRound[] = [];
  for (let round = 1; round <= rounds; round++) {
    const free = P.filter((p) => ![...holder.values()].includes(p.id) && next.get(p.id)! < prefs.get(p.id)!.length);
    if (!free.length) break;
    for (const p of free) {
      const list = prefs.get(p.id)!;
      // 好きな順に申し込み、受け入れられたらその回はそこで止める
      for (let k = 0; k < perRound && next.get(p.id)! < list.length; k++) {
        const qid = list[next.get(p.id)!];
        next.set(p.id, next.get(p.id)! + 1);
        const q = byId.get(qid)!;
        if (!ok(q, p)) continue; // 受ける側も、自分の基準に届かない相手は断る
        const cur = holder.get(qid);
        if (cur === undefined || view(q, p) > view(q, byId.get(cur)!)) { holder.set(qid, p.id); break; }
      }
    }
    const pairs = [...holder.entries()].map(([q, p]) => [p, q] as [number, number]);
    const paired = new Set(pairs.flat());
    out.push({ round, pairs, single: agents.filter((a) => !paired.has(a.id)).map((a) => a.id) });
  }
  if (!out.length) out.push({ round: 1, pairs: [], single: agents.map((a) => a.id) });
  return { agents, rounds: out, final: out[out.length - 1] };
};

/** ペアになった人の割合（0〜1） */
export const pairedShare = (res: MatchResult) => (res.final.pairs.length * 2) / res.agents.length;
