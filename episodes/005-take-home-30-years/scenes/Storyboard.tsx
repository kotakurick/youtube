// 5本目「手取りは父と同じ。なのに、なぜ苦しいのか」の絵コンテ。
// 第1版（2026-10-10）。台本は script.md の第3稿・改（日本語役2回目まで反映）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（data/sb_secs.py で入れる）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。key は一覧の番号と同じ（01〜。並べた順に自動で付く）。
// 意味の色（この回。outline.md の企画カード・script.md の頭のメモ）：
//   青緑（teal）＝財布（手取り）／赤（debt）＝値上がり（毎週のかご・母の赤い丸・頭の中の目盛り・不安）／
//   灰（other）＝家電（めったに買わない物）／金（gold）＝保険料・年金。物価全体は墨。満足の割合は灰。
//   赤は「値上がりにだけ付く赤いペン」と同じ色で、感じた物価・不安にも使う（締めの「同じ赤いペン」の回収）。
// 物語の場面は猫（彼＝plain、名札「息子（38）」）。父は写真立ての中の猫、母は家計簿の字だけ。データの人数も紫の猫。
// 比喩：毎週のかご（買い物かご。重さ＝値上がり）、物差し（物価を測る3本）、頭の中の目盛り（感じた物価。赤い針）、明日のかご（点線のかご）。
// 助言に見える強調はしない（「〜すべき」の札を出さない）。比の図には1倍の線。期間は端の年だけで重ねない（4つの年を並べる）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cat, CatLabel } from "@lib/Cat";
import type { CatFace, CatPose } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { TodayCard } from "@lib/Cards";
import { Gosa } from "@lib/Gosa";
import { Note } from "@lib/Labels";
import { LineChart } from "@lib/LineChart";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import { SplitClaim } from "@lib/SplitClaim";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Thought } from "@lib/StoryAnim";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero" | "sub";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（幅1300まで。右上の章の点とぶつけない） */
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1300, ...font("question"), lineHeight: 1.2 }}>{children}</div>
);
const SubHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 150, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{children}</div>
);
const ink = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** 横棒1本（左に名前、棒の右に値） */
const HBar: React.FC<{ x: number; y: number; w: number; h?: number; color: string; name: string; value: string; nameW?: number; dashed?: boolean; valueX?: number }> = (
  { x, y, w, h = 84, color, name, value, dashed, valueX },
) => (
  <g>
    <text x={x - 28} y={y + h / 2 + 14} textAnchor="end" style={font("label")} fontWeight={900}>{name}</text>
    <rect data-qa="mark" data-qa-label={`横棒：${name}`} x={x} y={y} width={Math.max(w, 4)} height={h} rx={R.sm}
      fill={dashed ? C.bg : color} stroke={dashed ? color : "none"} strokeWidth={dashed ? LINE.thin : 0} strokeDasharray={dashed ? "16 10" : undefined} />
    <text x={valueX ?? x + Math.max(w, 4) + 24} y={y + h / 2 + 22} style={font("value", C.ink)}>{value}</text>
  </g>
);

/** 母の家計簿（見開きの片側）。字は細い線で描き、数字は書かない（作った値を出さない）。circles の行の値に赤い丸 */
const ITEMS = ["卵", "牛乳", "食パン", "ガソリン", "豆腐", "しょうゆ"];
const Ledger: React.FC<{ x: number; y: number; s?: number; circles?: number[]; down?: number[]; label?: string }> = (
  { x, y, s = 1, circles = [0, 2, 3], down = [], label = "母の家計簿" },
) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} data-qa="mark" data-qa-label={label}>
    <rect x={0} y={0} width={420} height={520} rx={R.sm} fill={C.white} {...ink} />
    <rect x={0} y={0} width={420} height={56} rx={R.sm} fill={C.paper2} {...ink} />
    <path d="M150 56 V520" stroke={C.rest} strokeWidth={LINE.hair} />
    {ITEMS.map((name, i) => {
      const yy = 104 + i * 72;
      return (
        <g key={name}>
          <line x1={20} x2={400} y1={yy + 22} y2={yy + 22} stroke={C.rest} strokeWidth={2} />
          {s >= 0.6 && <text x={24} y={yy + 10} style={{ ...font("note", C.ink2), fontSize: Math.max(30, 29 / s) }}>{name}</text>}
          {/* 細い字の値（波線で描く） */}
          <path d={`M188 ${yy + 2} q12 -14 24 0 t24 0 t24 0`} fill="none" stroke={C.ink2} strokeWidth={3} />
          <path d={`M300 ${yy + 2} q12 -14 24 0 t24 0 t24 0`} fill="none" stroke={C.ink2} strokeWidth={3} />
          {circles.includes(i) && <path d={`M268 ${yy + 8} l14 -24 l14 24`} fill="none" stroke={C.debt} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
          {circles.includes(i) && <ellipse cx={336} cy={yy - 2} rx={58} ry={28} fill="none" stroke={C.debt} strokeWidth={LINE.thin} />}
          {down.includes(i) && <path d={`M268 ${yy - 22} l14 22 l14 -22`} fill="none" stroke={C.rest} strokeWidth={3} />}
        </g>
      );
    })}
  </g>
);
/** 給与明細（輪ゴムでとめた束の一番上）。数字は書かず、行の線だけ */
const Payslip: React.FC<{ x: number; y: number; s?: number; year?: string }> = ({ x, y, s = 1, year = "1995" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} data-qa="mark" data-qa-label="父の給与明細">
    {[16, 8].map((d) => <rect key={d} x={d} y={-d} width={360} height={240} rx={6} fill={C.paper2} {...ink} strokeWidth={3} />)}
    <rect x={0} y={0} width={360} height={240} rx={6} fill={C.white} {...ink} />
    <text x={24} y={46} style={{ ...font("note"), fontSize: Math.max(28, 29 / s), fontWeight: 900 }}>給与明細</text>
    <text x={336} y={46} textAnchor="end" style={{ ...font("note", C.ink2), fontSize: Math.max(28, 29 / s) }}>{year}</text>
    {[80, 120, 160, 200].map((yy) => <line key={yy} x1={24} x2={336} y1={yy} y2={yy} stroke={C.rest} strokeWidth={3} />)}
    <rect x={-6} y={100} width={372} height={14} rx={7} fill={C.debtTint} stroke={C.ink2} strokeWidth={2} />
  </g>
);
/** 買い物かご。fill＝重さ（0〜1。中身の量）。dashed で「明日のかご」（まだ手に取っていない） */
const Basket: React.FC<{ x: number; y: number; s?: number; fill?: number; dashed?: boolean; label?: string; color?: string }> = (
  { x, y, s = 1, fill = 0.6, dashed = false, label = "かご", color = C.debt },
) => {
  const st = dashed ? { stroke: C.ink2, strokeWidth: LINE.thin, strokeDasharray: "14 10", fill: "none" } : { ...ink, fill: C.white };
  const h = 90 * fill;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} data-qa="mark" data-qa-label={label}>
      <path d="M-120 -150 Q0 -260 120 -150" fill="none" {...(dashed ? { stroke: C.ink2, strokeWidth: LINE.thin, strokeDasharray: "14 10" } : ink)} />
      {!dashed && fill > 0 && (
        <g>
          <rect x={-100} y={-120 - h + 20} width={80} height={h + 10} rx={10} fill={C.debtTint} stroke={C.ink2} strokeWidth={3} />
          <ellipse cx={20} cy={-110 - h * 0.6 + 20} rx={44} ry={36} fill={color} opacity={0.9} />
          <rect x={56} y={-120 - h * 0.8 + 10} width={46} height={h * 0.8 + 20} rx={8} fill={C.white} stroke={C.ink2} strokeWidth={3} />
        </g>
      )}
      {dashed && (
        <g fill="none" stroke={C.rest} strokeWidth={LINE.hair} strokeDasharray="10 8">
          <rect x={-100} y={-180} width={80} height={70} rx={10} />
          <ellipse cx={20} cy={-150} rx={44} ry={36} />
          <rect x={56} y={-190} width={46} height={90} rx={8} />
        </g>
      )}
      <path d="M-140 -130 L140 -130 L110 0 L-110 0 Z" {...st} />
      {!dashed && [-70, 0, 70].map((dx) => <line key={dx} x1={dx} y1={-120} x2={dx * 0.85} y2={-10} stroke={C.ink2} strokeWidth={3} />)}
      {!dashed && <line x1={-128} y1={-70} x2={128} y2={-70} stroke={C.ink2} strokeWidth={3} />}
    </g>
  );
};
/** 物差し（物価を測る道具）。color は意味の色、name は左の名前 */
const Ruler: React.FC<{ x: number; y: number; w: number; color: string; name: string }> = ({ x, y, w, color, name }) => (
  <g data-qa="mark" data-qa-label={`物差し：${name}`}>
    <rect x={x} y={y} width={w} height={64} rx={R.sm} fill={C.white} stroke={color} strokeWidth={LINE.base} />
    {Array.from({ length: Math.floor(w / 40) }, (_, i) => (
      <line key={i} x1={x + 20 + i * 40} x2={x + 20 + i * 40} y1={y} y2={y + (i % 5 === 0 ? 34 : 20)} stroke={color} strokeWidth={LINE.hair} />
    ))}
    <text x={x - 28} y={y + 46} textAnchor="end" style={font("label")} fontWeight={900}>{name}</text>
  </g>
);
/** 頭の中の目盛り（半円のメーター。赤い針＝感じた値、墨の短い線＝実際の値） */
const Gauge: React.FC<{ cx: number; cy: number; r?: number; felt: number; real?: number; max?: number; label?: string }> = (
  { cx, cy, r = 220, felt, real, max = 20, label = "頭の中の目盛り" },
) => {
  const ang = (v: number) => Math.PI - (Math.min(v, max) / max) * Math.PI;
  const pt = (v: number, rr: number) => [cx + Math.cos(ang(v)) * rr, cy - Math.sin(ang(v)) * rr];
  const [fx, fy] = pt(felt, r - 30);
  return (
    <g data-qa="mark" data-qa-label={label}>
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill={C.white} {...ink} />
      {Array.from({ length: max / 5 + 1 }, (_, i) => {
        const [a, b] = pt(i * 5, r), [c, d] = pt(i * 5, r - 34), [tx, ty] = pt(i * 5, r + 40);
        return (
          <g key={i}>
            <line x1={a} y1={b} x2={c} y2={d} stroke={C.ink} strokeWidth={LINE.hair} />
            <text x={tx} y={ty + 10} textAnchor="middle" style={font("note", C.ink2)}>{i * 5}%</text>
          </g>
        );
      })}
      {real !== undefined && (() => { const [a, b] = pt(real, r - 30); return <line x1={cx} y1={cy} x2={a} y2={b} stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" />; })()}
      <line x1={cx} y1={cy} x2={fx} y2={fy} stroke={C.debt} strokeWidth={LINE.heavy} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill={C.debt} />
    </g>
  );
};

/** 真ん中の線（1倍・父＝100）から左右に伸びる棒。pct は変化の%（＋は右） */
const Diverge: React.FC<{ rows: { name: string; pct: number; color: string }[]; cx?: number; k?: number; y0?: number; base: string }> = (
  { rows, cx = 1100, k = 20, y0 = 300, base },
) => (
  <Svg>
    {rows.map((r, i) => {
      const y = y0 + i * 150, w = Math.abs(r.pct) * k, x = r.pct >= 0 ? cx : cx - w;
      const txt = `${r.pct > 0 ? "＋" : "−"}${Math.abs(r.pct)}%`;
      return (
        <g key={r.name}>
          <text x={500} y={y + 56} textAnchor="end" style={font("label")} fontWeight={900}>{r.name}</text>
          <rect data-qa="mark" data-qa-label={`横棒：${r.name}`} x={x} y={y} width={Math.max(w, 4)} height={84} rx={R.sm} fill={r.color} />
          <text x={r.pct >= 0 ? cx + w + 24 : cx - w - 24} y={y + 64} textAnchor={r.pct >= 0 ? "start" : "end"} style={font("value")}>{txt}</text>
        </g>
      );
    })}
    <line x1={cx} x2={cx} y1={y0 - 40} y2={y0 + rows.length * 150 - 30} stroke={C.ink} strokeWidth={LINE.thin} />
    <text x={cx} y={y0 - 54} textAnchor="middle" style={font("note", C.ink2)}>{base}</text>
  </Svg>
);
/** 財布（二つ折り。留め具と札の端） */
const Wallet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} data-qa="mark" data-qa-label="財布">
    <rect x={-90} y={-112} width={60} height={70} rx={4} fill={C.white} stroke={C.ink2} strokeWidth={3} transform="rotate(-8)" />
    <rect x={-40} y={-118} width={60} height={70} rx={4} fill={C.white} stroke={C.ink2} strokeWidth={3} />
    <rect x={-130} y={-80} width={260} height={160} rx={R.md} fill={C.teal} {...ink} />
    <path d="M-130 -10 H130" stroke={C.ink} strokeWidth={LINE.hair} />
    <rect x={40} y={-36} width={90} height={60} rx={R.sm} fill={C.tealTint} {...ink} strokeWidth={4} />
    <circle cx={104} cy={-6} r={10} fill={C.white} {...ink} strokeWidth={3} />
  </g>
);

// ================= 実家の押し入れ（冒頭・教訓で同じ部屋） =================
const F = { floor: 830, catX: 1260, size: 5.4 };
const Closet: React.FC<{ evening?: boolean }> = ({ evening }) => (
  <Svg>
    <g data-qa="bg" data-qa-label="実家の押し入れ">
      <rect x={0} y={0} width={1920} height={F.floor} fill={C.wall} />
      <rect x={0} y={F.floor} width={1920} height={260} fill={C.floor} />
      <line x1={0} x2={1920} y1={F.floor} y2={F.floor} {...ink} />
      {/* 押し入れ（ふすまが片側だけ開いている。中は暗い） */}
      <rect x={120} y={140} width={820} height={690} fill={C.paper2} {...ink} />
      <rect x={130} y={150} width={400} height={670} fill={C.night} opacity={0.82} />
      <line x1={130} x2={530} y1={470} y2={470} stroke={C.ink} strokeWidth={LINE.base} />
      <rect x={180} y={380} width={160} height={90} fill={C.floor} {...ink} strokeWidth={3} />
      <rect x={360} y={400} width={140} height={70} fill={C.paper2} {...ink} strokeWidth={3} />
      <rect x={530} y={150} width={400} height={670} fill={C.white} {...ink} />
      <rect x={560} y={180} width={340} height={610} fill="none" stroke={C.rest} strokeWidth={LINE.hair} />
      <circle cx={570} cy={490} r={12} fill="none" stroke={C.ink2} strokeWidth={3} />
      {/* 窓の昼の光 */}
      <rect x={1500} y={170} width={300} height={260} rx={R.sm} fill={evening ? C.goldTint : C.bg} {...ink} />
      <path d="M1650 170 V430 M1500 300 H1800" {...ink} />
    </g>
  </Svg>
);
const Room: React.FC<{ face?: CatFace; pose?: CatPose; look?: [number, number]; children?: React.ReactNode; name?: boolean; evening?: boolean }> = (
  { face = "think", pose = "sit", look, children, name, evening },
) => (
  <>
    <Closet evening={evening} />
    <Svg>
      <Cat kind="plain" x={F.catX} y={F.floor} size={F.size} pose={pose} face={face} facing={-1} look={look} label="彼" />
      {name && <CatLabel x={F.catX} y={F.floor} size={F.size} text="息子（38）" />}
      {children}
    </Svg>
  </>
);
/** 父の写真立て（1995年の父＝猫。38歳） */
const FatherPhoto: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="mark" data-qa-label="父の写真立て">
    <rect x={x} y={y} width={240} height={280} rx={R.sm} fill={C.white} {...ink} />
    <rect x={x + 22} y={y + 22} width={196} height={190} fill={C.paper2} />
    <Cat kind="plain" x={x + 120} y={y + 212} size={3.2} pose="stand" face="smile" label="1995年の父" seed={3} />
    <text x={x + 120} y={y + 258} textAnchor="middle" style={{ ...font("note"), fontWeight: 700 }}>1995年</text>
  </g>
);

const SRC = {
  takehome: "賃金構造基本統計調査（男性35〜39歳）から筆者が計算。独身・扶養なし・会社員",
  boj: "日本銀行「生活意識に関するアンケート調査」（1998〜2026年、各年1回）",
  bojFelt: "日本銀行「生活意識に関するアンケート調査」（2006〜2026年の6月調査）、総務省 消費者物価指数",
  life: "厚生労働省「国民生活基礎調査」（1995年は兵庫県を除く）",
  cpiFreq: "総務省「消費者物価指数」購入頻度階級別指数（持家の帰属家賃を除く総合から作る参考指数）",
  cpi2025: "総務省「消費者物価指数」購入頻度階級別指数（2025年平均の前年比）、日本銀行（2025年6月調査）",
  pew: "Pew Research Center 2017（50年前と比べた今の暮らし）",
  bojWP: "日本銀行ワーキングペーパー（髙橋・玉生 2022）",
  freq: "Georganas ほか 2014（頻度バイアス）、D'Acunto ほか 2021（アメリカの家計）",
  rome: "イタリア銀行 2007（ローマの映画館。ユーロ前の入場料）",
  retail: "総務省「小売物価統計調査」東京都区部（年平均）",
  real: "総務省「消費者物価指数」購入頻度階級別指数から筆者が計算（2025年÷1995年）",
  naikaku: "内閣府「国民生活に関する世論調査」（面接 1995年5月・2019年6月）",
  jflec: "金融経済教育推進機構「家計の金融行動に関する世論調査」（二人以上世帯）",
  pop: "総務省 人口推計、国立社会保障・人口問題研究所（2050年は中位推計）",
  pension: "厚生年金保険法、厚生労働省「2024年財政検証」",
  naikakuNew: "内閣府「国民生活に関する世論調査」（郵送 2021〜2025年）",
};

// ================= 冒頭 =================
export const S01: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.paper2} />
      <Ledger x={560} y={110} s={1.5} circles={[0, 2, 3]} />
      <Label x={1240} y={400} color={C.ink2}>前の週より</Label>
      <Label x={1240} y={460} color={C.ink2}>値上がりした物に</Label>
      <Label x={1240} y={540} color={C.debt} weight={900}>赤い丸</Label>
    </Svg>
  </AbsoluteFill>
);
export const S02: React.FC = () => (
  <AbsoluteFill>
    <Room face="surprised" pose="sit" look={[-1, 0.4]} name>
      <Payslip x={640} y={640} s={0.9} />
      <Ledger x={300} y={600} s={0.42} />
      <FatherPhoto x={1500} y={480} />
    </Room>
    <div style={{ position: "absolute", left: 660, top: 470, ...font("value", C.debt), whiteSpace: "nowrap" }}>1995年</div>
  </AbsoluteFill>
);
const PAY = { y0: 330, h: 360, max: 520 };
export const S03: React.FC = () => {
  const bar = (x: number, v: number, who: string, year: string) => {
    const hh = (v / PAY.max) * PAY.h;
    return (
      <g>
        <rect data-qa="mark" data-qa-label={`手取り：${who}`} x={x} y={PAY.y0 + PAY.h - hh} width={260} height={hh} rx={R.sm} fill={C.teal} />
        <text x={x + 130} y={PAY.y0 + PAY.h - hh - 28} textAnchor="middle" style={font("value")}>約470万円</text>
        <text x={x + 130} y={PAY.y0 + PAY.h + 56} textAnchor="middle" style={font("label")} fontWeight={900}>{who}</text>
        <text x={x + 130} y={PAY.y0 + PAY.h + 100} textAnchor="middle" style={font("note", C.ink2)}>{year}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <Heading>38歳の手取り（年）</Heading>
      <SubHead>同じ年ごろの男性の平均から計算</SubHead>
      <Svg>
        <line x1={420} x2={1300} y1={PAY.y0 + PAY.h} y2={PAY.y0 + PAY.h} stroke={C.ink} strokeWidth={LINE.thin} />
        {bar(520, 474.5, "父", "1995年")}
        {bar(940, 472.8, "彼", "2025年")}
        <line x1={480} x2={1240} y1={PAY.y0 + PAY.h - (474.5 / PAY.max) * PAY.h} y2={PAY.y0 + PAY.h - (474.5 / PAY.max) * PAY.h} stroke={C.ink} strokeWidth={LINE.hair} strokeDasharray="12 10" />
        <Cat kind="plain" x={1560} y={760} size={3.6} pose="stand" face="think" label="彼" />
      </Svg>
      <SourceNote text={SRC.takehome} />
    </AbsoluteFill>
  );
};
export const S04: React.FC = () => (
  <AbsoluteFill>
    <Heading>物価高の前の24年（1995→2019年）</Heading>
    <Svg>
      <Label x={120} y={300} color={C.ink2}>物価全体</Label>
      <Label x={520} y={300} size="value">1.05倍</Label>
      <Label x={780} y={300} color={C.ink2}>（ほぼ横ばい）</Label>
      <Label x={120} y={460} color={C.ink2}>生活が苦しいと答える世帯（全体＝100%）</Label>
      <rect x={520} y={500} width={1000} height={84} rx={R.sm} fill="none" stroke={C.rest} strokeWidth={LINE.hair} />
      <rect x={520} y={630} width={1000} height={84} rx={R.sm} fill="none" stroke={C.rest} strokeWidth={LINE.hair} />
      <HBar x={520} y={500} w={1000 * 0.42} color={C.debtTint} name="1995年" value="42%" />
      <HBar x={520} y={630} w={1000 * 0.544} color={C.debt} name="2019年" value="54%" />
    </Svg>
    <SourceNote text="総務省「消費者物価指数」、厚生労働省「国民生活基礎調査」（1995年は兵庫県を除く）" />
  </AbsoluteFill>
);
export const S05: React.FC = () => (
  <AbsoluteFill>
    <Room face="think" pose="sit" look={[0.4, -0.6]}>
      <Payslip x={640} y={640} s={0.9} />
      <Ledger x={300} y={600} s={0.42} />
    </Room>
    <Svg><Thought x={1010} y={190} w={760} text={"手取りは同じ。物価も動かない。\nなのに、なぜ苦しい？"} toward={[1240, 470]} role="label" /></Svg>
  </AbsoluteFill>
);
export const S06: React.FC = () => (
  <AbsoluteFill>
    <TodayCard claim="今の世代は親より苦しくなった" />
    <Gosa cues={[[0, "skeptical"]]} />
  </AbsoluteFill>
);
/** 予想の前提：苦しい世帯が増えたなら、満足は下がるはず（向きだけ。数字は答えまで出さない） */
export const S07a: React.FC = () => (
  <AbsoluteFill>
    <Heading>苦しい世帯が増えたなら……</Heading>
    <Svg>
      <rect data-qa="mark" data-qa-label="苦しい世帯の札" x={220} y={300} width={620} height={360} rx={R.lg} fill={C.white} {...ink} />
      <Label x={530} y={400} anchor="middle" color={C.ink2}>生活が苦しい世帯</Label>
      <path data-qa="mark" data-qa-label="上向きの矢印" d="M530 620 V470 M480 520 L530 470 L580 520" fill="none" stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" strokeLinejoin="round" />
      <rect data-qa="mark" data-qa-label="満足の札" x={1080} y={300} width={620} height={360} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="16 10" />
      <Label x={1390} y={400} anchor="middle" color={C.ink2}>暮らしへの満足</Label>
      <path data-qa="mark" data-qa-label="下向きの矢印（予想）" d="M1390 470 V620 M1340 570 L1390 620 L1440 570" fill="none" stroke={C.other} strokeWidth={LINE.heavy} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20 14" />
      <Label x={1520} y={560} size="value" color={C.other}>？</Label>
      <Label x={960} y={500} anchor="middle" size="value">→</Label>
    </Svg>
  </AbsoluteFill>
);
export const S07: React.FC = () => (
  <AbsoluteFill>
    <Quiz question={"今の生活に満足と答えた人は、\n1995年→2019年でどう動いた？"} choices={["大きく減った", "少し減った", "ほとんど変わらない", "大きく増えた"]} />
  </AbsoluteFill>
);
export const S08: React.FC = () => (
  <AbsoluteFill>
    <Heading>数える順番</Heading>
    <Svg>
      {[
        { x: 420, name: "財布", draw: (x: number) => <Wallet x={x} y={460} /> },
        { x: 960, name: "毎週の買い物", draw: (x: number) => <Basket x={x} y={540} s={0.85} fill={0.7} /> },
        { x: 1500, name: "この先の見通し", draw: (x: number) => <Basket x={x} y={540} s={0.85} dashed label="明日のかご" /> },
      ].map((c, i) => (
        <g key={c.name}>
          {c.draw(c.x)}
          <text x={c.x} y={650} textAnchor="middle" style={font("label")} fontWeight={900}>{`${i + 1}. ${c.name}`}</text>
        </g>
      ))}
    </Svg>
  </AbsoluteFill>
);

// ================= 第1章 =================
const LADDER = [
  { name: "額面", v: 25.6, color: C.tealTint, text: "＋25.6万円" },
  { name: "保険料", v: -30.7, color: C.gold, text: "−30.7万円" },
  { name: "税", v: 3.4, color: C.rest, text: "＋3.4万円" },
];
const S09Base: React.FC<{ upto: number }> = ({ upto }) => {
  const X = 420, Y0 = 560, k = 7;
  let acc = 0;
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>父→彼で、手取りの何が変わった？</Heading>
      <SubHead>1年分。上は手取りが増える向き、下は減る向き</SubHead>
      <Svg>
        <line x1={300} x2={1700} y1={Y0} y2={Y0} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="12 10" />
        <text x={290} y={Y0 + 12} textAnchor="end" style={font("note", C.ink2)}>父の手取り</text>
        {LADDER.map((s, i) => {
          const a = acc, b = acc + s.v; acc = b;
          if (i >= upto) return null;
          const top = Y0 - Math.max(a, b) * k, hh = Math.abs(s.v) * k;
          const x = X + i * 340;
          return (
            <g key={s.name}>
              <rect data-qa="mark" data-qa-label={`はしご：${s.name}`} x={x} y={top} width={200} height={hh} rx={R.sm} fill={s.color} />
              <text x={x + 100} y={s.v > 0 ? top - 24 : top + hh + 60} textAnchor="middle" style={font("value")}>{s.text}</text>
              <text x={x + 100} y={780} textAnchor="middle" style={font("label")} fontWeight={900}>{s.name}</text>
            </g>
          );
        })}
        {upto > 3 && <><rect data-qa="mark" data-qa-label="はしご：手取りの差" x={X + 3 * 340} y={Y0} width={200} height={1.7 * k} rx={4} fill={C.teal} />
        <text x={X + 3 * 340 + 100} y={Y0 - 30} textAnchor="middle" style={font("value", C.teal)}>ほぼ同じ</text>
        <text x={X + 3 * 340 + 100} y={Y0 + 64} textAnchor="middle" style={font("label")}>−1.7万円</text>
        <text x={X + 3 * 340 + 100} y={780} textAnchor="middle" style={font("label")} fontWeight={900}>手取り</text></>}
      </Svg>
      <SourceNote text={SRC.takehome} />
    </AbsoluteFill>
  );
};
export const S09: React.FC = () => <S09Base upto={2} />;
export const S09b: React.FC = () => <S09Base upto={4} />;
const BOJ: [number, number, number][] = [
  [1998, 47.7, 5.2], [1999, 46.6, 4.4], [2000, 46.2, 5.1], [2001, 47.8, 5.2], [2002, 50.7, 5.5], [2003, 54.4, 3.8], [2004, 50.7, 5.2], [2005, 49.3, 5.4],
  [2006, 41.8, 4.8], [2007, 43.0, 5.0], [2008, 61.6, 3.4], [2009, 59.6, 2.6], [2010, 51.2, 3.2], [2011, 50.4, 4.0], [2012, 47.0, 3.6], [2013, 39.2, 4.9],
  [2014, 43.7, 3.9], [2015, 46.2, 4.5], [2016, 44.6, 4.3], [2017, 38.8, 5.9], [2018, 40.2, 7.1], [2019, 40.5, 6.0], [2020, 42.6, 5.0], [2021, 37.3, 5.3],
  [2022, 43.2, 3.7], [2023, 56.8, 4.1], [2024, 55.7, 3.6], [2025, 61.0, 3.8], [2026, 55.0, 4.8],
];
export const S10: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>1年前と比べて、暮らし向きは？</Heading>
    <LineChart x={200} y={230} width={1100} height={520} xDomain={[1998, 2026]} yDomain={[0, 70]} xTicks={[1998, 2008, 2019, 2026]} format={(v) => `${v}%`}
      series={[
        { label: "苦しくなった", points: BOJ.map(([y, a]) => [y, a]), color: C.debt, focus: true },
        { label: "ゆとりが出てきた", points: BOJ.map(([y, , b]) => [y, b]), color: C.other },
      ]} />
    <Svg><Label x={1560} y={520} color={C.ink2}>どの回も</Label><Label x={1560} y={580} weight={900}>5倍以上</Label></Svg>
    <SourceNote text={SRC.boj} />
  </AbsoluteFill>
);
export const S11: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>毎年本当に苦しくなっていたら？</Heading>
    <Svg>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} data-qa="mark" data-qa-label={`下る階段${i}`} x={240 + i * 150} y={300 + i * 60} width={150} height={60} fill={i < 6 ? C.paper2 : C.otherTint} {...ink} strokeWidth={3} />
      ))}
      <Cat kind="plain" x={1320} y={820} size={2.6} pose="down" face="sad" label="とっくに立ち行かない" />
      <Label x={1500} y={460} color={C.ink2}>積み重なれば</Label>
      <Label x={1500} y={520} weight={900}>とっくに</Label>
      <Label x={1500} y={580} weight={900}>立ち行かない</Label>
    </Svg>
  </AbsoluteFill>
);
export const S12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>なら、苦しいのは気のせい？</Heading>
    <Svg>
      <rect data-qa="mark" x={140} y={260} width={760} height={420} rx={R.lg} fill={C.white} {...ink} />
      <Label x={180} y={330} color={C.ink2}>日本銀行の質問</Label>
      <Label x={180} y={420} weight={900}>「1年前と比べて」</Label>
      <Label x={180} y={500}>去年との比べっこ</Label>
      <rect data-qa="mark" x={1020} y={260} width={760} height={420} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={1060} y={330} color={C.ink2}>国民生活基礎調査の質問</Label>
      <Label x={1060} y={420} weight={900}>「いまの暮らしは」</Label>
      <Label x={1060} y={500}>生活が苦しい世帯 5割半ば</Label>
      <Label x={1060} y={620} color={C.ink2}>去年と比べた答えではない</Label>
    </Svg>
    <SourceNote text={`${SRC.boj}、${SRC.life}`} />
  </AbsoluteFill>
);
export const S13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>50年前と比べて、今の暮らしは？</Heading>
    <Svg>
      <rect data-qa="mark" data-qa-label="100%" x={360} y={330} width={1200} height={150} rx={R.sm} fill={C.otherTint} />
      <rect data-qa="mark" data-qa-allow="mark" data-qa-label="今のほうが良い" x={360} y={330} width={1200 * 0.65} height={150} rx={R.sm} fill={C.ink} />
      <text x={380} y={430} style={font("value", C.white)}>今のほうが良い 65%</text>
      <Label x={360} y={560} color={C.ink2}>日本人（2017年の国際調査）</Label>
      <Label x={360} y={660} weight={900}>昔を懐かしがっているわけでもなさそう</Label>
    </Svg>
    <SourceNote text={SRC.pew} />
  </AbsoluteFill>
);
export const S14: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Svg>
      {[
        { x: 400, name: "財布の中身" }, { x: 960, name: "気のせい" }, { x: 1520, name: "懐かしさ" },
      ].map((c) => (
        <g key={c.name}>
          <rect data-qa="mark" data-qa-label={`消した理由：${c.name}`} x={c.x - 220} y={300} width={440} height={200} rx={R.lg} fill={C.white} stroke={C.rest} strokeWidth={LINE.thin} />
          <text x={c.x} y={420} textAnchor="middle" style={font("value", C.other)}>{c.name}</text>
          <line x1={c.x - 180} x2={c.x + 180} y1={400} y2={400} stroke={C.ink2} strokeWidth={LINE.base} />
        </g>
      ))}
    </Svg>
    <Note x={420} y={600} question text="何が、彼を苦しめているのか？" />
  </AbsoluteFill>
);

// ================= 第2章 =================
export const S15: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>物価を測る物差しは、1本ではない</Heading>
    <SubHead>総務省は、1年に何回買うかで分けた物価も出している</SubHead>
    <Svg>
      <Ruler x={560} y={300} w={1000} color={C.ink} name="物価全体" />
      <Ruler x={560} y={460} w={1000} color={C.debt} name="毎週のかご" />
      <Ruler x={560} y={620} w={1000} color={C.other} name="家電" />
      <Label x={560} y={420} color={C.ink2}>家計の買い物すべて</Label>
      <Label x={560} y={580} color={C.ink2}>年15回以上買う物（卵・パン・ガソリン）</Label>
      <Label x={560} y={740} color={C.ink2}>めったに買わない物（テレビ・パソコン）</Label>
    </Svg>
    <SourceNote text={SRC.cpiFreq} />
  </AbsoluteFill>
);
const Ratio: React.FC<{ rows: { name: string; v: number; color: string; text: string }[]; y0?: number; k?: number }> = ({ rows, y0 = 280, k = 1100 }) => {
  const X = 560, one = X + k * 0.8;
  return (
    <Svg>
      {rows.map((r, i) => <HBar key={r.name} x={X} y={y0 + i * 150} w={k * r.v * 0.8} color={r.color} name={r.name} value={r.text} />)}
      <line x1={one} x2={one} y1={y0 - 40} y2={y0 + rows.length * 150 - 30} stroke={C.ink} strokeWidth={LINE.hair} strokeDasharray="12 10" />
      <text x={one} y={y0 - 54} textAnchor="middle" style={font("note", C.ink2)}>1995年＝1倍</text>
    </Svg>
  );
};
export const S16: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>1995→2019年、3本の物差しで</Heading>
    <Diverge base="1995年と同じ" rows={[
      { name: "物価全体", pct: 5, color: C.ink },
      { name: "毎週のかご", pct: 19, color: C.debt },
      { name: "家電", pct: -18, color: C.other },
    ]} />
    <Svg><Label x={560} y={740} color={C.ink2}>家電の値下がりは、同じ値段で性能が上がった分を含む</Label></Svg>
    <SourceNote text={SRC.cpiFreq} />
  </AbsoluteFill>
);
export const S17: React.FC = () => {
  const rows: [string, string, string][] = [["1995年", "42%", "84.7"], ["1998年", "52%", "91.7"], ["2014年", "62%", "98.2"], ["2019年", "54%", "100.5"]];
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>苦しい世帯と、かごの重さ</Heading>
      <SubHead>端の2つの年だけでなく、4つの年で並べる</SubHead>
      <Svg>
        <Label x={500} y={300} anchor="middle" color={C.ink2}>年</Label>
        <Label x={860} y={300} anchor="middle" color={C.ink2}>生活が苦しい世帯</Label>
        <Label x={1380} y={300} anchor="middle" color={C.ink2}>毎週のかご（2020年＝100）</Label>
        {rows.map(([y, a, b], i) => (
          <g key={y}>
            <line x1={400} x2={1720} y1={330 + i * 110} y2={330 + i * 110} stroke={C.rest} strokeWidth={LINE.hair} />
            <Label x={500} y={400 + i * 110} anchor="middle" weight={900}>{y}</Label>
            <Label x={860} y={404 + i * 110} anchor="middle" size="value">{a}</Label>
            <Label x={1380} y={404 + i * 110} anchor="middle" size="value" color={C.debt}>{b}</Label>
          </g>
        ))}
      </Svg>
      <SourceNote text="厚生労働省「国民生活基礎調査」、総務省「消費者物価指数」購入頻度階級別指数" />
    </AbsoluteFill>
  );
};
export const S18: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>この1年で、物価は何%上がった？（2025年夏）</Heading>
    <Svg>
      <Gauge cx={620} cy={680} r={300} felt={15} real={4} />
      <Label x={620} y={770} anchor="middle" weight={900}>頭の中の目盛り</Label>
      <Label x={1120} y={380} color={C.ink2}>感じた（真ん中の人）</Label>
      <Label x={1120} y={460} size="value" color={C.debt}>15%</Label>
      <Label x={1120} y={570} color={C.ink2}>実際：よく買う物</Label>
      <Label x={1120} y={640} size="value">4%</Label>
      <Label x={1460} y={570} color={C.ink2}>物価全体</Label>
      <Label x={1460} y={640} size="value">3%台</Label>
    </Svg>
    <SourceNote text={SRC.cpi2025} />
  </AbsoluteFill>
);
export const S19: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>1割以上と感じているなら</Heading>
    <Svg>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <Cat kind="plain" x={300 + i * 135} y={640} size={2.2} pose="stand" face="normal" seed={i} label={`回答者${i}`} />
          {i < 5 && <g data-qa="mark" data-qa-label={`感じた吹き出し${i}`}>
            <ellipse cx={300 + i * 135} cy={380} rx={46} ry={36} fill={C.debtTint} stroke={C.debt} strokeWidth={LINE.thin} />
            <path d={`M${300 + i * 135} 396 v-30 m-14 14 l14 -14 l14 14`} fill="none" stroke={C.debt} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </g>}
        </g>
      ))}
      <path d="M230 690 V720 H935" fill="none" stroke={C.debt} strokeWidth={LINE.thin} />
      <path d="M935 720 H1010 M990 704 L1010 720 L990 736" fill="none" stroke={C.debt} strokeWidth={LINE.thin} strokeLinecap="round" />
      <Label x={635} y={790} anchor="middle" weight={900} color={C.debt}>半数より多い人が「1割以上」</Label>
    </Svg>
    <SourceNote text="日本銀行「生活意識に関するアンケート調査」（2025年6月）" />
  </AbsoluteFill>
);
const FELT: [number, number, number][] = [
  [2006, 3.6, 0.1], [2007, 3.7, 0.0], [2008, 10.2, 1.3], [2009, 3.5, -1.1], [2010, 1.6, -0.9], [2011, 3.6, -0.4], [2012, 3.2, 0.2], [2013, 3.1, -0.3],
  [2014, 4.1, 3.7], [2015, 6.1, 0.5], [2016, 4.9, -0.5], [2017, 4.3, 0.4], [2018, 4.6, 0.7], [2019, 4.6, 0.7], [2020, 4.8, 0.1], [2021, 3.9, -0.8],
  [2022, 8.1, 2.5], [2023, 14.7, 3.2], [2024, 15.7, 2.8], [2025, 19.5, 3.5], [2026, 16.5, 1.5],
];
export const S20: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>81回の調査で、毎回「感じた」が上</Heading>
    <SubHead>感じた物価は平均、実際は消費者物価の前年比（各年6月の1回を表示）</SubHead>
    <LineChart x={200} y={250} width={1240} height={500} xDomain={[2006, 2026]} yDomain={[-2, 20]} xTicks={[2006, 2013, 2019, 2026]} format={(v) => `${v}%`}
      series={[
        { label: "感じた物価", points: FELT.map(([y, a]) => [y, a]), color: C.debt, focus: true },
        { label: "実際の物価", points: FELT.map(([y, , b]) => [y, b]), color: C.ink },
      ]} />
    <SourceNote text={SRC.bojFelt} />
  </AbsoluteFill>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>よく買う物の値段で、物価全体を測ってしまう</Heading>
    <Svg>
      <Basket x={520} y={640} s={1.3} fill={0.9} label="毎週のかご" />
      <Label x={520} y={740} anchor="middle" weight={900}>加工食品・ガソリン</Label>
      <path d="M760 500 H1060" stroke={C.debt} strokeWidth={LINE.base} />
      <path d="M1060 480 L1096 500 L1060 520 Z" fill={C.debt} />
      <Gauge cx={1400} cy={640} r={220} felt={15} />
      <Label x={1400} y={740} anchor="middle" weight={900}>頭の中の目盛り</Label>
      <rect data-qa="mark" x={760} y={300} width={400} height={70} rx={R.md} fill={C.white} {...ink} />
      <Label x={960} y={348} anchor="middle" weight={900}>頻度バイアス</Label>
    </Svg>
    <SourceNote text={`${SRC.bojWP}、${SRC.freq}`} />
  </AbsoluteFill>
);
export const S22: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>値上がりは、値下がりより強く残る</Heading>
    <Svg>
      <Ledger x={240} y={240} s={1.05} circles={[0, 2, 3]} down={[1, 4]} />
      <Label x={1000} y={360} color={C.debt} weight={900}>値上がり → 赤い丸</Label>
      <Label x={1000} y={460} color={C.other} weight={900}>値下がり → 印なし</Label>
      <Label x={1000} y={620} color={C.ink2}>アメリカの家計を調べた研究でも</Label>
      <Label x={1000} y={680} color={C.ink2}>物価の見方は値上がりに大きく左右された</Label>
    </Svg>
    <SourceNote text={SRC.freq} />
  </AbsoluteFill>
);
export const S23: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>ローマの映画館：ユーロ前の入場料は？</Heading>
    <Svg>
      <g data-qa="mark" data-qa-label="映画館">
        <rect x={180} y={360} width={580} height={400} fill={C.paper2} {...ink} />
        <path d="M150 380 Q470 220 790 380 Z" fill={C.debtTint} {...ink} />
        {[250, 360, 470, 580, 690].map((x) => <path key={x} d={`M${x} 380 V330`} stroke={C.ink2} strokeWidth={3} />)}
        <rect x={270} y={420} width={400} height={70} rx={R.sm} fill={C.white} {...ink} strokeWidth={4} />
        <rect x={250} y={540} width={200} height={140} rx={R.sm} fill={C.night} {...ink} strokeWidth={4} />
        <rect x={500} y={540} width={200} height={220} fill={C.night} {...ink} strokeWidth={4} />
        <g transform="rotate(-10 380 630)"><rect x={320} y={600} width={130} height={60} rx={6} fill={C.goldTint} {...ink} strokeWidth={3} /><circle cx={340} cy={630} r={8} fill={C.paper2} /></g>
      </g>
      <Label x={470} y={470} anchor="middle" weight={900}>映画館</Label>
      <HBar x={1120} y={330} w={560} color={C.ink} name="実際" value="" />
      <HBar x={1120} y={480} w={560 * 0.69} color={C.debtTint} name="思い出した値段" value="約3割安い" />
      <Label x={1120} y={680} color={C.ink2}>正しく答えた人は</Label>
      <Label x={1480} y={688} size="value">8%</Label>
    </Svg>
    <SourceNote text={SRC.rome} />
  </AbsoluteFill>
);
export const S24: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Svg>
      <Ledger x={220} y={180} s={1.1} circles={[0, 2, 3]} />
      <Label x={760} y={420} color={C.ink2}>赤い丸には偏りがある</Label>
      <path d="M760 500 H1080" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M1080 480 L1116 500 L1080 520 Z" fill={C.ink} />
      <rect data-qa="mark" data-qa-label="国の記録" x={1160} y={300} width={560} height={420} rx={R.md} fill={C.white} {...ink} />
      <rect data-qa="mark" data-qa-label="国の記録の背" x={1130} y={292} width={44} height={436} rx={R.sm} fill={C.night} {...ink} />
      <Label x={1440} y={380} anchor="middle" weight={900}>国が毎年記録した物価</Label>
      {[440, 510, 580, 650].map((y) => <line key={y} x1={1210} x2={1670} y1={y} y2={y} stroke={C.rest} strokeWidth={LINE.hair} />)}
    </Svg>
    <Note x={760} y={120} question text="頭の中で、大きく見積もられただけ？" />
  </AbsoluteFill>
);
export const S25: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>東京の店先の値段（1995年→2025年）</Heading>
    <SubHead>棒の長さは、1995年を同じ長さにそろえた値上がり</SubHead>
    <Svg>
      <HBar x={560} y={300} w={100 * 4.8} color={C.debtTint} name="ガソリン 1995年" value="114円" />
      <HBar x={560} y={410} w={156 * 4.8} color={C.debt} name="2025年" value="178円（＋56%）" />
      <HBar x={560} y={560} w={100 * 4.8} color={C.debtTint} name="食パン1kg 1995年" value="408円" />
      <HBar x={560} y={670} w={131 * 4.8} color={C.debt} name="2025年" value="535円（＋31%）" />
    </Svg>
    <SourceNote text={`${SRC.retail}。ガソリンはレギュラー1L（1995年は現金売り）`} />
  </AbsoluteFill>
);
export const S26: React.FC = () => {
  const rows = [
    { name: "物価全体", v: 566.5, color: C.ink, text: "約570万円" },
    { name: "毎週のかご", v: 679.0, color: C.debt, text: "約680万円" },
    { name: "家電", v: 427.3, color: C.other, text: "約430万円" },
  ];
  const X = 560, k = 1.1;
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>父の470万円を、いまのお金に</Heading>
      <Svg>
        {rows.map((r, i) => <HBar key={r.name} x={X} y={260 + i * 130} w={r.v * k} color={r.color} name={r.name} value={r.text} valueX={1400} />)}
        <HBar x={X} y={660} w={472.8 * k} color={C.teal} name="彼の手取り" value="470万円" valueX={1400} />
        <line x1={X + 472.8 * k} x2={X + 472.8 * k} y1={230} y2={760} stroke={C.teal} strokeWidth={LINE.hair} strokeDasharray="12 10" />
      </Svg>
      <SourceNote text={SRC.real} />
    </AbsoluteFill>
  );
};
export const S27: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>同じ手取りで買える量（2025年）</Heading>
    <Diverge base="父と同じ" cx={1260} k={16} rows={[
      { name: "物価全体で測ると", pct: -17, color: C.ink },
      { name: "毎週のかごで", pct: -30, color: C.debt },
      { name: "家電で", pct: 11, color: C.other },
    ]} />
    <SourceNote text={SRC.real} />
  </AbsoluteFill>
);
export const S28: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Svg>
      <Gauge cx={460} cy={620} r={190} felt={15} real={4} />
      <Label x={460} y={720} anchor="middle" color={C.ink2}>頭の中の目盛り：ずれた</Label>
      <Basket x={1300} y={640} s={1.7} fill={0.9} label="毎週のかご" />
      <Label x={1300} y={740} anchor="middle" weight={900}>苦しいという感じ：当たっていた</Label>
    </Svg>
    <Note x={96} y={90} text="感じた数字は外れ、苦しさの向きは当たり" />
  </AbsoluteFill>
);

// ================= 第3章 =================
export const S29: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>同じ面接のやり方で、1995年と2019年</Heading>
    <Svg>
      <Label x={120} y={300} color={C.ink2}>悩みや不安を感じている</Label>
      <HBar x={560} y={330} w={1000 * 0.539} color={C.debtTint} name="1995年" value="54%" />
      <HBar x={560} y={430} w={1000 * 0.632} color={C.debt} name="2019年" value="63%" />
      <Label x={120} y={590} color={C.ink2}>不安がある人のうち、老後の生活設計</Label>
      <HBar x={560} y={620} w={1000 * 0.371} color={C.debtTint} name="1995年" value="4割足らず" />
      <HBar x={560} y={720} w={1000 * 0.567} color={C.debt} name="2019年" value="6割近く" />
    </Svg>
    <SourceNote text={SRC.naikaku} />
  </AbsoluteFill>
);
export const S30: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>「年金や保険が足りない」</Heading>
    <SubHead>老後が心配と答えた家計が挙げた理由（1998〜2019年）</SubHead>
    <Svg>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} data-qa="mark" data-qa-label={`10人に${i}`} x={300 + i * 130} y={360} width={100} height={260} rx={R.md} fill={i < 7 ? C.gold : C.otherTint} />
      ))}
      <Label x={300} y={700} size="value">7割前後</Label>
    </Svg>
    <SourceNote text={SRC.jflec} />
  </AbsoluteFill>
);
export const S31: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Svg>
      <Basket x={560} y={680} s={1.5} fill={0.9} label="毎週のかご" />
      <Label x={560} y={780} anchor="middle" weight={900}>毎週のかご</Label>
      <Basket x={1360} y={680} s={1.5} dashed label="明日のかご" />
      <Label x={1360} y={780} anchor="middle" weight={900}>明日のかご</Label>
      <Label x={1360} y={300} anchor="middle" color={C.ink2}>まだ手に取っていない、これから先</Label>
    </Svg>
  </AbsoluteFill>
);
const Supporters: React.FC<{ x: number; n: number; year: string; who: string }> = ({ x, n, year, who }) => (
  <g>
    <rect data-qa="mark" data-qa-label={`金の座布団 ${year}`} x={x - 90} y={508} width={180} height={28} rx={14} fill={C.gold} />
    <Cat kind="plain" x={x} y={512} size={2.0} pose="sit" face="normal" label={`65歳以上 ${year}`} />
    {Array.from({ length: Math.ceil(n) }, (_, i) => {
      const part = Math.min(1, n - i);
      return (
        <g key={i}>
          <Cat kind="plain" x={x - 180 + i * 90} y={700} size={1.6 * Math.max(part, 0.4)} pose="stand" face="normal" seed={i} label={`支える人 ${year} ${i}`} />
        </g>
      );
    })}
    <text x={x} y={270} textAnchor="middle" style={font("label")} fontWeight={900}>{year}</text>
    <text x={x} y={316} textAnchor="middle" style={font("note", C.ink2)}>{who}</text>
  </g>
);
export const S32: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>65歳以上1人を、何人で支える？</Heading>
    <SubHead>支える側は20〜64歳。小さい猫は1人に満たない分</SubHead>
    <Svg>
      <Supporters x={460} n={4.31} year="1995年" who="父が38歳" />
      <Supporters x={960} n={1.88} year="2025年" who="彼が38歳" />
      <Supporters x={1460} n={1.32} year="2050年" who="彼が63歳（見通し）" />
      <Label x={460} y={800} anchor="middle" size="value">4.3人</Label>
      <Label x={960} y={800} anchor="middle" size="value">1.9人</Label>
      <Label x={1460} y={800} anchor="middle" size="value">1.3人</Label>
    </Svg>
    <SourceNote text={SRC.pop} />
  </AbsoluteFill>
);
export const S33: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>保険料は止まり、年金の割合は下がる</Heading>
    <Svg>
      <Label x={120} y={300} color={C.ink2}>厚生年金の保険料の割合</Label>
      <line x1={160} x2={860} y1={400} y2={400} stroke={C.gold} strokeWidth={LINE.heavy} />
      <line x1={160} x2={860} y1={380} y2={380} stroke={C.ink} strokeWidth={LINE.hair} strokeDasharray="12 10" />
      <Label x={160} y={460}>2017年から 18.3%（2004年の法律の上限）</Label>
      <Label x={1020} y={300} color={C.ink2}>現役の手取りと比べた年金の割合</Label>
      <HBar x={1260} y={360} w={61.2 * 6} color={C.gold} name="2024年度" value="61%" />
      <HBar x={1260} y={490} w={57.6 * 6} color={C.goldTint} name="見通し" value="58%" />
      <HBar x={1260} y={620} w={50.4 * 6} color={C.goldTint} name="過去30年なみ" value="50%" />
      <Label x={120} y={780} color={C.ink2}>年金の額ではなく、その年の現役の手取りと比べた割合</Label>
    </Svg>
    <SourceNote text={SRC.pension} />
  </AbsoluteFill>
);
export const S34: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>これからの物価を気にする</Heading>
    <SubHead>お金を使うときに重視すること（複数回答）</SubHead>
    <Svg>
      <HBar x={560} y={340} w={1000 * 0.45} color={C.debtTint} name="2017年" value="4割半ば" />
      <HBar x={560} y={480} w={1000 * 0.725} color={C.debt} name="2025年" value="7割超" />
      <Basket x={360} y={760} s={0.7} dashed label="明日のかご（小）" />
    </Svg>
    <SourceNote text={SRC.boj} />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>1年後の自分の収入は？</Heading>
    <Svg>
      <Label x={120} y={300} color={C.ink2}>「増える」と答えた人</Label>
      <HBar x={560} y={330} w={1000 * 0.063} color={C.tealTint} name="2006〜12年平均" value="6%" />
      <HBar x={560} y={440} w={1000 * 0.108} color={C.teal} name="ここ5年平均" value="11%" />
      <Label x={120} y={640} weight={900}>「減る」と答える人のほうが多いのは、今も同じ</Label>
    </Svg>
    <SourceNote text={SRC.boj} />
  </AbsoluteFill>
);
export const S36: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Svg>
      <Basket x={560} y={680} s={1.4} fill={0.9} label="毎週のかご" />
      <Basket x={1360} y={680} s={1.4} dashed label="明日のかご" />
    </Svg>
    <Note x={360} y={150} question text={"今の世代は親の世代より苦しくなった、\nという説は、当たっていたのか？"} />
  </AbsoluteFill>
);

// ================= 答え合わせ・示唆・教訓 =================
export const S37: React.FC = () => (
  <AbsoluteFill>
    <SplitClaim x={96} y={200} name="苦しくなった" claim="今の世代は、親の世代より、お金の面で"
      hit="かごで測ると、買える量は約3割少ない" miss="手取りの額は、父とほぼ同じ" word="額なら外れ、かごなら当たり" />
  </AbsoluteFill>
);
export const S38: React.FC = () => (
  <AbsoluteFill>
    <Quiz question={"今の生活に満足と答えた人は、\n1995年→2019年でどう動いた？"} choices={["大きく減った", "少し減った", "ほとんど変わらない", "大きく増えた"]} answer={2} reveal />
  </AbsoluteFill>
);
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>1995→2019年（同じ面接のやり方）</Heading>
    <Svg>
      <Label x={120} y={280} color={C.ink2}>今の生活に満足（答えた人全員のうち）</Label>
      <HBar x={560} y={300} w={1000 * 0.727} color={C.otherTint} name="1995年" value="73%" />
      <HBar x={560} y={400} w={1000 * 0.738} color={C.other} name="2019年" value="74%" />
      <Label x={120} y={550} color={C.ink2}>老後の生活設計が不安（悩みや不安がある人のうち）</Label>
      <HBar x={560} y={570} w={1000 * 0.371} color={C.debtTint} name="1995年" value="37%" />
      <HBar x={560} y={670} w={1000 * 0.567} color={C.debt} name="2019年" value="57%" />
    </Svg>
    <SourceNote text={SRC.naikaku} />
  </AbsoluteFill>
);
const SUGGEST = [
  { head: "言えること", body: "財布の中身だけで比べると、苦しさを見誤る", color: C.ink },
  { head: "過去の数字で分かること", body: "感じた物価は、2006年から毎回、実際より高く出てきた", color: C.ink },
  { head: "言えないこと", body: "2019年より後も満足が変わらなかったかは言えない（調べ方が変わった）", color: C.ink2 },
  { head: "新しい調べ方では", body: "「生活が低下している」は2023年にかけて増え、その後も3割台", color: C.ink2 },
];
export const S40: React.FC = () => <Suggest cards={SUGGEST.slice(0, 2)} />;
export const S40b: React.FC = () => <Suggest cards={SUGGEST.slice(2)} />;
const Suggest: React.FC<{ cards: typeof SUGGEST }> = ({ cards }) => {
  return (
    <AbsoluteFill>
      <Heading>ここまでの数字から</Heading>
      {cards.map((c, i) => (
        <div key={c.head} data-qa="mark" data-qa-label={`示唆：${c.head}`} style={{ position: "absolute", left: 96, top: 210 + i * 190, width: 1500, height: 160, boxSizing: "border-box",
          background: C.white, border: `${LINE.thin}px solid ${c.color}`, borderRadius: R.lg, padding: "20px 32px" }}>
          <div style={{ ...font("label", C.ink2) }}>{c.head}</div>
          <div style={{ ...font("label"), fontWeight: 900, marginTop: 10 }}>{c.body}</div>
        </div>
      ))}
      <div data-qa="mark" data-qa-label="免責の帯" style={{ position: "absolute", left: 96, top: 640, width: 1500, height: 90, boxSizing: "border-box", border: `${LINE.thin}px solid ${C.ink}`, borderRadius: R.md, padding: "18px 32px", ...font("label"), fontWeight: 900 }}>過去の数字は、将来を約束しません</div>
      <Svg><Cat kind="plain" x={1760} y={760} size={2.4} pose="sit" face="think" label="彼" /></Svg>
    </AbsoluteFill>
  );
};
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Room face="surprised" pose="sit" look={[-1, 0.5]} evening>
      <Ledger x={560} y={300} s={0.95} circles={[0, 2, 3]} down={[1, 4]} />
    </Room>
  </AbsoluteFill>
);
export const S42: React.FC = () => (
  <AbsoluteFill>
    <Room face="smile" pose="sit" look={[0.4, -0.6]} evening>
      <Ledger x={240} y={340} s={0.8} circles={[0, 2, 3]} down={[1, 4]} />
    </Room>
    <Svg>
      <g data-qa="mark" data-qa-label="頭の中の目盛り（吹き出し）">
        <circle cx={1060} cy={420} r={14} fill={C.white} {...ink} strokeWidth={3} />
        <circle cx={1010} cy={380} r={22} fill={C.white} {...ink} strokeWidth={3} />
        <ellipse cx={900} cy={260} rx={330} ry={180} fill={C.white} {...ink} />
      </g>
      <Gauge cx={900} cy={350} r={140} felt={15} label="頭の中の目盛り（赤い針）" />
    </Svg>
  </AbsoluteFill>
);
export const S43: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Wallet x={480} y={480} s={1.3} />
      <Label x={480} y={680} anchor="middle" weight={900}>同じ手取りでも</Label>
      <Ruler x={1000} y={300} w={700} color={C.ink} name="" />
      <Ruler x={1000} y={440} w={700} color={C.debt} name="" />
      <Ruler x={1000} y={580} w={700} color={C.other} name="" />
      <Label x={1350} y={720} anchor="middle" weight={900}>どの物差しで測るかで変わる</Label>
    </Svg>
  </AbsoluteFill>
);
export const S44: React.FC = () => (
  <AbsoluteFill>
    <Room face="smile" pose="sit" look={[-1, 0.2]} evening>
      <Basket x={420} y={F.floor} s={1.1} fill={1} label="毎週のかご（重い）" />
      <Basket x={860} y={F.floor} s={1.1} dashed label="明日のかご（重く見える）" />
      <Label x={420} y={886} anchor="middle" weight={900}>本当に重い</Label>
      <Label x={860} y={886} anchor="middle" weight={900} color={C.ink2}>重く見える</Label>
    </Room>
  </AbsoluteFill>
);
export const S45: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const P: Omit<Panel, "key">[] = [
  { title: "冒頭：母の家計簿の赤い丸", C: S01, sec: 23.6, lines: "母の家計簿には、赤い丸が", move: "家計簿の1ページに寄った絵から始まる。細い字の行が上から並び、赤い丸が1つずつ、ペンで描くように付く（卵・食パン・ガソリン）" },
  { title: "冒頭：押し入れの前の彼と、1995年の明細", C: S02, sec: 8.9, lines: "息子の彼は、明細の日付を", move: "引いて押し入れの前。彼が明細を手に取り、日付に寄る（1995年が大きく出る）。父の写真立てが右に。名札（息子（38））は1.5秒" },
  { title: "冒頭：手取りは父も彼も約470万円", C: S03, sec: 23.8, lines: "ここからは、父と彼の明細", move: "青緑の棒が2本、同じ高さまで伸びる（父→彼の順）。右の彼が首をかしげる" },
  { title: "冒頭：物価は動かず、苦しい世帯は4割→5割半ば", C: S04, sec: 22.1, lines: "物価が上がったせいだ", move: "物価全体の墨の棒が少しだけ伸びて止まる。下の2本：1995年（灰）→2019年（墨）が伸びる" },
  { title: "冒頭：なぜ苦しくなったのか", C: S05, sec: 7.0, lines: "手取りは同じで、物価全体も", move: "押し入れの前に戻る。彼の頭の上に考え中の吹き出し" },
  { title: "今日の答え合わせ", C: S06, sec: 8.4, lines: "今日確かめるのは", move: "答え合わせのカードが出る。ゴサは首をかしげる" },
  { title: "予想の前提：苦しい世帯が増えたなら", C: S07a, sec: 8.4, lines: "その前に、1つ予想", move: "左の札で苦しい世帯の矢印が上へ伸びる。右の札は点線で、満足の矢印が下へ点線で伸び「？」" },
  { title: "予想タイム：満足はどう動いた？", C: S07, sec: 25.3, lines: "国は1995年にも", move: "共通の予想タイム。選択肢が読み上げに合わせて出る。答えは最後" },
  { title: "数える順番：財布・毎週の買い物・この先", C: S08, sec: 8.0, lines: "数える順番は", move: "財布・かご・点線のかごが左から並ぶ。1枚目が拡大して第1章の扉へ" },
  { title: "第1章：手取りのはしご", C: S09, sec: 23.9, lines: "まず、2人の手取りを", move: "第1章の扉 → 額面（青緑）が上へ伸び、保険料（金）がそれを上回って下へ大きく伸びる" },
  { title: "第1章：税で戻って、手取りはほぼ0", C: S09b, sec: 8.9, lines: "税は逆に3万円ほど", move: "税（灰）が少し上へ伸び、最後の手取りが点線の上で「ほぼ0」と出る。前のコマから続けて描く" },
  { title: "苦しくなった、は毎回「ゆとり」の5倍以上", C: S10, sec: 19.6, lines: "苦しさの理由を探す前に", move: "2本の線が左から引かれる（墨＝苦しくなった、灰＝ゆとり）。右に「5倍以上」" },
  { title: "毎年本当に苦しくなっていたら", C: S11, sec: 14.7, lines: "もし本当に毎年", move: "階段が1段ずつ下へ伸び、最後の段で猫がへたり込む（思考実験。データの絵ではない）" },
  { title: "先回り：苦しいのは気のせい？", C: S12, sec: 18.3, lines: "ここまで聞くと", move: "左の札（去年と比べた答え）が出てから、右の札（いまの暮らし）が太い枠で出る" },
  { title: "懐かしがってもいない：今のほうが良い65%", C: S13, sec: 13.0, lines: "昔の暮らしを懐かしがって", move: "100%の帯の中で墨が65%まで伸びる" },
  { title: "財布でも、気のせいでも、懐かしさでもない", C: S14, sec: 9.9, lines: "財布の中身でも", move: "3枚の札に線が引かれて灰になる（第1章で消した順）。下に問いの札" },
  { title: "第2章：物差しは3本", C: S15, sec: 21.5, lines: "彼が最初に疑った", move: "第2章の扉 → 物差しが3本、上から置かれる（墨・赤・灰）。名前と中身の札" },
  { title: "1995→2019年：全体1.05倍・かご1.19倍・家電0.82倍", C: S16, sec: 29.7, lines: "2019年までの24年で", move: "1倍の点線が先に立つ。棒が全体→かご→家電の順に伸びる。家電の注は最後" },
  { title: "苦しい世帯とかごの物価、4つの年", C: S17, sec: 7.6, lines: "苦しい世帯が増えた24年は", move: "4行が上から順に出る（端の年だけで重ねない）" },
  { title: "頭の中の目盛り：感じた15%、実際4%", C: S18, sec: 9.2, lines: "ここで、私たちが頭の中で", move: "メーターが出て、赤い針が15%まで振れる。遅れて墨の短い線が4%に付く。右に数字が順に" },
  { title: "1割以上と感じたら、半数以上と同じ", C: S19, sec: 19.6, lines: "この1年で物価が1割以上", move: "10匹の猫が並び、左から6匹が赤に変わる。下に括弧" },
  { title: "81回すべてで、感じた物価が上", C: S20, sec: 12.2, lines: "感じた物価が実際より高く", move: "墨（実際）の線が先に引かれ、赤（感じた）の線が上をなぞる" },
  { title: "加工食品とガソリン：頻度バイアス", C: S21, sec: 17.0, lines: "日本銀行の研究者が", move: "かごの中身が赤い矢印で目盛りに流れ、針が振れる。上に「頻度バイアス」の札" },
  { title: "値上がりは強く残る：赤い丸は値上がりにだけ", C: S22, sec: 12.7, lines: "アメリカの家計を調べた", move: "家計簿の値上がりの行に赤い丸、値下がりの行には小さな灰の印だけ" },
  { title: "ローマの映画館：思い出した値段は3割安い", C: S23, sec: 21.9, lines: "しかも人は、昔の暮らし", move: "映画館の絵 → 実際の棒が伸び、思い出した値段の棒が短く止まる。最後に8%" },
  { title: "大きく見積もられただけ？→国の記録", C: S24, sec: 16.9, lines: "彼の苦しさは、頭の中で", move: "問いの札 → 家計簿から矢印が伸びて、国の記録の帳面が開く" },
  { title: "店先の値段：ガソリン114→178円、食パン3割", C: S25, sec: 9.2, lines: "東京では、30年前に", move: "灰（1995年）の棒の下に、赤（2025年）の棒が長く伸びる" },
  { title: "父の手取りを、いまのお金に直すと", C: S26, sec: 24.7, lines: "父が受け取っていた470万円を", move: "物差しを替えるたびに父の棒が伸び縮み（570→680→430）。彼の青緑の棒と点線は動かない" },
  { title: "買える量：かごで3割少なく、家電で1割多く", C: S27, sec: 7.0, lines: "毎週のかごで測ると", move: "かごの中身が3割へる。右の家電は少し増える" },
  { title: "目盛りはずれた、感じは当たっていた", C: S28, sec: 17.0, lines: "頭の中の目盛りは、大きく", move: "左のメーター（ずれ）と右の重いかご（当たり）が並ぶ。章の山" },
  { title: "第3章：悩みや不安、老後の不安", C: S29, sec: 22.7, lines: "予想タイムで出した", move: "第3章の扉 → 灰（1995年）と赤（2019年）の棒が2組" },
  { title: "年金や保険が足りない：7割前後", C: S30, sec: 9.6, lines: "老後が心配だと答えた", move: "10本の柱のうち7本が金で埋まる" },
  { title: "明日のかご", C: S31, sec: 7.8, lines: "ここからは、まだ手に取って", move: "毎週のかごの横に、点線のかごが描き足される" },
  { title: "支える人：4.3人→1.9人→1.3人", C: S32, sec: 20.5, lines: "38歳の彼が60代に", move: "金の猫1匹の下に、支える猫が並ぶ。年が進むたびに減る（端数の猫は途中で切る）" },
  { title: "保険料の割合は止まり、年金の割合が下がる", C: S33, sec: 19.1, lines: "給料から引かれる厚生年金", move: "左の金の線が上限の点線で止まる。右の棒が61→58→50と短くなる" },
  { title: "これからの物価を気にする：4割半ば→7割超", C: S34, sec: 12.2, lines: "これからの物価も", move: "灰と赤の棒が伸びる。左下に小さな明日のかご" },
  { title: "1年後の収入：「増える」6%→11%", C: S35, sec: 18.1, lines: "一方で、1年後の自分の", move: "2本の棒。下の一文が最後に出る" },
  { title: "説は当たっていたのか？", C: S36, sec: 6.4, lines: "数えていくと", move: "2つのかごの上に問いの札" },
  { title: "答え合わせ：額なら外れ、かごなら当たり", C: S37, sec: 29.3, lines: "今の世代は、親の世代より、お金の面で苦しくなった、という説でした", move: "話のカードが割れ、当たっていた所（青緑の縁）と外れていた所（灰の縁）に分かれる。記号は出さない" },
  { title: "予想の答え：C（73%→74%）", C: S38, sec: 8.1, lines: "予想タイムの答えは", move: "予想タイムの札に戻り、Cだけ塗られる" },
  { title: "満足は変わらず、増えたのは不安", C: S39, sec: 12.5, lines: "苦しいと答える世帯が増えた", move: "灰の満足の2本は同じ長さ。下で赤の不安が伸びる" },
  { title: "示唆：言えること・分かること", C: S40, sec: 18.2, lines: "ここまでの数字から", move: "2枚の札が上から1枚ずつ出る。隅に「過去の数字は、将来を約束しません」" },
  { title: "示唆：言えないこと", C: S40b, sec: 22.6, lines: "言えないこともあります", move: "札が入れ替わり、言えないこと（灰の枠）と、新しい調べ方の数字が1枚ずつ出る" },
  { title: "教訓：家計簿をもう一度めくる", C: S41, sec: 11.8, lines: "押し入れの前で", move: "冒頭と同じ押し入れ。家計簿の値下がりの行には印がない" },
  { title: "教訓：頭の中の目盛りにも赤いペン", C: S42, sec: 13.2, lines: "彼の頭の中の目盛りにも", move: "彼の頭の上に吹き出しが広がり、その中のメーターの針が赤いペンの色で振れる" },
  { title: "教訓：同じ手取りでも、物差しで変わる", C: S43, sec: 8.7, lines: "暮らしの重さは", move: "財布の横に3本の物差しが並ぶ" },
  { title: "締め：毎週のかごと、明日のかご", C: S44, sec: 16.5, lines: "毎週のかごは、本当に", move: "重いかご（実線）と点線のかごが床に並ぶ。ゆっくり引く" },
  { title: "締めのひと言（毎回同じ）", C: S45, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const panels: Panel[] = P.map((p, i) => ({ key: String(i + 1).padStart(2, "0"), ...p }));
export const storyboard: StoryboardDef = { id: "005-take-home-30-years", title: "手取りは父と同じ（第2版）", panels };
export default storyboard;
