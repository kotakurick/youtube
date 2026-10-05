// 1本目 v3「アプリで出会いは増えたのに、なぜ結婚は増えないのか」（台本は script-v3.md、構成は outline-v3.md）。
// v2（Episode-v2.tsx）を元に、物語のアニメーション（StoryAnim.tsx）と第4章（社会の構造）・第5章（戦略）を足した。動画の id は 001-where-couples-meet-v3。
// シミュレーションは render/src/lib/sim/towns.ts（種22。結果の一覧は ../sim-v2.md）、描画は render/src/lib/TownsSim.tsx。
// 場面の中は「区切り（Beat）」で10〜20秒ごとに絵を替える。区切りの時刻は読み上げの語（useNarration().find）に合わせる。
// 蛍光ペンの黄は使わない（2026-10-05 オーナー「見えない」）。強調は墨の下線・墨の札。
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, WALL_FREE } from "@lib/Backdrop";
import { Camera } from "@lib/Camera";
import { ChannelTag } from "@lib/Cards";
import { SignOff } from "@lib/SignOff";
import { ChapterCard, ChapterDots } from "@lib/Chapter";
import { Crowd, Person } from "@lib/Crowd";
import { Figure } from "@lib/Figure";
import { Cat } from "@lib/Cat";
import { Gosa } from "@lib/Gosa";
import { FOOT, hundred, scatter } from "@lib/layout";
import { LineChart } from "@lib/LineChart";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { Clock, Cup, Phone, Table, tableTop } from "@lib/Props";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { Heart, heartRowLayout, HeartRows, homes, PairPanel, Tag, Town } from "@lib/TownsSim";
import { shuffle } from "@lib/random";
import { likesReceived, makeResidents, simulateApp, simulateIntro } from "@lib/sim/towns";
import { C, EASE, font, LINE, R, sp, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";
import timing from "../timing-v3.json";
import { Bubble, NotifStack, OfficeYears, SwipeDeck } from "@lib/StoryAnim";
import { BigCount, Chip as Tag_, Choices, Facts as Rules, Note } from "@lib/Labels";

// ---------- シミュレーション（種22。sim-v2.md） ----------
const SEED = 22;
const RS = makeResidents(SEED);
const INTRO = simulateIntro(RS, {}, SEED);
const APP = simulateApp(RS, {}, SEED);
const NO_AIM = simulateApp(RS, { aim: 0 }, SEED);
const NO_RAISE = simulateApp(RS, { raise: 0 }, SEED);
const HALF_RAISE = simulateApp(RS, { raise: 0.1 }, SEED);
const INTRO_LOW = simulateIntro(RS, { matchmaker: 0.3 }, SEED); // 世話焼きが3割しか動かない紹介の町
const NO_VOUCH = simulateIntro(RS, { tolerance: 0 }, SEED);
const RECEIVED = likesReceived(APP);
const HIM = 6, HER = 35;
const TAGS: Tag[] = [{ id: HIM, label: "彼（32）" }, { id: HER, label: "彼女（30）" }];
const HER_SENT = [...new Set(APP.months.flatMap((m) => m.likes!.filter(([p]) => p === HER).map(([, q]) => q)))];
const sentBy = (id: number) => APP.months.reduce((s, m) => s + m.likes!.filter(([p]) => p === id).length, 0);
const STAGE = { x: 96, y: 200, w: 1728, h: 620 }; // 下は出典の札（y844）の上まで
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
const Introduced: React.FC<{ noTag?: boolean }> = ({ noTag }) => {
  const s = 3.2, floor = 820;
  const scene = (x: number, me: "male" | "female", tag: string, by: string) => (
    <g>
      {/* 引き合わせた人はテーブルの奥（テーブルより先に描く） */}
      <Cat kind="other" x={x} y={floor - 6} size={3.6} pose="sit" seed={8} />
      <Table x={x} y={floor} size={s} w={70} />
      <Cup x={x - 40} y={floor + tableTop(s)} size={s} />
      <Cat kind={me} x={x - 160} y={floor} size={4} pose="sit" facing={1} face="happy" />
      <Cat kind={me === "male" ? "female" : "male"} x={x + 160} y={floor} size={4} pose="sit" facing={-1} face="happy" seed={3} />
      <text x={x - 160} y={floor - 230} textAnchor="middle" style={font("label")}>{tag}</text>
      <text x={x} y={floor - 310} textAnchor="middle" style={font("label", C.ink2)}>{by}</text>
    </g>
  );
  return (
    <>
      <Backdrop kind="room" floor={floor} variant={2} />
      <Svg>
        {scene(520, "female", "彼女（30）", "友人の紹介")}
        {scene(1400, "male", "彼（32）", "職場の知り合いの紹介")}
      </Svg>
      {!noTag && <Tag_ x={96} y={80} text="紹介の町では" />}
    </>
  );
};

// ---------- 冒頭の物語 ----------
const S = 6; // 寄りの絵の人物の大きさ
const FLOOR = 840;

/** 夜の部屋でスマホを見る1人。hearts は周りに出る通知のハートの数（時間とともに増える） */
const NightRoom: React.FC<{ kind: "male" | "female"; label: string; hearts?: number; heartsFrom?: number; heartsEvery?: number }> = (
  { kind, label, hearts = 0, heartsFrom = 0, heartsEvery = 10 },
) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(hearts, Math.floor((frame - heartsFrom) / heartsEvery) + 1));
  const spots = scatter(hearts, { x: 960, y: 200, w: 520, h: 420 }, 9, 1.2);
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

/** 冒頭の夜の部屋（割った画面の片側。幅960）。壁・床・夜の窓・ベッドかソファ */
const NightRoomBg: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const floor = 800;
  const win = side === "left" ? { x: 40, w: 300 } : { x: 40, w: 240 };
  return (
    <g data-qa="bg">
      <rect x={0} y={0} width={1920} height={floor} fill={C.wall} />
      <rect x={0} y={floor} width={1920} height={280} fill={C.floor} />
      <line x1={0} x2={1920} y1={floor} y2={floor} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={win.x} y={side === "left" ? 230 : 80} width={win.w} height={220} rx={R.sm} fill={C.night} stroke={C.ink} strokeWidth={LINE.thin} />
      <circle cx={win.x + win.w * 0.7} cy={(side === "left" ? 230 : 80) + 70} r={22} fill={C.wall} />
      <path d={`M${win.x + win.w / 2} ${side === "left" ? 230 : 80} v220`} stroke={C.ink} strokeWidth={LINE.thin} />
      {side === "left" ? (
        // ベッド（後ろ）
        <g>
          <rect x={60} y={660} width={420} height={140} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <rect x={60} y={600} width={40} height={200} rx={8} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
          <rect x={110} y={630} width={120} height={50} rx={20} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.hair} />
        </g>
      ) : (
        // ソファ（後ろ）
        <g>
          <rect x={60} y={620} width={420} height={110} rx={R.md} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
          <rect x={40} y={700} width={460} height={100} rx={R.md} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        </g>
      )}
    </g>
  );
};

/** 冒頭：左に彼（スワイプし続ける）、右に彼女（通知が積もる）。画面を左右に割る */
const SplitNight: React.FC<{ herFrom: number; think: number; himText: number; got: number; sent: number }> = ({ herFrom, think, himText, got, sent }) => {
  const frame = useCurrentFrame();
  const split = interpolate(frame - herFrom, [0, 24], [1920, 960], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <>
      {/* 左：彼の部屋（夜） */}
      <div style={{ position: "absolute", left: 0, top: 0, width: split, height: 1080, overflow: "hidden", background: C.bg }}>
        <Svg>
          <NightRoomBg side="left" />
          <Clock x={430} y={130} r={46} hour={23} minute={0} />
          <Cat kind="male" x={300} y={800} size={4.4} pose="phone" face={frame >= himText && frame < herFrom ? "sad" : "normal"} />
          <text x={300} y={540} textAnchor="middle" style={font("label")}>彼（32）</text>
          <SwipeDeck x={700} y={440} h={500} every={16} start={20} kind="female" count={false} />
        </Svg>
        <Beat from={sent} to={got}>
          <Rules x={560} y={730} items={["送った 8件"]} />
        </Beat>
        <Beat from={got} to={herFrom + 9999}>
          <Rules x={560} y={730} items={["送った 8件", "届いた 1件"]} gap={8} start={-60} />
        </Beat>
        <Beat from={himText} to={herFrom}>
          <Svg><Bubble x={80} y={240} text="何がいけないんだろう" tail={[300, 560]} start={himText} role="label" /></Svg>
        </Beat>
      </div>
      {/* 右：彼女の部屋（夜）。画面が割れて入ってくる */}
      {frame >= herFrom && <div style={{ position: "absolute", left: split, top: 0, width: 1920 - split, height: 1080, overflow: "hidden", background: C.bg, borderLeft: `${LINE.base}px solid ${C.ink}` }}>
        <svg width={960} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <NightRoomBg side="right" />
          <Cat kind="female" x={260} y={800} size={4.4} pose="phone" face={frame >= think ? "think" : "normal"} seed={5} />
          <text x={260} y={540} textAnchor="middle" style={font("label")}>彼女（30）</text>
          <NotifStack x={640} y={460} h={560} every={14} start={herFrom + 20} max={15} from="male" />
          <Bubble x={40} y={60} text="もっといい人が、いるかも" tail={[260, 560]} start={think} role="label" />
        </svg>
      </div>}
    </>
  );
};

const Opening: React.FC = () => {
  const { find, end } = useCue();
  const sent = find("8件", 120);
  const got = find("1件だけ", 200);
  const him = find("自分の何が", 300);
  const her = find("同じころ", 400);
  const think = find("もっといい人", 650);
  const both = find("選ばれない彼と", 800);
  const near = find("歩いて10分の距離に", 900);
  return (
    <>
      <Beat from={0} to={both}>
        <SplitNight herFrom={her} think={think} himText={him} got={got} sent={sent} />
      </Beat>
      <Beat from={both} to={near}>
        <Svg>
          <Cat kind="male" x={620} y={760} size={4.4} pose="phone" face="sad" />
          <Cat kind="female" x={1300} y={760} size={4.4} pose="phone" face="think" seed={5} />
          <text x={620} y={480} textAnchor="middle" style={font("sub")}>選ばれない彼</text>
          <text x={1300} y={480} textAnchor="middle" style={font("sub")}>選べない彼女</text>
        </Svg>
      </Beat>
      <Beat from={near} to={end + 30}>
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
    <Camera keys={[[0, { x: mid.x, y: mid.y - 40, scale: 1.3 }], [30, { x: 960, y: 540, scale: 1 }]]} dur={60}>
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
  const down = find("ところが", 200);
  const q = find("入り口は広がったのに", 600);
  return (
    <>
      <Beat from={0} to={down}>
        <Tag_ x={96} y={80} text="ネットで出会った夫婦（100組あたり）" />
        <Hundred x={160} bottom={790} from={11} to={20} start={70} />
        <div style={{ position: "absolute", left: 760, top: 300, ...font("value") }}>11組 → 20組</div>
        <div style={{ position: "absolute", left: 760, top: 390, ...font("label", C.ink2) }}>2021年の調査 → 2025年の調査</div>
        <div style={{ position: "absolute", left: 760, top: 470, ...font("sub") }}>割合は、ほぼ倍に</div>
        <SourceNote text="社人研「第17回出生動向基本調査」(2025) 図表5-3（11.0%→20.2%）" />
      </Beat>
      <Beat from={down} to={q}>
        <Tag_ x={96} y={80} text="初めてどうしの結婚（1年あたり）" />
        <Hundred x={160} bottom={790} from={100} to={75} start={50} fade />
        <div style={{ position: "absolute", left: 760, top: 300, ...font("value") }}>約49万組 → 約37万組</div>
        <div style={{ position: "absolute", left: 760, top: 390, ...font("label", C.ink2) }}>2010〜14年の平均 → 2020〜24年の平均</div>
        <div style={{ position: "absolute", left: 760, top: 470, ...font("sub") }}>四分の一ほど減った</div>
        <SourceNote text="厚生労働省「人口動態統計」夫妻とも初婚の婚姻件数" />
      </Beat>
      <Beat from={q} to={end + 30}>
        <WalkingTown />
        <Headline text={"入り口は広がったのに、\n出口は狭くなっている"} />
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
        <Town result={INTRO} box={{ ...half }} at={0} title="紹介の町" split={1.0} ringsIn={10} />
        <Rules x={1260} y={260} start={60} every={50} items={["知り合いの輪の\n中だけで出会う", "世話役が月に\nひと組を引き合わせる", "「この人いいよ」の\n保証があるので、\n少し下でも会う"]} />
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
  const { find, end } = useCue();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <>
      <SimBackground />
      <div style={{ position: "absolute", left: Z.header.x, top: 40, opacity: t }}>
        <div style={{ display: "inline-block", background: C.ink, borderRadius: R.md, padding: "4px 20px", ...font("label", C.white) }}>予想タイム</div>
        <div style={{ ...font("question"), marginTop: 10 }}>1年後、アプリの町のカップルは、紹介の町の何倍？</div>
      </div>
      {/* ふたつの町を大きく左右に、選択肢を下に横1列（2026-10-05 オーナー「画像が小さい・端にある」） */}
      <Town result={INTRO} box={{ x: 96, y: 206, w: 820, h: 540 }} at={0} size={0.8} split={1.0} title="紹介の町" />
      <Town result={APP} box={{ x: 1004, y: 206, w: 820, h: 540 }} at={0} size={0.8} split={1.0} title="アプリの町" />
      <Beat from={find("Aは", 200)} to={end + 30}>
        <Choices x={96} y={758} items={["3倍以上", "2倍くらい", "ほとんど同じ", "紹介の町より少ない"]} />
      </Beat>
      <SourceNote sim />
    </>
  );
};

// ---------- 第1章：紹介の町 ----------
const Ch1Card: React.FC = () => <ChapterCard no={1} title="紹介の町" />;
const Ch2Card: React.FC = () => <ChapterCard no={2} title="アプリの町" />;
const Ch3Card: React.FC = () => <ChapterCard no={3} title="犯人は誰か" />;
const Ch4Card: React.FC = () => <ChapterCard no={4} title="紹介は、なぜ少なくなったのか" />;
const Ch5Card: React.FC = () => <ChapterCard no={5} title="うまくいく人は、何をしていたか" />;

/** 飲み会の席：世話焼きの先輩が、ふたりを引き合わせる。夜の部屋、吊りランプ、テーブルの上に皿とグラス */
const Party: React.FC<{ say: number; meet: number }> = ({ say, meet }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = 4, cs = 5.2, floor = 820; // cs：猫の大きさ（テーブルから頭が出るように）
  const lean = interpolate(frame - meet, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const pop = sp("pop", frame - meet - 30, fps);
  const top = floor + tableTop(s);
  return (
    <>
      <Backdrop kind="room" floor={floor} variant={6} night />
      <Svg>
        {/* 吊りランプと、その下の明かり */}
        <ellipse cx={960} cy={top - 10} rx={420} ry={60} fill={C.white} opacity={0.5} />
        <line x1={960} y1={0} x2={960} y2={250} stroke={C.ink} strokeWidth={LINE.thin} />
        <path d="M900 250 h120 l40 70 h-200 z" fill={C.ink} />
        <ellipse cx={960} cy={322} rx={60} ry={10} fill={C.wall} />
        {/* 先輩はテーブルの奥に座る（テーブルより先に描く） */}
        <Cat kind="other" x={960} y={floor - 8} size={cs} pose="sit" face={frame >= say ? "happy" : "normal"} />
        <text x={930} y={floor - 300} textAnchor="end" style={font("label", C.ink2)}>世話焼きの先輩</text>
        <Table x={960} y={floor} size={s} w={150} />
        {/* 皿とグラス */}
        {[780, 1140].map((x) => <ellipse key={x} cx={x} cy={top - 6} rx={48} ry={10} fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} />)}
        <Cup x={880} y={top} size={s} steam={false} />
        <Cup x={1050} y={top} size={s} steam={false} />
        <Cat kind="male" x={640 + 60 * lean} y={floor} size={cs} pose="sit" facing={1} face={pop > 0.5 ? "happy" : frame >= say ? "surprised" : "normal"} seed={2} />
        <Cat kind="female" x={1280 - 60 * lean} y={floor} size={cs} pose="sit" facing={-1} face={pop > 0.5 ? "happy" : "normal"} seed={6} />
        <Bubble x={1060} y={floor - 460} text="この人、いいよ" tail={[990, floor - 275]} start={say} />
        {pop > 0.01 && <Heart x={960} y={top - 120} r={42 * pop} fill={C.female} />}
      </Svg>
    </>
  );
};

const Ch1: React.FC = () => {
  const { find, end } = useCue();
  const say = find("この人、いいよ", 120);
  const meet = find("一度だけ会って", 400);
  const pull = find("紹介の町で起きているのは", 600);
  return (
    <>
      <Beat from={0} to={pull}><Party say={say} meet={meet} /></Beat>
      <Beat from={pull} to={end + 30}>
        <Camera keys={[[0, { x: 400, y: 420, scale: 2.4 }], [10, { x: 960, y: 540, scale: 1 }]]} dur={50}>
          <SimBackground />
          <Town result={INTRO} box={STAGE} at={0} title="紹介の町" split={1.0} ringsIn={0} />
        </Camera>
      </Beat>
      <ChapterDots current={1} />
    </>
  );
};

const FPM1 = 150;
const Ch1Sim: React.FC = () => {
  const { find, end } = useCue();
  const m1 = find("ひと月目", 0);
  const you = find("あなたに", 500);
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

const ROWS = { x: 96, y: 240, w: 1728, h: 500 };
const Ch2Hearts: React.FC = () => {
  const { find, end } = useCue();
  const pile = find("ハートは", 300);
  const top = find("たった8人", 500);
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
        <div style={{ position: "absolute", left: 96, top: 150, ...font("label", C.ink2) }}>上の列＝女性、下の列＝男性。ハート1つ＝20件</div>
        <HeartRows result={APP} received={RECEIVED} box={ROWS} perHeart={20} from={town} start={0} dur={150} bracketTop={top - pile > 0 ? 8 : 0} />
      </Beat>
      <Beat from={real} to={end + 30}>
        <SourceNote x={96} text="実際のアプリ：いいねの半分を、男性は上位15%、女性は上位25%が受け取る（Hinge 2017、米国）" />
      </Beat>
      <ChapterDots current={2} />
    </>
  );
};

/** 並べ直した列の中の1人だけを残して、ほかを薄くする（寄ると名札とハートが重なるので、寄らずに薄くする） */
const RowsFocus: React.FC<{ id: number; card: string[]; arrows?: number[]; arrowsFrom?: number }> = ({ id, card, arrows, arrowsFrom = 0 }) => (
  <>
    <SimBackground />
    <HeartRows result={APP} received={RECEIVED} box={ROWS} perHeart={20} start={-400} tags={TAGS.filter((t) => t.id === id)} focus={id}
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
      <Beat from={zero} to={zero + 600}><Rules x={1380} y={268} items={["両思い 0"]} /></Beat>
      <SimNote />
    </>
  );
};

const Ch2Her: React.FC = () => {
  const { find } = useCue();
  const up = find("線をたどると", 400);
  const zero = find("選ばれていなかった", 800);
  return (
    <>
      <RowsFocus id={HER} card={[`届いた ${RECEIVED.get(HER)}件`, `送った ${sentBy(HER)}件`]} arrows={HER_SENT} arrowsFrom={up} />
      <Beat from={zero} to={zero + 600}><Rules x={1380} y={268} items={["両思い 0"]} /></Beat>
      <SimNote />
    </>
  );
};

// ---------- 答え合わせ（予想の答え） ----------
const Verdict: React.FC = () => {
  const { find, end } = useCue();
  const ans = find("答えは", 300);
  const race = find("ペアの数の動き", 500);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = sp("pop", frame - ans, fps);
  const line = (r: typeof APP) => [[0, 0] as [number, number], ...r.months.map((m) => [m.month, m.pairs.length] as [number, number])];
  return (
    <>
      <SimBackground />
      <Beat from={0} to={race}>
        <Town result={INTRO} box={{ x: 96, y: 200, w: 820, h: 620 }} at={12} title="紹介の町" size={0.8} split={0.66} compact />
        <Town result={APP} box={{ x: 1000, y: 200, w: 820, h: 620 }} at={12} title="アプリの町" size={0.8} split={0.66} compact />
        {frame >= ans && (
          <div style={{ position: "absolute", left: 1000 - 16, top: 184, width: 852, height: 652, border: `${LINE.heavy}px solid ${C.ink}`,
            borderRadius: R.lg, transform: `scale(${0.96 + 0.04 * stamp})` }} />
        )}
        <Beat from={ans} to={race}><Tag_ x={96} y={80} text="答え：D　アプリの町は、紹介の町より少ない" /></Beat>
      </Beat>
      <Beat from={race} to={end + 30}>
        <Tag_ x={96} y={80} text="ペアの数（累計）。横は何か月目か" />
        <LineChart x={220} y={240} width={1240} height={500} xDomain={[0, 12]} yDomain={[0, 30]} xTicks={[1, 3, 6, 9, 12]}
          format={(v) => `${v}組`} series={[
            { label: "紹介の町", points: line(INTRO), color: C.ink, focus: true },
            { label: "アプリの町", points: line(APP), color: C.ink2 },
          ]} duration={90} />
        <Beat from={find("アメリカの追跡調査", 900) - race} to={end + 30 - race}>
          <SourceNote text="Rosenfeld (2017) Sociological Science：ネットで出会ったカップルは結婚への移行が早い（米国の追跡調査）（★未照合）" />
        </Beat>
      </Beat>
      <Beat from={0} to={race}><SimNote /></Beat>
      <Gosa cues={[[ans - 6, "surprised"]]} size="S" sfx={false} exit={race} />
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
  const x = 400, top = 230, bottom = 800;
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
      {/* 返事の来やすさ：相手が上であるほど短い棒（模式図）。どの棒にも何の段かを書く */}
      <text x={1040} y={yOf(0.97)} style={font("label")}>相手が自分より</text>
      <text x={1400} y={yOf(0.97)} style={font("label")}>返事の来やすさ</text>
      {[["同じくらい", 1], ["少し上", 0.75], ["かなり上", 0.5], ["ずっと上", 0.28]].map(([label, k], i) => {
        const t = interpolate(frame, [70 + i * 6, 86 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = yOf(0.78 - i * 0.16);
        return (
          <g key={i} opacity={t}>
            <text x={1040} y={y + 12} style={font("label", C.ink2)}>{label as string}</text>
            <rect x={1400} y={y - 18} width={360 * (k as number)} height={36} rx={18} fill={C.ink2} />
          </g>
        );
      })}
      <text x={1040} y={bottom + 12} style={font("note", C.ink2)}>模式図（論文の結果をもとに描いたもの。棒の長さは目安）</text>
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
          const col = i % 8, row = Math.floor(i / 8);
          return <rect key={i} x={680 + col * 52} y={800 - row * 40} width={44} height={30} rx={4} fill={C.white} stroke={C.ink} strokeWidth={3} />;
        })}
      </Svg>
      <div style={{ position: "absolute", left: 1180, top: 380, ...font("hero"), lineHeight: 1, whiteSpace: "nowrap" }}>{n}<span style={{ fontSize: 80 }}>通</span></div>
      <div style={{ position: "absolute", left: 1180, top: 590, ...font("label", C.ink2), whiteSpace: "nowrap" }}>ひと月に（30歳・ニューヨーク）</div>
      <div style={{ position: "absolute", left: 1180, top: 680, ...font("sub"), whiteSpace: "nowrap" }}>30分に1通</div>
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
  const paper = find("アメリカに", 200);
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
        <HeartRows result={APP} received={RECEIVED} box={ROWS} perHeart={20} start={-400} tags={[TAGS[0]]} bracketTop={8} />
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


const Ch3Quiz: React.FC = () => {
  const { find, end } = useCue();
  const first = find("まず、少し上", 400);
  const second = find("次に、基準", 800);
  const culprit = find("主犯は", 1200);
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
        <Beat from={0} to={culprit - first}><Tag_ x={96} y={80} text="アプリの町で、ひとつだけ止める（1年後のペア）" /></Beat>
        <Beat from={culprit - first} to={end + 30 - first}><Tag_ x={96} y={80} text="この町の主犯は「基準が動くこと」" /></Beat>
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
  const tool = find("どちらの町が勝つか", 1200);
  const caveat = find("ただし", 1000);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={caveat}>
        <Beat from={0} to={tool}><Tag_ x={96} y={80} text="紹介の町から「保証」を抜くと" /></Beat>
        
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
        <Beat from={tool - caveat} to={end + 30 - caveat}><Note x={1080} y={360} text={"勝ち負けを決めるのは、\n基準がどれだけ動くか"} /></Beat>
      </Beat>
      <SimNote />
      <ChapterDots current={3} />
    </>
  );
};

/** 現実の日本：周りが用意する出会い10組のうち7組が消え、仕組み（アプリ・相談所）で3組が戻る（1組＝年1万組） */
const Ch4: React.FC = () => {
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

// ---------- 第4章：紹介は、なぜ少なくなったのか ----------
/** n人のうち k人だけ色（20人の列）。割合を人数で見せる */
const PeopleOf: React.FC<{ x: number; y: number; k: number; n?: number; kind?: "male" | "female" | "mix"; size?: number; start?: number }> = (
  { x, y, k, n = 20, kind = "mix", size = 1.05, start = 0 },
) => {
  const frame = useCurrentFrame();
  const shown = Math.round(k * interpolate(frame - start, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Svg>{Array.from({ length: n }, (_, i) => (
      <Figure key={i} kind={kind === "mix" ? (i % 2 ? "female" : "male") : kind} x={x + i * 44 * size} y={y} size={size} dim={i >= shown} />
    ))}</Svg>
  );
};

/** 仲人の役目の移り変わり：村 → 家 → 会社 → （消える） */
const Matchmakers: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const steps = ["村", "家", "会社", "？"];
  return (
    <Svg>
      {steps.map((t, i) => {
        const u = interpolate(frame - start - i * 20, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = 260 + i * 400;
        const gone = i === 3;
        return (
          <g key={i} opacity={u}>
            {i > 0 && <path d={`M${x - 290} 520 H${x - 110}`} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" markerEnd="" />}
            {i > 0 && <path d={`M${x - 130} 504 L${x - 110} 520 L${x - 130} 536`} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />}
            <rect x={x - 90} y={440} width={180} height={160} rx={R.lg} fill={gone ? C.bg : C.white} stroke={gone ? C.rest : C.ink} strokeWidth={LINE.thin} strokeDasharray={gone ? "10 10" : undefined} />
            <text x={x} y={540} textAnchor="middle" style={font("value", gone ? C.rest : C.ink)}>{t}</text>
          </g>
        );
      })}
      <text x={260} y={680} style={font("label", C.ink2)}>仲人の役目を担ってきたもの</text>
    </Svg>
  );
};

const Ch4Office: React.FC = () => {
  const { find, end } = useCue();
  const back = find("三十年あまり前", 150);
  const nako = find("仲人の役目", 700);
  const trip = find("社員旅行をする会社も", 1000);
  const nonreg = find("非正規", 1300);
  const love = find("職場の恋愛", 1700);
  const reveal = find("7割近く", 1900);
  const nobody = find("理由は、ひとつではありません", 2200);
  return (
    <>
      <Beat from={0} to={nako}>
        <OfficeYears start={back} per={90} years={[
          { year: "1990年代", seated: 1, party: true, note: "社員旅行、歓迎会、同じ顔ぶれ" },
          { year: "2000年代", seated: 0.85, party: true },
          { year: "2010年代", seated: 0.7 },
          { year: "いま", seated: 0.5, note: "人の入れ替わり、在宅勤務" },
        ]} />
        <Beat from={back} to={nako}><Note x={96} y={460} text={"夫婦の3組に1組は、\n職場で出会った"} sub="1992年 35.0%" /></Beat>
        <SourceNote text="社人研「出生動向基本調査」。机の人数はイメージ" />
      </Beat>
      <Beat from={nako} to={trip}>
        <Tag_ x={96} y={80} text="仲人の役目は、村 → 家 → 会社へ。そして2000年代に消えた" />
        <Matchmakers start={10} />
        <SourceNote text="阪井裕一郎『仲人の近代』(2021)（★未照合）" />
      </Beat>
      <Beat from={trip} to={nonreg}>
        <Tag_ x={96} y={80} text="社員旅行をする会社（20社あたり）" />
        <div style={{ position: "absolute", left: 96, top: 260, ...font("label") }}>2014年 36.9%</div>
        <PeopleOf x={520} y={320} k={7} start={10} />
        <div style={{ position: "absolute", left: 96, top: 440, ...font("label") }}>2019年 27.8%</div>
        <PeopleOf x={520} y={500} k={6} start={30} />
        <SourceNote text="産労総合研究所「社内イベント・社員旅行等に関する調査」(2020)。回答169社" />
      </Beat>
      <Beat from={nonreg} to={love}>
        <Tag_ x={96} y={80} text="非正規で働く人（20人あたり）" />
        <div style={{ position: "absolute", left: 96, top: 260, ...font("label") }}>1984年 15.3%</div>
        <PeopleOf x={520} y={320} k={3} start={10} />
        <div style={{ position: "absolute", left: 96, top: 440, ...font("label") }}>2025年 36.5%</div>
        <PeopleOf x={520} y={500} k={7} start={30} />
        <SourceNote text="総務省「労働力調査」（1984年は特別調査、2025年は詳細集計で、調べ方が違う）（★未照合）" />
      </Beat>
      <Beat from={love} to={reveal}>
        <OfficeYears start={-1000} per={90} years={[{ year: "いま", seated: 0.5 }]} />
        <Note x={96} y={480} question text={"職場の恋愛を\n「したくない」人は、何割？"} />
      </Beat>
      <Beat from={reveal} to={nobody}>
        <Tag_ x={96} y={80} text="職場恋愛を「したくない」（20人あたり）" />
        <div style={{ position: "absolute", left: 96, top: 260, ...font("label") }}>男性 63.8%</div>
        <PeopleOf x={520} y={320} k={13} kind="male" start={10} />
        <div style={{ position: "absolute", left: 96, top: 440, ...font("label") }}>女性 75.8%</div>
        <PeopleOf x={520} y={500} k={15} kind="female" start={30} />
        <SourceNote text="Job総研「仕事と恋愛に関する意識調査」(2022、20〜50代923人、民間Web調査)（★未照合）" />
      </Beat>
      <Beat from={nobody} to={end + 30}>
        <OfficeYears start={-1000} per={90} years={[{ year: "いま", seated: 0.5 }]} />
        <Note x={96} y={360} text={"理由はひとつではない。\nただ、働き方と\n人との距離が、\n同じ時期に大きく変わった"} />
      </Beat>
      <ChapterDots current={4} total={5} />
    </>
  );
};

/** 人がアプリへ移っていく町（シミュレーション③）。移った割合ごとに、紹介とアプリの2つの町を並べる */
const MOVE = [0, 0.4, 0.6, 0.8].map((frac) => { // 世話焼きが3割しか動かない町から、人がアプリへ移る
  const men = shuffle(RS.filter((a) => a.kind === "male"), SEED + 5), wom = shuffle(RS.filter((a) => a.kind === "female"), SEED + 6);
  const k = Math.round(50 * frac);
  const app = new Set([...men.slice(0, k), ...wom.slice(0, k)].map((a) => a.id));
  const A = RS.filter((a) => app.has(a.id)), I = RS.filter((a) => !app.has(a.id));
  const ri = simulateIntro(I, { matchmaker: 0.3 }, SEED), ra = A.length ? simulateApp(A, {}, SEED) : null;
  return { frac, ri, ra, iRate: Math.round((ri.final.pairs.length * 2 / I.length) * 100), aRate: ra ? Math.round((ra.final.pairs.length * 2 / A.length) * 100) : null };
});

const Ch4Sim: React.FC = () => {
  const { find, end } = useCue();
  const low = find("ときどきしか", 150);
  const res = find("27組から17組", 300);
  const move = find("少しずつ、アプリの町へ", 700);
  const same = find("3人に1人ほど", 600);
  const per = Math.max(60, Math.floor((end + 30 - move) / MOVE.length));
  const frame = useCurrentFrame();
  const k = Math.max(0, Math.min(MOVE.length - 1, Math.floor((frame - move) / per)));
  const m = MOVE[k];
  return (
    <>
      <SimBackground />
      <Beat from={0} to={move}>
        <Tag_ x={96} y={80} text="世話焼きが、ときどきしか動かない紹介の町" />
        <Town result={INTRO_LOW} box={{ x: 96, y: 200, w: 820, h: 620 }} start={low} fpm={Math.max(10, Math.floor((res - low) / 12))} title="紹介の町（世話焼きが3割）" size={0.8} split={0.66} compact legend={false} />
        <Beat from={res} to={move}>
          <Town result={APP} box={{ x: 1000, y: 200, w: 820, h: 620 }} at={12} title="アプリの町" size={0.8} split={0.66} compact />
        </Beat>
        <Beat from={same} to={move}>
          <div style={{ position: "absolute", left: 96, top: 130, ...font("label"), whiteSpace: "nowrap" }}>どちらにいても、相手が見つかるのは3人に1人ほど</div>
        </Beat>
      </Beat>
      <Beat from={move} to={end + 30}>
        <Tag_ x={96} y={60} text={`アプリの町へ移った人 ${Math.round(m.frac * 100)}%`} />
        <div style={{ position: "absolute", left: 96, top: 130, ...font("label"), whiteSpace: "nowrap" }}>{`ペアになれた割合：紹介に残った人 ${m.iRate}%${m.aRate !== null ? `　アプリの人 ${m.aRate}%` : ""}`}</div>
        <Town result={m.ri} box={{ x: 96, y: 200, w: 820, h: 620 }} at={12} title="紹介の町" size={0.8} split={0.66} compact />
        {m.ra && <Town result={m.ra} box={{ x: 1000, y: 200, w: 820, h: 620 }} at={12} title="アプリの町" size={0.8} split={0.66} compact />}
      </Beat>
      <SimNote />
      <ChapterDots current={4} total={5} />
    </>
  );
};



const Ch4Trap: React.FC = () => {
  const { find, end } = useCue();
  const why = find("アプリがなくならないのは", 400);
  const nobody = find("誰も間違っていないのに", 900);
  const last = MOVE[MOVE.length - 1];
  return (
    <>
      <Beat from={0} to={why}>
        <SimBackground />
        <Tag_ x={96} y={80} text="ひとりにとっての正解と、町全体の結果" />
        <div style={{ position: "absolute", left: 96, top: 230, ...font("label") }}>紹介に残った人がペアになれた（8割が移ったあと）</div>
        <PeopleOf x={140} y={360} k={Math.round(last.iRate / 5)} />
        <div style={{ position: "absolute", left: 96, top: 420, ...font("label") }}>アプリに移った人がペアになれた</div>
        <PeopleOf x={140} y={550} k={Math.round((last.aRate ?? 0) / 5)} />
        <div style={{ position: "absolute", left: 96, top: 610, ...font("label") }}>町全体のカップル</div>
        <div style={{ position: "absolute", left: 96, top: 660, ...font("value") }}>{`紹介の町が元気だったころ 27組 → みんなが移った町 ${last.ri.final.pairs.length + (last.ra?.final.pairs.length ?? 0)}組`}</div>
        <SimNote />
      </Beat>
      <Beat from={why} to={nobody}>
        <SimBackground />
        <WalkingTown />
        <Headline text={"紹介が少なくなった町では、\nアプリがいちばんましな入り口"} />
      </Beat>
      <Beat from={nobody} to={end + 30}>
        <SimBackground />
        <WalkingTown />
        <Headline text={"誰も間違っていないのに、\n町全体の出会いは減っていく"} />
      </Beat>
      <ChapterDots current={4} total={5} />
    </>
  );
};

// ---------- 第5章：うまくいく人は、何をしていたか ----------

const Ch5: React.FC = () => (
  <>
    <SimBackground />
    <Town result={APP} box={STAGE} at={12} title="アプリの町（ほかの人はそのまま。ひとりだけ変える）" compact />
    <SimNote />
    <ChapterDots current={5} total={5} />
  </>
);

const Ch5Wide: React.FC = () => {
  const { find, end } = useCue();
  const ask = find("先に考えてみて", 100);
  const dbl = find("倍の数送ってみます", 300);
  const same = find("同じくらいに見える人にも", 600);
  const him = find("冒頭の彼も", 800);
  const women = find("真ん中より下の女性でも", 900);
  const kreager = find("アメリカの出会いサイト", 1100);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={dbl}>
        <Tag_ x={96} y={80} text="ひとつ目：選ばれにくい側の人" />
        <Beat from={ask} to={dbl}><Rules x={96} y={300} gap={30} every={30} items={["いいねを倍送る", "狙う幅を広げる（同じくらいの人にも送る）"]} /></Beat>
        <Beat from={ask} to={dbl}><div style={{ position: "absolute", left: 96, top: 520, ...font("question") }}>どちらが効く？</div></Beat>
      </Beat>
      <Beat from={dbl} to={him}>
        <Tag_ x={96} y={80} text="真ん中より下の男性が、ひとりだけ変えたら（1年でペアになれた割合）" />
        <ShareRow y={330} label="そのまま" pct={52} kind="male" start={0} />
        <ShareRow y={530} label="いいねを倍送る" pct={54} kind="male" start={0} />
        <ShareRow y={730} label="幅を広げる" pct={70} kind="male" start={same - dbl} focus />
        <SourceNote sim text="ほかの99人はそのまま、種を20通り変えた平均（仮定の世界）" prefix="" />
      </Beat>
      <Beat from={him} to={women}>
        <Town result={APP_HIM} box={STAGE} at={12} title="彼（○印）だけが、同じくらいの人にも送ったら" compact tags={[{ id: HIM, label: "" }]} />
        <SimNote />
      </Beat>
      <Beat from={women} to={kreager}>
        <Tag_ x={96} y={80} text="真ん中より下の女性でも（1年でペアになれた割合）" />
        <ShareRow y={430} label="そのまま" pct={42} kind="female" start={0} />
        <ShareRow y={680} label="幅を広げる" pct={60} kind="female" start={20} focus />
        <SourceNote sim text="ほかの99人はそのまま、種を20通り変えた平均（仮定の世界）" prefix="" />
      </Beat>
      <Beat from={kreager} to={end + 30}>
        <PaperTag title="Kreager ほか (2014)" meta="米国の出会いサイト6か月・約1.4万人。観察で分かった差" />
        <Svg>
          <text x={96} y={330} style={font("label")}>つながりやすさ</text>
          <text x={96} y={420} style={font("label", C.ink2)}>女性から送った</text>
          <rect x={480} y={388} width={1000} height={44} rx={22} fill={C.female} />
          <text x={1500} y={424} style={font("value")}>2倍以上</text>
          <text x={96} y={520} style={font("label", C.ink2)}>男性から送った</text>
          <rect x={480} y={488} width={440} height={44} rx={22} fill={C.male} />
          <text x={96} y={650} style={font("label")}>送った数</text>
          <text x={96} y={740} style={font("label", C.ink2)}>女性</text>
          <rect x={480} y={708} width={250} height={44} rx={22} fill={C.female} />
          <text x={760} y={744} style={font("label", C.ink2)}>男性の4分の1</text>
        </Svg>
        <SourceNote text="J. Marriage and Family 76(2)（★未照合）" />
      </Beat>
      <ChapterDots current={5} total={5} />
    </>
  );
};

const Ch5Bar: React.FC = () => {
  const { find, end } = useCue();
  const few = find("月に数件だけ", 200);
  const keep = find("基準を上げなかった場合", 500);
  const her = find("冒頭の彼女も", 700);
  const men = find("人気のある男性でも", 800);
  const sum = find("差がついたのは", 900);
  return (
    <>
      <SimBackground />
      <Beat from={0} to={her}>
        <Tag_ x={96} y={80} text="ふたつ目：選ばれやすい側の人（人気のある女性が、ひとりだけ変えたら）" />
        <ShareRow y={330} label="そのまま" pct={25} kind="female" start={0} />
        <ShareRow y={530} label="月3件だけ見る" pct={29} kind="female" start={few} />
        <ShareRow y={730} label="基準を上げない" pct={93} kind="female" start={keep} focus />
        <SourceNote sim text="1年でペアになれた割合。ほかの99人はそのまま、種を20通り変えた平均（仮定の世界）" prefix="" />
      </Beat>
      <Beat from={her} to={men}>
        <Town result={APP_HER} box={STAGE} at={12} title="彼女（○印）だけが、基準を上げなかったら" compact tags={[{ id: HER, label: "" }]} />
        <SimNote />
      </Beat>
      <Beat from={men} to={sum}>
        <Tag_ x={96} y={80} text="人気のある男性でも（1年でペアになれた割合）" />
        <ShareRow y={430} label="そのまま" pct={29} kind="male" start={0} />
        <ShareRow y={680} label="基準を上げない" pct={89} kind="male" start={20} focus />
        <SourceNote sim text="ほかの99人はそのまま、種を20通り変えた平均（仮定の世界）" prefix="" />
      </Beat>
      <Beat from={sum} to={end + 30}>
        <Rules x={96} y={300} gap={36} every={40} items={["候補の数を減らす → ほとんど変わらない", "基準を動かさない → 大きく変わる"]} />
        <BarRises start={-400} />
      </Beat>
      <ChapterDots current={5} total={5} />
    </>
  );
};


const Ch5Again: React.FC = () => {
  const { find, end } = useCue();
  const town = find("アプリの町で、届いたいいねに", 300);
  const m = find("選ばれにくい側の男性では", 500);
  const sum = find("効いたのは、どれも", 900);
  return (
    <>
      <Beat from={0} to={town}>
        <Party say={-999} meet={-999} />
        <Tag_ x={96} y={80} text="みっつ目：どちらの側の人にも効いたこと" />
      </Beat>
      <Beat from={town} to={sum}>
        <SimBackground />
        <Tag_ x={96} y={80} text="届いたいいねに、少し下に見える相手でも返してみたら（1年でペアになれた割合）" />
        <ShareRow y={380} label="選ばれにくい側の男性" pct={52} kind="male" start={0} />
        <ShareRow y={480} label="　→ 返してみる" pct={74} kind="male" start={m - town} focus />
        <ShareRow y={630} label="選ばれやすい側の女性" pct={25} kind="female" start={m - town + 60} />
        <ShareRow y={730} label="　→ 返してみる" pct={41} kind="female" start={m - town + 90} focus />
        <SourceNote sim text="ほかの99人はそのまま、種を20通り変えた平均（仮定の世界）" prefix="" />
      </Beat>
      <Beat from={sum} to={end + 30}>
        <SimBackground />
        <Rules x={96} y={260} gap={30} every={30} items={["数を増やす → ほとんど変わらない", "狙う幅を広げる", "基準を動かさない", "少し下でも返してみる"]} />
        <Tag_ x={96} y={80} text="効いたのは、選び方の側を変えること" />
      </Beat>
      <ChapterDots current={5} total={5} />
    </>
  );
};

// ---------- 教訓 ----------
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const intro = find("同じふたりを", 200);
  const apart = find("歩いて10分の距離に住むふたりは", 500);
  const self = find("うまくいかない", 900);
  const lesson = find("入り口を広げることは", 1100);
  const last = find("誰も間違っていないのに", 1300);
  // 締めのひと言は字幕がないので、最後の字幕の終わりから始める（〔間・長〕のあいだに点を数え、声と同時に一文が出る。SignOff.tsx）
  const sign = end - 8;
  return (
    <>
      <Beat from={0} to={intro}>
        <SimBackground />
        <Town result={APP} box={STAGE} at={12} title="何も変えなかったアプリの町" tags={TAGS} compact />
      </Beat>
      <Beat from={intro} to={apart}>
        <Introduced />
      </Beat>
      <Beat from={apart} to={self}>
        <SimBackground />
        <Town result={INTRO} box={STAGE} at={0} title="ふたりは、別々の輪にいた" split={1.0} tags={TAGS} />
      </Beat>
      <Beat from={self} to={lesson}>
        <SimBackground />
        <Town result={APP} box={{ x: 96, y: 200, w: 820, h: 620 }} at={12} title="アプリの町" size={0.8} split={0.66} compact />
        <Town result={INTRO} box={{ x: 1000, y: 200, w: 820, h: 620 }} at={12} title="紹介の町" size={0.8} split={0.66} compact />
      </Beat>
      <Beat from={lesson} to={last}>
        <WalkingTown />
        <Headline text={"入り口を広げることは、\nひとりひとりには正しい"} />
      </Beat>
      <Beat from={last} to={sign}>
        <WalkingTown />
        <Headline text={"誰も間違っていないのに、\n出口だけが狭くなっていく"} />
      </Beat>
      <Beat from={sign} to={sign + 400}><SignOff /></Beat>
    </>
  );
};

// 終了画面は締めの夜の続き（2026-10-05 オーナー「次の1本・再生リストはここで出してよい」）
const End: React.FC = () => <SignOff end />;

const episode: EpisodeDef = {
  id: "001-where-couples-meet-v3",
  title: "アプリで出会いは増えたのに、なぜ結婚は増えないのか", // 仮。タイトルは meta.md で決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, hook: Hook, quiz: QuizSetup, "quiz-ask": QuizAsk,
    "ch1-card": Ch1Card, ch1: Ch1, "ch1-sim": Ch1Sim, "ch1-end": Ch1End,
    "ch2-card": Ch2Card, ch2: Ch2, "ch2-hearts": Ch2Hearts, "ch2-him": Ch2Him, "ch2-her": Ch2Her,
    verdict: Verdict, "ch3-card": Ch3Card, ch3: Ch3, "ch3-raise": Ch3Raise, "ch3-quiz": Ch3Quiz, "ch3-vouch": Ch3Vouch,
    "ch4-card": Ch4Card, ch4: Ch4, "ch4-office": Ch4Office, "ch4-sim": Ch4Sim, "ch4-trap": Ch4Trap,
    "ch5-card": Ch5Card, ch5: Ch5, "ch5-wide": Ch5Wide, "ch5-bar": Ch5Bar, "ch5-again": Ch5Again,
    lesson: Lesson, end: End,
  }),
  bgm: [
    { file: "Sizzr - Schwartzy.mp3", from: "opening", to: "hook", startAt: 10 },
    { file: "Stayin' Lazy - Godmode.mp3", from: "quiz", to: "quiz-ask" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch1-card", to: "ch2-her" },
    { file: "Traversing - Godmode.mp3", from: "verdict" },
    { file: "Stayin' Lazy - Godmode.mp3", from: "ch3-card", to: "ch3-vouch" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch4-card", to: "ch5-again" },
    { file: "Away - Patrick Patrikios.mp3", from: "lesson", to: "end" },
  ],
};
export default episode;
