// サムネイルをゼロから考え直した3案の見本（2026-10-10。docs/concepts/2026-10-10-thumbnail-zero-base.md の5）。
// 3案とも同じ型：文字は左（太いゴシック・2かたまり）、主役は右、地は1色、左のふちにチャンネルの帯、右下は空ける。
// 主役だけを変える：A 猫／B 白い人形／C 数える（100人の中で条件を通る数人だけ光る）。
// 猫と人形の絵は Canva の画像生成（地と同じ紺で作り、切り抜かずに置く）。render/public/episodes/003-normal-partner/thumb/ に置く（Git の外）。
// npx remotion still 003-normal-partner-thumb-zero-cat out/thumb003/zero-cat.png
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Figure } from "@lib/Figure";
import { C, FONT } from "@lib/theme";

const W = 1280, H = 720;
const GROUND = "#1B2140"; // 画像生成の背景と同じ紺
const YELLOW = "#FFD23F";
const DIM = "#4A5378";

/** 白か黄の太い字に黒い縁 */
const Word: React.FC<{ text: string; size: number; color: string; top: number }> = ({ text, size, color, top }) => (
  <div data-qa="text" style={{
    position: "absolute", left: 52, top, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1,
    color, letterSpacing: "-0.02em", whiteSpace: "nowrap",
    WebkitTextStroke: `${Math.round(size * 0.1)}px #0B0E1C`, paintOrder: "stroke fill",
    textShadow: "0 8px 0 rgba(0,0,0,.45)",
  }}>{text}</div>
);

/** 型：地・帯・文字。主役は children（右側） */
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: GROUND }}>
    {children}
    {/* チャンネルの印：左のふちの紫の帯（毎回同じ位置・同じ色） */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 18, height: H, background: C.plain }} />
    <Word text="普通でいい" size={100} color="#FFFFFF" top={70} />
    <Word text="のに、" size={150} color={YELLOW} top={200} />
    <Word text="いない" size={168} color={YELLOW} top={360} />
  </AbsoluteFill>
);

/** 数える印：10人の列で1人だけ光る（A・B 共通。毎回同じ位置） */
const CountMark: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 10 }, (_, i) => (
      <Figure key={i} kind="other" x={78 + i * 44} y={668} size={0.95} color={i === 6 ? YELLOW : DIM} />
    ))}
  </svg>
);

const Pic: React.FC<{ src: string; dx: number }> = ({ src, dx }) => (
  <Img src={staticFile(`episodes/003-normal-partner/thumb/${src}`)} style={{ position: "absolute", left: dx, top: 0, width: W, height: H }} />
);

const Cats: React.FC = () => <Frame><Pic src="cats.png" dx={60} /><CountMark /></Frame>;
const Dolls: React.FC = () => <Frame><Pic src="dolls.png" dx={30} /><CountMark /></Frame>;

/** 100人：条件を全部通るのは約4人（本編 S15 の 1000組に38組 ≒ 3.8%） */
const LIT = new Set([13, 37, 62, 88]);
const Count: React.FC = () => (
  <Frame>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="glow"><stop offset="0%" stopColor={YELLOW} stopOpacity={0.55} /><stop offset="100%" stopColor={YELLOW} stopOpacity={0} /></radialGradient>
      </defs>
      {Array.from({ length: 100 }, (_, i) => {
        const x = 610 + (i % 10) * 64, y = 96 + Math.floor(i / 10) * 56;
        return LIT.has(i) ? <circle key={`g${i}`} cx={x} cy={y - 16} r={40} fill="url(#glow)" /> : null;
      })}
      {Array.from({ length: 100 }, (_, i) => (
        <Figure key={i} kind="other" x={610 + (i % 10) * 64} y={96 + Math.floor(i / 10) * 56} size={LIT.has(i) ? 0.85 : 0.72} color={LIT.has(i) ? YELLOW : DIM} />
      ))}
    </svg>
  </Frame>
);

export default [
  { id: "003-normal-partner-thumb-zero-cat", component: Cats },
  { id: "003-normal-partner-thumb-zero-doll", component: Dolls },
  { id: "003-normal-partner-thumb-zero-count", component: Count },
];
