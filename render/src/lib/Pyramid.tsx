// 人口ピラミッド（年齢の区分ごとの男女の人数）。上が高い年齢、左が男性・右が女性（男女の左右は固定）。
// ages・male・female は若い順に渡す（画面では上が高い年齢になる）。
// left を渡すと、相手が見つからずに残った人数を、各棒の外側に濃い色で重ねて見せる（ageMatch の結果）。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, R } from "./theme";

export const Pyramid: React.FC<{
  ages: string[]; male: number[]; female: number[]; max: number; x: number; y: number; width: number; height: number;
  maleLeft?: number[]; femaleLeft?: number[]; unit?: string; start?: number; showValues?: boolean;
}> = ({ ages, male, female, max, x, y, width, height, maleLeft, femaleLeft, unit = "", start = 0, showValues = false }) => {
  const frame = useCurrentFrame() - start;
  const { width: VW, height: VH } = useVideoConfig();
  const p = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const q = interpolate(frame - 50, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const mid = x + width / 2, labelW = 140, half = width / 2 - labelW / 2 - (showValues ? 110 : 10);
  const rows = ages.length, rh = height / rows, bh = Math.max(8, rh * 0.72);
  const W_ = (v: number) => (v / max) * half;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
      <text x={mid - labelW / 2 - 10} y={y - 20} textAnchor="end" style={font("label", C.male)}>男性</text>
      <text x={mid + labelW / 2 + 10} y={y - 20} style={font("label", C.female)}>女性</text>
      {ages.map((_, k) => {
        const i = rows - 1 - k; // 上が高い年齢（ages・male・female は若い順に渡す）
        const a = ages[i];
        const cy = y + k * rh + rh / 2;
        const wm = W_(male[i]) * p, wf = W_(female[i]) * p;
        const lm = maleLeft ? W_(maleLeft[i]) * q : 0, lf = femaleLeft ? W_(femaleLeft[i]) * q : 0;
        return (
          <g key={a}>
            {(rh >= 34 || k % 2 === 0) && <text x={mid} y={cy + 12} textAnchor="middle" style={font(rh >= 34 ? "label" : "note", C.ink2)}>{a}</text>}
            <rect data-qa="mark" data-qa-label={`男性 ${a}`} x={mid - labelW / 2 - wm} y={cy - bh / 2} width={wm} height={bh} rx={R.sm / 2} fill={maleLeft ? C.maleTint : C.male} />
            <rect data-qa="mark" data-qa-label={`女性 ${a}`} x={mid + labelW / 2} y={cy - bh / 2} width={wf} height={bh} rx={R.sm / 2} fill={femaleLeft ? C.femaleTint : C.female} />
            {lm > 0 && <rect x={mid - labelW / 2 - wm} y={cy - bh / 2} width={lm} height={bh} rx={R.sm / 2} fill={C.male} />}
            {lf > 0 && <rect x={mid + labelW / 2 + wf - lf} y={cy - bh / 2} width={lf} height={bh} rx={R.sm / 2} fill={C.female} />}
            {showValues && <text x={mid - labelW / 2 - wm - 12} y={cy + 12} textAnchor="end" style={font("note")} opacity={p}>{Math.round(male[i])}{unit}</text>}
            {showValues && <text x={mid + labelW / 2 + wf + 12} y={cy + 12} style={font("note")} opacity={p}>{Math.round(female[i])}{unit}</text>}
          </g>
        );
      })}
      {(maleLeft || femaleLeft) && <text x={x} y={y + height + 50} style={font("note", C.ink2)} opacity={q}>濃い色＝相手が見つからずに残った人</text>}
    </svg>
  );
};
