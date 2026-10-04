// 部品の見本帳の続き（docs/requests/2026-10-04-parts.md）：物語の情景と小道具、シミュレーション、構成比の推移。数字はすべて仮。
// parts.tsx の場面の並びに入る。姿勢・小道具・背景の一覧は静止画（pose-sheet、backdrop-sheet）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop, BackdropKind, WALL_FREE } from "@lib/Backdrop";
import { Camera } from "@lib/Camera";
import { Crowd, Person } from "@lib/Crowd";
import { Figure, Kind, Pose } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { kinds, scatter } from "@lib/layout";
import { MatchingCompare, MatchingSim } from "@lib/MatchingSim";
import { Calendar, Chair, Clock, Cup, Desk, Phone, Table, tableTop } from "@lib/Props";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { StackedTrend } from "@lib/StackedTrend";
import { Subtitle } from "@lib/Subtitle";
import { makeAgents, pairedShare, simulateMatching } from "@lib/sim/matching";
import { rng } from "@lib/random";
import { C, CROWD_SIZE, font, sec, Z } from "@lib/theme";
import { useCurrentFrame } from "remotion";

const FAKE = "見本用の仮の数字";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

// ---- 物語の冒頭：駅のホームの1人に寄って → 引くと100人の中の1人 ----
const N = 100;
const base = kinds(N);
const platform = scatter(N, { x: 96, y: 560, w: 1728, h: 330 }, 21, CROWD_SIZE);
const HERO = 37;
const r0 = rng(4);
const crowdPoses: Pose[] = base.map(() => (r0() < 0.4 ? "phone" : "stand"));
const storyPeople: Person[] = base.map((kind, i) => ({
  kind, from: platform[i], pose: i === HERO ? [[0, "phone"], [100, "headInHands"]] : crowdPoses[i],
  highlight: i === HERO, label: i === HERO ? "27番さん（32）" : undefined,
}));
export const StoryScene: React.FC = () => (
  <>
    <Camera keys={[[0, { x: platform[HERO].x, y: platform[HERO].y - 60, scale: 3.2 }], [70, { x: 960, y: 540, scale: 1 }]]} dur={45}>
      <Backdrop kind="station" floor={860} variant={2} />
      <Svg><Crowd people={storyPeople} /></Svg>
    </Camera>
    <Subtitle lines={[[0, sec(2.3), "金曜の夜、27番さんはまたアプリを開きました。"], [sec(2.3), sec(6), "同じホームに、同じような人が100人。"]]} />
  </>
);

// ---- 部屋：テーブルを挟んで向き合う2人（座る・カップ・時計・カレンダー） ----
const S = 6; // 寄りの場面の人物の大きさ（家具も同じ単位で描く）
export const RoomScene: React.FC = () => (
  <>
    <Backdrop kind="room" floor={860} variant={1} />
    <Svg>
      {/* 時計とカレンダーは、背景が空けている壁（WALL_FREE）に置く */}
      <Calendar x={WALL_FREE.x1 * 1920} y={230} w={120} label="金" />
      <Clock x={WALL_FREE.x2 * 1920 - 70} y={290} r={56} hour={19} minute={40} />
      <Chair x={690} y={860} size={S} />
      <Chair x={1230} y={860} size={S} />
      <Figure kind="male" x={690} y={860} size={S} pose="sit" facing={1} />
      <Figure kind="female" x={1230} y={860} size={S} pose="sit" facing={-1} />
      <Table x={960} y={860} size={S} w={60} />
      <Cup x={900} y={860 + tableTop(S)} size={S} />
      <Cup x={1020} y={860 + tableTop(S)} size={S} steam={false} />
    </Svg>
    <Subtitle lines={[[0, sec(5), "初めて会った2人が、最初に話すのは何か。"]]} />
  </>
);

// ---- 夜の街：歩く人と、スマホの画面の寄り ----
export const NightScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Backdrop kind="night" floor={860} variant={3} />
      <Svg>
        <Figure kind="female" x={300 + frame * 3} y={860} size={4} pose="walk" phase={(frame % 20) / 20} facing={1} />
        <Phone x={1450} y={480} h={560} screen={frame < 75 ? "message" : "like"} likes={3} />
      </Svg>
      <Subtitle lines={[[0, sec(2.5), "帰り道に届いたメッセージは2通。"], [sec(2.5), sec(5), "「いいね」は、3つ。"]]} />
    </>
  );
};

// ---- 職場の机：うつむく1人 ----
export const OfficeScene: React.FC = () => (
  <>
    <Backdrop kind="office" floor={860} variant={0} />
    <Svg>
      <Desk x={1120} y={860} size={S} w={70} />
      <Figure kind="male" x={760} y={860} size={S} pose="headInHands" facing={1} />
    </Svg>
    <Subtitle lines={[[0, sec(4), "月曜の朝、職場の机で。"]]} />
  </>
);

// ---- シミュレーション：同じ100人で、何回かに分けてペアができていく ----
const agents = makeAgents(N, 3);
const real = simulateMatching(agents, { aim: 0 }, 5);
const higher = simulateMatching(agents, { aim: 0.2 }, 5);
const paired = new Set(real.final.pairs.flat());
const SIM_HERO = agents.find((a) => a.kind === "male" && !paired.has(a.id))!.id;
export const SIM_SECONDS = (5 * 45 + 40) / 30;
export const SimScene: React.FC = () => (
  <>
    <SimBackground />
    <MatchingSim result={real} box={{ x: Z.stage.x, y: Z.stage.y, w: Z.stageWithGosa.w, h: Z.stage.h }} highlight={{ id: SIM_HERO, label: "27番さん" }} />
    <SourceNote sim />
    <Gosa cues={[[0, "thinking"], [5 * 45, "surprised"]]} />
    <Subtitle lines={[[0, sec(4), "全員が「自分と同じかそれ以上」の相手を探すと、"], [sec(4), sec(9), `ペアになれたのは、100人中${Math.round(pairedShare(real) * 100)}人でした。`]]} />
  </>
);

/** つまみ（Slider）の目盛りと、その条件で計算したペアの人数（HeroNumber に渡す） */
export const AIM_STOPS: { label: string; aim: number }[] = [
  { label: "少し上だけ", aim: 0.2 }, { label: "同じ以上", aim: 0 }, { label: "少し下も", aim: -0.3 }, { label: "かなり下も", aim: -0.6 },
];
export const AIM_PAIRED = AIM_STOPS.map((s) => Math.round(pairedShare(simulateMatching(agents, { aim: s.aim }, 5)) * 100));

export const CompareScene: React.FC = () => (
  <>
    <SimBackground />
    <MatchingCompare box={{ x: Z.stage.x, y: Z.stage.y, w: Z.stage.w, h: Z.stage.h }}
      left={{ title: "現実：同じ以上", result: real }} right={{ title: "もしも：全員が少し上", result: higher }} />
    <SourceNote sim />
    <Subtitle lines={[[0, sec(9), "全員が少し上を狙うと、同じ100人でもペアは減る。"]]} />
  </>
);

// ---- 1000人でも動く ----
const agents1000 = makeAgents(1000, 3);
const real1000 = simulateMatching(agents1000, { aim: 0 }, 5);
export const Sim1000Scene: React.FC = () => (
  <>
    <SimBackground />
    <MatchingSim result={real1000} box={{ x: Z.stage.x, y: Z.stage.y, w: Z.stageWithGosa.w, h: Z.stage.h }} size={0.42} />
    <SourceNote sim />
    <Gosa cues={[[0, "normal"]]} />
    <Subtitle lines={[[0, sec(9), "1000人にすると、人気はさらに上位に集中します。"]]} />
  </>
);

// ---- 構成比の推移：夫婦が出会ったきっかけ（仮の数字） ----
const CATS = ["見合い", "職場", "友人の紹介", "学校", "ネット", "その他"];
const TREND = [
  { label: "1987", values: [23, 32, 27, 7, 0, 11] },
  { label: "1997", values: [10, 34, 30, 10, 0, 16] },
  { label: "2005", values: [6, 30, 31, 11, 2, 20] },
  { label: "2015", values: [5, 28, 30, 12, 6, 19] },
  { label: "2021", values: [4, 21, 26, 11, 15, 23] },
];
export const TrendScene: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: Z.header.x, top: Z.header.y, ...font("question") }}>夫婦が出会ったきっかけ</div>
    <StackedTrend categories={CATS} rows={TREND} focus={4} x={Z.stage.x} y={Z.stage.y + 20} width={1380} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[0, "normal"], [110, "surprised"]]} />
    <Subtitle lines={[[0, sec(7), "ネットで出会った夫婦は、この30年で0から15%へ。"]]} />
  </>
);

// ---- 静止画：姿勢と小道具の一覧／背景の一覧 ----
const POSES: Pose[] = ["stand", "sit", "phone", "headInHands", "walk"];
const POSE_NAME: Record<Pose, string> = { stand: "立つ", sit: "座る", phone: "スマホ", headInHands: "うつむく", walk: "歩く" };
export const PoseSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Svg>
      {POSES.map((p, i) => (["male", "female", "other"] as Kind[]).map((k, j) => (
        <Figure key={`${p}${k}`} kind={k} pose={p} phase={0.25} x={160 + i * 200 + j * 50} y={330} size={1.6} />
      )))}
      {POSES.map((p, i) => <text key={p} x={210 + i * 200} y={400} textAnchor="middle" style={font("label")}>{POSE_NAME[p]}</text>)}
      <Figure kind="male" x={1300} y={330} size={2} pose="stand" facing={1} />
      <Figure kind="female" x={1400} y={330} size={2} pose="stand" facing={-1} />
      <text x={1350} y={400} textAnchor="middle" style={font("label")}>向き合う</text>
      <Phone x={200} y={760} h={420} screen="list" />
      <Phone x={440} y={760} h={420} screen="like" likes={3} />
      <Phone x={680} y={760} h={420} screen="message" />
      <Table x={960} y={940} size={4} w={60} />
      <Cup x={960} y={940 + tableTop(4)} size={4} />
      <Chair x={1200} y={940} size={4} />
      <Desk x={1400} y={940} size={4} w={50} />
      <Clock x={1640} y={700} r={60} hour={10} minute={10} />
      <Calendar x={1740} y={620} w={140} label="金" />
    </Svg>
  </AbsoluteFill>
);

const KINDS: BackdropKind[] = ["room", "station", "night", "office"];
export const BackdropSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {KINDS.map((k, i) => (
      <div key={k} style={{ position: "absolute", left: (i % 2) * 960, top: Math.floor(i / 2) * 540, width: 1920, height: 1080,
        transform: "scale(0.5)", transformOrigin: "0 0", overflow: "hidden", outline: `4px solid ${C.ink}` }}>
        <Backdrop kind={k} floor={860} variant={i} />
        <Svg><Figure kind={i % 2 ? "female" : "male"} x={800} y={860} size={2.6} pose={i === 2 ? "walk" : "stand"} /></Svg>
        <div style={{ position: "absolute", left: 40, top: 30, ...font("chapter") }}>{k}</div>
      </div>
    ))}
  </AbsoluteFill>
);
