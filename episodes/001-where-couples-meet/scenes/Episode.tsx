// 1本目「夫婦の出会いの変化」の動画。テンプレートの見本から作った（場面の部品はまだ。draft のまま）。
// 部品は render/src/lib/ にある。書き方の見本は render/src/demo/（demo-narrated が台本からの流れ）、決まりは docs/brand.md。
//
// 流れ：
//   1. script.md を書く（## 見出しが場面。細かく分けるときは <!-- 場面: ch1-crowd -->、声のない場面は <!-- 場面: ch2-card 2.8秒 -->）
//   2. python tts/narrate.py episodes/<回> --voice silent   … 仮の無音で尺と字幕の時刻（timing.json）を作る
//   3. 下の parts を空のまま draft: true で書き出す → 仮の場面で18分を通して見る（仮通し）
//   4. 場面の部品を1つずつ足す。動きは useNarration() で読み上げに合わせる（n.at(2)＝3文目の始まり、n.find("38人")）
//   5. 声が決まったら --voice を変えて narrate.py をもう一度。尺と字幕は自動で声に合う
//   6. cd render && npm run check -- <回のid> で「直すもの」を0にしてから書き出す
import React from "react";
import { ChannelTag, TodayCard } from "@lib/Cards";
import { Gosa } from "@lib/Gosa";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import type { EpisodeDef } from "@lib/Episode";
import timing from "../timing.json";

const Opening: React.FC = () => {
  const n = useNarration();
  return (
    <>
      <ChannelTag />
      <Gosa cues={[[n.at(0) + 20, "normal"]]} size="S" exit={n.at(0) + 50} />
    </>
  );
};

const Today: React.FC = () => (
  <>
    <TodayCard claim="いまは、マッチングアプリで出会う夫婦が、いちばん多い。" />
    <Gosa cues={[[6, "thinking"]]} />
  </>
);

const episode: EpisodeDef = {
  id: "001-where-couples-meet",            // フォルダ名と同じにする（英数字とハイフン）
  title: "夫婦の出会いの変化",                 // 仮。タイトルは meta.md で決める
  // draft: true のうちは、部品のない場面が仮の画面（場面名と字幕）になる。全部そろったら外す
  scenes: fromTiming(timing as Timing, { opening: Opening, today: Today }, { draft: true }),
  // BGM の割り当て（2026-10-04 決定、docs/decisions.md）。曲は $YT_DATA_DIR/bgm/ に置き、npm run sync で写る。
  // 決定では「教訓の前に冒頭の人物へ戻る所」も Sizzr だが、今は教訓が1つの場面なので Away だけにしている。
  // 戻る所を分けるには、script.md の教訓に <!-- 場面: lesson-return --> を足し、下の lesson の行を分ける。
  // 終了画面の場面ができたら、Away の to をそこまで延ばす。
  bgm: [
    { file: "Sizzr - Schwartzy.mp3", from: "opening", to: "quiz" },          // 冒頭の物語・今日の答え合わせ・予想タイム
    { file: "Stayin' Lazy - Godmode.mp3", from: "ch1", to: "ch2" },          // 第1章・第2章
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch3" },             // 第3章（シミュレーション）
    { file: "Traversing - Godmode.mp3", from: "verdict" },                   // 判定
    { file: "Away - Patrick Patrikios.mp3", from: "lesson" },                // 教訓
  ],
};
export default episode;
