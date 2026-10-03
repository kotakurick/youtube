// 効果音。音はコードで作る（render/scripts/make-sfx.mjs → npm run sync で public/sfx/ に書き出す）。
// ゴサの表情ごとに1つ・判定のスタンプ・章の合図。鳴き声は使わない。ゴサの音は30秒に1回まで（Gosa.tsx が守る）。
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export type SfxName =
  | "gosa-surprised" | "gosa-assertive" | "gosa-depends" | "gosa-skeptical" | "gosa-idea" | "gosa-panic"
  | "signal" | "tick" | "flip" | "roll" | "hit" | "verdict-o" | "verdict-tri" | "verdict-x";

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.6 }) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
