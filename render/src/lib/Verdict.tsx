// 答え合わせ（判定のコーナー）。カードは「証拠｜ゴサL」の2列。
// 〇△×の札（印・印の言葉・印ごとの音）は出さない（2026-10-07 オーナー「判定は△です はチープ」「画面にも出さなくてよい。全体に反映」）。
// mark は、ゴサのひげ（確かさ）にだけ使う：〇×＝確か＝ひげが短い、△＝条件次第＝ひげが長い。当たり外れは台本の文で言う。
// 流れ：カード → 証拠のチップ3つ → 打撃 → ゴサの表情と吹き出し。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { Sfx } from "./Sfx";
import { C, font, LINE, R, sp, useZ } from "./theme";

export type Mark = "〇" | "△" | "×";

/** 判定の時刻（start からのフレーム）。roll（刻みの音）は使わなくなったが、値は残す */
export const VERDICT_TIMING = { chips: [12, 27, 42], roll: 60, hit: 60 + 45 + 9 } as const;

// 証拠の文は \n で手で改行できる（語の途中で折れないように。2026-10-06 追加。\n のない文は今までと同じ）
// 読み上げに合わせるとき（4本目で足した。2026-10-06）：chipAt＝証拠ごとに出るフレーム、hitAt＝印を打つフレーム（start からの数え）。省くと今までどおり
export const Verdict: React.FC<{ claim: string; mark: Mark; reason: string[]; start?: number; chipAt?: number[]; hitAt?: number }> = (
  { claim, mark, reason, start = 0, chipAt, hitAt }) => {
  if (reason.length > 3) throw new Error("Verdict: 証拠は3つまでにしてください。");
  const frame = useCurrentFrame() - start;
  const { fps, width: VW, height: VH } = useVideoConfig();
  const Z = useZ();
  const chips = chipAt ?? VERDICT_TIMING.chips;
  const hit = hitAt ?? VERDICT_TIMING.hit;
  // 横長：証拠｜ゴサ の2列。縦長（ショート）：証拠を上、ゴサを下に並べる
  const L = Z.vertical
    ? { chips: { left: 32, top: 150, width: Z.stage.w - 64 }, gosa: { x: 720, foot: Z.stage.y + Z.stage.h - 30, size: "M" as const }, head: 40 }
    : { chips: { left: 40, top: 140, width: 1000 }, gosa: { x: 1450, foot: Z.stage.y + Z.stage.h - 40, size: "L" as const }, head: 48 };
  const card = sp("enter", frame, fps);
  const sure = mark !== "△";
  const box = { x: Z.stage.x, y: Z.stage.y, w: Z.stage.w, h: Z.stage.h };
  return (
    <>
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, background: C.white,
        border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.lg, overflow: "hidden", boxSizing: "border-box",
        opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <div style={{ background: C.ink, padding: "22px 40px", ...font("label", C.white), fontWeight: 900, fontSize: L.head, lineHeight: 1.3 }}>
          答え合わせ「{claim}」
        </div>
        {/* 証拠のチップ */}
        <div style={{ position: "absolute", ...L.chips, display: "flex", flexDirection: "column", gap: 22 }}>
          {reason.map((r, i) => {
            const t = sp("enter", frame - (chips[i] ?? chips[2]), fps);
            return (
              <div key={i} style={{ ...font("body"), lineHeight: 1.35, whiteSpace: "pre-line", background: C.paper2, borderRadius: R.md, padding: "16px 24px",
                opacity: t, transform: `translateX(${(1 - t) * -24}px)` }}>{r}</div>
            );
          })}
        </div>
      </div>
      {/* ゴサ（右の列、L）。ひげの長さが判定の確かさ */}
      <Gosa size={L.gosa.size} x={L.gosa.x} foot={L.gosa.foot} bubble={[0.32, -1.62]}
        cues={[[8, "thinking"], [hit, sure ? "assertive" : "depends"]].map(([f, e]) => [(f as number) + start, e]) as [number, "thinking" | "assertive" | "depends"][]}
        says={[[start + 14, "答え合わせ。"], [start + hit + 6, sure ? "ひげ、短め。" : "ひげ、のびます。"]]} sfx={false} />
      {/* 音：ゴサが答えるときの打撃だけ（刻みと印ごとの余韻は札と一緒にやめた） */}
      <Sfx name="hit" at={start + hit} volume={0.6} />
    </>
  );
};
