// 1本の動画＝場面の並び。場面ごとに長さ（秒）と音声ファイルを持つ。
// 音声は tts/tts.py で作り、npm run sync で public/episodes/<回>/audio/ に写したものを使う。
// BGM は YouTube オーディオライブラリの5〜6曲を固定で使う（2026-10-04 決定）。曲は $YT_DATA_DIR/bgm/ に置き、
// npm run sync で public/bgm/ に写る。声のある場面では声より約19dB下げ、声のない場面では少し上げる（自動）。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, Series, staticFile } from "remotion";
import { C, sec } from "./theme";
import type { ThumbProps } from "./Thumbnail";

export type SceneDef = {
  id: string;
  seconds: number;     // 音声の長さに合わせる
  audio?: string;      // public/episodes/<回>/audio/ の中のファイル名
  Scene: React.FC;
  bgmMute?: [number, number][]; // この場面の中で BGM を止める区間（秒）。判定の直前の無音など
};

/** BGM の区間：from の場面の頭から、to の場面の終わりまで（to を省くと from の場面だけ） */
export type BgmDef = { file: string; from: string; to?: string };

export type EpisodeDef = {
  id: string; title: string; scenes: SceneDef[]; bgm?: BgmDef[];
  thumb?: ThumbProps; // あれば <回>-thumb（紙色の地）と <回>-thumb-ink（墨の地。テスト用）を登録する
};

export const episodeFrames = (ep: EpisodeDef) => ep.scenes.reduce((a, s) => a + sec(s.seconds), 0);

const VOL = { underVoice: 0.11, alone: 0.3 }; // 0.11 ≒ -19dB

/** BGM の音量をフレームごとに決める（場面の切れ目で 10f かけて変える） */
const useBgmVolume = (ep: EpisodeDef) => useMemo(() => {
  const marks: { at: number; v: number }[] = [];
  let f = 0;
  for (const s of ep.scenes) {
    marks.push({ at: f, v: s.audio ? VOL.underVoice : VOL.alone });
    for (const [a, b] of s.bgmMute ?? []) { marks.push({ at: f + sec(a), v: 0 }); marks.push({ at: f + sec(b), v: s.audio ? VOL.underVoice : VOL.alone }); }
    f += sec(s.seconds);
  }
  marks.sort((a, b) => a.at - b.at);
  return (frame: number) => {
    let i = 0;
    while (i + 1 < marks.length && marks[i + 1].at <= frame) i++;
    const cur = marks[i], prev = marks[i - 1];
    if (!prev) return cur.v;
    const fade = cur.v === 0 ? 2 : 10; // 止めるときはすぐ止める
    return interpolate(frame, [cur.at, cur.at + fade], [prev.v, cur.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
}, [ep]);

export const Episode: React.FC<{ ep: EpisodeDef }> = ({ ep }) => {
  const volumeAt = useBgmVolume(ep);
  const startOf = (id: string) => {
    let f = 0;
    for (const s of ep.scenes) { if (s.id === id) return { f, len: sec(s.seconds) }; f += sec(s.seconds); }
    throw new Error(`Episode: BGM の場面 ${id} がありません`);
  };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Series>
        {ep.scenes.map(({ id, seconds, audio, Scene }) => (
          <Series.Sequence key={id} durationInFrames={sec(seconds)} name={id}>
            <AbsoluteFill><Scene /></AbsoluteFill>
            {audio && <Audio src={staticFile(`episodes/${ep.id}/audio/${audio}`)} />}
          </Series.Sequence>
        ))}
      </Series>
      {(ep.bgm ?? []).map((b) => {
        const a = startOf(b.from), z = startOf(b.to ?? b.from);
        const len = z.f + z.len - a.f;
        return (
          <Sequence key={b.from} from={a.f} durationInFrames={len} name={`bgm:${b.file}`} layout="none">
            <Audio src={staticFile(`bgm/${b.file}`)} loop
              volume={(f) => volumeAt(a.f + f) * interpolate(f, [0, 15, len - 30, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
