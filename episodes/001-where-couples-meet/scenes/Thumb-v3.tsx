// 1本目のサムネイル案 S1「歩いて10分／出会えない」（2026-10-06。根拠は review/title-thumb.md）。
// 冒頭の物語の2匹：左はハートが届かない彼、右はハートが積もる彼女。間に部屋の壁。ゴサは出さない（男女の話の回）。
// 2匹は同じ大きさ・同じ明るさにして、片方だけをみじめに見せない（性別全体の話に読まれないように）。
// 地は2版：壁の色（paper）と夜（night）。npx remotion still 001-where-couples-meet-v3-thumb-cats out/thumb-cats.png
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cat } from "@lib/Cat";
import { Figure } from "@lib/Figure";
import { Heart } from "@lib/TownsSim";
import { scatter } from "@lib/layout";
import { C, FONT, FONT_SERIF, LINE, R } from "@lib/theme";

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

// 試作 S4（2026-10-06）：考えすぎる葦のサムネイル116本の分析から、原則だけを借りる（見た目の丸写しはしない）。
// 暗い地・画面の半分を占める特大の文字（1つの強い名詞句）・感情の見える顔の寄り。「パラドックス」の型は使わない。
const Trap: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 70%, #3A1A22 0%, ${C.ink} 70%)` }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {/* 2匹の顔の寄り（画面の下から大きくのぞく）。同じ大きさ・同じ明るさ */}
      <Cat kind="male" x={230} y={H + 120} size={8.5} pose="phone" face="sad" label="彼" />
      <Cat kind="female" x={1050} y={H + 120} size={8.5} pose="phone" face="think" seed={5} label="彼女" />
      {[[1200, 470], [1110, 420], [1240, 380], [1160, 330]].map(([x, y], i) => <Heart key={i} x={x} y={y} r={30} fill={C.male} stroke={C.bg} />)}
    </svg>
    {/* 文字は明朝体（2026-10-06 オーナー）。赤は上から下へ濃くし、白い縁と黒い影で浮かせる */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 58, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 66,
      color: C.bg, letterSpacing: 6, textShadow: "0 4px 12px rgba(0,0,0,.8)" }}>マッチングアプリ</div>
    {/* 縁取りは別の層に描く（明朝体は字の中の線が重なっているので、同じ層で縁を付けると字の中にも線が出る） */}
    {[true, false].map((outline) => (
      <div key={String(outline)} style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900,
        fontSize: 270, lineHeight: 1, letterSpacing: -6, filter: outline ? "drop-shadow(0 12px 10px rgba(0,0,0,.85))" : undefined }}>
        {(["出会い", "の", "罠"] as const).map((t) => {
          const small = t === "の";
          const style: React.CSSProperties = outline
            ? { color: C.bg, WebkitTextStroke: `14px ${C.bg}` }
            : small ? { color: C.bg }
            : { background: "linear-gradient(180deg, #FF6A4D 0%, #D8261A 55%, #8E1010 100%)", WebkitBackgroundClip: "text", color: "transparent" };
          return <span key={t} style={{ ...style, fontSize: small ? 150 : undefined, ...(small && outline ? { WebkitTextStroke: "0", color: "transparent" } : {}) }}>{t}</span>;
        })}
      </div>
    ))}
  </AbsoluteFill>
);

// 試作 S5（2026-10-06 オーナー「対立で色合いを2〜4色で分ける」「猫はいらない」）。データで語る棒人間・考えすぎる葦に多い、色で左右を分ける型。
// 文字はタイトル（選ばれない人と、選べない人）と同じことを言わず、冒頭の物語のデータ（同じひと月に届いたいいね：彼1件・彼女15件）で対比する。
const SPLIT = { blue: ["#0E2A5C", "#2F6FDE"], red: ["#5C0E14", "#D8261A"] } as const;
const Split: React.FC = () => {
  const side = (x: number, c: readonly [string, string]) => (
    <rect x={x} y={0} width={W / 2} height={H} fill={`url(#g${c[0]})`} />
  );
  const big = (text: string, unit: string, left: number) => (
    <div style={{ position: "absolute", left, width: W / 2, top: 150, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, color: C.white,
      fontSize: 230, lineHeight: 1, filter: "drop-shadow(0 10px 10px rgba(0,0,0,.6))" }}>
      {text}<span style={{ fontSize: 110 }}>{unit}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          {[SPLIT.blue, SPLIT.red].map((c) => (
            <radialGradient key={c[0]} id={`g${c[0]}`} cx="50%" cy="80%" r="80%">
              <stop offset="0%" stopColor={c[1]} /><stop offset="100%" stopColor={c[0]} />
            </radialGradient>
          ))}
        </defs>
        {side(0, SPLIT.blue)}
        {side(W / 2, SPLIT.red)}
        {/* 2人：同じ大きさ・同じ明るさのシルエット。右の人の周りだけハート */}
        <Figure kind="male" x={330} y={H + 40} size={7} pose="phone" color="rgba(255,255,255,.9)" ring={false} />
        <Figure kind="female" x={950} y={H + 40} size={7} pose="phone" color="rgba(255,255,255,.9)" ring={false} />
        {[[1130, 470], [1060, 420], [1200, 390], [1150, 330], [1230, 300], [1080, 520]].map(([x, y], i) => <Heart key={i} x={x} y={y} r={28} fill="#FF8FA3" stroke={C.white} />)}
        <Heart x={150} y={470} r={28} fill="#FF8FA3" stroke={C.white} />
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={C.white} strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 28, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 70, color: C.white,
        letterSpacing: 4, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.7))" }}>届いたいいね</div>
      {big("1", "件", 0)}
      {big("15", "件", W / 2)}
    </AbsoluteFill>
  );
};

// 試作 S6（2026-10-06 オーナーが好きな1枚：白黒の情景・主人公だけに色・上の黒い帯に心の声を明朝体で）。
// 原則だけ借り、見た目はうちのもの（lovebynumbers の丸写しは避ける。2026-10-04 決定）：色はうちの男女の色、人はうちの人型、
// 情景は冒頭の物語の「歩いて10分の2つの部屋」（夜の集合住宅を割った断面。白い線画）。
const LINE_W = "#E9E6DF";
const Room: React.FC<{ x: number; kind: "male" | "female"; hearts: number }> = ({ x, kind, hearts }) => {
  const top = 300, w = 560, fl = 664;
  const hs = kind === "male" ? [{ x: x + 500, y: top + 70 }] : scatter(hearts, { x: x + 330, y: top + 50, w: 200, h: 220 }, 9, 1.1);
  return (
    <g>
      {/* 部屋の枠と床 */}
      <rect x={x} y={top} width={w} height={fl - top} fill="#16171B" stroke={LINE_W} strokeWidth={4} />
      {/* 夜の窓（雨と街の灯） */}
      <rect x={x + 30} y={top + 30} width={200} height={170} fill="#0B0C10" stroke={LINE_W} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={x + 40 + (i * 37) % 180} y={top + 120 + (i * 23) % 60} width={8} height={10} fill={LINE_W} opacity={0.5} />)}
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={x + 38 + (i * 29) % 190} y1={top + 36 + (i * 41) % 130} x2={x + 32 + (i * 29) % 190} y2={top + 60 + (i * 41) % 130} stroke={LINE_W} strokeWidth={2} opacity={0.6} />)}
      {/* 家具：左はベッド、右はソファ（白い線画） */}
      {kind === "male"
        ? <g fill="none" stroke={LINE_W} strokeWidth={4}><rect x={x + 250} y={fl - 90} width={280} height={90} rx={10} /><rect x={x + 250} y={fl - 140} width={30} height={140} rx={6} /></g>
        : <g fill="none" stroke={LINE_W} strokeWidth={4}><rect x={x + 30} y={fl - 110} width={300} height={70} rx={14} /><rect x={x + 20} y={fl - 60} width={320} height={60} rx={14} /></g>}
      {/* スマホの光 */}
      <circle cx={kind === "male" ? x + 390 : x + 180} cy={fl - 150} r={150} fill={`url(#glow-${kind})`} />
      <Figure kind={kind} x={kind === "male" ? x + 390 : x + 180} y={fl - 8} size={4.4} pose="phone" ring={false} />
      {/* ハートの色は送った人の性別：彼女に届くのは男性から（青）、彼に届く1件は女性から（橙） */}
      {hs.map((p, i) => <Heart key={i} x={p.x} y={p.y} r={24} fill={kind === "male" ? C.female : C.male} stroke={LINE_W} />)}
    </g>
  );
};
const Voice: React.FC<{ quote: [string, string] }> = ({ quote }) => (
  <AbsoluteFill style={{ background: "#0B0C10" }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        {(["male", "female"] as const).map((k) => (
          <radialGradient key={k} id={`glow-${k}`}><stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.28} /><stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient>
        ))}
      </defs>
      <Room x={50} kind="male" hearts={1} />
      <Room x={670} kind="female" hearts={9} />
      {/* 2つの部屋の間：歩いて10分 */}
      <text x={640} y={702} textAnchor="middle" style={{ fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 30, fill: LINE_W }}>← 歩いて10分 →</text>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily: FONT_SERIF, fontWeight: 700, color: C.white,
      fontSize: 118, lineHeight: 1.12 }}>
      <div>{quote[0]}</div><div>{quote[1]}</div>
    </div>
  </AbsoluteFill>
);

// S6 の2版（レビュー r1 の直し：主役を彼1人に・文字は左上で極太・色は2人の体だけ、ハートは白で彼1・彼女15）
const VoiceHim: React.FC = () => {
  const BG = "#0B0C10";
  // 彼女の部屋のハート15個（ちらす。4個は窓の外へこぼれる）
  const herHearts: [number, number, number][] = [
    [1150, 140, 24], [1210, 190, 20], [1120, 210, 26], [1190, 260, 22], [1230, 330, 18], [1140, 300, 20], [1080, 150, 18],
    [1200, 380, 24], [1110, 370, 18], [1175, 132, 18], [1220, 140, 20],
    [1150, 470, 26], [1225, 520, 22], [1090, 540, 20], [1180, 600, 28],
  ];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="glow3"><stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.45} /><stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient>
          <radialGradient id="glow4"><stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient>
        </defs>
        <line x1={0} x2={W} y1={690} y2={690} stroke={LINE_W} strokeWidth={4} />
        {/* ベッド（後ろ）。届いたハート1つとスマホの光 */}
        <g fill="none" stroke={LINE_W} strokeWidth={4}>
          <rect x={60} y={590} width={440} height={100} rx={12} />
          <rect x={40} y={500} width={34} height={190} rx={8} />
        </g>
        <circle cx={300} cy={575} r={280} fill="url(#glow3)" />
        <polygon points="262,578 338,578 330,520 270,520" fill={C.white} opacity={0.18} />{/* スマホの画面からハートへの光 */}
        <rect x={255} y={578} width={90} height={10} rx={3} fill={LINE_W} />
        <Heart x={300} y={480} r={42} fill={C.white} stroke="none" />
        {/* 彼：ベッドの端で前かがみに座り、ひざにひじをついて額を手で支える（横向き。胴は頭とほぼ同じ幅） */}
        <g stroke={C.male} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M478 600 C468 560 485 505 540 478" strokeWidth={84} />{/* 丸めた背中 */}
          <path d="M478 606 L630 610" strokeWidth={56} />{/* もも */}
          <path d="M630 610 L636 668 L686 668" strokeWidth={42} />{/* すね・足（床の線にそろえる） */}
        </g>
        {/* 背中の左のふちに光（スマホの光が当たる） */}
        <path d="M430 590 C424 550 445 500 505 468" stroke={C.white} strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={612} cy={478} r={48} fill={C.male} />{/* 前に落ちた頭 */}
        {/* 腕：肩→ひざの上のひじ→ほぼ真上の額。まわりに地の色の線を引いて頭・胴と分ける */}
        <path d="M545 488 L622 592 L628 512" stroke={BG} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M545 488 L622 592 L628 512" stroke={C.male} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={630} cy={506} r={22} fill={C.male} stroke={BG} strokeWidth={3} />{/* 手 */}
        {/* 彼女の部屋（窓）。文字から70px以上離す。少し下げた明るさ */}
        <rect x={960} y={100} width={290} height={320} fill="#16171B" stroke={LINE_W} strokeWidth={4} />
        <circle cx={1030} cy={330} r={120} fill="url(#glow4)" />
        <g opacity={0.85}><Figure kind="female" x={1030} y={418} size={3.2} pose="phone" ring={false} /></g>
        {herHearts.map(([x, y, r], i) => <Heart key={i} x={x} y={y} r={r} fill={C.white} stroke="none" />)}
      </svg>
      <div style={{ position: "absolute", left: 52, top: 18, fontFamily: FONT_SERIF, fontWeight: 900, color: C.white, fontSize: 140, lineHeight: 1.1 }}>
        <div>何がいけない</div><div>んだろう</div>
      </div>
    </AbsoluteFill>
  );
};

export default [
  { id: "001-where-couples-meet-v3-thumb-voice2", component: VoiceHim },
  { id: "001-where-couples-meet-v3-thumb-voice-him", component: () => <Voice quote={["何がいけない", "んだろう"]} /> },
  { id: "001-where-couples-meet-v3-thumb-voice-her", component: () => <Voice quote={["もっといい人が", "いるかもしれない"]} /> },
  { id: "001-where-couples-meet-v3-thumb-split", component: Split },
  { id: "001-where-couples-meet-v3-thumb-trap", component: Trap },
  { id: "001-where-couples-meet-v3-thumb-cats", component: () => <Cats night={false} /> },
  { id: "001-where-couples-meet-v3-thumb-cats-night", component: () => <Cats night /> },
];
