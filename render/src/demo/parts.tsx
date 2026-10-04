// 部品の見本帳（数字はすべて仮）。各場面で部品を1つずつ見せる。
// 情景（駅・部屋・夜の街・職場）→ カメラ → 群衆が分かれる → 予想タイム → ふつうの幅 → 当てはめる表 → もしものつまみ → 日めくり → 折れ線 → 日本地図 → もう一方の側 → 終了画面
import React from "react";
import { BothSides } from "@lib/BothSides";
import { Bracket } from "@lib/Bracket";
import { Camera } from "@lib/Camera";
import { Counter } from "@lib/Counter";
import { Crowd, Person } from "@lib/Crowd";
import { DayReplay } from "@lib/DayReplay";
import { EndScreen } from "@lib/EndScreen";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { blocks, hundred, kinds, scatter } from "@lib/layout";
import { LineChart } from "@lib/LineChart";
import { LookupTable } from "@lib/LookupTable";
import { NormalRange } from "@lib/NormalRange";
import { PREFS, TileMap } from "@lib/TileMap";
import { Quiz } from "@lib/Quiz";
import { SimBackground } from "@lib/SimBackground";
import { Slider } from "@lib/Slider";
import { SourceNote } from "@lib/SourceNote";
import { Subtitle } from "@lib/Subtitle";
import { rng } from "@lib/random";
import { CROWD_SIZE, sec, Z } from "@lib/theme";
import { useCurrentFrame } from "remotion";
import type { EpisodeDef } from "@lib/Episode";
import { AIM_PAIRED, AIM_STOPS, CompareScene, NightScene, OfficeScene, RoomScene, SIM_SECONDS, Sim1000Scene, SimScene, StoryScene, TrendScene } from "./partsStory";

const FAKE = "見本用の仮の数字";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

// ---- 100人 ----
const N = 100;
const base = kinds(N);
const start = scatter(N, { ...Z.stageWithGosa, y: Z.stage.y + 40, h: Z.stage.h - 40 }, 11, CROWD_SIZE);
const HERO = 47;

// 1. カメラ：1人に寄る → 引くと100人の中の1人
const camPeople: Person[] = base.map((kind, i) => ({ kind, from: start[i], highlight: i === HERO, label: i === HERO ? "27番さん（32）" : undefined }));
const CameraScene: React.FC = () => (
  <>
    <Camera keys={[[0, { x: start[HERO].x, y: start[HERO].y - 40, scale: 3 }], [60, { x: 960, y: 540, scale: 1 }]]} dur={40}>
      <Svg><Crowd people={camPeople} /></Svg>
    </Camera>
    <Subtitle lines={[[0, sec(2), "27番さんは、32歳。"], [sec(2), sec(5), "この夜、会場には100人がいました。"]]} />
  </>
);

// 2. 群衆が分かれる：年代の3つの固まり＋人数カウンター
const AGES = [30, 45, 25];
const split = blocks(AGES, { x: 200, bottom: 820, gap: 120, cols: 8, dx: 46 }, CROWD_SIZE);
const splitPeople: Person[] = base.map((kind, i) => ({ kind, from: start[i], to: split.pts[i], delay: Math.round(i * 0.4) }));
const SplitScene: React.FC = () => (
  <>
    <Svg>
      <Crowd people={splitPeople} />
      {split.groups.map((g, k) => <Bracket key={k} x1={g.x1} x2={g.x2} y={g.top - 16} label={["20代", "30代", "40代"][k]} start={50 + k * 6} />)}
    </Svg>
    {split.groups.map((g, k) => <Counter key={k} label="" value={AGES[k]} x={(g.x1 + g.x2) / 2} y={g.top - 190} align="center" start={20} role="value" />)}
    <SourceNote text={FAKE} />
    <Gosa cues={[[10, "normal"]]} />
    <Subtitle lines={[[0, sec(5), "年代で分けると、いちばん多いのは30代です。"]]} />
  </>
);

// 3. 予想タイム
const QuizScene: React.FC = () => (
  <>
    <Quiz question="100人の婚活で、ペアになれるのは？" choices={["約2割", "約4割", "約6割", "約8割"]} answer={1} reveal title="クイズ" />
    <Subtitle lines={[[0, sec(6.5), "あなたの予想は？"]]} />
  </>
);

// 4. ふつうの幅
const RangeScene: React.FC = () => (
  <>
    <NormalRange min={20} max={45} step={5} lo={27} hi={34} mid={30} unit="歳" note="真ん中の半分の人が入る幅" you={32} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[10, "thinking"]]} />
    <Subtitle lines={[[0, sec(6), "あなたは、ふつうの幅の中？外？"]]} />
  </>
);

// 5. 自分に当てはめる表
const TableScene: React.FC = () => (
  <>
    <LookupTable rowLabel="年齢" colLabel="年収" rows={["20代", "30代", "40代"]} cols={["〜400万", "400〜600万", "600万〜"]}
      values={[["2割", "3割", "4割"], ["3割", "4割", "5割"], ["2割", "3割", "4割"]]} target={[1, 1]} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[10, "normal"], [115, "point"]]} reachTo={{ x: 1060, y: 520 }} />
    <Subtitle lines={[[0, sec(5), "自分の年齢と年収のマスを探してみてください。"]]} />
  </>
);

// 6. もしものつまみ：条件を動かすと、色の付く人数が変わる
// 目盛りごとの人数は、シミュレーション（sim/matching.ts）で計算した値
const STOPS = AIM_STOPS.map((s) => s.label), PAIRED = AIM_PAIRED;
const SLIDE_KEYS: [number, number][] = [[0, 0], [40, 1], [80, 2], [120, 3]];
const grid = hundred(N, { x: 180, bottom: 840, cols: 20, dx: 50, dy: 76 }, CROWD_SIZE);
const SliderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const k = [...SLIDE_KEYS].reverse().find(([f]) => frame >= f + 8)?.[1] ?? 0;
  return (
    <>
      <SimBackground />
      <Svg>{grid.map((p, i) => <Figure key={i} kind={base[i]} x={p.x} y={p.y} size={CROWD_SIZE} dim={i >= PAIRED[k]} />)}</Svg>
      <Slider label="受け入れる相手の基準" stops={STOPS} keys={SLIDE_KEYS} x={180} y={330} w={900} />
      <HeroNumber value={PAIRED[k]} unit="人" x={1260} y={420} from={PAIRED[Math.max(0, k - 1)]} start={SLIDE_KEYS[k][0] + 8} duration={20} />
      <SourceNote sim />
      <Gosa cues={[[0, "thinking"], [130, "depends"]]} />
      <Subtitle lines={[[0, sec(6), "条件を動かすと、ペアの数はここまで変わります。"]]} />
    </>
  );
};

// 7. 日めくり
const DayScene: React.FC = () => (
  <>
    <DayReplay days={["1日目", "2日目", "3日目", "4日目", "5日目"]} perDay={30} x={300} y={300} />
    <HeroNumber value={5} unit="人" prefix="出会い " x={1000} y={560} start={130} />
    <Gosa cues={[[10, "normal"]]} />
    <Subtitle lines={[[0, sec(5.5), "1日ずつ、27番さんの1週間を再現します。"]]} />
  </>
);

// 8. 折れ線
const years = [1980, 1990, 2000, 2010, 2020];
const LineScene: React.FC = () => (
  <>
    <LineChart x={200} y={300} width={1000} height={460} xDomain={[1980, 2020]} yDomain={[20, 35]} xTicks={years}
      format={(v) => `${v.toFixed(1)}歳`} eras={[{ x: 2000, label: "ネット婚活" }]}
      series={[
        { label: "男性", points: years.map((y, i) => [y, 27.8 + i * 0.9]), color: "#2F6FDE", focus: true },
        { label: "女性", points: years.map((y, i) => [y, 25.2 + i * 1.1]), color: "#D9541E", focus: true },
      ]} />
    <SourceNote text={FAKE} x={200} />
    <Gosa cues={[[10, "normal"], [70, "surprised"]]} />
    <Subtitle lines={[[0, sec(2.5), "初めて結婚する年齢は、"], [sec(2.5), sec(6), "40年で約4歳上がりました。"]]} />
  </>
);

// 9. 日本地図
const r = rng(5);
const prefValues = Object.fromEntries(PREFS.map(([n]) => [n, Math.round(20 + r() * 25)]));
const MapScene: React.FC = () => (
  <>
    <TileMap values={prefValues} x={200} y={186} breaks={[25, 30, 35, 40]} focus="東京" format={(v) => `${v}%`} legend="未婚率（30代）" />
    <SourceNote text={FAKE} />
    <Gosa cues={[[10, "normal"]]} />
    <Subtitle lines={[[0, sec(6), "都道府県で比べると、こうなります。"]]} />
  </>
);

// 10. もう一方の側
const BothScene: React.FC = () => (
  <>
    <BothSides title="結婚相手に求める条件（あてはまると答えた人）" max={100}
      rows={[{ label: "人柄", male: 92, female: 95 }, { label: "収入", male: 40, female: 75 }, { label: "容姿", male: 70, female: 55 }]} />
    <SourceNote text={FAKE} />
    <Gosa cues={[[10, "normal"]]} />
    <Subtitle lines={[[0, sec(5), "同じ質問を、男女の両方で比べます。"]]} />
  </>
);

// 11. 終了画面（本番は20秒）
const EndScene: React.FC = () => <EndScreen lesson={"同じ100人でも、\n線の引き方で\n答えは変わる。"} />;

export const parts: EpisodeDef = {
  id: "parts",
  title: "部品の見本帳",
  scenes: [
    { id: "story", seconds: 6, Scene: StoryScene },
    { id: "room", seconds: 5, Scene: RoomScene },
    { id: "night", seconds: 5, Scene: NightScene },
    { id: "office", seconds: 4, Scene: OfficeScene },
    { id: "camera", seconds: 5, Scene: CameraScene },
    { id: "split", seconds: 5, Scene: SplitScene },
    { id: "quiz", seconds: 6.5, Scene: QuizScene },
    { id: "range", seconds: 6, Scene: RangeScene },
    { id: "table", seconds: 5.5, Scene: TableScene },
    { id: "sim", seconds: SIM_SECONDS, Scene: SimScene },
    { id: "slider", seconds: 6, Scene: SliderScene },
    { id: "compare", seconds: SIM_SECONDS, Scene: CompareScene },
    { id: "sim1000", seconds: SIM_SECONDS, Scene: Sim1000Scene },
    { id: "days", seconds: 6, Scene: DayScene },
    { id: "line", seconds: 6, Scene: LineScene },
    { id: "trend", seconds: 7, Scene: TrendScene },
    { id: "map", seconds: 6, Scene: MapScene },
    { id: "both", seconds: 5, Scene: BothScene },
    { id: "end", seconds: 6, Scene: EndScene },
  ],
};
