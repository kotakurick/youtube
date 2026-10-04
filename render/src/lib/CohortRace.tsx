// 年齢ごとの割合で1年ずつ進めた2つ（以上）の100人を並べる。起きた人（例：結婚した人）から色が付く。
// 上に「○年目」、各群の下に「○人」。数字は sim/cohort.ts で計算する。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Kind } from "./Figure";
import { hundred } from "./layout";
import { doneBy } from "./sim/cohort";
import { C, font } from "./theme";

export const CohortRace: React.FC<{
  groups: { label: string; startAge: number; events: (number | null)[] }[]; kinds: Kind[]; years: number;
  x: number; y: number; perYear?: number; start?: number; size?: number; verb?: string;
}> = ({ groups, kinds, years, x, y, perYear = 20, start = 0, size = 0.8, verb = "結婚" }) => {
  const frame = useCurrentFrame() - start;
  const { width, height } = useVideoConfig();
  const yr = Math.max(-1, Math.min(years - 1, Math.floor(frame / perYear))); // -1＝まだ始まっていない
  const gw = 520, size_ = size, dy = 48, gridTop = y + 170;
  return (
    <>
      {/* 年は右に大きく。各群の名前と人数は群の上に置く（下に置くと字幕の帯にかかる） */}
      <div style={{ position: "absolute", left: x + groups.length * gw, top: y + 250, ...font("hero"), fontSize: 150, whiteSpace: "nowrap" }}>{yr < 0 ? "0" : yr + 1}<span style={{ fontSize: 75 }}>年目</span></div>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {groups.map((g, gi) => {
          const pts = hundred(g.events.length, { x: x + gi * gw + 20, bottom: gridTop + 9 * dy + 45 * size_, cols: 10, dx: 46, dy }, size_);
          return pts.map((p, i) => {
            const e = g.events[i];
            return <Figure key={`${gi}-${i}`} kind={kinds[i]} x={p.x} y={p.y} size={size_} dim={!(e !== null && e <= yr)} />;
          });
        })}
      </svg>
      {groups.map((g, gi) => (
        <div key={g.label} style={{ position: "absolute", left: x + gi * gw, top: y, width: gw - 40 }}>
          <div style={{ ...font("label", C.ink2), whiteSpace: "nowrap" }}>{g.label}</div>
          <div style={{ ...font("value"), whiteSpace: "nowrap" }}>{verb} {yr < 0 ? 0 : doneBy(g.events, yr)}人
            {yr >= 0 && <span style={{ ...font("note", C.ink2), marginLeft: 12 }}>いま{g.startAge + yr}歳</span>}</div>
        </div>
      ))}
    </>
  );
};
