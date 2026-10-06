// 小さな絵（64〜72px の目印）。文字だけの札・軸の区切りに添えて、読まなくても分かるようにする（2026-10-06 4本目の絵コンテ第2版で作った）。
// 決まり：墨の輪郭（LINE.thin）＋紙色（paper2）か白の面。データの色は使わない（例外：持ち主を示すときだけ男女の色 color を渡す）。
// どれも x,y が絵の中心、s が倍率（s=1 で高さ約64px）。印は data-qa="prop"。
//   Ball（サッカーボール）・Randoseru（ランドセル）・Bottle（哺乳びん）・SchoolBag（学生かばん）
//   Ear（聞く）・Hanamaru（認める）・Bulb（助言）・House（家）・Briefcase（仕事の鞄）
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
