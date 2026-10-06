// 物語の主人公（猫のサブキャラ）。2026-10-05 オーナー決定：素案F（トラ柄）、目と口はゴサと同じ形。
// 群衆（シミュレーション・データの人数）は人型の Figure のまま。寄って描く物語の場面だけ、この猫を使う。
// 決まり（docs/brand.md「物語の主人公」）：
//   - 形：丸い頭・大きめのとがった耳（内側は淡い色）・洋なし形の胴・丸い足先・くるんと巻いた尾。線は描かず、べた塗り。
//   - 模様：額に3本・胴の両脇に1本ずつのしま（同じ色の濃い色）、墨の細いひげ2本ずつ（ゴサのひげと違い、端に横棒を付けない）。
//   - 色：男性＝C.male、女性＝C.female、その他（世話役など）＝C.other。墨（ゴサの色）は使わない。
//   - 目と口：ゴサと同じ（白目に小さい墨の黒目、細い ω の口、鼻なし）。3〜5秒ごとにまばたき。
//   - 大きさは Figure と同じ物差し（size 1 で高さ約50px）。原点＝足元の中心。
import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";

export type CatKind = "male" | "female" | "other";
export type CatPose = "stand" | "sit" | "phone" | "walk" | "down";
export type CatFace = "normal" | "happy" | "sad" | "surprised" | "think" | "sleep"; // sleep：眠っている（閉じた目・ωの口。2026-10-06 4本目の車の後ろの席の子で足した）

const PAL: Record<CatKind, { main: string; dark: string; inner: string }> = {
  male: { main: C.male, dark: "#1E4C9E", inner: "#D6E2F7" },
  female: { main: C.female, dark: "#9E3A12", inner: "#FAD9C8" },
  other: { main: C.other, dark: "#5E5A53", inner: "#E6E1D8" },
};

// 形の数字（素案シート CatSheet.tsx の案Aと同じ。足元が 0、頭の上が約 -218）
const BW = 52, BH = 92, RX = 58, RY = 56, HY = -BH - RY * 0.55;
const K = RY / 32;            // ゴサの体（半径32）に対する頭の大きさ
const UNIT = 50 / 218;        // Figure の size 1（高さ約50）にそろえる

// まばたき：3〜5秒ごとに4フレーム（seed で猫ごとにずらす）
const blinking = (frame: number, seed: number) => {
  const period = 105 + (seed % 4) * 15;
  return (frame + seed * 37) % period < 4;
};

export const Cat: React.FC<{
  kind: CatKind; x: number; y: number; size?: number;
  pose?: CatPose; face?: CatFace;
  facing?: -1 | 0 | 1;  // 左右に少し向く（2匹で向き合うとき）
  look?: [number, number]; // 黒目の向き（-1〜1）
  phase?: number;       // 歩く足の位置（0〜1）
  label?: string;       // QA 用の名前
  seed?: number;        // まばたきをずらす
}> = ({ kind, x, y, size = 1, pose = "stand", face = "normal", facing = 0, look, phase = 0, label, seed = 0 }) => {
  const frame = useCurrentFrame();
  const p = PAL[kind];
  const fill = p.main;
  const f = facing;
  const down = pose === "down";
  const hy = HY + (pose === "phone" ? 6 : down ? 16 : 0);
  const fx = f * 7; // 顔のずれ
  const bob = pose === "walk" ? -Math.abs(Math.sin(phase * Math.PI * 2)) * 6 : 0;
  const eyesKind = face === "normal" && blinking(frame, seed + Math.round(x)) ? "blink" : face;
  const [lx, ly] = look ?? (pose === "phone" ? [0, 0.8] : down ? [0, 0.6] : [f * 0.6, 0]);

  // 耳：落ち込むと外へ倒れる
  const ear = (side: 1 | -1) => {
    const ex = side * RX * 0.62 + fx * 0.5, ey = hy - RY * 0.55;
    const w = RX * 0.34, h = RY * 0.95;
    const tilt = down ? side * 20 : face === "surprised" ? -side * 4 : 0;
    const tip = [ex + side * w * 0.45, ey - h];
    return (
      <g key={side} transform={`rotate(${tilt} ${ex} ${ey})`}>
        <path d={`M ${ex - w} ${ey + 8} L ${tip[0]} ${tip[1]} L ${ex + w} ${ey + 8} Z`} fill={fill} stroke={fill} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${ex - w * 0.5} ${ey} L ${tip[0] - side * 2} ${tip[1] + h * 0.35} L ${ex + w * 0.5} ${ey} Z`} fill={p.inner} />
      </g>
    );
  };

  // 目（ゴサの Eyes と同じ比率）
  const ey = hy - 4 * K, ex = 11 * K;
  const eye = (side: 1 | -1) => {
    const cx = side * ex + fx;
    switch (eyesKind) {
      case "happy": return <path key={side} d={`M ${cx - 7 * K} ${ey + 2 * K} q ${7 * K} ${-8 * K} ${14 * K} 0`} fill="none" stroke={C.white} strokeWidth={3.6 * K} strokeLinecap="round" />;
      case "sleep": return <path key={side} d={`M ${cx - 7 * K} ${ey} q ${7 * K} ${6 * K} ${14 * K} 0`} fill="none" stroke={C.white} strokeWidth={3.2 * K} strokeLinecap="round" />;
      case "blink": return <path key={side} d={`M ${cx - 6.5 * K} ${ey} h ${13 * K}`} stroke={C.white} strokeWidth={3.6 * K} strokeLinecap="round" />;
      case "surprised": return <g key={side}><circle cx={cx} cy={ey - 2 * K} r={9.5 * K} fill={C.white} /><circle cx={cx} cy={ey - 2 * K} r={3.5 * K} fill={C.ink} /></g>;
      case "sad": return <g key={side}><circle cx={cx} cy={ey + 2 * K} r={6.5 * K} fill={C.white} /><circle cx={cx + lx * 2 * K} cy={ey + 4 * K + ly * 1.5 * K} r={3.2 * K} fill={C.ink} />
        <path d={`M ${cx - side * 6 * K} ${ey - 12 * K} L ${cx + side * 7 * K} ${ey - 7 * K}`} stroke={p.dark} strokeWidth={3.2 * K} strokeLinecap="round" /></g>;
      case "think": return <g key={side}><path d={`M ${cx - 7 * K} ${ey - K} h ${14 * K} a ${7 * K} ${7 * K} 0 0 1 ${-14 * K} 0 z`} fill={C.white} /><circle cx={cx + 3 * K} cy={ey + 2 * K} r={3 * K} fill={C.ink} /></g>;
      default: return <g key={side}><circle cx={cx} cy={ey} r={7 * K} fill={C.white} /><circle cx={cx + K + lx * 2.5 * K} cy={ey + K + ly * 2.5 * K} r={3.5 * K} fill={C.ink} /></g>;
    }
  };
  const my = hy + 12 * K;
  const mouth = (() => {
    const s = { stroke: C.white, strokeWidth: 2.8 * K, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    const mx = fx;
    switch (face) {
      case "surprised": return <ellipse cx={mx} cy={my + 3 * K} rx={4 * K} ry={5 * K} fill={C.white} />;
      case "happy": return <path d={`M ${mx - 9 * K} ${my - 2 * K} q ${9 * K} ${12 * K} ${18 * K} 0 z`} fill={C.white} />;
      case "sad": return <path d={`M ${mx - 6 * K} ${my + 4 * K} q ${6 * K} ${-6 * K} ${12 * K} 0`} {...s} />;
      case "think": return <path d={`M ${mx - 5 * K} ${my + K} h ${10 * K}`} {...s} />;
      default: return <path d={`M ${mx - 6 * K} ${my} q ${3 * K} ${4 * K} ${6 * K} 0 q ${3 * K} ${4 * K} ${6 * K} 0`} {...s} />;
    }
  })();

  // 尾：向いている側の反対へ。落ち込むと床に垂れる
  const ts = f === 0 ? 1 : -f;
  const x0 = BW * 0.7, y0 = -16;
  const tail = down
    ? `M ${x0} ${y0 + 8} C ${x0 + 40} ${y0 + 14} ${x0 + 70} ${y0 + 14} ${x0 + 92} ${y0 + 6}`
    : `M ${x0} ${y0} C ${x0 + 60} ${y0 + 6} ${x0 + 66} ${y0 - 70} ${x0 + 30} ${y0 - 84}`;

  // 足先：歩くと交互に上がる
  const step = pose === "walk" ? Math.sin(phase * Math.PI * 2) * 16 : 0;
  const lean = pose === "walk" ? Math.sin(phase * Math.PI * 2) * 3 : 0;
  const feet = [-1, 1].map((k) => (
    <ellipse key={k} cx={k * BW * 0.42} cy={-7 - Math.max(0, k * step)} rx={17} ry={11} fill={fill} />
  ));

  // 前足：スマホを持つ・顔を覆う
  const paws = pose === "phone" ? (
    <g>
      <rect x={-16} y={-60} width={32} height={42} rx={6} fill={C.ink} />
      {[-1, 1].map((k) => <ellipse key={k} cx={k * 16} cy={-26} rx={12} ry={10} fill={fill} stroke={p.dark} strokeWidth={3} />)}
    </g>
  ) : null;

  return (
    <g data-qa="figure" data-qa-label={label ?? "猫"} transform={`translate(${x},${y + bob * size * UNIT}) scale(${size * UNIT}) rotate(${lean})`}>
      <ellipse cx={0} cy={2} rx={BW * 1.3} ry={9} fill={C.shadow} />
      <path d={tail} transform={`scale(${ts},1)`} fill="none" stroke={fill} strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${-0.45 * BW} ${-BH} C ${-1.0 * BW} ${-0.55 * BH} ${-1.05 * BW} 0 ${-0.6 * BW} 0 L ${0.6 * BW} 0 C ${1.05 * BW} 0 ${1.0 * BW} ${-0.55 * BH} ${0.45 * BW} ${-BH} Z`} fill={fill} />
      {feet}
      {ear(-1)}{ear(1)}
      {/* 胴のしま */}
      <g stroke={p.dark} strokeWidth={7} strokeLinecap="round">
        {[-1, 1].map((k) => <path key={k} d={`M ${k * BW * 0.75} ${-BH * 0.6} L ${k * BW * 0.35} ${-BH * 0.55}`} />)}
      </g>
      <ellipse cx={fx * 0.3} cy={hy} rx={RX} ry={RY} fill={fill} />
      {/* 額のしま */}
      <g stroke={p.dark} strokeWidth={7} strokeLinecap="round">
        {[-1, 0, 1].map((k) => <path key={k} d={`M ${fx * 0.3 + k * 16} ${hy - RY * 0.95} L ${fx * 0.3 + k * 13} ${hy - RY * 0.6}`} />)}
      </g>
      {/* ひげ（墨の細い線。ゴサと違い端に横棒なし） */}
      <g stroke={C.ink} strokeWidth={3} strokeLinecap="round">
        {[-1, 1].flatMap((k) => [0, 1].map((j) => <line key={`${k}${j}`} x1={fx + k * RX * 0.62} y1={my - 6 + j * 10 + (down ? 6 : 0)} x2={fx + k * RX * 1.05} y2={my - 12 + j * 18 + (down ? 14 : 0)} />))}
      </g>
      {eye(-1)}{eye(1)}
      {mouth}
      {paws}
    </g>
  );
};

/** 名札の代わりの文字（猫の頭の上）。高さを Cat と同じ物差しで返す */
export const catTop = (y: number, size: number) => y - 218 * UNIT * size;

export const CatLabel: React.FC<{ x: number; y: number; size: number; text: string; gap?: number }> = ({ x, y, size, text, gap = 24 }) => (
  <text x={x} y={catTop(y, size) - gap} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill={C.ink}>{text}</text>
);
