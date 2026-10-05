// 章の切り替え：墨のワイプ（12f）→ 章の扉（番号と題）→ ワイプで抜ける。全部で3秒以内。合図音とゴサのひらめき付き。
// ChapterDots は章の位置を示す点（右上に残す）。
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { Sfx } from "./Sfx";
import { C, CHANNEL_NAME, font, LINE, sp, useZ } from "./theme";

export const CHAPTER_FRAMES = 84; // 2.8秒

export const ChapterCard: React.FC<{ no: number; title: string }> = ({ no, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: Easing.inOut(Easing.cubic) };
  const inX = interpolate(frame, [0, 12], [-1920, 0], ease);
  const outX = interpolate(frame, [CHAPTER_FRAMES - 12, CHAPTER_FRAMES], [0, 1920], ease);
  const t = sp("enter", frame - 10, fps);
  return (
    <AbsoluteFill style={{ background: C.ink, transform: `translateX(${inX + outX}px)` }}>
      {/* チャンネル名（左上。2026-10-05 オーナー「章のところにチャンネル名をのせてもいいかも」） */}
      <div style={{ position: "absolute", left: 220, top: 260, opacity: t, display: "flex", alignItems: "center", gap: 20, ...font("label", C.paper2), fontWeight: 900 }}>
        <span>{CHANNEL_NAME}</span>
        <span style={{ width: 120, height: LINE.hair, background: C.paper2 }} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 380, opacity: t, transform: `translateX(${(1 - t) * -40}px)` }}>
        <div style={{ ...font("label", C.paper2) }}>第{no}章</div>
        <div style={{ ...font("chapter", C.white), marginTop: 12 }}>{title}</div>
      </div>
      <Gosa cues={[[8, "idea"]]} dark size="M" exit={CHAPTER_FRAMES - 22} sfx={false} />
      <Sfx name="signal" at={6} />
    </AbsoluteFill>
  );
};

export const ChapterDots: React.FC<{ current: number; total?: number }> = ({ current, total = 3 }) => {
  const Z = useZ();
  return (
  <div style={{ position: "absolute", right: Z.margin.x, top: Z.margin.top, display: "flex", gap: 14 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ width: 18, height: 18, borderRadius: 9, boxSizing: "border-box",
        background: i + 1 === current ? C.ink : "transparent", border: `3px solid ${i + 1 <= current ? C.ink : C.rest}` }} />
    ))}
  </div>
);
};
