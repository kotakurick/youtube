// 読み上げと字幕を自動で合わせる見本。台本は script.md、時刻は timing.json（python tts/narrate.py render/src/demo/demo-narrated --voice silent）。
// 場面の長さ・字幕・音声は timing.json から決まる。場面の中の動きは useNarration() で読み上げに合わせる。
import React from "react";
import { TodayCard } from "@lib/Cards";
import { ChapterCard } from "@lib/Chapter";
import { Crowd, Person } from "@lib/Crowd";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { hundred, kinds, scatter } from "@lib/layout";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { CROWD_SIZE, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";
import timing from "./timing.json";

const N = 100, base = kinds(N);
const start = scatter(N, { ...Z.stageWithGosa, y: Z.stage.y + 40, h: Z.stage.h - 40 }, 11, CROWD_SIZE);
const grid = hundred(N, { x: 330, bottom: 840, cols: 20, dx: 50, dy: 76 }, CROWD_SIZE);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

const Opening: React.FC = () => {
  const n = useNarration();
  const people: Person[] = base.map((kind, i) => ({ kind, from: start[i], highlight: i === 47, label: i === 47 ? "会社員（32）" : undefined,
    pose: i === 47 ? [[0, "phone"]] : "stand" }));
  return (
    <>
      <Svg><Crowd people={people} /></Svg>
      <Gosa cues={[[n.at(1), "normal"]]} size="S" />
    </>
  );
};

const Today: React.FC = () => (
  <>
    <TodayCard claim="婚活は、条件を下げれば成功する" />
    <Gosa cues={[[6, "thinking"]]} />
  </>
);

const Ch3Card: React.FC = () => <ChapterCard no={3} title="もしも、同じ100人で探したら" />;

const Ch3: React.FC = () => {
  const n = useNarration();
  const move = n.at(1); // 2文目が始まったら並び直す
  const people: Person[] = base.map((kind, i) => ({ kind, from: start[i], to: grid[i], delay: Math.round(i * 0.45), dim: i >= 38 ? 60 : undefined }));
  return (
    <>
      <SimBackground />
      <Svg><Crowd people={people} start={move} /></Svg>
      <HeroNumber value={38} unit="人" x={330} y={330} start={n.find("38人")} />
      <SourceNote sim />
      <Gosa cues={[[0, "thinking"], [n.find("38人") + 20, "surprised"]]} />
    </>
  );
};

const Lesson: React.FC = () => <Gosa cues={[[10, "happy"]]} />;

export const demoNarrated: EpisodeDef = {
  id: "demo-narrated",
  title: "読み上げの見本",
  scenes: fromTiming(timing as Timing, { opening: Opening, today: Today, "ch3-card": Ch3Card, ch3: Ch3, lesson: Lesson }),
};

/** 仮通しの見本：冒頭だけ部品があり、ほかの場面は仮の画面（場面名と字幕）になる */
export const demoDraft: EpisodeDef = {
  id: "demo-narrated-draft",
  title: "仮通しの見本",
  scenes: fromTiming(timing as Timing, { opening: Opening }, { draft: true }),
};
