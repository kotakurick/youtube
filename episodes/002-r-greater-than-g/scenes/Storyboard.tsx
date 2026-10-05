// 2本目「r > g は『働くより資産』という意味なのか」の絵コンテ 第2版（物語の主人公は猫。2026-10-05 オーナー決定）（台本は script.md の第4稿）。
// 第1版（18場面）を3役が見直した指摘（review/storyboard-summary.md）で作り直した：雪玉は面積＝金額の層、百人の群衆を出す、
// 30秒を超えて止まる場面を割る、数字のずれ（07・10・13）を直す。
// 各場面は「動き終わりの姿」。秒数（sec）は台本の文字数からの見積もり、動き（move）は本編で付ける動き。
// 数字は sources.csv の値。シミュレーションの値は data/villages_result.md・data/snowball.py の出力。
import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDots } from "@lib/Chapter";
import { TodayCard } from "@lib/Cards";
import { Dumbbell } from "@lib/Dumbbell";
import { Figure, Kind } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { Phone } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SimBackground } from "@lib/SimBackground";
import { Slider } from "@lib/Slider";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";
import { Bedroom, BEDROOM } from "@lib/Bedroom";
import { Cat } from "@lib/Cat";
import { DebtBall, EquityBox } from "@lib/Money";
import { ballR, Cloud, Flake, Snow, Snowball } from "@lib/Snowball";
import { VILLAGE_COLOR, VillageIcon, VillageKind, VILLAGES } from "@lib/Village";

// ---- この回の配置の道具（絵の部品は render/src/lib） ----
/** SVG の画面（1920×1080）。SVG の部品はこの中に置く */
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
export const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（左上の決まった位置。Z.header） */
export const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1500, ...font("question") }}>{children}</div>
);

const man = (v: number) => `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString()}万`;
/** 墨の下線（蛍光ペンの黄色は見えにくいので新しい場面では使わない。2026-10-05） */
const Underline: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => <rect x={x} y={y + 10} width={w} height={6} rx={3} fill={C.ink} />;

// ================= 冒頭 =================
const P01: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Bedroom />
      <circle cx={560} cy={540} r={110} fill={C.white} opacity={0.45} />
      <Cat kind="male" x={560} y={BEDROOM.bed.y + 12} size={4.4} pose="phone" face="sad" label="彼" />
    </Svg>
  </AbsoluteFill>
);
const P02: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Phone x={560} y={500} h={680} screen="blank" />
      <g data-qa-allow="prop">
        <Label x={560} y={290} anchor="middle" color={C.ink2}>証券アプリ</Label>
        <Label x={560} y={370} anchor="middle" color={C.ink2} size="note">残高</Label>
        <Label x={560} y={580} anchor="middle" size="hero">37<tspan style={{ fontSize: 90 }}>万円</tspan></Label>
      </g>
      <Snowball x={1340} y={560} core={37} k={14} />
      <Label x={1340} y={720} anchor="middle" color={C.ink2}>この37万円が、あとで雪玉になる</Label>
    </Svg>
    <SourceNote text="単身20代の金融資産の中央値（J-FLEC 2025。日常用の預金を除く）" />
  </AbsoluteFill>
);
const P03: React.FC = () => (
  <AbsoluteFill>
    <Heading>給料で買えるもの：4年で約5%減</Heading>
    <Svg>
      {/* 買い物かご：20個の品のうち1個が消える（5%＝20個に1個） */}
      <path d="M520 420 L1400 420 L1330 820 L590 820 Z" fill={C.white} stroke={C.ink} strokeWidth={LINE.base} strokeLinejoin="round" />
      <path d="M700 420 Q960 200 1220 420" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      {Array.from({ length: 20 }, (_, i) => {
        const cx = 640 + (i % 10) * 72, cy = 520 + Math.floor(i / 10) * 140;
        return i === 19
          ? <rect key={i} x={cx - 26} y={cy - 40} width={52} height={80} rx={10} fill="none" stroke={C.ink2} strokeWidth={3} strokeDasharray="8 6" />
          : <rect key={i} x={cx - 26} y={cy - 40} width={52} height={80} rx={10} fill={[C.goldTint, C.tealTint, C.debtTint, C.maleTint][i % 4]} stroke={C.ink} strokeWidth={3} />;
      })}
      <Cat kind="male" x={300} y={800} size={3.4} pose="stand" facing={1} face="sad" label="彼" />
      <Label x={1430} y={660} color={C.ink2}>20個のうち</Label>
      <Label x={1430} y={720} color={C.ink2}>1個が消える</Label>
    </Svg>
    <SourceNote text="実質賃金 2022〜2025年（毎月勤労統計調査）" />
  </AbsoluteFill>
);
// 日経平均：sources.csv の3つの時点だけを結ぶ（間の上下は描かない）
const P04: React.FC = () => {
  const X = (y: number) => 260 + ((y - 1989) / (2024.2 - 1989)) * 1300, Y = (v: number) => 860 - (v / 40000) * 560;
  return (
    <AbsoluteFill>
      <Heading>日経平均、34年ぶりの最高値</Heading>
      <Svg>
        <line x1={240} x2={1600} y1={Y(38915)} y2={Y(38915)} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="10 8" />
        <polyline points={`${X(1989.99)},${Y(38915)} ${X(2009.2)},${Y(7055)} ${X(2024.15)},${Y(39099)}`} fill="none" stroke={C.gold} strokeWidth={LINE.heavy} strokeLinejoin="round" />
        {[[1989.99, 38915, "1989年末 38,916円"], [2009.2, 7055, "2009年3月 7,055円"], [2024.15, 39099, "2024年2月 39,099円"]].map(([yy, v, t], i) => (
          <g key={i}><circle cx={X(yy as number)} cy={Y(v as number)} r={14} fill={C.gold} stroke={C.ink} strokeWidth={3} />
            <Label x={X(yy as number) + (i === 2 ? -20 : 20)} y={Y(v as number) + (i === 1 ? 60 : -30)} anchor={i === 2 ? "end" : "start"} size="note">{t}</Label></g>
        ))}
        <Underline x={X(2004)} y={Y(38915) - 34} w={220} />
        <Label x={X(2004)} y={Y(38915) - 30} weight={900}>34年</Label>
      </Svg>
      <SourceNote text="日経平均の終値（日本経済新聞社）。3つの時点を結んだ線で、間の上下は省いている" />
    </AbsoluteFill>
  );
};
const P05: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Phone x={1240} y={500} h={720} screen="blank" />
      <Cat kind="male" x={500} y={860} size={4.6} pose="down" face="sad" label="彼" />
    </Svg>
    <div data-qa-allow="prop" style={{ position: "absolute", left: 1090, top: 260, width: 300, ...font("label"), lineHeight: 1.35 }}>
      r ＞ g。資本が増える速さは、働いて稼ぐ速さを上回る。だから、給料より資産
    </div>
    <div style={{ position: "absolute", left: 140, top: 200, padding: "20px 28px", background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.lg, ...font("label") }}>
      働くのは、損なのか
    </div>
  </AbsoluteFill>
);
const P06: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 96, top: 120, width: 620, padding: "28px 32px", background: C.white, border: `4px solid ${C.ink2}`, borderRadius: R.lg }}>
      <div style={{ ...font("note", C.ink2) }}>流れてきた投稿</div>
      <div style={{ ...font("label"), marginTop: 12, lineHeight: 1.4 }}>r ＞ g。だから、<span style={{ textDecoration: "line-through", textDecorationThickness: 6 }}>給料より資産</span></div>
    </div>
    <div style={{ position: "absolute", left: 96, top: 470, width: 1300, padding: "40px 48px", background: C.goldTint, border: `6px solid ${C.ink}`, borderRadius: R.lg }}>
      <div style={{ ...font("label", C.ink2) }}>この式を広めた本人（ピケティ、2015年の論文）</div>
      <div style={{ ...font("question"), marginTop: 20 }}>「r ＞ g は、給料の格差を語るための式ではない」</div>
    </div>
    <SourceNote text="Piketty (2015) AER 105(5) p.48（要約）" />
    <Gosa cues={[[-60, "surprised"]]} says={[[200, "！"]]} size="M" />
  </AbsoluteFill>
);
const ROADS: [VillageKind, string][] = [["預金", "預金"], ["積立", "投資"], ["稼ぐ力", "転職"], ["起業", "起業"]];
const P07: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cat kind="male" x={960} y={900} size={3.6} pose="stand" face="think" label="彼" />
      {ROADS.map(([k, t], i) => {
        const x = 300 + i * 440;
        return (
          <g key={t}>
            <line x1={960} y1={740} x2={x} y2={520} stroke={C.floor} strokeWidth={LINE.heavy * 2} strokeLinecap="round" />
            <rect x={x - 150} y={220} width={300} height={300} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <VillageIcon kind={k} x={x} y={330} s={1.3} />
            <Label x={x} y={470} anchor="middle" size="value">{t}</Label>
          </g>
        );
      })}
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 56, ...font("question") }}>二十年後、どうなる？</div>
  </AbsoluteFill>
);
const P08: React.FC = () => <AbsoluteFill><TodayCard claim="r＞gだから、働くより資産" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
const P09: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="37万円を年5%で回すと、利息が年収に追いつくのは？" choices={["10年後", "30年後", "60年後", "100年より先"]} />
    <Svg>
      <Label x={96} y={760} color={C.ink2}>年収 約370万円</Label>
      <rect x={420} y={725} width={1100} height={50} fill={C.teal} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={96} y={860} color={C.ink2}>利息 1年目</Label>
      <rect x={420} y={825} width={1100 * 1.85 / 370} height={50} fill={C.gold} stroke={C.ink} strokeWidth={2} />
      <Label x={450} y={862} size="note" color={C.ink2}>約1.9万円</Label>
    </Svg>
    <SourceNote text="年収は20代の平均（国税庁 民間給与実態統計調査 2025）" y={930} />
  </AbsoluteFill>
);
const P10: React.FC = () => {
  const cards: [string, string, React.ReactNode][] = [
    ["1", "この式は本当か", <g key="a"><polyline points="-90,30 -30,10 30,14 90,-6" fill="none" stroke={C.gold} strokeWidth={10} /><polyline points="-90,60 -30,58 30,40 90,20" fill="none" stroke={C.teal} strokeWidth={10} /></g>],
    ["2", "誰の財布の話か", <g key="b"><Snowball x={0} y={20} core={37} interest={40} snow={200} k={3.5} /></g>],
    ["3", "六つの村で二十年", <g key="c">{VILLAGES.map((v, i) => <VillageIcon key={v} kind={v} x={-90 + (i % 3) * 90} y={-10 + Math.floor(i / 3) * 80} s={0.6} />)}</g>],
  ];
  return (
    <AbsoluteFill>
      <Heading>今日の順番</Heading>
      <Svg>
        {cards.map(([n, t, icon], i) => {
          const x = 120 + i * 580;
          return (
            <g key={n}>
              <rect x={x} y={260} width={520} height={520} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 40} y={340} size="value">{n}</Label>
              <g transform={`translate(${x + 260},${500})`}>{icon}</g>
              <Label x={x + 260} y={720} anchor="middle">{t}</Label>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 第1章 =================
const P11: React.FC = () => (
  <AbsoluteFill>
    <Heading>r と g：二つの文字の意味</Heading>
    <Svg>
      {/* r：資本（田んぼ・工場・家）から毎年出てくる黒い粒 */}
      <rect x={140} y={300} width={760} height={500} rx={R.lg} fill={C.white} stroke={C.gold} strokeWidth={LINE.base} />
      <g transform="translate(300,620)">
        <rect x={-110} y={-20} width={220} height={120} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-110} x2={110} y1={10 + i * 25} y2={10 + i * 25} stroke={C.ink2} strokeWidth={2} />)}
        <path d="M150 100 V0 h70 v-40 l35 -30 l35 30 v40 h70 v100 Z" fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        {[[-40, -90], [30, -120], [130, -140], [230, -150], [330, -120]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={16} fill={C.gold} stroke={C.ink} strokeWidth={3} />)}
      </g>
      <Label x={180} y={380} size="value">r</Label>
      <Label x={240} y={380}>資本が毎年生む割合</Label>
      <Label x={180} y={770} size="note" color={C.ink2}>利子・配当・家賃 ÷ 資本の額（国全体の平均）</Label>
      {/* g：国の所得の棒が1年でのびる */}
      <rect x={1020} y={300} width={760} height={500} rx={R.lg} fill={C.white} stroke={C.teal} strokeWidth={LINE.base} />
      <Label x={1060} y={380} size="value">g</Label>
      <Label x={1120} y={380}>国の所得が1年でのびる割合</Label>
      {Array.from({ length: 30 }, (_, i) => <Figure key={i} kind="other" x={1100 + (i % 15) * 40} y={640 + Math.floor(i / 15) * 60} size={0.8} />)}
      <rect x={1100} y={500} width={520} height={50} fill={C.tealTint} />
      <rect x={1620} y={500} width={40} height={50} fill={C.teal} />
      <Label x={1060} y={770} size="note" color={C.ink2}>人が増えた分 ＋ 一人あたりが豊かになった分</Label>
    </Svg>
    <SourceNote text="Piketty (2014) 第1章・第5章の定義" />
  </AbsoluteFill>
);
// 図10.9・10.10：期間ごとの平均なので、階段で描く。期間は等しい幅に並べ、目盛りに年の範囲を書く
const PER = ["0〜1000", "1000〜1500", "1500〜1700", "1700〜1820", "1820〜1913", "1913〜1950", "1950〜2012"];
const R_PRE = [4.5, 4.5, 4.5, 5.1, 5.0, 5.1, 5.3];
const R_POST = [4.5, 4.5, 4.5, 5.1, 5.0, 1.1, 3.2];
const G = [0.01, 0.14, 0.2, 0.53, 1.49, 1.81, 3.78];
const History: React.FC<{ after: boolean }> = ({ after }) => {
  const x0 = 200, w = 180, Y = (v: number) => 770 - (v / 6) * 470;
  const steps = (vals: number[]) => vals.map((v, i) => `M${x0 + i * w} ${Y(v)} H${x0 + (i + 1) * w}`).join(" ") + " " +
    vals.slice(1).map((v, i) => `M${x0 + (i + 1) * w} ${Y(vals[i])} V${Y(v)}`).join(" ");
  return (
    <Svg>
      <rect x={x0 + 5 * w} y={Y(6)} width={w} height={Y(0) - Y(6)} fill={C.debtTint} />
      <Label x={x0 + 5 * w + w / 2} y={Y(6) + 40} anchor="middle" size="note">二つの大戦</Label>
      {[0, 2, 4, 6].map((v) => <g key={v}><line x1={x0} x2={x0 + 7 * w} y1={Y(v)} y2={Y(v)} stroke={C.paper2} strokeWidth={LINE.hair} />
        <Label x={x0 - 20} y={Y(v) + 12} anchor="end" size="note" color={C.ink2}>{v}%</Label></g>)}
      <line x1={x0} x2={x0 + 7 * w} y1={Y(0)} y2={Y(0)} stroke={C.ink} strokeWidth={LINE.thin} />
      {PER.map((p, i) => <Label key={p} x={x0 + i * w + w / 2} y={Y(0) + 44} anchor="middle" size="note" color={C.ink2}>{p}</Label>)}
      <path d={steps(G)} fill="none" stroke={C.teal} strokeWidth={LINE.heavy} strokeLinecap="round" />
      {after && <path d={steps(R_PRE)} fill="none" stroke={C.gold} strokeWidth={LINE.thin} strokeDasharray="10 10" />}
      <path d={steps(after ? R_POST : R_PRE)} fill="none" stroke={C.gold} strokeWidth={LINE.heavy} strokeLinecap="round" />
      <Label x={x0 + 7 * w + 20} y={Y(after ? 3.2 : 5.3) + 12} color={C.gold} weight={900}>r {after ? "3.2" : "5.3"}%</Label>
      <Label x={x0 + 7 * w + 20} y={Y(3.78) + (after ? -20 : 12)} color={C.teal}>g 3.8%</Label>
      {after && <><Underline x={x0 + 5 * w} y={Y(1.1) + 54} w={2 * w} /><Label x={x0 + 6 * w} y={Y(1.1) + 58} anchor="middle" weight={900}>二十世紀</Label></>}
    </Svg>
  );
};
const P12: React.FC = () => (
  <AbsoluteFill>
    <Heading>r と g の二千年（世界）</Heading>
    <History after={false} />
    <div style={{ position: "absolute", left: 1000, top: 150, width: 560, padding: "16px 24px", background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.md, ...font("label") }}>
      青緑の g が金色の r の上に出たのは、いつ？
    </div>
    <SourceNote text="Piketty (2014) 図10.9（世界・税引き前。1700年までの r は推定）" />
    <Gosa cues={[[-60, "thinking"]]} size="M" />
  </AbsoluteFill>
);
const P13: React.FC = () => (
  <AbsoluteFill>
    <Heading>税と戦争の損を引くと、r が潜る</Heading>
    <History after />
    <SourceNote text="Piketty (2014) 図10.10（税と資本の損失を引いた r。点線は引く前）" />
  </AbsoluteFill>
);
const P14: React.FC = () => (
  <AbsoluteFill>
    <Heading>別の研究でも、r ＞ g</Heading>
    <Dumbbell x={140} y={320} width={1500} rowH={200} max={7} color={C.gold} aLabel="g" bLabel="r" format={(v) => `${v.toFixed(1)}%`}
      rows={[{ label: "16か国 1870〜2015年", a: 3.1, b: 6.0 }, { label: "日本 1980〜2015年", a: 2.0, b: 4.2 }]} />
    <SourceNote text="Jordà ほか (2019) QJE。r ＜ g は二つの大戦の時期だけ" />
  </AbsoluteFill>
);
const P15: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect x={300} y={380} width={420} height={240} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="24 16" />
      <Label x={510} y={530} anchor="middle" size="question" color={C.ink2}>誰の？</Label>
      <Label x={780} y={560} size="hero">r ＞ g</Label>
    </Svg>
    <Gosa cues={[[-60, "skeptical"]]} size="M" />
  </AbsoluteFill>
);

// ================= 第2章 =================
const AGES: [string, number][] = [["30歳未満", 1], ["30代", 5], ["40代", 12], ["50代", 18], ["60代", 26], ["70代", 23], ["80歳以上", 14]];
const P16: React.FC = () => (
  <AbsoluteFill>
    <Heading>家計の金融資産：100マスのうち、どの年代？</Heading>
    <Svg>
      {AGES.map(([a, n], i) => {
        const x = 150 + i * 240, cols = 4, sz = 40, gap = 8;
        const color = i === 0 ? C.teal : i >= 4 ? C.gold : C.goldTint;
        return (
          <g key={a}>
            {Array.from({ length: n }, (_, j) => <rect key={j} x={x + (j % cols) * (sz + gap)} y={760 - Math.floor(j / cols) * (sz + gap) - sz} width={sz} height={sz} rx={4} fill={color} />)}
            <Label x={x + 92} y={805} anchor="middle" size="note">{a}</Label>
            <Label x={x + 92} y={760 - Math.ceil(n / cols) * (sz + gap) - 16} anchor="middle" weight={900}>{n}%</Label>
          </g>
        );
      })}
      <path d={`M1110 360 V340 H1830 V360`} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1470} y={320} anchor="middle" weight={900}>60歳以上 6割超</Label>
    </Svg>
    <SourceNote text="全国家計構造調査 2019（内閣官房 資産所得倍増に関する基礎資料集 p.3）。四捨五入で合計99" />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const P17: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cloud x={860} y={170} w={560} label="給料" />
      <Snow x={680} y={260} w={360} h={250} n={22} />
      {/* 右下がりの坂：時間は左から右へ */}
      <path d="M100 560 L1820 900" stroke={C.ink} strokeWidth={LINE.thin} />
      {[...Array(14)].map((_, i) => <Flake key={i} x={1060 + i * 52} y={560 + (1060 + i * 52 - 100) * (340 / 1720) - 12} s={7} />)}
      <Snowball x={860} y={620} core={37} interest={60} snow={160} k={7} />
      <Cat kind="male" x={690} y={690} size={2.6} pose="walk" facing={1} phase={0.3} label="彼" />
      {[[C.tealTint, "降った雪（給料から貯める分）"], [C.gold, "利息（転がって巻きこんだ雪）"], [C.other, "はじめの額"]].map(([c, t], i) => (
        <g key={t}><rect x={1250} y={262 + i * 70} width={44} height={44} rx={22} fill={c} stroke={C.ink} strokeWidth={3} /><Label x={1310} y={298 + i * 70}>{t}</Label></g>
      ))}
    </Svg>
  </AbsoluteFill>
);
// 単身20代の金融資産を百人に（J-FLEC 2025。無回答3人は中央値37万円に。階級は真ん中の値で描く）
const BRACKETS: [number, number][] = [[33, 0], [25, 50], [10, 150], [7, 250], [6, 350], [3, 450], [6, 600], [3, 850], [2, 1250], [1, 1750], [1, 3000], [3, 37]];
const HUNDRED = BRACKETS.flatMap(([n, a]) => Array.from({ length: n }, () => a)).sort((a, b) => a - b);
const HIM = HUNDRED.indexOf(37) + 1;
/** 左から小さい順に、地面の上に並べる（行の幅で折り返す） */
const flow = (rs: number[], x0: number, x1: number, y0: number, gap = 8) => {
  const out: { x: number; y: number }[] = [];
  let x = x0, rowTop = y0, rowMax = 0, row: number[] = [];
  const close = () => { const base = rowTop + rowMax * 2; for (const i of row) out[i].y = base - rs[i]; rowTop = base + 40; rowMax = 0; row = []; };
  rs.forEach((r, i) => {
    if (x + 2 * r > x1 && row.length) { close(); x = x0; }
    out[i] = { x: x + r, y: 0 }; row.push(i); rowMax = Math.max(rowMax, r); x += 2 * r + gap;
  });
  close();
  return out;
};
const P18: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Heading>全員が同じ雪玉の町（10年後）</Heading>
    <Svg>
      {Array.from({ length: 100 }, (_, i) => {
        const x = 200 + (i % 20) * 76, y = 340 + Math.floor(i / 20) * 110;
        return <g key={i}><Snowball x={x} y={y} core={37} interest={152} snow={500} k={1.1} /></g>;
      })}
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 900, ...font("label") }}>r ＞ g でも、差は生まれない</div>
  </AbsoluteFill>
);
const P19: React.FC = () => {
  const k = 1.15, rs = HUNDRED.map((a) => (a === 0 ? 7 : ballR(a, k))), pos = flow(rs, 140, 1780, 330, 10);
  return (
    <AbsoluteFill>
      <Heading>二十代の百人の雪玉（面積＝金額）</Heading>
      <Svg>
        {HUNDRED.map((a, i) => (a === 0 ? <Snowball key={i} x={pos[i].x} y={pos[i].y} empty k={2.3} /> : <Snowball key={i} x={pos[i].x} y={pos[i].y} core={a} k={k} />))}
        <circle cx={pos[HIM].x} cy={pos[HIM].y} r={20} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
        
        <Cat kind="male" x={pos[HIM].x} y={pos[HIM].y - 76} size={1.3} pose="stand" label="彼" />
        <Label x={pos[HIM].x + 40} y={pos[HIM].y - 84}>彼（37万円）</Label>
        <Label x={140} y={790} color={C.ink2}>点線＝雪玉なし 33人</Label>
        <Label x={800} y={790} color={C.ink2}>1000万円以上：4人</Label>
        <Snowball x={1420} y={776} core={100} k={k} /><Label x={1450} y={790}>＝100万円</Label>
      </Svg>
      <SourceNote text="単身20代の金融資産（J-FLEC 2025）。階級の真ん中の値で描く" />
    </AbsoluteFill>
  );
};
// 10年後（利回り5%、毎年50万円）：総額＝はじめ×1.05^10＋628.9万（snowball.py と同じ）
const grow = (a: number) => { const total = a * Math.pow(1.05, 10) + 628.9; return { core: a, snow: 500, interest: total - a - 500 }; };
const P20: React.FC = () => {
  const k = 0.88, balls = HUNDRED.map(grow), rs = balls.map((b) => ballR(b.core + b.interest + b.snow, k)), pos = flow(rs, 140, 1780, 290, 8);
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>10年後：増えた分の半分以上が金の人は？</Heading>
      <Svg>
        {balls.map((b, i) => {
          const front = b.interest >= b.snow;
          return (
            <g key={i} transform={front ? "translate(0,-14)" : undefined}>
              <Snowball x={pos[i].x} y={pos[i].y} {...b} k={k} />
              {front && <circle cx={pos[i].x} cy={pos[i].y} r={rs[i] + 8} fill="none" stroke={C.gold} strokeWidth={LINE.base} />}
            </g>
          );
        })}
      </Svg>
      <div style={{ position: "absolute", left: 1500, top: 150, ...font("value") }}>13人</div>
      <div style={{ position: "absolute", left: 96, top: 170, ...font("label", C.ink2) }}>10年目（金の輪＝前へ出た人）</div>
      <SourceNote sim prefix="条件：" text="利回り年5%・降る雪は一人年50万円（仮定）" />
    </AbsoluteFill>
  );
};
const SNOW_STOPS: [string, number][] = [["20万", 29], ["30万", 16], ["50万", 13], ["100万", 4]];
const P21: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Heading>降る雪の量を変えると</Heading>
    <Slider label="一人の降る雪（1年）" stops={SNOW_STOPS.map(([s]) => s)} keys={[[0, 2]]} x={260} y={320} w={1300} />
    <Svg>
      {SNOW_STOPS.map(([s, n], i) => (
        <g key={s}>
          <Label x={260 + (i * 1300) / 3} y={620} anchor="middle" size="value">{n}人</Label>
          <Label x={260 + (i * 1300) / 3} y={680} anchor="middle" size="note" color={C.ink2}>半分以上が金</Label>
        </g>
      ))}
      <Label x={260} y={800}>どの量でも、多くの人で水色（降った雪）が勝つ</Label>
    </Svg>
    <SourceNote sim prefix="条件：" text="利回り年5%・10年（data/snowball.py）" />
  </AbsoluteFill>
);
const P22: React.FC = () => {
  const k = 10.4, r = ballR(689, k);
  const rows: [string, string, string][] = [[C.other, "はじめの37万円", "37万"], [C.gold, "芯が生んだ利息", "23万"], [C.goldTint, "降った雪が生んだ利息", "129万"], [C.tealTint, "降った雪", "500万"]];
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>彼の雪玉 10年後：689万円</Heading>
      <Svg>
        <Snowball x={560} y={510} core={37} split={{ fromCore: 23, fromSnow: 129 }} snow={500} k={k} />
        {rows.map(([c, t, v], i) => (
          <g key={t}>
            <rect x={1060} y={300 + i * 110} width={60} height={60} rx={8} fill={c} stroke={C.ink} strokeWidth={LINE.thin} />
            <Label x={1150} y={344 + i * 110}>{t}</Label>
            <Label x={1780} y={344 + i * 110} anchor="end" weight={900}>{v}</Label>
          </g>
        ))}
        <Label x={1060} y={790} color={C.ink}>利息の8割以上は、降った雪が生んだ</Label>
        <Cat kind="male" x={900} y={790} size={2.2} pose="stand" facing={-1} face="surprised" label="彼" />
        <circle cx={560} cy={510} r={r} fill="none" />
      </Svg>
      <SourceNote sim prefix="条件：" text="利回り年5%・毎年50万円（仮定）" />
    </AbsoluteFill>
  );
};
const P23: React.FC = () => (
  <AbsoluteFill>
    <Heading>批判：財産は r ほどには増えない</Heading>
    <Svg>
      <Snowball x={400} y={480} core={3000} k={4} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M${560} ${480} L${880 + i * 230} ${420 + i * 90}`} stroke={C.ink2} strokeWidth={3} strokeDasharray="8 8" />
          <Snowball x={900 + i * 230} y={430 + i * 90} core={800} k={2.6} />
          <Cat kind="other" x={900 + i * 230} y={600 + i * 90} size={1.3} pose="stand" seed={i} label="子" />
        </g>
      ))}
      <rect x={1500} y={640} width={240} height={140} rx={R.md} fill={C.debtTint} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1620} y={725} anchor="middle">税</Label>
      <Label x={140} y={790}>使われる・子に分けられる・税がかかる</Label>
    </Svg>
    <SourceNote text="Mankiw (2015) AER P&P。国の比較では r−g と格差の関係は見えない：Acemoglu & Robinson (2015)" />
  </AbsoluteFill>
);
const P24: React.FC = () => {
  const k = 2.6;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>親から受け継いだ1億円の雪玉</Heading>
      <Svg>
        <Snowball x={440} y={530} core={10000} k={k} />
        <Label x={440} y={240} anchor="middle">1億円</Label>
        <circle cx={1060} cy={460} r={ballR(500, k)} fill={C.goldTint} stroke={C.gold} strokeWidth={LINE.base} strokeDasharray="12 8" />
        <Label x={1060} y={560} anchor="middle">1年で太る分 500万円</Label>
        <Cloud x={1520} y={450} w={330} />
        <Label x={1520} y={560} anchor="middle">二十代の年収 約370万円</Label>
        <Snowball x={1060} y={780} core={37} k={k} />
        <Label x={1100} y={792}>彼の雪玉 37万円</Label>
        <Cat kind="male" x={990} y={800} size={1.8} pose="stand" facing={1} face="surprised" label="彼" />
      </Svg>
      <SourceNote sim text="利回り年5%（仮定）。年収は20代の平均（国税庁 2025）" />
      <Gosa cues={[[-60, "panic"]]} size="S" />
    </AbsoluteFill>
  );
};
const P25: React.FC = () => {
  const k = 2.6;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>10年後：利息の8割を使っても、差は広がる</Heading>
      <Svg>
        <Snowball x={440} y={520} core={10000} interest={1046} k={k} />
        <Label x={440} y={835} anchor="middle">1億1046万円</Label>
        <rect x={830} y={300} width={300} height={130} rx={R.md} fill={C.goldTint} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={980} y={355} anchor="middle">使った分</Label>
        <Label x={980} y={405} anchor="middle" size="note" color={C.ink2}>毎年 約400万円</Label>
        <path d="M720 420 L820 380" stroke={C.ink} strokeWidth={LINE.thin} />
        <Snowball x={1450} y={700} core={37} interest={152} snow={500} k={k} />
        <Label x={1450} y={820} anchor="middle">彼 689万円</Label>
        <Cat kind="male" x={1580} y={760} size={2} pose="stand" facing={-1} face="sad" label="彼" />
        <path d={`M760 700 H1360`} stroke={C.ink} strokeWidth={LINE.thin} markerEnd="url(#arr)" />
        <defs><marker id="arr" markerWidth={12} markerHeight={12} refX={10} refY={6} orient="auto"><path d="M0 0 L12 6 L0 12 Z" fill={C.ink} /></marker></defs>
        <Label x={1060} y={680} anchor="middle" weight={900}>差 約1億円</Label>
      </Svg>
      <SourceNote sim text="利回り年5%・利息の2割だけ足す（仮定）。大きな財産ほど利回りも高い：Fagereng ほか" />
    </AbsoluteFill>
  );
};

// ================= 第3章 =================
const GroupGrid: React.FC<{ x: number; on: number; label: string; sub: string; color: string }> = ({ x, on, label, sub, color }) => (
  <g>
    {Array.from({ length: 100 }, (_, i) => (
      <Figure key={i} kind="other" color={i < on ? color : C.otherTint} x={x + (i % 10) * 34} y={300 + Math.floor(i / 10) * 52} size={0.75} />
    ))}
    <Label x={x + 150} y={880} anchor="middle" size="value" color={color}>{on}人</Label>
    <Label x={x + 150} y={930} anchor="middle" size="note" color={C.ink2}>{sub}</Label>
    <Label x={x + 150} y={250} anchor="middle">{label}</Label>
  </g>
);
const P26: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <GroupGrid x={150} on={25} label="投資信託を持つ" sub="単身二十代（J-FLEC 2025）" color={C.gold} />
      <GroupGrid x={790} on={15} label="1年で転職して入る" sub="働く百人（雇用動向調査 2025）" color={C.teal} />
      <GroupGrid x={1430} on={1} label="自分で始めた事業" sub="働く百人（就業構造基本調査）" color={C.debt} />
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 56, ...font("question") }}>実際の二十代は？</div>
    <ChapterDots current={3} />
  </AbsoluteFill>
);
const VillageTile: React.FC<{ v: VillageKind; i: number; children?: React.ReactNode; balls?: boolean }> = ({ v, i, children, balls = false }) => {
  const x = 96 + (i % 3) * 590, y = 190 + Math.floor(i / 3) * 380;
  return (
    <g>
      <rect x={x} y={y} width={560} height={350} rx={R.lg} fill={C.white} stroke={VILLAGE_COLOR[v]} strokeWidth={LINE.base} />
      <VillageIcon kind={v} x={x + 110} y={y + 130} s={1.2} />
      <Label x={x + 110} y={y + 260} anchor="middle" size="value">{v}</Label>
      {Array.from({ length: 100 }, (_, j) => {
        const fx = x + 250 + (j % 10) * 28, fy = y + 50 + Math.floor(j / 10) * 29;
        return balls
          ? <circle key={j} cx={fx} cy={fy} r={4 + ((j * 37 + i * 11) % 9)} fill={(j * 37 + i * 11) % 9 > 5 ? C.gold : C.tealTint} stroke={C.ink} strokeWidth={2} />
          : <Figure key={j} kind="other" x={fx} y={fy + 10} size={0.45} />;
      })}
      {children}
    </g>
  );
};
const P27: React.FC = () => (
  <AbsoluteFill>
    <Heading>六つの村（二十五歳の百人ずつ）</Heading>
    <Svg>{VILLAGES.map((v, i) => <VillageTile key={v} v={v} i={i} />)}</Svg>
  </AbsoluteFill>
);
const P28: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Heading>先に、仮定</Heading>
    <Svg>
      {/* くじ箱：過去の年の札を引く */}
      <rect x={1180} y={480} width={420} height={280} rx={R.md} fill={C.goldTint} stroke={C.ink} strokeWidth={LINE.base} />
      <rect x={1330} y={480} width={120} height={20} fill={C.ink} />
      {[["1973年", 1200, 330, -12], ["1989年", 1390, 270, 6], ["2008年", 1560, 360, 14]].map(([t, x, y, a]) => (
        <g key={t as string} transform={`translate(${x},${y}) rotate(${a})`}>
          <rect x={-90} y={-36} width={180} height={72} rx={8} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <text x={0} y={14} textAnchor="middle" style={font("label")}>{t}</text>
        </g>
      ))}
      <Label x={1390} y={790} anchor="middle" size="note" color={C.ink2}>当たり外れは、過去の幅から引く</Label>
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 230, width: 960, display: "flex", flexDirection: "column", gap: 28 }}>
      {["どの村も、毎年 年収の1割を貯める", "株・転職・事業：過去のデータの幅からくじ", "空室・借金の金利：公的なデータがないので仮定", "25歳から45歳までの二十年を、何度も回す"].map((t) => (
        <div key={t} style={{ padding: "18px 26px", background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.md, ...font("label") }}>{t}</div>
      ))}
    </div>
    <SourceNote sim prefix="条件：" text="data/villages.py。条件は概要欄" />
  </AbsoluteFill>
);
const P29: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Svg>{VILLAGES.map((v, i) => <VillageTile key={v} v={v} i={i} balls><Label x={96 + (i % 3) * 590 + 530} y={190 + Math.floor(i / 3) * 380 + 330} anchor="end" size="value" color={C.ink2}>{"ABCDEF"[i]}</Label></VillageTile>)}</Svg>
    <div style={{ position: "absolute", left: 96, top: 56, width: 1400, ...font("label") }}>
      <span style={{ ...font("question") }}>45歳</span>　下の1割の人が、資産をほとんど残せなかった村は？
    </div>
  </AbsoluteFill>
);

// ---- 村の結果（範囲の行）。45歳の資産（実質・万円）：下位1割・真ん中・上位1割（基本の設定。data/villages_result.md） ----
type Row = { v: string; lo: number; mid: number; hi: number };
const RES: Row[] = [
  { v: "預金", lo: 487, mid: 732, hi: 1163 }, { v: "積立", lo: 562, mid: 1291, hi: 3239 }, { v: "稼ぐ力", lo: 485, mid: 758, hi: 1245 },
  { v: "起業", lo: 103, mid: 485, hi: 1454 }, { v: "不動産", lo: -326, mid: 429, hi: 1293 }, { v: "両方", lo: 574, mid: 1338, hi: 3385 },
];
const RES1990: Record<string, Row> = { 積立: { v: "積立", lo: 412, mid: 895, hi: 2097 }, 両方: { v: "両方", lo: 418, mid: 929, hi: 2207 } };
const RangeRows: React.FC<{
  rows: Row[]; show: number; dom: [number, number]; ticks: number[]; icons?: boolean; ghost?: Record<string, Row>;
  mark?: string[]; loCol?: boolean; y0?: number; step?: number;
}> = ({ rows, show, dom, ticks, icons = true, ghost = {}, mark = [], loCol = true, y0 = 270, step = 94 }) => {
  const x0 = 460, w = 1050, X = (v: number) => x0 + ((v - dom[0]) / (dom[1] - dom[0])) * w;
  const yEnd = y0 + (rows.length - 1) * step;
  return (
    <Svg>
      {dom[0] < 0 && <rect x={X(dom[0])} y={y0 - 60} width={X(0) - X(dom[0])} height={yEnd - y0 + 100} fill={C.debtTint} opacity={0.5} />}
      {ticks.map((t) => <g key={t}><line x1={X(t)} x2={X(t)} y1={y0 - 60} y2={yEnd + 40} stroke={t === 0 ? C.ink2 : C.paper2} strokeWidth={LINE.hair} strokeDasharray={t === 0 ? "8 8" : undefined} />
        <Label x={X(t)} y={yEnd + 84} anchor="middle" size="note" color={C.ink2}>{t === 0 ? "0円" : man(t)}</Label></g>)}
      {loCol && <Label x={1780} y={y0 - 70} anchor="end" size="note" color={C.ink2}>下の1割</Label>}
      {rows.map((r, i) => {
        const y = y0 + i * step, on = i < show, g = ghost[r.v];
        return (
          <g key={r.v}>
            {icons && <VillageIcon kind={r.v as VillageKind} x={150} y={y} s={0.6} />}
            <text x={410} y={y + 14} textAnchor="end" style={font("label", on ? C.ink : C.rest)}>{r.v}</text>
            {on && <>
              {g && <><line x1={X(g.lo)} x2={X(g.hi)} y1={y + 30} y2={y + 30} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="10 8" />
                <circle cx={X(g.mid)} cy={y + 30} r={9} fill={C.bg} stroke={C.ink2} strokeWidth={3} /></>}
              <line x1={X(r.lo)} x2={X(r.hi)} y1={y} y2={y} stroke={VILLAGE_COLOR[r.v] ?? C.ink2} strokeWidth={LINE.heavy} strokeLinecap="round" data-qa="mark" />
              {r.lo < 0 && <line x1={X(r.lo)} x2={X(Math.min(0, r.hi))} y1={y} y2={y} stroke={C.debt} strokeWidth={LINE.heavy} strokeLinecap="round" />}
              <circle cx={X(r.mid)} cy={y} r={14} fill={C.ink} stroke={C.white} strokeWidth={3} />
              <text x={X(r.mid)} y={y - 26} textAnchor="middle" style={font("note", C.ink)} fontWeight={700}>{man(r.mid)}</text>
              {loCol && <>{mark.includes(r.v) && <rect x={1610} y={y - 32} width={185} height={60} rx={10} fill={C.debtTint} stroke={C.debt} strokeWidth={4} />}<text x={1780} y={y + 14} textAnchor="end" style={font("label", r.lo < 0 ? C.debt : C.ink)}>{man(r.lo)}</text></>}
            </>}
          </g>
        );
      })}
    </Svg>
  );
};
const RowsNote = () => <SourceNote sim prefix="条件：" text="年収の1割を貯める・物件は横ばい ほか（仮定）。線＝下位1割〜上位1割、点＝真ん中" />;
const P30: React.FC = () => (
  <AbsoluteFill><SimBackground /><Heading>45歳の資産：預金の村</Heading>
    <RangeRows rows={RES} show={1} dom={[-500, 3500]} ticks={[0, 1000, 2000, 3000]} /><RowsNote /></AbsoluteFill>
);
const P31: React.FC = () => (
  <AbsoluteFill><SimBackground /><Heading>積立の村：真ん中は上がり、幅も広がる</Heading>
    <RangeRows rows={RES} show={2} dom={[-500, 3500]} ticks={[0, 1000, 2000, 3000]} ghost={{ 積立: RES1990.積立 }} />
    <div style={{ position: "absolute", left: 1180, top: 480, ...font("note", C.ink2) }}>点線：日本株が振るわなかった1990年からの幅</div>
    <RowsNote /></AbsoluteFill>
);
// 44歳の年収（真ん中・上位1割、万円）
const INCOME: Row[] = [
  { v: "預金", lo: 419, mid: 419, hi: 738 }, { v: "積立", lo: 417, mid: 417, hi: 732 }, { v: "稼ぐ力", lo: 441, mid: 441, hi: 822 },
  { v: "起業", lo: 442, mid: 442, hi: 899 }, { v: "不動産", lo: 416, mid: 416, hi: 733 }, { v: "両方", lo: 441, mid: 441, hi: 820 },
];
const P32: React.FC = () => {
  const x0 = 460, w = 1050, X = (v: number) => x0 + (v / 1000) * w;
  return (
    <AbsoluteFill><SimBackground /><Heading>稼ぐ力の村：変わったのは年収のほう</Heading>
      <Svg>
        {[0, 250, 500, 750, 1000].map((t) => <g key={t}><line x1={X(t)} x2={X(t)} y1={230} y2={790} stroke={C.paper2} strokeWidth={LINE.hair} />
          <Label x={X(t)} y={826} anchor="middle" size="note" color={C.ink2}>{t === 0 ? "0円" : man(t)}</Label></g>)}
        <circle cx={1100} cy={202} r={12} fill={C.bg} stroke={C.ink} strokeWidth={3} /><Label x={1124} y={214} size="note" color={C.ink2}>真ん中</Label>
        <circle cx={1300} cy={202} r={12} fill={C.teal} /><Label x={1324} y={214} size="note" color={C.ink2}>上位1割</Label>
        {INCOME.map((r, i) => {
          const y = 270 + i * 94, hot = r.v === "稼ぐ力" || r.v === "起業";
          return (
            <g key={r.v}>
              <VillageIcon kind={r.v as VillageKind} x={150} y={y} s={0.6} />
              <text x={410} y={y + 14} textAnchor="end" style={font("label")}>{r.v}</text>
              <line x1={X(r.mid)} x2={X(r.hi)} y1={y} y2={y} stroke={hot ? C.teal : C.tealTint} strokeWidth={LINE.heavy} strokeLinecap="round" />
              <circle cx={X(r.mid)} cy={y} r={12} fill={C.bg} stroke={C.ink} strokeWidth={3} />
              <circle cx={X(r.hi)} cy={y} r={14} fill={C.teal} stroke={C.ink} strokeWidth={3} />
              <text x={X(r.hi) + 28} y={y + 12} style={font("note", C.ink)} fontWeight={700}>{man(r.hi)}</text>
            </g>
          );
        })}
      </Svg>
      <SourceNote sim prefix="条件：" text="44歳の年収。転職の成否は過去のデータの幅から（仮定）" /></AbsoluteFill>
  );
};
const Shops: React.FC<{ x: number; open: number; label: string; sub: string }> = ({ x, open, label, sub }) => (
  <g>
    {Array.from({ length: 100 }, (_, i) => {
      const sx = x + (i % 10) * 64, sy = 200 + Math.floor(i / 10) * 54, o = i < open;
      return <g key={i}><rect x={sx} y={sy + 14} width={44} height={32} fill={o ? C.white : C.paper2} stroke={o ? C.ink : C.rest} strokeWidth={2} />
        <rect x={sx - 4} y={sy} width={52} height={16} fill={o ? C.debt : C.rest} /></g>;
    })}
    <Label x={x + 300} y={790} anchor="middle" size="value">{label}</Label>
    <Label x={x + 300} y={840} anchor="middle" size="note" color={C.ink2}>{sub}</Label>
  </g>
);
const P33: React.FC = () => (
  <AbsoluteFill>
    <Heading>起業の村：5年後に残る事業</Heading>
    <Svg>
      <Shops x={180} open={90} label="日本 約9割" sub="公庫の融資先（2016年開業）" />
      <Shops x={1100} open={50} label="アメリカ 約半分" sub="事業所（2015年開業）" />
    </Svg>
    <SourceNote text="日本政策金融公庫 新規開業パネル調査／米国労働統計局 BED。調べた相手も数え方も違う" />
  </AbsoluteFill>
);
const P34: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Heading>起業の村：やめた人に借金が残る割合</Heading>
    <Slider label="借金が残る割合（日本のデータなし＝仮定）" stops={["0%", "50%", "100%"]} keys={[[0, 1]]} x={300} y={330} w={1200} />
    <Svg>
      {[["0%", 567], ["50%", 485], ["100%", 396]].map(([s, v], i) => (
        <g key={s as string}>
          <Label x={300 + i * 600} y={600} anchor="middle" size="value" color={i === 1 ? C.ink : C.ink2}>{man(v as number)}</Label>
          <Label x={300 + i * 600} y={650} anchor="middle" size="note" color={C.ink2}>真ん中の人の資産</Label>
        </g>
      ))}
      {[0, 1, 2].map((i) => <g key={i}><Cat kind="other" x={290 + i * 130} y={800} size={1.6} pose="down" face="sad" seed={i} label="やめた人" /><DebtBall x={345 + i * 130} y={790} r={20} from={{ x: 310 + i * 130, y: 770 }} /></g>)}
      <Label x={720} y={760} size="note" color={C.ink2}>アメリカの研究：早めにやめた人は、会社員に戻っても</Label>
      <Label x={720} y={800} size="note" color={C.ink2}>給料が下がらなかった（日本のデータはない）</Label>
    </Svg>
    <SourceNote sim text="Manso (2016) RFS" />
    <Gosa cues={[[-60, "depends"]]} size="M" />
  </AbsoluteFill>
);
const P35: React.FC = () => {
  const k = 0.13, base = 780;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>借金で買うと：持ち分は何倍にも動く</Heading>
      <Svg>
        <line x1={180} x2={1760} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        <line x1={180} x2={1760} y1={base - 3703 * k} y2={base - 3703 * k} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="12 10" />
        <Label x={530} y={base - 3703 * k - 14} size="note" color={C.ink2}>買った値段</Label>
        <EquityBox x={260} base={base} price={3703} debt={3603} k={k} title="買った直後" />
        <EquityBox x={850} base={base} price={4073} debt={3603} k={k} title="1割上がる" />
        <EquityBox x={1440} base={base} price={3333} debt={3603} k={k} title="1割下がる" />
        <Label x={370} y={base - 3703 * k - 24} anchor="middle" weight={900}>持ち分 100万</Label>
        <Label x={960} y={base - 4073 * k - 24} anchor="middle" weight={900}>470万（4.7倍）</Label>
        <Label x={1550} y={base - 3603 * k - 50} anchor="middle" weight={900}>−270万</Label>
      </Svg>
      <SourceNote sim prefix="条件：" text="3,703万円・頭金100万円の例（仮定）。白＝持ち分、点線＝売っても返せない借金" />
    </AbsoluteFill>
  );
};
const MARKETS: Row[] = [
  { v: "上がり続けた時期", lo: 2165, mid: 3679, hi: 5386 }, { v: "横ばい", lo: -326, mid: 429, hi: 1293 }, { v: "下がり続けた時期", lo: -1760, mid: -1406, hi: -945 },
];
const P36: React.FC = () => (
  <AbsoluteFill><SimBackground /><Heading>同じワンルーム、値段の動きだけ変える</Heading>
    <RangeRows rows={MARKETS} show={3} dom={[-2000, 6000]} ticks={[-2000, 0, 2000, 4000, 6000]} icons={false} y0={340} step={170} />
    <SourceNote sim prefix="条件：" text="不動産の村の45歳の資産。上がる＝東京2008〜25年型、下がる＝15年下がる型" /></AbsoluteFill>
);
const P37: React.FC = () => (
  <AbsoluteFill><SimBackground /><Heading>並べると：下の1割を崩したのは、借金</Heading>
    <RangeRows rows={RES} show={6} dom={[-500, 3500]} ticks={[0, 1000, 2000, 3000]} ghost={RES1990} mark={["起業", "不動産"]} />
    <div style={{ position: "absolute", left: 1040, top: 180, ...font("note", C.ink2) }}>点線：株が振るわなかった1990年からの幅</div>
    <RowsNote /></AbsoluteFill>
);
const HIM6: [VillageKind, number][] = [["預金", 719], ["積立", 1298], ["稼ぐ力", 746], ["起業", 457], ["不動産", 368], ["両方", 1295]];
const P38: React.FC = () => (
  <AbsoluteFill><SimBackground /><Heading>同じ彼を、六つの村に一人ずつ置くと（45歳）</Heading>
    <Svg>
      {HIM6.map(([v, a], i) => {
        const x = 220 + i * 296;
        return (
          <g key={v}>
            <VillageIcon kind={v} x={x} y={300} s={0.9} />
            <Label x={x} y={400} anchor="middle">{v}</Label>
            <Cat kind="male" x={x - 70} y={720} size={2.6} pose="stand" face={a > 1000 ? "happy" : "normal"} seed={i} label="彼" />
            <Snowball x={x + 40} y={720 - ballR(a, 1.6)} core={a} k={1.6} />
            <Label x={x} y={800} anchor="middle" weight={900}>{man(a)}</Label>
          </g>
        );
      })}
      <line x1={120} x2={1800} y1={722} y2={722} stroke={C.ink} strokeWidth={LINE.thin} />
    </Svg>
    <SourceNote sim prefix="条件：" text="真ん中の順位の運を引き続けた彼の、45歳の資産（真ん中）" /></AbsoluteFill>
);

// ================= 答え合わせ・示唆・教訓 =================
const P39: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="r＞gだから、働くより資産" mark="×" reason={["r＞gは歴史のほとんどで本当", "利息を大きく受け取るのは大きな雪玉", "下の人を崩したのは借金"]} />
  </AbsoluteFill>
);
const P40: React.FC = () => {
  const X = (age: number) => 140 + ((age - 26) / 110) * 1640;
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>予想の答え：D　利息が年収に追いつくまで</Heading>
      <Svg>
        <line x1={X(26)} x2={X(136)} y1={600} y2={600} stroke={C.ink} strokeWidth={LINE.base} />
        {[26, 46, 66, 86, 106, 126].map((a) => <g key={a}><line x1={X(a)} x2={X(a)} y1={585} y2={615} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={X(a)} y={665} anchor="middle" size="note" color={C.ink2}>{a}歳</Label></g>)}
        <path d={`M${X(26)} 520 H${X(69)}`} stroke={C.teal} strokeWidth={LINE.heavy} strokeLinecap="round" />
        <Label x={X(69) + 20} y={532} color={C.teal}>毎年50万円足すと 43年</Label>
        <path d={`M${X(26)} 450 H${X(135)}`} stroke={C.gold} strokeWidth={LINE.heavy} strokeLinecap="round" />
        <circle cx={X(135)} cy={450} r={16} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        <Cat kind="male" x={X(26)} y={420} size={1.8} pose="stand" facing={1} face="surprised" label="彼" />
        <Label x={X(135)} y={410} anchor="end" size="value">足さないと 109年</Label>
        <Label x={X(26)} y={760}>いまの彼にとって、給料の流れは利息のおよそ200倍</Label>
      </Svg>
      <SourceNote sim prefix="条件：" text="37万円・年5%・利息を足していく（仮定）。年収は20代の平均 約370万円" />
    </AbsoluteFill>
  );
};
const P41: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect x={200} y={420} width={40} height={40} fill={C.gold} stroke={C.ink} strokeWidth={3} />
      <Label x={220} y={530} anchor="middle" size="note" color={C.ink2}>1年の利息</Label>
      <Label x={220} y={575} anchor="middle" size="note" color={C.ink2}>約1.9万円</Label>
      {Array.from({ length: 200 }, (_, i) => <rect key={i} x={460 + (i % 25) * 52} y={260 + Math.floor(i / 25) * 52} width={44} height={44} fill={C.teal} stroke={C.white} strokeWidth={2} />)}
      <Label x={1110} y={760} anchor="middle">1年の給料 約370万円 ＝ 200マス</Label>
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 56, ...font("question") }}>1マス 対 200マス</div>
  </AbsoluteFill>
);
const P42: React.FC = () => (
  <AbsoluteFill>
    <Heading>データから言えること</Heading>
    <Svg>
      {[["1", "給料か資産か、の二択がずれている", "二十代の多くは、資産の芯まで降った雪"], ["2", "利回りの平均が高い置き場所ほど、真ん中も幅も広がる", "下の端を崩したのは、借金で一つに賭けた暮らし方"], ["3", "いちばん大きな財産は、通帳の外", ""]].map(([n, t, s], i) => (
        <g key={n} opacity={i === 2 ? 0.35 : 1}>
          <rect x={96} y={220 + i * 230} width={1500} height={200} rx={R.lg} fill={[C.tealTint, C.goldTint, C.white][i]} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={150} y={320 + i * 230} size="value">{n}</Label>
          <Label x={240} y={300 + i * 230}>{t}</Label>
          {s && <Label x={240} y={360 + i * 230} size="note" color={C.ink2}>{s}</Label>}
        </g>
      ))}
      <Snowball x={1700} y={320} core={37} interest={152} snow={500} k={3} />
      <g transform="translate(1700,550)"><line x1={-90} x2={90} y1={-20} y2={-20} stroke={C.gold} strokeWidth={LINE.heavy} strokeLinecap="round" /><line x1={-90} x2={-20} y1={20} y2={20} stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" /><DebtBall x={-90} y={60} r={20} /></g>
    </Svg>
  </AbsoluteFill>
);
const P43: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cloud x={900} y={430} w={1500} label="60歳までの給料（正社員） 1億6千万〜2億6千万円" />
      <Cloud x={1690} y={700} w={300} dashed />
      <Label x={1840} y={820} anchor="end" size="note" color={C.ink2}>正社員でないと、もっと少ない</Label>
      <Snow x={500} y={600} w={800} h={160} n={26} />
      <Snowball x={900} y={830} core={37} k={3} />
      <Label x={940} y={842}>37万円の雪玉</Label>
    </Svg>
    <SourceNote text="ユースフル労働統計2025 生涯賃金（学校を出て60歳まで正社員、退職金を除く）。雲と雪玉は面積で比べている" />
  </AbsoluteFill>
);
const P44: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Bedroom snow cloud moonlight />
      <g transform="translate(500,700) rotate(-80)"><rect x={-14} y={-24} width={28} height={48} rx={6} fill={C.ink} /></g>
      <Cat kind="male" x={1340} y={BEDROOM.floor + 40} size={4.4} pose="stand" facing={1} look={[0.6, -0.8]} face="normal" label="彼" />
    </Svg>
  </AbsoluteFill>
);

const P45: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const panels: Panel[] = [
  { key: "01", title: "冒頭：夜の部屋", C: P01, sec: 14, move: "暗い窓の部屋を引きで。ベッドの彼の手元のスマホだけが白く光る。時計は1時10分" },
  { key: "02", title: "冒頭：残高37万円", C: P02, sec: 6, move: "カメラがスマホへ寄る。37万円が数え上がる。右に小さな雪玉が置かれる（あとの比喩の伏線）" },
  { key: "03", title: "冒頭：買えるものが5%減", C: P03, sec: 6, move: "かごに20個の品が入る → 1個が点線になって消える" },
  { key: "04", title: "冒頭：日経平均34年ぶり", C: P04, sec: 5, move: "1989年の点から線が下り、2024年に元の高さの点線を越える。越えた瞬間に「34年」" },
  { key: "05", title: "冒頭：投稿とつぶやき", C: P05, sec: 20, move: "スマホに投稿が1行ずつ流れる → 彼が頭を抱える姿勢に変わり、つぶやきの吹き出し" },
  { key: "06", title: "冒頭：本人の言葉", C: P06, sec: 15, move: "投稿の下から引用カードがせり上がる。投稿の「給料より資産」に打ち消し線。ゴサ「！」は1回だけ" },
  { key: "07", title: "冒頭：四つの道", C: P07, sec: 13, move: "「預金か、投資か、転職か、起業か」の1語ごとに札が1枚ずつ立つ（第3章の村の札と同じ形）" },
  { key: "08", title: "今日の答え合わせ", C: P08, sec: 6, move: "四つの札を左へ払ってカード" },
  { key: "09", title: "予想タイム", C: P09, sec: 24, move: "選択肢を1つずつ。下に年収の白い棒と、ほぼ点の利息の黒い棒（答えは出さない）" },
  { key: "10", title: "今日の順番", C: P10, sec: 13, move: "3枚の札が左から並ぶ。各章の扉で同じ札を使う。このあと第1章の扉" },
  { key: "11", title: "第1章：r と g の意味", C: P11, sec: 21, move: "左：資本の箱から黒い粒が毎年ポンと出る（r）。右：人の上の所得の棒が少し伸びる（g）" },
  { key: "12", title: "第1章：二千年の二本の線（問い）", C: P12, sec: 35, move: "濃い線 r を左から描く → 途中で地主と地代の小さな挿し絵 → 薄い線 g が地面をはい、産業革命で立ち上がる → 問い" },
  { key: "13", title: "第1章：r が潜る（答え）", C: P13, sec: 8, move: "濃い線の二十世紀の段だけが下へ沈む（元の位置に点線の影）。g の下に潜った所に「二十世紀」" },
  { key: "14", title: "第1章：別の研究", C: P14, sec: 16, move: "ダンベル2行が順に伸びる" },
  { key: "15", title: "第1章：主語のない式", C: P15, sec: 10, move: "「r ＞ g」の左に空いた四角が描かれる。この四角が次の100マスに分かれる" },
  { key: "16", title: "第2章：誰の財布か（100マス）", C: P16, sec: 24, move: "第2章の扉 → 四角が100マスに分かれ、年代の列へ積み上がる。30歳未満の1マスに寄る" },
  { key: "17", title: "第2章：雲・雪・雪玉", C: P17, sec: 17, move: "雪玉が坂を横へ動く（回さない）。通った地面の雪が消えて黒い層が太る → 雲から雪がまっすぐ落ちて白い層になる" },
  { key: "18", title: "第2章：同じ雪玉の町", C: P18, sec: 19, move: "雪玉が100個に増える。年めくり1〜10年目、全員が同じ大きさのまま育つ" },
  { key: "19", title: "第2章：本物の百人（面積＝金額）", C: P19, sec: 30, move: "雪玉が本物の大きさに変わり、33個が溶けて点線になる。小さい順に並び直す。彼に印。「どのあたり？」で3秒止める" },
  { key: "20", title: "第2章：10年転がす（13人）", C: P20, sec: 20, move: "方眼に切り替え。年めくりで全員に同じ雪が降り、大きい雪玉だけ黒い層が太る。10年目で問い → 黒が半分を超えた13人が前へ出る" },
  { key: "21", title: "第2章：降る雪のつまみ", C: P21, sec: 9, move: "つまみを20万→100万へ動かすと、前に出る人が29→16→13→4人と出入りする" },
  { key: "22", title: "第2章：彼の雪玉の断面", C: P22, sec: 20, move: "百人の中の彼に寄る。断面が大きくなり、黒が「芯の利息」「雪の利息」の2層に分かれる" },
  { key: "23", title: "第2章：批判", C: P23, sec: 19, move: "大きな雪玉が3つに割れて子へ転がり、一部が税の箱へ。もう一つの批判は注の文字で" },
  { key: "24", title: "第2章：1億円の雪玉", C: P24, sec: 25, move: "左から大きな雪玉が転がりこむ（平行移動）。1年で太る分の点線の輪と、年収の雲を並べる。ゴサが焦る" },
  { key: "25", title: "第2章：10年後、差が広がる", C: P25, sec: 22, move: "年めくり10年。毎年、黒い塊の8割が「使った分」の箱へ出ていく。それでも雪玉は大きくなり、差の矢印が伸びる" },
  { key: "26", title: "第3章：実際の二十代", C: P26, sec: 19, move: "第3章の扉 → 百人が3回出て、25人・15人・1人に色が付く" },
  { key: "27", title: "第3章：六つの村", C: P27, sec: 28, move: "百人が6回分に増えて六つの村に分かれる。1村ずつ名前と目印（冒頭の四つの札と同じ形）" },
  { key: "28", title: "第3章：仮定とくじ", C: P28, sec: 22, move: "仮定の札が1枚ずつ。くじ箱から年の札が飛び出して村へ" },
  { key: "29", title: "第3章：二十年を回す（問い）", C: P29, sec: 6, move: "年めくり25→45歳。人が雪玉に変わり、村ごとに大きさがばらつく。問いと A〜F" },
  { key: "30", title: "第3章：預金の村", C: P30, sec: 25, move: "村の百人が雪玉の大きさ順に横一列 → 縮んで1行の線と点になる（以下の村も同じ）" },
  { key: "31", title: "第3章：積立の村", C: P31, sec: 35, move: "冒頭の34年の線が小さく挿しこまれて戻る。行が右へ大きく伸びる → 1990年からの幅を点線で重ねる" },
  { key: "32", title: "第3章：稼ぐ力の村（年収の軸）", C: P32, sec: 30, move: "資産の行は預金とほぼ同じ所 → 目盛りが「44歳の年収」に切り替わり、点が年収の値へ動く → 数秒で資産に戻る" },
  { key: "33", title: "第3章：起業の存続", C: P33, sec: 20, move: "店100軒を2列。1年ずつ閉まる店が灰色に。5年で日本は約9割、アメリカは約半分" },
  { key: "34", title: "第3章：借金のつまみ", C: P34, sec: 15, move: "つまみを0%→100%へ。やめた人に借金の玉が1つずつ付き、真ん中の資産が567万→396万へ動く。ゴサ「ひげ、のびます。」" },
  { key: "35", title: "第3章：持ち分の箱（てこ）", C: P35, sec: 20, move: "建物の値段が1割上下すると、借金の高さは変わらず、白い持ち分だけが何倍にも伸び縮みする" },
  { key: "36", title: "第3章：三つの相場", C: P36, sec: 16, move: "同じ部屋で値段の動きを3つ。行が順に出る。下がる行は0円より左へ" },
  { key: "37", title: "第3章：並べると（答え）", C: P37, sec: 25, move: "6行がそろう。下の1割の列の起業・不動産に蛍光ペン。点線は株が振るわなかった時代の幅" },
  { key: "38", title: "第3章：同じ彼が6人", C: P38, sec: 13, move: "彼が6人に分かれて各村へ歩く。足元の雪玉の大きさがそれぞれ違う（止めて見比べる場面）" },
  { key: "39", title: "答え合わせ ×", C: P39, sec: 38, move: "前の場面の印を付けた2行が札になって判定のカードへ飛ぶ" },
  { key: "40", title: "予想の答え：109年", C: P40, sec: 12, move: "年の物差しが右へ伸び、カメラが追う。69歳で43年の線、135歳でやっと109年" },
  { key: "41", title: "200倍", C: P41, sec: 5, move: "黒1マスの横に、白い200マスが一気に並ぶ" },
  { key: "42", title: "示唆：1と2", C: P42, sec: 20, move: "示唆を1つずつ。右に前の場面の絵（雪玉の断面、借金の2行）を小さく呼び戻す" },
  { key: "43", title: "示唆：通帳の外の雲", C: P43, sec: 26, move: "37万円の雪玉の大写しからカメラが引いていき、雪玉が点になったところで上に巨大な雲" },
  { key: "44", title: "教訓：窓の外の雪", C: P44, sec: 41, move: "冒頭と同じ部屋。彼がスマホを置いて窓の前へ。窓の外に雲と雪。締めの一文で窓の外の空へゆっくり上がる" },
  { key: "45", title: "締めのひと言（毎回同じ）", C: P45, sec: 6, move: "共通のアニメーション（SignOff）：丘の猫2匹、100個の点が数えられて星になり、夜空に「数えてみると、景色が変わりました。」とチャンネル名。字幕なし" },
];

const storyboard: StoryboardDef = { id: "002-r-greater-than-g", title: "r > g は「働くより資産」なのか（第2版）", panels };
export default storyboard;
