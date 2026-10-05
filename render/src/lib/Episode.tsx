// 1本の動画＝場面の並び。場面ごとに長さ（秒）と音声ファイルを持つ。
// 音声は tts/tts.py で作り、npm run sync で public/episodes/<回>/audio/ に写したものを使う。
// BGM は YouTube オーディオライブラリの5〜6曲を固定で使う（2026-10-04 決定）。曲は $YT_DATA_DIR/bgm/ に置き、
// npm run sync で public/bgm/ に写る。声のある場面では声より約19dB下げ、声のない場面では少し上げる（自動）。
// 曲ごとの大きさの違いは npm run bgm が測って bgm/levels.json に書き、ここで自動でそろえる。
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, getStaticFiles, interpolate, Sequence, Series, staticFile } from "remotion";
import { NarrationContext } from "./Narration";
import { Line, Subtitle } from "./Subtitle";
import { C, sec } from "./theme";
import type { ThumbProps } from "./Thumbnail";
import { qaEnabled } from "./QAOverlay";

export type SceneDef = {
  id: string;
  seconds: number;     // 音声の長さに合わせる
  audio?: string;      // public/episodes/<回>/audio/ の中のファイル名
  Scene: React.FC;
  bgmMute?: [number, number][]; // この場面の中で BGM を止める区間（秒）。判定の直前の無音など
  lines?: Line[];      // 読み上げの字幕（fromTiming が入れる）。あれば字幕を自動で出し、useNarration() に渡す
};

/** BGM の区間：from の場面の頭から、to の場面の終わりまで（to を省くと from の場面だけ）。
 *  startAt は曲の何秒目から流すか（頭が静かな曲を途中から使うとき。ループしても2周目以降もそこから始まる） */
export type BgmDef = { file: string; from: string; to?: string; startAt?: number };

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

type Levels = { files: Record<string, { gainDb: number }> };
/** 曲ごとの音量の直し（倍率）。bgm/levels.json がなければ直さない */
const useBgmGains = () => {
  const has = hasFile("bgm/levels.json");
  const [levels, setLevels] = useState<Levels | null>(null);
  const [handle] = useState(() => (has ? delayRender("BGM の音量") : null));
  useEffect(() => {
    if (handle === null) return;
    fetch(staticFile("bgm/levels.json")).then((r) => r.json()).then((j: Levels) => { setLevels(j); continueRender(handle); }).catch(cancelRender);
  }, [handle]);
  return (file: string) => 10 ** ((levels?.files[file]?.gainDb ?? 0) / 20);
};

// 音声ファイルがない（tts/narrate.py をまだ動かしていない・別のパソコン）ときは、音なしで描く
const hasFile = (p: string) => {
  try { return getStaticFiles().some((f) => f.name === p); } catch { return true; }
};

let scenesLogged = false;
export const Episode: React.FC<{ ep: EpisodeDef }> = ({ ep }) => {
  // npm run check のとき、場面の区切りを書き出す（どのフレームを調べるかに使う）
  if (!scenesLogged && qaEnabled()) {
    scenesLogged = true;
    let f = 0;
    console.debug("QA_SCENES:" + JSON.stringify(ep.scenes.map((s) => { const a = f; f += sec(s.seconds); return { id: s.id, from: a, len: sec(s.seconds) }; })));
  }
  const volumeAt = useBgmVolume(ep);
  const gainOf = useBgmGains();
  const startOf = (id: string) => {
    let f = 0;
    for (const s of ep.scenes) { if (s.id === id) return { f, len: sec(s.seconds) }; f += sec(s.seconds); }
    throw new Error(`Episode: BGM の場面 ${id} がありません`);
  };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Series>
        {ep.scenes.map(({ id, seconds, audio, Scene, lines }) => (
          <Series.Sequence key={id} durationInFrames={sec(seconds)} name={id}>
            <NarrationContext.Provider value={{ lines: lines ?? [] }}>
              <AbsoluteFill><Scene /></AbsoluteFill>
              {lines && lines.length > 0 && <Subtitle lines={lines} />}
            </NarrationContext.Provider>
            {audio && hasFile(`episodes/${ep.id}/audio/${audio}`) && <Audio src={staticFile(`episodes/${ep.id}/audio/${audio}`)} />}
          </Series.Sequence>
        ))}
      </Series>
      {/* 曲が手元にない（クラウドで静止画だけ作るとき）は、BGM なしで描く */}
      {(ep.bgm ?? []).filter((b) => hasFile(`bgm/${b.file}`)).map((b) => {
        const a = startOf(b.from), z = startOf(b.to ?? b.from);
        const len = z.f + z.len - a.f;
        const g = gainOf(b.file);
        return (
          <Sequence key={b.from} from={a.f} durationInFrames={len} name={`bgm:${b.file}`} layout="none">
            <Audio src={staticFile(`bgm/${b.file}`)} loop trimBefore={b.startAt ? sec(b.startAt) : undefined}
              volume={(f) => Math.min(1, g * volumeAt(a.f + f)) * interpolate(f, [0, 15, len - 30, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
