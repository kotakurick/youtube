// 小さな絵（64〜72px の目印）。文字だけの札・軸の区切りに添えて、読まなくても分かるようにする（2026-10-06 4本目の絵コンテ第2版で作った）。
// 決まり：墨の輪郭（LINE.thin）＋紙色（paper2）か白の面。データの色は使わない（例外：持ち主を示すときだけ男女の色 color を渡す）。
// どれも x,y が絵の中心、s が倍率（s=1 で高さ約64px）。印は data-qa="prop"。
//   Ball（サッカーボール）・Randoseru（ランドセル）・Bottle（哺乳びん）・SchoolBag（学生かばん）
//   Ear（聞く）・Hanamaru（認める）・Bulb（助言）・House（家）・Briefcase（仕事の鞄）
//   7本目（情報漏えい）で足した：Grill（焼肉の網）・Clipboard（アンケート）・CarIcon（車）・StockChart（株の値動き）・Envelope（おわびのメール）
//   ・IdCard（免許証）・Office（会社の建物）・Mug（飲み会のジョッキ）・Gavel（裁判）・ICChip（カードのICチップ）・CloudIcon（クラウド）・Tool（道具）
//   第2版で足した：CallDesk（問い合わせを受ける机とヘッドセット）・Ingot（金と銀の延べ棒。金だけ意味の色の金）
//   会社名・ロゴ・実在の画面は描かない（一般名の目印だけ）。
import React from "react";
import { C, LINE } from "./theme";

type P = { x: number; y: number; s?: number; color?: string; label?: string };
const Wrap: React.FC<P & { name: string; children: React.ReactNode }> = ({ x, y, s = 1, name, label, children }) => (
  <g data-qa="prop" data-qa-label={label ?? name} transform={`translate(${x},${y}) scale(${s})`}>{children}</g>
);
const st = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Ball: React.FC<P> = (p) => (
  <Wrap {...p} name="ボール">
    <circle r={28} fill={C.white} {...st} />
    <path d="M0 -10 L10 -3 L6 9 L-6 9 L-10 -3 Z" fill={C.ink} />
    <path d="M0 -10 V-27 M10 -3 L26 -8 M6 9 L15 23 M-6 9 L-15 23 M-10 -3 L-26 -8" stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

export const Randoseru: React.FC<P> = (p) => (
  <Wrap {...p} name="ランドセル">
    <rect x={-26} y={-30} width={52} height={60} rx={12} fill={p.color ?? C.paper2} {...st} />
    <path d="M-26 -8 Q0 6 26 -8" fill="none" {...st} />
    <rect x={-5} y={2} width={10} height={12} rx={2} fill={C.ink} />
  </Wrap>
);

export const Bottle: React.FC<P> = (p) => (
  <Wrap {...p} name="哺乳びん">
    <path d="M-6 -32 Q0 -40 6 -32 L8 -22 H-8 Z" fill={C.paper2} {...st} />
    <rect x={-14} y={-24} width={28} height={8} rx={3} fill={C.ink} />
    <rect x={-16} y={-16} width={32} height={48} rx={10} fill={C.white} {...st} />
    <path d="M-8 0 H0 M-8 10 H0 M-8 20 H0" stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

export const SchoolBag: React.FC<P> = (p) => (
  <Wrap {...p} name="学生かばん">
    <path d="M-12 -18 Q-12 -32 0 -32 Q12 -32 12 -18" fill="none" {...st} />
    <rect x={-32} y={-18} width={64} height={46} rx={8} fill={C.paper2} {...st} />
    <path d="M-32 -2 H32" {...st} />
    <rect x={-6} y={-6} width={12} height={10} rx={2} fill={C.ink} />
  </Wrap>
);

export const Ear: React.FC<P> = (p) => (
  <Wrap {...p} name="耳">
    <path d="M-14 -16 Q-14 -32 4 -32 Q24 -32 24 -10 Q24 4 12 12 Q4 18 4 28 Q4 34 -4 34 Q-14 34 -14 24" fill={C.white} {...st} />
    <path d="M-2 -14 Q-2 -20 6 -20 Q12 -20 12 -10 Q12 -2 4 2" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </Wrap>
);

export const Hanamaru: React.FC<P> = (p) => (
  <Wrap {...p} name="花丸">
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 20} cy={Math.sin(a) * 20} r={12} fill={C.white} {...st} strokeWidth={4} />;
    })}
    <circle r={16} fill={C.white} stroke="none" />
    <path d="M-4 -6 Q8 -10 8 0 Q8 10 -4 8 Q-12 4 -6 -2" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </Wrap>
);

export const Bulb: React.FC<P> = (p) => (
  <Wrap {...p} name="電球">
    <path d="M-12 14 Q-24 2 -24 -10 Q-24 -32 0 -32 Q24 -32 24 -10 Q24 2 12 14 Z" fill={C.white} {...st} />
    <rect x={-12} y={14} width={24} height={16} rx={3} fill={C.paper2} {...st} />
    <path d="M-6 0 L0 -10 L6 0" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
  </Wrap>
);

export const House: React.FC<P> = (p) => (
  <Wrap {...p} name="家">
    <path d="M-30 -2 L0 -30 L30 -2 V30 H-30 Z" fill={C.paper2} {...st} />
    <rect x={-8} y={8} width={16} height={22} fill={C.white} stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

export const Briefcase: React.FC<P> = (p) => (
  <Wrap {...p} name="鞄">
    <path d="M-10 -14 V-22 H10 V-14" fill="none" {...st} />
    <rect x={-32} y={-14} width={64} height={42} rx={8} fill={C.paper2} {...st} />
    <path d="M-32 4 H32" stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

export const Grill: React.FC<P> = (p) => (
  <Wrap {...p} name="焼肉の網">
    {/* 丸い網（網目3本ずつ）＋肉2枚＋下の炎（第2版：かごに見えたので描き直し。2026-10-07） */}
    <path d="M-20 30 Q-26 20 -18 12 Q-16 20 -10 22 Q-12 10 -2 2 Q0 14 8 18 Q8 8 16 4 Q22 18 18 30 Z" fill={C.paper2} {...st} strokeWidth={3} />
    <ellipse cx={0} cy={-6} rx={36} ry={16} fill={C.white} {...st} />
    <path d="M-18 -19 V7 M0 -22 V10 M18 -19 V7 M-32 -6 H32" stroke={C.ink} strokeWidth={2.5} />
    <ellipse cx={-12} cy={-9} rx={11} ry={5} fill={C.ink2} transform="rotate(-12 -12 -9)" />
    <ellipse cx={13} cy={-4} rx={11} ry={5} fill={C.ink2} transform="rotate(10 13 -4)" />
    <path d="M-12 -28 Q-8 -34 -12 -40 M10 -28 Q14 -34 10 -40" fill="none" stroke={C.ink2} strokeWidth={3} strokeLinecap="round" />
  </Wrap>
);

export const Clipboard: React.FC<P> = (p) => (
  <Wrap {...p} name="アンケート">
    <rect x={-24} y={-30} width={48} height={62} rx={6} fill={C.white} {...st} />
    <rect x={-12} y={-36} width={24} height={12} rx={3} fill={C.paper2} {...st} />
    {[-10, 4, 18].map((y) => <g key={y}><rect x={-15} y={y - 5} width={10} height={10} rx={2} fill="none" stroke={C.ink} strokeWidth={3} />
      <path d={`M0 ${y} H15`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" /></g>)}
  </Wrap>
);

export const CarIcon: React.FC<P> = (p) => (
  <Wrap {...p} name="車">
    <path d="M-34 14 V0 Q-34 -6 -28 -8 L-18 -24 H16 L28 -8 Q34 -6 34 0 V14 Z" fill={C.paper2} {...st} />
    <path d="M-14 -20 L-20 -8 H18 L12 -20 Z" fill={C.white} stroke={C.ink} strokeWidth={3} />
    <circle cx={-18} cy={16} r={9} fill={C.ink} /><circle cx={18} cy={16} r={9} fill={C.ink} />
  </Wrap>
);

export const StockChart: React.FC<P> = (p) => (
  <Wrap {...p} name="株の値動き">
    <rect x={-32} y={-30} width={64} height={60} rx={6} fill={C.white} {...st} />
    {[[-18, -2, 14], [-6, -12, 10], [6, -8, 16], [18, -20, 12]].map(([x, y, h]) => (
      <g key={x}><path d={`M${x} ${y - 6} V${y + h + 6}`} stroke={C.ink} strokeWidth={3} /><rect x={x - 5} y={y} width={10} height={h} fill={C.paper2} stroke={C.ink} strokeWidth={3} /></g>
    ))}
  </Wrap>
);

export const Envelope: React.FC<P> = (p) => (
  <Wrap {...p} name="封筒">
    <rect x={-32} y={-22} width={64} height={44} rx={5} fill={C.white} {...st} />
    <path d="M-30 -20 L0 4 L30 -20" fill="none" {...st} />
  </Wrap>
);

export const IdCard: React.FC<P> = (p) => (
  <Wrap {...p} name="免許証">
    <rect x={-34} y={-22} width={68} height={44} rx={6} fill={C.white} {...st} />
    <rect x={-26} y={-12} width={20} height={26} rx={3} fill={C.paper2} stroke={C.ink} strokeWidth={3} />
    <path d="M2 -8 H26 M2 2 H22 M2 12 H16" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
  </Wrap>
);

export const Office: React.FC<P> = (p) => (
  <Wrap {...p} name="会社">
    <rect x={-26} y={-34} width={52} height={66} fill={C.paper2} {...st} />
    {[-22, -8, 6].map((y) => [-14, 4].map((x) => <rect key={`${x}${y}`} x={x} y={y} width={10} height={9} fill={C.white} stroke={C.ink} strokeWidth={2} />))}
    <rect x={-6} y={18} width={12} height={14} fill={C.ink} />
  </Wrap>
);

export const Mug: React.FC<P> = (p) => (
  <Wrap {...p} name="ジョッキ">
    <rect x={-20} y={-20} width={40} height={50} rx={5} fill={C.white} {...st} />
    <path d="M20 -8 H30 Q34 -8 34 -4 V12 Q34 16 30 16 H20" fill="none" {...st} />
    <path d="M-22 -20 Q-26 -32 -12 -32 Q-6 -40 4 -34 Q16 -38 20 -28 Q26 -24 22 -20 Z" fill={C.white} {...st} />
  </Wrap>
);

export const Gavel: React.FC<P> = (p) => (
  <Wrap {...p} name="木づち">
    <g transform="rotate(-35)"><rect x={-26} y={-26} width={52} height={22} rx={5} fill={C.paper2} {...st} /><path d="M0 -4 V30" {...st} strokeWidth={LINE.base} /></g>
    <rect x={-30} y={24} width={60} height={10} rx={3} fill={C.paper2} {...st} />
  </Wrap>
);

export const ICChip: React.FC<P> = (p) => (
  <Wrap {...p} name="ICチップ">
    <rect x={-24} y={-20} width={48} height={40} rx={6} fill={C.goldTint} {...st} />
    <path d="M-24 -6 H-8 V6 H-24 M24 -6 H8 V6 H24 M-8 -20 V-6 M8 -20 V-6 M-8 20 V6 M8 20 V6" fill="none" stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

export const CloudIcon: React.FC<P> = (p) => (
  <Wrap {...p} name="クラウド">
    <path d="M-30 18 Q-42 18 -42 6 Q-42 -8 -28 -8 Q-26 -26 -6 -26 Q12 -26 16 -12 Q34 -14 36 2 Q40 18 24 18 Z" fill={C.white} {...st} />
  </Wrap>
);

export const Tool: React.FC<P> = (p) => (
  <Wrap {...p} name="道具">
    <rect x={-32} y={-8} width={64} height={36} rx={6} fill={C.paper2} {...st} />
    <path d="M-12 -8 V-18 H12 V-8" fill="none" {...st} />
    <path d="M-20 10 H20" stroke={C.ink} strokeWidth={3} />
  </Wrap>
);

/** 問い合わせを受ける机（ヘッドセットの人型と机。委託先の受付の仕事）。会社の建物（Office）と描き分ける（第2版。2026-10-07） */
export const CallDesk: React.FC<P> = (p) => (
  <Wrap {...p} name="問い合わせの机">
    <circle cx={-6} cy={-26} r={11} fill={C.ink2} />
    <path d="M-18 -28 Q-18 -42 -6 -42 Q6 -42 6 -28" fill="none" stroke={C.ink} strokeWidth={3} />
    <rect x={3} y={-31} width={6} height={9} rx={2} fill={C.ink} />
    <path d="M6 -24 Q10 -16 2 -14" fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M-22 6 Q-22 -12 -6 -12 Q10 -12 10 6 Z" fill={C.ink2} />
    <rect x={14} y={-14} width={22} height={16} rx={2} fill={C.white} {...st} strokeWidth={3} />
    <rect x={-36} y={6} width={72} height={8} rx={2} fill={C.paper2} {...st} strokeWidth={3} />
    <path d="M-30 14 V32 M30 14 V32" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
  </Wrap>
);

/** 延べ棒（金＝お金になる物、銀＝灰）。台形の塊。kind="silver" で灰 */
export const Ingot: React.FC<P & { kind?: "gold" | "silver" }> = ({ kind = "gold", ...p }) => (
  <Wrap {...p} name={kind === "gold" ? "金の延べ棒" : "銀の延べ棒"}>
    <path d="M-36 20 L-24 -14 H24 L36 20 Z" fill={kind === "gold" ? C.gold : C.otherTint} {...st} />
    <path d="M-24 -14 L-18 -22 H18 L24 -14" fill={kind === "gold" ? C.goldTint : C.white} {...st} />
  </Wrap>
);
