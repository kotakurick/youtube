// 1本目のサムネイル案 S1「歩いて10分／出会えない」（2026-10-06。根拠は review/title-thumb.md）。
// 冒頭の物語の2匹：左はハートが届かない彼、右はハートが積もる彼女。間に部屋の壁。ゴサは出さない（男女の話の回）。
// 2匹は同じ大きさ・同じ明るさにして、片方だけをみじめに見せない（性別全体の話に読まれないように）。
// 地は2版：壁の色（paper）と夜（night）。npx remotion still 001-where-couples-meet-v3-thumb-cats out/thumb-cats.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cat } from "@lib/Cat";
import { Heart } from "@lib/TownsSim";
import { scatter } from "@lib/layout";
import { C, FONT, LINE, R } from "@lib/theme";

const W = 1280, H = 720, FLOOR = 640, WALL_X = 640;

const Cats: React.FC<{ night: boolean }> = ({ night }) => {
  const hearts = scatter(14, { x: 700, y: 190, w: 560, h: 190 }, 7, 1.2);
  const chip = (text: string, x: number): React.ReactNode => (
    <div style={{ position: "absolute", left: x, top: 34, width: 580, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.1, whiteSpace: "nowrap",
        color: night ? C.ink : C.bg, background: night ? C.bg : C.ink, borderRadius: R.md, padding: "6px 22px" }}>{text}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: night ? C.night : C.wall }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill={night ? C.ink : C.floor} />
        <line x1={0} x2={W} y1={FLOOR} y2={FLOOR} stroke={C.ink} strokeWidth={LINE.thin} />
        {/* 2つの部屋の間の壁 */}
        <rect x={WALL_X - 14} y={170} width={28} height={H - 170} fill={night ? C.bg : C.ink} />
        <Cat kind="male" x={310} y={FLOOR} size={6.4} pose="phone" face="sad" label="彼" />
        <Cat kind="female" x={930} y={FLOOR} size={6.4} pose="phone" face="think" seed={5} label="彼女" />
        {hearts.map((p, i) => <Heart key={i} x={p.x} y={p.y} r={34} fill={C.male} stroke={night ? C.bg : C.ink} />)}
      </svg>
      {chip("歩いて10分", 30)}
      {chip("出会えない", 670)}
    </AbsoluteFill>
  );
};

export default [
  { id: "001-where-couples-meet-v3-thumb-cats", component: () => <Cats night={false} /> },
  { id: "001-where-couples-meet-v3-thumb-cats-night", component: () => <Cats night /> },
];
