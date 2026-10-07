// 6本目「どこからが浮気？ 浮気の線がぴったり合う確率」の動画（台本 script.md 第2稿、絵コンテ 第2版 Storyboard.tsx の48場面）。
// 場面の絵は Storyboard.tsx から読み（同じ絵を二度書かない）、ここでは「いつ・どう動くか」だけを書く。
// 台本の場面（timing.json の12個）の中を、読み上げの語（useCue().find）で区切り（Steps）、絵コンテの場面を順に出す。
// 絵コンテの番号（一覧の 01〜48）をコメントに書いた。動きは絵コンテの move のうち、主なものだけ（はしごの数え下げ・ものさし・柱の伸び）。
// 細かい動き（猫の首振り・地図の線が引かれる など）は、仮通しで見てから足す。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ChannelTag } from "@lib/Cards";
import { Camera } from "@lib/Camera";
import { ChapterCard } from "@lib/Chapter";
import type { EpisodeDef, SceneDef } from "@lib/Episode";
import { EndScreen, END_FRAMES } from "@lib/EndScreen";
import { Gosa } from "@lib/Gosa";
import { Beat, Enter, ramp, useCue, Wipe } from "@lib/Motion";
import { fromTiming, Timing } from "@lib/Narration";
import { SignOff } from "@lib/SignOff";
import { FPS } from "@lib/theme";
import timing from "../timing.json";
import {
  Ladder, S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S11b, S12, S13, S14, S15, S16, S16b, S17, S18, S19, S21, S22, S23,
  S24, S25, S27, S28, S29, S30, S31, S32, S33, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45,
} from "./Storyboard";

/** 長く同じ絵が続く所は、カメラをゆっくり寄せて止まって見せない（1.00→1.04倍） */
const Drift: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => <Camera drift={len}>{children}</Camera>;

type Mode = "enter" | "wipe" | "up" | "cut";
type Step = [word: string, el: React.ReactNode, mode?: Mode];
/** 読み上げの語ごとに絵を切り替える。最初の絵は場面の頭から。語が見つからないときは前の区切りの5秒後（台本を直しても止まらない） */
const Steps: React.FC<{ items: Step[]; tail?: number }> = ({ items, tail = 0 }) => {
  const { find, end } = useCue();
  const starts: number[] = [];
  items.forEach(([w], i) => starts.push(i === 0 ? 0 : find(w, starts[i - 1] + 150)));
  const last = end + tail;
  return (
    <>
      {items.map(([, el, mode = "enter"], i) => {
        const from = starts[i], to = i + 1 < items.length ? starts[i + 1] : last;
        const body = mode === "wipe" ? <Wipe dur={30}>{el}</Wipe> : mode === "up" ? <Wipe dir="up" dur={36}>{el}</Wipe> : mode === "cut" ? el : <Enter dy={0}>{el}</Enter>;
        return <Beat key={i} from={from} to={to}><Drift len={to - from}>{body}</Drift></Beat>;
      })}
    </>
  );
};

// ================= 冒頭の物語（01〜08） =================
const Opening: React.FC = () => (
  <>
    <Steps items={[
      ["", <S01 />, "cut"],                          // 01 夜の居間
      ["画面の中では", <S02 />],                      // 02 ドラマの画面
      ["彼は「これはセーフ", <S03 />],                // 03 セーフ／アウト
      ["それから、少しだけ黙って", <S04 />],          // 04 先週のランチは？
      ["やましいことは", <S05 />],                    // 05 静かになった部屋
      ["既婚の男女、およそ7000人", <S06 />, "up"],    // 06 手をつないだら浮気
      ["男女の差は、2割ほど", <S07 />],               // 07 くじで組む
      ["意見が半々に", <S08 />],                      // 08 地図2枚と問い
    ]} />
    <ChannelTag start={6} />
  </>
);
const Today: React.FC = () => <S09 />;                // 09 今日の答え合わせ
const QuizScene: React.FC = () => (
  <Steps items={[
    ["", <S10 />],                                    // 10 使うデータ
    ["予想してみてください", <S11 />, "cut"],         // 11 予想タイム
    ["Cは、200組", <S11b />],                         // 12 ものさしに並べる
    ["今日は、3つのことを", <S12 />],                  // 13 今日の順番
  ]} />
);

// ================= 第1章（14〜19） =================
const Ch1: React.FC = () => (
  <Steps items={[
    ["", <S13 />, "up"],                              // 14 階段・あなたの線
    ["さきほどの7000人", <S14 />, "wipe"],            // 15 13の行動の横棒
    ["別の会社の", <S15 />, "wipe"],                  // 16 2千人の調査
    ["それなら、ひとりひとりの線", <S16 />, "up"],    // 17 散らばり：平均
    ["ところが、同じ男性の中でも", <S16b />, "cut"],  // 18 散らばり：幅
    ["それでも、平均の差を聞くと", <S17 />],          // 19 先回り
  ]} />
);

// ================= 第2章（20〜32） =================
/** 26〜28 はしごの3段目：組が抜けていき（100→1）、最後に1組が金の枠で残る */
const Sieve: React.FC = () => {
  const frame = useCurrentFrame();
  const k = ramp(frame, 40, 150);
  const remain = Math.round(99 * (1 - k));
  return <Ladder step={3} remain={remain} />;
};
const Ch2: React.FC = () => (
  <Steps items={[
    ["", <S18 />],                                    // 20 同性どうしでも食い違う
    ["仲のいい男友達", <S19 />],                      // 21 あなたと男友達
    ["ただし、答えが割れる行動", <S21 />, "cut"],    // 23 割れる行動は性別で違う
    ["「男性は体の浮気", <S22 />, "up"],              // 24 1990年代の学生
    ["自分だけの地図", <S23 />],          // 25 地図
    ["ここから、100組", <S24 />, "cut"],               // 26 はしご1
    ["次は、男性は男性どうし", <S25 />, "cut"],     // 27 はしご2
    ["最後に、ひとりひとりの", <Sieve />, "cut"],      // 28 はしご3（数え下げ）
    ["ちなみに、法律で", <S27 />],                    // 29 社会の線
    ["もう一度、100組の計算", <S28 />, "up"],          // 30 ミクロ
    ["食い違いやすいのは、", <S29 />, "wipe"], // 31 灰色の行動
    ["ここまでは、線を引くとき", <S30 />],            // 32 次の問い
  ]} />
);

// ================= 第3章（33〜41） =================
const Ch3: React.FC = () => (
  <Steps items={[
    ["", <S31 />, "cut"],                             // 33 ドラマの続き
    ["日本で結婚後に浮気", <S32 />],                  // 34 日本：男性約2割・女性約1割
    ["ただ、この差は", <S33 />],                      // 35 昔の60代といまの60代
    ["いまの若い世代では", <S35 />, "cut"],          // 37 若い世代はほぼ同じ
    ["次に、男女ではなく", <S36 />, "up"],            // 38 満足度で4倍
    ["ところが、浮気をしたことがある人だけ", <S37 />], // 39 9割は幸せ
    ["日本の、浮気をしたことがある", <S38 />],        // 40 理由と場所
    ["割合で見れば、浮気の経験は", <S39 />],          // 41 まとめ
  ]} />
);

// ================= 答え合わせ（42〜45） =================
const VerdictScene: React.FC = () => (
  <Steps items={[
    ["", <S40 />, "cut"],                             // 42 前半 〇
    ["2つ目の証拠", <S41 />, "cut"],                 // 43 後半 ×
    ["予想タイムの答え", <S42 />, "cut"],             // 44 予想の答え C
    ["Dは、掛け算で", <S43 />],                       // 45 掛け算の500倍
  ]} />
);

// ================= 教訓（46〜48） =================
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const map = find("ひとりの地図には", 600);
  const sign = end - 8; // 締めのひと言は字幕がないので、最後の字幕の終わりから（001・004 と同じ）
  return (
    <>
      <Beat from={0} to={map}><Drift len={map}><S44 /></Drift></Beat>                {/* 46 居間に戻る */}
      <Beat from={map} to={sign}><Enter dy={0}><S45 /></Enter></Beat>                 {/* 47 2枚の地図 */}
      <Beat from={sign} to={sign + 600}><SignOff /></Beat>                            {/* 48 締めのひと言 */}
    </>
  );
};

// ================= 章の扉と終了画面（声のない場面） =================
const card = (no: number, title: string): React.FC => () => <ChapterCard no={no} title={title} />;
const End: React.FC = () => <EndScreen lesson={"ひとりの地図には、\n筋が通っている。\nそれでも、重ならない。"} />;

const narrated = fromTiming(timing as Timing, {
  opening: Opening, today: Today, quiz: QuizScene,
  "ch1-card": card(1, "日本の人は、どこに線を引く？"), ch1: Ch1,
  "ch2-card": card(2, "誰と誰の線がずれる？"), ch2: Ch2,
  "ch3-card": card(3, "線を越える人は、男女で違う？"), ch3: Ch3,
  "verdict-card": () => <AbsoluteFill><Gosa cues={[[0, "thinking"]]} size="M" /></AbsoluteFill>, verdict: VerdictScene,
  lesson: Lesson,
});
const scenes: SceneDef[] = [...narrated, { id: "end", seconds: END_FRAMES / FPS, Scene: End }];

const episode: EpisodeDef = {
  id: "006-cheating-line",
  title: "どこからが浮気か。男女2人の基準がぴったり合うのは、170組に1組", // 2026-10-07 オーナー決定（meta.md）
  scenes,
  // BGM は曲を決めてから（ローカルの工程）
};
export default episode;
