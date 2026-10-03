// 答え合わせ（判定のコーナー）。カードは「証拠｜印｜ゴサL」の3列。
// 〇＝その通り、×＝ちがう（どちらも確か＝ひげが短い）、△＝条件次第（ひげが長い）。印は墨だけで描き、1つだけ出す。
// 流れ：カード → 証拠のチップ3つ → 1.5秒の刻み → 0.3秒の無音 → スタンプ（大きく出て少し戻る）＋ゴサの表情と吹き出し。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { Sfx } from "./Sfx";
import { C, font, LINE, R, sp, Z } from "./theme";

export type Mark = "〇" | "△" | "×";
export const MARK_WORD: Record<Mark, string> = { "〇": "その通り", "△": "条件次第", "×": "ちがう" };

/** 判定の時刻（start からのフレーム） */
export const VERDICT_TIMING = { chips: [12, 27, 42], roll: 60, hit: 60 + 45 + 9 } as const;

const MarkShape: React.FC<{ mark: Mark; t: number }> = ({ mark, t }) => {
  const st = { fill: "none", stroke: C.ink, strokeWidth: LINE.heavy + 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const s = 1.35 - 0.35 * Math.min(1, t); // 大きく出てから少し戻る
  return (
    <g transform={`scale(${s * Math.min(1, t * 1.2)})`} opacity={Math.min(1, t * 2)}>
      {mark === "〇" && <circle r={120} {...st} />}
      {mark === "△" && <path d="M0 -125 L128 100 H-128 Z" {...st} />}
      {mark === "×" && <path d="M-105 -105 L105 105 M105 -105 L-105 105" {...st} />}
    </g>
  );
};

export const Verdict: React.FC<{ claim: string; mark: Mark; reason: string[]; start?: number }> = ({ claim, mark, reason, start = 0 }) => {
  if (reason.length > 3) throw new Error("Verdict: 証拠は3つまでにしてください。");
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  const { chips, roll, hit } = VERDICT_TIMING;
  const card = sp("enter", frame, fps);
  const stamp = sp("pop", frame - hit, fps);
  const sure = mark !== "△";
  const box = { x: Z.stage.x, y: Z.stage.y, w: Z.stage.w, h: Z.stage.h };
  return (
    <>
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, background: C.white,
        border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.lg, overflow: "hidden", boxSizing: "border-box",
        opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <div style={{ background: C.ink, padding: "22px 40px", ...font("label", C.white), fontWeight: 900, fontSize: 48 }}>
          答え合わせ「{claim}」
        </div>
        {/* 証拠のチップ */}
        <div style={{ position: "absolute", left: 40, top: 140, width: 620, display: "flex", flexDirection: "column", gap: 22 }}>
          {reason.map((r, i) => {
            const t = sp("enter", frame - (chips[i] ?? chips[2]), fps);
            return (
              <div key={i} style={{ ...font("body"), lineHeight: 1.35, background: C.paper2, borderRadius: R.md, padding: "16px 24px",
                opacity: t, transform: `translateX(${(1 - t) * -24}px)` }}>{r}</div>
            );
          })}
        </div>
      </div>
      {/* 印と言葉（中央の列） */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(950,520)"><MarkShape mark={mark} t={stamp} /></g>
      </svg>
      <div style={{ position: "absolute", left: 750, width: 400, top: 700, textAlign: "center", ...font("value"),
        opacity: interpolate(frame - hit, [6, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {MARK_WORD[mark]}
      </div>
      {/* ゴサ（右の列、L）。ひげの長さが判定の確かさ */}
      <Gosa size="L" x={1450} foot={Z.stage.y + Z.stage.h - 40} bubble={[0.32, -1.62]}
        cues={[[8, "thinking"], [hit, sure ? "assertive" : "depends"]].map(([f, e]) => [(f as number) + start, e]) as [number, "thinking" | "assertive" | "depends"][]}
        says={[[start + 14, "答え合わせ。"], [start + hit + 6, sure ? "ひげ、短め。" : "ひげ、のびます。"]]} sfx={false} />
      {/* 音：刻み → 0.3秒の無音 → 打撃 → 印ごとの余韻 */}
      <Sfx name="roll" at={start + roll} volume={0.5} />
      <Sfx name="hit" at={start + hit} volume={0.8} />
      <Sfx name={mark === "〇" ? "verdict-o" : mark === "△" ? "verdict-tri" : "verdict-x"} at={start + hit + 2} volume={0.6} />
    </>
  );
};
