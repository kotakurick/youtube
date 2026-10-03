// 毎回の型になるカード。
//  - ChannelTag：冒頭0〜5秒に右上へ1.5秒だけすべり込むチャンネル名（ロゴやあいさつは入れない）
//  - TodayCard：「今日の答え合わせ」。通説を1行で見せる（3秒前後）
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, R, sp, Z } from "./theme";

export const ChannelTag: React.FC<{ start?: number; seconds?: number }> = ({ start = 6, seconds = 1.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const end = start + Math.round(seconds * fps);
  const t = sp("enter", frame - start, fps) - interpolate(frame, [end, end + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t <= 0) return null;
  return (
    <div style={{ position: "absolute", right: Z.margin.x, top: Z.margin.top, background: C.ink, borderRadius: R.md,
      padding: "8px 24px", ...font("label", C.white), fontWeight: 900, opacity: Math.min(1, t * 2), transform: `translateX(${(1 - t) * 60}px)` }}>
      ゴサの答え合わせ
    </div>
  );
};

export const TodayCard: React.FC<{ claim: string; start?: number }> = ({ claim, start = 0 }) => {
  if (claim.length > 16) throw new Error(`TodayCard: 「${claim}」が${claim.length}字です。通説は1行16字までにしてください。`);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  return (
    <div style={{ position: "absolute", left: Z.stage.x + 40, top: 330, opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ display: "inline-block", background: C.ink, borderRadius: `${R.md}px ${R.md}px 0 0`, padding: "10px 32px", ...font("label", C.white), fontWeight: 900 }}>
        今日の答え合わせ
      </div>
      <div style={{ background: C.white, border: `4px solid ${C.ink}`, borderRadius: `0 ${R.lg}px ${R.lg}px ${R.lg}px`, padding: "48px 56px", ...font("question"), whiteSpace: "nowrap" }}>
        「{claim}」
      </div>
    </div>
  );
};
