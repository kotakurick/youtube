// 両側のふるい（3本目「普通の相手」で作った。2026-10-06）。
// 左：女性が男性を選ぶふるい、右：男性が女性を選ぶふるい、下：両方を通った組。片側なら多く通るのに、両側を通るのは少ない、を1枚で見せる。
// 決まり：
//   - 人は Figure（男女の色）。通らない人は dim。100人＝1人1%。
//   - 割合は丸めた人数で描き、正確な値は場面の SourceNote・台本のメモに書く（面積＝量：1人＝1%で同じ大きさ）。
//   - 原点は左上。幅はおよそ 1700px、高さ 640px。
import React from "react";
import { Figure } from "./Figure";
import { hundred } from "./layout";
import { C, font, LINE, R } from "./theme";

export const TwoSieves: React.FC<{
  x: number; y: number;
  left: { pass: number; label: string }; right: { pass: number; label: string };
  both?: { pass: number; label: string }; // 両方を通った組（出さないときは省く）
  size?: number;
}> = ({ x, y, left, right, both, size = 0.62 }) => {
  const dx = 34, dy = 44;
  const grid = (ox: number, kind: "male" | "female", pass: number) =>
    hundred(100, { x: ox, bottom: y + 120 + 9 * dy, cols: 10, dx, dy }, size).map((p, i) => (
      <Figure key={i} kind={kind} x={p.x} y={p.y} size={size} dim={i >= pass} />
    ));
  const panel = (ox: number, t: string, pass: number) => (
    <g>
      <rect x={ox - 60} y={y} width={10 * dx + 100} height={78} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={ox + 5 * dx - 15} y={y + 52} textAnchor="middle" style={font("label")}>{t}</text>
      <text x={ox + 5 * dx - 15} y={y + 120 + 9 * dy + 70} textAnchor="middle" style={font("value")}>{`100人に${pass}人`}</text>
    </g>
  );
  const rx = x + 540;
  return (
    <g data-qa="mark" data-qa-label="両側のふるい">
      {panel(x, left.label, left.pass)}
      {grid(x, "male", left.pass)}
      {panel(rx, right.label, right.pass)}
      {grid(rx, "female", right.pass)}
      {both && (
        <g>
          <rect x={x + 1060} y={y} width={560} height={78} rx={R.md} fill={C.ink} />
          <text x={x + 1340} y={y + 52} textAnchor="middle" style={font("label", C.white)}>{both.label}</text>
          {hundred(100, { x: x + 1120, bottom: y + 120 + 9 * dy, cols: 10, dx: 46, dy }, size).map((p, i) => (
            <g key={i}>
              <Figure kind="male" x={p.x - 9} y={p.y} size={size * 0.8} dim={i >= both.pass} />
              <Figure kind="female" x={p.x + 9} y={p.y} size={size * 0.8} dim={i >= both.pass} />
            </g>
          ))}
          <text x={x + 1340} y={y + 120 + 9 * dy + 70} textAnchor="middle" style={font("value")}>{`100組に${both.pass}組`}</text>
        </g>
      )}
    </g>
  );
};
