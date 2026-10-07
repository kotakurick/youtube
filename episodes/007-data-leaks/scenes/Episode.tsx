// 7本目「情報漏えい」の動画（台本 script.md 第6稿・改、絵コンテ 第2版 Storyboard.tsx の53場面）。
// 場面の絵は Storyboard.tsx から読み（同じ絵を二度書かない）、ここでは「いつ・どう動くか」だけを書く（006 と同じ作り）。
// 台本の場面（timing.json の14個）の中を、読み上げの語（useCue().find）で区切り（Steps）、絵コンテの場面を順に出す。
// 区切りの語は絵コンテの lines（場面の最初の語）と同じ。絵コンテの番号（一覧の 01〜53）をコメントに書いた。
// 細かい動き（帯が伸びる・質屋のシャッターが下りる・群衆が並ぶ など）は、仮通しで見てから足す。
import React from "react";
import { AbsoluteFill } from "remotion";
import { ChannelTag } from "@lib/Cards";
import { Camera } from "@lib/Camera";
import { ChapterCard } from "@lib/Chapter";
import type { EpisodeDef, SceneDef } from "@lib/Episode";
import { EndScreen, END_FRAMES } from "@lib/EndScreen";
import { Gosa } from "@lib/Gosa";
import { Beat, Enter, useCue, Wipe } from "@lib/Motion";
import { fromTiming, Timing } from "@lib/Narration";
import { SignOff } from "@lib/SignOff";
import { FPS } from "@lib/theme";
import timing from "../timing.json";
import {
  S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26,
  S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47, S48, S49, S50, S51, S52,
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

// ================= 冒頭の物語（01〜06） =================
const Opening: React.FC = () => (
  <>
    <Steps items={[
      ["", <S01 />, "cut"],                            // 01 秋の火曜の夜、台所の彼
      ["出てきたのは4通", <S02 />],                    // 02 受信箱の4通
      ["3通目は、ときどき使う", <S03 />],              // 03 3通目、免許証の画像
      ["4通目は、去年口座を", <S04 />],                // 04 焼肉と、アンケートと、車と、株
      ["この半月ほどで公表された", <S05 />, "up"],     // 05 この半月で約2,000万件
      ["SNSでは、日本人の", <S06 />, "cut"],           // 06 SNSの投稿と、彼のため息
    ]} />
    <ChannelTag start={6} />
  </>
);
const Surprise: React.FC = () => (
  <Steps items={[
    ["", <S07 />, "up"],                              // 07 盗まれたカード1枚の値段
    ["それでも、1枚およそ", <S08 />],                 // 08 約3,400円＝飲み会1回ぶん
  ]} />
);
const Today: React.FC = () => <S09 />;                // 09 今日の答え合わせ（4つの話）
const QuizScene: React.FC = () => (
  <Steps items={[
    ["", <S10 />, "cut"],                             // 10 予想タイム：本当の話はいくつ
    ["まず、本当に増えたのか", <S11 />],              // 11 今日の順番
  ]} />
);

// ================= 第1章：本当に増えたのか（12〜22） =================
const Ch1: React.FC = () => (
  <Steps items={[
    ["", <S12 />, "up"],                              // 12 国への報告の8割は人のミス
    ["上場企業とその子会社が", <S13 />, "wipe"],      // 13 盗まれる漏えいは約6倍、ミスは横ばい
    ["会社のデータを人質に", <S14 />, "wipe"],        // 14 ランサムウェアの届け出
    ["それなら、彼の4通は", <S15 />, "cut"],          // 15 4通目：証券会社 → 問い合わせの机
    ["その専門の会社は、同じ", <S16 />],              // 16 1か所から最大5社のおわび
    ["国への報告も、事故の数", <S17 />, "wipe"],      // 17 国への報告の7件に1件が1つの事故から
    ["ここまで聞くと、日本人は", <S18 />, "up"],      // 18 延べ2億人超：人口の約1.7倍
    ["でも、延べなので", <S19 />, "cut"],             // 19 延べなので、同じ人が何度も
    ["そこで、延べの数を", <S20 />],                  // 20 100人の町に配る
    ["しるしを配り終えると", <S21 />, "cut"],         // 21 3人に1人は一度も漏れていない
    ["ログインするサービスが20", <S22 />, "up"],      // 22 サービスが20を超えるなら
  ]} />
);

// ================= 第2章：情報はどこへ行くのか（23〜35） =================
const Ch2: React.FC = () => (
  <Steps items={[
    ["", <S23 />, "up"],                              // 23 盗品の値段と慰謝料
    ["なぜ、それほど安いの", <S24 />],                // 24 質屋に持ちこんで、はじめてお金に
    ["闇の売り場を調べた研究者", <S25 />, "wipe"],    // 25 論文の題：金を、銀の値段で売る人はいない
    ["しかも売り場には", <S26 />],                    // 26 代金だけ取る売り手：だから安い
    ["彼の2通目にも", <S27 />, "cut"],                // 27 2通目：ポイントの交換先が質屋
    ["一方、焼肉のアプリで", <S28 />, "cut"],         // 28 1通目：名前とメールでは換えられない
    ["質屋は、新しく開くことも", <S29 />, "wipe"],    // 29 4通目：証券口座の質屋
    ["多い月には、勝手に", <S30 />, "up"],            // 30 勝手な売買、月ごと
    ["もっと前に閉まった質屋", <S31 />, "wipe"],      // 31 閉まった質屋：偽造カード
    ["カードにICチップを", <S32 />, "cut"],           // 32 ICチップと、番号の盗用
    ["同じころ、ネットの店にも", <S33 />],            // 33 番号の盗用、はじめて減った
    ["その番号を聞き出す", <S34 />, "up"],            // 34 だますメール123倍、被害額2.2倍
    ["それでも、だますメールの", <S35 />],            // 35 4つの質屋：盗む側はどれだけ稼ぐ？
  ]} />
);

// ================= 第3章：盗む側の稼ぎ（36〜42） =================
const Ch3: React.FC = () => (
  <Steps items={[
    ["", <S36 />, "up"],                              // 36 捕まった人の約7割は10代と20代
    ["お金が大きく動く攻撃も", <S37 />, "wipe"],      // 37 大きな攻撃も分業
    ["アメリカの司法省の発表", <S38 />, "wipe"],      // 38 作る側は2割、実行役の多くは無報酬
    ["サイバー犯罪の現場で", <S39 />, "cut"],         // 39 地味で退屈な保守作業
    ["一方、襲われた側の損", <S40 />, "wipe"],        // 40 襲われた側の損
    ["それでも、稼ぎの元になる", <S41 />, "up"],      // 41 身代金を払う組織は5社に1社へ
    ["世界で払われた身代金の合計", <S42 />, "up"],    // 42 世界の身代金は増えていない
  ]} />
);

// ================= 答え合わせ（43〜47）・示唆（48） =================
const VerdictScene: React.FC = () => (
  <Steps items={[
    ["", <S43 />, "cut"],                             // 43 答え合わせ1：激増は半分本当
    ["2つ目の「すぐ現金」", <S44 />, "cut"],          // 44 答え合わせ2：すぐ現金はちがう
    ["3つ目の「天才」", <S45 />, "cut"],              // 45 答え合わせ3：天才はちがう
    ["4つ目の「大儲け」", <S46 />, "cut"],            // 46 答え合わせ4：大儲けは半分本当
    ["予想の答えは、ゼロ", <S47 />, "cut"],           // 47 予想の答え：ゼロ
  ]} />
);
const Hint: React.FC = () => <S48 />;                 // 48 示唆：読み直す3つの点

// ================= 教訓（49〜53） =================
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const sell = find("ただ、売り場に並ぶことと", 300);
  const open = find("漏えいの被害は、盗まれた", sell + 450);
  const times = find("盗む入り口の、だますメール", open + 300);
  const sign = end - 8; // 締めのひと言は字幕がないので、最後の字幕の終わりから（001・004・006 と同じ）
  return (
    <>
      <Beat from={0} to={sell}><Drift len={sell}><S49 /></Drift></Beat>                               {/* 49 台所の4通 */}
      <Beat from={sell} to={open}><Drift len={open - sell}><Enter dy={0}><S50 /></Enter></Drift></Beat> {/* 50 売り場とお金のあいだの質屋 */}
      <Beat from={open} to={times}><Drift len={times - open}><Enter dy={0}><S51 /></Enter></Drift></Beat> {/* 51 開いている質屋で被害は変わる */}
      <Beat from={times} to={sign}><Drift len={sign - times}><Wipe dir="up" dur={36}><S52 /></Wipe></Drift></Beat> {/* 52 入り口は123倍、被害額は2.2倍 */}
      <Beat from={sign} to={sign + 600}><SignOff /></Beat>                                             {/* 53 締めのひと言 */}
    </>
  );
};

// ================= 章の扉と終了画面（声のない場面） =================
const card = (no: number, title: string): React.FC => () => <ChapterCard no={no} title={title} />;
const End: React.FC = () => <EndScreen lesson={"被害を決めるのは、\n盗まれた数より、\n開いている質屋。"} />;

const narrated = fromTiming(timing as Timing, {
  opening: Opening, surprise: Surprise, today: Today, quiz: QuizScene,
  "ch1-card": card(1, "漏えいは、本当に増えたのか？"), ch1: Ch1,
  "ch2-card": card(2, "漏れた情報は、どこへ行くのか？"), ch2: Ch2,
  "ch3-card": card(3, "盗む側は、どれだけ稼ぐのか？"), ch3: Ch3,
  "verdict-card": () => <AbsoluteFill><Gosa cues={[[0, "thinking"]]} size="M" /></AbsoluteFill>, verdict: VerdictScene,
  hint: Hint, lesson: Lesson,
});
const scenes: SceneDef[] = [...narrated, { id: "end", seconds: END_FRAMES / FPS, Scene: End }];

const episode: EpisodeDef = {
  id: "007-data-leaks",
  title: "漏えいのニュースが止まらない。漏れた情報は、どこへ行くのか（仮の題）",
  scenes,
  // BGM は曲を決めてから（ローカルの工程）
};
export default episode;
