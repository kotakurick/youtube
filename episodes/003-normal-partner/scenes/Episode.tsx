// 3本目「『普通の相手』の条件を全部満たす人の数」の場面のコード（台本は script.md の第6稿、絵コンテは Storyboard.tsx と storyboard.md の第2版）。
// 絵は絵コンテの場面（Storyboard.tsx の P01〜P32）をそのまま使い、ここで「いつ出るか・どう動くか」を付ける。
// 場面の中は「区切り（Beat）」で10〜20秒ごとに絵を替える。区切りの時刻は読み上げの文（useNarration().at）か語（find）に合わせる。
// 動くのは：検索画面の人数が数え下がる・100人の色が抜ける（ふるわれる）・大きな数字がばねで出る・札が1枚ずつ出る。
// 数字は sources.csv（S2〜S4・S12・S13・S15・S16）と data/count_result.md。色は男女の色と物差しの意味の色（お金＝金、身長・体型＝青緑）。
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera } from "@lib/Camera";
import { Cat } from "@lib/Cat";
import { ChannelTag, TodayCard } from "@lib/Cards";
import { ChapterCard, ChapterDots } from "@lib/Chapter";
import { Dumbbell } from "@lib/Dumbbell";
import type { EpisodeDef } from "@lib/Episode";
import { Figure, Kind } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { Quiz, QUIZ_TIMING } from "@lib/Quiz";
import { shuffle } from "@lib/random";
import { SearchScreen } from "@lib/SearchScreen";
import { Sieve } from "@lib/Sieve";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import { Verdict, VERDICT_TIMING } from "@lib/Verdict";
import { C, EASE, font, LINE, R, sp } from "@lib/theme";
import timing from "../timing.json";
import {
  Big, DISCLAIM, Heading, Hundred, Label, LIT, P01, P02, P07, P08, P10, P12, P13, P13b, P14, P15, P17, P18, P19, P20c, P21, P22, P24, P25, P27a, P27b, P28, P29, P30a, P30b, P30c, ROWS, spread, Svg,
} from "./Storyboard-v2"; // 第2版の絵（本編は第13稿の絵コンテ第3版が決まってから書き直す。2026-10-07）

// ---------- 共通 ----------
const useCue = () => {
  const n = useNarration();
  const find = (word: string, fallback: number) => { try { return n.find(word); } catch { return fallback; } };
  return { n, find, at: n.at, end: n.end() };
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
/** 大きな数字：小さく出て、ばねで少し行き過ぎて戻る（この回いちばんの数字に使う） */
const Pop: React.FC<{ children: React.ReactNode; start?: number; x: number; y: number }> = ({ children, start = 0, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("pop", frame - start, fps);
  if (frame < start) return null;
  return <g opacity={Math.min(1, t * 2)} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * t}) translate(${-x},${-y})`}>{children}</g>;
};
/** a〜b フレームで 0→1（なめらか） */
const prog = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
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

/** 100人のうち、色の人が from 人から to 人へ減る（t0〜t0+dur）。消える順は種で決めた順（端から消えると「並び」に見えるので混ぜる）。
 *  keep(i) が true の人は最後まで残る人。 */
const useFade = (keep: (i: number) => boolean, from: number, to: number, t0: number, dur = 36, seed = 3) => {
  const frame = useCurrentFrame();
  const order = useMemo(() => shuffle(Array.from({ length: 100 }, (_, i) => i).filter((i) => !keep(i)), seed), [keep, seed]);
  const gone = Math.round((from - to) * prog(frame, t0, t0 + dur));
  const out = new Set(order.slice(100 - from, 100 - from + gone).concat(order.slice(0, 100 - from)));
  return (i: number) => !out.has(i);
};

// ================= 冒頭 =================
const Opening: React.FC = () => {
  const { at, end } = useCue();
  const recall = at(3), note = at(5);
  return (
    <>
      <Beat from={0} to={recall}><Camera drift={recall}><P01 /></Camera></Beat>
      <Beat from={recall} to={note}><Enter><P02 note={false} /></Enter></Beat>
      <Beat from={note} to={end + 20}><P02 /></Beat>
      <ChannelTag start={20} />
    </>
  );
};

/** 検索画面：checkAt で step 個目のチェックが入り、dropAt で人数が数え下がる。右の100人も一緒に色が抜ける（1人＝10人）。
 *  色が抜けるのは後ろの番号から（絵コンテの litAt と同じ並び。区切りをまたいでも同じ人が残る） */
const ScreenAnim: React.FC<{ step: number; checkAt: number; dropAt: number; gone?: number; note?: boolean }> = ({ step, checkAt, dropAt, gone, note = true }) => {
  const frame = useCurrentFrame();
  const COUNT = [1000, 132, 106, 59];
  const k = prog(frame, dropAt, dropAt + 36);
  const count = Math.round(COUNT[step - 1] + (COUNT[step] - COUNT[step - 1]) * k);
  const litN = LIT[step - 1] + (LIT[step] - LIT[step - 1]) * k;
  const lit = (i: number) => i < Math.round(litN);
  const goneT = gone === undefined ? 0 : sp("enter", frame - gone, 30);
  return (
    <AbsoluteFill>
      <Svg>
        <SearchScreen x={400} y={500} h={640} count={count} prev={frame >= dropAt ? COUNT[step - 1] : undefined}
          rows={ROWS(frame >= checkAt ? step : step - 1, frame >= checkAt ? step - 1 : undefined)} />
        <Label x={760} y={250} color={C.ink2}>25〜34歳の結婚していない男性　1人＝10人</Label>
        <Hundred x={760} y={290} kind="male" lit={lit} dx={52} />
        {gone !== undefined && frame >= gone && (
          <g data-qa="mark" data-qa-label="消える1人" opacity={goneT}>
            <rect x={760} y={760} width={720} height={64} rx={R.md} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 8" />
            <Cat kind="male" x={810} y={816} size={1.1} pose="sit" face="happy" />
            <Label x={860} y={804} color={C.ink2}>二回目の人：この画面には出てこない</Label>
          </g>
        )}
      </Svg>
      {note && <SourceNote text={DISCLAIM} prefix="" />}
    </AbsoluteFill>
  );
};
const OpeningScreen: React.FC = () => {
  const { at, end } = useCue();
  const s1 = at(2), s2 = at(5), s3 = at(9), notice = at(13), mirror = at(18);
  return (
    <>
      <Beat from={0} to={s1}>
        <Camera keys={[[0, { x: 400, y: 500, scale: 1.5 }], [Math.min(60, s1 - 30), { x: 960, y: 540, scale: 1 }]]} dur={36}>
          <ScreenAnim step={1} checkAt={9999} dropAt={9999} note={false} />
        </Camera>
        <SourceNote text={DISCLAIM} prefix="" start={Math.min(60, s1 - 30) + 36} />
      </Beat>
      <Beat from={s1} to={s2}><ScreenAnim step={1} checkAt={at(3) - s1} dropAt={at(4) - s1} /></Beat>
      <Beat from={s2} to={s3}><ScreenAnim step={2} checkAt={10} dropAt={at(6) - s2} /></Beat>
      <Beat from={s3} to={notice}><ScreenAnim step={3} checkAt={at(10) - s3} dropAt={at(11) - s3} /></Beat>
      <Beat from={notice} to={mirror}>
        <Camera drift={mirror - notice}>
          <ScreenAnim step={3} checkAt={-1} dropAt={-100} gone={at(16) - notice} note={false} />
        </Camera>
        <SourceNote text={DISCLAIM} prefix="" />
      </Beat>
      <Beat from={mirror} to={end + 20}><Enter><P07 /></Enter></Beat>
    </>
  );
};

const Today: React.FC = () => <P08 />;

/** 予想タイム：先に全体の差（約10ポイント）を1段のダンベルで見せ、そのあと問いと選択肢 */
const QuizScene: React.FC = () => {
  const { at, end } = useCue();
  const ask = at(7);
  return (
    <>
      <Beat from={0} to={ask}>
        <Enter>
          <Heading>背が低い男性ほど、結婚が決まりにくい？</Heading>
          <Dumbbell rows={[{ label: "男性会員 全体", a: 27.6, b: 37.4 }]} aLabel="160cm以下" bLabel="172cm" max={50} x={140} y={360} width={1500} rowH={150}
            format={(v) => `${v.toFixed(1)}%`} start={at(3)} />
          <SourceNote text="IBJ 結婚みらい研究所（2026）。成婚率＝成婚者÷（成婚者＋退会者）" />
        </Enter>
      </Beat>
      <Beat from={ask} to={end + 30}>
        <Quiz question="年収850万円以上の男性だけなら、背による差は？" choices={["ほとんど消える", "半分くらいに縮む", "変わらない", "もっと広がる"]} />
        <Svg><Label x={96} y={790} color={C.ink2}>全体では 160cm以下 27.6%・172cm 37.4%</Label></Svg>
        <SourceNote text="IBJ 結婚みらい研究所（2026）。成婚率＝成婚者÷（成婚者＋退会者）" />
      </Beat>
    </>
  );
};

// ================= 第1章 =================
const Ch1Card: React.FC = () => <ChapterCard no={1} title="画面の千人の正体" />;
const Ch2Card: React.FC = () => <ChapterCard no={2} title="1万人が答えた六つの条件" />;
const Ch3Card: React.FC = () => <ChapterCard no={3} title="会う前の条件と、会ったときの気持ち" />;

const Ch1: React.FC = () => {
  const { end } = useCue();
  return <Camera drift={end + 20}><Enter><P10 /></Enter></Camera>;
};
const Q1 = { question: "年収500万円以上の人のうち、大学を出ている人は？", choices: ["約2割", "約5割", "約8割", "ほぼ全員"], answer: 2, title: "考えてみよう" };
const Ch1Quiz: React.FC = () => <Quiz {...Q1} />;
const Ch1Answer: React.FC = () => {
  const { find, at, end } = useCue();
  const ans = find("約8割", 45), all = at(1);
  return (
    <>
      {/* 答えの選択肢は「約8割」と言う瞬間に光る */}
      <Beat from={0} to={all}><Quiz {...Q1} reveal start={ans - QUIZ_TIMING.reveal} /></Beat>
      <Beat from={all} to={end + 20}><Enter><P12 /></Enter></Beat>
    </>
  );
};
const Ch1Rulers: React.FC = () => {
  const { at, end } = useCue();
  const other = at(2), guess = at(6);
  return (
    <>
      <Beat from={0} to={other}>
        <Enter><P13 /></Enter>
      </Beat>
      <Beat from={other} to={guess}><P13b /></Beat>
      <Beat from={guess} to={end + 20}>
        {/* 冒頭の画面に戻って、59人が見積もりであることを断る */}
        <Enter>
          <ChapterDots current={1} />
          <Svg><SearchScreen x={400} y={500} h={640} count={59} rows={ROWS(3)} /></Svg>
          <Card x={780} y={330} w={1040} start={12} text="冒頭の59人は、身長と年収は関係ないとみなした見積もり" sub="本当は、もう少し多く残るかもしれない" />
          <SourceNote text="身長と給料の関係は弱い（慶應義塾大学 PDRC DP2009-010）。身長は見積もり" />
        </Enter>
      </Beat>
    </>
  );
};
const Ch1Multiply: React.FC = () => {
  const { at, end } = useCue();
  const left = at(2), right = at(4), twice = at(5);
  return (
    <>
      <Beat from={0} to={left}>
        <Enter>
          <ChapterDots current={1} />
          <Heading>ばらばらの確率として、掛け算すると</Heading>
          <Card x={300} y={380} w={1320} text="年収 × 大学 × 身長　を、関係のない3つの確率として掛ける" sub="「普通の人はほとんどいない」という話の数え方" />
        </Enter>
      </Beat>
      <Beat from={left} to={right}><Enter><P14 show={1} /></Enter></Beat>
      <Beat from={right} to={twice}><P14 /></Beat>
      <Beat from={twice} to={end + 20}>
        <P14 />
        <Card x={140} y={700} w={1640} text="同じ物差しの上の条件を、二重に数えている" tint={C.goldTint} />
      </Beat>
    </>
  );
};

// ================= 第2章 =================
const Ch2: React.FC = () => {
  const { at, end } = useCue();
  return (
    <>
      <Beat from={0} to={at(3)}><Enter><P15 show={0} /></Enter></Beat>
      <Beat from={at(3)} to={at(7)}><P15 show={1} /></Beat>
      <Beat from={at(7)} to={end + 20}><Camera drift={end - at(7) + 20}><P15 /></Camera></Beat>
    </>
  );
};
/** 100人がふるわれて n 人が残る（t0 から）。big は残ったあとに出す大きな数字 */
const Sifted: React.FC<{ kind: Kind; n: number; t0: number; title: string; big?: string; bigAt?: number; sub?: string; source: string; children?: React.ReactNode }> = (
  { kind, n, t0, title, big, bigAt = 0, sub, source, children },
) => {
  const keep = useMemo(() => spread(n), [n]);
  const lit = useFade(keep, 100, n, t0, 45, n);
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>{title}</Heading>
      <Svg>
        <Hundred x={100} y={240} kind={kind} lit={lit} dx={46} />
        {big && <Pop start={bigAt} x={1240} y={430}><Big x={1080} y={480} text={big} sub={sub} /></Pop>}
        {children}
      </Svg>
      <SourceNote text={source} />
    </AbsoluteFill>
  );
};
const Ch2Women: React.FC = () => {
  const { at, find, end } = useCue();
  const ans = find("8人に1人", at(3)), bars = at(5), why = at(7);
  return (
    <>
      <Beat from={0} to={bars}>
        <Sifted kind="male" n={13} t0={at(1) + 20} title="女性の六つの条件を、全部満たす男性" big="8人に1人" bigAt={ans} sub={undefined}
          source="鈴木・八代（2025）表2（女性の希望率13.3%）">
          {/* 「数パーセント、ではありません」で一行を足す */}
          <Sequence from={at(4)}><Enter><Label x={1086} y={560} color={C.ink2}>数パーセント、ではない</Label></Enter></Sequence>
        </Sifted>
      </Beat>
      <Beat from={bars} to={why}><Grow><P17 /></Grow></Beat>
      <Beat from={why} to={at(9)}><Enter><P18 show={1} /></Enter></Beat>
      <Beat from={at(9)} to={at(11)}><P18 show={2} /></Beat>
      <Beat from={at(11)} to={end + 20}><P18 /></Beat>
    </>
  );
};
/** 棒グラフを下から伸ばす（区切りの頭から1秒）。下の帯（y740）を軸にする */
const Grow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = prog(frame, 6, 36);
  return <AbsoluteFill style={{ clipPath: `inset(${(1 - t) * 100}% 0 0 0)` }}>{children}</AbsoluteFill>;
};
const Ch2Men: React.FC = () => {
  const { at, find, end } = useCue();
  const ans = find("3人に1人", at(1));
  return (
    <>
      <Beat from={0} to={at(2)}>
        <Sifted kind="female" n={33} t0={at(1)} title="男性の六つの条件を、全部満たす女性" big="3人に1人" bigAt={ans} source="鈴木・八代（2025）表2（男性の希望率32.5%）" />
      </Beat>
      <Beat from={at(2)} to={at(4)}><P19 show={1} /></Beat>
      <Beat from={at(4)} to={end + 20}><P19 /></Beat>
    </>
  );
};
/** ふるいの場面：100人が上からふるわれて n 人が残る */
const SieveAnim: React.FC<{ kind: Kind; n: number; title: string; who: string }> = ({ kind, n, title, who }) => {
  const frame = useCurrentFrame();
  const keep = useMemo(() => spread(n), [n]);
  const lit = useFade(keep, 100, n, 20, 45, n + 1);
  const shake = Math.sin(frame / 3) * 8 * (1 - prog(frame, 20, 65));
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>{title}</Heading>
      <Svg>
        <Sieve x={330 + shake} y={400} w={400} label={who} tilt={shake / 4} />
        <Hundred x={680} y={240} kind={kind} lit={lit} dx={52} />
        <Label x={680} y={790} size="value">{`100人に${n}人`}</Label>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2" />
    </AbsoluteFill>
  );
};
const Ch2Sieve: React.FC = () => {
  const { at, find, end } = useCue();
  const one = at(3), two = at(4), big = find("26人に1人", at(7));
  return (
    <>
      <Beat from={0} to={one}>
        <Enter>
          <ChapterDots current={2} />
          <Heading>ここまでの数字</Heading>
          <Svg>
            <Big x={140} y={460} text="8人に1人" sub="女性の条件を満たす男性" />
            <Big x={1000} y={460} text="3人に1人" sub="男性の条件を満たす女性" />
          </Svg>
          <SourceNote text="鈴木・八代（2025）表2" />
        </Enter>
        <Gosa cues={[[at(1), "thinking"]]} size="M" />
      </Beat>
      <Beat from={one} to={two}><SieveAnim kind="male" n={13} title="一枚目：女性が男性を選ぶふるい" who="女性の条件" /></Beat>
      <Beat from={two} to={big}><SieveAnim kind="female" n={33} title="二枚目：男性が女性を選ぶふるい" who="男性の条件" /></Beat>
      <Beat from={big} to={end + 20}><BigSieves /></Beat>
    </>
  );
};
/** 二枚のふるいが重なり、「26人に1人」がばねで出る（この回いちばんの数字） */
const BigSieves: React.FC = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, 0, 24);
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>お互いに条件を満たし合う男女</Heading>
      <Svg>
        <Sieve x={300} y={330 + (1 - t) * 155} w={300} label="女性の条件" />
        <Sieve x={300} y={640 - (1 - t) * 155} w={300} label="男性の条件" />
        <Pop start={18} x={900} y={470}><Big x={620} y={520} text="26人に1人" sub="研究者は「極めて狭き門」と書いている" /></Pop>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2（成立率3.8%）、要旨・p.90" />
    </AbsoluteFill>
  );
};
const Ch2Own: React.FC = () => {
  const { at, end } = useCue();
  const quote = at(5), own = at(7);
  return (
    <>
      <Beat from={0} to={quote}><Enter><P21 dashed={false} /></Enter></Beat>
      {/* 「この狭い門ができている」：26人に1人の図に戻る */}
      <Beat from={quote} to={own}><Enter><P20c /></Enter></Beat>
      <Beat from={own} to={end + 20}><P21 /></Beat>
    </>
  );
};

// ================= 第3章 =================
const Ch3: React.FC = () => {
  const { end } = useCue();
  return <Camera drift={end + 20}><Enter><P22 /></Enter></Camera>;
};
const Ch3Quiz: React.FC = () => (
  // 答え（D）は次の場面で、研究の答えの一文として出す（ここでは光らせない）
  <Quiz question="会う前の理想の条件は、会ったときの気持ちをどれくらい当てる？" choices={["ほぼ言い当てる", "半分くらい", "少しだけ", "ほとんど言い当てない"]} title="考えてみよう" />
);
const Ch3Study: React.FC = () => {
  const { at, end } = useCue();
  return (
    <>
      <Beat from={0} to={at(5)}>
        <Enter>
          <P24 show={0} />
          <Card x={300} y={250} w={1320} text="2008年　アメリカの大学生163人" sub="会う前に理想の相手の条件を答える → スピードデートで何人もと会う" start={10} />
          <Svg>{Array.from({ length: 10 }, (_, i) => <Figure key={i} kind={i % 2 ? "female" : "male"} x={460 + i * 110} y={700} size={2} />)}</Svg>
        </Enter>
      </Beat>
      <Beat from={at(5)} to={at(7)}><Enter><P24 show={1} /></Enter></Beat>
      <Beat from={at(7)} to={at(9)}><P24 show={2} /></Beat>
      <Beat from={at(9)} to={end + 20}><P24 /></Beat>
    </>
  );
};
const Ch3Outside: React.FC = () => {
  const { at, end } = useCue();
  return (
    <>
      <Beat from={0} to={at(1)}><Enter><P25 show={0} /></Enter></Beat>
      <Beat from={at(1)} to={at(2)}><P25 show={1} /><Sequence from={45}><Enter><P25 show={2} /></Enter></Sequence></Beat>
      <Beat from={at(2)} to={end + 20}><P25 /></Beat>
    </>
  );
};

// ================= 答え合わせ =================
const VerdictScene: React.FC = () => {
  const { at, end } = useCue();
  // スタンプは「判定は、△です」の少しあとに押す（Verdict は出てから VERDICT_TIMING.hit で押す）
  const card = Math.max(at(1), at(3) + 15 - VERDICT_TIMING.hit);
  return (
    <>
      <Beat from={0} to={card}><Enter><TodayCard claim="普通の相手は、数%しかいない" /></Enter></Beat>
      <Beat from={card} to={end + 20}>
        <Camera keys={[[0, { x: 960, y: 540, scale: 1 }], [Math.max(1, at(9) - card), { x: 760, y: 560, scale: 1.1 }]]} dur={60}>
          <Verdict claim="普通の相手は、数%しかいない" mark="△"
            reason={["自分の条件だけなら：8人に1人・3人に1人", "お互いに満たし合うと：26人に1人", "片側か両側かで決まる"]} />
        </Camera>
      </Beat>
    </>
  );
};
const VerdictQuiz: React.FC = () => {
  const { at, end } = useCue();
  return (
    <>
      <Beat from={0} to={at(1)}>
        <Quiz question="年収850万円以上の男性だけなら、背による差は？" choices={["ほとんど消える", "半分くらいに縮む", "変わらない", "もっと広がる"]} start={-QUIZ_TIMING.reveal} />
      </Beat>
      <Beat from={at(1)} to={at(5)}><Enter><P27a /></Enter></Beat>
      <Beat from={at(5)} to={end + 20}><P27b /></Beat>
    </>
  );
};

// ================= ミクロ =================
const Micro: React.FC = () => {
  const { find, end } = useCue();
  const loose = find("六つの条件のうち", 330), five = find("すると", 490), both = find("一つずつゆるめる", 650), which = find("どの条件を外すか", 830);
  return (
    <>
      <Beat from={0} to={loose}><Enter><P28 show={1} /></Enter></Beat>
      <Beat from={loose} to={five}><P28 show={2} /></Beat>
      <Beat from={five} to={both}><P28 show={3} /></Beat>
      <Beat from={both} to={which}><Widen /></Beat>
      <Beat from={which} to={end + 20}><Enter><P28 /></Enter></Beat>
    </>
  );
};
/** 男女が一つずつゆるめると、二枚のふるいが同時に広がる */
const Widen: React.FC = () => {
  const frame = useCurrentFrame();
  const w = 300 + 120 * prog(frame, 10, 50);
  return (
    <AbsoluteFill>
      <Heading>男性も女性も、一つずつゆるめる</Heading>
      <Svg>
        <Sieve x={560} y={420} w={w} label="女性の条件" />
        <Sieve x={1360} y={420} w={w} label="男性の条件" />
        {(["male", "female"] as const).map((k, j) => Array.from({ length: 5 }, (_, i) => (
          <Figure key={`${k}${i}`} kind={k} x={(j ? 1360 : 560) - 120 + i * 60} y={760} size={1.3} dim={i >= 1 + Math.round(4 * prog(frame, 30, 70))} />
        )))}
        <Label x={960} y={640} anchor="middle" color={C.ink2}>両方のふるいが、同時に広がる</Label>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表5（お互いに満たし合う男女 3.8%→18.8%）" />
    </AbsoluteFill>
  );
};

// ================= 教訓 =================
const Lesson: React.FC = () => {
  const { at, end } = useCue();
  return (
    <>
      <Beat from={0} to={at(3)}><Camera drift={at(3)}><Enter><P29 bubble={false} /></Enter></Camera></Beat>
      <Beat from={at(3)} to={at(4)}><P29 /></Beat>
      <Beat from={at(4)} to={end + 20}><Enter><P30b /></Enter></Beat>
    </>
  );
};
const LessonRulers: React.FC = () => {
  const { at, end } = useCue();
  // 締めのひと言は字幕がないので、最後の字幕の終わりから始める（〔間・長〕のあいだに点を数え、声と同時に一文が出る。SignOff.tsx）
  const sign = end - 8;
  return (
    <>
      <Beat from={0} to={at(4)}><Enter><P30a /></Enter></Beat>
      <Beat from={at(4)} to={at(7)}><Enter><P30b /></Enter></Beat>
      <Beat from={at(7)} to={sign}><Enter><P30c /></Enter></Beat>
      <Beat from={sign} to={sign + 400}><SignOff /></Beat>
    </>
  );
};
// 終了画面は締めの夜の続き（共通の部品 SignOff の end）
const End: React.FC = () => <SignOff end />;

const episode: EpisodeDef = {
  id: "003-normal-partner",
  title: "「普通の相手」の条件を全部重ねると、残るのは100人に◯人", // 仮。タイトルは meta.md で決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, "opening-screen": OpeningScreen, today: Today, quiz: QuizScene,
    "ch1-card": Ch1Card, ch1: Ch1, "ch1-quiz": Ch1Quiz, "ch1-answer": Ch1Answer, "ch1-rulers": Ch1Rulers, "ch1-multiply": Ch1Multiply,
    "ch2-card": Ch2Card, ch2: Ch2, "ch2-women": Ch2Women, "ch2-men": Ch2Men, "ch2-sieve": Ch2Sieve, "ch2-own": Ch2Own,
    "ch3-card": Ch3Card, ch3: Ch3, "ch3-quiz": Ch3Quiz, "ch3-study": Ch3Study, "ch3-outside": Ch3Outside,
    verdict: VerdictScene, "verdict-quiz": VerdictQuiz, micro: Micro, lesson: Lesson, "lesson-rulers": LessonRulers, end: End,
  }, { draft: true }), // 第13稿で場面が変わった。絵コンテ第3版が決まったら書き直す（それまでは無い場面を仮の画面にする。2026-10-07）
  bgm: [
    // 1曲を通しで流す（2026-10-06 オーナー「3分目くらいの曲で共通でいい。複数使わなくてもいい」、1本目 v3 と同じ）
    { file: "Stayin' Lazy - Godmode.mp3", from: "opening", to: "end" },
  ],
};
export default episode;
