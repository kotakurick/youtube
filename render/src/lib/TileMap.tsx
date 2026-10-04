// 日本地図（47都道府県を同じ大きさの角丸の四角で並べるタイル地図）。色は墨の5段階（男女の色は使わない）。
// focus の県は蛍光ペンの縁で囲み、名前と値を大きく出す。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, font, LINE, R } from "./theme";

/** [県名, 列, 行]（北海道が右上、沖縄が左下） */
export const PREFS: [string, number, number][] = [
  ["北海道", 12, 0], ["青森", 11, 2], ["秋田", 10, 3], ["岩手", 11, 3],
  ["石川", 7, 4], ["富山", 8, 4], ["新潟", 9, 4], ["山形", 10, 4], ["宮城", 11, 4],
  ["福井", 6, 5], ["岐阜", 7, 5], ["長野", 8, 5], ["群馬", 9, 5], ["栃木", 10, 5], ["福島", 11, 5],
  ["島根", 2, 6], ["鳥取", 3, 6], ["兵庫", 4, 6], ["京都", 5, 6], ["滋賀", 6, 6], ["愛知", 7, 6], ["山梨", 8, 6], ["埼玉", 9, 6], ["茨城", 10, 6],
  ["山口", 1, 7], ["広島", 2, 7], ["岡山", 3, 7], ["大阪", 4, 7], ["奈良", 5, 7], ["三重", 6, 7], ["静岡", 7, 7], ["神奈川", 8, 7], ["東京", 9, 7], ["千葉", 10, 7],
  ["佐賀", 0, 8], ["福岡", 1, 8], ["愛媛", 2, 8], ["香川", 3, 8], ["徳島", 4, 8], ["和歌山", 5, 8],
  ["長崎", 0, 9], ["熊本", 1, 9], ["大分", 2, 9], ["高知", 3, 9],
  ["鹿児島", 0, 10], ["宮崎", 1, 10],
  ["沖縄", 0, 11.4],
];
/** 墨の5段階（薄い→濃い） */
export const SHADES = ["#E2DDD0", "#B9B8B5", "#8A8D96", "#565C6C", C.ink];

export const TileMap: React.FC<{
  values: Record<string, number>; x: number; y: number; tile?: number; breaks: [number, number, number, number];
  focus?: string; format?: (v: number) => string; start?: number; legend?: string;
}> = ({ values, x, y, tile = 52, breaks, focus, format = (v) => `${v}`, start = 0, legend }) => {
  const missing = PREFS.filter(([n]) => values[n] === undefined).map(([n]) => n);
  if (missing.length) throw new Error(`TileMap: 値のない県があります：${missing.join("、")}`);
  const frame = useCurrentFrame() - start;
  const { width, height } = useVideoConfig();
  const step = tile + 4;
  const shade = (v: number) => SHADES[breaks.filter((b) => v >= b).length];
  const f = PREFS.find(([n]) => n === focus);
  const ft = interpolate(frame - 45, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      {PREFS.map(([n, c, r], i) => {
        // 北から順に塗る
        const t = interpolate(frame - (r * 3 + c * 0.6), [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <rect key={n} data-qa="mark" data-qa-label={n} x={x + c * step} y={y + r * step} width={tile} height={tile} rx={R.sm} fill={shade(values[n])} opacity={t} />;
      })}
      {f && ft > 0 && (
        <g>
          <rect x={x + f[1] * step - 6} y={y + f[2] * step - 6} width={tile + 12} height={tile + 12} rx={R.sm + 4}
            fill="none" stroke={C.marker} strokeWidth={LINE.heavy} opacity={ft} />
          <rect x={x + f[1] * step - 6} y={y + f[2] * step - 6} width={tile + 12} height={tile + 12} rx={R.sm + 4}
            fill="none" stroke={C.ink} strokeWidth={LINE.thin} opacity={ft} />
          <text x={x + 13.5 * step} y={y + 7 * step} style={font("value")} opacity={ft}>{f[0]}</text>
          <text x={x + 13.5 * step} y={y + 7 * step + 76} style={font("value")} opacity={ft}>{format(values[f[0]])}</text>
        </g>
      )}
      {/* 凡例 */}
      <g transform={`translate(${x + 4 * step},${y + 10 * step})`}>
        {legend && <text x={0} y={-12} style={font("note", C.ink2)}>{legend}</text>}
        {SHADES.map((s, i) => (
          <g key={s} transform={`translate(${i * 116},0)`}>
            <rect data-qa="mark" data-qa-label="凡例" width={104} height={28} rx={6} fill={s} />
            <text x={52} y={64} textAnchor="middle" style={font("note", C.ink2)}>{i === 0 ? `〜${format(breaks[0])}` : `${format(breaks[i - 1])}〜`}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};
