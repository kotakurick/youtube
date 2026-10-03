// 予想タイム（クイズ）。問い → 選択肢（4つまで）→ 3秒の輪のカウント（考える間）→ 答えの選択肢が光る。
// 冒頭の予想は答えを判定のコーナーで明かすので、reveal を付けない。章の中のクイズは reveal を付ける。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { Sfx } from "./Sfx";
import { C, font, LINE, R, sp, useZ } from "./theme";

export const QUIZ_TIMING = { choices: 12, ring: 45, ringLen: 90, reveal: 45 + 90 + 6 } as const;
const KEYS = ["A", "B", "C", "D"];

export const Quiz: React.FC<{ question: string; choices: string[]; answer?: number; reveal?: boolean; start?: number; title?: string }> = (
  { question, choices, answer, reveal = false, start = 0, title = "予想タイム" },
) => {
  if (choices.length < 2 || choices.length > 4) throw new Error("Quiz: 選択肢は2〜4つにしてください。");
  if (reveal && answer === undefined) throw new Error("Quiz: reveal するときは answer（答えの番号）が要ります。");
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  const Z = useZ();
  const { ring, ringLen } = QUIZ_TIMING;
  const revealAt = QUIZ_TIMING.reveal;
  const head = sp("enter", frame, fps);
  const left = interpolate(frame - ring, [0, ringLen], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = reveal && frame >= revealAt;
  const box = Z.stageWithGosa;
  const cols = Z.vertical ? 1 : 2;
  const cw = (box.w - (cols - 1) * 32) / cols;
  return (
    <>
      <div style={{ position: "absolute", left: Z.header.x, top: Z.header.y, width: Z.header.w, opacity: head }}>
        <div style={{ display: "inline-block", background: C.ink, borderRadius: R.md, padding: "4px 20px", ...font("label", C.white), fontWeight: 900 }}>{title}</div>
        <div style={{ ...font("question"), marginTop: 16, lineHeight: 1.25 }}>{question}</div>
      </div>
      <div style={{ position: "absolute", left: box.x, top: box.y + (Z.vertical ? 140 : 110), width: box.w, display: "flex", flexWrap: "wrap", gap: 32 }}>
        {choices.map((c, i) => {
          const t = sp("enter", frame - QUIZ_TIMING.choices - i * 6, fps);
          const right = shown && i === answer;
          const dim = shown && i !== answer;
          return (
            <div key={i} style={{ width: cw, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, padding: "22px 28px",
              background: right ? C.white : C.paper2, border: `${LINE.thin}px solid ${right ? C.ink : "transparent"}`, borderRadius: R.lg,
              opacity: t * (dim ? 0.45 : 1), transform: `translateY(${(1 - t) * 20}px) scale(${right ? 1.04 : 1})` }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: right ? C.ink : C.white, flex: "none",
                display: "flex", alignItems: "center", justifyContent: "center", ...font("label", right ? C.white : C.ink), fontWeight: 900 }}>{KEYS[i]}</div>
              <div style={{ ...font("value"), position: "relative" }}>
                {right && <div style={{ position: "absolute", left: 0, right: 0, bottom: 6, height: 18, background: C.marker, borderRadius: 4 }} />}
                <span style={{ position: "relative" }}>{c}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* 3秒の輪（考える間） */}
      {frame >= ring && left > 0 && (
        <svg width={120} height={120} style={{ position: "absolute", left: box.x + box.w - 120, top: Z.vertical ? box.y + 10 : Z.header.y + 8 }}>
          <circle cx={60} cy={60} r={48} fill="none" stroke={C.paper2} strokeWidth={LINE.base + 4} />
          <circle cx={60} cy={60} r={48} fill="none" stroke={C.ink} strokeWidth={LINE.base + 4} strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - left)} transform="rotate(-90 60 60)" />
          <text x={60} y={74} textAnchor="middle" style={font("label")}>{Math.ceil(left * 3)}</text>
        </svg>
      )}
      {[0, 1, 2].map((k) => <Sfx key={k} name="tick" at={start + ring + k * 30} volume={0.4} />)}
      <Gosa cues={reveal ? [[start + 4, "thinking"], [start + revealAt, "idea"]] : [[start + 4, "thinking"]]} size={Z.vertical ? "S" : "M"} sfx={false} />
    </>
  );
};
