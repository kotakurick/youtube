// 2本目「r > g は『働くより資産』という意味なのか」の絵コンテ（台本は script.md の第4稿）。
// 場面ごとに1枚。音声・動画にする前に、見た目をオーナーと決めるためのもの（動きは最後の姿だけ）。
// 数字は sources.csv の値。シミュレーションの値は data/villages_result.md・data/snowball.py の出力。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { BarChart } from "@lib/BarChart";
import { TodayCard } from "@lib/Cards";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { LineChart } from "@lib/LineChart";
import { Phone } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SimBackground } from "@lib/SimBackground";
import { Slider } from "@lib/Slider";
import { SourceNote } from "@lib/SourceNote";
import type { StoryboardDef } from "@lib/Storyboard";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note"; color?: string; anchor?: "start" | "middle" | "end" }> = (
  { x, y, children, size = "label", color = C.ink, anchor = "start" },
) => <text x={x} y={y} textAnchor={anchor} style={font(size, color)}>{children}</text>;

// ---- この回の絵の部品：雪玉・雲・雪 ----
/** 雪玉。白（降った雪）と墨（利息）の割合で塗り分ける。r は半径（蛍光ペンの色はデータの塗りに使わない決まり） */
const Snowball: React.FC<{ x: number; y: number; r: number; interest?: number; empty?: boolean }> = ({ x, y, r, interest = 0, empty = false }) => {
  if (empty) return <circle cx={x} cy={y} r={r} fill="none" stroke={C.ink2} strokeWidth={3} strokeDasharray="6 6" />;
  const a = interest * Math.PI * 2;
  const ex = x + r * Math.sin(a), ey = y - r * Math.cos(a);
  return (
    <g data-qa="mark" data-qa-label="雪玉">
      <circle cx={x} cy={y} r={r} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      {interest > 0 && interest < 1 && (
        <path d={`M${x} ${y} L${x} ${y - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${ex} ${ey} Z`} fill={C.ink} stroke={C.ink} strokeWidth={LINE.thin} strokeLinejoin="round" />
      )}
    </g>
  );
};
/** 雲（給料）。w は横幅 */
const Cloud: React.FC<{ x: number; y: number; w: number; label?: string }> = ({ x, y, w, label }) => {
  const k = w / 400;
  return (
    <g data-qa="mark" data-qa-label="雲">
      <g transform={`translate(${x},${y}) scale(${k})`} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin / k}>
        <path d="M-170 40 C-220 40 -220 -30 -160 -30 C-160 -90 -70 -100 -50 -60 C-30 -120 70 -120 80 -60 C130 -90 200 -50 170 0 C220 10 210 40 170 40 Z" />
      </g>
      {label && <text x={x} y={y + 8 * k} textAnchor="middle" style={font("label")}>{label}</text>}
    </g>
  );
};
const Snow: React.FC<{ x: number; y: number; w: number; h: number; n?: number }> = ({ x, y, w, h, n = 40 }) => (
  <g fill={C.white} stroke={C.ink2} strokeWidth={2}>
    {Array.from({ length: n }, (_, i) => {
      const px = x + ((i * 97) % 100) / 100 * w, py = y + ((i * 61) % 100) / 100 * h;
      return <circle key={i} cx={px} cy={py} r={7} />;
    })}
  </g>
);

// ---- 場面 ----
const P01: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={880} variant={3} />
    <Svg>
      <rect x={300} y={720} width={620} height={110} rx={R.md} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Figure kind="male" x={560} y={800} size={3.2} pose="phone" label="会社員（26）" highlight />
      <Phone x={1180} y={500} h={520} screen="list" />
      <rect x={1020} y={800} width={320} height={80} rx={R.sm} fill={C.ink} />
      <Label x={1180} y={852} anchor="middle" color={C.white}>証券口座 37万円</Label>
    </Svg>
    <div style={{ position: "absolute", left: 1420, top: 240, width: 400, padding: "16px 20px", background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.md, ...font("label") }}>
      r ＞ g。資本が増える速さは、働く速さを上回る。だから、給料より資産
    </div>
  </AbsoluteFill>
);
const P02: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 230, width: 760 }}>
      <div style={{ ...font("label", C.ink2) }}>給料で買えるもの（2021→2025年）</div>
      <div style={{ ...font("hero"), lineHeight: 1.1 }}>−5%</div>
      <div style={{ ...font("note", C.ink2) }}>実質賃金（毎月勤労統計）</div>
    </div>
    <div style={{ position: "absolute", left: 1020, top: 230, width: 800 }}>
      <div style={{ ...font("label", C.ink2) }}>日経平均</div>
      <div style={{ ...font("hero"), lineHeight: 1.1 }}>34<span style={{ fontSize: 100 }}>年ぶり</span></div>
      <div style={{ ...font("note", C.ink2) }}>最高値 1989年末 38,915円 → 2024年2月 39,098円</div>
    </div>
  </AbsoluteFill>
);
const P03: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 200, top: 250, width: 1300, padding: "48px 56px", background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.lg }}>
      <div style={{ ...font("label", C.ink2) }}>この式を広めた本人（ピケティ、2015年の論文）</div>
      <div style={{ ...font("question"), marginTop: 20 }}>「r ＞ g は、給料の格差を語るための式ではない」</div>
    </div>
    <SourceNote text="Piketty (2015) AER 105(5) p.48（要約）" />
    <Gosa cues={[[-60, "surprised"]]} size="M" />
  </AbsoluteFill>
);
const P04: React.FC = () => <AbsoluteFill><TodayCard claim="r＞gだから、働くより資産" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
const P05: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="37万円を年5%で回すと、利息が年収に追いつくのは？" choices={["10年後", "30年後", "60年後", "100年より先"]} />
  </AbsoluteFill>
);
// 図10.9・10.10 は期間ごとの値なので、期間を等間隔に並べる（0〜1000年 … 1950〜2012年）
const PERIODS = ["〜1000", "〜1500", "〜1700", "〜1820", "〜1913", "〜1950", "〜2012"];
const P06: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 60, ...font("question") }}>2000年の r と g（世界）</div>
    <LineChart x={200} y={260} width={1040} height={520} xDomain={[0, 6]} yDomain={[0, 6]} xTicks={[0, 1, 2, 3, 4, 5, 6]}
      xTickLabel={(i) => PERIODS[i]} format={(v) => `${v}%`} eras={[{ x: 4, label: "二つの大戦" }]}
      series={[
        { label: "r 資本の収益率", focus: true, points: [[0, 4.5], [1, 4.5], [2, 4.5], [3, 5.1], [4, 5.0], [5, 5.1], [6, 5.3]] },
        { label: "g 経済の伸び", points: [[0, 0.01], [1, 0.14], [2, 0.2], [3, 0.53], [4, 1.49], [5, 1.81], [6, 3.78]] },
        { label: "税と戦争を引いた r", color: C.other, points: [[4, 5.0], [5, 1.1], [6, 3.2]] },
      ]} />
    <SourceNote text="Piketty (2014) 図10.9・10.10（世界。1700年までの r は推定）" />
  </AbsoluteFill>
);
const P07: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 70, ...font("question") }}>r は、誰の財布の話か</div>
    <Svg>
      <BarChart x={260} y={260} width={1200} height={520} max={70} format={(v) => `${Math.round(v)}%`}
        bars={[{ label: "30歳未満", value: 1, focus: true }, { label: "30代", value: 5 }, { label: "60歳以上", value: 63 }]} />
    </Svg>
    <SourceNote text="家計の金融資産の世帯主の年齢別（全国家計構造調査2019、内閣官房資料より）" />
  </AbsoluteFill>
);
const P08: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cloud x={700} y={200} w={520} label="給料" />
      <Snow x={480} y={300} w={460} h={260} n={30} />
      <path d="M200 880 L1700 600" stroke={C.ink2} strokeWidth={LINE.thin} />
      <Snowball x={1150} y={640} r={90} interest={0.2} />
      <Figure kind="male" x={1420} y={630} size={4} pose="stand" facing={-1} />
      <Label x={1150} y={780} anchor="middle">雪玉＝資産</Label>
      <Label x={700} y={620} anchor="middle" color={C.ink2}>雪＝貯める分</Label>
      <Label x={1150} y={830} anchor="middle" color={C.ink2}>黒＝利息</Label>
    </Svg>
  </AbsoluteFill>
);
// 単身20代の金融資産を百人に（J-FLEC 2025。無回答3人は中央値に）
const BRACKETS: [number, number][] = [[33, 0], [25, 50], [10, 150], [7, 250], [6, 350], [3, 450], [6, 600], [3, 850], [2, 1250], [1, 1750], [1, 3000], [3, 37]];
const HUNDRED = BRACKETS.flatMap(([n, a]) => Array.from({ length: n }, () => a)).sort((a, b) => a - b);
const P09: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 60, ...font("question") }}>二十代の百人の雪玉</div>
    <Svg>
      {HUNDRED.map((a, i) => {
        const x = 260 + (i % 20) * 70, y = 260 + Math.floor(i / 20) * 120;
        return a === 0 ? <Snowball key={i} x={x} y={y} r={16} empty /> : <Snowball key={i} x={x} y={y} r={Math.min(50, 8 + Math.sqrt(a) * 0.9)} />;
      })}
    </Svg>
    <div style={{ position: "absolute", left: 1640, top: 260, width: 240, ...font("label") }}>点線＝雪玉なし 33人</div>
    <SourceNote text="単身20代の金融資産（J-FLEC 2025、日常用の預金を除く）" />
  </AbsoluteFill>
);
const P10: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <Svg>
      <Snowball x={640} y={540} r={230} interest={0.23} />
      <Label x={640} y={840} anchor="middle">彼の雪玉 10年後（689万円）</Label>
      <rect x={1060} y={330} width={640} height={70} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={1060} y={330} width={640 * 0.23} height={70} fill={C.ink} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={450}>白：降った雪 500万円</Label>
      <Label x={1060} y={510}>黒：利息 152万円</Label>
      <Label x={1060} y={620} size="body">利息の8割以上は、降った雪が生んだ利息</Label>
    </Svg>
    <SourceNote sim text="シミュレーション：利回り年5%・毎年50万円（仮定）" />
  </AbsoluteFill>
);
const P11: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Snowball x={620} y={470} r={300} interest={0.04} />
      <Label x={620} y={835} anchor="middle">相続の1億円：転がるだけで毎年+500万円</Label>
      <Snowball x={1460} y={700} r={60} interest={0.23} />
      <Figure kind="male" x={1600} y={760} size={3} pose="stand" facing={-1} />
      <Label x={1460} y={835} anchor="middle">彼の雪玉</Label>
    </Svg>
    <SourceNote sim text="利息の8割を毎年使っても小さくならない（利回り5%の仮定）" />
  </AbsoluteFill>
);
const VILLAGES = ["預金", "積立", "稼ぐ力", "起業", "不動産", "両方"];
const P12: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <div style={{ position: "absolute", left: 140, top: 60, ...font("question") }}>六つの村（25歳の百人ずつ）</div>
    <Svg>
      {VILLAGES.map((v, i) => {
        const x = 160 + (i % 3) * 560, y = 230 + Math.floor(i / 3) * 360;
        return (
          <g key={v}>
            <rect x={x} y={y} width={500} height={310} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <text x={x + 30} y={y + 70} style={font("value")}>{v}の村</text>
            {Array.from({ length: 50 }, (_, j) => <circle key={j} cx={x + 50 + (j % 10) * 44} cy={y + 130 + Math.floor(j / 10) * 34} r={11} fill={C.rest} />)}
          </g>
        );
      })}
    </Svg>
  </AbsoluteFill>
);
// 45歳の資産（実質・万円）：下位1割・真ん中・上位1割（基本の設定。data/villages_result.md）
const RES: [string, number, number, number][] = [
  ["預金", 487, 732, 1163], ["積立", 562, 1291, 3239], ["稼ぐ力", 485, 758, 1245],
  ["起業", 103, 485, 1454], ["不動産", -326, 429, 1293], ["両方", 574, 1338, 3385],
];
const P13: React.FC = () => {
  const X = (v: number) => 560 + (v + 500) / 4000 * 1200;
  return (
    <AbsoluteFill>
      <SimBackground />
      <div style={{ position: "absolute", left: 140, top: 50, ...font("question") }}>45歳の資産（下位1割〜上位1割）</div>
      <Svg>
        <line x1={X(0)} x2={X(0)} y1={260} y2={840} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="8 8" />
        <Label x={X(0)} y={248} anchor="middle" color={C.ink2}>0円</Label>
        {RES.map(([v, lo, mid, hi], i) => {
          const y = 310 + i * 100;
          return (
            <g key={v}>
              <text x={520} y={y + 14} textAnchor="end" style={font("label")}>{v}</text>
              <line x1={X(lo)} x2={X(hi)} y1={y} y2={y} stroke={lo < 0 ? C.ink : C.ink2} strokeWidth={LINE.heavy} strokeLinecap="round" data-qa="mark" />
              <circle cx={X(mid)} cy={y} r={20} fill={C.ink} stroke={C.ink} strokeWidth={LINE.thin} />
              <text x={X(hi) + 30} y={y + 14} style={font("label", C.ink2)}>{mid.toLocaleString()}万</text>
            </g>
          );
        })}
      </Svg>
      <SourceNote sim text="シミュレーション：年収の1割を貯める・日本株の過去の幅・物件は横ばい ほか（仮定）" />
    </AbsoluteFill>
  );
};
const P14: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 140, top: 60, ...font("question") }}>同じワンルーム、値段の動きだけ変える</div>
    {[["上がり続けた時期", "+3,679万"], ["横ばい", "+429万"], ["下がり続けた時期", "−1,406万"]].map(([t, v], i) => (
      <div key={t} style={{ position: "absolute", left: 140 + i * 580, top: 260, width: 520, height: 520, background: C.white, border: `4px solid ${C.ink}`, borderRadius: R.lg }}>
        <div style={{ ...font("label", C.ink2), margin: 30 }}>{t}</div>
        <div style={{ ...font("value"), fontSize: 96, margin: "60px 30px" }}>{v}</div>
        <div style={{ ...font("note", C.ink2), margin: 30 }}>45歳の資産（真ん中の人）</div>
      </div>
    ))}
    <SourceNote sim text="3,703万円・頭金100万円・金利3%・表面利回り4.5%（仮定）" />
  </AbsoluteFill>
);
const P15: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <div style={{ position: "absolute", left: 140, top: 60, ...font("question") }}>起業の村：やめた人に借金が残る割合</div>
    <Slider label="借金が残る割合（日本のデータなし＝仮定）" stops={["0%", "50%", "100%"]} keys={[[0, 1]]} x={300} y={500} w={1200} />
    <div style={{ position: "absolute", left: 300, top: 700, ...font("body") }}>真ん中の人の資産：567万 ← 485万 → 396万</div>
    <SourceNote sim text="アメリカの研究：早めにやめた人は会社員に戻っても給料が下がらなかった（Manso 2016）" />
  </AbsoluteFill>
);
const P16: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="r＞gだから、働くより資産" mark="×" reason={["r＞gは歴史のほとんどで本当", "利息を大きく受け取るのは大きな雪玉", "下の人を崩したのは借金"]} />
  </AbsoluteFill>
);
const P17: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cloud x={960} y={290} w={900} label="60歳までの給料 1億6千万〜2億6千万円" />
      <Snow x={600} y={420} w={720} h={230} n={36} />
      <Snowball x={960} y={730} r={50} interest={0.05} />
      <Label x={960} y={830} anchor="middle">37万円の雪玉</Label>
    </Svg>
    <SourceNote text="学校を出てから60歳まで正社員の場合（ユースフル労働統計2025）。正社員でないともっと少ない" />
  </AbsoluteFill>
);
const P18: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={880} variant={3} />
    <Svg>
      <rect x={1100} y={160} width={560} height={420} fill={C.ink2} stroke={C.ink} strokeWidth={LINE.thin} />
      <Snow x={1120} y={180} w={520} h={380} n={34} />
      <Figure kind="male" x={760} y={860} size={3.2} pose="stand" facing={1} label="会社員（26）" highlight />
    </Svg>
  </AbsoluteFill>
);

const storyboard: StoryboardDef = {
  id: "002-r-greater-than-g",
  title: "r > g は「働くより資産」なのか",
  panels: [
    { key: "01", title: "冒頭：夜の部屋、37万円", C: P01 },
    { key: "02", title: "冒頭：給料−5%と34年ぶり", C: P02 },
    { key: "03", title: "冒頭：本人の言葉", C: P03 },
    { key: "04", title: "今日の答え合わせ", C: P04 },
    { key: "05", title: "予想タイム", C: P05 },
    { key: "06", title: "第1章：r と g の2000年", C: P06 },
    { key: "07", title: "第2章：誰の財布か", C: P07 },
    { key: "08", title: "第2章：雲・雪・雪玉", C: P08 },
    { key: "09", title: "第2章：百人の雪玉", C: P09 },
    { key: "10", title: "第2章：10年後の彼の雪玉", C: P10 },
    { key: "11", title: "第2章：1億円の雪玉", C: P11 },
    { key: "12", title: "第3章：六つの村", C: P12 },
    { key: "13", title: "第3章：村の結果", C: P13 },
    { key: "14", title: "第3章：同じ部屋、三つの相場", C: P14 },
    { key: "15", title: "第3章：起業のつまみ", C: P15 },
    { key: "16", title: "答え合わせ ×", C: P16 },
    { key: "17", title: "示唆：通帳の外の雲", C: P17 },
    { key: "18", title: "教訓：窓の外の雪", C: P18 },
  ],
};
export default storyboard;
