// 1本目 v2「アプリで出会いは増えたのに、なぜ結婚は増えないのか」（台本は script-v2.md、型は なぜ×100人のシミュレーション）。
// 第6稿（答え合わせの型）は Episode.tsx のまま残す。動画の id は 001-where-couples-meet-v2。
// シミュレーションは render/src/lib/sim/towns.ts（種22。結果の一覧は ../sim-v2.md）、描画は render/src/lib/TownsSim.tsx。
// 場面の中は「区切り（Beat）」で10〜20秒ごとに絵を替える。区切りの時刻は読み上げの語（useNarration().find）に合わせる。
// 蛍光ペンの黄は使わない（2026-10-05 オーナー「見えない」）。強調は墨の下線・墨の札。
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, WALL_FREE } from "@lib/Backdrop";
import { Camera } from "@lib/Camera";
import { ChannelTag } from "@lib/Cards";
import { ChapterCard, ChapterDots } from "@lib/Chapter";
import { Crowd, Person } from "@lib/Crowd";
import { EndScreen } from "@lib/EndScreen";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { FOOT, hundred, scatter } from "@lib/layout";
import { LineChart } from "@lib/LineChart";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { Clock, Cup, Phone, Table, tableTop } from "@lib/Props";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { Heart, heartRowLayout, HeartRows, homes, PairPanel, Tag, Town } from "@lib/TownsSim";
import { likesReceived, makeResidents, simulateApp, simulateIntro } from "@lib/sim/towns";
import { C, EASE, font, LINE, R, sp, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";
import timing from "../timing-v2.json";

// ---------- シミュレーション（種22。sim-v2.md） ----------
const SEED = 22;
const RS = makeResidents(SEED);
const INTRO = simulateIntro(RS, {}, SEED);
const APP = simulateApp(RS, {}, SEED);
const NO_AIM = simulateApp(RS, { aim: 0 }, SEED);
const NO_RAISE = simulateApp(RS, { raise: 0 }, SEED);
const HALF_RAISE = simulateApp(RS, { raise: 0.1 }, SEED);
const NO_VOUCH = simulateIntro(RS, { tolerance: 0 }, SEED);
const RECEIVED = likesReceived(APP);
const HIM = 6, HER = 35;
const TAGS: Tag[] = [{ id: HIM, label: "彼（32）" }, { id: HER, label: "彼女（30）" }];
const HER_SENT = [...new Set(APP.months.flatMap((m) => m.likes!.filter(([p]) => p === HER).map(([, q]) => q)))];
const sentBy = (id: number) => APP.months.reduce((s, m) => s + m.likes!.filter(([p]) => p === id).length, 0);
const STAGE = { x: 96, y: 200, w: 1728, h: 660 };
const SIM_NOTE = "仮定の世界。紹介の町の「保証」の仮定は根拠が弱い";
/** シミュレーションの札＋仮定の断り書き（画面の隅） */
const SimNote: React.FC = () => <SourceNote sim text={SIM_NOTE} prefix="" />;

// ---------- 共通 ----------
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
);

const useCue = () => {
  const n = useNarration();
  const find = (word: string, fallback: number) => { try { return n.find(word); } catch { return fallback; } };
  return { n, find, end: n.end() };
};

const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) =>
  to > from ? <Sequence from={from} durationInFrames={to - from}>{children}</Sequence> : null;

/** 墨の札（見出し・条件） */
const Tag_: React.FC<{ x: number; y: number; text: string; start?: number; light?: boolean }> = ({ x, y, text, start = 0, light }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: t, transform: `translateY(${(1 - t) * 16}px)`, whiteSpace: "nowrap",
      ...font("label", light ? C.ink : C.white), background: light ? C.paper2 : C.ink, borderRadius: R.sm, padding: "4px 16px" }}>{text}</div>
  );
};

/** 箇条の札（ルールの説明）。1行ずつ入る */
const Rules: React.FC<{ x: number; y: number; items: string[]; gap?: number; start?: number; every?: number }> = ({ x, y, items, gap = 18, start = 0, every = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: "column", gap }}>
      {items.map((it, k) => {
        const t = sp("enter", frame - start - k * every, fps);
        return <div key={k} style={{ ...font("label"), opacity: t, transform: `translateX(${(1 - t) * -20}px)`, whiteSpace: "nowrap",
          background: C.white, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.md, padding: "8px 20px" }}>{it}</div>;
      })}
    </div>
  );
};

/** 大きな数字＋単位（墨の下線つき） */
const BigCount: React.FC<{ x: number; y: number; value: number; unit: string; label?: string; start?: number; from?: number }> = (
  { x, y, value, unit, label, start = 0, from = 0 },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - start, [0, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const pop = sp("pop", frame - start - 36, fps);
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap" }}>
      {label && <div style={font("label", C.ink2)}>{label}</div>}
      <div style={{ ...font("hero"), lineHeight: 1, display: "inline-block", borderBottom: `10px solid rgba(29,35,51,${pop})`, paddingBottom: 6 }}>
        {Math.round(from + (value - from) * p)}<span style={{ fontSize: 96 }}>{unit}</span>
      </div>
    </div>
  );
};

/** 吹き出し（考えていること）。tail は吹き出しのしっぽの先 */
const Thought: React.FC<{ x: number; y: number; text: string; tail: [number, number]; start?: number }> = ({ x, y, text, tail, start = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  if (frame < start) return null;
  return (
    <>
      <Svg>
        <g opacity={t}>
          <circle cx={tail[0]} cy={tail[1]} r={8} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <circle cx={(tail[0] * 2 + x) / 3} cy={(tail[1] * 2 + y + 60) / 3} r={13} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: x, top: y, opacity: t, ...font("sub"), background: C.white, border: `${LINE.thin}px solid ${C.ink}`,
        borderRadius: 60, padding: "18px 40px", whiteSpace: "nowrap" }}>{text}</div>
    </>
  );
};

/** 問いの見出し（2行。行の切れ目は \n で決める。Question は自動で折り返すので、語の途中で切れることがある） */
const Headline: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <div style={{ position: "absolute", left: Z.header.x, top: Z.header.y, ...font("question"), lineHeight: 1.3, whiteSpace: "pre",
      opacity: t, transform: `translateY(${(1 - t) * -24}px)`, background: "rgba(245,242,234,.85)", padding: "4px 12px 8px 0" }}>{text}</div>
  );
};

/** 紹介の町のふたり：それぞれ、引き合わせた人の隣で、相手と向かい合う */
const Introduced: React.FC = () => {
  const s = 3.2, floor = 820;
  const scene = (x: number, me: "male" | "female", tag: string, by: string) => (
    <g>
      <Table x={x} y={floor} size={s} w={70} />
      <Cup x={x - 40} y={floor + tableTop(s)} size={s} />
      <Figure kind={me} x={x - 150} y={floor} size={s} pose="sit" facing={1} />
      <Figure kind={me === "male" ? "female" : "male"} x={x + 150} y={floor} size={s} pose="sit" facing={-1} />
      <Figure kind="other" x={x} y={floor - 230} size={2} />
      <text x={x - 150} y={floor - 200} textAnchor="middle" style={font("label")}>{tag}</text>
      <text x={x} y={floor - 340} textAnchor="middle" style={font("label", C.ink2)}>{by}</text>
    </g>
  );
  return (
    <>
      <Backdrop kind="room" floor={floor} variant={2} />
      <Svg>
        {scene(520, "female", "彼女（30）", "友人の紹介")}
        {scene(1400, "male", "彼（32）", "職場の知り合いの紹介")}
      </Svg>
      <Tag_ x={96} y={80} text="紹介の町では" />
    </>
  );
};

// ---------- 冒頭の物語 ----------
const S = 6; // 寄りの絵の人物の大きさ
const FLOOR = 860;

/** 夜の部屋でスマホを見る1人。hearts は周りに出る通知のハートの数（時間とともに増える） */
const NightRoom: React.FC<{ kind: "male" | "female"; label: string; hearts?: number; heartsFrom?: number; heartsEvery?: number }> = (
  { kind, label, hearts = 0, heartsFrom = 0, heartsEvery = 10 },
) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(hearts, Math.floor((frame - heartsFrom) / heartsEvery) + 1));
  const spots = scatter(hearts, { x: 1060, y: 230, w: 640, h: 420 }, 9, 1.2);
  return (
    <>
      <Backdrop kind="room" floor={FLOOR} variant={kind === "male" ? 3 : 4} />
      <Svg>
        <Clock x={WALL_FREE.x1 * 1920} y={250} r={50} hour={23} minute={0} />
        <Figure kind={kind} x={700} y={FLOOR} size={S} pose="phone" />
        <text x={700} y={FLOOR - 330} textAnchor="middle" style={font("label")}>{label}</text>
        {spots.slice(0, n).map((p, i) => <Heart key={i} x={p.x} y={p.y - 30} r={22} fill={C.male} />)}
      </Svg>
    </>
  );
};

const Opening: React.FC = () => {
  const { find, end } = useCue();
  const sent = find("8件", 120);
  const got = find("1件だけ", 200);
  const her = find("同じころ", 400);
  const her15 = find("15件", 520);
  const think = find("もっといい人", 650);
  const both = find("ふたりは", 800);
  return (
    <>
      <Beat from={0} to={her}>
        <Camera keys={[[0, { x: 960, y: 560, scale: 1.12 }], [60, { x: 960, y: 540, scale: 1 }]]} dur={90}>
          <NightRoom kind="male" label="彼（32）" />
        </Camera>
        <Svg><Phone x={1180} y={520} h={460} screen="list" /></Svg>
        <Beat from={sent} to={her}>
          <Rules x={1400} y={650} items={["送った 8件"]} />
        </Beat>
        <Beat from={got} to={her}>
          <Rules x={1400} y={740} items={["届いた 1件"]} />
        </Beat>
      </Beat>
      <Beat from={her} to={both}>
        <Camera keys={[[0, { x: 960, y: 540, scale: 1 }]]} drift={both - her}>
          <NightRoom kind="female" label="彼女（30）" hearts={15} heartsFrom={her15 - her - 60} heartsEvery={4} />
        </Camera>
        <Beat from={her15 - her} to={both - her}><Rules x={1500} y={700} items={["届いた 15件"]} /></Beat>
        <Thought x={140} y={240} text="もっといい人が、いるかも" tail={[600, 470]} start={think - her} />
      </Beat>
      <Beat from={both} to={end + 30}>
        <OpeningTown />
      </Beat>
      <ChannelTag />
    </>
  );
};

/** 引くと、同じ町の100人の中の2人 */
const OpeningTown: React.FC = () => {
  const { pts } = homes(APP, { x: STAGE.x, y: STAGE.y + 40, w: STAGE.w, h: STAGE.h - 40 }, 1.05, 5);
  const people: Person[] = RS.map((a) => ({ kind: a.kind, from: pts[a.id], pose: a.id % 3 === 0 ? "phone" : "stand",
    highlight: a.id === HIM || a.id === HER, label: TAGS.find((t) => t.id === a.id)?.label }));
  const mid = { x: (pts[HIM].x + pts[HER].x) / 2, y: (pts[HIM].y + pts[HER].y) / 2 };
  return (
    <Camera keys={[[0, { x: mid.x, y: mid.y - 40, scale: 2.2 }], [30, { x: 960, y: 540, scale: 1 }]]} dur={60}>
      <Svg><Crowd people={people} size={1.05} /></Svg>
    </Camera>
  );
};

// ---------- 最初の数字 ----------
/** 100人（10×10）。color の人数だけ色、ほかは薄い色。from→to へ数が変わる */
const Hundred: React.FC<{ x: number; bottom: number; from: number; to: number; start?: number; fade?: boolean }> = ({ x, bottom, from, to, start = 0, fade }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const n = Math.round(from + (to - from) * p);
  const pts = hundred(100, { x, bottom }, 1.0);
  return (
    <Svg>
      {pts.map((pt, i) => {
        const kind = i % 2 === 0 ? "male" : "female";
        // fade：残る人は色、消える人は薄く（数え直しで減る）。そうでなければ、数えた人だけ色
        const on = fade ? i < n : i < n;
        return <Figure key={i} kind={kind} x={pt.x} y={pt.y} size={1.0} dim={!on} />;
      })}
    </Svg>
  );
};

const Hook: React.FC = () => {
  const { find, end } = useCue();
  const down = find("それなのに", 200);
  const q = find("出会いは増えたのに", 600);
  return (
    <>
      <Beat from={0} to={down}>
        <Tag_ x={96} y={80} text="ネットで出会った夫婦（100組あたり）" />
        <Hundred x={160} bottom={840} from={11} to={20} start={70} />
        <div style={{ position: "absolute", left: 760, top: 300, ...font("value") }}>11組 → 20組</div>
        <div style={{ position: "absolute", left: 760, top: 390, ...font("label", C.ink2) }}>2021年の調査 → 2025年の調査</div>
        <div style={{ position: "absolute", left: 760, top: 470, ...font("sub") }}>割合は、ほぼ倍に</div>
        <SourceNote text="社人研「第17回出生動向基本調査」(2025) 図表5-3（11.0%→20.2%）" />
      </Beat>
      <Beat from={down} to={q}>
        <Tag_ x={96} y={80} text="初めてどうしの結婚（1年あたり）" />
        <Hundred x={160} bottom={840} from={100} to={75} start={50} fade />
        <div style={{ position: "absolute", left: 760, top: 300, ...font("value") }}>約49万組 → 約37万組</div>
        <div style={{ position: "absolute", left: 760, top: 390, ...font("label", C.ink2) }}>2010〜14年の平均 → 2020〜24年の平均</div>
        <div style={{ position: "absolute", left: 760, top: 470, ...font("sub") }}>四分の一ほど減った</div>
        <SourceNote text="厚生労働省「人口動態統計」夫妻とも初婚の婚姻件数" />
      </Beat>
      <Beat from={q} to={end + 30}>
        <WalkingTown />
        <Headline text={"出会いは増えたのに、\nなぜ結婚は増えないのか"} />
      </Beat>
    </>
  );
};

/** 問いの画面の後ろで、町の人がゆっくり歩き、ハートが飛ぶ */
const WalkingTown: React.FC = () => {
  const frame = useCurrentFrame();
  const a = homes(APP, { x: 96, y: 420, w: 1728, h: 440 }, 1.05, 7).pts;
  const b = homes(APP, { x: 96, y: 420, w: 1728, h: 440 }, 1.05, 8).pts;
  const people: Person[] = RS.map((r) => ({ kind: r.kind, from: a[r.id], to: b[r.id], pose: "walk", delay: r.id % 30, dim: true }));
  const likes = APP.months[0].likes!.filter((_, k) => k % 12 === 0);
  const t = (frame % 90) / 90;
  return (
    <Svg>
      <Crowd people={people} start={10} size={1.05} />
      {likes.map(([p, q], k) => {
        const u = (t + k * 0.13) % 1;
        const x = b[p].x + (b[q].x - b[p].x) * u, y = b[p].y - 50 + (b[q].y - b[p].y) * u - Math.sin(u * Math.PI) * 60;
        return <Heart key={k} x={x} y={y} r={9} fill={RS[p].kind === "male" ? C.male : C.female} opacity={0.8} />;
      })}
    </Svg>
  );
};

// ---------- 予想タイム（実験の説明） ----------
/** 魅力の点数：1人を、3人が少しずつ違う点数で見ている（好みは人それぞれ） */
const ScoreIdea: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - 40, fps);
  const views = [{ x: 480, v: 0.62 }, { x: 960, v: 0.74 }, { x: 1440, v: 0.55 }];
  return (
    <Svg>
      <Figure kind="female" x={960} y={470} size={4.2} />
      <text x={960} y={225} textAnchor="end" dx={-120} style={font("label")}>魅力の点数</text>
      <rect x={1000} y={196} width={300} height={34} rx={17} fill={C.paper2} />
      <rect x={1000} y={196} width={300 * 0.64} height={34} rx={17} fill={C.ink} />
      {views.map((w, i) => (
        <g key={i} opacity={t}>
          <path d={`M${w.x} ${700} L${960 + (w.x - 960) * 0.25} ${500}`} stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="8 10" />
          <rect x={w.x - 110} y={560} width={220} height={28} rx={14} fill={C.paper2} />
          <rect x={w.x - 110} y={560} width={220 * w.v} height={28} rx={14} fill={C.ink2} />
          <Figure kind="male" x={w.x} y={840} size={2.4} />
        </g>
      ))}
      <text x={960} y={650} textAnchor="middle" opacity={t} style={font("label", C.ink2)}>見る人によって、少しずれる</text>
    </Svg>
  );
};

const QuizSetup: React.FC = () => {
  const { find, end } = useCue();
  const left = find("左は", 500);
  const right = find("右は", 1000);
  const men = find("送る数は", 1400);
  const both = find("両思い", 1700);
  const half = { x: 96, y: 210, w: 1080, h: 640 };
  return (
    <>
      <SimBackground />
      <Beat from={0} to={left}>
        <Tag_ x={96} y={80} text="同じ100人を、ふたつの町に住ませる" />
        <ScoreIdea />
      </Beat>
      <Beat from={left} to={right}>
        <Town result={INTRO} box={{ ...half }} at={0} title="紹介の町" split={1.0} />
        <Rules x={1260} y={260} start={60} every={50} items={["知り合いの輪の中だけ", "世話役が月にひと組", "「この人いいよ」", "保証があるので", "少し下でも会う"]} />
      </Beat>
      <Beat from={right} to={end + 30}>
        <Town result={APP} box={{ ...half }} at={0} title="アプリの町" split={1.0} />
        <Rules x={1260} y={260} start={40} every={40} items={["全員が全員を見られる", "少し上にだけいいね"]} />
        <Beat from={men - right} to={end + 30 - right}><Rules x={1260} y={440} items={["男性 月8件まで", "女性 月3件まで"]} /></Beat>
        <Beat from={both - right} to={end + 30 - right}><Rules x={1260} y={620} items={["両思いでペア"]} /></Beat>
        <Beat from={men - right} to={end + 30 - right}><SourceNote x={96} sim text="最初の連絡の81%は男性（Bruch & Newman 2018、米国4都市）" /></Beat>
      </Beat>
    </>
  );
};

const QuizAsk: React.FC = () => {
  const { end } = useCue();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <>
      <SimBackground />
      <div style={{ position: "absolute", left: Z.header.x, top: 40, opacity: t }}>
        <div style={{ display: "inline-block", background: C.ink, borderRadius: R.md, padding: "4px 20px", ...font("label", C.white) }}>予想タイム</div>
        <div style={{ ...font("question"), marginTop: 10 }}>1年後、カップルが多いのはどっち？</div>
      </div>
      <Town result={INTRO} box={{ x: 96, y: 290, w: 820, h: 580 }} at={0} title="A　紹介の町" size={0.8} split={1.0} />
      <Town result={APP} box={{ x: 1000, y: 290, w: 820, h: 580 }} at={0} title="B　アプリの町" size={0.8} split={1.0} />
      <SourceNote sim />
      <Gosa cues={[[20, "thinking"]]} size="S" x={1700} foot={230} sfx={false} />
      <Beat from={0} to={end + 30}><></></Beat>
    </>
  );
};

// ---------- 第1章：紹介の町 ----------
const Ch1Card: React.FC = () => <ChapterCard no={1} title="紹介の町" />;
const Ch2Card: React.FC = () => <ChapterCard no={2} title="アプリの町" />;
const Ch3Card: React.FC = () => <ChapterCard no={3} title="なぜ逆になるのか" />;

const FPM1 = 150;
const Ch1: React.FC = () => {
  const { find, end } = useCue();
  const m1 = find("ひと月目", 0);
  const you = find("ご自分の周り", 700);
  return (
    <>
      <SimBackground />
      <Town result={INTRO} box={STAGE} start={m1} fpm={FPM1} upto={6} title="紹介の町" />
      <Beat from={you} to={end + 30}>
        <div style={{ position: "absolute", left: 640, top: 40, ...font("label"), background: C.white, border: `${LINE.thin}px solid ${C.ink}`,
          borderRadius: R.md, padding: "10px 22px", lineHeight: 1.4, whiteSpace: "pre" }}>{"あなたに「いい人がいるんだけど」と\n言ってくれる人は、何人？"}</div>
      </Beat>
      <SimNote />
      <ChapterDots current={1} />
    </>
  );
};

const Ch1End: React.FC = () => {
  const { find, end } = useCue();
  const total = find("27組", 400);
  const half = find("半分を少し", 550);
  return (
    <>
      <SimBackground />
      <Town result={INTRO} box={STAGE} start={-6 * 45} fpm={45} upto={12} title="紹介の町" dimSingles={false} />
      <Beat from={half} to={end + 30}>
        <div style={{ position: "absolute", left: 1290, top: 760, ...font("label") }}>100人のうち54人に相手</div>
      </Beat>
      <SimNote />
      <ChapterDots current={1} />
      <Beat from={total} to={end + 30}><></></Beat>
    </>
  );
};

// ---------- 第2章：アプリの町 ----------
const Ch2: React.FC = () => {
  const { find, end } = useCue();
  const m1 = find("ひと月目", 0);
  const fast = find("倍の速さ", 300);
  return (
    <>
      <SimBackground />
      <Town result={APP} box={STAGE} start={m1} fpm={180} upto={1} title="アプリの町" maxHearts={60} />
      <Beat from={fast} to={end + 30}><Rules x={1290} y={700} items={["紹介の町の1か月目は 5組"]} /></Beat>
      <SimNote />
      <ChapterDots current={2} />
    </>
  );
};

const ROWS = { x: 96, y: 240, w: 1728, h: 540 };
const Ch2Hearts: React.FC = () => {
  const { find, end } = useCue();
  const pile = find("ハートは", 300);
  const top = find("ひと握り", 500);
  const real = find("実際のアプリ", 650);
  const town = homes(APP, { x: STAGE.x, y: STAGE.y + 96, w: STAGE.w * 0.66 - 24, h: STAGE.h - 96 }, 1.05).pts;
  // ペアの置き場にいる人も、いったん家の位置から並び直す（絵を簡単にするため、並び直しは家から）
  return (
    <>
      <SimBackground />
      <Beat from={0} to={pile}>
        <Town result={APP} box={STAGE} start={-1 * 40} fpm={40} upto={12} title="アプリの町" maxHearts={30} />
      </Beat>
      <Beat from={pile} to={end + 30}>
        <Tag_ x={96} y={80} text="受け取ったいいね（1年分）の多い順" />
        <div style={{ position: "absolute", left: 96, top: 150, ...font("label", C.ink2) }}>上の列＝女性、下の列＝男性。ハート1つ＝15件</div>
        <HeartRows result={APP} received={RECEIVED} box={ROWS} from={town} start={0} dur={150} bracketTop={top - pile > 0 ? 8 : 0} />
      </Beat>
      <Beat from={real} to={end + 30}>
        <SourceNote x={96} y={884} text="実際のアプリ：いいねの半分を、男性は上位15%、女性は上位25%が受け取る（Hinge 2017、米国）" />
      </Beat>
      <ChapterDots current={2} />
    </>
  );
};

/** 並べ直した列の中の1人だけを残して、ほかを薄くする（寄ると名札とハートが重なるので、寄らずに薄くする） */
const RowsFocus: React.FC<{ id: number; card: string[]; arrows?: number[]; arrowsFrom?: number }> = ({ id, card, arrows, arrowsFrom = 0 }) => (
  <>
    <SimBackground />
    <HeartRows result={APP} received={RECEIVED} box={ROWS} start={-400} tags={TAGS.filter((t) => t.id === id)} focus={id}
      lines={arrows ? { from: id, to: arrows, start: arrowsFrom } : undefined} />
    <Rules x={1380} y={60} items={card} every={30} start={30} />
  </>
);

const Ch2Him: React.FC = () => {
  const { find } = useCue();
  const zero = find("両思いは", 400);
  return (
    <>
      <RowsFocus id={HIM} card={[`送った ${sentBy(HIM)}件`, `届いた ${RECEIVED.get(HIM)}件`]} />
      <Beat from={zero} to={zero + 600}><Rules x={1380} y={200} items={["両思い 0"]} /></Beat>
      <SimNote />
    </>
  );
};

const Ch2Her: React.FC = () => {
  const { find } = useCue();
  const up = find("自分より上に見える", 400);
  const zero = find("両思いは", 800);
  return (
    <>
      <RowsFocus id={HER} card={[`届いた ${RECEIVED.get(HER)}件`, `送った ${sentBy(HER)}件`]} arrows={HER_SENT} arrowsFrom={up} />
      <Beat from={zero} to={zero + 600}><Rules x={1380} y={200} items={["両思い 0"]} /></Beat>
      <SimNote />
    </>
  );
};

// ---------- 答え合わせ（予想の答え） ----------
const Verdict: React.FC = () => {
  const { find, end } = useCue();
  const ans = find("答えは", 300);
  const race = find("最初こそ", 500);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = sp("pop", frame - ans, fps);
  const line = (r: typeof APP) => [[0, 0] as [number, number], ...r.months.map((m) => [m.month, m.pairs.length] as [number, number])];
  return (
    <>
      <SimBackground />
      <Beat from={0} to={race}>
        <Town result={INTRO} box={{ x: 96, y: 200, w: 820, h: 660 }} at={12} title="A　紹介の町" size={0.8} split={0.66} compact />
        <Town result={APP} box={{ x: 1000, y: 200, w: 820, h: 660 }} at={12} title="B　アプリの町" size={0.8} split={0.66} compact />
        {frame >= ans && (
          <div style={{ position: "absolute", left: 96 - 16, top: 184, width: 852, height: 692, border: `${LINE.heavy}px solid ${C.ink}`,
            borderRadius: R.lg, transform: `scale(${0.96 + 0.04 * stamp})` }} />
        )}
      </Beat>
      <Beat from={race} to={end + 30}>
        <Tag_ x={96} y={80} text="ペアの数（累計）。横は何か月目か" />
        <LineChart x={220} y={240} width={1240} height={560} xDomain={[0, 12]} yDomain={[0, 30]} xTicks={[1, 3, 6, 9, 12]}
          format={(v) => `${v}組`} series={[
            { label: "紹介の町", points: line(INTRO), color: C.ink, focus: true },
            { label: "アプリの町", points: line(APP), color: C.ink2 },
          ]} duration={90} />
      </Beat>
      <SimNote />
      <Gosa cues={[[ans - 6, "surprised"]]} size="S" sfx={false} />
    </>
  );
};

// ---------- 第3章：なぜ逆になるのか ----------
/** 少し上を狙う：点数の順に並んだ10人が、それぞれ少し上の人へハートを送る */
const AimUp: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const n = 9;
  const pts = Array.from({ length: n }, (_, i) => ({ x: 260 + i * 150, y: 820 - i * 52 }));
  return (
    <Svg>
      <line x1={180} y1={850} x2={1640} y2={850} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={1650} y={420} style={font("label", C.ink2)}>点数が高い</text>
      {pts.map((p, i) => <Figure key={i} kind={i % 2 ? "female" : "male"} x={p.x} y={p.y} size={1.6} />)}
      {pts.slice(0, n - 2).map((p, i) => {
        const b = pts[i + 2];
        const u = interpolate(frame - start - i * 8, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const x = p.x + (b.x - p.x) * u, y = p.y - 100 + (b.y - p.y) * u - Math.sin(u * Math.PI) * 70;
        return (
          <g key={i}>
            <path d={`M${p.x} ${p.y - 100} Q${(p.x + b.x) / 2} ${(p.y + b.y) / 2 - 170} ${b.x} ${b.y - 100}`} fill="none" stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="8 8" />
            <Heart x={x} y={y} r={14} fill={i % 2 ? C.female : C.male} />
          </g>
        );
      })}
    </Svg>
  );
};

/** 基準が上がる：届いたハートが増えるほど、受け入れる線が上がる */
const BarRises: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = Math.round(p * 24);
  const bar = 700 - Math.log2(1 + n * 6) * 52;
  return (
    <Svg>
      <Figure kind="female" x={560} y={840} size={4} highlight={false} />
      {Array.from({ length: n }, (_, i) => <Heart key={i} x={820 + (i % 6) * 46} y={820 - Math.floor(i / 6) * 44} r={18} fill={C.male} />)}
      <line x1={1180} y1={bar} x2={1700} y2={bar} stroke={C.ink} strokeWidth={LINE.base} />
      <text x={1180} y={bar - 20} style={font("label")}>受け入れる基準</text>
      <text x={820} y={820 - Math.ceil(Math.max(n, 1) / 6) * 44 - 6} style={font("label", C.ink2)}>届いたいいね</text>
    </Svg>
  );
};

/** 論文の札（左上）。どの研究か：著者・年・雑誌・対象 */
const PaperTag: React.FC<{ title: string; meta: string }> = ({ title, meta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <div style={{ position: "absolute", left: 96, top: 56, opacity: t, display: "flex", gap: 20, alignItems: "center", whiteSpace: "nowrap" }}>
      <div style={{ ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "4px 16px" }}>論文</div>
      <div>
        <div style={font("sub")}>{title}</div>
        <div style={font("note", C.ink2)}>{meta}</div>
      </div>
    </div>
  );
};

/** Bruch & Newman (2018) の模式図：望ましさのはしご。自分から上へ連絡が向かい、上ほど返事が来にくい */
const BruchLadder: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 620, top = 230, bottom = 840;
  const yOf = (pct: number) => bottom - (bottom - top) * pct; // 0〜1（望ましさの順位）
  const me = 0.42, aim = 0.62;
  const arrow = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const replies = [0.5, 0.62, 0.74, 0.86];
  return (
    <Svg>
      <line x1={x} y1={top} x2={x} y2={bottom} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={x - 30} y1={yOf(i / 10)} x2={x + 30} y2={yOf(i / 10)} stroke={C.ink} strokeWidth={LINE.thin} />)}
      <text x={x - 60} y={top + 12} textAnchor="end" style={font("label", C.ink2)}>望ましい</text>
      <text x={x - 60} y={bottom + 12} textAnchor="end" style={font("label", C.ink2)}>そうでもない</text>
      <Figure kind="male" x={x - 110} y={yOf(me) + 30} size={1.8} />
      <text x={x - 160} y={yOf(me) + 12} textAnchor="end" style={font("label")}>自分</text>
      <path d={`M${x + 50} ${yOf(me)} Q${x + 170} ${(yOf(me) + yOf(aim)) / 2} ${x + 50} ${yOf(me) + (yOf(aim) - yOf(me)) * arrow}`} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      {arrow > 0.95 && <text x={x + 150} y={(yOf(me) + yOf(aim)) / 2 + 14} style={font("sub")}>平均で約25%上へ</text>}
      {/* 返事：上の相手ほど来にくい（模式図。太さと濃さで見せる） */}
      {replies.map((r, i) => {
        const t = interpolate(frame, [80 + i * 12, 100 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const strength = 1 - i * 0.28;
        return (
          <g key={i} opacity={t}>
            <rect x={1240} y={yOf(r) - 22} width={300 * strength} height={36} rx={18} fill={C.ink2} opacity={0.35 + 0.65 * strength} />
            <text x={1240 + 300 * strength + 16} y={yOf(r) + 12} style={font("label", C.ink2)}>{i === 0 ? "返事が来やすい" : i === replies.length - 1 ? "来にくい" : ""}</text>
          </g>
        );
      })}
      <text x={1240} y={yOf(0.97)} style={font("label")}>相手が上であるほど</text>
      <text x={1240} y={bottom + 12} style={font("note", C.ink2)}>模式図（論文の結果をもとに描いたもの）</text>
    </Svg>
  );
};

/** ひと月に約1500通：1人のもとに封筒が降り積もる */
const MailRain: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(1504, Math.round(interpolate(frame, [10, 120], [0, 1504], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE })));
  const pile = Math.min(60, Math.round(n / 25));
  return (
    <>
      <Svg>
        <Figure kind="female" x={560} y={840} size={4} />
        {Array.from({ length: pile }, (_, i) => {
          const col = i % 10, row = Math.floor(i / 10);
          return <rect key={i} x={760 + col * 52} y={800 - row * 40} width={44} height={30} rx={4} fill={C.white} stroke={C.ink} strokeWidth={3} />;
        })}
      </Svg>
      <div style={{ position: "absolute", left: 1340, top: 380, ...font("hero"), lineHeight: 1 }}>{n}<span style={{ fontSize: 80 }}>通</span></div>
      <div style={{ position: "absolute", left: 1340, top: 590, ...font("label", C.ink2) }}>ひと月に（30歳・ニューヨーク）</div>
      <div style={{ position: "absolute", left: 1340, top: 680, ...font("sub") }}>30分に1通</div>
    </>
  );
};

/** Pronk & Denissen (2020) の模式図：見たプロフィールの数と、受け入れる割合。最初に急に下がり、最後は約3割低い */
const PronkCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const x0 = 360, x1 = 1500, y0 = 280, y1 = 780; // y0＝100、y1＝50
  const v = (u: number) => 100 - 27 * (1 - Math.exp(-u * 5)) / (1 - Math.exp(-5)); // 0〜1 → 100〜73
  const X = (u: number) => x0 + (x1 - x0) * u, Y = (val: number) => y1 - ((val - 50) / 50) * (y1 - y0);
  const p = interpolate(frame, [20, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const pts = Array.from({ length: 41 }, (_, i) => i / 40).filter((u) => u <= p);
  const d = pts.map((u, i) => `${i ? "L" : "M"}${X(u)} ${Y(v(u))}`).join(" ");
  return (
    <Svg>
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={C.ink} strokeWidth={LINE.thin} />
      <line x1={x0} y1={y0 - 20} x2={x0} y2={y1} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={x0 - 20} y={Y(100) + 12} textAnchor="end" style={font("label")}>100</text>
      <text x={x0 - 20} y={y1 + 12} textAnchor="end" style={font("label", C.ink2)}>50</text>
      <text x={x0} y={y1 + 60} style={font("label", C.ink2)}>見た最初のプロフィール</text>
      <text x={x1} y={y1 + 60} textAnchor="end" style={font("label", C.ink2)}>最後</text>
      <text x={x0 + 20} y={y0 - 40} style={font("label")}>受け入れる割合（最初を100）</text>
      <path d={d} fill="none" stroke={C.female} strokeWidth={LINE.base} strokeLinecap="round" strokeLinejoin="round" />
      {p > 0.98 && (
        <>
          <circle cx={X(1)} cy={Y(73)} r={10} fill={C.female} />
          <text x={X(1) + 24} y={Y(73) + 16} style={font("value")}>約73</text>
          <text x={X(0.3)} y={Y(62)} style={font("label", C.ink2)}>最初の十数枚で急に下がる</text>
        </>
      )}
      <text x={x1} y={y0 - 40} textAnchor="end" style={font("note", C.ink2)}>模式図（論文の結果をもとに描いたもの）</text>
    </Svg>
  );
};

const Ch3: React.FC = () => {
  const { find, end } = useCue();
  const paper = find("アメリカで", 200);
  const most = find("いちばん多く", 500);
  const pile = find("みんなが少し上を狙うと", 700);
  return (
    <>
      <Beat from={0} to={paper}>
        <Tag_ x={96} y={80} text="① みんなが、少し上を狙う" />
        <AimUp start={60} />
      </Beat>
      <Beat from={paper} to={most}>
        <PaperTag title="Bruch & Newman (2018) Science Advances" meta="米国4都市の出会いサイト利用者 約18.7万人（2014年）" />
        <BruchLadder />
      </Beat>
      <Beat from={most} to={pile}>
        <PaperTag title="Bruch & Newman (2018) Science Advances" meta="いちばん多く連絡を受けていた人" />
        <MailRain />
      </Beat>
      <Beat from={pile} to={end + 30}>
        <Tag_ x={96} y={80} text="① ハートが、ひと握りに集まる" />
        <HeartRows result={APP} received={RECEIVED} box={ROWS} start={-400} tags={[TAGS[0]]} bracketTop={8} />
        <SimNote />
      </Beat>
      <ChapterDots current={3} />
    </>
  );
};

const Ch3Raise: React.FC = () => {
  const { find, end } = useCue();
  const nl = find("オランダ", 300);
  return (
    <>
      <Beat from={0} to={nl}>
        <Tag_ x={96} y={80} text="② 候補が多い人ほど、基準が上がる" />
        <BarRises start={30} />
      </Beat>
      <Beat from={nl} to={end + 30}>
        <PaperTag title="Pronk & Denissen (2020)" meta="Social Psychological and Personality Science。オランダの実験（3つの研究）" />
        <PronkCurve />
      </Beat>
      <ChapterDots current={3} />
    </>
  );
};

// ---------- 1人だけやり方を変えたら ----------
const APP_HIM = simulateApp(RS, { personal: { [HIM]: { aim: 0 } } }, SEED);
const APP_HER = simulateApp(RS, { personal: { [HER]: { raise: 0 } } }, SEED);

/** 20人の列で割合を見せる（ペアになれた人だけ色） */
const ShareRow: React.FC<{ y: number; label: string; pct: number; kind: "male" | "female"; start: number; focus?: boolean }> = ({ y, label, pct, kind, start, focus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const t = sp("enter", frame - start, fps);
  const k = Math.round((pct / 100) * 20 * interpolate(frame - start, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: t }}>
      <div style={{ position: "absolute", left: 96, top: y - 56, width: 520, ...font("label", focus ? C.ink : C.ink2), whiteSpace: "nowrap" }}>{label}</div>
      <Svg>{Array.from({ length: 20 }, (_, i) => <Figure key={i} kind={kind} x={660 + i * 44} y={y} size={1.05} dim={i >= k} />)}</Svg>
      <div style={{ position: "absolute", left: 1560, top: y - 70, ...font("value") }}>{pct}%</div>
    </div>
  );
};

const Me: React.FC = () => {
  const { find, end } = useCue();
  const dbl = find("倍の数", 300);
  const same = find("同じくらいに見える人にも", 600);
  const him = find("冒頭の彼も", 800);
  const pop = find("人気のある側", 1000);
  const keep = find("基準を上げなかった場合", 1100);
  const her = find("冒頭の彼女も", 1300);
  const sum = find("数を増やしても", 1500);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={dbl}>
        <Town result={APP} box={STAGE} at={12} title="アプリの町（ほかの99人はそのまま）" compact />
      </Beat>
      <Beat from={dbl} to={him}>
        <Tag_ x={96} y={80} text="真ん中より下の男性が、ひとりだけ変えたら（1年でペアになれた割合）" />
        <ShareRow y={330} label="そのまま" pct={52} kind="male" start={0} />
        <ShareRow y={530} label="いいねを倍送る" pct={54} kind="male" start={30} />
        <ShareRow y={730} label="同じくらいの人にも送る" pct={70} kind="male" start={same - dbl} focus />
      </Beat>
      <Beat from={him} to={pop}>
        <Town result={APP_HIM} box={STAGE} at={12} title="彼だけが、同じくらいの人にも送ったら" compact tags={[TAGS[0]]} />
      </Beat>
      <Beat from={pop} to={her}>
        <Tag_ x={96} y={80} text="人気のある女性が、ひとりだけ変えたら（1年でペアになれた割合）" />
        <ShareRow y={430} label="そのまま" pct={25} kind="female" start={0} />
        <ShareRow y={680} label="基準を上げない" pct={93} kind="female" start={keep - pop} focus />
      </Beat>
      <Beat from={her} to={sum}>
        <Town result={APP_HER} box={STAGE} at={12} title="彼女だけが、基準を上げなかったら" compact tags={[TAGS[1]]} />
      </Beat>
      <Beat from={sum} to={end + 30}>
        <Tag_ x={96} y={80} text="数を増やしてもほぼ変わらない。変わるのは、狙う高さと基準の上げ方" />
        <ShareRow y={300} label="男性：そのまま" pct={52} kind="male" start={-60} />
        <ShareRow y={410} label="男性：いいねを倍送る" pct={54} kind="male" start={-60} />
        <ShareRow y={520} label="男性：同じくらいにも送る" pct={70} kind="male" start={-60} focus />
        <ShareRow y={670} label="女性：そのまま" pct={25} kind="female" start={-60} />
        <ShareRow y={780} label="女性：基準を上げない" pct={93} kind="female" start={-60} focus />
      </Beat>
      <SourceNote sim text="ほかの99人はそのまま。種を20通り変えた平均（仮定の世界）" prefix="" />
    </>
  );
};

const Ch3Quiz: React.FC = () => {
  const { find, end } = useCue();
  const first = find("まず、ひとつ目", 400);
  const second = find("次に、ふたつ目", 800);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={first}>
        <div style={{ position: "absolute", left: Z.header.x, top: 56, opacity: t }}>
          <div style={{ display: "inline-block", background: C.ink, borderRadius: R.md, padding: "4px 20px", ...font("label", C.white) }}>クイズ</div>
          <div style={{ ...font("question"), marginTop: 10 }}>ひとつだけ止めるなら、どっち？</div>
        </div>
        <Rules x={96} y={330} gap={40} every={30} start={30} items={["① 少し上を狙うのをやめる町", "② 基準が上がらない町"]} />
        <Svg><Figure kind="male" x={1300} y={760} size={4} pose="phone" /><Figure kind="female" x={1560} y={760} size={4} pose="phone" /></Svg>
      </Beat>
      <Beat from={first} to={end + 30}>
        <Tag_ x={96} y={80} text="アプリの町で、ひとつだけ止める（1年後のペア）" />
        <PairPanel result={APP} x={96} y={200} title="アプリの町" start={0} dur={1} />
        <PairPanel result={NO_AIM} x={516} y={200} title="① 上を狙わない" start={20} from={17} focus />
        <Beat from={second - first} to={end + 30 - first}>
          <PairPanel result={NO_RAISE} x={936} y={200} title="② 基準が上がらない" start={0} from={17} focus />
          <PairPanel result={INTRO} x={1356} y={200} title="紹介の町" start={40} dur={1} />
        </Beat>
      </Beat>
      <SimNote />
      <ChapterDots current={3} />
    </>
  );
};

const Ch3Vouch: React.FC = () => {
  const { find, end } = useCue();
  const cut = find("この保証を抜いて", 300);
  const tool = find("道具そのもの", 800);
  const caveat = find("ただし", 1000);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={caveat}>
        <Beat from={0} to={tool}><Tag_ x={96} y={80} text="紹介の町から「保証」を抜くと" /></Beat>
        <Beat from={tool} to={caveat}><Tag_ x={96} y={80} text="差を生んだのは、道具ではなく、選べる数が基準を変えること" /></Beat>
        <PairPanel result={INTRO} x={96} y={200} title="紹介の町" dur={1} />
        <Beat from={cut} to={caveat}>
          <PairPanel result={NO_VOUCH} x={560} y={200} title="保証なし" from={27} focus />
          <PairPanel result={APP} x={1024} y={200} title="アプリの町" dur={1} start={30} />
        </Beat>
      </Beat>
      <Beat from={caveat} to={end + 30}>
        <Tag_ x={96} y={80} text="仮定を変えると：基準の上がり方が半分なら" />
        <PairPanel result={INTRO} x={96} y={200} title="紹介の町" dur={1} />
        <PairPanel result={HALF_RAISE} x={560} y={200} title="アプリの町（半分）" from={17} focus />
      </Beat>
      <SimNote />
      <ChapterDots current={3} />
    </>
  );
};

/** 現実の日本：周りが用意する出会い10組のうち7組が消え、仕組み（アプリ・相談所）で3組が戻る（1組＝年1万組） */
const Real: React.FC = () => {
  const { find, end } = useCue();
  const lost = find("7万組", 300);
  const back = find("3万組", 500);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pairs = (n: number, x: number, y: number, dimFrom: number[], color = true) => Array.from({ length: n }, (_, i) => {
    const gone = frame >= (dimFrom[i] ?? Infinity);
    return (
      <g key={i}>
        <Figure kind="male" x={x + i * 130} y={y} size={1.6} dim={gone || !color} />
        <Figure kind="female" x={x + i * 130 + 48} y={y} size={1.6} dim={gone || !color} />
      </g>
    );
  });
  const t = sp("enter", frame - back, fps);
  return (
    <>
      <Tag_ x={96} y={80} text="現実の日本（推計。1組＝年に1万組）" />
      <div style={{ position: "absolute", left: 96, top: 240, ...font("label") }}>周りが用意する出会い（職場・友人・お見合い）</div>
      <Svg>{pairs(10, 140, 420, Array.from({ length: 10 }, (_, i) => (i >= 3 ? lost + 10 + (i - 3) * 6 : Infinity)))}</Svg>
      <Beat from={lost} to={end + 30}><div style={{ position: "absolute", left: 96, top: 450, ...font("value") }}>年に約7万組 減った</div></Beat>
      <Beat from={back} to={end + 30}>
        <div style={{ position: "absolute", left: 96, top: 570, ...font("label") }}>アプリと結婚相談所</div>
        <div style={{ opacity: t }}><Svg>{pairs(3, 140, 760, [])}</Svg></div>
        <div style={{ position: "absolute", left: 560, top: 680, ...font("value") }}>年に約3万組 増えた</div>
      </Beat>
      <SourceNote text="推計：出生動向基本調査の割合×人口動態統計（約22.7万→15.7万組、約7.6万→10.4万組。埋まった割合の幅 約15〜61%）" />
    </>
  );
};

// ---------- 教訓 ----------
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const intro = find("同じふたりを", 200);
  const self = find("うまくいかない", 700);
  const lesson = find("選べる相手が増える", 1000);
  return (
    <>
      <Beat from={0} to={intro}>
        <SimBackground />
        <Town result={APP} box={STAGE} at={12} title="アプリの町" tags={TAGS} dimSingles={false} />
      </Beat>
      <Beat from={intro} to={self}>
        <Introduced />
      </Beat>
      <Beat from={self} to={lesson}>
        <SimBackground />
        <Town result={APP} box={{ x: 96, y: 200, w: 820, h: 660 }} at={12} title="アプリの町" size={0.8} split={0.66} compact />
        <Town result={INTRO} box={{ x: 1000, y: 200, w: 820, h: 660 }} at={12} title="紹介の町" size={0.8} split={0.66} compact />
      </Beat>
      <Beat from={lesson} to={end + 30}>
        <WalkingTown />
        <div style={{ position: "absolute", left: 96, top: 120, ...font("question"), lineHeight: 1.4, whiteSpace: "pre-line" }}>
          {"選べる相手が増えるほど、\n選ばれない人と、\n選べない人が増える。"}
        </div>
      </Beat>
    </>
  );
};

const End: React.FC = () => <EndScreen lesson={"選べる相手が増えるほど、\n選ばれない人と、\n選べない人が増える。"} />;

const episode: EpisodeDef = {
  id: "001-where-couples-meet-v2",
  title: "アプリで出会いは増えたのに、なぜ結婚は増えないのか", // 仮。タイトルは meta.md で決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, hook: Hook, quiz: QuizSetup, "quiz-ask": QuizAsk,
    "ch1-card": Ch1Card, ch1: Ch1, "ch1-end": Ch1End,
    "ch2-card": Ch2Card, ch2: Ch2, "ch2-hearts": Ch2Hearts, "ch2-him": Ch2Him, "ch2-her": Ch2Her,
    verdict: Verdict, "ch3-card": Ch3Card, ch3: Ch3, "ch3-quiz": Ch3Quiz, "ch3-raise": Ch3Raise, "ch3-vouch": Ch3Vouch, real: Real, me: Me,
    lesson: Lesson, end: End,
  }),
  bgm: [
    { file: "Sizzr - Schwartzy.mp3", from: "opening", to: "hook", startAt: 10 },
    { file: "Stayin' Lazy - Godmode.mp3", from: "quiz", to: "quiz-ask" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch1-card", to: "ch2-her" },
    { file: "Traversing - Godmode.mp3", from: "verdict" },
    { file: "Stayin' Lazy - Godmode.mp3", from: "ch3-card", to: "me" },
    { file: "Away - Patrick Patrikios.mp3", from: "lesson", to: "end" },
  ],
};
export default episode;
