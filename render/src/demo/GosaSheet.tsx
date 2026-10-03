// ゴサの表情一覧（確認用の静止画）。上：動かせる版（明るい地）／中：反転版（暗い地）／下：白い縁取りの SVG（暗い地）。
// 暗い地では「反転版」と「縁取り版」のどちらを使うかを、この絵で見比べて決める。
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Expression, Gosa } from "@lib/Gosa";
import { C, FONT } from "@lib/theme";

const EXPRS: Expression[] = ["normal", "surprised", "assertive", "thinking", "skeptical", "depends", "happy", "down", "panic", "idea", "point"];
const X = (i: number) => 110 + i * 170;

export const GosaSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: "absolute", top: 360, left: 0, right: 0, height: 720, background: C.ink }} />
    {EXPRS.map((e, i) => (
      <React.Fragment key={e}>
        <Gosa cues={[[-60, e]]} size={70} x={X(i)} foot={250} sfx={false} />
        <div style={{ position: "absolute", left: X(i) - 80, width: 160, top: 280, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 700, color: C.ink }}>{e}</div>
        <Gosa cues={[[-60, e]]} size={70} x={X(i)} foot={620} dark sfx={false} />
        <Img src={staticFile(`gosa/${e}_dark.svg`)} style={{ position: "absolute", left: X(i) - 83, top: 790, width: 166 }} />
      </React.Fragment>
    ))}
    <div style={{ position: "absolute", left: 40, top: 380, fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.bg }}>A 反転版（白い体に墨の目）</div>
    <div style={{ position: "absolute", left: 40, top: 740, fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.bg }}>B 白い縁取り（今の _dark.svg）</div>
  </AbsoluteFill>
);
