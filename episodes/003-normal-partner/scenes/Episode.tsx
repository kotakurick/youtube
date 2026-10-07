// 3本目「『普通の相手』の条件を全部満たす人の数」の場面のコード（台本は script.md の第14稿、絵コンテは Storyboard.tsx と storyboard.md の第3版。2026-10-07）。
// 絵は絵コンテのコマ（Storyboard.tsx の A01〜F06）をそのまま使い、ここで「いつ出るか・どう動くか」を付ける。
// 場面の中は「区切り」で10〜20秒ごとにコマを替える。区切りの時刻は、その語を含む字幕の始まり（useNarration().find）。
// 字幕の番号では指さない（台本の言い回しを直すと、読点で分かれる字幕の番号がずれるため。2026-10-07）。
// 動くのは：つまみがすべる・検索画面の人数が数え下がる・100人の色が抜ける・掛け算の階段が1段ずつ・前提の札が1枚ずつ・コマがばねで出る。
// 数字は sources.csv と data/count_result.md。色は男女の色と物差しの意味の色（お金＝金、身長・体型＝青緑）。
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera } from "@lib/Camera";
import { ChannelTag } from "@lib/Cards";
import { ChapterCard } from "@lib/Chapter";
import type { EpisodeDef } from "@lib/Episode";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { Verdict } from "@lib/Verdict";
import { EASE, sp } from "@lib/theme";
import timing from "../timing.json";
import {
  A01, A02, A03a, A03b, A08, A09, A10, A11a, B01, B02, B02b, B02c, B03, B04, B05, B06, B07, B08, B09, B10, B11, B13,
  C00, C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12, C13, D01, D02, D03, D06, D07, D08, D09, D10, D11, D12,
  E01, E03, E05, E07, F01, F02, F03, F04, Heading, Premises, QUIZ_C, QUIZ_Q, QUIZ_T, Screen, Stairs,
} from "./Storyboard";

// ---------- 共通 ----------
type Cut = [React.FC, string | 0]; // [コマ, その語を含む字幕から（0＝場面の始まり）]
/** コマを字幕の番号で切り替える。最初のコマ以外はばねで出す。story＝物語の場面（ゆっくり寄る） */
const Cuts: React.FC<{ cuts: Cut[]; story?: boolean }> = ({ cuts, story }) => {
  const n = useNarration();
  const end = n.end() + 20;
  const from = cuts.map(([, k]) => (k === 0 ? 0 : n.find(k)));
  return (
    <>
      {cuts.map(([P], i) => {
        const a = from[i], b = i + 1 < cuts.length ? from[i + 1] : end;
        if (b <= a) return null;
        const body = i === 0 ? <P /> : <Enter><P /></Enter>;
        return <Sequence key={i} from={a} durationInFrames={b - a}>{story ? <Camera drift={b - a}>{body}</Camera> : body}</Sequence>;
      })}
    </>
  );
};
const Enter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return <AbsoluteFill style={{ opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>{children}</AbsoluteFill>;
};
/** a〜b フレームで 0→1（なめらか） */
const prog = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
const useAt = () => {
  const n = useNarration();
  return { at: n.find, end: n.end(), frame: useCurrentFrame() };
};

/** 検索画面：slideAt でつまみが stop へすべり、checkAt でチェックが入り、dropAt で人数が from → to へ数え下がる（右の100人も一緒に） */
const ScreenAnim: React.FC<{ from: number; to: number; litFrom: number; litTo: number; on: number; stop: number; prevStop?: number; slideAt?: number;
  checkAt?: number; dropAt: number; note?: string; yen?: string; title?: string }> = ({ from, to, litFrom, litTo, on, stop, prevStop, slideAt = 0, checkAt = -1, dropAt, note, yen, title }) => {
  const frame = useCurrentFrame();
  const k = prog(frame, dropAt, dropAt + 36);
  const checked = frame >= checkAt;
  return (
    <Screen count={Math.round(from + (to - from) * k)} prev={frame >= dropAt && from !== to ? from : undefined}
      on={checked ? on : on - 1} mark={checked && on > 0 ? on - 1 : undefined} stop={stop} lit={Math.round(litFrom + (litTo - litFrom) * k)}
      keys={prevStop === undefined ? undefined : [[0, prevStop], [slideAt, stop]]} note={frame >= dropAt ? note : undefined} yen={yen} title={title} />
  );
};

// ================= 冒頭 =================
const Opening: React.FC = () => <><Cuts story cuts={[[A01, 0], [A02, "2回目のお見合い"]]} /><ChannelTag start={20} /></>;
const OpeningSns: React.FC = () => <Cuts cuts={[[A03a, 0], [A03b, "どれも2人に1人"]]} />;
const OpeningScreen: React.FC = () => {
  const { at, end } = useAt();
  const s1 = at("彼女は、"), s2 = at("次に、大学"), s3 = at("最後に、身長"), s4 = at("この59人");
  return (
    <>
      <Sequence from={0} durationInFrames={s1}>
        <Camera keys={[[0, { x: 400, y: 500, scale: 1.4 }], [60, { x: 960, y: 540, scale: 1 }]]} dur={36}>
          <Screen count={1000} on={0} stop={0} lit={100} note="25〜34歳の結婚していない男性 1000人" />
        </Camera>
      </Sequence>
      <Sequence from={s1} durationInFrames={s2 - s1}>
        <ScreenAnim from={1000} to={132} litFrom={100} litTo={13} on={1} stop={3} prevStop={0} slideAt={at("つまみを500万円") - s1} checkAt={at("つまみを500万円") - s1} dropAt={at("132人に落ち") - s1}
          note="少しだけ上のつもり → 132人" />
      </Sequence>
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <ScreenAnim from={132} to={106} litFrom={13} litTo={11} on={2} stop={3} checkAt={10} dropAt={at("106人") - s2} note="大学卒業以上：ほとんど減らない" />
      </Sequence>
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <ScreenAnim from={106} to={59} litFrom={11} litTo={6} on={3} stop={3} checkAt={10} dropAt={at("59人。") - s3} note="身長170cm以上：ちょうど半分ほど" />
      </Sequence>
      <Sequence from={s4} durationInFrames={end + 20 - s4}><Enter><A08 /></Enter></Sequence>
    </>
  );
};
const Today: React.FC = () => <A09 />;

/** 予想タイム：組の作り方 → Aの計算 → 問いと選択肢（答えは答え合わせで） */
const QuizScene: React.FC = () => {
  const { at, end, frame } = useAt();
  const q = at("Aは、1組"), c = at("Bは、");
  const pairs = Math.round(32 * prog(frame, at("男性と女性を1人ずつ"), at("そんな組を")));
  return (
    <>
      <Sequence from={0} durationInFrames={q}><A10 n={pairs} ask={frame >= at("お互いが、お互いの")} /></Sequence>
      <Sequence from={q} durationInFrames={c - q}><Enter><A11a /></Enter></Sequence>
      <Sequence from={c} durationInFrames={end + 30 - c}>
        <Quiz question={QUIZ_Q} choices={QUIZ_C} title={QUIZ_T} choiceAt={[0, 0, at("Cは、") - c, at("Dは、") - c]} ringAt={at("答えは、最後") - c} />
      </Sequence>
    </>
  );
};
/** 3つの前提：札が読み上げに合わせて1枚ずつ */
const Roadmap: React.FC = () => {
  const { at, frame } = useAt();
  const show = frame >= at("3つ目は") ? 3 : frame >= at("2つ目は") ? 2 : frame >= at("1つ目は") ? 1 : 0;
  return <AbsoluteFill><Heading>投稿の計算に隠れた、3つの前提</Heading><Premises show={show} /></AbsoluteFill>;
};

// ================= 第1章 =================
const Ch1Card: React.FC = () => <ChapterCard no={1} title="男女が相手に求めるもの" />;
const Ch2Card: React.FC = () => <ChapterCard no={2} title="1つ目の前提「普通とはまん中」" />;
const Ch3Card: React.FC = () => <ChapterCard no={3} title="2つ目と3つ目の前提" />;
const Ch1Survey: React.FC = () => <Cuts cuts={[[B01, 0], [B02, "相手の見た目は"], [B02b, "男性は顔"], [B02c, "重く見る人だけ"], [B03, "差が大きく"]]} />;
const Ch1Quiz: React.FC = () => <Cuts cuts={[[B04, 0], [B05, "男性で増えた"]]} />;
const Ch1Hypergamy: React.FC = () => <Cuts cuts={[[B06, 0], [B07, "自分より学歴や年収"]]} />;
const Ch1World: React.FC = () => <Cuts cuts={[[B08, 0], [B09, "計算で試して"]]} />;
const Ch1Census: React.FC = () => <B10 />;
const Ch1IncomeCouples: React.FC = () => <B11 />;
/** 彼女の画面に戻る：400万円へすべって299人 → 500万円へすべって132人 → 「普通はどこに」 */
const Ch1Her: React.FC = () => {
  const { at, end } = useAt();
  const s2 = at("少しだけ上の500万円"), s3 = at("年収の「普通」は");
  return (
    <>
      <Sequence from={0} durationInFrames={s2}>
        <ScreenAnim from={1000} to={299} litFrom={100} litTo={30} on={1} stop={2} prevStop={0} slideAt={at("400万円以上なら") - 20} checkAt={at("400万円以上なら") - 20} dropAt={at("400万円以上なら")}
          yen="400万円以上" title="彼女の画面" note="400万円以上なら 299人" />
      </Sequence>
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <ScreenAnim from={299} to={132} litFrom={30} litTo={13} on={1} stop={3} prevStop={2} slideAt={10} dropAt={at("132人になり") - s2} title="彼女の画面" note="100万円動かしただけで、半分以下" />
      </Sequence>
      <Sequence from={s3} durationInFrames={end + 20 - s3}><B13 /></Sequence>
    </>
  );
};

// ================= 第2章 =================
const Ch2: React.FC = () => <C00 />;
/** 身長の山：平均の線 → 山を左から描く → 170cmの線と塗り → 約55% */
const Ch2Height: React.FC = () => {
  const { at, frame } = useAt();
  return <C01 avg={frame >= at("約171センチ")} draw={prog(frame, at("男性を背の高さ"), at("左右がほぼ同じ"))} mid={frame >= at("だから、170")} pct={frame >= at("170センチ以上の人は")} />;
};
const Ch2Quiz: React.FC = () => <C02 />;
/** 年収の山 → 彼女の目盛り（すそ）→ 約150人 → 132人の注 → まん中の印 → 「なぜ」 */
const Ch2Income: React.FC = () => {
  const { at, end, frame } = useAt();
  const s2 = at("500万円の目盛りは");
  const step = frame >= at("目盛りは、まん中") ? 4 : frame >= at("さっきの132人") ? 3 : frame >= at("500万円以上は約150人") ? 2 : 1;
  const head = frame >= at("そう感じてしまう") ? "では、なぜ500万円が普通に見えるのか" : undefined;
  return (
    <>
      <Sequence from={0} durationInFrames={s2}><C03 /></Sequence>
      <Sequence from={s2} durationInFrames={end + 20 - s2}><Enter><C04 step={step} head={head} /></Enter></Sequence>
    </>
  );
};
const Ch2Married: React.FC = () => (
  <Cuts cuts={[[C05, 0], [C06, "年齢をそろえて"], [C07, "友だちの夫"], [C08, "心理学"], [C09, "もし、心の中"], [C10, "結婚と年収の高さ"],
    [C11, "女性でも、同じように"], [C12, "条件によく挙がる見た目"], [C13, "1つ目の前提は、年収"]]} />
);

// ================= 第3章 =================
const Ch3Overlap: React.FC = () => <Cuts cuts={[[D01, 0], [D02, "冒頭の1000人のうち"]]} />;
/** 約1万人：人が並ぶ → 年齢・年収・仕事の形 → 学歴・身長・体型 → 注を替える */
const Ch3Survey: React.FC = () => {
  const { at, frame } = useAt();
  const cards = frame >= at("学歴と身長") ? 6 : frame >= at("年齢と年収") ? 3 : 0;
  const note = frame >= at("1000人に置き換えて") ? "ここでも、1000人に置き換えて数える"
    : frame >= at("研究者は、この人たち") ? "この人たちの中で相手を探すとして、条件を全部満たす相手を数えた"
    : frame >= at("25歳から49歳") ? "25〜49歳の独身の男女 約1万人" : undefined;
  return <D03 figs={Math.round(10 * prog(frame, 0, 60))} cards={cards} note={note} />;
};
/** 掛け算の階段：条件のチェックが1つずつ入り、人数が下がる。残り4つは続けて */
const Ch3Multiply: React.FC = () => {
  const { at, frame } = useAt();
  const keys: [number, number][] = [[0, 1], [at("年齢の条件"), 2], [at("年収の条件"), 3], [at("4回掛ける"), 4], [at("4回掛ける") + 18, 5], [at("4回掛ける") + 36, 6], [at("4分の1"), 7]];
  const n = keys.filter(([f]) => frame >= f).pop()![1];
  return <Stairs n={n} head={n <= 3 ? "女性たちの条件を、1つずつ掛ける" : "6回掛けると、52人"} post={frame >= at("冒頭の投稿の計算は")} />;
};
const Ch3Guess: React.FC = () => <Cuts cuts={[[D06, 0], [D07, "年収が高い人は学歴"], [D08, "今度は、男性たち"]]} />;
/** スピードデートのコマは、砂時計 → 男性 → 女性の順に出す */
const D11Steps: React.FC = () => {
  const { at, frame } = useAt();
  // Cuts の中の Sequence では frame がコマの始まりから数えるので、場面の時刻に直す
  const t = frame + at("アメリカの大学院生");
  return <D11 step={t >= at("女性には") ? 3 : t >= at("男性は、自分より") ? 2 : t >= at("4分話して") ? 1 : 0} />;
};
const Ch3Turn: React.FC = () => <Cuts cuts={[[D09, 0], [D10, "冒頭のあの人"], [D11Steps, "アメリカの大学院生"], [D12, "研究者は、お互い"]]} />;

// ================= 答え合わせ =================
const VerdictScene: React.FC = () => <E01 />;
const VerdictQuiz: React.FC = () => {
  const { at, end } = useAt();
  const e3 = at("Dの130");
  return (
    <>
      <Sequence from={0} durationInFrames={e3}>
        <Quiz question={QUIZ_Q} choices={QUIZ_C} title={QUIZ_T} answer={2} reveal choiceAt={[0, 0, 0, 0]} ringAt={at("38組でした") - 20} revealAt={at("38組でした")} />
      </Sequence>
      <Sequence from={e3} durationInFrames={end + 20 - e3}><Enter><E03 /></Enter></Sequence>
    </>
  );
};
const REASON = ["自分の条件だけで数えると：1000人に133人", "お互いの条件で数えると：1000組に38組", "数パーセントになるのは、お互いで数えたとき"];
const RESULTS = ["身長では合っていたが、年収で外れた", "条件を一度にいくつも満たす人が多い", "相手にも条件がある"];
const VerdictJudge: React.FC = () => {
  const { at, end, frame } = useAt();
  const s2 = at("もう一度たどり"), s3 = at("1つ目の前提は、身長"), s4 = at("ただし、38組");
  const k = frame >= at("2つ目も、3つ目も") ? 3 : frame >= s3 ? 1 : 0;
  return (
    <>
      <Sequence from={0} durationInFrames={s2}>
        <AbsoluteFill><Verdict claim="普通の相手は、数%しかいない" mark="△" reason={REASON} chipAt={[0, at("お互いの条件で数えて"), at("初めて数パーセント")]} hitAt={at("初めて数パーセント") + 30} /></AbsoluteFill>
      </Sequence>
      <Sequence from={s2} durationInFrames={at("ここまでは、人の数") - s2}><Enter><E05 pairs={false} /></Enter></Sequence>
      <Sequence from={at("ここまでは、人の数")} durationInFrames={s3 - at("ここまでは、人の数")}><E05 /></Sequence>
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <Enter><AbsoluteFill><Heading>3つの前提を確かめると</Heading><Premises results={RESULTS.slice(0, k)} /></AbsoluteFill></Enter>
      </Sequence>
      <Sequence from={s4} durationInFrames={end + 20 - s4}><Enter><E07 /></Enter></Sequence>
    </>
  );
};

// ================= 教訓 =================
const Lesson: React.FC = () => {
  const { end } = useAt();
  // 締めのひと言は字幕がないので、最後の字幕の終わりから始める（〔間・長〕のあいだに点を数え、声と同時に一文が出る。SignOff.tsx）
  const sign = end - 8;
  return (
    <>
      <Cuts cuts={[[F01, 0], [F02, "あの目盛りは"], [F03, "そして、目盛りを持って"], [F04, "普通の相手とは"]]} />
      <Sequence from={sign} durationInFrames={400}><SignOff /></Sequence>
    </>
  );
};
// 終了画面は締めの続き（共通の部品 SignOff の end）
const End: React.FC = () => <SignOff end />;

const episode: EpisodeDef = {
  id: "003-normal-partner",
  title: "「普通の相手」の条件を全部満たす人の数", // 仮。タイトルは仮通しのあとに決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, "opening-sns": OpeningSns, "opening-screen": OpeningScreen, today: Today, quiz: QuizScene, roadmap: Roadmap,
    "ch1-card": Ch1Card, "ch1-survey": Ch1Survey, "ch1-quiz": Ch1Quiz, "ch1-hypergamy": Ch1Hypergamy, "ch1-world": Ch1World,
    "ch1-census": Ch1Census, "ch1-income-couples": Ch1IncomeCouples, "ch1-her": Ch1Her,
    "ch2-card": Ch2Card, ch2: Ch2, "ch2-height": Ch2Height, "ch2-quiz": Ch2Quiz, "ch2-income": Ch2Income, "ch2-married": Ch2Married,
    "ch3-card": Ch3Card, "ch3-overlap": Ch3Overlap, "ch3-survey": Ch3Survey, "ch3-multiply": Ch3Multiply, "ch3-guess": Ch3Guess, "ch3-turn": Ch3Turn,
    verdict: VerdictScene, "verdict-quiz": VerdictQuiz, "verdict-judge": VerdictJudge, lesson: Lesson, end: End,
  }),
  bgm: [
    // 1曲を通しで流す（2026-10-06 オーナー「3分目くらいの曲で共通でいい。複数使わなくてもいい」、1本目 v3 と同じ）
    { file: "Stayin' Lazy - Godmode.mp3", from: "opening", to: "end" },
  ],
};
export default episode;
