// 2本目「r > g は『働くより資産』という意味なのか」の場面のコード（台本は script.md、絵コンテは Storyboard.tsx と storyboard.md）。
// 絵は絵コンテの場面（Storyboard.tsx の P01〜P45）をそのまま使い、ここで「いつ出るか・どう動くか」を付ける。
// 場面の中は「区切り（Beat）」で10〜20秒ごとに絵を替える。区切りの時刻は読み上げの語（useNarration().find）に合わせる。
// 数字は sources.csv、シミュレーションは data/snowball.py・data/villages_result.md。色はお金の意味の色（docs/brand.md）。
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera } from "@lib/Camera";
import { ChannelTag, SubscribeNudge } from "@lib/Cards";
import { Cat } from "@lib/Cat";
import { ChapterCard, ChapterDots } from "@lib/Chapter";
import { EndScreen } from "@lib/EndScreen";
import type { EpisodeDef } from "@lib/Episode";
import { Gosa } from "@lib/Gosa";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { SignOff } from "@lib/SignOff";
import { SimBackground } from "@lib/SimBackground";
import { Slider } from "@lib/Slider";
import { ballR, Cloud, Snow, Snowball } from "@lib/Snowball";
import { SourceNote } from "@lib/SourceNote";
import { Verdict } from "@lib/Verdict";
import { VILLAGES } from "@lib/Village";
import { C, EASE, font, LINE, R, sp } from "@lib/theme";
import timing from "../timing.json";
import {
  AGES, flow, grow, Heading, HIM, History, HUNDRED, Label, MARKETS, P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11,
  P14, P15, P19, P22, P23, P24, P25, P26, P27, P28, P32, P35, P38, P40, P41, P42, P44, RangeRows, RES, RES1990,
  RowsNote, Shops, Svg, VillageTile,
} from "./Storyboard";

// ---------- 共通 ----------
const useCue = () => {
  const n = useNarration();
  const find = (word: string, fallback: number) => { try { return n.find(word); } catch { return fallback; } };
  return { n, find, end: n.end() };
};
const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) =>
  to > from ? <Sequence from={from} durationInFrames={to - from}>{children}</Sequence> : null;
/** 区切りの頭で、ばね（enter）で出す */
const Enter: React.FC<{ children: React.ReactNode; start?: number }> = ({ children, start = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  if (frame < start) return null;
  return <AbsoluteFill style={{ opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>{children}</AbsoluteFill>;
};
/** a〜b フレームで 0→1（なめらか） */
const prog = (frame: number, a: number, b: number) => interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
/** 一枚の札（文の説明）。区切りの途中で出す */
const Card: React.FC<{ x: number; y: number; w: number; text: string; sub?: string; start?: number; tint?: string }> = ({ x, y, w, text, sub, start = 0, tint = C.white }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: t, transform: `translateY(${(1 - t) * 20}px)`, padding: "22px 32px",
      background: tint, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.lg }}>
      <div style={{ ...font("label"), lineHeight: 1.4 }}>{text}</div>
      {sub && <div style={{ ...font("note", C.ink2), marginTop: 8 }}>{sub}</div>}
    </div>
  );
};
/** 年めくり（右上） */
const YearFlip: React.FC<{ label: string; x?: number; y?: number }> = ({ label, x = 1500, y = 150 }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "10px 24px", background: C.ink, color: C.white, borderRadius: R.md, ...font("value", C.white) }}>{label}</div>
);

// ================= 冒頭 =================
const Opening: React.FC = () => {
  const { find, end } = useCue();
  const app = find("証券アプリ", 120), wage = find("ここ数年", 240), nikkei = find("そのあいだに", 420);
  return (
    <>
      <Beat from={0} to={app}><Camera drift={app}><P01 /></Camera></Beat>
      <Beat from={app} to={wage}><Enter><P02 /></Enter></Beat>
      <Beat from={wage} to={nikkei}><Enter><P03 /></Enter></Beat>
      <Beat from={nikkei} to={end + 20}><Enter><P04 /></Enter></Beat>
      <ChannelTag start={20} />
    </>
  );
};
const Hook: React.FC = () => {
  const { find, end } = useCue();
  const piketty = find("ところが", 400), mean = find("では、この式は", 700), roads = find("預金か", 760);
  return (
    <>
      <Beat from={0} to={piketty}><Enter><P05 /></Enter></Beat>
      <Beat from={piketty} to={mean}><Enter><P06 /></Enter></Beat>
      <Beat from={mean} to={end + 20}>
        <Enter><P07 /></Enter>
        {/* 「預金か、投資か…」の1語ごとに札が立つ。札が立つまでは紙で隠す */}
        <RoadCover start={roads - mean} />
      </Beat>
    </>
  );
};
/** 四つの道の札を1枚ずつ見せる（立つ前の札を紙色で隠す） */
const RoadCover: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      {[0, 1, 2, 3].map((i) => {
        const on = frame >= start + i * 18;
        return on ? null : <rect key={i} x={300 + i * 440 - 160} y={210} width={320} height={320} fill={C.bg} />;
      })}
    </Svg>
  );
};
const Today: React.FC = () => <P08 />;
const Quiz: React.FC = () => <P09 />;
const QuizMap: React.FC = () => <Enter><P10 /></Enter>;

// ================= 第1章 =================
const Ch1Card: React.FC = () => <ChapterCard no={1} title="r ＞ g は本当か" />;
const Ch2Card: React.FC = () => <ChapterCard no={2} title="r は誰の財布の話か" />;
const Ch3Card: React.FC = () => <ChapterCard no={3} title="六つの村で二十年" />;

const Ch1: React.FC = () => {
  const { find, end } = useCue();
  const frame = useCurrentFrame();
  const lines = find("では、二本の線", 600), land = find("昔の人にとって", 900), g = find("一方の g", 1100), ask = find("ここで、考えて", 1400);
  return (
    <>
      <Beat from={0} to={lines}><Enter><P11 /></Enter></Beat>
      <Beat from={lines} to={ask}>
        <Enter>
          <Heading>r と g の二千年（世界）</Heading>
          <History after={false} draw={prog(frame, lines + 30, land)} gDraw={prog(frame, g, g + 150)} />
          <SourceNote text="Piketty (2014) 図10.9（世界・税引き前。1700年までの r は推定）" />
        </Enter>
        {/* 昔の資本＝土地。地主に毎年、地代が届く（挿し絵） */}
        <Sequence from={land - lines} durationInFrames={Math.max(1, g - land)}><Landlord /></Sequence>
      </Beat>
      <Beat from={ask} to={end + 20}>
        <Heading>r と g の二千年（世界）</Heading>
        <History after={false} />
        <Card x={1000} y={150} w={560} text="青緑の g が金色の r の上に出たのは、いつ？" />
        <Gosa cues={[[0, "thinking"]]} size="M" />
        <SourceNote text="Piketty (2014) 図10.9（世界・税引き前。1700年までの r は推定）" />
      </Beat>
    </>
  );
};
/** 挿し絵：地主（猫）に、毎年の収穫の一部（俵）が届く */
const Landlord: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <div style={{ position: "absolute", left: 1180, top: 170, width: 600, height: 300, opacity: t, background: C.white, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.lg }}>
      <svg width={600} height={300}>
        <Cat kind="other" x={120} y={250} size={2.6} pose="sit" face="happy" label="地主" />
        {[0, 1, 2].map((i) => {
          const x = interpolate((frame + i * 25) % 75, [0, 75], [560, 220]);
          return <g key={i}><ellipse cx={x} cy={232} rx={34} ry={22} fill={C.goldTint} stroke={C.ink} strokeWidth={3} /><line x1={x - 30} x2={x + 30} y1={232} y2={232} stroke={C.ink} strokeWidth={2} /></g>;
        })}
        <text x={300} y={60} textAnchor="middle" style={font("label")}>毎年、収穫の一部が地代に</text>
      </svg>
    </div>
  );
};
const Ch1Answer: React.FC = () => {
  const { find } = useCue();
  const frame = useCurrentFrame();
  const sink = find("戦争で失われた", 200), c21 = find("二十一世紀", 400);
  return (
    <>
      <Heading>税と戦争の損を引くと、r が潜る</Heading>
      <History after={false} sink={prog(frame, sink, sink + 45)} />
      <Card x={300} y={150} w={1520} start={c21} tint={C.goldTint} text="二十一世紀の見込み（2012〜2050年）：税を引いても r 3.9% ＞ g 3.3%" />
      <SourceNote text="Piketty (2014) 図10.9・10.10（点線は税と損を引く前）" />
    </>
  );
};
const Ch1More: React.FC = () => {
  const { find, end } = useCue();
  const turn = find("ここまで聞くと", 500);
  return (
    <>
      <Beat from={0} to={turn}><Enter><P14 /></Enter></Beat>
      <Beat from={turn} to={end + 20}><Enter><P15 /></Enter></Beat>
    </>
  );
};

// ================= 第2章 =================
/** 100マス：年代の列に1マスずつ積み上がる（n＝積んだマスの数） */
const AgeSquares: React.FC<{ n: number }> = ({ n }) => {
  let k = 0;
  return (
    <AbsoluteFill>
      <Heading>家計の金融資産：100マスのうち、どの年代？</Heading>
      <Svg>
        {AGES.map(([a, cnt], i) => {
          const x = 150 + i * 240, cols = 4, sz = 40, gap = 8;
          const color = i === 0 ? C.teal : i >= 4 ? C.gold : C.goldTint;
          return (
            <g key={a}>
              {Array.from({ length: cnt }, (_, j) => (k++ < n ? <rect key={j} x={x + (j % cols) * (sz + gap)} y={760 - Math.floor(j / cols) * (sz + gap) - sz} width={sz} height={sz} rx={4} fill={color} /> : null))}
              <Label x={x + 92} y={805} anchor="middle" size="note">{a}</Label>
              {k >= AGES.slice(0, i + 1).reduce((s, [, c]) => s + c, 0) && n >= k && <Label x={x + 92} y={760 - Math.ceil(cnt / cols) * (sz + gap) - 16} anchor="middle" weight={900}>{cnt}%</Label>}
            </g>
          );
        })}
        {n >= 99 && <><path d="M1110 360 V340 H1830 V360" fill="none" stroke={C.ink} strokeWidth={LINE.thin} /><Label x={1470} y={320} anchor="middle" weight={900}>60歳以上 6割超</Label></>}
      </Svg>
      <SourceNote text="全国家計構造調査 2019（内閣官房 資産所得倍増に関する基礎資料集 p.3）。四捨五入で合計99" />
    </AbsoluteFill>
  );
};
const Ch2: React.FC = () => {
  const frame = useCurrentFrame();
  const { find } = useCue();
  const young = find("三十歳未満", 200);
  return (
    <>
      <AgeSquares n={Math.round(99 * prog(frame, 30, young))} />
      <ChapterDots current={2} />
    </>
  );
};
/** 雲・雪・雪玉：雪玉が坂を横へ動き（回さない）、利息（金）と降った雪（青緑）の層が順に太る */
const Ch2Snow: React.FC = () => {
  const frame = useCurrentFrame();
  const { find } = useCue();
  const roll = find("転がすと", 60), sky = find("空からは", 200), cloud = find("給料という雲", 400);
  const a = prog(frame, roll, roll + 90), b = prog(frame, sky, sky + 120);
  const x = 520 + 340 * prog(frame, roll, cloud + 60), y = 560 + (x - 100) * (340 / 1720);
  return (
    <AbsoluteFill>
      <Svg>
        {frame >= sky - 10 && <Cloud x={860} y={170} w={560} label={frame >= cloud ? "給料" : undefined} />}
        {frame >= sky && <Snow x={680} y={260} w={360} h={250} n={Math.round(22 * b)} />}
        <path d="M100 560 L1820 900" stroke={C.ink} strokeWidth={LINE.thin} />
        <Snowball x={x} y={y - 60 - 4 * a - 6 * b} core={37} interest={60 * a} snow={160 * b} k={7} />
        <Cat kind="male" x={x - 170} y={y + 70} size={2.6} pose="walk" facing={1} phase={(frame % 30) / 30} label="彼" />
        {[[C.tealTint, "降った雪（給料から貯める分）", sky], [C.gold, "利息（転がって巻きこんだ雪）", roll], [C.other, "はじめの額", 0]].map(([c, t, f], i) =>
          frame >= (f as number) ? <g key={t as string}><rect x={1250} y={262 + i * 70} width={44} height={44} rx={22} fill={c as string} stroke={C.ink} strokeWidth={3} /><Label x={1310} y={298 + i * 70}>{t as string}</Label></g> : null)}
      </Svg>
    </AbsoluteFill>
  );
};
/** 全員が同じ雪玉の町：年めくりで全員が同じだけ育つ */
const Ch2Town: React.FC = () => {
  const frame = useCurrentFrame();
  const { find } = useCue();
  const roll = find("十年転がすと", 300), same = find("差は生まれません", 500);
  const y = Math.round(10 * prog(frame, roll, roll + 150));
  const g = grow(37), f = y / 10;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>全員が同じ雪玉の町</Heading>
      <Svg>
        {Array.from({ length: 100 }, (_, i) => (
          <Snowball key={i} x={200 + (i % 20) * 76} y={260 + Math.floor(i / 20) * 110} core={37} interest={g.interest * f} snow={g.snow * f} k={1.1} />
        ))}
      </Svg>
      <YearFlip label={`${y}年目`} y={60} />
      {frame >= same && <div style={{ position: "absolute", left: 96, top: 160, ...font("label") }}>r ＞ g でも、差は生まれない</div>}
    </AbsoluteFill>
  );
};
const Ch2Real: React.FC = () => <Enter><P19 /></Enter>;
/** 百人の雪玉を十年転がす：年めくりで全員に同じ雪が降り、大きい雪玉だけ金の層が太る。答えで13人に金の輪 */
const Ch2Roll: React.FC = () => {
  const frame = useCurrentFrame();
  const { find, end } = useCue();
  const run = find("利回りは", 60), ask = find("増えた分の半分以上", 400), ans = find("1割ほど", 520), slider = find("降る雪の量を変える", 800);
  const yrs = 10 * prog(frame, run, ask);
  const k = 0.88;
  const balls = HUNDRED.map((a) => {
    const total = a * Math.pow(1.05, yrs) + 50 * ((Math.pow(1.05, yrs) - 1) / 0.05);
    return { core: a, snow: 50 * yrs, interest: Math.max(0, total - a - 50 * yrs) };
  });
  const final = HUNDRED.map(grow);
  const rs = final.map((b) => ballR(b.core + b.interest + b.snow, k)), pos = flow(rs, 140, 1780, 290, 8);
  return (
    <>
      <Beat from={0} to={slider}>
        <AbsoluteFill>
          <SimBackground />
          <Heading>10年後：増えた分の半分以上が金色の人は？</Heading>
          <Svg>
            {balls.map((b, i) => {
              const front = frame >= ans && final[i].interest >= final[i].snow;
              return (
                <g key={i} transform={front ? "translate(0,-14)" : undefined}>
                  <Snowball x={pos[i].x} y={pos[i].y} {...b} k={k} />
                  {front && <circle cx={pos[i].x} cy={pos[i].y} r={rs[i] + 8} fill="none" stroke={C.gold} strokeWidth={LINE.base} />}
                </g>
              );
            })}
          </Svg>
          <YearFlip label={`${Math.round(yrs)}年目`} x={96} y={160} />
          {frame >= ans && <div style={{ position: "absolute", left: 1500, top: 150, ...font("value") }}>13人</div>}
          <SourceNote sim prefix="条件：" text="利回り年5%・降る雪は一人年50万円（仮定）" />
        </AbsoluteFill>
      </Beat>
      <Beat from={slider} to={end + 20}><SnowSlider /></Beat>
    </>
  );
};
/** 降る雪のつまみを 20万→100万 へ動かす。前に出る人数（半分以上が金色）が 29→16→13→4 と変わる */
const SNOW: [string, number][] = [["20万", 29], ["30万", 16], ["50万", 13], ["100万", 4]];
const SnowSlider: React.FC = () => {
  const frame = useCurrentFrame();
  const keys: [number, number][] = [[0, 2], [20, 0], [70, 1], [120, 2], [170, 3]];
  let cur = 2;
  for (const [f, v] of keys) if (frame >= f) cur = v;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>降る雪の量を変えると</Heading>
      <Slider label="一人の降る雪（1年）" stops={SNOW.map(([s]) => s)} keys={keys} x={260} y={320} w={1300} />
      <Svg>
        {SNOW.map(([s, n], i) => (
          <g key={s}>
            <Label x={260 + (i * 1300) / 3} y={620} anchor="middle" size="value" color={i === cur ? C.gold : C.rest}>{n}人</Label>
            <Label x={260 + (i * 1300) / 3} y={680} anchor="middle" size="note" color={C.ink2}>半分以上が金</Label>
          </g>
        ))}
        <Label x={260} y={790}>どの量でも、多くの人で水色（降った雪）が勝つ</Label>
      </Svg>
      <SourceNote sim prefix="条件：" text="利回り年5%・10年（data/snowball.py）" />
    </AbsoluteFill>
  );
};
const Ch2Him: React.FC = () => {
  const { find } = useCue();
  return <Enter><P22 /></Enter>;
};
const Ch2Critique: React.FC = () => {
  const { find, end } = useCue();
  const nations = find("国どうし", 400), big = find("それでも、大きな雪玉", 700);
  return (
    <>
      <Beat from={0} to={nations}><Enter><P23 /></Enter></Beat>
      <Beat from={nations} to={end + 20}>
        <Heading>国どうしを比べると</Heading>
        <Card x={96} y={260} w={1500} text="r と g の差が大きい国ほど格差が大きい、という関係は見つからなかった" sub="Acemoglu & Robinson (2015)" />
        <Card x={96} y={520} w={1500} start={big - nations} tint={C.goldTint} text="それでも、大きな雪玉だけは話が別" />
      </Beat>
    </>
  );
};
const Ch2Big: React.FC = () => {
  const { find, end } = useCue();
  const grows = find("しかも", 500), norway = find("ノルウェー", 1000), piketty = find("ピケティが言いたかった", 1200);
  return (
    <>
      <Beat from={0} to={grows}><Enter><P24 /></Enter></Beat>
      <Beat from={grows} to={norway}><Enter><P25 /></Enter></Beat>
      <Beat from={norway} to={end + 20}>
        <P25 />
        <Card x={830} y={170} w={940} tint={C.goldTint} text="財産が大きい人ほど、利回りそのものも高い傾向（ノルウェー）" />
        <Card x={830} y={420} w={940} start={piketty - norway} text="r ＞ g だと、もとからある差が時間とともに広がりやすい" sub="ピケティが言いたかったこと" />
      </Beat>
    </>
  );
};

// ================= 第3章 =================
const Ch3: React.FC = () => {
  const { find } = useCue();
  const frame = useCurrentFrame();
  const job = find("転職して", 200), biz = find("自分で始めた", 400);
  return (
    <>
      <P26 />
      {/* 2つ目・3つ目の固まりは、読み上げに合わせて出す（出る前は紙で隠す） */}
      <Svg>
        {frame < job && <rect x={720} y={150} width={1200} height={740} fill={C.bg} />}
        {frame >= job && frame < biz && <rect x={1360} y={150} width={560} height={740} fill={C.bg} />}
      </Svg>
      <SubscribeNudge start={30} />
    </>
  );
};
const Ch3Villages: React.FC = () => {
  const { find, end } = useCue();
  const frame = useCurrentFrame();
  const order = ["一つ目", "二つ目", "三つ目", "四つ目", "五つ目", "六つ目"].map((w, i) => find(w, 100 + i * 120));
  const assume = find("先に、仮定", 900), run = find("そして、四十五歳", 1300);
  const age = 25 + Math.round(20 * prog(frame, run, end));
  return (
    <>
      <Beat from={0} to={assume}>
        <AbsoluteFill>
          <Heading>六つの村（二十五歳の百人ずつ）</Heading>
          <Svg>{VILLAGES.map((v, i) => (frame >= order[i] - 10 ? <VillageTile key={v} v={v} i={i} /> : null))}</Svg>
        </AbsoluteFill>
      </Beat>
      <Beat from={assume} to={run}><Enter><P28 /></Enter></Beat>
      <Beat from={run} to={end + 20}>
        <SimBackground />
        <Svg>{VILLAGES.map((v, i) => <VillageTile key={v} v={v} i={i} balls={frame - run > 40} />)}</Svg>
        <YearFlip label={`${age}歳`} x={96} y={60} />
      </Beat>
    </>
  );
};
const Ch3Quiz: React.FC = () => (
  <>
    <SimBackground />
    <Svg>{VILLAGES.map((v, i) => <VillageTile key={v} v={v} i={i} balls><Label x={96 + (i % 3) * 590 + 530} y={170 + Math.floor(i / 3) * 350 + 70} anchor="end" size="value" color={C.ink2}>{"ABCDEF"[i]}</Label></VillageTile>)}</Svg>
    <div style={{ position: "absolute", left: 96, top: 56, width: 1400, ...font("label") }}>
      <span style={{ ...font("question") }}>45歳</span>　下の1割の人が、資産をほとんど残せなかった村は？
    </div>
  </>
);
/** 村の結果の行。show 行目まで出す。ghost は1990年からの幅（点線） */
const Rows: React.FC<{ show: number; title: string; ghost?: Record<string, typeof RES[number]>; mark?: string[]; note?: string }> = ({ show, title, ghost, mark, note }) => (
  <AbsoluteFill>
    <SimBackground />
    <Heading>{title}</Heading>
    <RangeRows rows={RES} show={show} dom={[-500, 3500]} ticks={[0, 1000, 2000, 3000]} ghost={ghost} mark={mark} />
    {note && <div style={{ position: "absolute", left: 1040, top: 180, ...font("note", C.ink2) }}>{note}</div>}
    <RowsNote />
  </AbsoluteFill>
);
const Ch3Savings: React.FC = () => <Enter><Rows show={1} title="45歳の資産：預金の村" /></Enter>;
const Ch3Stocks: React.FC = () => {
  const { find, end } = useCue();
  const draw = find("この村では", 300), bad = find("日本株が振るわなかった", 800);
  return (
    <>
      <Beat from={0} to={draw}><Enter><P04 /></Enter></Beat>
      <Beat from={draw} to={bad}><Enter><Rows show={2} title="積立の村：真ん中は上がり、幅も広がる" /></Enter></Beat>
      <Beat from={bad} to={end + 20}><Rows show={2} title="積立の村：真ん中は上がり、幅も広がる" ghost={{ 積立: RES1990.積立 }} note="点線：日本株が振るわなかった1990年からの幅" /></Beat>
    </>
  );
};
const Ch3Career: React.FC = () => {
  const { find, end } = useCue();
  const income = find("変わったのは", 300);
  return (
    <>
      <Beat from={0} to={income}><Rows show={3} title="稼ぐ力の村：資産は預金の村とほぼ同じ" /></Beat>
      <Beat from={income} to={end + 20}><Enter><P32 /></Enter></Beat>
    </>
  );
};
const Ch3Startup: React.FC = () => <Rows show={4} title="起業の村：下の1割は、ほとんど残らない" />;
const Ch3Slider: React.FC = () => {
  const { find, end } = useCue();
  const frame = useCurrentFrame();
  const us = find("アメリカの研究では", 500), knob = find("画面のつまみ", 800);
  const years = prog(frame, find("日本の調査", 60), find("調べた相手", 300));
  return (
    <>
      <Beat from={0} to={us}>
        <AbsoluteFill>
          <Heading>起業の村：5年後に残る事業</Heading>
          <Svg>
            <Shops x={180} open={Math.round(100 - 10 * years)} label="日本 約9割" sub="公庫の融資先（2016年開業）" />
            <Shops x={1100} open={Math.round(100 - 50 * years)} label="アメリカ 約半分" sub="事業所（2015年開業）" />
          </Svg>
          <SourceNote text="日本政策金融公庫 新規開業パネル調査／米国労働統計局 BED。調べた相手も数え方も違う" />
        </AbsoluteFill>
      </Beat>
      <Beat from={us} to={end + 20}>
        <DebtSlider knob={knob - us} />
      </Beat>
    </>
  );
};
/** 借金が残る割合のつまみ：50% → 0% → 100% → 50% */
const DebtSlider: React.FC<{ knob: number }> = ({ knob }) => {
  const frame = useCurrentFrame();
  const steps: [number, number][] = [[0, 1], [knob, 0], [knob + 60, 2], [knob + 120, 1]];
  let cur = 1;
  for (const [f, v] of steps) if (frame >= f) cur = v;
  const vals = [567, 485, 396];
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>起業の村：やめた人に借金が残る割合</Heading>
      <Slider label="借金が残る割合（日本のデータなし＝仮定）" stops={["0%", "50%", "100%"]} keys={steps} x={300} y={330} w={1200} />
      <Svg>
        {vals.map((v, i) => (
          <g key={v}>
            <Label x={300 + i * 600} y={600} anchor="middle" size="value" color={i === cur ? C.ink : C.rest}>{`${v}万`}</Label>
            <Label x={300 + i * 600} y={650} anchor="middle" size="note" color={C.ink2}>真ん中の人の資産</Label>
          </g>
        ))}
        <Label x={720} y={760} size="note" color={C.ink2}>アメリカの研究：早めにやめた人は、会社員に戻っても</Label>
        <Label x={720} y={800} size="note" color={C.ink2}>給料が下がらなかった（日本のデータはない）</Label>
        {[0, 1, 2].map((i) => <Cat key={i} kind="other" x={290 + i * 130} y={800} size={1.6} pose="down" face="sad" seed={i} label="やめた人" />)}
      </Svg>
      <SourceNote sim text="Manso (2016) RFS" />
      <Gosa cues={[[knob, "depends"]]} says={[[knob, "ひげ、のびます。"]]} size="M" />
    </AbsoluteFill>
  );
};
const Ch3Property: React.FC = () => {
  const { find, end } = useCue();
  const flat = find("値段が横ばいなら", 300), up = find("東京で", 600), down = find("地価が十五年", 800), lever = find("借金で買うので", 1000);
  const frame = useCurrentFrame();
  const shown = frame >= down ? 3 : frame >= up ? 2 : 1;
  const order = shown === 1 ? [MARKETS[1]] : shown === 2 ? [MARKETS[0], MARKETS[1]] : MARKETS;
  return (
    <>
      <Beat from={0} to={flat}><Rows show={5} title="不動産の村：物件の値段しだい" /></Beat>
      <Beat from={flat} to={lever}>
        <AbsoluteFill>
          <SimBackground />
          <Heading>同じワンルーム、値段の動きだけ変える</Heading>
          <RangeRows rows={order} show={order.length} dom={[-2000, 6000]} ticks={[-2000, 0, 2000, 4000, 6000]} icons={false} y0={340} step={170} />
          <SourceNote sim prefix="条件：" text="不動産の村の45歳の資産。上がる＝東京2008〜25年型、下がる＝15年下がる型" />
        </AbsoluteFill>
      </Beat>
      <Beat from={lever} to={end + 20}><Enter><P35 /></Enter></Beat>
    </>
  );
};
const Ch3Both: React.FC = () => <Rows show={6} title="両方の村" ghost={RES1990} note="点線：株が振るわなかった1990年からの幅" />;
const Ch3Sum: React.FC = () => {
  const { find, end } = useCue();
  const him = find("同じ彼を", 500);
  return (
    <>
      <Beat from={0} to={him}><Rows show={6} title="並べると：下の1割を崩したのは、借金" ghost={RES1990} mark={["起業", "不動産"]} note="点線：株が振るわなかった1990年からの幅" /></Beat>
      <Beat from={him} to={end + 20}><Enter><P38 /></Enter></Beat>
    </>
  );
};

// ================= 答え合わせ・示唆・教訓 =================
const VerdictScene: React.FC = () => {
  const { find, end } = useCue();
  const only = find("言えるのは", 900);
  return (
    <>
      <Beat from={0} to={only}>
        <Verdict claim="r＞gだから、働くより資産" mark="×" reason={["r＞gは歴史のほとんどで本当", "利息を大きく受け取るのは大きな雪玉", "下の人を崩したのは借金"]} start={find("証拠は", 60)} />
      </Beat>
      <Beat from={only} to={end + 20}>
        <Heading>言えるのは、ここまで</Heading>
        <Card x={96} y={300} w={1500} tint={C.goldTint} text="大きな雪玉を持つ家族の資産は、金額で見ると、とても大きく太りやすい" />
      </Beat>
    </>
  );
};
const VerdictQuiz: React.FC = () => {
  const { find, end } = useCue();
  const flow200 = find("200倍", 400);
  return (
    <>
      <Beat from={0} to={flow200}><Enter><P40 /></Enter></Beat>
      <Beat from={flow200} to={end + 20}><Enter><P41 /></Enter></Beat>
    </>
  );
};
const Suggest: React.FC = () => {
  const { find } = useCue();
  const frame = useCurrentFrame();
  const two = find("二つ目に", 300);
  return (
    <>
      <P42 />
      {/* 2つ目の札は読み上げに合わせて出す（出る前は紙で隠す） */}
      {frame < two && <Svg><rect x={90} y={440} width={1830} height={220} fill={C.bg} /></Svg>}
    </>
  );
};
/** 37万円の雪玉の大写しからカメラが引いて、巨大な雲を見せる（文字は引ききってから出す） */
const SuggestCloud: React.FC = () => {
  const { find } = useCue();
  const frame = useCurrentFrame();
  const out = find("学校を出てから", 60), shown = frame >= out + 100;
  return (
    <>
      <Camera keys={[[0, { x: 900, y: 760, scale: 3 }], [out, { x: 960, y: 540, scale: 1 }]]} dur={90}>
        <Svg>
          <Cloud x={900} y={430} w={1500} label={shown ? "60歳までの給料（正社員） 1億6千万〜2億6千万円" : undefined} />
          <Snow x={500} y={600} w={800} h={160} n={26} />
          <Snowball x={900} y={760} core={37} k={3} />
          <Label x={940} y={772}>37万円の雪玉</Label>
        </Svg>
      </Camera>
      {shown && <Enter>
        <Svg>
          <Cloud x={1690} y={700} w={300} dashed />
          <Label x={1840} y={820} anchor="end" size="note" color={C.ink2}>正社員でないと、もっと少ない</Label>
        </Svg>
        <SourceNote text="ユースフル労働統計2025 生涯賃金（学校を出て60歳まで正社員、退職金を除く）。雲と雪玉は面積で比べている" />
      </Enter>}
    </>
  );
};
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const subject = find("あの式には", 300), sign = find("数えてみると", end - 180);
  return (
    <>
      <Beat from={0} to={subject}><Camera drift={subject}><P44 /></Camera></Beat>
      <Beat from={subject} to={sign}>
        <Camera keys={[[0, { x: 960, y: 540, scale: 1 }], [Math.max(1, sign - subject - 200), { x: 1340, y: 380, scale: 1.25 }]]} dur={150}><P44 /></Camera>
        <Card x={96} y={110} w={900} text="主語を入れると、同じ式でも答えが変わる" tint={C.white} />
        <Card x={96} y={250} w={900} start={Math.max(0, find("雪玉の小さい人", subject + 200) - subject)} tint={C.tealTint} text="小さな雪玉を育てるのは、雲から降る雪" />
      </Beat>
      <Beat from={sign} to={sign + 400}><SignOff /></Beat>
    </>
  );
};
const End: React.FC = () => <EndScreen lesson={"いちばん大きな財産は、\n通帳ではなく、\n空の雲のほうにある。"} />;

const episode: EpisodeDef = {
  id: "002-r-greater-than-g",
  title: "r > g は「働くより資産」という意味なのか", // 仮。タイトルは meta.md で決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, hook: Hook, today: Today, quiz: Quiz, "quiz-map": QuizMap,
    "ch1-card": Ch1Card, ch1: Ch1, "ch1-answer": Ch1Answer, "ch1-more": Ch1More,
    "ch2-card": Ch2Card, ch2: Ch2, "ch2-snow": Ch2Snow, "ch2-town": Ch2Town, "ch2-real": Ch2Real, "ch2-roll": Ch2Roll,
    "ch2-him": Ch2Him, "ch2-critique": Ch2Critique, "ch2-big": Ch2Big,
    "ch3-card": Ch3Card, ch3: Ch3, "ch3-villages": Ch3Villages, "ch3-quiz": Ch3Quiz, "ch3-savings": Ch3Savings,
    "ch3-stocks": Ch3Stocks, "ch3-career": Ch3Career, "ch3-startup": Ch3Startup, "ch3-slider": Ch3Slider,
    "ch3-property": Ch3Property, "ch3-both": Ch3Both, "ch3-sum": Ch3Sum,
    verdict: VerdictScene, "verdict-quiz": VerdictQuiz, suggest: Suggest, "suggest-cloud": SuggestCloud, lesson: Lesson, end: End,
  }),
  bgm: [
    { file: "Sizzr - Schwartzy.mp3", from: "opening", to: "hook", startAt: 10 },
    { file: "Stayin' Lazy - Godmode.mp3", from: "today", to: "quiz-map" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch1-card", to: "ch2-big" },
    { file: "Stayin' Lazy - Godmode.mp3", from: "ch3-card", to: "ch3-quiz" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch3-savings", to: "ch3-sum" },
    { file: "Traversing - Godmode.mp3", from: "verdict", to: "verdict-quiz" },
    { file: "Away - Patrick Patrikios.mp3", from: "suggest", to: "end" },
  ],
};
export default episode;
