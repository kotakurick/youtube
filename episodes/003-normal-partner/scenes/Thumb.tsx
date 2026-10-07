// 3本目のサムネイル案（2026-10-07。docs/process.md の16。案3つ → 推し1つ。根拠は meta.md）。
// 作りは1本目・6本目と同じ：白い人・はっきりした2色の地・明朝体の文字。ゴサは出さない（男女の話の回）。
// 6本目（青と橙の斜めの割り）と並べて別の回に見えるよう、地は夜の紺＋金にする。金は本編の「年収のつまみの目盛り」（お金＝金）。
// 2人は同じ大きさ・同じ白にして、片方だけを悪く見せない（どちらもスマホを見て困っている）。
// 人は仮にコードのシルエット。オーナーが画像生成AIで作った人形（meta.md の指示文）を _local/episodes/003-normal-partner/thumb/ に置いたら差し替える。
// npx remotion still 003-normal-partner-thumb-scale out/thumb003/scale.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Joints, MAN_SLUMP, Silhouette, WOMAN_PHONE } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const NAVY = ["#0E1430", "#26315E"];
// サムネイル用の明るい金（紺の地から浮かせる。本編の C.gold は変えない。6本目と同じ）
const GOLD = "#FFC83D";

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="nGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={NAVY[0]} /><stop offset="100%" stopColor={NAVY[1]} /></linearGradient>
    <linearGradient id="nShade" gradientUnits="userSpaceOnUse" x1="-160" y1="-1000" x2="200" y2="-300"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#F1F3F7" /><stop offset="100%" stopColor="#C9CFDB" /></linearGradient>
    <filter id="nDrop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.5" /></filter>
  </defs>
);
const Person: React.FC<{ j: Joints; x: number; top: number; size: number; flip?: boolean; color?: string; children?: React.ReactNode }> = ({ j, x, top, size, flip, color = "url(#nShade)", children }) => (
  // top＝頭のてっぺんの y。足元は画面の外
  <g filter="url(#nDrop)"><Silhouette j={j} x={x} y={top + 965 * size} size={size} color={color} gap="rgba(10,20,60,.85)" flip={flip}>{children}</Silhouette></g>
);
/** 両手でスマホを胸の前に持ち、首を少しかたむけて画面を見る（男女とも同じ姿勢。レビュー r1） */
const PHONE_CHEST = (hair: "short" | "long"): Joints => ({
  head: [8, hair === "long" ? -905 : -900], headR: hair === "long" ? [52, 64] : [56, 60], headTilt: 15, neck: [2, -832],
  shoulderL: [-92, -780], shoulderR: [92, -780], hipL: [-68, -478], hipR: [68, -478], waist: hair === "long" ? 0.2 : 0.05,
  elbowL: [-110, -640], handL: [-22, -705], elbowR: [110, -640], handR: [22, -705],
  kneeL: [-44, -240], footL: [-54, 0], kneeR: [46, -240], footR: [58, 0],
  hair, skirt: hair === "long",
});
/** スマホ：画面だけ金に光る（人の座標で、手の位置） */
const Phone: React.FC = () => (
  <g>
    <rect x={-34} y={-780} width={68} height={112} rx={10} fill={C.ink} />
    <rect x={-27} y={-771} width={54} height={94} rx={6} fill={GOLD} />
  </g>
);


const line = (size: number, color: string = C.white): React.CSSProperties => ({
  position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.1,
  whiteSpace: "nowrap", color, WebkitTextStroke: `${Math.round(size / 14)}px ${C.ink}`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))",
});
const Band: React.FC<{ text: string; top?: number }> = ({ text, top = 18 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    <span style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 84, color: C.ink, background: C.white, padding: "0 28px", borderRadius: 8 }}>{text}</span>
  </div>
);

/** 案1「普通の人でいい／のに、いない」：冒頭の物語（普通でいいと思って条件を入れたら、59人）。数字なし。2人ともスマホを見て困る */
// 地は上下の2色（上：紺、下：濃いワイン。レビュー r1：6本目の青×橙と並べて別の回に見えるように。性別の色にはしない）
const SPLIT = 360, WINE = "#5A1A3E";
const Nobody: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY[0] }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <Defs />
      <rect width={W} height={SPLIT} fill="#141C4A" />
      <rect y={SPLIT} width={W} height={H - SPLIT} fill={WINE} />
      {/* まん中に「いない人」の点線の輪郭 */}
      <g fill="#7A2A52" fillOpacity={0.35} stroke="#FFFFFF" strokeWidth={9} strokeDasharray="18 12">
        <ellipse cx={640} cy={440} rx={56} ry={60} />
        <path d="M548 720 L556 552 Q560 516 596 508 L684 508 Q720 516 724 552 L732 720" />
      </g>
      <Person j={PHONE_CHEST("short")} x={260} top={400} size={1.0}><Phone /></Person>
      <Person j={PHONE_CHEST("long")} x={1020} top={400} size={1.0} flip><Phone /></Person>
    </svg>
    <Band text="普通の人でいい" />
    <div style={{ ...line(170, GOLD), top: 150 }}>のに、いない</div>
  </AbsoluteFill>
);

/** 案2「その普通、／まん中じゃない」：本編の比喩（年収のつまみの目盛り）と第2章の発見。
 *  つまみの下に人を並べ、つまみより右（条件を通る人）だけ白く残す（13人に2人＝約15%。本編の未婚の男性で500万円以上 約150人／1000人に合わせる）。数字なし（「まん中」の札だけ）。2人を性別で分けない */
const Scale: React.FC = () => {
  const x0 = 120, x1 = 1160, y = 470, knob = x0 + (x1 - x0) * 0.82, mid = (x0 + x1) / 2;
  const crowd = Array.from({ length: 13 }, (_, i) => x0 + 20 + i * 78);
  return (
    <AbsoluteFill style={{ background: NAVY[0] }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Defs />
        <rect width={W} height={H} fill="url(#nGround)" />
        {/* 目盛り */}
        <rect x={x0} y={y - 10} width={x1 - x0} height={20} rx={10} fill="#FFFFFF" opacity={0.9} />
        <rect x={knob} y={y - 10} width={x1 - knob} height={20} rx={10} fill={GOLD} />
        {Array.from({ length: 11 }, (_, i) => x0 + ((x1 - x0) * i) / 10).map((x) => <rect key={x} x={x - 3} y={y - 34} width={6} height={24} fill="#FFFFFF" opacity={0.8} />)}
        <rect x={mid - 5} y={y - 60} width={10} height={50} fill="#FFFFFF" />
        <text x={mid} y={y - 72} textAnchor="middle" style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 44, fill: "#FFFFFF" }}>まん中</text>
        <g filter="url(#nDrop)"><circle cx={knob} cy={y} r={58} fill={GOLD} stroke={C.ink} strokeWidth={8} /></g>
        <text x={knob} y={y + 18} textAnchor="middle" style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 48, fill: C.ink }}>普通</text>
        {/* 人：つまみより右だけ白（条件を通る人） */}
        {crowd.map((x, i) => <Person key={x} j={i % 2 ? WOMAN_PHONE : MAN_SLUMP} x={x} top={565} size={0.3} color={x > knob ? "url(#nShade)" : "#3B4775"} />)}
      </svg>
      <Band text="その普通、" />
      <div style={{ ...line(150), top: 130 }}>まん中じゃない</div>
    </AbsoluteFill>
  );
};

/** 案3「普通どうしの組は／1000組に38組」：予想タイムの答え（S15 の成立率3.8%）。タイトルを型Aにするときに組む（数字をくり返さない） */
const Pairs: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY[0] }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <Defs />
      <rect width={W} height={H} fill="url(#nGround)" />
      <Person j={MAN_SLUMP} x={250} top={360} size={0.9} />
      <Person j={WOMAN_PHONE} x={1030} top={330} size={0.9} />
    </svg>
    <Band text="普通どうしの組は" />
    <div style={{ ...line(160, GOLD), top: 140 }}>1000組に38組</div>
  </AbsoluteFill>
);

export default [
  { id: "003-normal-partner-thumb-nobody", component: Nobody },
  { id: "003-normal-partner-thumb-scale", component: Scale },
  { id: "003-normal-partner-thumb-pairs", component: Pairs },
];
