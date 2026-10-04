// 毎回の型になるカード。
//  - ChannelTag：冒頭0〜5秒に右上へ1.5秒だけすべり込むチャンネル名（ロゴやあいさつは入れない）
//  - TodayCard：「今日の答え合わせ」。通説を1行で見せる（3秒前後）
//  - MidCheck：第2章の終わりの「ここまでの答え合わせ」（1行。最終の判定は最後に1回だけ）
//  - SubscribeNudge：登録のお願い（30〜40%の位置に画面の文字で1行だけ。声では言わない）
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, R, sp, useZ } from "./theme";

export const ChannelTag: React.FC<{ start?: number; seconds?: number }> = ({ start = 6, seconds = 1.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Z = useZ();
  const end = start + Math.round(seconds * fps);
  const t = sp("enter", frame - start, fps) - interpolate(frame, [end, end + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t <= 0) return null;
  return (
    <div style={{ position: "absolute", right: Z.margin.x, top: Z.margin.top, background: C.ink, borderRadius: R.md,
      padding: "8px 24px", ...font("label", C.white), fontWeight: 900, opacity: Math.min(1, t * 2), transform: `translateX(${(1 - t) * 60}px)` }}>
      吾輩は数える猫である
    </div>
  );
};

export const TodayCard: React.FC<{ claim: string; start?: number }> = ({ claim, start = 0 }) => {
  if (claim.length > 16) throw new Error(`TodayCard: 「${claim}」が${claim.length}字です。通説は1行16字までにしてください。`);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  const Z = useZ();
  return (
    <div style={{ position: "absolute", left: Z.stage.x + (Z.vertical ? 0 : 40), top: Z.vertical ? Z.stage.y : 330, maxWidth: Z.stage.w, opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ display: "inline-block", background: C.ink, borderRadius: `${R.md}px ${R.md}px 0 0`, padding: "10px 32px", ...font("label", C.white), fontWeight: 900 }}>
        今日の答え合わせ
      </div>
      <div style={{ background: C.white, border: `4px solid ${C.ink}`, borderRadius: `0 ${R.lg}px ${R.lg}px ${R.lg}px`, padding: "48px 56px", ...font("question"), whiteSpace: Z.vertical ? "normal" : "nowrap" }}>
        「{claim}」
      </div>
    </div>
  );
};

/** 第2章の終わりの「ここまでの答え合わせ」（問いの見出しの区画に1行、4秒前後） */
export const MidCheck: React.FC<{ text: string; start?: number }> = ({ text, start = 0 }) => {
  if (text.length > 22) throw new Error(`MidCheck: 「${text}」が${text.length}字です。22字までの1行にしてください。`);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Z = useZ();
  const t = sp("enter", frame - start, fps);
  return (
    <div style={{ position: "absolute", left: Z.header.x, top: Z.header.y, display: "flex", alignItems: "stretch", opacity: t,
      transform: `translateY(${(1 - t) * -20}px)` }}>
      <div style={{ background: C.ink, borderRadius: `${R.md}px 0 0 ${R.md}px`, padding: "10px 24px", ...font("label", C.white), fontWeight: 900 }}>ここまでの答え合わせ</div>
      <div style={{ background: C.white, border: `4px solid ${C.ink}`, borderLeft: "none", borderRadius: `0 ${R.md}px ${R.md}px 0`, padding: "6px 28px", ...font("label") }}>{text}</div>
    </div>
  );
};

/** 登録のお願い（画面の文字で1行。右上に4秒だけ） */
export const SubscribeNudge: React.FC<{ start?: number; seconds?: number }> = ({ start = 0, seconds = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Z = useZ();
  const end = start + Math.round(seconds * fps);
  const t = sp("enter", frame - start, fps) - interpolate(frame, [end, end + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t <= 0) return null;
  return (
    <div style={{ position: "absolute", right: Z.margin.x, top: Z.margin.top, border: `4px solid ${C.ink}`, background: C.white, borderRadius: R.md,
      padding: "6px 22px", ...font("label"), opacity: Math.min(1, t * 2) }}>
      次の答え合わせも、登録で届きます
    </div>
  );
};
