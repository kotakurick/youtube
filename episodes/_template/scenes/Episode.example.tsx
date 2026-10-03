// この回の動画。使うときは Episode.tsx に名前を変える（名前が Episode.tsx のものだけ自動で登録される）。
// 部品は render/src/lib/ にある。書き方の見本は render/src/demo/demo.tsx。
// seconds は読み上げ音声の長さに合わせる（tts/tts.py の出力）。音声は npm run sync で public/ に写る。
import React from "react";
import { Gosa } from "@lib/Gosa";
import { Question } from "@lib/Question";
import { Subtitle } from "@lib/Subtitle";
import { sec } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";

const Opening: React.FC = () => (
  <>
    <Question text="（問い）" />
    <Gosa cues={[[10, "thinking"]]} x={1650} y={760} />
    <Subtitle lines={[[0, sec(5), "（字幕）"]]} />
  </>
);

const episode: EpisodeDef = {
  id: "000-example",            // フォルダ名と同じにする（英数字とハイフン）
  title: "（タイトル）",
  scenes: [
    { id: "opening", seconds: 5, audio: undefined, Scene: Opening },
  ],
};
export default episode;
