// 1本の動画＝場面の並び。場面ごとに長さ（秒）と音声ファイルを持つ。
// 音声は tts/tts.py で作り、npm run sync で public/episodes/<回>/audio/ に写したものを使う。
import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { C, sec } from "./theme";

export type SceneDef = {
  id: string;
  seconds: number;     // 音声の長さに合わせる
  audio?: string;      // public/episodes/<回>/audio/ の中のファイル名
  Scene: React.FC;
};

export type EpisodeDef = { id: string; title: string; scenes: SceneDef[] };

export const episodeFrames = (ep: EpisodeDef) => ep.scenes.reduce((a, s) => a + sec(s.seconds), 0);

export const Episode: React.FC<{ ep: EpisodeDef }> = ({ ep }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Series>
      {ep.scenes.map(({ id, seconds, audio, Scene }) => (
        <Series.Sequence key={id} durationInFrames={sec(seconds)} name={id}>
          <AbsoluteFill><Scene /></AbsoluteFill>
          {audio && <Audio src={staticFile(`episodes/${ep.id}/audio/${audio}`)} />}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
