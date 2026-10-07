// 6本目のサムネイル案（2026-10-07。クラウドで決めきる：docs/process.md の16）。
// 1本目と同じ作り：白い人・はっきりした2色の地・明朝体の文字。ゴサは出さない（男女の話の回）。
// 地を斜めの線2本で3つに分け、左（彼の青）と右（彼女の橙）の間の灰色のくさびが「2人の線がずれる所」（本編の灰色の行動と同じ意味）。
// 2人は同じ大きさ・同じ白・同じ姿勢（腕を組んで外を向く）にして、片方だけを悪く見せない。
// 人は仮にコードのシルエット。オーナーが画像生成AIで作った人形（meta.md の指示文）を _local/episodes/006-cheating-line/thumb/ に置いたら AI 版に差し替える。
// npx remotion still 006-cheating-line-thumb-match out/thumb-match.png
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Joints, Silhouette } from "@lib/Silhouette";
import { C, FONT_SERIF } from "@lib/theme";

const W = 1280, H = 720;
const BLUE = ["#0A2A6B", "#2F6FDE"], RED = ["#5A1A08", C.female], GRAY = ["#3A3A3E", "#77767A"];
// 2本の境目（上の x・下の x）。間が灰色のくさび
const L1 = [560, 470], L2 = [700, 820];
// サムネイル用の明るい金（橙の地から浮かせる。レビュー r1。本編の C.gold は変えない）
const GOLD = "#FFC83D";

/** 腕を組んで、顔を少し外へ向ける（正面）。flip で左右を返す */
const ARMS_CROSSED = (hair: "short" | "long", skirt = false): Joints => ({
  head: [10, hair === "long" ? -900 : -905], headR: hair === "long" ? [52, 64] : [56, 60], headTilt: 8, neck: [2, -835],
  shoulderL: [-96, -780], shoulderR: [96, -780], hipL: [-66, -478], hipR: [66, -478], waist: hair === "long" ? 0.2 : 0.05,
  elbowL: [-112, -620], handL: [70, -650], elbowR: [112, -612], handR: [-66, -668],
  kneeL: [-44, -240], footL: [-54, 0], kneeR: [46, -240], footR: [58, 0],
  hair, skirt,
});

type Pose = { size: number; y: number; tilt: number };
const Ground: React.FC<{ big?: boolean; light?: boolean; pose?: Pose }> = ({ big = false, light = false, pose }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="tB" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={BLUE[1]} /><stop offset="100%" stopColor={BLUE[0]} /></linearGradient>
      <linearGradient id="tR" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={RED[1]} /><stop offset="100%" stopColor={RED[0]} /></linearGradient>
      <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light ? "#E8E8EC" : GRAY[0]} /><stop offset="100%" stopColor={light ? "#B8B8C0" : GRAY[1]} /></linearGradient>
      <linearGradient id="tShade" gradientUnits="userSpaceOnUse" x1="-160" y1="-1000" x2="200" y2="-300"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#F1F3F7" /><stop offset="100%" stopColor="#C9CFDB" /></linearGradient>
      <filter id="tDrop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.45" /></filter>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#tR)" />
    <polygon points={`${L1[0]},0 ${L2[0]},0 ${L2[1]},${H} ${L1[1]},${H}`} fill="url(#tG)" />
    <polygon points={`0,0 ${L1[0]},0 ${L1[1]},${H} 0,${H}`} fill="url(#tB)" />
    <line x1={L1[0]} y1={0} x2={L1[1]} y2={H} stroke="#FFFFFF" strokeWidth={6} />
    <line x1={L2[0]} y1={0} x2={L2[1]} y2={H} stroke="#FFFFFF" strokeWidth={6} />
    {/* 2人：同じ大きさ・同じ白。腰から下は画面の外 */}
    <g filter="url(#tDrop)" transform={pose ? `rotate(${-pose.tilt} 230 ${H})` : undefined}><Silhouette j={ARMS_CROSSED("short")} x={big ? 230 : 250} y={pose ? pose.y : big ? 1395 : H + 434} size={pose ? pose.size : big ? 1.1 : 0.75} color="url(#tShade)" gap="rgba(10,20,60,.85)" /></g>
    <g filter="url(#tDrop)" transform={pose ? `rotate(${pose.tilt} 1050 ${H})` : undefined}><Silhouette j={ARMS_CROSSED("long", true)} x={big ? 1050 : 1030} y={pose ? pose.y : big ? 1395 : H + 434} size={pose ? pose.size : big ? 1.1 : 0.75} color="url(#tShade)" gap="rgba(60,10,0,.85)" flip /></g>
  </svg>
);

const Band: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center" }}>
    <span style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 80, color: C.ink, background: C.white, padding: "0 28px", borderRadius: 8 }}>{text}</span>
  </div>
);
const Big: React.FC<{ text: string; top: number; size: number; color?: string }> = ({ text, top, size, color = C.white }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size,
    lineHeight: 1.1, whiteSpace: "nowrap", color, WebkitTextStroke: color === C.white ? undefined : `10px ${C.ink}`, paintOrder: "stroke fill",
    filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))" }}>{text}</div>
);

/** 案1：本編の主役の数字（無作為の男女の組で、32の行動の線が全部そろうのは約170組に1組）。そろう＝金（本編と同じ意味の色） */
const Match: React.FC = () => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground />
    <Band text="どこからが浮気？" />
    <Big text="線がぴったり合うのは" top={126} size={88} />
    <Big text="170組に1組" top={214} size={152} color={GOLD} />
  </AbsoluteFill>
);

/** 案2：逆説（ずれる数は男女の組でも同性どうしでも同じ：9.3・8.9・9.3個）。数字なし。「男女の差じゃない」は男女差がないと読まれるのでやめた（レビュー r1） */
const NotSex: React.FC = () => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground />
    <Band text="どこからが浮気？" />
    <Big text="線がずれる数は" top={126} size={88} />
    <Big text="男性どうしでも同じ" top={232} size={124} />
  </AbsoluteFill>
);

/** 案3（2026-10-07 オーナー「線がぴったりあうのが、が伝わらん。短く簡潔に」）：「線」を使わず、大きい文字1かたまり。
 *  nobody：タイトルの数字（170組に1組＝0.59%）を言葉で。zure：逆説（ずれる数は男女の組でも同性どうしでも同じ） */
const Short: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground big />
    <Band text="どこからが浮気？" />
    <Big text={text} top={150} size={136} />
  </AbsoluteFill>
);

/** 案4（2026-10-07 オーナー「男性同士でもずれる、ほぼ誰とも合わない、はそりゃそうだ、となる」）：本編でいちばん意外な所。
 *  男女それぞれの多数決の答えは、32の行動すべてで同じ（Kulibert & Thompson 2019 の公開データ。本編の第2章のはしご2段目）。
 *  タイトル（2人なら170組に1組）と並べて逆説になる。「一致」だけ金（本編で「そろう」の色） */
const AllMatch: React.FC = () => (
  <AbsoluteFill style={{ background: RED[0] }}>
    <Ground big />
    <Band text="どこからが浮気？" />
    <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 160,
      lineHeight: 1.1, whiteSpace: "nowrap", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))" }}>
      <span style={{ color: C.white }}>男女で全問</span>
      <span style={{ color: GOLD, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" }}>一致</span>
    </div>
  </AbsoluteFill>
);

/** 案5（2026-10-07 オーナー「男女で基準は同じ？ は？ どのようにも捉えられるし訴求力ありそう」）：問いの形。
 *  答えは本編どおり二重（男女の多数派の答えは32問すべて同じ／2人だと170組に1組しか合わない）。タイトルの「基準」と同じ語 */
const SameQ: React.FC = () => {
  // レビュー r3：札はタイトルの頭と同じなのでやめ、大の文字を2行に。「同じ」だけ金。人は大きく（頭のてっぺん y 約410）、くさびは明るく、2人をくさびから外へ8度傾ける
  const line: React.CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 170,
    lineHeight: 1.1, whiteSpace: "nowrap", color: C.white, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))" };
  return (
    <AbsoluteFill style={{ background: RED[0] }}>
      <Ground big light pose={{ size: 1.3, y: 410 + 965 * 1.3, tilt: 8 }} />
      <div style={{ ...line, top: 24 }}>男女で</div>
      <div style={{ ...line, top: 210 }}>基準は<span style={{ color: GOLD }}>同じ</span>？</div>
    </AbsoluteFill>
  );
};

// 案5の人形版（2026-10-07）：オーナーが画像生成AIで作った白い人形（_local/episodes/006-cheating-line/thumb/。scripts/thumb_key.py で緑を抜き、彼は左右を返して外向きに）。
const PHOTO = (n: string) => staticFile(`episodes/006-cheating-line/thumb/${n}.png`);
const DOLL_H = 760, DOLL_TOP = 392;
const SameQAI: React.FC = () => {
  const line: React.CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 170,
    lineHeight: 1.1, whiteSpace: "nowrap", color: C.white, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.75))" };
  const doll = (n: string, cx: number): React.ReactNode => (
    <Img src={PHOTO(n)} style={{ position: "absolute", top: DOLL_TOP, height: DOLL_H, left: cx, transform: "translateX(-50%)",
      filter: "drop-shadow(8px 12px 14px rgba(0,0,0,.45))" }} />
  );
  return (
    <AbsoluteFill style={{ background: RED[0] }}>
      <Ground big light pose={{ size: 0.001, y: H + 2000, tilt: 0 }} />
      {doll("man", 230)}
      {doll("woman", 1050)}
      <div style={{ ...line, top: 24 }}>男女で</div>
      <div style={{ ...line, top: 210 }}>基準は<span style={{ color: GOLD }}>同じ</span>？</div>
    </AbsoluteFill>
  );
};

export default [
  { id: "006-cheating-line-thumb-sameq-ai", component: SameQAI },
  { id: "006-cheating-line-thumb-sameq", component: SameQ },
  { id: "006-cheating-line-thumb-allmatch", component: AllMatch },
  { id: "006-cheating-line-thumb-nobody", component: () => <Short text="ほぼ誰とも合わない" /> },
  { id: "006-cheating-line-thumb-zure", component: () => <Short text="男性どうしもズレる" /> },
  { id: "006-cheating-line-thumb-match", component: Match },
  { id: "006-cheating-line-thumb-notsex", component: NotSex },
];
