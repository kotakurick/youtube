// 案内役ゴサ（動かせる版）。絵の正本は assets/characters/gosa/make_gosa.py で、その設定（gosa.json）を読んで描く。
// 表情が変わると、ひげの長さ・耳・傾きがなめらかに変わる（ひげの長さ＝確かさ）。目と口はその瞬間に切り替わる。
// 決まり（docs/brand.md）：
//   - 置き場所は右下の DOCK に固定（Z.dock）。大きさは体の直径で S96／M140／L220。
//   - 出入り：下から pop で出て、12f で下へ抜ける。表情が変わると4fだけ潰れる。3〜5秒ごとにまばたき。
//   - 吹き出しは4つだけ（Say 型）。声・鳴き声はない。
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import rig from "../../../assets/characters/gosa/gosa.json";
import { C, EASE, FONT, GOSA_SIZE, LINE, R, sp, useZ } from "./theme";
import type { Pt } from "./layout";
import { Sfx, SfxName } from "./Sfx";

export type Expression =
  | "normal" | "surprised" | "assertive" | "thinking" | "skeptical" | "depends"
  | "happy" | "down" | "panic" | "idea" | "point";

/** ゴサの吹き出しはこれだけ（2026-10-04 決定） */
export type Say = "答え合わせ。" | "ひげ、短め。" | "ひげ、のびます。" | "！";

type Cfg = {
  ears: keyof typeof rig.EAR_TIPS; L: number[]; dy?: number[]; bend?: number[]; eyes: string; look?: number[];
  mouth: string; marks?: string[]; tilt?: number; squash?: boolean; jitter?: boolean;
};
const EXPR = rig.expressions as unknown as Record<Expression, Cfg>;
const { BODY_R, WHISKER_Y, WHISKER_W, CAP } = rig;

// なめらかに変える数字
type Pose = { L: [number, number]; dy: [number, number]; bend: [number, number]; ear: number[]; tilt: number; squash: number };
const pose = (c: Cfg): Pose => {
  const [[lx, ly], [rx, ry]] = rig.EAR_TIPS[c.ears];
  return {
    L: [c.L[0], c.L[1]], dy: [c.dy?.[0] ?? 0, c.dy?.[1] ?? 0], bend: [c.bend?.[0] ?? 0, c.bend?.[1] ?? 0],
    ear: [lx, ly, rx, ry], tilt: c.tilt ?? 0, squash: c.squash ? 1 : 0,
  };
};
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * t;
  return {
    L: [m(a.L[0], b.L[0]), m(a.L[1], b.L[1])], dy: [m(a.dy[0], b.dy[0]), m(a.dy[1], b.dy[1])],
    bend: [m(a.bend[0], b.bend[0]), m(a.bend[1], b.bend[1])], ear: a.ear.map((v, i) => m(v, b.ear[i])),
    tilt: m(a.tilt, b.tilt), squash: m(a.squash, b.squash),
  };
};

// ---- 部品（make_gosa.py と同じ形） ----
const Whisker: React.FC<{ side: -1 | 1; length: number; dy: number; bend: number; jitter: number; ink: string }> = (
  { side, length, dy, bend, jitter, ink },
) => {
  const x0 = side * 20, y0 = WHISKER_Y, x1 = side * length, y1 = WHISKER_Y + dy;
  const st = { stroke: ink, strokeWidth: WHISKER_W, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  let line: React.ReactNode;
  if (jitter) {
    const pts = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      const j = i === 0 || i === 6 ? 0 : (i % 2 ? 5 : -5) * jitter;
      return `${x0 + (x1 - x0) * t} ${y0 + (y1 - y0) * t + j}`;
    });
    line = <polyline points={pts.join(" ")} {...st} />;
  } else {
    line = <path d={`M${x0} ${y0} Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + bend} ${x1} ${y1}`} {...st} />;
  }
  return <>{line}<line x1={x1} y1={y1 - CAP} x2={x1} y2={y1 + CAP} {...st} /></>;
};

const Eyes: React.FC<{ kind: string; look: number[]; ink: string; paper: string }> = ({ kind, look, ink, paper }) => {
  const [dx, dy] = look;
  const xs = [-11, 11];
  switch (kind) {
    case "normal": return <>{xs.map((x) => <g key={x}><circle cx={x} cy={-4} r={7} fill={paper} /><circle cx={x + 1 + dx} cy={-3 + dy} r={3.5} fill={ink} /></g>)}</>;
    case "big": return <>{xs.map((x) => <g key={x}><circle cx={x} cy={-6} r={10} fill={paper} /><circle cx={x + dx} cy={-6 + dy} r={3.5} fill={ink} /></g>)}</>;
    case "sparkle": return <>{xs.map((x) => <g key={x}><circle cx={x} cy={-6} r={9.5} fill={paper} /><circle cx={x} cy={-5} r={4.5} fill={ink} /><circle cx={x + 1.6} cy={-6.8} r={1.6} fill={paper} /></g>)}</>;
    case "happy": return <path d="M-18 -2 q7 -8 14 0 M4 -2 q7 -8 14 0" stroke={paper} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case "flat": return <path d="M-18 -4 h13 M5 -4 h13" stroke={paper} strokeWidth={4.5} strokeLinecap="round" />;
    case "half": return <>{xs.map((x) => <g key={x}><path d={`M${x - 7} -5 h14 a7 7 0 0 1 -14 0 z`} fill={paper} /><circle cx={x + dx} cy={-1.5} r={3} fill={ink} /></g>)}</>;
    case "sad": return <>{xs.map((x) => <g key={x}><circle cx={x} cy={-2} r={6.5} fill={paper} /><circle cx={x} cy={1} r={3.2} fill={ink} /></g>)}
      <path d="M-19 -13 L-6 -17 M19 -13 L6 -17" stroke={paper} strokeWidth={3.5} strokeLinecap="round" /></>;
    case "dots": return <><circle cx={-14} cy={-4} r={3.6} fill={paper} /><circle cx={14} cy={-4} r={3.6} fill={paper} /></>;
    default: throw new Error(`Gosa: 目の種類 ${kind} がありません`);
  }
};

const Mouth: React.FC<{ kind: string; paper: string }> = ({ kind, paper }) => {
  const s = { stroke: paper, strokeWidth: 2.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "w": return <path d="M-6 12 q3 4 6 0 q3 4 6 0" {...s} />;
    case "o": return <ellipse cx={0} cy={15} rx={4} ry={5} fill={paper} />;
    case "line": return <path d="M-5 13 h10" {...s} />;
    case "wavy": return <path d="M-8 14 q2 -3 4 0 q2 3 4 0 q2 -3 4 0 q2 3 4 0" {...s} />;
    case "smile": return <path d="M-9 10 q9 12 18 0 z" fill={paper} />;
    case "frown": return <path d="M-6 16 q6 -6 12 0" {...s} />;
    case "open": return <path d="M-7 10 q7 10 14 0 z" fill={paper} />;
    default: throw new Error(`Gosa: 口の種類 ${kind} がありません`);
  }
};

/** 体の外の記号。sx=-1 なら左右反対の側に出す（記号そのものは反転しない） */
const Mark: React.FC<{ kind: string; sx: number; ink: string; paper: string }> = ({ kind, sx, ink, paper }) => {
  const star = "M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z";
  switch (kind) {
    case "!": return <g transform={`translate(${46 * sx},-66)`}><rect x={-4} y={-22} width={8} height={24} rx={4} fill={ink} /><circle cx={0} cy={10} r={4.5} fill={ink} /></g>;
    case "?": return <g transform={`translate(${48 * sx},-64)`}><path d="M-9 -12 q0 -12 10 -12 q10 0 10 10 q0 7 -10 11 v6" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" /><circle cx={1} cy={15} r={4} fill={ink} /></g>;
    case "sweat": return <path transform={`scale(${sx},1)`} d="M44 -40 q9 13 0 19 q-9 -6 0 -19 z" fill={paper} stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />;
    case "sparkle": return <><path transform={`translate(${48 * sx},-62)`} d={star} fill={ink} /><path transform={`translate(${-50 * sx},-60) scale(.6)`} d={star} fill={ink} /></>;
    case "idea": return <>{[-40, -20, 0, 20, 40].map((a) => <line key={a} x1={0} y1={-74} x2={0} y2={-88} stroke={ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${a})`} />)}</>;
    default: return null;
  }
};

// まばたきの時刻（3〜5秒ごと、毎回同じ）
const blinking = (frame: number, fps: number) => {
  let t = Math.round(fps * 1.3), k = 1;
  while (t <= frame) {
    if (frame - t < 2) return true;
    k = (k * 48271) % 2147483647;
    t += Math.round(fps * (3 + (k % 1000) / 500));
  }
  return false;
};
const BLINKS = new Set(["normal", "big", "sparkle", "half", "sad"]);

// 表情ごとの効果音（ない表情は鳴らさない）
const SOUND: Partial<Record<Expression, SfxName>> = {
  surprised: "gosa-surprised", assertive: "gosa-assertive", depends: "gosa-depends",
  skeptical: "gosa-skeptical", idea: "gosa-idea", panic: "gosa-panic",
};

export const Gosa: React.FC<{
  /** [開始フレーム, 表情] を時刻順に。最初の cue のフレームで登場する。 */
  cues: [number, Expression][];
  size?: keyof typeof GOSA_SIZE | number; // 体の直径（S/M/L か px）
  x?: number; foot?: number;              // 足元の位置。ふだんは DOCK のまま
  exit?: number;                          // 下へ抜けるフレーム
  flip?: boolean;                         // 左向き（左にあるものを指すとき）
  dark?: boolean;                         // 暗い背景用（白い体に墨の目）
  says?: [number, Say][];                 // 吹き出し（1.5秒ずつ出る）
  reachTo?: Pt;                           // 「point」のとき、右のひげの先をこの点まで伸ばす
  sfx?: boolean;                          // 表情の効果音（30秒に1回まで）
  bubble?: [number, number];              // 吹き出しのしっぽの先（足元から、体の直径を1とした位置）
}> = ({ cues, size = "M", x: xProp, foot: footProp, exit, flip: flipProp = false, dark = false, says = [], reachTo, sfx = true,
  bubble = [-0.55, -1.55] }) => {
  const frame = useCurrentFrame();
  const { fps, width: VW, height: VH } = useVideoConfig();
  const Z = useZ();
  const x = xProp ?? Z.dock.x, foot = footProp ?? Z.dock.foot;
  if (!cues.length || frame < cues[0][0]) return null;
  if (exit !== undefined && frame > exit + 12) return null;

  const d = typeof size === "number" ? size : GOSA_SIZE[size];
  const k = d / (BODY_R * 2);
  // 指す点が左にあれば、左を向く
  const flip = reachTo && cues.some(([, e]) => e === "point") ? reachTo.x < x : flipProp;
  const sx = flip ? -1 : 1;
  let idx = 0;
  cues.forEach(([f], i) => { if (frame >= f) idx = i; });
  const [since, expr] = cues[idx];
  const cfgOf = (e: Expression) => {
    const c = EXPR[e];
    if (!c) throw new Error(`Gosa: 表情 ${e} がありません`);
    if (e === "point" && reachTo) {
      // 右のひげの先を、指す点に届かせる（傾きはなくす）
      const lx = ((reachTo.x - x) / k) * sx, ly = (reachTo.y - foot) / k + 52;
      return { ...c, L: [c.L[0], Math.max(40, lx)], dy: [c.dy?.[0] ?? 0, ly - WHISKER_Y], tilt: 0 };
    }
    return c;
  };
  const cfg = cfgOf(expr);
  const prev = idx > 0 ? cfgOf(cues[idx - 1][1]) : cfg;
  const tPose = interpolate(frame - since, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const p = mix(pose(prev), pose(cfg), tPose);

  // 出入り・潰れ・跳ね
  const enter = sp("pop", frame - cues[0][0], fps);
  const leave = exit === undefined ? 0 : interpolate(frame - exit, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const dt = frame - since;
  const squashT = idx > 0 && dt < 4 ? Math.sin((dt / 4) * Math.PI) : 0;
  let hop = 0, pre = 0;
  if (expr === "surprised" && idx > 0) {
    if (dt < 3) pre = Math.sin((dt / 3) * Math.PI) * 0.08;
    else if (dt < 15) hop = Math.sin(((dt - 3) / 12) * Math.PI) * 30;
  }
  const scX = 1 + 0.06 * squashT + 0.04 * pre, scY = 1 - 0.08 * squashT - 0.08 * pre;
  const dropY = (1 - enter) * (d * 1.6 + 60) + leave * (d * 1.6 + 60);

  const ink = dark ? C.white : C.ink;   // 体の色
  const paper = dark ? C.ink : C.white; // 目・口の色
  const eyes = BLINKS.has(cfg.eyes) && blinking(frame, fps) ? "flat" : cfg.eyes;
  const jitter = cfg.jitter ? (Math.floor(frame / 3) % 2 ? 1 : -1) : 0;
  const legY = 52 - 6 * p.squash;
  const [elx, ely, erx, ery] = p.ear;

  const body = (
    <>
      <Whisker side={-1} length={p.L[0]} dy={p.dy[0]} bend={p.bend[0]} jitter={jitter} ink={ink} />
      <Whisker side={1} length={p.L[1]} dy={p.dy[1]} bend={p.bend[1]} jitter={-jitter} ink={ink} />
      <path d={`M-16 30 V${legY} M16 30 V${legY}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />
      <g transform={`translate(0,${4 * p.squash}) scale(${1 + 0.06 * p.squash},${1 - 0.08 * p.squash})`}>
        <path d={`M-28 -12 L${elx} ${ely} L-6 -28 Z M28 -12 L${erx} ${ery} L6 -28 Z`} fill={ink} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        <circle r={BODY_R} fill={ink} />
        <Eyes kind={eyes} look={cfg.look ?? [0, 0]} ink={ink} paper={paper} />
        <Mouth kind={cfg.mouth} paper={paper} />
      </g>
    </>
  );

  // 吹き出し（いま出ているもの）
  const say = [...says].reverse().find(([f]) => frame >= f && frame < f + 45);
  const bubbleT = say ? sp("pop", frame - say[0], fps) : 0;

  // 効果音：前に鳴らしてから30秒たっていない表情は鳴らさない
  const sounds: [number, SfxName][] = [];
  if (sfx) {
    let last = -Infinity;
    for (const [f, e] of cues) {
      const name = SOUND[e];
      if (name && f - last >= 30 * fps) { sounds.push([f, name]); last = f; }
    }
  }

  return (
    <>
    {sounds.map(([f, name]) => <Sfx key={f} name={name} at={f} volume={0.5} />)}
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <g transform={`translate(${x},${foot + dropY - hop})`}>
        <g transform={`scale(${k * scX},${k * scY}) translate(0,${-legY})`}>
          <g transform={`scale(${sx},1) rotate(${p.tilt})`}>{body}</g>
          {(cfg.marks ?? []).map((m) => <Mark key={m} kind={m} sx={sx} ink={dark ? C.white : C.ink} paper={C.white} />)}
        </g>
        {say && (
          <g transform={`translate(${d * bubble[0]},${d * bubble[1]}) scale(${bubbleT})`}>
            <Bubble text={say[1]} />
          </g>
        )}
      </g>
    </svg>
    </>
  );
};

/** 吹き出し（右下にしっぽ。原点＝しっぽの先） */
const Bubble: React.FC<{ text: Say }> = ({ text }) => {
  const fs = 40, w = text.length * fs + 56, h = 76, top = -h - 20;
  const st = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinejoin: "round" as const };
  return (
    <g>
      <path d="M-58 -24 L0 0 L-30 -24 Z" fill={C.white} {...st} />
      <rect x={-w} y={top} width={w} height={h} rx={R.md} fill={C.white} {...st} />
      <path d="M-56 -22.5 L-32 -22.5 L-32 -18 L-56 -18 Z" fill={C.white} />
      <text x={-w / 2} y={top + h / 2 + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={C.ink}>{text}</text>
    </g>
  );
};
