// 部品の見本（数字は仮）。標準構成の流れを短く通す：
// 物語の冒頭（○番さん）→ 今日の答え合わせ → 100人実験（群衆が100マスに並び直す）→ 章の扉 → もしも → 答え合わせ → 教訓
import React from "react";
import { AbsoluteFill } from "remotion";
import { BarChart, barGeometry, BarChartProps } from "@lib/BarChart";
import { Bracket } from "@lib/Bracket";
import { ChannelTag, TodayCard } from "@lib/Cards";
import { ChapterCard, ChapterDots, CHAPTER_FRAMES } from "@lib/Chapter";
import { Crowd, Person } from "@lib/Crowd";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { kinds, Pt, scatter } from "@lib/layout";
import { Question } from "@lib/Question";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { Subtitle } from "@lib/Subtitle";
import { Verdict, VERDICT_TIMING } from "@lib/Verdict";
import { shuffle } from "@lib/random";
import { CROWD_SIZE, FPS, sec, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

// ---- 100人（1人＝1%）。38人がペアになる ----
const N = 100, PAIRS = 19;
const base = kinds(N);
const start = scatter(N, { ...Z.stageWithGosa, y: Z.stage.y + 40, h: Z.stage.h - 40 }, 11, CROWD_SIZE);
const men = shuffle(base.flatMap((k, i) => (k === "male" ? [i] : [])), 3);
const women = shuffle(base.flatMap((k, i) => (k === "female" ? [i] : [])), 4);
const paired = new Set([...men.slice(0, PAIRS), ...women.slice(0, PAIRS)]);
const HERO = men[PAIRS + 2]; // 追う1人（ペアにならない側）
const LABEL = "27番さん（32）";

// 100マス：20列×5段、左の列から下→上に埋める。ペア成立を左に、残りを右に
const COLS = 20, ROWS = 5, DX = 50, DY = 76, GX = 330, BOTTOM = 840;
const cell = (k: number): Pt => ({ x: GX + Math.floor(k / ROWS) * DX, y: BOTTOM - (k % ROWS) * DY });
const order = [...men.slice(0, PAIRS).flatMap((m, i) => [m, women[i]]), ...base.map((_, i) => i).filter((i) => !paired.has(i))];
const slotOf = new Map(order.map((i, k) => [i, k]));
const gridTop = BOTTOM - (ROWS - 1) * DY - 45 * CROWD_SIZE;

const opening: Person[] = base.map((kind, i) => ({ kind, from: start[i], highlight: i === HERO, label: i === HERO ? LABEL : undefined }));
const toGrid: Person[] = base.map((kind, i) => ({
  kind, from: start[i], to: cell(slotOf.get(i)!), delay: Math.round(slotOf.get(i)! * 0.45),
  dim: paired.has(i) ? undefined : 70, highlight: i === HERO, label: i === HERO ? LABEL : undefined,
}));
const back: Person[] = base.map((kind, i) => ({ kind, from: cell(slotOf.get(i)!), to: start[i], delay: Math.round(i * 0.3),
  highlight: i === HERO, label: i === HERO ? LABEL : undefined }));

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

// ---- 場面 ----
const Opening: React.FC = () => (
  <>
    <Svg><Crowd people={opening} /></Svg>
    <ChannelTag />
    <Gosa cues={[[20, "normal"]]} size="S" exit={50} />
    <Subtitle lines={[[0, sec(4.5), "32歳の27番さんは、この夜、3人と話しました。"]]} />
  </>
);

const Today: React.FC = () => (
  <>
    <TodayCard claim="婚活は、条件を下げれば成功する" />
    <Gosa cues={[[6, "thinking"]]} size="M" />
    <Subtitle lines={[[0, sec(3.5), "今日の答え合わせは、この説です。"]]} />
  </>
);

const Experiment: React.FC = () => (
  <>
    <SimBackground />
    <Svg>
      <Crowd people={toGrid} />
      <Bracket x1={GX - 16} x2={GX + 7 * DX + 16} y={gridTop - 12} label="ペア成立 38人" start={85} />
      <Bracket x1={GX + 8 * DX - 16} x2={GX + (COLS - 1) * DX + 16} y={gridTop - 12} label="相手が見つからない 62人" start={95} />
    </Svg>
    <HeroNumber value={38} unit="人" x={GX} y={330} start={70} detail="100人中" />
    <SourceNote sim start={10} />
    <Gosa cues={[[0, "thinking"], [118, "surprised"]]} size="M" />
    <Subtitle lines={[[0, sec(3), "100人で、同じ夜を再現します。"], [sec(3), sec(7), "ペアになれたのは、38人でした。"]]} />
  </>
);

const Chapter3: React.FC = () => <ChapterCard no={3} title="もしも、年齢の幅を広げたら" />;

const chart: BarChartProps = {
  x: 200, y: 300, width: 1100, height: 460, max: 100, start: 12, format: (v) => `${Math.round(v)}人`,
  bars: [{ label: "今の条件", value: 38 }, { label: "年齢の幅±5歳", value: 61, focus: true, err: [54, 68] }],
};
const focusTop = barGeometry(chart)[1];
const WhatIf: React.FC = () => (
  <>
    <SimBackground />
    <ChapterDots current={3} />
    <Svg><BarChart {...chart} /></Svg>
    <SourceNote sim x={chart.x} y={Z.noteY} start={12} />
    <Gosa cues={[[0, "normal"], [70, "point"]]} size="M" reachTo={{ x: focusTop.cx + 96, y: focusTop.valueY + 42 }} />
    <Subtitle lines={[[0, sec(6), "年齢の幅を広げると、ペアは約1.6倍になりました。"]]} />
  </>
);

const Answer: React.FC = () => (
  <>
    <Verdict claim="婚活は条件を下げれば成功する" mark="△"
      reason={["年齢の幅を広げると、成立は約1.6倍。", "ただし、地域によっては逆になる。"]} />
    <Subtitle lines={[[sec(0.5), sec(6.5), "答えは、条件次第です。"]]} />
  </>
);

const Lesson: React.FC = () => (
  <>
    <Svg><Crowd people={back} /></Svg>
    <Gosa cues={[[30, "happy"]]} size="M" />
    <Subtitle lines={[[0, sec(5), "同じ100人でも、線の引き方で答えは変わる。"]]} />
  </>
);

const { roll, hit } = VERDICT_TIMING;
export const demo: EpisodeDef = {
  id: "demo",
  title: "部品の見本",
  thumb: { lines: ["婚活の夜", "ペアは4割"], count: 38, gosa: "surprised" },
  scenes: [
    { id: "opening", seconds: 4.5, Scene: Opening },
    { id: "today", seconds: 3.5, Scene: Today },
    { id: "experiment", seconds: 7, Scene: Experiment },
    { id: "chapter3", seconds: CHAPTER_FRAMES / FPS, Scene: Chapter3 },
    { id: "whatif", seconds: 6, Scene: WhatIf },
    { id: "answer", seconds: 7, Scene: Answer, bgmMute: [[(roll + 45) / FPS, hit / FPS]] },
    { id: "lesson", seconds: 5, Scene: Lesson },
  ],
};
