// この回の動画。使うときは Episode.tsx に名前を変える（名前が Episode.tsx のものだけ自動で登録される）。
// 部品は render/src/lib/ にある。書き方の見本は render/src/demo/demo.tsx、決まりは docs/brand.md。
// seconds は読み上げ音声の長さに合わせる（tts/tts.py の出力）。音声は npm run sync で public/ に写る。
//
// 標準構成（18分前後・3章）：
//   物語の冒頭（○番さん。最初の1割で問いと最初の数字）→ 今日の答え合わせ（TodayCard）→ 予想タイム → 道案内
//   → 第1章（身近な統計）→ 第2章（仕組み。もう一方の側のデータも出す。終わりに「ここまでの答え合わせ」を1行）
//   → 第3章（もしも：SimBackground ＋ SourceNote sim）→ 答え合わせ（Verdict）→ 教訓（冒頭の人物に戻る）→ 終了画面20秒
import React from "react";
import { ChannelTag, TodayCard } from "@lib/Cards";
import { Gosa } from "@lib/Gosa";
import { Subtitle } from "@lib/Subtitle";
import { sec } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

const Opening: React.FC = () => (
  <>
    <ChannelTag />
    <Gosa cues={[[20, "normal"]]} size="S" exit={50} />
    <Subtitle lines={[[0, sec(5), "（字幕）"]]} />
  </>
);

const Today: React.FC = () => (
  <>
    <TodayCard claim="（通説を1行で）" />
    <Gosa cues={[[6, "thinking"]]} />
    <Subtitle lines={[[0, sec(3), "今日の答え合わせは、この説です。"]]} />
  </>
);

const episode: EpisodeDef = {
  id: "000-example",            // フォルダ名と同じにする（英数字とハイフン）
  title: "（タイトル）",
  scenes: [
    { id: "opening", seconds: 5, audio: undefined, Scene: Opening },
    { id: "today", seconds: 3, audio: undefined, Scene: Today },
  ],
  // bgm: [{ file: "story.mp3", from: "opening", to: "today" }],  // 曲は $YT_DATA_DIR/bgm/ に置く
};
export default episode;
