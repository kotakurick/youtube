// 読み上げと場面をつなぐ。tts/narrate.py が書いた timing.json から、場面の長さ・音声・字幕を自動で決める。
//   const scenes = fromTiming(timing, { opening: Opening, ch1: Chapter1, ... });   // 台本の場面 id → 場面の部品
// 場面の中では useNarration() で「何文目がいつ始まるか」が分かる（動きを読み上げに合わせる）：
//   const n = useNarration(); <HeroNumber start={n.find("38人")} … />
import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, font, FPS, sec } from "./theme";
import type { Line } from "./Subtitle";
import type { SceneDef } from "./Episode";

export type TimingScene = { id: string; seconds: number; audio: string | null; lines: [number, number, string][] };
export type Timing = { voice: string; scenes: TimingScene[] };

/** まだ絵のない場面の仮の画面（仮通し用）：場面の id と、いま読んでいる字幕を大きく出す */
const Placeholder: React.FC<{ id: string }> = ({ id }) => {
  const { lines } = useContext(NarrationContext);
  const frame = useCurrentFrame();
  const cur = lines.find(([a, b]) => frame >= a && frame < b);
  return (
    <AbsoluteFill style={{ background: C.paper2, alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={font("label", C.ink2)}>仮の場面：{id}</div>
      <div style={{ ...font("question"), maxWidth: 1400, textAlign: "center" }}>{cur?.[2] ?? ""}</div>
    </AbsoluteFill>
  );
};

/**
 * timing.json の場面の並びどおりに SceneDef を作る。部品のない場面があれば、足りない id を知らせて止める。
 * draft: true なら、部品のない場面は仮の画面にする（仮通し：絵を描く前に18分を最後まで流して、テンポと章の長さを確かめる）
 */
export const fromTiming = (timing: Timing, parts: Record<string, React.FC>, opts: { draft?: boolean } = {}): SceneDef[] => {
  const missing = timing.scenes.filter((s) => !parts[s.id]).map((s) => s.id);
  if (missing.length && !opts.draft) throw new Error(`fromTiming: 場面の部品がありません：${missing.join("、")}（台本の場面 id と合わせる。仮通しなら { draft: true }）`);
  const ph = new Map(missing.map((id) => [id, (() => <Placeholder id={id} />) as React.FC]));
  const unused = Object.keys(parts).filter((k) => !timing.scenes.some((s) => s.id === k));
  if (unused.length) console.warn(`fromTiming: 台本にない場面の部品：${unused.join("、")}`);
  return timing.scenes.map((s) => ({
    id: s.id, seconds: s.seconds, audio: s.audio ?? undefined, Scene: parts[s.id] ?? ph.get(s.id)!,
    lines: s.lines.map(([a, b, t]) => [Math.round(a * FPS), Math.round(b * FPS), t] as Line),
  }));
};

type Narr = { lines: Line[] };
export const NarrationContext = createContext<Narr>({ lines: [] });

/** いまの場面の読み上げ。at(k)＝k文目（0から）の始まり、find(語)＝その語を含む最初の字幕の始まり（フレーム） */
export const useNarration = () => {
  const { lines } = useContext(NarrationContext);
  return {
    lines,
    at: (k: number) => {
      if (!lines[k]) throw new Error(`useNarration: ${k}文目がありません（この場面の字幕は${lines.length}枚）`);
      return lines[k][0];
    },
    find: (word: string) => {
      const l = lines.find(([, , t]) => t.includes(word));
      if (!l) throw new Error(`useNarration: 「${word}」を含む字幕がありません`);
      return l[0];
    },
    end: () => (lines.length ? lines[lines.length - 1][1] : 0),
  };
};

export const secToFrames = sec;
