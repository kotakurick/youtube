// 締めの判定コーナー。〇＝言い切れる、△＝条件次第、×＝違う。ゴサの表情も判定に合わせる。
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";
import { Gosa } from "./Gosa";

export type Mark = "〇" | "△" | "×";

const MarkShape: React.FC<{ mark: Mark; t: number }> = ({ mark, t }) => {
  const len = 600 * t;
  const common = { fill: "none", stroke: C.ink, strokeWidth: 22, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    strokeDasharray: 600, strokeDashoffset: 600 - len };
  if (mark === "〇") return <circle cx={0} cy={0} r={95} {...common} />;
  if (mark === "△") return <path d="M0 -100 L100 80 H-100 Z" {...common} />;
  return <path d="M-85 -85 L85 85 M85 -85 L-85 85" {...common} />;
};

export const Verdict: React.FC<{ claim: string; mark: Mark; reason: string[]; start?: number }> = ({ claim, mark, reason, start = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame: frame - start, fps, config: { damping: 15 } });
  const stamp = spring({ frame: frame - start - 15, fps, config: { damping: 20 } });
  const gosaExpr = mark === "〇" ? "assertive" : mark === "△" ? "depends" : "skeptical";
  return (
    <>
      <div style={{ position: "absolute", left: 160, top: 170, width: 1600, height: 640, background: C.white,
        border: `5px solid ${C.ink}`, borderRadius: 28, overflow: "hidden", opacity: card,
        transform: `scale(${0.92 + 0.08 * card})` }}>
        <div style={{ background: C.ink, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 46, padding: "22px 40px" }}>
          答え合わせ　「{claim}」
        </div>
        <svg width={1600} height={540} style={{ position: "absolute", top: 100 }}>
          <g transform="translate(270,270)"><MarkShape mark={mark} t={stamp} /></g>
        </svg>
        <div style={{ position: "absolute", left: 520, top: 210, right: 60, fontFamily: FONT, color: C.ink }}>
          <div style={{ fontWeight: 900, fontSize: 84, opacity: stamp }}>
            {mark} {mark === "〇" ? "言い切れる" : mark === "△" ? "条件次第" : "ちがう"}
          </div>
          {reason.map((r, i) => (
            <div key={i} style={{ fontSize: 40, marginTop: 18, opacity: stamp }}>{r}</div>
          ))}
        </div>
      </div>
      <Gosa cues={[[start + 10, "thinking"], [start + 30, gosaExpr]]} x={1800} y={900} width={200} />
    </>
  );
};
