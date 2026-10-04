// 縦型ショートの見本（1080×1920、数字は仮）。型は「100人クイズ」：問い → 予想 → 100人が並ぶ → 答えは7割の位置で出す → 本編へ。
import React from "react";
import { Crowd, Person } from "@lib/Crowd";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { hundred, kinds, scatter } from "@lib/layout";
import { Quiz, QUIZ_TIMING } from "@lib/Quiz";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { Subtitle } from "@lib/Subtitle";
import { shuffle } from "@lib/random";
import { C, font, FPS, sec, ZS } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

const N = 100, PAIRED = 38, SIZE = 1.1;
const base = kinds(N);
const from = scatter(N, ZS.stageWithGosa, 7, SIZE);
const order = shuffle(base.map((_, i) => i), 9);
const grid = hundred(N, { x: 100, bottom: 1240, cols: 10, dx: 70, dy: 72 }, SIZE);
const people: Person[] = order.map((i, k) => ({ kind: base[i], from: from[i], to: grid[k], delay: Math.round(k * 0.4), dim: k >= PAIRED ? 60 : undefined }));

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

const Ask: React.FC = () => (
  <>
    <Quiz question="100人で婚活。ペアになれるのは？" choices={["約2割", "約4割", "約6割"]} />
    <Subtitle lines={[[0, sec(2.5), "100人で婚活したら、"], [sec(2.5), sec(5), "何人がペアになる？"]]} />
  </>
);

const Count: React.FC = () => (
  <>
    <SimBackground />
    <Svg><Crowd people={people} size={SIZE} /></Svg>
    <HeroNumber value={PAIRED} unit="人" x={ZS.header.x} y={460} start={70} detail="100人中" />
    <SourceNote sim />
    <Gosa cues={[[0, "thinking"], [100, "surprised"]]} size="S" x={900} foot={1320} />
    <Subtitle lines={[[0, sec(2.5), "100人を並べると、"], [sec(2.5), sec(6), "ペアになれたのは、約4割。"]]} />
  </>
);

const Next: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 64, right: 64, top: 640, textAlign: "center", ...font("question"), lineHeight: 1.4 }}>
      条件を変えると、<br />どこまで増える？
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center" }}>
      <span style={{ background: C.ink, color: C.white, borderRadius: 16, padding: "12px 32px", ...font("label", C.white), fontWeight: 900 }}>答え合わせは本編で</span>
    </div>
    <Gosa cues={[[6, "depends"]]} size="M" x={540} foot={1300} says={[[12, "ひげ、のびます。"]]} />
    <Subtitle lines={[[0, sec(3.5), "続きは、本編で答え合わせ。"]]} />
  </>
);

export const demoShort: EpisodeDef = {
  id: "demo-short",
  title: "ショートの見本",
  scenes: [
    { id: "ask", seconds: (QUIZ_TIMING.ring + QUIZ_TIMING.ringLen + 10) / FPS, Scene: Ask },
    { id: "count", seconds: 6, Scene: Count },
    { id: "next", seconds: 3.5, Scene: Next },
  ],
};
