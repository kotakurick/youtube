// 動きの小さな道具（4本目「40代、夫婦の満足」の場面のコードで作った。2026-10-06）。場面の中を区切り、絵を順に出す。
//   Beat ：from〜to のあいだだけ中身を出す（中のフレームは from からの数え直し）。10〜20秒ごとに絵を替える区切りに使う
//   Enter：中身を at から「enter」のばねで出す（下から少し上がって現れる）。HTML の重ね（全画面の div）。SVG の中では EnterG
//   Wipe ：中身を at から dur かけて左→右（right）／下→上（up）にぬぐって見せる。線が伸びる・柱が立つ・帯が敷かれる
//   useCue：読み上げの語の時刻（見つからなければ fallback。台本を直しても止まらない）
//   ramp ：at〜at+dur で 0→1（EASE）。数え上げや角度の補間に
// 決まり：ばねは theme の3種類だけ。opacity で「薄い色」を作らない（出入りのときだけ使う）。
import React from "react";
import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { useNarration } from "./Narration";
import { EASE, sp } from "./theme";

export const Beat: React.FC<{ from: number; to: number; children: React.ReactNode; name?: string }> = ({ from, to, children, name }) =>
  to > from ? <Sequence from={from} durationInFrames={to - from} name={name}>{children}</Sequence> : null;

export const ramp = (frame: number, at: number, dur: number) =>
  interpolate(frame, [at, at + Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });

export const Enter: React.FC<{ at?: number; dy?: number; dx?: number; children: React.ReactNode }> = ({ at = 0, dy = 24, dx = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const t = sp("enter", frame - at, fps);
  return <div style={{ position: "absolute", inset: 0, opacity: t, transform: `translate(${(1 - t) * dx}px,${(1 - t) * dy}px)` }}>{children}</div>;
};

export const EnterG: React.FC<{ at?: number; dy?: number; dx?: number; children: React.ReactNode }> = ({ at = 0, dy = 24, dx = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const t = sp("enter", frame - at, fps);
  return <g opacity={t} transform={`translate(${(1 - t) * dx},${(1 - t) * dy})`}>{children}</g>;
};

export const Wipe: React.FC<{ at?: number; dur?: number; dir?: "right" | "up"; children: React.ReactNode }> = ({ at = 0, dur = 30, dir = "right", children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const k = (1 - ramp(frame, at, dur)) * 100;
  const clip = dir === "right" ? `inset(0 ${k}% 0 0)` : `inset(${k}% 0 0 0)`;
  return <div style={{ position: "absolute", inset: 0, clipPath: k > 0 ? clip : undefined }}>{children}</div>;
};

/** 読み上げの語の時刻（フレーム）。find(語, 見つからないとき), at(k 文目), end（最後の字幕の終わり） */
export const useCue = () => {
  const n = useNarration();
  const find = (word: string, fallback: number) => { try { return n.find(word); } catch { return fallback; } };
  const endOf = (word: string, fallback: number) => { const l = n.lines.find(([, , t]) => t.includes(word)); return l ? l[1] : fallback; };
  return { n, find, endOf, end: n.end() };
};
