// 部品の見本（数字は仮）。100人の群衆（1人＝1%）が婚活でペアになっていく場面など。
import React from "react";
import { AbsoluteFill } from "remotion";
import { BarChart } from "@lib/BarChart";
import { Crowd, Person } from "@lib/Crowd";
import { Gosa } from "@lib/Gosa";
import { grid, kinds, scatter } from "@lib/layout";
import { Question } from "@lib/Question";
import { SourceNote } from "@lib/SourceNote";
import { Subtitle } from "@lib/Subtitle";
import { Verdict } from "@lib/Verdict";
import { shuffle } from "@lib/random";
import { C, sec } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

const N = 100, PAIRS = 19; // 38人＝38%
const base = kinds(N).map((kind, i) => ({ kind, i }));
const start = scatter(N, { x: 100, y: 200, w: 900, h: 640 }, 11);
const pairSlots = grid(PAIRS, { x: 1080, y: 300, cols: 5, dx: 150, dy: 120 });
const men = shuffle(base.filter((p) => p.kind === "male").map((p) => p.i), 3).slice(0, PAIRS);
const women = shuffle(base.filter((p) => p.kind === "female").map((p) => p.i), 4).slice(0, PAIRS);
const peopleMemo = new Map<boolean, Person[]>();
const buildPeople = (dimRest: boolean): Person[] => base.map(({ kind, i }) => {
  const m = men.indexOf(i), w = women.indexOf(i);
  const k = m >= 0 ? m : w;
  if (k < 0) return { kind, from: start[i], dim: dimRest };
  const slot = pairSlots[k];
  return { kind, from: start[i], to: { x: slot.x + (w >= 0 ? 44 : 0), y: slot.y }, delay: 10 + k * 5, highlight: i === men[0] };
});
// 毎フレーム作り直さない（重なりの確認も1回で済む）
const people = (dimRest: boolean) => {
  if (!peopleMemo.has(dimRest)) peopleMemo.set(dimRest, buildPeople(dimRest));
  return peopleMemo.get(dimRest)!;
};
const openingPeople: Person[] = base.map(({ kind, i }) => ({ kind, from: start[i], highlight: i === men[0] }));

const Opening: React.FC = () => (
  <>
    <Question text="100人で婚活したら、何人がペアになる？" />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><Crowd people={openingPeople} /></svg>
    <Gosa cues={[[10, "thinking"]]} x={1650} y={760} />
    <Subtitle lines={[[0, sec(4), "ある婚活パーティーに、100人が集まりました。"]]} />
  </>
);

const Matching: React.FC = () => (
  <>
    <Question text="100人で婚活したら、何人がペアになる？" start={-30} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><Crowd people={people(true)} /></svg>
    <Gosa cues={[[0, "thinking"], [sec(4.2), "surprised"]]} x={1720} y={860} width={240} />
    <Subtitle lines={[[0, sec(2.5), "人気は、条件の上位に集中します。"], [sec(2.5), sec(6), "ペアになれたのは、38人でした。"]]} />
  </>
);

const Chart: React.FC = () => (
  <>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <BarChart x={360} y={260} width={1000} height={520} max={100}
        bars={[{ label: "ペア成立", value: 38 }, { label: "相手が見つからない", value: 62, color: C.other }]} />
    </svg>
    <SourceNote text="試作用の仮の数字（シミュレーション）" start={10} />
    <Gosa cues={[[5, "point"]]} x={1560} y={700} width={260} flip />
    <Subtitle lines={[[0, sec(5), "約4割。残りの6割は、相手が見つかりませんでした。"]]} />
  </>
);

const Ending: React.FC = () => (
  <>
    <Verdict claim="婚活は条件を下げれば成功する" mark="△" reason={["年齢の幅を広げると、成立は1.6倍。", "ただし、地域によっては逆になる。"]} />
    <Subtitle lines={[[sec(1), sec(6), "答えは、条件次第。数字は、選び方の地図になります。"]]} />
  </>
);

export const demo: EpisodeDef = {
  id: "demo",
  title: "部品の見本",
  scenes: [
    { id: "opening", seconds: 4, Scene: Opening },
    { id: "matching", seconds: 6, Scene: Matching },
    { id: "chart", seconds: 5, Scene: Chart },
    { id: "ending", seconds: 6, Scene: Ending },
  ],
};
