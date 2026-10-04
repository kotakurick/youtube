// 条件を1つずつ重ねて、100人が減っていく場面。左に100人（10×10）、右に条件の札。
// 1つの条件ごとに、満たさない人が薄い色になり、札に「残り○人」が出る。仮定（独立か相関か）は note で画面に出す。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Kind } from "./Figure";
import { hundred } from "./layout";
import type { FilterStep } from "./sim/filter";
import { C, font, R, sp } from "./theme";

export const FilterSteps: React.FC<{
  steps: FilterStep[]; kinds: Kind[]; x: number; y: number; every?: number; start?: number; note?: string; size?: number;
}> = ({ steps, kinds, x, y, every = 60, start = 0, note, size = 1.1 }) => {
  const frame = useCurrentFrame() - start;
  const { fps, width, height } = useVideoConfig();
  const k = Math.min(steps.length, Math.floor(frame / every)); // いま何個目の条件まで重ねたか（0＝まだ）
  const pass = k === 0 ? kinds.map(() => true) : steps[k - 1].pass;
  const pts = hundred(kinds.length, { x: x + 20, bottom: y + 9 * 66 + 50, cols: 10, dx: 50, dy: 66 }, size);
  const panelX = x + 560;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {pts.map((p, i) => <Figure key={i} kind={kinds[i]} x={p.x} y={p.y} size={size} dim={!pass[i]} />)}
      </svg>
      <div style={{ position: "absolute", left: panelX, top: y, display: "flex", flexDirection: "column", gap: 18 }}>
        {steps.map((s, i) => {
          const t = sp("enter", frame - (i + 1) * every, fps);
          const on = i < k;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 24, opacity: on ? 1 : 0.0 + t,
              transform: `translateX(${(1 - Math.min(1, t)) * 24}px)` }}>
              <div style={{ ...font("label"), background: i === k - 1 ? C.white : C.paper2, border: `4px solid ${i === k - 1 ? C.ink : "transparent"}`,
                borderRadius: R.md, padding: "8px 20px", minWidth: 360 }}>{s.label}</div>
              {on && <div style={font("label", i === k - 1 ? C.ink : C.ink2)}>→ 残り {s.left}人</div>}
            </div>
          );
        })}
      </div>
      {note && <div style={{ position: "absolute", left: panelX, top: y + steps.length * 92 + 20, ...font("note", C.ink2) }}>{note}</div>}
    </>
  );
};
