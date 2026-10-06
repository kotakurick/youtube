// 対数のものさし（2026-10-06 6本目「どこからが浮気」で作った）。「2組に1組」から「10万組に1組」のように、
// 桁の違う確率を1本の線に並べ、ピンの距離で何倍違うかを見せる。左ほど起こりやすく、右ほどまれ。
// 目盛りは 1組に1組〜10万組に1組（10倍ごと）。pins：ピン（「n組に1組」の n、名前、色、上か下か）。
// span：2本のピンの間に括弧と文字（例：「約500倍」）。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type RulerPin = { n: number; label: string; color?: string; below?: boolean; strong?: boolean };
export const LogRuler: React.FC<{ x: number; y: number; width: number; pins: RulerPin[]; span?: { from: number; to: number; text: string }; maxPow?: number }> = (
  { x, y, width, pins, span, maxPow = 5 },
) => {
  const X = (n: number) => x + (Math.log10(n) / maxPow) * width;
  const ticks = Array.from({ length: maxPow + 1 }, (_, i) => 10 ** i);
  const name = (n: number) => (n >= 10000 ? `${n / 10000}万` : `${n}`);
  return (
    <g>
      <rect data-qa="mark" data-qa-label="ものさし" x={x - 20} y={y - 16} width={width + 40} height={32} rx={R.sm} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1={y - 16} x2={X(t)} y2={y + 16} stroke={C.ink} strokeWidth={LINE.thin} />
          <text x={X(t)} y={y + 64} textAnchor="middle" style={font("note", C.ink2)}>{`${name(t)}組に1組`}</text>
        </g>
      ))}
      {/* 両端の言葉は、ものさしの左右の外に（ピンと重ねない。2026-10-06） */}
      <text x={x - 36} y={y + 10} textAnchor="end" style={font("note", C.ink2)}>よく起きる</text>
      <text x={x + width + 36} y={y + 10} style={font("note", C.ink2)}>まれ</text>
      {span && (
        <g>
          <path d={`M${X(span.from)},${y + 96} v16 H${X(span.to)} v-16`} fill="none" stroke={C.ink} strokeWidth={LINE.base} />
          <text x={(X(span.from) + X(span.to)) / 2} y={y + 168} textAnchor="middle" style={font("value")}>{span.text}</text>
        </g>
      )}
      {pins.map((p) => {
        const px = X(p.n), up = !p.below, c = p.color ?? C.ink;
        const ty = up ? y - 110 : y + 230;
        return (
          <g key={p.label}>
            <line x1={px} y1={up ? y - 90 : y + 16} x2={px} y2={up ? y - 16 : y + 190} stroke={c} strokeWidth={p.strong ? LINE.heavy : LINE.base} />
            <circle cx={px} cy={y} r={p.strong ? 18 : 12} fill={c} />
            <text x={px} y={ty} textAnchor="middle" style={font(p.strong ? "value" : "label", c)}>{p.label}</text>
          </g>
        );
      })}
    </g>
  );
};
