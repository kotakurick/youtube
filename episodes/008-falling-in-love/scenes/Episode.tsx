// 8本目「人を好きになるって、どういうこと？」（仮の題）の動画（台本 script.md 第9稿・B案、絵コンテ 第2版 Storyboard.tsx の47場面）。
// 場面の絵は Storyboard.tsx から読み（同じ絵を二度書かない）、ここでは「いつ・どう動くか」だけを書く（006 と同じ作り）。
// 台本の場面（timing.json の10個）の中を、読み上げの語（useCue().find）で区切り（Steps）、絵コンテの場面を順に出す。
// 絵コンテの番号（一覧の 01〜47）をコメントに書いた。動きは絵コンテの move のうち主なもの：
//   額が1枚ずつかかる・相手を替えるスピードデート（SpeedDateRoom）・学生が席に座る（CatCrowd）・帯と柱が伸びる・
//   3つの枠が順に出る・予想の答え（ゴサは言い切りの顔＝ひげ短め、吹き出しなし）・条件の行が増える・枝に粒が付きはじめる・丸が結晶に変わる。
// 細かい動き（ろうそくのゆれ・火星の軌道の描き直し など）は、仮通しで見てから足す。
// B案（2026-10-10 オーナー。008 で試す）：「今日の答え合わせ」カードと判定のコーナーはない。予想の答えは第2章で1回だけ。
import React from "react";
import { ChannelTag } from "@lib/Cards";
import { ChapterCard } from "@lib/Chapter";
import type { EpisodeDef, SceneDef } from "@lib/Episode";
import { END_FRAMES } from "@lib/EndScreen";
import { Beat, Enter, useCue, Wipe } from "@lib/Motion";
import { fromTiming, Timing } from "@lib/Narration";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import { FPS } from "@lib/theme";
import { AbsoluteFill } from "remotion";
import timing from "../timing.json";
import {
  QUIZ_C, QUIZ_Q,
  S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15a, S15, S16, S17, S18, S19, S20,
  S21, S21b, S22, S23, S24, S26, S27, S28, S28b, S29a, S29, S30, S31, S32, S33, S34, S35, S36, S37,
  S38, S39, S40, S41, S43,
} from "./Storyboard";

type Mode = "enter" | "wipe" | "up" | "cut";
type Step = [word: string, el: React.ReactNode | ((from: number) => React.ReactNode), mode?: Mode];
/** 読み上げの語ごとに絵を切り替える。最初の絵は場面の頭から。語が見つからないときは前の区切りの5秒後（台本を直しても止まらない）。
 *  el を関数にすると、その絵の始まり（場面の頭からのフレーム）を受け取れる（絵の中の語の時刻を、絵の頭からの数えに直すため） */
const Steps: React.FC<{ items: Step[]; tail?: number }> = ({ items, tail = 0 }) => {
  const { find, end } = useCue();
  const starts: number[] = [];
  items.forEach(([w], i) => starts.push(i === 0 ? 0 : find(w, starts[i - 1] + 150)));
  const last = end + tail;
  return (
    <>
      {items.map(([, el, mode = "enter"], i) => {
        const from = starts[i], to = i + 1 < items.length ? starts[i + 1] : last;
        const node = typeof el === "function" ? el(from) : el;
        const body = mode === "wipe" ? <Wipe dur={30}>{node}</Wipe> : mode === "up" ? <Wipe dir="up" dur={36}>{node}</Wipe> : mode === "cut" ? node : <Enter dy={0}>{node}</Enter>;
        return <Beat key={i} from={from} to={to}>{body}</Beat>;
      })}
    </>
  );
};
/** 語の時刻を、絵の始まりからの数えに直す */
const useAt = () => {
  const { find } = useCue();
  return (word: string, from: number, fallback = 60) => Math.max(0, find(word, from + fallback) - from);
};

// ================= 冒頭の物語（01〜09） =================
const Opening: React.FC = () => (
  <>
    <Steps items={[
      ["", <S01 />, "cut"],                                  // 01 夜、手紙を書くケプラー
      ["ヨハネス・ケプラー", <S02 />],                        // 02 円ではなく楕円
      ["手紙を書く2年前に", <S03 />],                          // 03 2年前に妻を亡くす
      ["候補に挙がった女性は", <S04 every={8} />],             // 04 額が1枚ずつかかる（11枚）
      ["この11人を", <S05 />, "wipe"],                         // 05 ケプラーの表（5番目に心）
      ["心配した友人たちは", <S06 />, "cut"],                  // 06 友人たちの説得
      ["最後に彼が結婚したのは", <S07 />, "cut"],              // 07 4番目に断られ、5番目と結婚
      ["400年がたち", <S08 />, "cut"],                         // 08 400年後：スマートフォンの条件
      ["条件のそろった相手に", <S09 />],                       // 09 問い
    ]} />
    <ChannelTag start={6} />
  </>
);

// ================= 予想タイム（10〜13） =================
const QuizScene: React.FC = () => {
  const { find, endOf } = useCue();
  const at = useAt();
  return (
    <Steps items={[
      ["", <S10 still={false} />],                             // 10 スピードデート：砂時計が落ちるたびに右の猫が横へ（相手を替える）
      ["研究者は、会う前の答えを", <S11 />],                   // 11 会う前の答え → 点数の予想
      ["予想してみてください", (from) => (                     // 12 予想タイム：選択肢は読み上げに合わせて1つずつ、Dを読み終えてから3秒の輪
        <Quiz question={QUIZ_Q} choices={QUIZ_C} gosaFoot={850}
          choiceAt={[at("Aは", from), at("Bは", from), at("Cは", from), at("Dは", from)]}
          ringAt={Math.max(0, endOf("Dは", find("Dは", from + 300) + 60) - from)} />
      ), "cut"],
      ["今日は、3つの問いを", <S13 />],                        // 13 3つの問い
    ]} />
  );
};

// ================= 第1章（14〜21） =================
const Ch1: React.FC = () => {
  const at = useAt();
  return (
    <Steps items={[
      ["", <S14 />],                                           // 14 初めて会った場所は？
      ["国の調査では", <S15a n={0} />],                         // 15 100%の帯の枠（点線）
      ["1つは、職場や学校", <S15a />, "wipe"],                 //    もともとの人間関係 約55%
      ["もう1つは、マッチングアプリ", <S15 />, "cut"],         // 16 探しに行った出会い 約28%
      ["探しに行く出会いは", <S16 note={false} />, "up"],      // 17 4年で増えた
      ["ただ、夫婦の半分以上は", <S16 />, "cut"],              //    それでも半分以上は
      ["その「たまたま」が", <S17 enter />],                   // 18 くじの席：学生が1匹ずつ座る
      ["1年後、隣や同じ列", <S18 />, "cut"],                   // 19 1年後の友だちの線
      ["ここまでは、恋人ではなく", <S19 />, "up"],             // 20 小学校：隣の席
      ["ただ、同じ部署や同じ教室", (from) => <S20 enter ringAt={at("たった1人", from)} />], // 21 たった1人（墨の輪）
    ]} />
  );
};

// ================= 第2章（22〜32） =================
const Ch2: React.FC = () => {
  const at = useAt();
  return (
    <Steps items={[
      ["", <S21 n={1} />],                                     // 22 3つに分ける：1つ目（青緑）
      ["2つ目は、好かれやすさ", <S21 n={2} />, "cut"],         //    2つ目（金）
      ["3つ目は、その2人の組み合わせ", <S21b />, "cut"],       // 23 3つ目：相性（赤）
      ["友人の評判はいまひとつ", <S22 />],                     // 24 相性＝「なぜか」
      ["点数の高い低いを", <S23 />, "wipe"],                   // 25 内訳：相性が約3分の1
      ["ただ、相性といっても", <S24 />, "wipe"],               // 26 先回り：好かれやすさは、ある程度当たる
      ["予想の答えは、Dの", (from) => (                        // 27 予想の答え：D。ゴサは言い切りの顔（ひげ短め）、吹き出しなし
        <AbsoluteFill>
          <Quiz question={QUIZ_Q} choices={QUIZ_C} answer={3} reveal gosaFoot={850}
            choiceAt={[0, 0, 0, 0]} ringAt={-1000} revealAt={Math.max(6, at("ほぼゼロ", from, 30))} revealFace="assertive" />
          <SourceNote text="Joel ほか 2017（米国の大学生のスピードデート）。別の年の参加者でも同じ" />
        </AbsoluteFill>
      ), "cut"],
      ["性格が似ているか", <S26 />, "cut"],                    // 28 相性はほぼゼロ
      ["ところが、話した直後に", <S27 />, "wipe"],             // 29 話した直後：多くて3割
      ["なぜ好きになるのかには", <S28 lower={false} />],       // 30 ベッカー：説明したこと
      ["そのベッカーも", <S28 />, "cut"],                       //    踏み込まなかったこと
      ["会う前の答えに手がかりがない", <S28b />],              // 31 好きな理由はどこから？
    ]} />
  );
};

// ================= 第3章（33〜41） =================
const Ch3: React.FC = () => (
  <Steps items={[
    ["", <S29a />],                                            // 32 恋人の写真と友人の写真
    ["恋人の写真では", <S29 quiet={false} />],                 // 33 ごほうびの回路
    ["反対に、相手を見きわめる", <S29 />, "cut"],              //    相手を採点する部分
    ["好きな人が特別に見えて", <S30 />],                       // 34 結晶作用
    ["名前の由来は", <S31 />, "cut"],                          // 35 塩の坑道
    ["2、3か月たって", <S32 />],                               // 36 2、3か月後の枝
    ["スタンダールは、この枝を", <S33 />],                     // 37 枝は恋の相手
    ["アメリカの哲学者", <S34 />],                             // 38 フランクファート
    ["会う前に持っていた好みは", <S35 partner={false} />, "cut"], // 39 好みのものさし
    ["その間に恋人ができた", <S35 />, "cut"],                  //    恋人は好みに近い
    ["ところが、この研究には", <S36 />, "cut"],                // 40 動いたのは条件のほう
    ["こう考えると", <S37 />],                                 // 41 スピードデートを見直す
  ]} />
);

// ================= 結論とミクロ（42〜43） =================
const Conclusion: React.FC = () => (
  <Steps items={[
    ["", <S38 grow={20} />],                                   // 42 会う前には当てられない（条件の行が8つまで増える）
    ["研究で言えば", <S39 />, "cut"],                          // 43 会う前に分かるのは
  ]} />
);

// ================= 教訓（44〜47） =================
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const five = find("5番目の女性は", 150), grow = find("結晶は", five + 200), table = find("条件の表に届かない", grow + 120);
  const sign = end - 8; // 締めのひと言は字幕がないので、最後の字幕の終わりから（001・004・006 と同じ）
  return (
    <>
      <Beat from={0} to={five}><S40 /></Beat>                                       {/* 44 夜明け、手紙を書き終える */}
      <Beat from={five} to={table}><Enter dy={0}><S41 growAt={grow - five} /></Enter></Beat> {/* 45 5番目の女性。枝に粒が付きはじめる */}
      <Beat from={table} to={sign}><S43 grow={24} /></Beat>                         {/* 46 書き換わっていたのは表のほう */}
      <Beat from={sign} to={sign + 600}><SignOff /></Beat>                           {/* 47 締めのひと言 */}
    </>
  );
};

// ================= 章の扉と終了画面（声のない場面） =================
const card = (no: number, title: string): React.FC => () => <ChapterCard no={no} title={title} />;
// 終了画面は締めの夜の続き（共通の部品 SignOff の end）
const End: React.FC = () => <SignOff end />;

const narrated = fromTiming(timing as Timing, {
  opening: Opening, quiz: QuizScene,
  "ch1-card": card(1, "誰と出会っている？"), ch1: Ch1,
  "ch2-card": card(2, "誰を好きになる？"), ch2: Ch2,
  "ch3-card": card(3, "好きな理由はどこから？"), ch3: Ch3,
  s9: Conclusion,
  lesson: Lesson,
});
const scenes: SceneDef[] = [...narrated, { id: "end", seconds: END_FRAMES / FPS, Scene: End }];

const episode: EpisodeDef = {
  id: "008-falling-in-love",
  title: "人を好きになるって、どういうこと？", // 仮の題（タイトルは未決定）
  scenes,
  bgm: [
    // 1曲を通しで流す（仮。曲はローカルで確かめる。1本目・3本目・6本目と同じ曲）
    { file: "Stayin' Lazy - Godmode.mp3", from: "opening", to: "end" },
  ],
};
export default episode;
