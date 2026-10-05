// 猫のサブキャラ（物語の主人公）の素案一覧（確認用の静止画。2026-10-05）。
// 1案につき左が男性の色、右が女性の色。ゴサ（黒・丸・ひげが誤差棒）と見分けがつくように、色と体の形を変える。
// オーナーが選んだら、選んだ案を lib に部品として作り直す（ポーズ・表情つき）。この見本は選ぶためだけのもの。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Gosa } from "@lib/Gosa";
import { C, FONT } from "@lib/theme";

type Head = "round" | "mochi" | "onigiri" | "square";
type Ears = "point" | "round" | "fold" | "big";
type Body = "pear" | "bean" | "rect" | "daruma" | "tall";
type Eyes = "dot" | "big" | "white" | "sleepy" | "smile";
type Fill = "full" | "tint" | "outline" | "inkline";
type Pattern = "none" | "stripes" | "belly" | "patch" | "socks";
type Tail = "curl" | "straight" | "none";
type Acc = "none" | "collar" | "scarf" | "bow";

export type CatDesign = {
  head: Head; ears: Ears; body: Body; eyes: Eyes; fill: Fill;
  pattern?: Pattern; tail?: Tail; blush?: boolean; whiskers?: boolean; mouth?: "w" | "dot" | "none";
  chibi?: boolean; acc?: Acc;
};

const PAL = {
  male: { main: C.male, tint: C.maleTint, dark: "#1E4C9E", inner: "#D6E2F7" },
  female: { main: C.female, tint: C.femaleTint, dark: "#9E3A12", inner: "#FAD9C8" },
};
const BLUSH = "#F08A8A";

export const CatSketch: React.FC<{ d: CatDesign; sex: "male" | "female"; x: number; foot: number; s?: number }> = ({ d, sex, x, foot, s = 1 }) => {
  const p = PAL[sex];
  const bodyFill = d.fill === "full" ? p.main : d.fill === "outline" ? C.white : p.tint;
  const line = d.fill === "full" ? "none" : d.fill === "inkline" ? C.ink : p.main;
  const sw = d.fill === "full" ? 0 : 6;
  const st = { fill: bodyFill, stroke: line, strokeWidth: sw, strokeLinejoin: "round" as const };
  const accent = d.fill === "full" ? C.white : p.main; // 模様の色
  const pat = d.pattern ?? "none";

  // 体の大きさ（足元が 0）
  const bw = d.body === "tall" ? 44 : 52, bh = d.chibi ? 66 : d.body === "tall" ? 128 : 92;
  const rx = d.chibi ? 76 : d.head === "mochi" ? 74 : 58, ry = d.chibi ? 68 : d.head === "mochi" ? 52 : 56;
  const hy = d.body === "daruma" ? -bh - 20 : -bh - ry * 0.55;

  const body = () => {
    switch (d.body) {
      case "bean": return <ellipse cx={0} cy={-bh / 2} rx={bw * 0.85} ry={bh / 2} {...st} />;
      case "rect": return <rect x={-bw * 0.8} y={-bh} width={bw * 1.6} height={bh} rx={bw * 0.4} {...st} />;
      case "daruma": return <ellipse cx={0} cy={-bh * 0.62} rx={bw * 1.25} ry={bh * 0.62} {...st} />;
      default: { // pear / tall
        const w = bw;
        return <path d={`M ${-0.45 * w} ${-bh} C ${-1.0 * w} ${-0.55 * bh} ${-1.05 * w} 0 ${-0.6 * w} 0 L ${0.6 * w} 0 C ${1.05 * w} 0 ${1.0 * w} ${-0.55 * bh} ${0.45 * w} ${-bh} Z`} {...st} />;
      }
    }
  };
  const headShape = (extra: React.SVGProps<SVGElement> = {}) => {
    const a = { ...st, ...extra } as any;
    switch (d.head) {
      case "mochi": return <ellipse cx={0} cy={hy} rx={rx} ry={ry} {...a} />;
      case "square": return <rect x={-rx} y={hy - ry} width={rx * 2} height={ry * 1.9} rx={ry * 0.5} {...a} />;
      case "onigiri": return <path d={`M 0 ${hy - ry} C ${0.7 * rx} ${hy - ry} ${1.25 * rx} ${hy + 0.45 * ry} ${0.95 * rx} ${hy + 0.8 * ry} Q 0 ${hy + 1.05 * ry} ${-0.95 * rx} ${hy + 0.8 * ry} C ${-1.25 * rx} ${hy + 0.45 * ry} ${-0.7 * rx} ${hy - ry} 0 ${hy - ry} Z`} {...a} />;
      default: return <ellipse cx={0} cy={hy} rx={rx} ry={ry} {...a} />;
    }
  };
  const earTop = d.head === "onigiri" ? 0.55 : 0.62;
  const ear = (side: 1 | -1) => {
    const ex = side * rx * earTop, ey = hy - ry * 0.55;
    const w = rx * 0.34, h = d.ears === "big" ? ry * 0.95 : ry * 0.7;
    if (d.ears === "round") return (
      <g key={side}>
        <circle cx={side * rx * 0.62} cy={hy - ry * 0.78} r={rx * 0.27} {...st} />
        <circle cx={side * rx * 0.62} cy={hy - ry * 0.78} r={rx * 0.13} fill={d.fill === "full" ? p.inner : p.main} />
      </g>
    );
    if (d.ears === "fold") return null; // 頭の上に描く
    const tip = [ex + side * w * 0.45, ey - h];
    return (
      <g key={side}>
        <path d={`M ${ex - w} ${ey + 8} L ${tip[0]} ${tip[1]} L ${ex + w} ${ey + 8} Z`} {...st} />
        <path d={`M ${ex - w * 0.5} ${ey} L ${tip[0] - side * 2} ${tip[1] + h * 0.35} L ${ex + w * 0.5} ${ey} Z`} fill={d.fill === "full" ? p.inner : d.fill === "outline" ? p.tint : p.main} />
      </g>
    );
  };
  const foldEar = (side: 1 | -1) => {
    const ex = side * rx * 0.55, ey = hy - ry * 0.82;
    return <path key={side} d={`M ${ex - side * rx * 0.3} ${ey - 4} Q ${ex + side * rx * 0.15} ${ey - ry * 0.32} ${ex + side * rx * 0.42} ${ey + ry * 0.06} Q ${ex + side * rx * 0.1} ${ey + ry * 0.1} ${ex - side * rx * 0.3} ${ey + ry * 0.12} Z`}
      fill={d.fill === "full" ? p.dark : p.main} stroke={line === "none" ? "none" : line} strokeWidth={sw * 0.6} strokeLinejoin="round" />;
  };

  // 目と口はゴサと同じ形（Gosa.tsx の Eyes・Mouth。体の半径32を頭の大きさに合わせて広げる）。2026-10-05 オーナー「目と口はゴサと同じトーン」
  const k = ry / 32, kx = Math.max(k, rx / 32 * 0.85);
  const face = d.fill === "full" && d.pattern !== "socks" ? C.white : C.ink;        // ゴサの paper にあたる色（目の白・口の線）
  const ring = d.fill === "full" ? undefined : C.ink;       // 明るい体では白目のふちを墨で描く
  const ey = hy - 4 * k, ex = 11 * kx;
  const eye = (side: 1 | -1) => {
    const cx = side * ex;
    switch (d.eyes) {
      case "smile": return <path key={side} d={`M ${cx - 7 * k} ${ey + 2 * k} q ${7 * k} ${-8 * k} ${14 * k} 0`} fill="none" stroke={face} strokeWidth={4.5 * k * 0.8} strokeLinecap="round" />;
      case "sleepy": return <g key={side}><path d={`M ${cx - 7 * k} ${ey - k} h ${14 * k} a ${7 * k} ${7 * k} 0 0 1 ${-14 * k} 0 z`} fill={C.white} stroke={ring} strokeWidth={ring ? 3 : 0} /><circle cx={cx} cy={ey + 2.5 * k} r={3 * k} fill={C.ink} /></g>;
      default: return <g key={side}><circle cx={cx} cy={ey} r={7 * k} fill={C.white} stroke={ring} strokeWidth={ring ? 3 : 0} /><circle cx={cx + k} cy={ey + k} r={3.5 * k} fill={C.ink} /></g>;
    }
  };
  const my = hy + 12 * k;
  const mouth = () => <path d={`M ${-6 * k} ${my} q ${3 * k} ${4 * k} ${6 * k} 0 q ${3 * k} ${4 * k} ${6 * k} 0`} fill="none" stroke={face} strokeWidth={2.8 * k} strokeLinecap="round" strokeLinejoin="round" />;
  const tailEl = () => {
    const t = d.tail ?? "curl";
    if (t === "none") return null;
    const x0 = bw * 0.7, y0 = -16;
    const path = t === "curl"
      ? `M ${x0} ${y0} C ${x0 + 60} ${y0 + 6} ${x0 + 66} ${y0 - 70} ${x0 + 30} ${y0 - 84}`
      : `M ${x0} ${y0} C ${x0 + 40} ${y0} ${x0 + 52} ${y0 - 40} ${x0 + 54} ${y0 - 120}`;
    return (
      <g fill="none" strokeLinecap="round">
        {sw > 0 && <path d={path} stroke={line} strokeWidth={16 + sw} />}
        <path d={path} stroke={pat === "stripes" ? p.main : bodyFill} strokeWidth={16} />
      </g>
    );
  };
  const feet = () => [-1, 1].map((k) => (
    <ellipse key={k} cx={k * bw * 0.42} cy={-7} rx={17} ry={11}
      fill={pat === "socks" ? C.white : bodyFill} stroke={pat === "socks" && line === "none" ? p.dark : line} strokeWidth={pat === "socks" ? 4 : sw} />
  ));
  const belly = () => {
    if (pat !== "belly" && pat !== "socks") return null;
    const by = d.body === "daruma" ? -bh * 0.45 : -bh * 0.45;
    return <ellipse cx={0} cy={by} rx={bw * (d.body === "daruma" ? 0.75 : 0.5)} ry={bh * 0.3} fill={accent === C.white ? C.white : p.tint} />;
  };
  const stripes = () => pat !== "stripes" ? null : (
    <g stroke={d.fill === "full" ? p.dark : p.main} strokeWidth={7} strokeLinecap="round" fill="none">
      {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 16} ${hy - ry * 0.95} L ${k * 13} ${hy - ry * 0.6}`} />)}
      {[-1, 1].map((k) => <path key={`b${k}`} d={`M ${k * bw * 0.75} ${-bh * 0.6} L ${k * bw * 0.35} ${-bh * 0.55}`} />)}
    </g>
  );
  const patch = () => pat !== "patch" ? null : (
    <ellipse cx={ex} cy={ey - 2} rx={rx * 0.42} ry={ry * 0.42} fill={p.main} />
  );
  const muzzle = () => pat !== "socks" ? null : <ellipse cx={0} cy={my + k} rx={13 * k} ry={8 * k} fill={C.white} />;
  const whisk = () => !d.whiskers ? null : (
    <g stroke={C.ink} strokeWidth={3} strokeLinecap="round">
      {[-1, 1].flatMap((k) => [0, 1].map((j) => <line key={`${k}${j}`} x1={k * rx * 0.62} y1={my - 6 + j * 10} x2={k * rx * 1.05} y2={my - 12 + j * 18} />))}
    </g>
  );
  const accEl = () => {
    const a = d.acc ?? "none";
    const ny = hy + ry * 0.85;
    if (a === "collar") return <g><path d={`M ${-bw * 0.55} ${ny + 4} Q 0 ${ny + 18} ${bw * 0.55} ${ny + 4}`} stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" /><circle cx={0} cy={ny + 20} r={8} fill={C.ink} /></g>;
    if (a === "scarf") return <g fill={sex === "male" ? C.ink : C.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round"><path d={`M ${-bw * 0.7} ${ny} Q 0 ${ny + 22} ${bw * 0.7} ${ny} L ${bw * 0.7} ${ny + 14} Q 0 ${ny + 36} ${-bw * 0.7} ${ny + 14} Z`} /><rect x={bw * 0.2} y={ny + 16} width={18} height={40} rx={5} /></g>;
    if (a === "bow") {
      const bx = sex === "female" ? -rx * 0.55 : 0, by = sex === "female" ? hy - ry * 0.8 : ny + 10;
      return <g fill={C.ink}><path d={`M ${bx} ${by} L ${bx - 18} ${by - 11} L ${bx - 18} ${by + 11} Z`} /><path d={`M ${bx} ${by} L ${bx + 18} ${by - 11} L ${bx + 18} ${by + 11} Z`} /><circle cx={bx} cy={by} r={5} /></g>;
    }
    return null;
  };

  return (
    <g transform={`translate(${x} ${foot}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={bw * 1.3} ry={9} fill={C.shadow} />
      {tailEl()}
      {body()}
      {belly()}
      {feet()}
      {d.ears !== "fold" && [ear(-1), ear(1)]}
      {headShape()}
      {stripes()}
      {d.ears === "fold" && [foldEar(-1), foldEar(1)]}
      {patch()}
      {muzzle()}
      {d.blush && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * (ex + 10 * k)} cy={ey + 11 * k} rx={5 * k} ry={3 * k} fill={BLUSH} />)}
      {eye(-1)}{eye(1)}
      {mouth()}
      {whisk()}
      {accEl()}
    </g>
  );
};

export const CAT_DESIGNS: { key: string; name: string; d: CatDesign }[] = [
  { key: "A", name: "ベーシック", d: { head: "round", ears: "point", body: "pear", eyes: "white", fill: "full" } },
  { key: "B", name: "もち", d: { head: "mochi", ears: "point", body: "bean", eyes: "dot", fill: "tint", blush: true, tail: "none" } },
  { key: "C", name: "ちび・線画", d: { head: "round", ears: "point", body: "bean", eyes: "big", fill: "outline", blush: true, chibi: true, tail: "none" } },
  { key: "D", name: "おにぎり", d: { head: "onigiri", ears: "point", body: "rect", eyes: "white", fill: "full", pattern: "belly" } },
  { key: "E", name: "たれ耳", d: { head: "round", ears: "fold", body: "bean", eyes: "dot", fill: "inkline", tail: "straight" } },
  { key: "F", name: "トラ柄", d: { head: "round", ears: "big", body: "pear", eyes: "white", fill: "full", pattern: "stripes", whiskers: true } },
  { key: "G", name: "だるま", d: { head: "mochi", ears: "point", body: "daruma", eyes: "white", fill: "full", pattern: "belly", tail: "none" } },
  { key: "H", name: "ぶち", d: { head: "round", ears: "point", body: "pear", eyes: "dot", fill: "tint", pattern: "patch" } },
  { key: "I", name: "四角", d: { head: "square", ears: "point", body: "rect", eyes: "big", fill: "inkline" } },
  { key: "J", name: "くつした", d: { head: "round", ears: "point", body: "pear", eyes: "white", fill: "full", pattern: "socks" } },
  { key: "K", name: "にっこり", d: { head: "mochi", ears: "point", body: "bean", eyes: "smile", fill: "full", blush: true, chibi: true, acc: "bow" } },
  { key: "L", name: "のっぽ", d: { head: "round", ears: "point", body: "tall", eyes: "dot", fill: "tint", tail: "straight", acc: "scarf" } },
];

const CW = 480, CH = 330, TOP = 80;

export const CatSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {CAT_DESIGNS.map((c, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x0 = col * CW, y0 = TOP + row * CH;
        return (
          <g key={c.key}>
            <rect x={x0 + 10} y={y0 + 6} width={CW - 20} height={CH - 12} rx={18} fill={C.white} stroke={C.paper2} strokeWidth={3} />
            <CatSketch d={c.d} sex="male" x={x0 + CW / 2 - 110} foot={y0 + CH - 34} s={c.d.body === "tall" ? 0.95 : 1.05} />
            <CatSketch d={c.d} sex="female" x={x0 + CW / 2 + 110} foot={y0 + CH - 34} s={c.d.body === "tall" ? 0.95 : 1.05} />
            <text x={x0 + 30} y={y0 + 50} style={{ fontFamily: FONT, fontSize: 34, fontWeight: 900, fill: C.ink }}>{c.key}</text>
            <text x={x0 + 66} y={y0 + 48} style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, fill: C.ink2 }}>{c.name}</text>
          </g>
        );
      })}
    </svg>
    <div style={{ position: "absolute", left: 30, top: 18, fontFamily: FONT, fontSize: 36, fontWeight: 900, color: C.ink }}>
      物語の主人公（猫）の素案　<span style={{ fontSize: 28, fontWeight: 700, color: C.ink2 }}>左：男性の色　右：女性の色　群衆は人型のまま</span>
    </div>
    <div style={{ position: "absolute", right: 120, top: 22, fontFamily: FONT, fontSize: 26, fontWeight: 700, color: C.ink2 }}>参考：ゴサ →</div>
    <Gosa cues={[[-60, "normal"]]} size={26} x={1870} foot={76} sfx={false} />
  </AbsoluteFill>
);
