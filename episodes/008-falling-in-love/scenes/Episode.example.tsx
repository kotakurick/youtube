// この回の動画。使うときは Episode.tsx に名前を変える（名前が Episode.tsx のものだけ自動で登録される）。
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
    <TodayCard claim="（通説を1行で）" />
    <Gosa cues={[[6, "thinking"]]} />
  </>
);

const episode: EpisodeDef = {
  id: "008-falling-in-love",            // フォルダ名と同じにする（英数字とハイフン）
  title: "（タイトル）",
  // draft: true のうちは、部品のない場面が仮の画面（場面名と字幕）になる。全部そろったら外す
  scenes: fromTiming(timing as Timing, { opening: Opening, today: Today }, { draft: true }),
  // bgm: [{ file: "story.mp3", from: "opening", to: "today" }],  // 曲は $YT_DATA_DIR/bgm/ に置く。startAt: 10 で曲の10秒目から流す
};
export default episode;
