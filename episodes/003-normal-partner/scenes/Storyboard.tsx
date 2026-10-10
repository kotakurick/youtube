// 3本目「『普通の相手』の条件を全部満たす人の数」の絵コンテ 第3版（台本は script.md の第13稿。2026-10-07）。
// 第13稿で構成が変わった（冒頭の投稿の計算の3つの前提を、第2章・第3章・答え合わせで1つずつ確かめる。第1章は男女が求めるものと上方婚）ので作り直した。
// 第2版（第6稿用）は git の履歴にある（2026-10-07 に本編を第3版で書き直したので消した）。
// 比喩は「年収のつまみの目盛り」：冒頭で検索画面のつまみ（Slider）を500万円の目盛りへ動かし、第2章で目盛りの位置を年収の山の上に置き、教訓で2つの目盛りに戻す。
// 色：男女の色と、物差しの意味の色（お金＝金、身長＝青緑。人型には使わない）。判定の札（〇△×）は出さない（2026-10-07 オーナー）。
// 各場面は「動き終わりの姿」。秒数（sec）は読み上げの仮の尺（timing.json、無音の声）を場面の中で分けたもの。動き（move）は本編で付ける動き。
// 数字は sources.csv（S1〜S4・S8・S11・S15・S17〜S21）と data/count_result.md。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { BarChart } from "@lib/BarChart";
import { BothSides } from "@lib/BothSides";
import { TodayCard } from "@lib/Cards";
import { Cat, catTop } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { CouplePairs, couples } from "@lib/CouplePairs";
import { Figure, Kind } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { Table } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SearchRow, SearchScreen } from "@lib/SearchScreen";
import { SignOff } from "@lib/SignOff";
import { Slider } from "@lib/Slider";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { TwoRulers } from "@lib/TwoRulers";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
export const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number; fs?: number }> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight, fs }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}), ...(fs ? { fontSize: fs } : {}) }}>{children}</text>
);
export const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1500, ...font("question"), whiteSpace: "nowrap" }}>{children}</div>
);
/** 100人（20×5、1人の高さ65px）。lit の人だけ色、ほかは薄く。frame の範囲（1行目の列）に墨の枠 */
export const Hundred: React.FC<{ x: number; y: number; kind: Kind; lit: (i: number) => boolean; dx?: number; frame?: [number, number] }> = ({ x, y, kind, lit, dx = 46, frame }) => (
  <g>
    {frame && <rect x={x + frame[0] * dx - 6} y={y - 6} width={(frame[1] - frame[0]) * dx + 12} height={92 + 12} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.base} />}
    {Array.from({ length: 100 }, (_, i) => <Figure key={i} kind={kind} x={x + (i % 20) * dx + dx / 2} y={y + Math.floor(i / 20) * 92 + 78} size={1.3} dim={!lit(i)} />)}
  </g>
);
export const spread = (n: number, total = 100) => { const s = new Set<number>(); for (let k = 0; k < n; k++) s.add(Math.floor((k * total) / n)); return (i: number) => s.has(i); };
export const first = (n: number) => (i: number) => i < n;
export const MONEY = C.gold, BODY = C.teal;
export const FLOOR = 820; // 物語の場面の床。猫の足元が字幕の帯（y920、上に28px空ける）に入らない高さ
export const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 96, top: 64, ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "4px 16px" }}>{text}</div>
);
/** 札（白い角丸の板に1〜2行）。物語の場面の通知・メモ */
export const Card: React.FC<{ x: number; y: number; w: number; lines: string[]; head?: string; dashed?: boolean }> = ({ x, y, w, lines, head, dashed }) => (
  <g data-qa="prop" data-qa-label="札" data-qa-allow="prop">
    <rect x={x} y={y} width={w} height={(head ? 70 : 30) + lines.length * 60} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={dashed ? "12 8" : undefined} />
    {head && <Label x={x + 30} y={y + 56} size="note" color={C.ink2}>{head}</Label>}
    {lines.map((l, i) => <Label key={i} x={x + 30} y={y + (head ? 70 : 30) + i * 60 + 42}>{l}</Label>)}
  </g>
);
/** 2つの100人を左右に並べる（1人＝10人）。上に見出し、下に人数 */
export const TwoHundreds: React.FC<{ kind: Kind; left: { lit: number; title: string; value: string }; right: { lit: number; title: string; value: string }; y?: number }> = ({ kind, left, right, y = 260 }) => (
  <>
    <Label x={1820} y={y - 30} anchor="end" color={C.ink2} weight={900}>1人＝10人</Label>
    {[left, right].map((s, k) => (
      <g key={k}>
        <Label x={100 + k * 900} y={y - 30} color={C.ink2}>{s.title}</Label>
        <Hundred x={100 + k * 900} y={y} kind={kind} lit={first(s.lit)} dx={40} />
        <Label x={100 + k * 900} y={y + 540} size="value">{s.value}</Label>
      </g>
    ))}
  </>
);
/** 1000のマス（40×25）。n だけ墨。1マス＝1組（面積＝量） */
export const Grid1000: React.FC<{ x: number; y: number; n: number; cell?: number }> = ({ x, y, n, cell = 24 }) => (
  <g data-qa="mark" data-qa-label="1000組">
    {Array.from({ length: 1000 }, (_, i) => <rect key={i} x={x + (i % 40) * cell} y={y + Math.floor(i / 40) * cell} width={cell - 4} height={cell - 4} rx={3} fill={i < n ? C.ink : C.paper2} />)}
  </g>
);
/** 年収の目盛り（物差し）。marks に印（上に名前）。up は名前の段（0＝下の段、1＝上の段）。破線は「心の中の目盛り」 */
export const YenRuler: React.FC<{ x: number; y: number; w: number; min?: number; max?: number; marks: { v: number; text: string; up?: number; dashed?: boolean; color?: string }[] }> = (
  { x, y, w, min = 100, max = 800, marks },
) => {
  const X = (v: number) => x + ((v - min) / (max - min)) * w;
  const ticks = Array.from({ length: (max - min) / 100 + 1 }, (_, i) => min + i * 100);
  return (
    <g>
      <g data-qa="mark" data-qa-label="年収の目盛り">
        <rect x={x} y={y} width={w} height={52} rx={R.sm} fill={C.goldTint} stroke={MONEY} strokeWidth={LINE.thin} />
        {ticks.map((v) => <line key={v} x1={X(v)} x2={X(v)} y1={y} y2={y + 24} stroke={MONEY} strokeWidth={LINE.hair} />)}
      </g>
      {ticks.map((v) => <Label key={v} x={X(v)} y={y + 110} anchor="middle" color={C.ink2}>{`${v}万`}</Label>)}
      {marks.map((m) => {
        const top = y - 70 - (m.up ?? 0) * 110;
        return (
          <g key={m.text}>
            <line data-qa="mark" data-qa-label={m.text} x1={X(m.v)} x2={X(m.v)} y1={top + 12} y2={y + 52} stroke={m.color ?? C.ink} strokeWidth={LINE.base} strokeDasharray={m.dashed ? "14 10" : undefined} />
            <Label x={X(m.v)} y={top} anchor="middle" color={m.color ?? C.ink} weight={900}>{m.text}</Label>
          </g>
        );
      })}
    </g>
  );
};
/** 投稿の計算の3つの前提。focus の札を墨で縁どり、results に確かめた結果（文で。〇×は出さない）。
 *  札の左に前提の絵（①真ん中に印のある物差し ②金と青緑の物差しを直角に組んだ図 ③自分の札を持つ猫と、点線の相手）。C00・C13・D09・E06 でも同じ絵 */
export const PREMISES = ["① 普通とはまん中（どの条件も半分が残る）", "② 条件どうしは関係なく、ばらばら", "③ 選ぶのは、自分だけ"];
export const PremiseIcon: React.FC<{ i: number; x: number; cy: number }> = ({ i, x, cy }) => (
  <g data-qa="mark" data-qa-label={`前提${i + 1}の絵`} data-qa-allow="figure">
    {i === 0 && <>
      <rect x={x} y={cy - 25} width={150} height={50} rx={R.sm} fill={C.goldTint} stroke={MONEY} strokeWidth={5} />
      {[1, 2, 3, 4, 5].map((k) => <line key={k} x1={x + k * 25} x2={x + k * 25} y1={cy - 25} y2={cy - 8} stroke={MONEY} strokeWidth={3} />)}
      <line x1={x + 75} x2={x + 75} y1={cy - 45} y2={cy + 45} stroke={C.ink} strokeWidth={LINE.base} />
    </>}
    {i === 1 && <>
      <rect x={x} y={cy + 30} width={150} height={20} rx={6} fill={MONEY} />
      <rect x={x} y={cy - 60} width={20} height={110} rx={6} fill={BODY} />
      {[[50, -30], [90, 0], [120, -40], [70, 15]].map(([dx, dy], k) => <circle key={k} cx={x + dx} cy={cy + dy} r={9} fill={C.ink} />)}
    </>}
    {i === 2 && <>
      <Cat kind="female" x={x + 40} y={cy + 62} size={2.2} pose="stand" face="normal" facing={1} label="前提3の猫" />
      <rect x={x + 76} y={cy - 30} width={36} height={46} rx={6} fill={C.white} stroke={C.ink} strokeWidth={4} />
      <g opacity={0.35}><Cat kind="male" x={x + 140} y={cy + 62} size={2.2} pose="stand" face="normal" facing={-1} label="前提3の相手" /></g>
    </>}
  </g>
);
export const Premises: React.FC<{ focus?: number; results?: (string | undefined)[]; y?: number; show?: number }> = ({ focus, results = [], y = 240, show = 3 }) => (
  <Svg>
    {PREMISES.slice(0, show).map((p, i) => {
      const on = focus === undefined || focus === i, top = y + i * 190, r = results[i];
      return (
        <g key={p} opacity={on ? 1 : 0.55} data-qa="prop" data-qa-label={`前提${i + 1}`} data-qa-allow="mark figure">
          <rect x={160} y={top} width={1600} height={160} rx={R.lg} fill={C.white} stroke={on ? C.ink : C.rest} strokeWidth={focus === i ? LINE.base : LINE.thin} />
          <PremiseIcon i={i} x={200} cy={top + 80} />
          <Label x={400} y={top + (r ? 70 : 98)} size="value" fs={52} color={on ? C.ink : C.ink2}>{p}</Label>
          {r && <Label x={440} y={top + 132} color={C.ink2}>{r}</Label>}
        </g>
      );
    })}
  </Svg>
);
/** 「模式図」の札（実際の数字ではない図に必ず付ける。2026-10-07 デザイナー役） */
export const Schematic: React.FC<{ x?: number; y?: number }> = ({ x = 1824, y = 64 }) => (
  <div data-qa="label" style={{ position: "absolute", right: 1920 - x, top: y, ...font("label", C.ink2), border: `${LINE.thin}px solid ${C.ink2}`, borderRadius: R.sm, padding: "2px 16px" }}>模式図</div>
);
export const Big: React.FC<{ x: number; y: number; text: string; sub?: string; fs?: number }> = ({ x, y, text, sub, fs = 150 }) => (
  <g><Label x={x} y={y} size="hero" fs={fs}>{text}</Label>{sub && <Label x={x + 6} y={y + 80} color={C.ink2}>{sub}</Label>}</g>
);

// ---- 物語の場面 ----
/** 夜の洗面所（冒頭 A01 と教訓 F01 で同じ構図）。夜は壁を夜の色で塗る（半透明をかぶせると灰色に沈む。2026-10-07 イラストレーター役）。
 *  左から洗濯機（時刻）・洗面台と鏡（照明は消えている）、右に彼女（大きく）。光はスマホからだけ。brush＝口に歯ブラシ。 */
export const CAT_X = 1240, CAT_S = 8.5;
const NIGHT_LINE = C.paper2, DARK = { fill: C.paper2, fillOpacity: 0.16, stroke: NIGHT_LINE, strokeOpacity: 0.55, strokeWidth: LINE.thin };
export const Washroom: React.FC<{ face?: "normal" | "sad" | "think" | "surprised"; look?: [number, number]; time: string; brush?: boolean; children?: React.ReactNode }> = (
  { face = "normal", look, time, brush, children },
) => {
  const s = CAT_S * (50 / 218), feet = FLOOR + 20, phoneY = feet - 40 * s;
  return (
    <Svg>
      <defs>
        <radialGradient id="phoneGlow"><stop offset="0%" stopColor={C.white} stopOpacity={0.42} /><stop offset="100%" stopColor={C.white} stopOpacity={0} /></radialGradient>
      </defs>
      <g data-qa="bg">
        <rect x={0} y={0} width={1920} height={FLOOR} fill={C.night} />
        {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} x1={i * 120} x2={i * 120} y1={0} y2={FLOOR} stroke={NIGHT_LINE} strokeOpacity={0.12} strokeWidth={2} />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={0} x2={1920} y1={i * 120} y2={i * 120} stroke={NIGHT_LINE} strokeOpacity={0.12} strokeWidth={2} />)}
        <rect x={0} y={FLOOR} width={1920} height={1080 - FLOOR} fill={C.floor} />
        <rect x={0} y={FLOOR} width={1920} height={1080 - FLOOR} fill={C.ink} opacity={0.55} />
        <rect x={0} y={FLOOR - 16} width={1920} height={16} fill={NIGHT_LINE} opacity={0.25} />
        {/* 洗濯機と時刻 */}
        <rect x={110} y={440} width={360} height={FLOOR - 440} rx={R.md} {...DARK} />
        <rect x={140} y={466} width={300} height={56} rx={R.sm} fill={C.ink} opacity={0.5} />
        <text x={290} y={506} textAnchor="middle" style={{ ...font("label", NIGHT_LINE), fontSize: 36 }}>{time}</text>
        <circle cx={290} cy={680} r={105} fill={C.tealTint} fillOpacity={0.12} stroke={NIGHT_LINE} strokeOpacity={0.55} strokeWidth={LINE.thin} />
        {/* 消えた照明・鏡・洗面台・コップ */}
        <rect x={600} y={130} width={320} height={18} rx={9} fill={NIGHT_LINE} opacity={0.4} />
        <rect x={560} y={180} width={400} height={440} rx={R.lg} fill={C.tealTint} fillOpacity={0.12} stroke={NIGHT_LINE} strokeOpacity={0.6} strokeWidth={6} />
        {[0, 1].map((k) => <line key={k} x1={640 + k * 70} y1={560} x2={800 + k * 70} y2={240} stroke={C.white} strokeOpacity={0.15} strokeWidth={14} />)}
        <rect x={520} y={680} width={480} height={36} rx={R.sm} {...DARK} fillOpacity={0.3} />
        <rect x={540} y={716} width={440} height={FLOOR - 716} {...DARK} />
        <line x1={720} x2={800} y1={766} y2={766} stroke={NIGHT_LINE} strokeOpacity={0.6} strokeWidth={LINE.thin} />
        <path d="M752 680 L752 624 L800 624" fill="none" stroke={NIGHT_LINE} strokeOpacity={0.6} strokeWidth={14} strokeLinecap="round" />
        <path d="M880 680 L886 628 L922 628 L928 680 Z" {...DARK} fillOpacity={0.3} />
        {!brush && <line x1={896} y1={640} x2={918} y2={584} stroke={C.white} strokeOpacity={0.7} strokeWidth={8} strokeLinecap="round" />}
        {/* スマホの光（下からの光）と壁の影 */}
        <ellipse cx={CAT_X + 150} cy={feet - 260} rx={150} ry={190} fill={C.ink} opacity={0.25} />
      </g>
      <Cat kind="female" x={CAT_X} y={feet} size={CAT_S} pose="phone" face={face} look={look} label="彼女" />
      {brush && <line data-qa="prop" data-qa-label="歯ブラシ" data-qa-allow="figure" x1={CAT_X + 10} y1={feet - 92 * s} x2={CAT_X + 110} y2={feet - 104 * s} stroke={C.white} strokeWidth={12} strokeLinecap="round" />}
      <circle data-qa="bg" cx={CAT_X} cy={phoneY} r={380} fill="url(#phoneGlow)" />
      {children}
    </Svg>
  );
};
/** 通知の札（スマホから出た札。下のしっぽがスマホを指す） */
export const Notice: React.FC<{ head: string; lines: string[]; x?: number; y?: number; w?: number }> = ({ head, lines, x = 1000, y = 150, w = 760 }) => {
  const h = 70 + lines.length * 60, tip = CAT_X;
  return (
    <g data-qa="prop" data-qa-label="通知" data-qa-allow="figure">
      <path d={`M${tip - 30} ${y + h - 2} L${tip} ${y + h + 60} L${tip + 30} ${y + h - 2}`} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={x} y={y} width={w} height={h} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={tip - 27} y={y + h - 6} width={54} height={10} fill={C.white} />
      <Label x={x + 34} y={y + 56} size="note" color={C.ink2}>{head}</Label>
      {lines.map((l, i) => <Label key={i} x={x + 34} y={y + 70 + i * 60 + 44} size="value" fs={48}>{l}</Label>)}
    </g>
  );
};

// ---- 冒頭の検索画面と年収のつまみ ----
export const STOPS = ["指定なし", "300万", "400万", "500万", "600万"];
export const ROWS = (on: number, mark?: number, yen = "500万円以上"): SearchRow[] => [
  { label: `年収 ${on >= 1 ? yen : "指定なし"}`, on: on >= 1, mark: mark === 0, axis: MONEY },
  { label: "大学卒業以上", on: on >= 2, mark: mark === 1, axis: MONEY },
  { label: "身長 170cm以上", on: on >= 3, mark: mark === 2, axis: BODY },
];
export const DISCLAIM = "人数は国の統計の割合を1000人に置き換えた架空のもの（就業構造基本調査2022。働いていない人も含む）。身長は見積もり";
/** 左に検索画面、右上に年収のつまみ（目盛り）、右下に100人（1人＝10人）。note はつまみと100人の間の一行 */
export const Screen: React.FC<{ count: number; prev?: number; on: number; mark?: number; stop: number; lit: number; note?: string; yen?: string; title?: string; keys?: [number, number][] }> = (
  { count, prev, on, mark, stop, lit, note, yen, title, keys },
) => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={400} y={500} h={640} count={count} prev={prev} rows={ROWS(on, mark, yen)} title={title} />
      {note && <Label x={780} y={340} weight={900}>{note}</Label>}
      <Hundred x={760} y={356} kind="male" lit={first(lit)} dx={46} />
      <Label x={1700} y={420} weight={900}>1人</Label>
      <Label x={1700} y={470} weight={900}>＝10人</Label>
    </Svg>
    <Slider label="年収のつまみ" stops={STOPS} keys={keys ?? [[0, stop]]} x={800} y={200} w={880} />
    <SourceNote text={DISCLAIM} prefix="" />
  </AbsoluteFill>
);

// ================= 冒頭 =================
export const A01: React.FC = () => (
  <AbsoluteFill>
    <Washroom face="sad" time="22:10" brush><Notice head="相談所から" lines={["お断りの連絡が届きました"]} /></Washroom>
    <Tag text="会社員（33）　相談所に入って3か月　日曜の夜" />
  </AbsoluteFill>
);
export const A02: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={FLOOR} variant={1} />
    <Svg>
      <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.bg} opacity={0.22} />{/* 回想：背景を淡く */}
      {/* 相談所のラウンジ：丸テーブルと湯のみ */}
      <g data-qa="prop" data-qa-label="丸テーブル" data-qa-allow="figure">
        <rect x={953} y={FLOOR - 230} width={14} height={230} fill={C.ink2} />
        <ellipse cx={960} cy={FLOOR - 230} rx={170} ry={30} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        {[900, 1020].map((x) => <rect key={x} x={x - 18} y={FLOOR - 280} width={36} height={44} rx={6} fill={C.paper2} stroke={C.ink} strokeWidth={4} />)}
      </g>
      <Cat kind="female" x={700} y={FLOOR + 10} size={4.8} pose="sit" face="happy" facing={1} label="彼女" />
      <Cat kind="male" x={1220} y={FLOOR + 10} size={4.8} pose="sit" face="happy" facing={-1} label="2回目の人" />
      <line data-qa="mark" data-qa-allow="figure" x1={540} x2={1380} y1={catTop(FLOOR + 10, 4.8)} y2={catTop(FLOOR + 10, 4.8)} stroke={BODY} strokeWidth={LINE.thin} strokeDasharray="14 10" />
      <Card x={240} y={150} w={620} lines={["背は彼女と同じ 160cmくらい"]} />
      <Card x={1060} y={150} w={620} lines={["担当の人「一度だけ」"]} />
    </Svg>
    <Tag text="2回目のお見合い（回想）" />
  </AbsoluteFill>
);
export const A03a: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <g data-qa="prop" data-qa-label="架空の投稿">
        <rect x={280} y={170} width={1360} height={600} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <circle cx={360} cy={250} r={36} fill={C.paper2} />
        <Label x={420} y={264} color={C.ink2}>架空の投稿</Label>
        <Label x={340} y={390} size="value">「普通の人でいい」が、いちばん難しい。</Label>
        <Label x={340} y={490} size="body">年収も背も学歴も、普通でいい。</Label>
        <Label x={340} y={570} size="body">どれも2人に1人なら、1000人が500人、500人が250人。</Label>
        <Label x={340} y={650} size="body">ほかの条件も足して、6つ重ねると、16人。</Label>
      </g>
    </Svg>
  </AbsoluteFill>
);
export const CHAIN = [1000, 500, 250, 125, 63, 31, 16];
/** 面積＝人数の正方形を並べる（1000人の正方形が一辺300px） */
export const Chain: React.FC<{ y?: number; n?: number }> = ({ y = 640, n = CHAIN.length }) => {
  let x = 150;
  return (
    <g>
      {CHAIN.slice(0, n).map((v, i) => {
        const s = 300 * Math.sqrt(v / 1000), cx = x + s / 2;
        x += s + 90;
        return (
          <g key={v}>
            <rect data-qa="mark" data-qa-label={`${v}人`} x={cx - s / 2} y={y - s} width={s} height={s} rx={6} fill={i === CHAIN.length - 1 ? C.ink : C.rest} />
            <Label x={cx} y={y - s - 24} anchor="middle" size={i === CHAIN.length - 1 ? "value" : "label"}>{`${v}人`}</Label>
          </g>
        );
      })}
    </g>
  );
};
export const A03b: React.FC = () => (
  <AbsoluteFill>
    <Heading>投稿の計算：2人に1人ずつ、6回</Heading>
    <Svg><Chain y={720} /><Label x={150} y={800} color={C.ink2}>正方形の大きさ＝人数</Label></Svg>
    <SourceNote text="架空の投稿の計算。1000×(1/2)の6乗＝15.6人" prefix="" />
  </AbsoluteFill>
);
export const A04: React.FC = () => <Screen count={1000} on={0} stop={0} lit={100} note="25〜34歳の結婚していない男性 1000人" />;
export const A05: React.FC = () => <Screen count={132} prev={1000} on={1} mark={0} stop={3} lit={13} note="自分の年収は400万円ほど。少しだけ上のつもり" />;
export const A06: React.FC = () => <Screen count={106} prev={132} on={2} mark={1} stop={3} lit={11} note="大学卒業以上：ほとんど減らない" />;
export const A07: React.FC = () => <Screen count={59} prev={106} on={3} mark={2} stop={3} lit={6} note="身長170cm以上：ちょうど半分ほど" />;
export const A08: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={400} y={500} h={640} count={59} rows={ROWS(3)} />
      <g data-qa="prop" data-qa-label="59人の札">
        <rect x={760} y={220} width={500} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={1010} y={290} anchor="middle" weight={900}>残った59人</Label>
        {Array.from({ length: 59 }, (_, i) => <circle key={i} cx={810 + (i % 10) * 44} cy={350 + Math.floor(i / 10) * 52} r={16} fill={C.male} />)}
      </g>
      <line x1={1320} x2={1320} y1={240} y2={800} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="14 10" />
      <Cat kind="male" x={1580} y={800} size={5} pose="stand" face="happy" label="160cmのあの人" />
      <Label x={1580} y={300} anchor="middle" color={C.ink2}>この中にいない</Label>
    </Svg>
  </AbsoluteFill>
);
export const A09: React.FC = () => <AbsoluteFill><TodayCard claim="普通の相手は、数%しかいない" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
export const S15NOTE = "鈴木・八代（2025）内閣府経済社会総合研究所。2024年3月調査、25〜49歳の独身 男性5,103人・女性4,897人";
/** n＝並べる組の数（0のときは調査の札）、ask＝問いを出す。本編で組を1つずつ並べる（2026-10-07 仮通しのテンポ） */
export const A10: React.FC<{ n?: number; ask?: boolean }> = ({ n = 32, ask = true }) => (
  <AbsoluteFill>
    <Heading>男女を1人ずつ組にして、1000組</Heading>
    <Svg>
      {n > 0 ? <CouplePairs x={170} y={420} items={couples(n, 0, 0)} cols={16} />
        : <Label x={170} y={480} size="value">2024年の調査：独身の男女 約1万人</Label>}
      {n > 0 && <Label x={170} y={620} color={C.ink2}>見本の32組。このような組を、1000組つくる</Label>}
      {ask && <Label x={170} y={740} size="value">お互いが、お互いの条件を満たす組は？</Label>}
    </Svg>
    <SourceNote text={S15NOTE} />
  </AbsoluteFill>
);
export const A11a: React.FC = () => (
  <AbsoluteFill>
    <Heading>Aの計算：投稿の計算を、男女の両方で</Heading>
    <Svg>
      <Figure kind="male" x={220} y={400} size={2} />
      <Label x={300} y={380} size="value">1000人 → 16人</Label>
      <Figure kind="female" x={220} y={560} size={2} />
      <Label x={300} y={540} size="value">1000人 → 16人</Label>
      <Label x={940} y={470} size="value">→</Label>
      <g data-qa="mark" data-qa-label="1組のマス">
        <rect x={1040} y={340} width={200} height={200} rx={8} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect x={1040} y={490} width={200} height={50} fill={C.ink} />
      </g>
      <Label x={1040} y={600} color={C.ink2}>1組の、4分の1</Label>
      <Big x={1320} y={500} text="0.2組" fs={130} sub="1組もいない" />
    </Svg>
    <SourceNote text="この動画の計算：1000×(1/64)×(1/64)＝0.24組" prefix="" />
  </AbsoluteFill>
);
export const QUIZ_Q = "お互いの条件を満たし合う組は？";
export const QUIZ_T = "予想タイム　男女の1000組のうち";
export const QUIZ_C = ["1組もいない", "約10組", "約40組", "約130組"];
export const A11b: React.FC = () => <AbsoluteFill><Quiz question={QUIZ_Q} choices={QUIZ_C} title={QUIZ_T} /></AbsoluteFill>;
export const A12: React.FC = () => (
  <AbsoluteFill>
    <Heading>投稿の計算に隠れた、3つの前提</Heading>
    <Premises />
  </AbsoluteFill>
);

// ================= 第1章：男女が求めるものと上方婚 =================
export const S1NOTE = "国立社会保障・人口問題研究所「出生動向基本調査」2021。18〜34歳の結婚するつもりの独身者（重く見る＋考えに入れる）";
export const SURVEY = [{ label: "人柄", male: 95.1, female: 98.0 }, { label: "容姿", male: 81.2, female: 81.2 }, { label: "経済力", male: 48.2, female: 91.6 }];
export const Survey: React.FC<{ n: number; head: string }> = ({ n, head }) => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>{head}</Heading>
    <BothSides rows={SURVEY.slice(0, n)} max={100} title="相手の条件として 重く見る＋考えに入れる" />
    <SourceNote text={S1NOTE} />
  </AbsoluteFill>
);
export const B01: React.FC = () => <Survey n={1} head="男女とも、いちばん多いのは人柄" />;
/** card＝「男性は顔、女性はお金」の札を重ねる（本編で語に合わせて出す。2026-10-07 仮通しのテンポ） */
export const B02: React.FC<{ card?: boolean }> = ({ card }) => (
  <AbsoluteFill>
    <Survey n={2} head="相手の容姿：男性も女性も約8割" />
    {card && <Svg><Card x={560} y={600} w={800} dashed head="よく言われること" lines={["男性は顔、女性はお金"]} /></Svg>}
  </AbsoluteFill>
);
/** 「重く見る」だけに絞った容姿（S1：男性24.6%・女性18.8%） */
export const B02c: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>容姿を「重く見る」だけに絞ると</Heading>
    <BothSides rows={[{ label: "容姿", male: 24.6, female: 18.8 }]} max={100} title="相手の条件として 重く見る" />
    <SourceNote text={S1NOTE.replace("（重く見る＋考えに入れる）", "（重く見る）")} />
  </AbsoluteFill>
);
export const B03: React.FC = () => <Survey n={3} head="差が大きく出たのは、経済力" />;
export const B04: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>相手の経済力を条件にする人：30年で</Heading>
    <Svg>
      <BarChart x={160} y={250} width={1400} height={420} max={100} format={(v) => `${Math.round(v)}%`} bars={[
        { label: "男性 1992年", value: 26.7, color: C.maleTint }, { label: "男性 2021年", value: 48.2, color: C.male, focus: true },
        { label: "女性 1992年", value: 88.7, color: C.femaleTint }, { label: "女性 2021年", value: 91.6, color: C.female },
      ]} />
    </Svg>
    <SourceNote text={S1NOTE} />
  </AbsoluteFill>
);
export const B05: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>相手の経済力を「重く見る」男性は</Heading>
    <Svg>
      {Array.from({ length: 100 }, (_, i) => <Figure key={i} kind="male" x={100 + (i % 20) * 46 + 23} y={260 + Math.floor(i / 20) * 92 + 78} size={1.3}
        color={i < 5 ? C.male : i < 48 ? C.maleTint : undefined} dim={i >= 48} />)}
      <Big x={1100} y={420} text="100人に5人" fs={120} sub="重く見る（濃い色）" />
      <Label x={1106} y={600} weight={900} color={C.ink}>考えに入れる 43人（薄い色）</Label>
      <Label x={1106} y={660} color={C.ink2}>増えたのは、こちら</Label>
      <Label x={100} y={800} color={C.ink2}>1人＝1人。残りの52人は、経済力を条件にしていない</Label>
    </Svg>
    <SourceNote text="出生動向基本調査2021。男性の「重視する」4.7%（1992年3.4%）、「考慮する」23.3%→43.5%" />
  </AbsoluteFill>
);
export const B06: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>いまの相手の年収は、もっと高いほうがよかった</Heading>
    <Svg>
      <BarChart x={300} y={260} width={1000} height={420} max={100} format={(v) => `${Math.round(v)}%`} bars={[
        { label: "女性", value: 44.8, color: C.female, focus: true }, { label: "男性", value: 16.3, color: C.male, focus: true },
      ]} />
      <Label x={1360} y={340} color={C.ink2}>結婚している20代・30代</Label>
      <Label x={1360} y={460} weight={900}>女性でも、約55%は</Label>
      <Label x={1360} y={520} weight={900}>そう答えていない</Label>
    </Svg>
    <SourceNote text="内閣府男女共同参画局（2021）ネットモニター調査。女性953人・男性1,044人（当てはまる＋やや当てはまる）" />
  </AbsoluteFill>
);
export const B07: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Svg>
      <g data-qa="prop" data-qa-label="段">
        <rect x={300} y={620} width={320} height={200} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect x={620} y={440} width={320} height={380} fill={C.goldTint} stroke={C.ink} strokeWidth={LINE.thin} />
      </g>
      <Figure kind="female" x={460} y={620} size={2.4} />
      <Figure kind="male" x={780} y={440} size={2.4} />
      <path data-qa="mark" d="M520 470 Q600 300 690 292" fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      <path data-qa="mark" data-qa-allow="mark" d="M676 262 L730 288 L680 322 Z" fill={C.ink} />
      <Big x={1060} y={430} text="上方婚" fs={150} />
      <Label x={1066} y={540}>自分より学歴や年収が</Label>
      <Label x={1066} y={600}>上の相手と結婚すること</Label>
    </Svg>
  </AbsoluteFill>
);
export const S20NOTE = "Esteve ほか（2016）120か国・420の標本・1960〜2011年。日本は入っていない";
export const B08: React.FC = () => {
  // 模式図：大学を出る人の割合。女性の線が男性の線を追い越す
  const X = (t: number) => 220 + t * 1200, Y = (v: number) => 760 - v * 460;
  const line = (f: (t: number) => number) => Array.from({ length: 21 }, (_, i) => `${i ? "L" : "M"}${X(i / 20)} ${Y(f(i / 20))}`).join(" ");
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>大学を出る人が、女性のほうが多くなった国</Heading>
      <Svg>
        <line x1={X(0)} x2={X(1)} y1={Y(0)} y2={Y(0)} stroke={C.ink} strokeWidth={LINE.thin} />
        <path data-qa="mark" data-qa-label="男性" d={line((t) => 0.15 + 0.4 * t)} fill="none" stroke={C.male} strokeWidth={LINE.base} />
        <path data-qa="mark" data-qa-label="女性" d={line((t) => 0.05 + 0.75 * t)} fill="none" stroke={C.female} strokeWidth={LINE.base} />
        <Label x={X(1) + 20} y={Y(0.8) + 14} color={C.female}>女性</Label>
        <Label x={X(1) + 20} y={Y(0.55) + 14} color={C.male}>男性</Label>
        <Label x={X(0.55)} y={Y(0.82)} anchor="middle" weight={900}>このあと、妻のほうが学歴が上の夫婦が増えた</Label>
        <Label x={X(0)} y={Y(0.95)} color={C.ink2}>120か国・約50年分の結婚の記録</Label>
        <circle data-qa="mark" data-qa-label="追い越す点" data-qa-allow="mark" cx={X(0.286)} cy={Y(0.264)} r={22} fill="none" stroke={C.ink} strokeWidth={LINE.base} />
        <Label x={X(0.286)} y={Y(0.264) + 76} anchor="middle" color={C.ink2}>追い越す</Label>
        <Label x={X(0)} y={Y(0) + 56} color={C.ink2}>昔</Label>
        <Label x={X(1)} y={Y(0) + 56} anchor="end" color={C.ink2}>いま</Label>
      </Svg>
      <SourceNote text={`模式図。${S20NOTE}`} />
      <Schematic />
    </AbsoluteFill>
  );
};
export const B09: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>好みはそのまま。人数が入れ替わると</Heading>
    <Svg>
      <Label x={120} y={290} color={C.ink2}>大学を出た人が</Label>
      <Label x={120} y={350} weight={900}>男性に多い</Label>
      <CouplePairs x={640} y={380} items={couples(10, 4, 0, 2)} cols={10} />
      <Label x={120} y={580} color={C.ink2}>大学を出た人が</Label>
      <Label x={120} y={640} weight={900}>女性に多い</Label>
      <CouplePairs x={640} y={670} items={couples(10, 4, 2, 0).map((c, i) => ({ ...c, mark: i >= 4 && i < 6 }))} cols={10} />
      <Label x={640} y={770} color={C.ink2}>濃い色＝大学を出た人。縁どりの組＝妻のほうが学歴が上</Label>
      <Label x={120} y={410} color={C.ink2}>妻が上 0組</Label>
      <Label x={120} y={700} weight={900}>妻が上 2組</Label>
    </Svg>
    <SourceNote text="模式図（10組）。好みを変えない計算：Grow & Van Bavel（2015）、Esteve ほか（2016）" />
    <Schematic />
  </AbsoluteFill>
);
/** 2010年の約2割の内訳（S18）：専門・短大の妻×高卒の夫 12.2、大卒の妻×大卒でない夫 4.8、そのほか 3.9 */
export const B10: React.FC = () => {
  const base = 700, k = 420 / 30, W = 260;
  const seg = [[12.2, C.gold, "妻が短大・専門、夫が高卒"], [4.8, C.goldTint, "妻が大卒、夫が大卒でない"], [3.9, C.paper2, "そのほか"]] as const;
  let acc = 0;
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>日本：妻のほうが学歴が上の夫婦（妻が30代）</Heading>
      <Svg>
        <line x1={240} x2={1000} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect data-qa="mark" data-qa-label="1980年" x={300} y={base - 11.8 * k} width={W} height={11.8 * k} rx={R.sm} fill={C.rest} />
        <Label x={430} y={base - 11.8 * k - 24} anchor="middle" size="value">約1割</Label>
        <Label x={430} y={base + 56} anchor="middle" color={C.ink2}>1980年</Label>
        {seg.map(([v, col]) => { const y = base - (acc + v) * k; acc += v; return <rect key={v} data-qa="mark" data-qa-label={`2010年 ${v}`} x={680} y={y} width={W} height={v * k - 3} fill={col} stroke={C.ink} strokeWidth={2} />; })}
        <Label x={810} y={base - 20.9 * k - 24} anchor="middle" size="value">約2割</Label>
        <Label x={810} y={base + 56} anchor="middle" color={C.ink2}>2010年</Label>
        {(() => { let a = 0; return seg.map(([v, col, t]) => { const cy = base - (a + v / 2) * k; a += v; return (
          <g key={t}><rect x={1000} y={cy - 16} width={32} height={32} rx={6} fill={col} stroke={C.ink} strokeWidth={2} /><Label x={1050} y={cy + 14}>{`${t}　${v}`}</Label></g>
        ); }); })()}
        <Label x={1000} y={240} color={C.ink2}>2010年の内訳（ポイント）</Label>
      </Svg>
      <SourceNote text="福田・余田・茂木（2021）国勢調査の個票。妻30〜39歳の夫婦（1980年11.8%、2010年20.9%）" />
    </AbsoluteFill>
  );
};
export const B11: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>妻のほうが年収が上の夫婦（夫が30代）</Heading>
    <Svg>
      <Grid1000 x={100} y={220} n={54} />
      <Big x={1200} y={480} text="54組" fs={150} sub="1000組のうち" />
      <Label x={1206} y={640} color={C.ink2}>1マス＝1組</Label>
    </Svg>
    <SourceNote text="就業構造基本調査2022 第240-1表。主な仕事の年収の階級で比べた概算（この動画の計算）" />
  </AbsoluteFill>
);
export const B12: React.FC = () => <Screen count={299} on={1} mark={0} stop={2} lit={30} yen="400万円以上" title="彼女の画面" note="400万円以上なら 299人" />;
export const B13: React.FC = () => <Screen count={132} prev={299} on={1} mark={0} stop={3} lit={13} title="彼女の画面" note="100万円動かしただけで、半分以下" />;

// ================= 第2章：前提1「普通とはまん中」 =================
export const C00: React.FC = () => <AbsoluteFill><ChapterDots current={2} /><Heading>1つ目の前提を確かめる</Heading><Premises focus={0} /></AbsoluteFill>;
/** avg＝平均の線、draw＝山を左から描いた割合、mid＝170cmの線と塗り、pct＝約55%（本編で順に出す。2026-10-07 仮通しのテンポ） */
export const C01: React.FC<{ avg?: boolean; draw?: number; mid?: boolean; pct?: boolean }> = ({ avg = true, draw = 1, mid = true, pct = true }) => {
  // 20〜30代の男性の身長の山（平均171cm、標準偏差6）。170cm以上を青緑
  const X = (cm: number) => 260 + ((cm - 150) / 40) * 1300, Y = (cm: number) => 720 - 380 * Math.exp(-((cm - 171) ** 2) / (2 * 36));
  const pts = Array.from({ length: 81 }, (_, i) => 150 + i * 0.5);
  const curve = pts.slice(0, Math.max(2, Math.round(pts.length * draw))).map((c, i) => `${i ? "L" : "M"}${X(c)} ${Y(c)}`).join(" ");
  const right = `M${X(170)} 720 ` + pts.filter((c) => c >= 170).map((c) => `L${X(c)} ${Y(c)}`).join(" ") + ` L${X(190)} 720 Z`;
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>身長の山：170cmは、ほぼまん中</Heading>
      <Svg>
        {mid && <path data-qa="mark" data-qa-label="170cm以上" data-qa-allow="text" d={right} fill={C.tealTint} />}
        {draw > 0 && <path data-qa="mark" data-qa-label="身長の山" data-qa-allow="text" d={curve} fill="none" stroke={BODY} strokeWidth={LINE.base} />}
        <line x1={X(150)} x2={X(190)} y1={720} y2={720} stroke={C.ink} strokeWidth={LINE.thin} />
        {[150, 160, 170, 180, 190].map((c) => <Label key={c} x={X(c)} y={780} anchor="middle" color={c === 170 ? C.ink : C.ink2}>{`${c}cm`}</Label>)}
        {mid && <line data-qa="mark" data-qa-label="170cm" x1={X(170)} x2={X(170)} y1={300} y2={720} stroke={C.ink} strokeWidth={LINE.base} />}
        {avg && <line data-qa="mark" data-qa-label="平均" data-qa-allow="mark" x1={X(171)} x2={X(171)} y1={330} y2={720} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="10 10" />}
        {mid && <Label x={X(170) - 24} y={290} anchor="end" color={C.ink2}>170cm</Label>}
        {avg && <Label x={X(171) + 24} y={290} color={C.ink2}>平均 約171cm（点線）</Label>}
        {pct && <>
          <Label x={1400} y={400} weight={900}>170cm以上は</Label>
          <Label x={1400} y={480} size="value">約55%</Label>
          <Label x={1400} y={540} weight={900}>半分を少し超える</Label>
        </>}
      </Svg>
      <SourceNote text="国民健康・栄養調査2023。男性20〜39歳の平均と標準偏差から描いた山（170cm以上 約55%）" />
    </AbsoluteFill>
  );
};
export const S2NOTE = "就業構造基本調査2022 第40表。25〜34歳の働いている未婚の男性（年収は主な仕事、不詳を除く）";
export const C02: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>年収のちょうどまん中</Heading>
    <HeroNumber value={350} prefix="約" unit="万円" x={200} y={460} />
    <Svg>
      <YenRuler x={200} y={660} w={1400} marks={[{ v: 350, text: "まん中" }, { v: 500, text: "彼女の目盛り（500万円）", up: 0, dashed: true, color: C.ink2 }]} />
    </Svg>
    <SourceNote text="就業構造基本調査2022 第40表。25〜34歳の働いている未婚の男性。中央値 約345万円（この動画の計算）" />
  </AbsoluteFill>
);
export const INCOME = [["〜99", 51], ["100", 96], ["200", 229], ["300", 275], ["400", 195], ["500", 87], ["600", 37], ["700", 12], ["800〜", 18]] as const;
/** step（tail のとき）：1＝目盛りとすそ 2＝約150人 3＝132人の注 4＝まん中の印（本編で順に出す。2026-10-07 仮通しのテンポ） */
export const Income: React.FC<{ tail?: boolean; head: string; step?: number }> = ({ tail, head, step = 4 }) => {
  const x = 140, w = 1560, slot = w / INCOME.length;
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>{head}</Heading>
      <Svg>
        <BarChart x={x} y={290} width={w} height={380} max={300} barWidth={120} format={(v) => `${Math.round(v)}人`}
          bars={INCOME.map(([label, v], i) => ({ label, value: v, color: tail ? (i >= 5 ? MONEY : C.rest) : i === 3 ? C.ink : C.rest, focus: !tail && i === 3 }))} />
        <Label x={x + w} y={800} anchor="end" color={C.ink2}>年収（万円台）。働いている1000人あたり</Label>
        {tail && <>
          <line data-qa="mark" data-qa-label="500万円の目盛り" x1={x + slot * 5} x2={x + slot * 5} y1={250} y2={670} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="14 10" />
          <Label x={x + slot * 5 + 24} y={270} weight={900}>彼女の目盛り（500万円）</Label>
          {step >= 2 && <Label x={x + slot * 6.5} y={430} anchor="middle" size="value">約150人</Label>}
          {step >= 3 && <Label x={x + slot * 5 + 24} y={330} color={C.ink2}>冒頭の132人は、働いていない人も含めた数</Label>}
          {step >= 4 && <>
            <line data-qa="mark" data-qa-label="まん中の印" x1={x + slot * 3.5} x2={x + slot * 3.5} y1={310} y2={670} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="10 10" />
            <Label x={x + slot * 3.5} y={232} anchor="middle" color={C.ink2}>まん中（約350万円）</Label>
          </>}
        </>}
      </Svg>
      <SourceNote text={S2NOTE} />
    </AbsoluteFill>
  );
};
export const C03: React.FC = () => <Income head="年収の山：いちばん多いのは300万円台" />;
export const C04: React.FC<{ step?: number; head?: string }> = ({ step, head = "彼女の目盛りは、高いほうのすその上" }) => <Income tail step={step} head={head} />;
export const C05: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>年収500万円以上（25〜34歳の男性）</Heading>
    <Svg><TwoHundreds kind="male" left={{ lit: 15, title: "未婚の男性", value: "1000人に150人" }} right={{ lit: 39, title: "結婚したことのある男性", value: "1000人に390人" }} /></Svg>
    <SourceNote text={S2NOTE.replace("未婚の", "")} />
  </AbsoluteFill>
);
export const C06: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>30〜34歳だけで比べても、2倍以上</Heading>
    <Svg>
      <BarChart x={360} y={260} width={900} height={420} max={60} format={(v) => `${Math.round(v)}%`} bars={[
        { label: "未婚", value: 20.2, color: C.male }, { label: "結婚したことのある", value: 45.8, color: C.male, focus: true },
      ]} />
    </Svg>
    <SourceNote text="就業構造基本調査2022 第40表。30〜34歳の働いている男性で年収500万円以上の割合" />
  </AbsoluteFill>
);
export const AROUND = ["友だちの夫", "職場の先輩", "友だちの夫", "職場の先輩"];
/** 結婚指輪（人の胸の前に小さく。「もう結婚している」の印） */
export const Ring: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 16 }) => (
  <g data-qa="mark" data-qa-label="指輪" data-qa-allow="figure"><circle cx={x} cy={y} r={r} fill="none" stroke={MONEY} strokeWidth={6} /><circle cx={x} cy={y - r} r={5} fill={C.white} stroke={MONEY} strokeWidth={3} /></g>
);
export const C07: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>彼女のまわりの、同じ年ごろの男性</Heading>
    <Svg>
      <Cat kind="female" x={330} y={FLOOR} size={5} pose="stand" face="normal" facing={1} label="彼女" />
      {AROUND.map((t, i) => (
        <g key={i}>
          <Figure kind="male" x={780 + i * 300} y={640} size={2.8} />
          <Ring x={780 + i * 300 + 48} y={560} />
          <Label x={780 + i * 300} y={720} anchor="middle">{t}</Label>
        </g>
      ))}
      <Label x={1230} y={800} anchor="middle" weight={900}>みんな、もう結婚している</Label>
    </Svg>
  </AbsoluteFill>
);
export const C08: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Svg>
      {[[90, 300], [150, 760], [960, 260], [900, 790], [70, 540]].map(([x, y], i) => <Figure key={`o${i}`} kind="male" x={x} y={y} size={1.4} dim />)}
      <circle data-qa="mark" data-qa-label="身のまわり" data-qa-allow="figure" cx={520} cy={540} r={300} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="16 12" />
      <Label x={520} y={220} anchor="middle" color={C.ink2}>身のまわり</Label>
      <Cat kind="female" x={520} y={700} size={4.5} pose="stand" face="normal" facing={0} label="彼女" />
      {[[330, 470], [710, 470], [300, 690], [740, 690]].map(([x, y], i) => <Figure key={i} kind="male" x={x} y={y} size={1.8} />)}
      <Label x={940} y={420} size="value" fs={84}>社会的サンプリング</Label>
      <Label x={946} y={520}>身のまわりの人を見本にして、</Label>
      <Label x={946} y={580}>世の中の「普通」を見積もる</Label>
      <Label x={946} y={700} color={C.ink2}>年収や結婚を調べた研究ではない</Label>
    </Svg>
    <SourceNote text="Galesic ほか（2012）Psychological Science" />
  </AbsoluteFill>
);
export const C09: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>まわりで付けた目盛りは、高すぎる所を指す</Heading>
    <Svg>
      <YenRuler x={200} y={560} w={1400} marks={[{ v: 350, text: "未婚の男性のまん中" }, { v: 500, text: "彼女の目盛り（500万円）", up: 1, dashed: true }]} />
    </Svg>
    <SourceNote text={`${S2NOTE}。心の中の目盛りは、この動画の仮説`} prefix="" />
  </AbsoluteFill>
);
/** どちらが先か：左は「稼ぐ（金の丸）→ 指輪」、右は「指輪 → 稼ぐ」。矢印の向きで時間の順を見せる */
export const Coin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="mark" data-qa-label="お金"><circle cx={x} cy={y} r={44} fill={C.goldTint} stroke={MONEY} strokeWidth={LINE.base} /><text x={x} y={y + 16} textAnchor="middle" style={{ ...font("label", C.ink), fontWeight: 900 }}>円</text></g>
);
export const C10: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>どちらが先かは、分からない</Heading>
    <Svg>
      {[["稼ぐ人が", "先に選ばれた", true], ["結婚してから", "稼ぐようになった", false]].map(([a, b, coinFirst], i) => {
        const cx = 540 + i * 820;
        return (
          <g key={String(a)} data-qa="prop" data-qa-label={String(a)}>
            <rect x={160 + i * 820} y={260} width={760} height={460} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            {coinFirst ? <><Coin x={cx - 150} y={370} /><Ring x={cx + 150} y={378} r={34} /></> : <><Ring x={cx - 150} y={378} r={34} /><Coin x={cx + 150} y={370} /></>}
            <path data-qa="mark" d={`M${cx - 70} 370 L${cx + 60} 370`} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
            <path data-qa="mark" d={`M${cx + 50} 350 L${cx + 80} 370 L${cx + 50} 390 Z`} fill={C.ink} />
            <Label x={cx} y={520} anchor="middle" size="value" fs={56}>{String(a)}</Label>
            <Label x={cx} y={600} anchor="middle" size="value" fs={56}>{String(b)}</Label>
            <Label x={cx} y={680} anchor="middle" color={C.ink2}>かもしれない</Label>
          </g>
        );
      })}
    </Svg>
  </AbsoluteFill>
);
export const C11: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>女性では、ほとんど差がない</Heading>
    <Svg><TwoHundreds kind="female" left={{ lit: 7, title: "未婚の女性（500万円以上）", value: "1000人に70人" }} right={{ lit: 9, title: "結婚したことのある女性", value: "1000人に88人" }} /></Svg>
    <SourceNote text="就業構造基本調査2022 第40表。25〜34歳の働いている女性" />
  </AbsoluteFill>
);
export const C12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>顔の好み：双子に顔写真を採点してもらうと</Heading>
    <Svg>
      <g data-qa="mark" data-qa-label="100%">
        <rect x={160} y={400} width={1600 * 0.48} height={140} rx={R.sm} fill={C.ink} />
        <rect x={160 + 1600 * 0.48 + 8} y={400} width={1600 * 0.52 - 8} height={140} rx={R.sm} fill={C.rest} />
      </g>
      <Label x={190} y={492} size="value" color={C.white}>48%</Label>
      <Label x={1730} y={492} anchor="end" size="value">52%</Label>
      <Label x={160} y={370} weight={900}>みんなに共通 約半分</Label>
      <Label x={1760} y={370} anchor="end" weight={900}>人それぞれ 約半分</Label>
      <Label x={160} y={620} color={C.ink2}>容姿の「普通」の目盛りは、人によって位置が違う</Label>
    </Svg>
    <SourceNote text="Germine ほか（2015）Current Biology。オーストラリアの双子 761組、顔200枚（共通48%・個人52%）" />
  </AbsoluteFill>
);
export const C13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>1つ目の前提：年収では外れ</Heading>
    <Premises focus={1} results={["身長では当たり。年収は、普通の目盛りが上にずれている"]} />
  </AbsoluteFill>
);

// ================= 第3章：前提2「ばらばら」と前提3「選ぶのは自分だけ」 =================
export const D01: React.FC = () => <Screen count={106} prev={132} on={2} mark={1} stop={3} lit={11} title="冒頭の画面" note="大学卒業以上を足しても、ほとんど減らない" />;
export const D02: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>年収の高い人は、たいてい大学も出ている</Heading>
    <Svg>
      <Hundred x={140} y={240} kind="male" dx={70} frame={[0, 13]} lit={(i) => (i < 13 ? i < 11 : spread(38, 87)(i - 13))} />
      <Label x={140} y={730} weight={900}>枠の中（年収500万円以上）：大学を出た人 約8割</Label>
      <Label x={140} y={790} color={C.ink2}>1000人全体では 約5割　（色が付いた人＝大学を出た人）</Label>
    </Svg>
    <SourceNote text="就業構造基本調査2022 第40表・第118表から集計（年収500万円以上の人のうち大卒以上80.1%、全体49.3%）" />
  </AbsoluteFill>
);
export const SIX: [string, string][] = [["年齢", C.other], ["年収", MONEY], ["仕事の形", MONEY], ["学歴", MONEY], ["身長", BODY], ["体型", BODY]];
export const ONE = [52.9, 43.1, 70.0, 78.0, 65.1, 64.0];
/** figs＝人の数、cards＝条件の札の数、note＝下の注（本編で順に出す。2026-10-07 仮通しのテンポ） */
export const D03: React.FC<{ figs?: number; cards?: number; note?: string }> = ({ figs = 10, cards = 6, note = "この人たちの中で相手を探すとして、条件を全部満たす相手を数えた" }) => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>約1万人が答えた、相手に求める6つの条件</Heading>
    <Svg>
      {SIX.slice(0, cards).map(([s, col], i) => (
        <g key={s} data-qa="prop" data-qa-label={s}>
          <rect x={110 + i * 285} y={300} width={260} height={110} rx={R.md} fill={C.white} stroke={col} strokeWidth={LINE.base} />
          <rect x={110 + i * 285} y={300} width={16} height={110} rx={6} fill={col} />
          <Label x={250 + i * 285} y={372} anchor="middle" size="value" fs={52}>{s}</Label>
        </g>
      ))}
      {Array.from({ length: figs }, (_, i) => <Figure key={i} kind={i % 2 ? "female" : "male"} x={460 + i * 110} y={680} size={2} />)}
      {note && <Label x={960} y={790} anchor="middle" color={C.ink2}>{note}</Label>}
    </Svg>
    <SourceNote text={S15NOTE} />
  </AbsoluteFill>
);
export const STAIRS = [1000, 529, 228, 160, 125, 81, 52];
/** 掛け算の階段：冒頭の検索画面に6つの条件の行を出し、1つずつチェック（棒グラフが続かないように画面と100人で見せる。2026-10-07 アニメーター役） */
export const Stairs: React.FC<{ n: number; head: string; post?: boolean }> = ({ n, head, post }) => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>{head}</Heading>
    <Svg>
      <SearchScreen x={400} y={500} h={640} count={STAIRS[n - 1]} prev={n > 1 ? STAIRS[n - 2] : undefined} title="女性たちの条件"
        rows={SIX.map(([l, col], i) => ({ label: l, on: i < n - 1, mark: i === n - 2, axis: col === C.other ? undefined : col }))} />
      <Label x={780} y={250} color={C.ink2}>{STAIRS.slice(0, n).join(" → ")}</Label>
      {post && <Label x={780} y={316} weight={900}>投稿の計算なら 16人</Label>}
      <Hundred x={760} y={356} kind="male" lit={first(Math.round(STAIRS[n - 1] / 10))} dx={46} />
      <Label x={1700} y={420} weight={900}>1人</Label>
      <Label x={1700} y={470} weight={900}>＝10人</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2の、条件1つだけの割合を順に掛けた（この動画の計算）" />
  </AbsoluteFill>
);
export const D04: React.FC = () => <Stairs n={3} head="女性たちの条件を、1つずつ掛ける" />;
export const D05: React.FC = () => <Stairs n={7} head="6回掛けると、52人" post />;
export const Survivors: React.FC<{ x: number; y: number; n: number; title: string; value: string; kind?: Kind }> = ({ x, y, n, title, value, kind = "male" }) => (
  <g>
    <Label x={x} y={y}>{title}</Label>
    {Array.from({ length: n }, (_, i) => <Figure key={i} kind={kind} x={x + 16 + (i % 24) * 32} y={y + 90 + Math.floor(i / 24) * 62} size={1.0} />)}
    <Label x={x} y={y + 90 + Math.ceil(n / 24) * 62 + 30} size="value">{value}</Label>
  </g>
);
export const D06: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>1人ずつ、実際に条件を重ねて数えると</Heading>
    <Svg>
      <Survivors x={140} y={220} n={52} title="掛け算" value="52人" />
      <Survivors x={1000} y={220} n={133} title="実際に重ねる" value="133人" />
      <Label x={1820} y={780} anchor="end" color={C.ink2} weight={900}>ここは1人＝1人</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（女性の希望率13.3%）。男性1000人あたり" />
  </AbsoluteFill>
);
export const D07: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>条件を一度にいくつも満たす人が多い</Heading>
    <Svg><TwoRulers x={100} y={220} dx={54} xCuts={[{ at: 10, label: "大学 49%", on: true }, { at: 17, label: "年収500万円 13%", on: true }]} yCut={{ at: 3, label: "170cm 約55%", on: false }} /></Svg>
    <SourceNote text="模式図（横＝お金の物差しの順、縦＝身長の順）" prefix="" />
    <Schematic />
  </AbsoluteFill>
);
export const D08: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>男性たちの条件で、女性1000人を数えると</Heading>
    <Svg>
      <Hundred x={100} y={260} kind="female" lit={spread(33)} dx={46} />
      <Big x={1100} y={500} text="325人" fs={150} sub="1000人のうち" />
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（男性の希望率32.5%）。1人＝10人" />
  </AbsoluteFill>
);
export const D09: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>ここまでだと、数パーセントは外れに見える</Heading>
    <Svg>
      <Label x={100} y={210} color={C.ink2}>女性の条件で数えた男性</Label>
      <Hundred x={100} y={225} kind="male" lit={spread(13)} dx={40} />
      <Label x={100} y={740} size="value">1000人に133人</Label>
      <Label x={1000} y={210} color={C.ink2}>男性の条件で数えた女性</Label>
      <Hundred x={1000} y={225} kind="female" lit={spread(33)} dx={40} />
      <Label x={1000} y={740} size="value">1000人に325人</Label>
      <Label x={1820} y={210} anchor="end" color={C.ink2} weight={900}>1人＝10人</Label>
      <PremiseIcon i={2} x={100} cy={815} />
      <Label x={300} y={832} weight={900}>まだ残っている前提：③ 選ぶのは、自分だけ</Label>
    </Svg>
  </AbsoluteFill>
);
export const QROWS: SearchRow[] = [0, 1, 2].map(() => ({ label: "？", on: true }));
export const D10: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Svg>
      <SearchScreen x={560} y={500} h={640} count={59} rows={ROWS(3)} title="彼女の画面" />
      <SearchScreen x={1360} y={500} h={640} count="？" unit="" title="あの人の画面" rows={QROWS} />
      <Label x={960} y={540} anchor="middle" size="hero" fs={120}>⇄</Label>
      <Cat kind="male" x={1720} y={FLOOR} size={3.5} pose="stand" face="normal" facing={-1} label="あの人" />
    </Svg>
    <SourceNote text="お断りは、あの人のほうから出した" prefix="" />
  </AbsoluteFill>
);
/** 砂時計（スピードデートの4分） */
export const Hourglass: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="mark" data-qa-label="砂時計">
    <rect x={x - 50} y={y - 72} width={100} height={12} rx={4} fill={C.ink} />
    <rect x={x - 50} y={y + 60} width={100} height={12} rx={4} fill={C.ink} />
    <path d={`M${x - 38} ${y - 60} L${x + 38} ${y - 60} L${x + 6} ${y} L${x + 38} ${y + 60} L${x - 38} ${y + 60} L${x - 6} ${y} Z`} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
    <path d={`M${x - 20} ${y - 32} L${x + 20} ${y - 32} L${x} ${y - 4} Z`} fill={MONEY} />
    <path d={`M${x - 30} ${y + 56} L${x + 30} ${y + 56} L${x} ${y + 26} Z`} fill={MONEY} />
  </g>
);
/** step：0＝席だけ 1＝砂時計 2＝男性の結果 3＝女性の結果（本編で順に出す。2026-10-07 仮通しのテンポ） */
export const D11: React.FC<{ step?: number }> = ({ step = 3 }) => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>スピードデート：4分話して「また会いたいか」</Heading>
    <Svg>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Table x={420 + i * 540} y={560} size={2.4} w={60} />
          <Figure kind="male" x={330 + i * 540} y={560} size={2} pose="sit" facing={1} />
          <Figure kind="female" x={510 + i * 540} y={560} size={2} pose="sit" facing={-1} />
        </g>
      ))}
      {step >= 1 && <><Hourglass x={1720} y={300} />
      <Label x={1720} y={420} anchor="middle" weight={900}>4分</Label></>}
      {step >= 2 && <Label x={160} y={700} weight={900}>男性：自分より野心があると感じた女性を、選びにくい</Label>}
      {step >= 3 && <Label x={160} y={770}>女性：この傾向は出なかった</Label>}
    </Svg>
    <SourceNote text="Fisman ほか（2006）米国の大学院生 約400人。4分の会話での判断で、結婚相手の選び方ではない" />
  </AbsoluteFill>
);
export const D12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>お互いを通る組は、1000組のうち？</Heading>
    <Svg>
      <Label x={100} y={210} color={C.ink2}>女性の条件を満たす男性</Label>
      <Hundred x={100} y={230} kind="male" lit={spread(13)} dx={40} />
      <Label x={1000} y={210} color={C.ink2}>男性の条件を満たす女性</Label>
      <Hundred x={1000} y={230} kind="female" lit={spread(33)} dx={40} />
      <Label x={960} y={800} anchor="middle" size="value">両方を通る組は？</Label>
    </Svg>
    <SourceNote text={`${S15NOTE}。1人＝10人`} />
  </AbsoluteFill>
);

// ================= 答え合わせ =================
export const E01: React.FC = () => <AbsoluteFill><TodayCard claim="普通の相手は、数%しかいない" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
export const E02: React.FC = () => <AbsoluteFill><Quiz question={QUIZ_Q} choices={QUIZ_C} title={QUIZ_T} answer={2} reveal /></AbsoluteFill>;
export const E03: React.FC = () => (
  <AbsoluteFill>
    <Heading>実際の研究では、1000組に38組</Heading>
    <Svg>
      <Grid1000 x={100} y={220} n={38} />
      <Big x={1200} y={430} text="38組" fs={150} sub="研究者「極めて狭き門」" />
      <Label x={1206} y={640} color={C.ink2}>Dの130は、女性の条件だけで</Label>
      <Label x={1206} y={700} color={C.ink2}>数えた男性の人数（133人）</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（成立率3.8%）、要旨・p.90。1マス＝1組" />
  </AbsoluteFill>
);
export const E04: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="普通の相手は、数%しかいない" mark="△" reason={["自分の条件だけで数えると：1000人に133人", "お互いの条件で数えると：1000組に38組", "数パーセントになるのは、お互いで数えたとき"]} />
  </AbsoluteFill>
);
export const E05: React.FC<{ pairs?: boolean }> = ({ pairs = true }) => (
  <AbsoluteFill>
    <Heading>投稿の計算から、もう一度たどる</Heading>
    <Svg>
      <Label x={120} y={240} color={C.ink2}>ここまでは人の数</Label>
      <BarChart x={120} y={280} width={1000} height={420} max={140} barWidth={170} format={(v) => `${Math.round(v)}人`} bars={[
        { label: "投稿の計算", value: 16, color: C.rest }, { label: "掛け算", value: 52, color: C.femaleTint }, { label: "実際に重ねる", value: 133, color: C.female, focus: true },
      ]} />
      {pairs && <>
        <line x1={1200} x2={1200} y1={260} y2={760} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 10" />
        <Label x={1260} y={300} color={C.ink2}>ここからは組の数</Label>
        <Grid1000 x={1260} y={340} n={38} cell={14} />
        <Label x={1260} y={760} size="value">1000組に38組</Label>
      </>}
    </Svg>
    <SourceNote text="女性の条件・男性1000人あたり。16人と52人は、この動画の計算" />
  </AbsoluteFill>
);
export const E06: React.FC = () => (
  <AbsoluteFill>
    <Heading>3つの前提を確かめると</Heading>
    <Premises results={["身長では合っていたが、年収で外れた", "条件を一度にいくつも満たす人が多い", "相手にも条件がある"]} />
  </AbsoluteFill>
);
export const E07: React.FC = () => (
  <AbsoluteFill>
    <Heading>38組は、会う前に書いた条件の数字</Heading>
    <Svg>
      {SIX.map(([s, col], i) => (
        <g key={s} data-qa="prop" data-qa-label={s}>
          <rect x={110 + i * 285} y={280} width={260} height={110} rx={R.md} fill={C.white} stroke={col} strokeWidth={LINE.base} />
          <Label x={240 + i * 285} y={352} anchor="middle" size="value" fs={52}>{s}</Label>
        </g>
      ))}
      {["顔", "性格"].map((s, i) => (
        <g key={s} data-qa="prop" data-qa-label={s}>
          <rect x={110 + i * 285} y={480} width={260} height={110} rx={R.md} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 8" />
          <Label x={240 + i * 285} y={552} anchor="middle" size="value" fs={52} color={C.ink2}>{s}</Label>
        </g>
      ))}
      <Label x={720} y={550} color={C.ink2}>← 6つの条件に入っていない</Label>
      <Label x={110} y={720} weight={900}>だから幅をもって見るように、と研究者は断っている</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）p.89" />
  </AbsoluteFill>
);

// ================= 教訓 =================
export const F01: React.FC = () => (
  <AbsoluteFill>
    <Washroom face="think" look={[-0.3, -0.4]} time="0:02"><Notice head="架空の投稿" lines={["1000人が、16人"]} x={1040} w={600} /></Washroom>
    <Tag text="日付が変わるころ" />
  </AbsoluteFill>
);
export const F02: React.FC = () => {
  const X = (v: number) => 200 + ((v - 100) / 700) * 1400;
  return (
    <AbsoluteFill>
      <Heading>彼女の目盛りは、まわりで見てきた人たちで</Heading>
      <Svg>
        <YenRuler x={200} y={560} w={1400} marks={[{ v: 500, text: "彼女の目盛り（500万円）", up: 1, dashed: true }]} />
        {[540, 600, 660, 720].map((v, i) => (
          <g key={v}><Figure kind="male" x={X(v)} y={556} size={1.8} /><Ring x={X(v) + 30} y={500} r={12} /></g>
        ))}
        <Label x={X(630)} y={420} anchor="middle" color={C.ink2}>友だちの夫・職場の先輩</Label>
      </Svg>
    </AbsoluteFill>
  );
};
export const F03: React.FC = () => (
  <AbsoluteFill>
    <Heading>目盛りを持っているのは、彼女だけではない</Heading>
    <Svg>
      <Cat kind="female" x={300} y={500} size={4} pose="stand" face="think" facing={1} label="彼女" />
      <Cat kind="male" x={300} y={800} size={4} pose="stand" face="normal" facing={1} label="あの人" />
    </Svg>
    <Slider label="彼女の目盛り（年収）" stops={STOPS} keys={[[0, 3]]} x={600} y={390} w={1000} />
    <Slider label="あの人の目盛り" stops={["？", "？", "？", "？", "？"]} keys={[[0, 2]]} x={600} y={690} w={1000} />
  </AbsoluteFill>
);
/** 締め：2本の金の帯（彼女の目盛りを通る範囲・あの人の目盛りを通る範囲）が重なり、重なりの下で2匹が向き合う。朝の光 */
export const F04: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.goldTint} opacity={0.35} />
      <g data-qa="mark" data-qa-label="2本の帯" data-qa-allow="mark">
        <rect x={240} y={150} width={1000} height={110} rx={R.lg} fill={MONEY} opacity={0.35} />
        <rect x={680} y={190} width={1000} height={110} rx={R.lg} fill={MONEY} opacity={0.35} />
        <rect x={680} y={190} width={560} height={70} fill={MONEY} opacity={0.5} />
      </g>
      <Label x={270} y={215} color={C.ink}>彼女の目盛りを通る</Label>
      <Label x={1650} y={285} anchor="end" color={C.ink}>あの人の目盛りを通る</Label>
      <Label x={960} y={240} anchor="middle" weight={900}>どちらも通れる</Label>
      <Cat kind="female" x={760} y={660} size={5.5} pose="stand" face="normal" facing={1} label="彼女" />
      <Cat kind="male" x={1160} y={660} size={5.5} pose="stand" face="happy" facing={-1} label="あの人" />
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 720, width: 1728, ...font("value"), fontSize: 52, textAlign: "center" }}>
      普通の相手とは、お互いの目盛りを、どちらも通れる人のことでした。
    </div>
  </AbsoluteFill>
);
export const F05: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;
// 終了画面（共通の部品 SignOff の end。20秒、ナレーションなし）
export const F06: React.FC = () => <AbsoluteFill><SignOff end /></AbsoluteFill>;

const panels: Panel[] = [
  // 冒頭（opening 29.0 / opening-sns 24.5 / opening-screen 52.7）
  { key: "A01", title: "冒頭：日曜の夜の洗面所", C: A01, sec: 12, move: "照明の消えた夜の洗面所。歯ブラシをくわえた彼女のスマホが光る → 通知の札がスマホから上へ浮かび上がる → 顔が曇る" },
  { key: "A02", title: "冒頭：2回目のお見合い（回想）", C: A02, sec: 17, move: "回想（色を少し淡く）。向かい合う2匹の頭の高さに青緑の点線（背が同じ）→ 札「160cmくらい」「担当の人『一度だけ』」が1行ずつ" },
  { key: "A03a", title: "冒頭：架空の投稿", C: A03a, sec: 12, move: "スマホに寄ると投稿。見出し → 本文が1行ずつ（読む声に合わせて）" },
  { key: "A03b", title: "冒頭：投稿の計算 1000→16人", C: A03b, sec: 12.5, move: "1000人の正方形が半分に割れては右へ送られ、6回で16人（墨）。面積＝人数" },
  { key: "A04", title: "冒頭：検索画面 1000人", C: A04, sec: 10, move: "相談所の検索画面。右上に年収のつまみ（目盛り）、右下に100人（1人＝10人）" },
  { key: "A05", title: "冒頭：つまみを500万円 → 132人", C: A05, sec: 17, move: "つまみが「指定なし」から500万円の目盛りへすべる → 人数が1000から132へ数え下がり、100人のうち13人だけが色を残す" },
  { key: "A06", title: "冒頭：大学卒業以上 → 106人", C: A06, sec: 8, move: "大学の欄（金の帯）にチェック → 106。色の人は13→11人とほとんど減らない" },
  { key: "A07", title: "冒頭：170cm以上 → 59人", C: A07, sec: 10, move: "身長の欄（青緑の帯）にチェック → 59。色の人が11→6人に" },
  { key: "A08", title: "冒頭：59人の中にあの人はいない", C: A08, sec: 7.7, move: "〔間・短〕右に点線の枠が開き、笑うあの人の猫。「59人の中にいない」" },
  { key: "A09", title: "今日の答え合わせ", C: A09, sec: 9.5, move: "画面を払ってカード。ゴサが考える" },
  // 予想タイム（quiz 44.4）・前提（roadmap 22.4）
  { key: "A10", title: "予想タイム：男女を組にして1000組", C: A10, sec: 16, move: "男性と女性が1人ずつ寄って組になり、床が付く → 「1000組」→ 問いの一文" },
  { key: "A11a", title: "予想タイム：Aの計算（両側で0.2組）", C: A11a, sec: 12, move: "男性の行・女性の行がそれぞれ1000→16人と数え下がる → 右に0.2組「1組もいない」" },
  { key: "A11b", title: "予想タイム：A〜D", C: A11b, sec: 16.4, move: "問いと選択肢4つ（答えは最後の答え合わせで）。〔間〕" },
  { key: "A12", title: "3つの前提", C: A12, sec: 22.4, move: "前提の札が上から1枚ずつ（声に合わせて）→ 最後の一文で第1章へ" },
  // 第1章（ch1-card 2.8 / ch1-survey 50.0 / ch1-quiz 24.5 / ch1-hypergamy 30.8 / ch1-world 32.0 / ch1-census 14.7 / ch1-income-couples 12.2 / ch1-her 26.5）
  { key: "B01", title: "第1章：人柄がいちばん", C: B01, sec: 20.8, move: "第1章の扉 → 男女の棒が中央から外へ伸びる（人柄）" },
  { key: "B02", title: "第1章：容姿は男女とも約8割", C: B02, sec: 17, move: "容姿の段が足される。男性の棒が先に伸び、女性の棒が同じ長さまで（「そして女性も」で）" },
  { key: "B03", title: "第1章：経済力で差", C: B03, sec: 15, move: "経済力の段。女性の棒が長く伸びる" },
  { key: "B04", title: "第1章：男性 4人に1人 → 2人に1人", C: B04, sec: 13, move: "1992年の淡い棒 → 2021年の濃い棒が伸びる（男性）→ 女性の2本はほぼ同じ" },
  { key: "B05", title: "第1章：重く見る男性は100人に5人", C: B05, sec: 11.5, move: "100人のうち48人が薄い色に → そのうち5人だけ濃い色が残る → 「100人に5人」" },
  { key: "B06", title: "第1章：もっと高いほうがよかった", C: B06, sec: 19, move: "女性45%・男性16%の棒が伸びる → 「過半数は答えていない」で女性の棒の上半分を点線でなぞる" },
  { key: "B07", title: "第1章：上方婚とは", C: B07, sec: 11.8, move: "段の下に妻、上に夫 → 上に向かう矢印 → 「上方婚」の文字" },
  { key: "B08", title: "第1章：女性の大卒が男性を追い越す（世界）", C: B08, sec: 14, move: "2本の線が左から伸び、女性の線が男性の線を追い越す → 交点のあとに一文（模式図）" },
  { key: "B09", title: "第1章：好みはそのまま、人数が入れ替わる", C: B09, sec: 18, move: "上の段（大卒が男性に多い）→ 下の段で濃い色が男性から女性へ移る → 妻のほうが学歴が上の組が縁どられる" },
  { key: "B10", title: "第1章：日本 約1割 → 約2割", C: B10, sec: 14.7, move: "1980年・2010年の棒が伸びる" },
  { key: "B11", title: "第1章：妻のほうが年収が上 1000組に54組", C: B11, sec: 12.2, move: "1000のマスが敷かれ、54マスだけ墨に → 「54組」" },
  { key: "B12", title: "第1章：彼女の画面 400万円 → 299人", C: B12, sec: 14, move: "冒頭の画面に戻る。つまみが400万円の目盛りへ → 299人" },
  { key: "B13", title: "第1章：500万円 → 132人（半分以下）", C: B13, sec: 12.5, move: "つまみを1目盛り右へ → 299から132へ数え下がる → 「半分以下」" },
  // 第2章（ch2-card 2.8 / ch2 4.4 / ch2-height 21.9 / ch2-quiz 14.6 / ch2-income 37.8 / ch2-married 113.7）
  { key: "C00", title: "第2章：1つ目の前提", C: C00, sec: 7.2, move: "第2章の扉 → 前提の札。①だけ墨で縁どり、②③は薄く" },
  { key: "C01", title: "第2章：身長の山", C: C01, sec: 21.9, move: "身長の山が描かれる → 170cmの線 → 右側が青緑に塗られる" },
  { key: "C02", title: "第2章：年収のまん中 約350万円", C: C02, sec: 14.6, move: "「約350万円」が数え上がる → 下の目盛りに「まん中」と、点線の「少しだけ上のつもり」（500万）" },
  { key: "C03", title: "第2章：年収の山（300万円台がいちばん）", C: C03, sec: 17, move: "9本の棒が伸びる。300万円台だけ墨" },
  { key: "C04", title: "第2章：500万円の目盛りはすその上", C: C04, sec: 20.8, move: "500万円の目盛り（点線）が立ち、右のすそが金に → 「約150人」→（先回り）" },
  { key: "C05", title: "第2章：結婚したことのある男性 390人", C: C05, sec: 16, move: "左に未婚の100人、右に結婚したことのある100人。色が15人と39人" },
  { key: "C06", title: "第2章：30〜34歳でも2倍以上", C: C06, sec: 8, move: "2本の棒が伸びる" },
  { key: "C07", title: "第2章：まわりの男性", C: C07, sec: 9, move: "彼女の右に、友だちの夫・職場の先輩が1人ずつ出る → それぞれの胸に指輪が光る" },
  { key: "C08", title: "第2章：社会的サンプリング", C: C08, sec: 17, move: "彼女のまわりに点線の輪 → 名前と説明 → 「年収や結婚の研究ではない」" },
  { key: "C09", title: "第2章：目盛りが高すぎる所を指す", C: C09, sec: 10, move: "目盛りに「未婚の男性のまん中」→ 点線の「心の中の普通の目盛り」が500万へ" },
  { key: "C10", title: "第2章：どちらが先か", C: C10, sec: 11, move: "左の札（お金 → 指輪の矢印）→ 右の札（指輪 → お金）" },
  { key: "C11", title: "第2章：女性では差がない", C: C11, sec: 12, move: "女性の100人2つ。色が7人と9人" },
  { key: "C12", title: "第2章：顔の好み（双子）", C: C12, sec: 16, move: "100%の帯が左（共通）と右（人それぞれ）にほぼ半分ずつ分かれる" },
  { key: "C13", title: "第2章：1つ目の前提は年収で外れ", C: C13, sec: 13.7, move: "前提の札。①の下に結果の一行 → ②が縁どられる" },
  // 第3章（ch3-card 2.8 / ch3-overlap 23.5 / ch3-survey 27.3 / ch3-multiply 36.4 / ch3-guess 29.4 / ch3-turn 68.5）
  { key: "D01", title: "第3章：冒頭の画面 106人", C: D01, sec: 9.8, move: "第3章の扉 → 冒頭の画面（大学の欄が縁どられる）" },
  { key: "D02", title: "第3章：枠の中は8割", C: D02, sec: 16.5, move: "100人のうち年収500万円以上の13人を墨の枠で囲む → 大卒に色：枠の中11人、外38人" },
  { key: "D03", title: "第3章：約1万人の6つの条件", C: D03, sec: 27.3, move: "6つの札（物差しの色の帯）が1枚ずつ → 下に男女の人型 → 一文" },
  { key: "D04", title: "第3章：掛け算の階段 1000→530→230", C: D04, sec: 14, move: "冒頭の検索画面に6つの条件の行。年齢 → 年収にチェックが入るたびに人数が数え下がり、右の100人の色が消えていく" },
  { key: "D05", title: "第3章：6回掛けて52人", C: D05, sec: 22.4, move: "残り4つにチェックが続いて52人（100人のうち5人）→ 上に「投稿の計算なら16人」" },
  { key: "D06", title: "第3章：実際に重ねると133人", C: D06, sec: 13, move: "左に52人 →〔間〕→ 右に133人が1列ずつ並ぶ（ここは1人＝1人）" },
  { key: "D07", title: "第3章：いくつも満たす人", C: D07, sec: 9, move: "二本の物差しの図。年収の線の右に、大学の線を通った人がそろう" },
  { key: "D08", title: "第3章：男性の条件では325人", C: D08, sec: 7.4, move: "女性100人のうち33人に色 → 「325人」" },
  { key: "D09", title: "第3章：1割超・3割超 → 3つ目の前提", C: D09, sec: 15, move: "左右の100人に色（13人・33人）→ 下に前提③の絵と一行" },
  { key: "D10", title: "第3章：あの人の画面", C: D10, sec: 13, move: "彼女の画面が左へ寄り、右に同じ形の「あの人の画面」が鏡のように現れる（欄は「？」）→ 右端にあの人の猫" },
  { key: "D11", title: "第3章：スピードデート", C: D11, sec: 20, move: "テーブルが3つ。右上の砂時計の砂が落ちる（4分）→ 男性の結果 → 女性の結果" },
  { key: "D12", title: "第3章：お互いを通る組は？", C: D12, sec: 20.5, move: "左に男性100人（13人に色）、右に女性100人（33人に色）→ 色の付いた人どうしが中央へ寄って組になろうとする →「両方を通る組は？」（掛け算の記号は出さない）" },
  // 答え合わせ（verdict 9.2 / verdict-quiz 30.4 / verdict-judge 61.4）
  { key: "E01", title: "答え合わせ：今日の説", C: E01, sec: 9.2, move: "今日の答え合わせのカードがもう一度" },
  { key: "E02", title: "答え合わせ：予想の答え C", C: E02, sec: 14, move: "予想タイムの問いと選択肢 → 〔間〕→ Cが光る" },
  { key: "E03", title: "答え合わせ：1000組に38組", C: E03, sec: 16.4, move: "1000のマスのうち38マスが墨に → 「38組」→ 右下に「Dの130は人の数」" },
  { key: "E04", title: "答え合わせ：自分とお互い", C: E04, sec: 12, move: "答え合わせのカード。証拠の札が3枚 → ゴサ（ひげ長め）。〇△×の札は出さない" },
  { key: "E05", title: "答え合わせ：16人 → 52人 → 133人 → 38組", C: E05, sec: 21, move: "3本の棒が順に伸びる（人）→ 点線で区切って、右に1000組のマスと38組" },
  { key: "E06", title: "答え合わせ：3つの前提の結果", C: E06, sec: 12, move: "前提の札の下に、結果の一行が1枚ずつ" },
  { key: "E07", title: "答え合わせ：ただし書き", C: E07, sec: 16.4, move: "6つの札 → 下に点線の「顔」「性格」 → 研究者の断り" },
  // 教訓（lesson 49.1）・終わり（end 20）
  { key: "F01", title: "教訓：日付が変わるころ", C: F01, sec: 11, move: "冒頭と同じ洗面所（時刻だけ0:02）。歯ブラシは置かれている。スマホから投稿の札「1000人が、16人」が浮かぶ → 彼女が見上げる" },
  { key: "F02", title: "教訓：500万円の目盛り", C: F02, sec: 12, move: "年収の目盛りに点線の「彼女の目盛り」→ 目盛りの右側（500万より上）に、指輪の付いたまわりの男性が立つ" },
  { key: "F03", title: "教訓：2つの目盛り", C: F03, sec: 16, move: "彼女のつまみの下に、あの人のつまみ（目盛りは「？」）が出る" },
  { key: "F04", title: "締めの一文", C: F04, sec: 10, move: "朝の光。2本の金の帯が左右から伸びて重なる →「どちらも通れる」→ 2匹が向き合う → 締めの一文 →〔間・長〕" },
  { key: "F05", title: "締めのひと言（毎回同じ）", C: F05, sec: 7, move: "共通のアニメーション（SignOff）。字幕なし" },
  { key: "F06", title: "終了画面（共通）", C: F06, sec: 20, move: "共通の終了画面（SignOff end）。ナレーションなし、BGMだけ" },
];

const storyboard: StoryboardDef = { id: "003-normal-partner", title: "「普通の相手」の数（第3版）", panels };
export default storyboard;
