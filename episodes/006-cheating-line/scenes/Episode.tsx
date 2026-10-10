// 6本目「どこからが浮気？ 浮気の線がぴったり合う確率」の動画（台本 script.md 第2稿、絵コンテ 第2版 Storyboard.tsx の48場面）。
// 場面の絵は Storyboard.tsx から読み（同じ絵を二度書かない）、ここでは「いつ・どう動くか」だけを書く。
// 台本の場面（timing.json の12個）の中を、読み上げの語（useCue().find）で区切り（Steps）、絵コンテの場面を順に出す。
// 絵コンテの番号（一覧の 01〜48）をコメントに書いた。動きは絵コンテの move のうち、主なものだけ（はしごの数え下げ・ものさし・柱の伸び）。
// 細かい動き（猫の首振り・地図の線が引かれる など）は、仮通しで見てから足す。
import React from "react";
import { AbsoluteFill } from "remotion";
import { ChannelTag } from "@lib/Cards";
import { ChapterCard } from "@lib/Chapter";
import type { EpisodeDef, SceneDef } from "@lib/Episode";
import { END_FRAMES } from "@lib/EndScreen";
import { Gosa } from "@lib/Gosa";
import { Beat, Enter, useCue, Wipe } from "@lib/Motion";
import { fromTiming, Timing } from "@lib/Narration";
import { SignOff } from "@lib/SignOff";
import { FPS } from "@lib/theme";
import timing from "../timing.json";
import {
  S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S11b, S13, S14, S15, S16, S16b, S17, S18, S19, S21, S22, S23,
  S29, S30, S31, S32, S33, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45,
} from "./Storyboard";

/** 以前は長く同じ絵が続く所でカメラをゆっくり寄せていた（1.00→1.04倍）が、文字が毎コマ描き直されて小さくゆれて見えるのでやめた（2026-10-10 オーナー「わずかなゆれをなくしたい」） */
const Drift: React.FC<{ len: number; children: React.ReactNode }> = ({ children }) => <>{children}</>;

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
      ["少し黙ってから", <S04 />],                    // 04 先週のランチは？
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
    ["すべて掛け合わせると", <S11b />],               // 12 掛け算の数（ものさし）
    ["Aはほぼ同じ", <S11 />, "cut"],                  // 11 予想タイム（何倍か）。13 今日の順番は 2026-10-10 に削った（予想タイムを短く）
  ]} />
);

// ================= 第1章（14〜19） =================
const Ch1: React.FC = () => (
  <Steps items={[
    ["", <S13 />, "up"],                              // 14 階段・あなたの線
    ["さきほどの7000人", <S14 />, "wipe"],            // 15 13の行動の横棒
    ["別の、2000人の調査", <S15 />, "wipe"],         // 16 2千人の調査
    ["ひとりひとりの基準は", <S16 />, "up"],          // 17 散らばり：平均
    ["ところが、男性だけを見ても", <S16b />, "cut"],  // 18 散らばり：幅
    ["ただ、平均の差を聞くと", <S17 />],              // 19 先回り
  ]} />
);

// ================= 第2章（20〜32） =================
const Ch2: React.FC = () => (
  <Steps items={[
    ["", <S18 />],                                    // 20 同性どうしでも食い違う
    ["仲のいい男友達", <S19 />],                      // 21 あなたと男友達
    ["ただし、答えが割れる行動", <S21 />, "cut"],    // 23 割れる行動は性別で違う
    ["「男性は体の浮気", <S22 />, "up"],              // 24 1990年代の学生
    ["自分だけの地図", <S23 />],                      // 25 地図
    // 26〜30（100組のはしご・社会の線・3つそろえる計算）は 2026-10-10 オーナーの指示で削った
    ["特にずれやすいのは", <S29 />, "wipe"],          // 31 灰色の行動
    ["浮気の基準の話は", <S30 />],                    // 32 次の問い
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
    ["ずっと多くなるのは", <S43 />],// 45 掛け算の500倍
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
// 終了画面は締めの夜の続き（共通の部品 SignOff の end。003 と同じ。2026-10-10 オーナー「普段通りのエンディングでOK」）
const End: React.FC = () => <SignOff end />;

const narrated = fromTiming(timing as Timing, {
  opening: Opening, today: Today, quiz: QuizScene,
  "ch1-card": card(1, "日本の人の、浮気の基準は？"), ch1: Ch1,
  "ch2-card": card(2, "誰と誰の基準がずれる？"), ch2: Ch2,
  "ch3-card": card(3, "浮気をする人は、男女で違う？"), ch3: Ch3,
  "verdict-card": () => <AbsoluteFill><Gosa cues={[[0, "thinking"]]} size="M" /></AbsoluteFill>, verdict: VerdictScene,
  lesson: Lesson,
});
const scenes: SceneDef[] = [...narrated, { id: "end", seconds: END_FRAMES / FPS, Scene: End }];

const episode: EpisodeDef = {
  id: "006-cheating-line",
  title: "どこからが浮気か。男女2人の基準がぴったり合うのは、170組に1組", // 2026-10-07 オーナー決定（meta.md）
  scenes,
  bgm: [
    // 1曲を通しで流す（2026-10-07 オーナー：1本目・3本目と同じ曲）
    { file: "Stayin' Lazy - Godmode.mp3", from: "opening", to: "end" },
  ],
};
export default episode;
