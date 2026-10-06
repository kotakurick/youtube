// 年齢ごとの割合で1年ずつ進めた2つ（以上）の100人を並べる。起きた人（例：結婚した人）から色が付く。
// 上に「○年目」、各群の下に「○人」。数字は sim/cohort.ts で計算する。
// mode="leave"（4本目で足した。2026-10-06）：起きた人（例：別れた夫婦）が列から抜けていく。抜けた所は点線の跡が残る。
//   残った人は focus（例：満足していない）なら濃い色、ほかは淡い色。上に「抜けた ○人」と「残った ○人のうち、<focusName> ○人（○%）」。
//   人数を例で置くときは、場面に SimBackground と SourceNote sim（説明の図・人数は例）を付ける。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Kind } from "./Figure";
import { hundred } from "./layout";
import { doneBy } from "./sim/cohort";
import { C, EASE, font, LINE } from "./theme";

export const CohortRace: React.FC<{
  groups: { label: string; startAge: number; events: (number | null)[]; focus?: boolean[] }[]; kinds: Kind[]; years: number;
  x: number; y: number; perYear?: number; start?: number; size?: number; verb?: string;
  mode?: "join" | "leave";   // join：起きた人に色が付く（既定）／leave：起きた人が列から抜ける
  focusName?: string;        // leave のとき、残った人のうち濃い色の人の呼び名（「満足していない」）
  unit?: string;             // 「人」「組」
  cols?: number; dx?: number; dy?: number; // 並べ方（既定は10列・46px・48px）
}> = ({ groups, kinds, years, x, y, perYear = 20, start = 0, size = 0.8, verb = "結婚", mode = "join", focusName = "", unit = "人", cols = 10, dx = 46, dy = 48 }) => {
  const frame = useCurrentFrame() - start;
  const { width, height } = useVideoConfig();
  const yr = Math.max(-1, Math.min(years - 1, Math.floor(frame / perYear))); // -1＝まだ始まっていない
  const rows = Math.ceil(Math.max(...groups.map((g) => g.events.length)) / cols);
  const gw = Math.max(520, cols * dx + 60), size_ = size, gridTop = y + 170;
  const leave = mode === "leave";
  return (
    <>
      {/* 年は右に大きく。各群の名前と人数は群の上に置く（下に置くと字幕の帯にかかる） */}
      <div style={{ position: "absolute", left: x + groups.length * gw, top: y + 250, ...font("hero"), fontSize: 150, whiteSpace: "nowrap" }}>{yr < 0 ? "0" : yr + 1}<span style={{ fontSize: 75 }}>年目</span></div>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {groups.map((g, gi) => {
          const pts = hundred(g.events.length, { x: x + gi * gw + 20, bottom: gridTop + (rows - 1) * dy + 45 * size_, cols, dx, dy }, size_);
          return pts.map((p, i) => {
            const e = g.events[i];
            if (!leave) return <Figure key={`${gi}-${i}`} kind={kinds[i]} x={p.x} y={p.y} size={size_} dim={!(e !== null && e <= yr)} />;
            // 抜ける：その年の頭から 12f で下へ落ちて消え、足元に点線の跡が残る
            const gone = e !== null && e <= yr;
            const t = e === null ? 0 : interpolate(frame - e * perYear, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
            return (
              <g key={`${gi}-${i}`}>
                {gone && <ellipse data-qa="bg" cx={p.x} cy={p.y - 18 * size_} rx={14 * size_} ry={24 * size_} fill="none" stroke={C.rest}
                  strokeWidth={LINE.hair} strokeDasharray="6 6" opacity={t} />}
                {t < 1 && <Figure kind={kinds[i]} x={p.x} y={p.y + t * 40} size={size_} dim={!g.focus?.[i]} opacity={1 - t} />}
              </g>
            );
          });
        })}
      </svg>
      {groups.map((g, gi) => {
        const left = yr < 0 ? 0 : doneBy(g.events, yr);
        const remain = g.events.map((e, i) => i).filter((i) => !(g.events[i] !== null && g.events[i]! <= yr));
        const k = remain.filter((i) => g.focus?.[i]).length;
        return (
          <div key={g.label} style={{ position: "absolute", left: x + gi * gw, top: y, width: gw - 40 }}>
            <div style={{ ...font("label", C.ink2), whiteSpace: "nowrap" }}>{g.label}
              {leave && yr >= 0 && <span style={{ marginLeft: 16 }}>いま{g.startAge + yr}歳</span>}</div>
            {!leave && <div style={{ ...font("value"), whiteSpace: "nowrap" }}>{verb} {left}{unit}
              {yr >= 0 && <span style={{ ...font("note", C.ink2), marginLeft: 12 }}>いま{g.startAge + yr}歳</span>}</div>}
            {leave && <div style={{ ...font("label"), whiteSpace: "nowrap", marginTop: 8 }}>
              {verb} <b style={{ ...font("value") }}>{left}</b>{unit}　残った {remain.length}{unit}のうち、{focusName}
              <b style={{ ...font("value") }}> {k}</b>{unit}（{Math.round((k / Math.max(1, remain.length)) * 100)}%）</div>}
          </div>
        );
      })}
    </>
  );
};
