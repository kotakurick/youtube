// サムネイルの型の部品（2026-10-10。様式は docs/brand.md のサムネイル、決定は docs/decisions.md の 2026-10-10）。
// 様式：顔のない白い人形（Canva の画像生成を緑の背景で作り、scripts/chroma_key.py で抜いた PNG）を右に、
// 太いゴシックの特大の言葉2かたまり（白と黄に黒い縁）を左に。地・光・ぼけ・影はコードで描く。
// 左のふちにチャンネルの印の帯。右下（再生時間の表示）には何も置かない。
// 回ごとに変えるのは：言葉、地の色（情景）、人形の画像と置き方、光の位置。座標の決まりはここが持つ。
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Figure } from "./Figure";
import { C, FONT } from "./theme";

export const TW = 1280, TH = 720;
export const TYELLOW = "#FFD23F";
const STROKE = "#0B0E1C";

/** 地：上下のグラデーション＋周りを暗く（目を中央の人形と文字に集める） */
export const ThumbStage: React.FC<{ ground: [string, string]; children: React.ReactNode }> = ({ ground, children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${ground[0]} 0%, ${ground[1]} 100%)`, overflow: "hidden" }}>
    {children}
  </AbsoluteFill>
);

/** 周りを暗くする（いちばん上に重ねる） */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 85% at 62% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/** 夜の街のぼけ（決まった並び。seed で並びを変える）。人形の後ろに置く */
export const Bokeh: React.FC<{ seed?: number; colors?: string[]; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; blur?: number }> = ({
  seed = 1, colors = ["#FFB347", "#FF7AA2", "#7FB2FF", "#FFE08A"], n = 30, x0 = 600, x1 = 1280, y0 = 0, y1 = 520, blur = 14,
}) => {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return (
    <svg width={TW} height={TH} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
      {Array.from({ length: n }, (_, i) => {
        const r = 14 + rnd() * 46;
        return <circle key={i} cx={x0 + rnd() * (x1 - x0)} cy={y0 + rnd() * (y1 - y0)} r={r} fill={colors[i % colors.length]} opacity={0.18 + rnd() * 0.24} />;
      })}
    </svg>
  );
};

/** 抜いた人形。cx＝中心の x、top＝画像の上端、h＝高さ。rim＝ふちの光の色（逆光）、glow＝画面の光の位置（画像の中の割合） */
export const Cutout: React.FC<{
  src: string; cx: number; top: number; h: number; aspect: number; flip?: boolean;
  rim?: string; glow?: { x: number; y: number; r?: number }; z?: number;
}> = ({ src, cx, top, h, aspect, flip = false, rim = "rgba(130,170,255,.7)", glow, z = 1 }) => {
  const w = h * aspect;
  const left = cx - w / 2;
  return (
    <>
      <Img data-qa="figure" src={staticFile(src)} style={{
        position: "absolute", left, top, width: w, height: h, zIndex: z,
        transform: flip ? "scaleX(-1)" : undefined,
        filter: `drop-shadow(${flip ? 5 : -5}px -3px 6px ${rim}) drop-shadow(0 24px 36px rgba(0,0,0,.65))`,
      }} />
      {glow && (
        <div style={{
          position: "absolute", zIndex: z, pointerEvents: "none", mixBlendMode: "screen",
          left: left + (flip ? 1 - glow.x : glow.x) * w - (glow.r ?? 150), top: top + glow.y * h - (glow.r ?? 150),
          width: (glow.r ?? 150) * 2, height: (glow.r ?? 150) * 2, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,214,110,.55) 0%, rgba(255,190,80,.18) 40%, rgba(255,190,80,0) 70%)`,
        }} />
      )}
    </>
  );
};

/** 言葉の1かたまり（太いゴシック・黒い縁・落ち影） */
export const ThumbWord: React.FC<{ text: string; size: number; color?: string; top: number; left?: number }> = ({ text, size, color = "#FFFFFF", top, left = 52 }) => (
  <div data-qa="text" style={{
    position: "absolute", left, top, zIndex: 10, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1,
    color, letterSpacing: "-0.03em", whiteSpace: "nowrap",
    WebkitTextStroke: `${Math.round(size * 0.12)}px ${STROKE}`, paintOrder: "stroke fill",
    filter: "drop-shadow(0 10px 0 rgba(0,0,0,.5)) drop-shadow(0 0 24px rgba(0,0,0,.6))",
  }}>{text}</div>
);

/** チャンネルの印：左のふちの紫の帯（毎回同じ位置・同じ色） */
export const ChannelBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 30, height: TH, background: C.plain, zIndex: 11 }} />
);

/** 数える印：n人の列で lit 番目だけ大きく光る。左下に置く（右下は再生時間で隠れる）。
 * 2026-10-10 レビュー r3：168px で点にしか見えなかったので、1人を大きく・黒い縁・光、ほかは薄く。 */
export const CountRow: React.FC<{ n?: number; lit: number; x?: number; y?: number; size?: number; gap?: number }> = ({ n = 10, lit, x = 78, y = 676, size = 1.7, gap = 48 }) => {
  const big = size * 1.2; // 2026-10-10 r4：大きすぎて列からはみ出し「立つ人」に見えた
  const lx = x + lit * gap;
  return (
    <svg width={TW} height={TH} style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <defs><filter id="crEdge" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius={5} result="d" /><feFlood floodColor={STROKE} /><feComposite in2="d" operator="in" result="o" /><feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge></filter><radialGradient id="crGlow"><stop offset="0%" stopColor={TYELLOW} stopOpacity={0.75} /><stop offset="100%" stopColor={TYELLOW} stopOpacity={0} /></radialGradient></defs>
      {Array.from({ length: n }, (_, i) => i === lit ? null : (
        <Figure key={i} kind="other" x={x + i * gap} y={y} size={size} color="#8A93BA" opacity={0.3} />
      ))}
      <circle cx={lx} cy={y - 24 * big} r={70} fill="url(#crGlow)" />
      <g filter="url(#crEdge)"><Figure kind="other" x={lx} y={y} size={big} color={TYELLOW} /></g>
    </svg>
  );
};
