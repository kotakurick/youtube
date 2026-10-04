// チャンネルのバナー（YouTube の推奨 2560×1440）。npm run still -- channel-banner out/banner.png
// どの端末でも見える「安全な区画」は中央の 1546×423。名前・キャッチコピー・ゴサはこの中に収める。
// 区画の外（パソコンでは左右、テレビでは全面）には、薄い色の群衆を置く（切れても困らない飾り）。
// 絵はアイコン（assets/characters/gosa/make_gosa.py の icon）と同じ考え：ゴサが棒グラフを見ている。
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Figure, Kind } from "../lib/Figure";
import { Gosa } from "../lib/Gosa";
import { C, FONT, R } from "../lib/theme";

export const BANNER = { w: 2560, h: 1440 } as const;
const SAFE = { x: (2560 - 1546) / 2, y: (1440 - 423) / 2, w: 1546, h: 423 };

/** 安全な区画の外の群衆（左右の帯）。色は薄い色だけ（話の対象ではないため） */
const crowd = () => {
  const out: { x: number; y: number; kind: Kind }[] = [];
  const rows = 4, top = SAFE.y + 70, gapY = 104;
  for (const side of [-1, 1]) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 7; c++) {
        const i = out.length;
        const x0 = side < 0 ? SAFE.x - 70 - c * 66 : SAFE.x + SAFE.w + 70 + c * 66;
        out.push({ x: x0 + (random(`bx${i}`) - 0.5) * 18 + (r % 2) * 22 * side, y: top + r * gapY + (random(`by${i}`) - 0.5) * 10,
          kind: random(`bk${i}`) < 0.5 ? "male" : "female" });
      }
    }
  }
  return out;
};

export const Banner: React.FC = () => {
  const people = crowd();
  // 棒グラフ（アイコンと同じ：灰色2本と、伸びた最後の1本だけ黄）
  const base = SAFE.y + SAFE.h - 70, bw = 46, gap = 18, x0 = SAFE.x + 385;
  const hs = [70, 120, 185];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={BANNER.w} height={BANNER.h} style={{ position: "absolute" }}>
        {people.map((p, i) => <Figure key={i} kind={p.kind} x={p.x} y={p.y} size={1.45} dim />)}
        {hs.map((h, i) => {
          const x = x0 + i * (bw + gap);
          return <path key={i} d={`M${x} ${base} V${base - h + R.sm} q0 -${R.sm} ${R.sm} -${R.sm} H${x + bw - R.sm} q${R.sm} 0 ${R.sm} ${R.sm} V${base} Z`}
            fill={i === hs.length - 1 ? C.marker : C.rest} />;
        })}
        <line x1={x0 - 14} y1={base} x2={x0 + hs.length * (bw + gap) - gap + 14} y2={base} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      </svg>
      <Gosa cues={[[-60, "normal"]]} size={150} x={SAFE.x + 180} foot={base} sfx={false} />
      <div style={{ position: "absolute", left: SAFE.x + 640, top: SAFE.y, height: SAFE.h, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, lineHeight: 1.1, color: C.ink, whiteSpace: "nowrap" }}>吾輩は数える猫である</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.3, color: C.ink, whiteSpace: "nowrap" }}>
          世の中の<span style={{ background: `linear-gradient(transparent 55%, ${C.marker} 55%)` }}>“たぶん”</span>に、誤差つきの答えを。
        </div>
      </div>
    </AbsoluteFill>
  );
};
