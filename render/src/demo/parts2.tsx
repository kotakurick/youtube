// 部品の見本帳その2（数字はすべて仮）：シミュレーションのばらつき、年代の違う人型と昔の情景、条件を重ねる、1年ずつ進める、
// 人口ピラミッドと年齢で選ぶシミュレーション、男女2本の棒、滝グラフ、組み合わせの表、理想と実際、途中の答え合わせ・登録の1行
import React from "react";
import { Backdrop } from "@lib/Backdrop";
import { MidCheck, SubscribeNudge } from "@lib/Cards";
import { CohortRace } from "@lib/CohortRace";
import { Dumbbell } from "@lib/Dumbbell";
import { Figure } from "@lib/Figure";
import { FilterSteps } from "@lib/FilterSteps";
import { Gosa } from "@lib/Gosa";
import { kinds } from "@lib/layout";
import { Matrix } from "@lib/Matrix";
import { PairedBars } from "@lib/PairedBars";
import { Pyramid } from "@lib/Pyramid";
import { SimBackground } from "@lib/SimBackground";
import { SimSpread } from "@lib/SimSpread";
import { SourceNote } from "@lib/SourceNote";
import { Subtitle } from "@lib/Subtitle";
import { Waterfall } from "@lib/Waterfall";
import { ageMatch } from "@lib/sim/ageMatch";
import { cohort } from "@lib/sim/cohort";
import { filterPeople } from "@lib/sim/filter";
import { makeAgents, pairedShare, simulateMatching } from "@lib/sim/matching";
import { rangesOverlap, runMany, spread } from "@lib/sim/spread";
import { sec, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

const FAKE = "見本用の仮の数字";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

// 1. シミュレーションのばらつき：同じ条件で100回やり直す
const share = (aim: number) => (seed: number) => pairedShare(simulateMatching(makeAgents(100, seed), { aim }, 5, seed)) * 100;
const sHigh = spread(runMany(100, share(0.2))), sSame = spread(runMany(100, share(0)));
const SpreadScene: React.FC = () => (
  <>
    <SimBackground />
    <SimSpread x={Z.stage.x} y={300} width={1280} domain={[0, 70]} ticks={[0, 20, 40, 60]}
      rows={[{ label: "全員が少し上", spread: sHigh }, { label: "同じ以上", spread: sSame }]} />
    <SourceNote sim />
    <Gosa cues={[[0, "thinking"], [110, rangesOverlap(sHigh, sSame) ? "depends" : "assertive"]]} />
    <Subtitle lines={[[0, sec(3.5), "同じ条件で、100回やり直します。"], [sec(3.5), sec(8), "9割はこの幅に入ります。"]]} />
  </>
);

// 2. 年代の違う人型と昔の情景（3世代）
const GenScene: React.FC = () => (
  <>
    <Backdrop kind="washitsu" floor={860} variant={0} />
    <Svg>
      <Figure kind="male" age="elder" x={330} y={860} size={5} facing={1} />
      <Figure kind="female" age="elder" x={530} y={860} size={5} facing={-1} />
      <Figure kind="male" x={830} y={860} size={5} />
      <Figure kind="female" x={1000} y={860} size={5} />
      <Figure kind="female" age="child" x={1160} y={860} size={5} />
    </Svg>
    <Subtitle lines={[[0, sec(2), "祖父母、両親、自分。"], [sec(2), sec(5), "出会った場所は3世代で違います。"]]} />
  </>
);
const WeddingScene: React.FC = () => (
  <>
    <Backdrop kind="wedding" floor={860} variant={1} />
    <Svg>
      <Figure kind="male" x={900} y={860} size={4.4} facing={1} />
      <Figure kind="female" x={1020} y={860} size={4.4} facing={-1} />
      <Figure kind="male" age="child" x={1130} y={860} size={4.4} />
    </Svg>
    <Subtitle lines={[[0, sec(4.5), "2回目の結婚式。子どもと一緒に入場します。"]]} />
  </>
);

// 3. 条件を1つずつ重ねる
const K = kinds(100);
const steps = filterPeople(100, [
  { label: "年齢が±5歳", share: 0.5 }, { label: "結婚の意思がある", share: 0.8 },
  { label: "同じ県に住んでいる", share: 0.3 }, { label: "年収が自分と同じ以上", share: 0.5 },
], { seed: 3 });
const FilterScene: React.FC = () => (
  <>
    <FilterSteps steps={steps} kinds={K} x={Z.stage.x} y={Z.stage.y + 20} every={40} note="条件どうしは関係ないと仮定（見本の仮の数字）" />
    <Gosa cues={[[0, "normal"], [170, "surprised"]]} />
    <Subtitle lines={[[0, sec(3), "条件を1つずつ重ねると、"], [sec(3), sec(7), "100人はここまで減ります。"]]} />
  </>
);

// 4. 1年ずつ進める（25歳で始めた100人と、35歳で始めた100人）
const rate = (age: number) => 0.13 * Math.exp(-((age - 29) ** 2) / 60) + 0.01;
const c25 = cohort(100, 25, 10, rate, 4), c35 = cohort(100, 35, 10, rate, 5);
const CohortScene: React.FC = () => (
  <>
    <SimBackground />
    <CohortRace x={Z.stage.x} y={Z.stage.y} kinds={K} years={10} perYear={18}
      groups={[{ label: "25歳で始めた100人", startAge: 25, events: c25 }, { label: "35歳で始めた100人", startAge: 35, events: c35 }]} />
    <SourceNote sim />
    <Gosa cues={[[0, "thinking"]]} />
    <Subtitle lines={[[0, sec(7), "1年ずつ進めて、結婚した人に色を付けます。"]]} />
  </>
);

// 5. 人口ピラミッドと、年齢で相手を選ぶシミュレーション
const AGES = ["20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54"];
const M = [120, 110, 90, 80, 75, 70, 60], F = [110, 95, 70, 55, 45, 40, 35];
const match = ageMatch(M, F, (i) => [i, i - 1, i - 2]); // 男性は同じか少し年下の区分から探す（仮定）
const PyramidScene: React.FC = () => (
  <>
    <Pyramid ages={AGES} male={M} female={F} max={130} x={Z.stage.x} y={Z.stage.y + 40} width={1300} height={560}
      maleLeft={match.maleLeft} femaleLeft={match.femaleLeft} showValues unit="万" />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"]]} />
    <Subtitle lines={[[0, sec(3), "男性が同じか年下を選ぶと、"], [sec(3), sec(7), "残るのは上の年代の男性です。"]]} />
  </>
);

// 6. 男女2本の棒
const PairedScene: React.FC = () => (
  <>
    <PairedBars x={Z.stage.x + 40} y={Z.stage.y + 120} width={1300} height={460} max={100}
      rows={[{ label: "割り勘", male: 38, female: 45 }, { label: "男性が多め", male: 52, female: 40 }, { label: "女性が多め", male: 10, female: 15 }]} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"]]} />
    <Subtitle lines={[[0, sec(6), "男性の答えと女性の答えを並べます。"]]} />
  </>
);

// 7. 滝グラフ
const WaterfallScene: React.FC = () => (
  <>
    <Waterfall x={Z.stage.x + 40} y={Z.stage.y + 60} width={1300} height={520} max={140} focus={0}
      from={{ label: "1990年", value: 122 }} steps={[{ label: "結婚の減少", delta: -40 }, { label: "夫婦の子どもの減少", delta: -12 }]} to="2020年"
      format={(v) => `${Math.round(v)}万`} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"], [70, "surprised"]]} />
    <Subtitle lines={[[0, sec(6), "減った分を、2つの理由に分けます。"]]} />
  </>
);

// 8. 組み合わせの表
const MatrixScene: React.FC = () => (
  <>
    <Matrix rowLabel="夫" colLabel="妻" rows={["高校", "短大・専門", "大学"]} cols={["高校", "短大・専門", "大学"]} diagonal
      values={[[18, 9, 3], [6, 14, 5], [7, 12, 26]]} x={Z.stage.x + 80} y={Z.stage.y} cell={170} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"]]} />
    <Subtitle lines={[[0, sec(6), "似た学歴どうしの夫婦は、斜めの線に集まります。"]]} />
  </>
);

// 9. 理想と実際
const DumbbellScene: React.FC = () => (
  <>
    <Dumbbell aLabel="実際" bLabel="理想" max={3} x={Z.stage.x} y={Z.stage.y + 90} width={1380} rowH={120} format={(v) => `${v.toFixed(1)}人`}
      rows={[{ label: "2005年", a: 1.9, b: 2.5 }, { label: "2010年", a: 1.8, b: 2.4 }, { label: "2015年", a: 1.7, b: 2.3 }, { label: "2021年", a: 1.6, b: 2.3 }]} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"]]} />
    <Subtitle lines={[[0, sec(6), "理想と実際の差は、少しずつ開いています。"]]} />
  </>
);

// 10. 途中の答え合わせと、登録の1行
const CardsScene: React.FC = () => (
  <>
    <MidCheck text="ここまでは「条件次第」" start={5} />
    <SubscribeNudge start={20} />
    <Gosa cues={[[0, "depends"]]} />
    <Subtitle lines={[[0, sec(5), "ここまでの答えは、条件次第です。"]]} />
  </>
);

export const parts2: EpisodeDef = {
  id: "parts2",
  title: "部品の見本帳その2",
  scenes: [
    { id: "spread", seconds: 8, Scene: SpreadScene },
    { id: "generations", seconds: 5, Scene: GenScene },
    { id: "wedding", seconds: 4.5, Scene: WeddingScene },
    { id: "filter", seconds: 7, Scene: FilterScene },
    { id: "cohort", seconds: 7.5, Scene: CohortScene },
    { id: "pyramid", seconds: 7, Scene: PyramidScene },
    { id: "paired", seconds: 6, Scene: PairedScene },
    { id: "waterfall", seconds: 6, Scene: WaterfallScene },
    { id: "matrix", seconds: 6, Scene: MatrixScene },
    { id: "dumbbell", seconds: 6, Scene: DumbbellScene },
    { id: "cards", seconds: 5, Scene: CardsScene },
  ],
};
