// 群衆の1人。丸い頭＋胴。男女は色だけでなく胴の形でも見分ける。
// 男女の面積はそろえる（誇張しない）：男性＝幅22の角丸、女性＝上16・裾26の台形。「その他・無回答」は丸い胴。
// 姿勢（pose）を変えられる：立つ・座る・スマホを見る・うつむく（頭を抱える）・歩く。facing で左右に少し向く（2人で向き合うとき）。
// 腕や脚は胴と同じ色の太い線で足すだけで、形の決まり（丸い頭＋胴）は変えない。
import React from "react";
import { C, FONT, LINE } from "./theme";

export type Kind = "male" | "female" | "other";
export type Pose = "stand" | "sit" | "phone" | "headInHands" | "walk";
/** 年代：子ども（小さく、頭が大きめ）／大人／高齢（少し前かがみで杖） */
export type Age = "child" | "adult" | "elder";

export const kindColor = (kind: Kind, dim = false) =>
  dim ? (kind === "male" ? C.maleTint : kind === "female" ? C.femaleTint : C.otherTint)
    : (kind === "male" ? C.male : kind === "female" ? C.female : C.other);

/** 胴（上端 top〜下端 bottom）。立ち姿は top=-25, bottom=5 */
const Body: React.FC<{ kind: Kind; top: number; bottom: number }> = ({ kind, top, bottom }) => {
  const h = bottom - top;
  if (kind === "male") return <rect x={-11} y={top} width={22} height={h} rx={8} />;
  if (kind === "female") {
    // 立ち姿の形（上16・裾26）を、高さ h に合わせて縮める
    const k = h / 30;
    return <path transform={`translate(0,${top}) scale(1,${k})`}
      d="M-8 0 h16 q2 0 2.4 2 l4.4 25 q0.4 3 -2.6 3 h-22.4 q-3 0 -2.6 -3 l4.4 -25 q0.4 -2 2.4 -2 z" />;
  }
  return <ellipse cx={0} cy={(top + bottom) / 2} rx={13} ry={h / 2} />;
};

/** 姿勢ごとの頭・胴・手足（原点＝足元の中心） */
const Posed: React.FC<{ kind: Kind; pose: Pose; facing: number; phase: number; fill: string }> = ({ kind, pose, facing, phase, fill }) => {
  const hx = 3 * facing;
  const limb = { stroke: fill, strokeWidth: 6, strokeLinecap: "round" as const, fill: "none" };
  switch (pose) {
    case "sit":
      // 座る（椅子に）：頭と胴が下がり、太ももが前に出て、すねが床へ。座面の高さは 9（Props の Chair と同じ）
      return (
        <>
          <circle cx={hx} cy={-34} r={9} />
          <Body kind={kind} top={-24} bottom={-6} />
          <rect x={-13} y={-12} width={26} height={8} rx={4} />
          <path d="M-8 -6 V4 M8 -6 V4" {...limb} />
        </>
      );
    case "phone":
      // スマホを見る：頭が少し下がり、胸の前にスマホ（墨）
      return (
        <>
          <circle cx={hx} cy={-34} r={9} />
          <Body kind={kind} top={-25} bottom={5} />
          <path d="M-9 -12 L-3 -16 M9 -12 L3 -16" {...limb} />
          <rect x={-6} y={-24} width={12} height={17} rx={2.5} fill={C.ink} />
          <rect x={-4} y={-22} width={8} height={11} rx={1} fill={C.paper2} />
        </>
      );
    case "headInHands":
      // うつむく：頭が深く下がり、両手で顔を覆う
      return (
        <>
          <circle cx={hx} cy={-29} r={9} />
          <Body kind={kind} top={-22} bottom={5} />
          <path d="M-10 -15 L-4 -26 M10 -15 L4 -26" {...limb} strokeWidth={7} />
        </>
      );
    case "walk": {
      // 歩く：胴が少し上がり、2本の脚が交互に開く（phase は 0〜1 で1歩）
      const s = Math.sin(phase * Math.PI * 2) * 6;
      return (
        <>
          <circle cx={hx + 1} cy={-37} r={9} />
          <Body kind={kind} top={-26} bottom={-3} />
          <path d={`M-4 -5 L${-4 - s} 4 M4 -5 L${4 + s} 4`} {...limb} />
        </>
      );
    }
    default:
      return (
        <>
          <circle cx={hx} cy={-36} r={9} />
          <Body kind={kind} top={-25} bottom={5} />
        </>
      );
  }
};

/** 原点＝足元の中心。頭の上は -45、足元は +5。 */
export const Figure: React.FC<{
  kind: Kind; x: number; y: number; size?: number; opacity?: number;
  dim?: boolean;        // 話の対象外（薄い色。opacity では薄くしない）
  highlight?: boolean;  // 追う1人（○番さん）：輪で囲んで1.25倍
  label?: string;       // 追う1人の名札（例：「27番さん（32）」）
  color?: string;
  pose?: Pose;
  facing?: -1 | 0 | 1;  // 左右に少し向く（2人で向き合うとき）
  phase?: number;       // 歩く姿勢の足の位置（0〜1）
  age?: Age;
}> = ({ kind, x, y, size = 1, opacity = 1, dim = false, highlight = false, label, color, pose = "stand", facing = 0, phase = 0, age = "adult" }) => {
  const fill = color ?? kindColor(kind, dim);
  const s = highlight ? size * 1.25 : size;
  const bob = pose === "walk" ? -Math.abs(Math.sin(phase * Math.PI * 2)) * 2 : 0;
  return (
    <g data-qa="figure" data-qa-label={label ?? "人型"} data-qa-allow={highlight ? "figure" : undefined} transform={`translate(${x},${y + bob * size}) scale(${s})`} opacity={opacity}>
      {highlight && (
        <>
          <circle cx={0} cy={-20} r={36} fill="none" stroke={C.bg} strokeWidth={12} />
          <circle cx={0} cy={-20} r={36} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
        </>
      )}
      <g fill={fill}>
        {age === "child" ? (
          // 子ども：大人の0.68倍。頭は少し大きめ（足元はそのまま）
          <g transform="scale(0.68)"><Posed kind={kind} pose={pose} facing={facing} phase={phase} fill={fill} />
            <circle cx={3 * facing} cy={pose === "sit" ? -34 : -36} r={10.5} /></g>
        ) : age === "elder" ? (
          // 高齢：頭が少し前に出て、杖（墨）をつく
          <g>
            <g transform="translate(1,1.5) skewX(-4)"><Posed kind={kind} pose={pose} facing={facing} phase={phase} fill={fill} /></g>
            {pose !== "sit" && <path d="M13 -14 Q17 -16 17 -12 L18 5" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />}
          </g>
        ) : <Posed kind={kind} pose={pose} facing={facing} phase={phase} fill={fill} />}
      </g>
      {highlight && label && (
        <g transform="translate(0,-70)" data-qa-allow="figure">
          <rect x={-label.length * 11 - 14} y={-22} width={label.length * 22 + 28} height={40} rx={20} fill={C.ink} />
          <text x={0} y={7} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.white}>{label}</text>
        </g>
      )}
    </g>
  );
};
