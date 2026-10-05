// 文字の札（使い回す部品。2026-10-05 1本目 v3 の場面から lib に移した）。どれを使うかは docs/parts.md の「文字の札」。
//   - Chip    ：墨の札（見出し・条件・町の名前）。1行
//   - Facts   ：箇条の札。1つ1つが独立した事実・条件のときだけ（1つの文を札に分けない。2026-10-05 オーナー）
//   - Note    ：ひとつながりの文（説明・問い）を1枚の札に。行の切れ目は \n で決める
//   - Choices ：予想の選択肢を横1列に（A〜D）。answer を付けると答えだけ墨で塗る
//   - BigCount：大きな数字＋単位（数えながら出る。墨の下線）
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R, sp } from "./theme";

/** 墨の札（見出し・条件）。light で紙色の札 */
export const Chip: React.FC<{ x: number; y: number; text: string; start?: number; light?: boolean }> = ({ x, y, text, start = 0, light }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: t, transform: `translateY(${(1 - t) * 16}px)`, whiteSpace: "nowrap",
      ...font("label", light ? C.ink : C.white), background: light ? C.paper2 : C.ink, borderRadius: R.sm, padding: "4px 16px" }}>{text}</div>
  );
};

/** 箇条の札。1つずつ入る。札の中の改行は \n（狭い所に置くとき） */
export const Facts: React.FC<{ x: number; y: number; items: string[]; gap?: number; start?: number; every?: number }> = (
  { x, y, items, gap = 18, start = 0, every = 20 },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: "column", alignItems: "flex-start", gap }}>
      {items.map((it, k) => {
        const t = sp("enter", frame - start - k * every, fps);
        return <div key={k} style={{ ...font("label"), opacity: t, transform: `translateX(${(1 - t) * -20}px)`, whiteSpace: "pre", lineHeight: 1.35,
          background: C.white, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.md, padding: "8px 20px" }}>{it}</div>;
      })}
    </div>
  );
};

/** ひとつながりの文を1枚の札に。question で問いの形（左に墨の帯）。sub は下に小さく（年・出典の数字など） */
export const Note: React.FC<{ x: number; y: number; text: string; sub?: string; start?: number; question?: boolean; role?: "label" | "sub" }> = (
  { x, y, text, sub, start = 0, question = false, role = "sub" },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: t, transform: `translateY(${(1 - t) * 16}px)`,
      background: C.white, border: `${LINE.thin}px solid ${C.ink}`, borderLeft: `${question ? LINE.heavy : LINE.thin}px solid ${C.ink}`,
      borderRadius: R.md, padding: "18px 28px" }}>
      <div style={{ ...font(role), whiteSpace: "pre", lineHeight: 1.45 }}>{text}</div>
      {sub && <div style={{ ...font("label", C.ink2), whiteSpace: "pre", marginTop: 8 }}>{sub}</div>}
    </div>
  );
};

/** 予想の選択肢（横1列）。answer（0始まり）を付けると、reveal 以降その札だけ墨で塗る */
export const Choices: React.FC<{ x: number; y: number; items: string[]; gap?: number; start?: number; every?: number; answer?: number; reveal?: number }> = (
  { x, y, items, gap = 24, start = 0, every = 12, answer, reveal },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = answer !== undefined && reveal !== undefined && frame >= reveal;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap, whiteSpace: "nowrap" }}>
      {items.map((it, k) => {
        const t = sp("enter", frame - start - k * every, fps);
        const on = shown && k === answer;
        return (
          <div key={k} style={{ opacity: shown && !on ? 0.45 * t + 0.1 : t, transform: `translateY(${(1 - t) * 20}px)`, display: "flex", alignItems: "center", gap: 14,
            background: on ? C.ink : C.white, border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.md, padding: "8px 22px 8px 10px" }}>
            <span style={{ ...font("label", on ? C.ink : C.white), background: on ? C.white : C.ink, borderRadius: R.sm, padding: "0 12px" }}>{"ABCD"[k]}</span>
            <span style={font("label", on ? C.white : C.ink)}>{it}</span>
          </div>
        );
      })}
    </div>
  );
};

/** 大きな数字＋単位（墨の下線つき）。start から数えながら出る */
export const BigCount: React.FC<{ x: number; y: number; value: number; unit: string; label?: string; start?: number; from?: number }> = (
  { x, y, value, unit, label, start = 0, from = 0 },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - start, [0, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const pop = sp("pop", frame - start - 36, fps);
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap" }}>
      {label && <div style={font("label", C.ink2)}>{label}</div>}
      <div style={{ ...font("hero"), lineHeight: 1, display: "inline-block", borderBottom: `10px solid rgba(29,35,51,${pop})`, paddingBottom: 6 }}>
        {Math.round(from + (value - from) * p)}<span style={{ fontSize: 96 }}>{unit}</span>
      </div>
    </div>
  );
};
