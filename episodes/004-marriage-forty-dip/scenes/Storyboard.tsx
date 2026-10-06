// 4本目「40代、夫婦の満足は二本に分かれる」の絵コンテ 第1版（2026-10-06。台本は script.md の第5稿）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から。lines はその場面の最初の文。動き（move）は本編で付ける動き。
// 数字は sources.csv と台本の値。色は男女の色（夫＝male、妻＝female）。満足していない＝濃い色、満足＝淡い色（同じ性別の濃い・淡い）。
// 一日の中身（DayStack）と天秤（Balance）では、家事など＝性別の濃い色、育児＝淡い色、仕事・通勤＝灰（男女に関係ない量）。
// 物語の場面（車の中・せりふ）は猫、データの人数は人型。同じ場面に混ぜない。妻も夫も責めない（悪役の顔・ぼんやり顔にしない）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Balance, Weight } from "@lib/Balance";
import { Bracket } from "@lib/Bracket";
import { MidCheck, TodayCard } from "@lib/Cards";
import { CAR, CarFront, Navi, Signal } from "@lib/Car";
import { Cat, CatFace, CatLabel } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { couples, CouplePairs, PeopleRows } from "@lib/CouplePairs";
import { DayCol, DayStack } from "@lib/DayStack";
import { Figure } from "@lib/Figure";
import { GenderLines, GLSeries } from "@lib/GenderLines";
import { Gosa } from "@lib/Gosa";
import { Note } from "@lib/Labels";
import { PairedBars } from "@lib/PairedBars";
import { PercentColumns } from "@lib/PercentColumns";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Bubble } from "@lib/StoryAnim";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具（絵の部品は render/src/lib） ----
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（左上の決まった位置） */
const Heading: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 1640 }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: w, ...font("question"), lineHeight: 1.2 }}>{children}</div>
);
/** 墨の札（HTML、左上を x,y に） */
const Card: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode; border?: string; bg?: string }> = ({ x, y, w, children, border = C.ink, bg = C.white }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, padding: "18px 28px", background: bg, border: `${LINE.thin}px solid ${border}`, borderRadius: R.md, ...font("label"), lineHeight: 1.4, boxSizing: "border-box" }}>{children}</div>
);

const SRC = {
  nfrj: "NFRJ18（日本家族社会学会、2019年調査）図から読み取り。年齢の違う人を同じ年に調べたもの",
  nfrjSupport: "NFRJ18 第一次報告書 図8（2019年調査）図から読み取り。年齢の違う人を同じ年に調べたもの",
  nsfj7: "国立社会保障・人口問題研究所『第7回全国家庭動向調査』2022年（妻が回答）。集計表から計算",
  time: "総務省『社会生活基本調査』2021年。共働き・夫婦と子の世帯、週全体の平均",
};

// ---- 車の中（冒頭と教訓で同じ車） ----
const CarScene: React.FC<{
  signal?: Signal; wifeFace?: CatFace; wifeFacing?: -1 | 0 | 1; husbandFacing?: -1 | 0 | 1; husbandFace?: CatFace; names?: boolean;
  children?: React.ReactNode;
}> = ({ signal = "red", wifeFace = "normal", wifeFacing = 1, husbandFacing = 0, husbandFace = "normal", names = false, children }) => (
  <Svg>
    <CarFront signal={signal}
      back={<>
        <Cat kind="male" x={CAR.backL.x} y={CAR.backL.y} size={CAR.size.back} face="sleep" facing={1} label="息子" seed={3} />
        <Cat kind="female" x={CAR.backR.x} y={CAR.backR.y} size={CAR.size.back} face="sleep" facing={-1} label="娘" seed={5} />
      </>}
      front={<>
        <Cat kind="male" x={CAR.driver.x} y={CAR.driver.y} size={CAR.size.front} face={husbandFace} facing={husbandFacing} label="夫" />
        <Cat kind="female" x={CAR.passenger.x} y={CAR.passenger.y} size={CAR.size.front} face={wifeFace} facing={wifeFacing}
          look={wifeFacing === 1 ? [1, 0] : undefined} label="妻" seed={2} />
        {names && <CatLabel x={CAR.driver.x} y={CAR.driver.y} size={CAR.size.front} text="夫（45）" />}
        {names && <CatLabel x={CAR.passenger.x} y={CAR.passenger.y} size={CAR.size.front} text="妻（44）" />}
      </>} />
    {children}
  </Svg>
);

// ---- 第1章の線（S7c：28〜72歳、5歳ごと。横軸は25〜75歳の11区分、データは30〜70歳の9区分） ----
const AGE_TICKS = ["", "30歳", "35", "40", "45", "50", "55", "60", "65", "70", ""];
const AGE_XS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SAT_HUSBAND = [93.5, 95.0, 89.4, 87.2, 89.2, 93.3, 87.9, 84.5, 89.4];
const SAT_WIFE = [93.5, 86.7, 84.7, 76.9, 76.8, 77.0, 76.9, 78.2, 73.6];
const satSeries: GLSeries[] = [
  { label: "夫", color: C.male, values: SAT_HUSBAND, xs: AGE_XS },
  { label: "妻", color: C.female, values: SAT_WIFE, xs: AGE_XS },
];
const CH = { x: 300, y: 250, width: 1250, height: 470 };

// ---- 時間（S9c：共働き・末子の年齢別。分／日） ----
// 家事など＝家事＋介護・看護＋買い物、育児、仕事・通勤
const TIME = {
  husband: { pre: { work: 493, chores: 52, care: 63 }, post: { work: 491, chores: 46, care: 15 }, teen: { work: 507, chores: 37, care: 2 } },
  wife: { pre: { work: 241, chores: 189, care: 204 }, post: { work: 297, chores: 236, care: 40 }, teen: { work: 285, chores: 255, care: 8 } },
};
const dayCol = (who: "husband" | "wife", when: "pre" | "post", title: string, sub: string, focus: string[] = []): DayCol => {
  const t = TIME[who][when];
  const main = who === "husband" ? C.male : C.female, tint = who === "husband" ? C.maleTint : C.femaleTint;
  return {
    title, sub, titleColor: main,
    segs: [
      { key: "work", label: "仕事・通勤", min: t.work, color: C.otherTint, focus: focus.includes("work") },
      { key: "chores", label: "家事など", min: t.chores, color: main, textColor: C.white, focus: focus.includes("chores") },
      { key: "care", label: "育児", min: t.care, color: tint, focus: focus.includes("care") },
    ],
  };
};
const DAY = { x: 180, base: 730, k: 0.72, colW: 230, gap: [110, 280, 110, 0] };

// ---- 天秤（S9c：末子10〜14歳。家事・育児・買い物＝家事関連 夫39分・妻263分、仕事・通勤 夫507分・妻285分） ----
const chores = (who: "husband" | "wife", text = true): Weight => who === "husband"
  ? { label: "夫の家事など", value: 39, color: C.male, text: text ? "家事など\n39分" : undefined }
  : { label: "妻の家事など", value: 263, color: C.female, textColor: C.white, text: text ? "家事など\n4時間23分" : undefined };
const work = (who: "husband" | "wife", text?: string): Weight => ({ label: who === "husband" ? "夫の仕事" : "妻の仕事", value: who === "husband" ? 507 : 285, color: C.otherTint, text });
const BAL = { x: 960, y: 290 };
const BalanceAt: React.FC<{ left: Weight[]; right: Weight[]; tilt?: number; moving?: boolean; x?: number; y?: number }> = ({ left, right, tilt, moving, x = BAL.x, y = BAL.y }) => (
  <Balance x={x} y={y} left={left} right={right} tilt={tilt} moving={moving} leftName="夫" rightName="妻" leftColor={C.male} rightColor={C.female} />
);

// ================= 冒頭の物語 =================
const P01: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="red" names />
    <div style={{ position: "absolute", left: 96, top: 56, background: C.ink, borderRadius: R.sm, padding: "4px 18px", ...font("label", C.white) }}>土曜の夕方</div>
  </AbsoluteFill>
);
const P02: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="red">
      <Bubble x={96} y={96} text="来週は、水曜の帰りが遅い。金曜は出張" tail={[CAR.driver.x, 540]} role="label" />
      <Bubble x={1190} y={300} text="うん" tail={[CAR.passenger.x + 20, 560]} role="label" />
    </CarScene>
  </AbsoluteFill>
);
const P03: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="green">
      <Navi x={96} y={330} lines={["到着まで", "あと20分"]} from={{ x: CAR.navi.x - 80, y: CAR.navi.y }} />
      <Bubble x={560} y={110} text="うちはうまくいっている" tail={[CAR.driver.x + 20, 470]} role="label" />
    </CarScene>
    <div style={{ position: "absolute", left: 96, top: 230, background: C.ink, borderRadius: R.sm, padding: "4px 18px", ...font("label", C.white) }}>共働き 15年</div>
  </AbsoluteFill>
);
const RowsLabel: React.FC<{ y: number; top: string; bottom: string }> = ({ y, top, bottom }) => (
  <><Label x={96} y={y}>{top}</Label><Label x={96} y={y + 50} color={C.ink2}>{bottom}</Label></>
);
const P04: React.FC = () => (
  <AbsoluteFill>
    <Heading>夫婦の関係に満足していない妻</Heading>
    <Svg>
      <RowsLabel y={400} top="30歳前後" bottom="の妻 100人" />
      <PeopleRows x={360} y={300} kind="female" on={7} dy={72} />
      <Label x={1490} y={420} size="value" color={C.female}>6.5%</Label>
      <Label x={1490} y={470}>16人に1人</Label>
      <RowsLabel y={710} top="40代半ば" bottom="の妻 100人" />
      <PeopleRows x={360} y={610} kind="female" on={23} dy={72} />
      <Label x={1490} y={730} size="value" color={C.female}>23.1%</Label>
      <Label x={1490} y={780}>4人に1人近く</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（28〜32歳・43〜47歳）`} />
  </AbsoluteFill>
);
const P05: React.FC = () => (
  <AbsoluteFill>
    <Heading>では、同じ年ごろの夫は？</Heading>
    <Svg>
      <RowsLabel y={400} top="40代半ば" bottom="の妻 100人" />
      <PeopleRows x={360} y={300} kind="female" on={23} dy={72} />
      <Label x={1490} y={400}>満足していない</Label>
      <Label x={1490} y={450} color={C.female} weight={900}>23人</Label>
      <Label x={1490} y={520} color={C.ink2}>満足 77人</Label>
      <RowsLabel y={710} top="40代半ば" bottom="の夫 100人" />
      <rect x={340} y={560} width={1120} height={270} rx={R.lg} fill="none" stroke={C.male} strokeWidth={LINE.thin} strokeDasharray="16 12" />
      <Label x={900} y={730} anchor="middle" size="question" color={C.male}>？</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
  </AbsoluteFill>
);

// ================= 今日の答え合わせ・予想タイム・順番 =================
const P06: React.FC = () => <AbsoluteFill><TodayCard claim="夫婦は、二人いっしょに冷めていく" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
const DashedDay: React.FC<{ x: number; color: string }> = ({ x, color }) => (
  <g>
    <rect x={x - 150} y={300} width={300} height={150} rx={R.sm} fill="none" stroke={color} strokeWidth={LINE.thin} strokeDasharray="12 10" />
    <Label x={x} y={388} anchor="middle">家事・育児</Label>
    <rect x={x - 150} y={460} width={300} height={150} rx={R.sm} fill="none" stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 10" />
    <Label x={x} y={548} anchor="middle">仕事・通勤</Label>
    <Label x={x} y={270} anchor="middle" size="value">？</Label>
  </g>
);
const P07: React.FC = () => (
  <AbsoluteFill>
    <Heading w={1728}>予想タイム：共働き、末っ子が高学年〜中学生</Heading>
    <Svg>
      <DashedDay x={560} color={C.male} />
      <DashedDay x={1360} color={C.female} />
      <Cat kind="male" x={560} y={830} size={3.2} face="think" label="夫" />
      <Cat kind="female" x={1360} y={830} size={3.2} face="think" label="妻" seed={2} />
      <Label x={960} y={470} anchor="middle" size="value">足すと？</Label>
    </Svg>
  </AbsoluteFill>
);
const P08: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="家事・育児＋仕事・通勤、長いのは？" choices={["夫が1時間以上", "ほぼ同じ", "妻が1時間以上", "妻が3時間以上"]} />
    <SourceNote prefix="" text="共働き・末っ子が10〜14歳の夫婦（答えは最後の答え合わせで）" />
  </AbsoluteFill>
);
const P09: React.FC = () => {
  const cards: [string, string, React.ReactNode][] = [
    ["1", "夫と妻の満足を年齢ごとに", <g key="a"><polyline points="-110,-40 -40,-44 30,-30 110,-32" fill="none" stroke={C.male} strokeWidth={10} strokeLinecap="round" /><polyline points="-110,-40 -40,-10 30,20 110,24" fill="none" stroke={C.female} strokeWidth={10} strokeLinecap="round" /></g>],
    ["2", "妻の満足が下がる時期", <g key="b">{[0, 1, 2, 3].map((i) => <g key={i}><rect x={-110 + i * 60} y={-70} width={44} height={140} fill={C.female} /><rect x={-110 + i * 60} y={-70 + (i < 2 ? 20 : 40)} width={44} height={140 - (i < 2 ? 20 : 40)} fill={C.femaleTint} /></g>)}</g>],
    ["3", "二人の一日を天秤に", <g key="c"><line x1={-120} x2={120} y1={-40} y2={-40} stroke={C.ink} strokeWidth={10} strokeLinecap="round" /><rect x={-6} y={-40} width={12} height={110} fill={C.ink2} /><rect x={-150} y={0} width={70} height={14} fill={C.ink} /><rect x={80} y={0} width={70} height={14} fill={C.ink} /><line x1={-115} x2={-115} y1={-40} y2={0} stroke={C.ink2} strokeWidth={3} /><line x1={115} x2={115} y1={-40} y2={0} stroke={C.ink2} strokeWidth={3} /></g>],
  ];
  return (
    <AbsoluteFill>
      <Heading>今日の順番</Heading>
      <Svg>
        {cards.map(([n, t, icon], i) => {
          const x = 120 + i * 580;
          return (
            <g key={n}>
              <rect x={x} y={250} width={520} height={520} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 40} y={330} size="value">{n}</Label>
              <g transform={`translate(${x + 260},${500})`}>{icon}</g>
              <Label x={x + 260} y={710} anchor="middle">{t}</Label>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 第1章 =================
const ANSWERS = ["かなり\n満足", "どちらかといえば\n満足", "どちらかといえば\n不満", "かなり\n不満"];
const P10: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>夫婦の関係全体に、満足していますか</Heading>
    <Svg>
      {ANSWERS.map((a, i) => {
        const x = 130 + i * 430;
        return (
          <g key={i}>
            <rect x={x} y={400} width={380} height={170} rx={R.md} fill={i < 2 ? C.white : C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
            {a.split("\n").map((l, k) => <Label key={k} x={x + 190} y={472 + k * 52} anchor="middle">{l}</Label>)}
          </g>
        );
      })}
      <Bracket x1={130} x2={890} y={380} label="この2つを「満足」として数える" />
      <Label x={130} y={680}>全国から無作為に選んだ 28〜72歳、およそ3,000人（有効回答 3,033人）</Label>
      <Label x={130} y={740} color={C.ink2}>結婚している人の答えを、夫と妻に分けて年齢ごとに</Label>
    </Svg>
    <SourceNote text="日本家族社会学会『第4回 家族についての全国調査（NFRJ18）』2019年調査" />
  </AbsoluteFill>
);
const P11: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>夫婦の関係に満足している人の割合</Heading>
    <Svg>
      <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} upTo={1} endLabels={false}
        callouts={[{ s: 1, i: 0, text: "夫も妻も 93.5%", color: C.ink }]} />
      <Label x={CH.x + 160} y={CH.y + 260} color={C.male}>● 夫</Label>
      <Label x={CH.x + 300} y={CH.y + 260} color={C.female}>● 妻</Label>
    </Svg>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);
const P12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>あなたの家の二本の線は、いま？</Heading>
    <Svg>
      <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} band={{ from: 2, to: 4, label: "線が離れていく年ごろ" }}
        callouts={[{ s: 0, i: 3, text: "87.2%", dx: 70 }, { s: 1, i: 3, text: "76.9%", above: false }]} />
    </Svg>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);
const P13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>上の年代の数字には、くせがある</Heading>
    <Svg>
      <GenderLines {...CH} width={1050} ticks={AGE_TICKS} series={[...satSeries,
        { label: "妻だけの調査", color: C.female, ghost: true, values: [93.9, 79.0, 75.5, 77.8, 74.7], xs: [0.4, 3.4, 4.4, 5.4, 7.4] }]}
        callouts={[{ s: 1, i: 6, text: "4人に3人ほど", above: false }]} />
      <circle cx={CH.x + 30} cy={CH.y - 40} r={12} fill={C.white} stroke={C.female} strokeWidth={5} />
      <Label x={CH.x + 56} y={CH.y - 26} color={C.ink2}>妻だけに聞いた別の調査（4,649人）</Label>
      {/* 途中で別れた夫婦は、上の年代の数に入らない */}
      <g>
        <path d="M1440 470 H1740" stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 10" markerEnd="" />
        <path d="M1720 452 L1750 470 L1720 488" fill="none" stroke={C.ink2} strokeWidth={LINE.thin} />
        <Figure kind="female" x={1560} y={440} size={1.3} pose="walk" facing={1} />
        <Figure kind="male" x={1610} y={440} size={1.3} pose="walk" facing={1} />
      </g>
      <Label x={1440} y={550}>不満の大きい夫婦は</Label>
      <Label x={1440} y={600}>途中で別れて</Label>
      <Label x={1440} y={650}>数に入らない</Label>
    </Svg>
    <SourceNote text="NFRJ18（2019年）・第7回全国家庭動向調査（2022年）。別れた夫婦が抜ける点は Bühler ほか（2021）の注意" />
  </AbsoluteFill>
);
const P14: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>40代の夫婦を百組：満足していない人は</Heading>
    <Svg>
      <RowsLabel y={390} top="妻 100人" bottom="40代半ば" />
      <PeopleRows x={360} y={290} kind="female" on={23} dy={72} />
      <Label x={1490} y={400} size="value" color={C.female}>23人</Label>
      <RowsLabel y={700} top="夫 100人" bottom="40代半ば" />
      <PeopleRows x={360} y={600} kind="male" on={13} dy={72} />
      <Label x={1490} y={710} size="value" color={C.male}>13人</Label>
      <path d="M1700 380 h40 V690 h-40" fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1760} y={560} weight={900}>差</Label>
      <Label x={1760} y={610} weight={900}>10人</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（43〜47歳。100−満足の割合）`} />
  </AbsoluteFill>
);
const P15: React.FC = () => {
  const all = couples(100, 13, 10);
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading w={1728}>満足していない夫が全員、そういう妻と組んでも</Heading>
      <Svg>
        <CouplePairs x={112} y={370} items={all.slice(0, 23)} cols={23} pitch={75} />
        <Bracket x1={92} x2={92 + 13 * 75 - 10} y={290} label="二人とも満足していない 13組" />
        <Bracket x1={92 + 13 * 75} x2={92 + 23 * 75 - 10} y={290} label="妻だけ満足していない 10組" color={C.female} />
        <CouplePairs x={150} y={520} items={all.slice(23)} cols={20} />
        <Label x={150} y={430 + 400} color={C.ink2}>残りの77組は、二人とも満足</Label>
      </Svg>
      <SourceNote text="NFRJ18 の割合から計算（夫と妻を組で聞いた調査ではない）" />
    </AbsoluteFill>
  );
};
const P16: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>少なくとも十組に一組は、こういう家</Heading>
    <Svg>
      <path d="M560 360 L960 200 L1360 360 V820 H560 Z" fill={C.wall} stroke={C.ink2} strokeWidth={LINE.thin} strokeLinejoin="round" />
      <Cat kind="male" x={790} y={800} size={4} face="happy" facing={1} label="夫" />
      <Cat kind="female" x={1130} y={800} size={4} face="think" facing={-1} label="妻" seed={2} />
      <Label x={790} y={440} anchor="middle" color={C.male}>夫：満足</Label>
      <Label x={1130} y={440} anchor="middle" color={C.female}>妻：満足していない</Label>
      <Bubble x={96} y={230} text="うちはうまくいっている" tail={[700, 600]} role="label" />
    </Svg>
    <SourceNote text="NFRJ18 の割合から計算：23人 − 13人 ＝ 少なくとも10組（無関係に組むなら約20組）" />
  </AbsoluteFill>
);
const P17: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>理由は、家事？</Heading>
    <Svg>
      <Cat kind="female" x={520} y={820} size={3.6} face="think" label="妻の側" seed={2} />
      <Cat kind="male" x={1400} y={820} size={3.6} face="think" label="夫の側" />
    </Svg>
    <Card x={200} y={240} w={680} border={C.female}>夫が家事をしないから、<br />妻だけが冷めていく？</Card>
    <Card x={1060} y={240} w={680} border={C.male}>こちらは外で<br />働いている</Card>
  </AbsoluteFill>
);
const P18: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>妻の線が下がるのは、子育てのどの時期？</Heading>
    <Svg>
      <line x1={200} x2={1700} y1={560} y2={560} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      {[["0歳", 200], ["小学校", 650], ["中学", 1000], ["高校", 1250], ["18歳〜", 1600]].map(([t, x]) => (
        <g key={t as string}><circle cx={x as number} cy={560} r={14} fill={C.ink} /><Label x={x as number} y={630} anchor="middle" color={C.ink2}>{t}</Label></g>
      ))}
      <Label x={200} y={500} color={C.ink2}>末っ子の年齢</Label>
      <Label x={960} y={460} anchor="middle" size="value">？</Label>
      <g transform="translate(1620,300) scale(0.5)">
        <line x1={-120} x2={120} y1={-40} y2={-40} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        <rect x={-8} y={-40} width={16} height={130} fill={C.ink2} />
        <rect x={-160} y={10} width={80} height={16} fill={C.ink} /><rect x={80} y={10} width={80} height={16} fill={C.ink} />
      </g>
      <Label x={1620} y={400} anchor="middle" color={C.ink2}>家事か仕事かは</Label>
      <Label x={1620} y={450} anchor="middle" color={C.ink2}>第3章で数え直す</Label>
    </Svg>
  </AbsoluteFill>
);

// ================= 第2章 =================
const P19: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Quiz title="クイズ" question="満足と答える妻が少ないのは？（末っ子の年齢）" choices={["小学校に上がる前", "小学生〜高校生"]} />
  </AbsoluteFill>
);
const P20: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>答えは B：学校に通う時期のほうが低い</Heading>
    <Svg>
      <PercentColumns x={180} y={240} width={1300} height={420} lower={C.femaleTint} upper={C.female} valueInside
        cols={[{ label: "0歳", value: 86.2, ghost: 89.5 }, { label: "1〜2歳", value: 83.5, ghost: 80.9 }, { label: "3〜5歳", value: 85.3, ghost: 82.0 },
          { label: "6〜11歳", value: 72.8, ghost: 75.4, big: true }, { label: "12〜17歳", value: 73.8, ghost: 76.9, big: true }]}
        groups={[{ from: 0, to: 2, label: "上がる前：8割台" }, { from: 3, to: 4, label: "小学生〜高校生：7割台前半" }]}
        upperName="満足でない" lowerName="満足" />
      <line x1={1530} x2={1600} y1={420} y2={420} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 8" />
      <Label x={1620} y={434} color={C.ink2}>2018年</Label>
    </Svg>
    <SourceNote text="国立社会保障・人口問題研究所『全国家庭動向調査』第7回（2022）・第6回（2018、点線）。妻が回答、集計表から計算" />
  </AbsoluteFill>
);
const P21: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>小学校に上がると：合計は二人とも約1時間短く</Heading>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前", ["care"]), dayCol("husband", "post", "夫", "小学生", ["care"]),
        dayCol("wife", "pre", "妻", "上がる前", ["care"]), dayCol("wife", "post", "妻", "小学生", ["care"])]} />
      <Label x={775} y={420} color={C.ink2}>夫の育児</Label>
      <Label x={775} y={470} color={C.ink2}>63分→15分</Label>
      <Label x={1630} y={300} color={C.ink2}>妻の育児</Label>
      <Label x={1630} y={350} color={C.ink2}>204分→40分</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。末っ子6歳未満 → 6〜9歳`} />
  </AbsoluteFill>
);
const P22: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>変わるのは中身：妻の家事と仕事が増える</Heading>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前"), dayCol("husband", "post", "夫", "小学生", ["chores"]),
        dayCol("wife", "pre", "妻", "上がる前"), dayCol("wife", "post", "妻", "小学生", ["chores", "work"])]} />
      <Label x={775} y={420} color={C.ink2}>夫の家事など</Label>
      <Label x={775} y={470} color={C.ink2}>52分→46分</Label>
      <Label x={1630} y={420} color={C.female} weight={900}>家事など</Label>
      <Label x={1630} y={470} color={C.female} weight={900}>＋47分</Label>
      <Label x={1630} y={600} weight={900}>仕事・通勤</Label>
      <Label x={1630} y={650} weight={900}>＋56分</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。育児は、上がる前は夫が約4分の1（63分÷267分）`} />
  </AbsoluteFill>
);
const P23: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>夫の育児に満足している妻（末っ子の年齢別）</Heading>
    <Svg>
      <PercentColumns x={180} y={240} width={1300} height={420} lower={C.femaleTint} upper={C.female} valueInside
        cols={[{ label: "0歳", value: 69.9 }, { label: "1〜2歳", value: 74.5, big: true }, { label: "3〜5歳", value: 65.3 },
          { label: "6〜11歳", value: 56.6, big: true }, { label: "12〜17歳", value: 59.1 }]}
        groups={[{ from: 3, to: 4, label: "第1章の谷と同じ時期" }]} upperName="満足でない" lowerName="満足" />
    </Svg>
    <SourceNote text={`${SRC.nsfj7.replace("。集計表から計算", "")}。妻50歳未満・18歳未満の子と同居`} />
  </AbsoluteFill>
);
const P24: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>いまの数字から考えられる仮説</Heading>
    <Note x={96} y={240} role="label" question text={"子どもが学校に上がると、\n夫婦が一緒にやることが減り、\n妻が一人でやることが増える"} />
    <Svg>
      <g transform="translate(1000,250) scale(0.42)">
        <rect x={0} y={0} width={1920} height={1080} fill={C.wall} />
        <CarFront signal="none" front={<>
          <Cat kind="male" x={CAR.driver.x} y={CAR.driver.y} size={CAR.size.front} label="夫" />
          <Cat kind="female" x={CAR.passenger.x} y={CAR.passenger.y} size={CAR.size.front} facing={1} look={[1, 0]} label="妻" seed={2} />
        </>} back={<>
          <Cat kind="male" x={CAR.backL.x} y={CAR.backL.y} size={CAR.size.back} face="sleep" label="息子" />
          <Cat kind="female" x={CAR.backR.x} y={CAR.backR.y} size={CAR.size.back} face="sleep" label="娘" />
        </>} />
      </g>
      <rect x={1000} y={250} width={806} height={454} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1000} y={760}>冒頭の二人も、この時期</Label>
      <Label x={1000} y={810} color={C.ink2}>息子は中学2年、娘は小学5年</Label>
    </Svg>
  </AbsoluteFill>
);
const MEAN: GLSeries[] = [
  { label: "夫", color: C.male, values: [3.41, 3.17, 3.26] },
  { label: "妻", color: C.female, values: [3.31, 2.86, 2.93] },
];
const P25: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>満足の度合い（4点満点の平均）：夫も下がる</Heading>
    <Svg>
      <GenderLines x={360} y={250} width={1000} height={440} ticks={["結婚0〜9年", "20〜29年", "40年以上"]} series={MEAN}
        domain={[1, 4]} yTicks={[1, 2, 3, 4]} yFormat={(v) => `${v}点`}
        callouts={[{ s: 0, i: 1, text: "−0.24" }, { s: 1, i: 1, text: "−0.45", above: false }]} />
      <Label x={1460} y={560} color={C.ink2}>夫と妻の差は、</Label>
      <Label x={1460} y={610} color={C.ink2}>この人数では</Label>
      <Label x={1460} y={660} color={C.ink2}>はっきりしない</Label>
    </Svg>
    <SourceNote text="稲葉昭英（2021）NFRJ18 第2次報告書（初婚を続けている夫婦、2,137人）。図の線から読み取り。間の年数は省いている" />
  </AbsoluteFill>
);
const P26: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>海外：226の調査・約10万人をまとめると</Heading>
    <Svg>
      {[["ふつうの夫婦", "＝", "夫と妻の差は、ほとんどない"], ["カウンセリングに通う夫婦", "＞", "妻のほうがはっきり低い"]].map(([t, sym, d], i) => {
        const x = 140 + i * 840;
        return (
          <g key={i}>
            <rect x={x} y={240} width={780} height={500} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <Label x={x + 390} y={320} anchor="middle" weight={900}>{t}</Label>
            <Figure kind="male" x={x + 230} y={560} size={3} />
            <Label x={x + 390} y={520} anchor="middle" size="hero">{sym}</Label>
            <Figure kind="female" x={x + 550} y={560} size={3} dim={i === 0} />
            <Label x={x + 230} y={620} anchor="middle" color={C.male}>夫</Label>
            <Label x={x + 550} y={620} anchor="middle" color={C.female}>妻</Label>
            <Label x={x + 390} y={700} anchor="middle">{d}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text="Jackson, Miller, Oka, Henry（2014）Journal of Marriage and Family 76（要旨）。欧米が中心" />
  </AbsoluteFill>
);
const P27: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <MidCheck text="冷めるのは二人とも。不満は妻に多く出る" />
    <Svg>
      <GenderLines x={300} y={260} width={1000} height={400} ticks={AGE_TICKS} series={satSeries} />
    </Svg>
    <Card x={1440} y={380} w={400}>何が妻の満足を<br />下げている？<br />やはり、家事？</Card>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);

// ================= 第3章 =================
const P28: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>天秤に、まず家事・育児・買い物</Heading>
    <Svg><BalanceAt left={[chores("husband")]} right={[chores("wife")]} /></Svg>
    <Svg><Label x={96} y={812} color={C.ink2}>共働き・末っ子10〜14歳（冒頭の二人と同じ時期）</Label></Svg>
    <SourceNote text={SRC.time} />
  </AbsoluteFill>
);
const P29: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>夫が受け持つ家事の割合</Heading>
    <Svg>
      <PercentColumns x={260} y={260} width={1200} height={420} lower={C.male} upper={C.femaleTint} colW={150}
        cols={[{ label: "6歳未満", value: 22.6, big: true }, { label: "6〜9歳", value: 18.1 }, { label: "10〜14歳", value: 12.9, big: true }, { label: "15〜17歳", value: 10.4 }]}
        upperName="妻" lowerName="夫" />
      <Label x={860} y={830} anchor="middle" color={C.ink2}>末っ子の年齢</Label>
      <Label x={1600} y={480}>4分の1近く</Label>
      <Label x={1600} y={530}>→ 8分の1ほど</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。表の値から計算`} y={850} />
  </AbsoluteFill>
);
const P30: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>相手の家事に満足している人（40代半ば）</Heading>
    <Svg>
      <PercentColumns x={240} y={260} width={420} height={420} lower={C.maleTint} upper={C.male} colW={200} valueInside
        cols={[{ label: "夫 → 妻の家事", value: 83.0, big: true }]} />
      <PercentColumns x={760} y={260} width={420} height={420} lower={C.femaleTint} upper={C.female} colW={200} valueInside
        cols={[{ label: "妻 → 夫の家事", value: 65.7, big: true }]} upperName="満足でない" lowerName="満足" />
      <Label x={1440} y={300} color={C.ink2}>8割を超える</Label>
      <Label x={1440} y={350} color={C.ink2}>と 3人に2人</Label>
    </Svg>
    <Card x={1400} y={480} w={420}>ここまでなら、<br />やはり家事か</Card>
    <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
  </AbsoluteFill>
);
const P31: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading w={1728}>仕事の分銅をのせると：あなたの家なら？</Heading>
    <Svg><BalanceAt left={[chores("husband"), work("husband", "仕事・通勤")]} right={[chores("wife"), work("wife", "仕事・通勤")]} tilt={5} moving /></Svg>
    <SourceNote text={`${SRC.time}。止まる位置は答え合わせで`} />
  </AbsoluteFill>
);
const Cell: React.FC<{ x: number; y: number; on?: boolean; text: string; hidden?: boolean }> = ({ x, y, on, text, hidden }) => (
  <g>
    <rect x={x} y={y} width={440} height={120} rx={R.md} fill={hidden ? "none" : on ? C.ink : C.paper2} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={hidden ? "12 10" : undefined} />
    <Label x={x + 220} y={y + 74} anchor="middle" color={on ? C.white : C.ink} weight={on ? 900 : 700}>{hidden ? "？" : text}</Label>
  </g>
);
const Table: React.FC<{ showSupport: boolean }> = ({ showSupport }) => (
  <Svg>
    <Label x={760} y={300} anchor="middle" color={C.female} weight={900}>妻（322人）</Label>
    <Label x={1260} y={300} anchor="middle" color={C.male} weight={900}>夫（277人）</Label>
    <Label x={120} y={414}>夫が受け持つ</Label>
    <Label x={120} y={464}>家事の割合</Label>
    <Cell x={540} y={360} text="はっきりしない" />
    <Cell x={1040} y={360} text="はっきりしない" />
    <Label x={120} y={594}>相手からの</Label>
    <Label x={120} y={644}>心の支え</Label>
    <Cell x={540} y={540} on text="はっきり結びつく" hidden={!showSupport} />
    <Cell x={1040} y={540} on text="はっきり結びつく" hidden={!showSupport} />
  </Svg>
);
const P32: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>満足と一緒に動くのは？（年齢・収入などをそろえて）</Heading>
    <Table showSupport={false} />
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。28〜47歳の結婚している人。相関" />
  </AbsoluteFill>
);
const P33: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>はっきり結びついていたのは、心の支え</Heading>
    <Table showSupport />
    <Svg>
      {["悩みを聞いてくれる", "努力を認めてくれる", "助言をくれる"].map((t, i) => (
        <g key={t}><rect x={120 + i * 520} y={710} width={480} height={76} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={360 + i * 520} y={762} anchor="middle">{t}</Label></g>
      ))}
    </Svg>
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。妻を調べた末盛慶（1999）も同じ向き。相関" />
  </AbsoluteFill>
);
const P34: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>同じ量の家事でも、期待との差で受け取り方が変わる</Heading>
    <Svg>
      {[["期待より少ない", 520], ["期待どおり", 330]].map(([t, ey], i) => {
        const x = 420 + i * 640;
        return (
          <g key={i}>
            <rect x={x} y={420} width={220} height={330} rx={R.sm} fill={C.male} />
            <line x1={x - 60} x2={x + 280} y1={(ey as number) - 0} y2={(ey as number) - 0} stroke={C.female} strokeWidth={LINE.base} strokeDasharray="16 12" />
            <Label x={x + 300} y={(ey as number) + 14} color={C.female}>妻の期待</Label>
            <Label x={x + 110} y={600} anchor="middle" color={C.white}>夫の家事</Label>
            <Label x={x + 110} y={810} anchor="middle" weight={900}>{t}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text="李基平（2008）家族社会学研究 20(1)。1994年の妻886人。図は説明のための例（量は同じに描いた）" />
  </AbsoluteFill>
);
const P35: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>期待との差を入れると、家事の量との結びつきは</Heading>
    <Svg>
      {[["常勤の妻", ".092", ".049", "はっきりしない"], ["自営の妻", ".082", ".030", "はっきりしない"], ["パートの妻", ".090", ".047", "弱まる"], ["専業主婦", ".062", ".038", "弱まる"]].map(([t, a, b, d], i) => {
        const y = 290 + i * 130;
        const out = i < 2;
        return (
          <g key={t}>
            <Label x={160} y={y + 44} weight={900}>{t}</Label>
            <rect x={460} y={y} width={Number(a) * 5000} height={60} fill={C.rest} />
            <rect x={460} y={y + 64} width={Number(b) * 5000} height={10} fill={C.ink} />
            <Label x={1060} y={y + 44} color={out ? C.ink : C.ink2} weight={out ? 900 : 700}>{a} → {b}（{d}）</Label>
          </g>
        );
      })}
      <Label x={160} y={830} color={C.ink2}>灰＝家事の量だけのとき、墨の細い棒＝期待との差を入れたあと（係数）</Label>
    </Svg>
    <SourceNote text="李基平（2008）家族社会学研究 20(1)。1994年の妻886人。相関" y={850} />
  </AbsoluteFill>
);
const P36: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>支えは、量より「合っていたか」</Heading>
    <Svg>
      {[0, 1].map((i) => {
        const x = 120 + i * 860;
        return (
          <g key={i}>
            <rect x={x} y={230} width={800} height={560} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <Cat kind="other" x={x + 220} y={720} size={3.4} face={i === 0 ? "sad" : "happy"} facing={1} label="話す人" seed={i} />
            <Cat kind="other" x={x + 580} y={720} size={3.4} face="normal" facing={-1} label="聞く人" seed={i + 4} />
            <Label x={x + 400} y={300} anchor="middle" weight={900}>{i === 0 ? "合っていない支え" : "合っている支え"}</Label>
          </g>
        );
      })}
      <Bubble x={150} y={330} text="聞いてほしい" tail={[340, 520]} role="label" />
      <Bubble x={500} y={430} text="こうすれば？" tail={[700, 540]} role="label" />
      <Bubble x={1010} y={330} text="聞いてほしい" tail={[1200, 520]} role="label" />
      <Bubble x={1390} y={430} text="そうだったんだ" tail={[1560, 540]} role="label" />
    </Svg>
    <SourceNote text="Maisel & Gable（2009）Psychological Science。米国の同居カップル67組の日記（要旨）" />
  </AbsoluteFill>
);
const SUP_WIFE = [98, 88, 85, 78, 72, 76, 78, 76, 72];
const SUP_HUSBAND = [90, 90, 89, 86, 85, 91, 83, 87, 85];
const P37: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>「配偶者は悩みを聞いてくれる」と答えた人</Heading>
    <Svg>
      <GenderLines x={260} y={250} width={950} height={440} ticks={AGE_TICKS}
        series={[{ label: "夫", color: C.male, values: SUP_HUSBAND, xs: AGE_XS }, { label: "妻", color: C.female, values: SUP_WIFE, xs: AGE_XS }]}
        callouts={[{ s: 1, i: 0, text: "約98%", above: true, dx: -10 }, { s: 1, i: 4, text: "約72%", above: false }]} />
      <Label x={1500} y={230} color={C.ink2}>第1章の満足の線</Label>
      <GenderLines x={1440} y={280} width={380} height={300} ticks={["", "30", "", "", "", "50", "", "", "", "70", ""]} series={satSeries} endLabels={false} yTicks={[0, 100]} />
    </Svg>
    <SourceNote text={SRC.nfrjSupport} />
  </AbsoluteFill>
);
const P38: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>どちらが先かは、分からない</Heading>
    <Svg>
      <rect x={260} y={380} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={520} y={470} anchor="middle" weight={900}>心の支えを感じる</Label>
      <rect x={1140} y={380} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1400} y={470} anchor="middle" weight={900}>満足している</Label>
      <path d="M800 410 Q960 330 1120 410" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M1096 386 L1122 412 L1088 420" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M1120 500 Q960 580 800 500" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M824 524 L798 498 L832 490" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <Label x={960} y={330} anchor="middle" size="value">？</Label>
      <Label x={960} y={640} anchor="middle" size="value">？</Label>
    </Svg>
    <Card x={260} y={700} w={1400}>家事を手伝ってもらうこと自体が、心の支えとして届いているのかもしれない</Card>
  </AbsoluteFill>
);

// ================= 答え合わせ =================
const P39: React.FC = () => (
  <AbsoluteFill>
    <Heading>天秤が止まる：差は 2分</Heading>
    <Svg>
      <BalanceAt left={[chores("husband"), work("husband", "仕事・通勤\n8時間27分")]} right={[chores("wife"), work("wife", "仕事・通勤\n4時間45分")]} />
      <Label x={BAL.x - 560} y={BAL.y + 300 + 170} anchor="middle" size="value" color={C.male}>9時間6分</Label>
      <Label x={BAL.x + 560} y={BAL.y + 300 + 170} anchor="middle" size="value" color={C.female}>9時間8分</Label>
    </Svg>
    <div style={{ position: "absolute", right: 96, top: 56, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 14, background: C.ink, borderRadius: R.md, padding: "8px 22px", ...font("label", C.white) }}>
      予想の答え B ほぼ同じ
    </div>
    <SourceNote text={`${SRC.time}。末っ子10〜14歳`} />
  </AbsoluteFill>
);
const P40: React.FC = () => (
  <AbsoluteFill>
    <Heading>ほかの時期も：差は1時間に届かない</Heading>
    <PairedBars x={200} y={300} width={1300} height={420} max={700} names={["夫", "妻"]} format={(v) => `${Math.round(v)}分`}
      rows={[{ label: "6歳未満", male: 608, female: 634 }, { label: "6〜9歳", male: 552, female: 573 }, { label: "10〜14歳", male: 546, female: 548 }, { label: "15〜17歳", male: 529, female: 570 }]} />
    <Svg>
      {[26, 21, 2, 41].map((d, i) => <Label key={i} x={200 + 1300 / 4 * (i + 0.5)} y={830} anchor="middle" weight={900}>差 {d}分</Label>)}
      <Label x={1560} y={500} color={C.ink2}>どちらかが</Label>
      <Label x={1560} y={550} color={C.ink2}>楽をしている、</Label>
      <Label x={1560} y={600} color={C.ink2}>という数字では</Label>
      <Label x={1560} y={650} color={C.ink2}>ない</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。家事関連＋仕事・通勤`} y={860} />
  </AbsoluteFill>
);
const P41: React.FC = () => (
  <AbsoluteFill>
    <Heading>時間の長さでは、谷は説明できない</Heading>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前"), dayCol("husband", "post", "夫", "小学生"),
        dayCol("wife", "pre", "妻", "上がる前"), dayCol("wife", "post", "妻", "小学生", ["chores", "work"])]} />
    </Svg>
    <Card x={1620} y={300} w={260}>変わったのは、<br />長さではなく<br />中身</Card>
    <SourceNote text={SRC.time} />
  </AbsoluteFill>
);
const P42: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="夫婦は、二人いっしょに冷めていく" mark="△"
      reason={["満足の点数の平均は、夫も妻も下がる", "満足していない人は、30代後半から妻に多い", "家事＋仕事の時間は、ほぼ同じ（差2分）"]} />
  </AbsoluteFill>
);
const P43: React.FC = () => (
  <AbsoluteFill>
    <Heading>分けるもの1：年齢ではなく、家族の時期</Heading>
    <Svg>
      <PercentColumns x={140} y={250} width={1500} height={400} lower={C.femaleTint} upper={C.female} valueInside colW={150}
        cols={[{ label: "0〜5歳", value: 85, text: "約85%" }, { label: "6〜11歳", value: 72.8 }, { label: "12〜17歳", value: 73.8 },
          { label: "18歳〜同居", value: 72.0 }, { label: "家を出た", value: 80.1, big: true }]}
        groups={[{ from: 1, to: 3, label: "谷：小学校に上がってから家を出るまで" }]} upperName="満足でない" lowerName="満足" />
      <Label x={140} y={226} color={C.ink2}>末っ子の年齢・暮らし方</Label>
    </Svg>
    <SourceNote text={`${SRC.nsfj7}。年齢の違う家を同じ年に比べたもの`} y={850} />
  </AbsoluteFill>
);
const P44: React.FC = () => (
  <AbsoluteFill>
    <Heading>子どもが家を出たあと（アメリカ・18年の追跡）</Heading>
    <Svg>
      <Cat kind="male" x={520} y={760} size={4} pose="sit" face="happy" facing={1} label="夫" />
      <Cat kind="female" x={800} y={760} size={4} pose="sit" face="happy" facing={-1} label="妻" seed={2} />
      <rect x={380} y={760} width={560} height={30} rx={R.sm} fill={C.floor} />
    </Svg>
    <Card x={1060} y={260} w={760} bg={C.paper2}>一緒に過ごす時間が増えたから<br />→ ではなかった</Card>
    <Card x={1060} y={480} w={760}>一緒の時間を楽しめるようになったから<br />→ 結婚の満足が上がった</Card>
    <SourceNote text="Gorchoff, John, Helson（2008）Psychological Science 19(11)。中年の女性（要旨）" />
  </AbsoluteFill>
);
const P45: React.FC = () => (
  <AbsoluteFill>
    <Heading>満足を分けていたもの</Heading>
    <Card x={140} y={260} w={780}><b>1　家族の時期</b><br />谷は、末っ子が小学校に上がってから家を出るまで<br /><span style={{ color: C.ink2 }}>家を出たあとに戻るかは、国や調査で分かれる</span></Card>
    <Card x={1000} y={260} w={780}><b>2　心の支えがあると感じるか</b><br />悩みを聞く・努力を認める・助言<br /><span style={{ color: C.ink2 }}>（第3章）</span></Card>
    <SourceNote text="第7回全国家庭動向調査（2022）・稲葉（2011）・永瀬（2021）" />
  </AbsoluteFill>
);

// ================= 教訓 =================
const P46: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="none">
      <Navi x={96} y={330} lines={["到着まで", "あと5分"]} from={{ x: CAR.navi.x - 80, y: CAR.navi.y }} />
    </CarScene>
  </AbsoluteFill>
);
const P47: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <g transform="translate(60,170) scale(0.62)"><BalanceAt left={[chores("husband", false), work("husband")]} right={[chores("wife", false), work("wife")]} /></g>
      <GenderLines x={1300} y={280} width={480} height={400} ticks={["", "30", "", "", "", "50", "", "", "", "70", ""]} series={satSeries} yTicks={[0, 100]} />
      <Label x={640} y={820} anchor="middle">天秤は、ほぼつり合う</Label>
      <Label x={1540} y={820} anchor="middle">満足の線は、二本に分かれる</Label>
    </Svg>
  </AbsoluteFill>
);
const Coin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="prop" data-qa-label="硬貨"><circle cx={x} cy={y} r={90} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.base} /><text x={x} y={y + 30} textAnchor="middle" style={font("value")}>円</text></g>
);
const Stopwatch: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="prop" data-qa-label="時計">
    <circle cx={x} cy={y} r={90} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
    <rect x={x - 16} y={y - 124} width={32} height={30} fill={C.ink} />
    <line x1={x} y1={y} x2={x + 40} y2={y - 50} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
  </g>
);
const P48: React.FC = () => (
  <AbsoluteFill>
    <Heading>私たちは、数えやすいものから数える</Heading>
    <Svg>
      {[["家事の分数", 0], ["働いた時間", 1], ["年収", 2]].map(([t, i]) => {
        const x = 420 + (i as number) * 540;
        return (
          <g key={t as string}>
            {i === 2 ? <Coin x={x} y={480} /> : <Stopwatch x={x} y={480} />}
            <Label x={x} y={680} anchor="middle" weight={900}>{t}</Label>
          </g>
        );
      })}
      <Label x={960} y={790} anchor="middle" color={C.ink2}>比べやすく、言い返しやすい</Label>
    </Svg>
  </AbsoluteFill>
);
const P49: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cat kind="male" x={520} y={820} size={4} face="think" facing={1} label="夫" />
      <Cat kind="female" x={1400} y={820} size={4} face="think" facing={-1} label="妻" seed={2} />
      <Bubble x={120} y={180} text="俺のほうが、長く働いている" tail={[520, 560]} role="label" />
      <Bubble x={1000} y={300} text="わたしのほうが、家のことをしている" tail={[1400, 560]} role="label" />
      <Stopwatch x={960} y={640} />
      <Label x={960} y={820} anchor="middle" color={C.ink2}>どちらも、時計で測れば確かめられる</Label>
    </Svg>
  </AbsoluteFill>
);
const P50: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="none">
      <Navi x={96} y={330} lines={["到着まで", "あと5分"]} from={{ x: CAR.navi.x - 80, y: CAR.navi.y }} />
      <rect x={1180} y={290} width={190} height={90} rx={45} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="12 10" />
      <text x={1275} y={350} textAnchor="middle" style={font("label")}>うん</text>
    </CarScene>
    <div style={{ position: "absolute", left: 600, top: 120, ...font("label", C.ink2) }}>カーナビは一分ごとに数える。「うん」の中身は数えない</div>
  </AbsoluteFill>
);
const P51: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="red" husbandFacing={1} wifeFacing={-1} wifeFace="happy">
      <Bubble x={300} y={110} text="今日、疲れた？" tail={[CAR.driver.x + 30, 530]} role="sub" />
      <Bubble x={1010} y={250} text="そっちこそ" tail={[CAR.passenger.x - 20, 540]} role="sub" />
    </CarScene>
  </AbsoluteFill>
);
const P52: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <BalanceAt left={[chores("husband", false), work("husband")]} right={[chores("wife", false), work("wife")]} />
      <rect x={BAL.x - 300} y={BAL.y + 330} width={150} height={120} rx={R.sm} fill="none" stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="14 12" />
    </Svg>
  </AbsoluteFill>
);
const P53: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const panels: Panel[] = [
  { key: "01", title: "冒頭：交差点の赤信号", C: P01, sec: 9.4, lines: "土曜の夕方です。", move: "夕方の空から車の正面へ寄る。信号が赤に変わる（光がふくらむ）。後ろの席で息子と娘が眠っている（寝息で肩が上下）。名札は1.5秒だけ" },
  { key: "02", title: "冒頭：来週の段取りと「うん」", C: P02, sec: 12.9, lines: "ハンドルを握った夫が", move: "夫は前を向いたまま、吹き出しが左から出る。妻は窓（画面の右）を見たまま、小さく「うん」。二人のまばたきだけが動く" },
  { key: "03", title: "冒頭：あと20分・共働き15年", C: P03, sec: 18.3, lines: "カーナビが、到着まであと二十分", move: "ダッシュボードのカーナビから大きな画面がせり出す（点線でつなぐ）。「共働き15年」の札。夫の頭の上に「うちはうまくいっている」。最後に信号が赤→青" },
  { key: "04", title: "冒頭：満足していない妻 16人に1人→4人に1人近く", C: P04, sec: 11.4, lines: "全国で聞くと", move: "車から引いて紙の地へ。100人の妻が2列できて、上は7人、下は23人が濃い色に変わる（1人ずつ点く）。数字は値の文字だけ数え上げる" },
  { key: "05", title: "冒頭：では、夫は？", C: P05, sec: 12.3, lines: "もちろん、四十代の妻でも", move: "上の列の淡い77人に「満足」が付く（多くは満足）。下の列が点線の枠に変わり、夫の色の「？」が置かれる" },
  { key: "06", title: "今日の答え合わせ", C: P06, sec: 7.2, lines: "今日の答え合わせは", move: "点線の枠を左へ払ってカード。ゴサが考え中で出る" },
  { key: "07", title: "予想タイム：条件", C: P07, sec: 17.3, lines: "まず、ひとつ予想して", move: "夫と妻の猫が左右に立つ。頭の上に点線の箱が2段（家事・育児／仕事・通勤）ずつ積まれ、てっぺんに「？」。真ん中に「足すと？」" },
  { key: "08", title: "予想タイム：4択", C: P08, sec: 14.7, lines: "Aは、夫のほうが一時間以上長い", move: "選択肢が1つずつ。3秒の輪。答えは出さない（答え合わせで）" },
  { key: "09", title: "今日の順番", C: P09, sec: 16.3, lines: "今日は、三つの順に", move: "3枚の札が左から並ぶ（線・柱・天秤の絵）。このあと第1章の扉" },
  { key: "10", title: "第1章：3,000人の調査と4つの答え", C: P10, sec: 22.0, lines: "全国から無作為に選ばれた", move: "第1章の扉 → 4枚の答えの札が並ぶ。左の2枚に括弧「満足として数える」。下に調査の説明が1行ずつ" },
  { key: "11", title: "第1章：30歳前後は二本が重なる", C: P11, sec: 14.9, lines: "満足と答えた人の割合を", move: "札が縮んで縦軸0〜100%のグラフへ。30歳前後に夫の点と妻の点が同じ所に置かれ、「夫も妻も 93.5%」" },
  { key: "12", title: "第1章：妻の線が下がる・あなたの家は", C: P12, sec: 25.5, lines: "ところが三十代の後半から", move: "二本の線が左から右へ同じ速さで伸びる。35歳を過ぎて妻の線だけ大きく下がる。45歳に 76.9%・87.2%。「あなたの家」で35〜45歳に帯が敷かれ、3秒止める" },
  { key: "13", title: "第1章：別の調査・上の年代のくせ", C: P13, sec: 25.7, lines: "妻だけに聞いた、四千人を超える", move: "白抜きの点（妻だけの調査）が線に重なる。右へ、手をつないだ夫婦が歩いて枠の外へ抜けていく（点線の矢印）。それでも妻の線は4人に3人のまま" },
  { key: "14", title: "第1章：百組の妻と夫", C: P14, sec: 16.8, lines: "では、一つの家の中では", move: "グラフの線が人に分かれて、妻100人・夫100人の2列に並び直す。満足していない妻23人・夫13人が濃くなり、右に「差10人」の括弧" },
  { key: "15", title: "第1章：組にすると10組あまる", C: P15, sec: 11.3, lines: "満足していない夫13人が", move: "夫13人が濃い妻の隣へ歩いて13組。残った濃い妻10人の隣へ、淡い（満足している）夫が歩いてくる。括弧が上から付く。残り77組は下に" },
  { key: "16", title: "第1章：十組に一組の家", C: P16, sec: 14.9, lines: "だから少なくとも十組に一組は", move: "10組のうち1組に寄り、人型が猫の夫婦に変わる（家の枠）。夫は満足、妻は考える顔。夫の吹き出し「うちはうまくいっている」。妻は責めない・夫も責めない顔" },
  { key: "17", title: "第1章：理由は家事？（先回り）", C: P17, sec: 13.9, lines: "ここまで聞くと", move: "妻の側・夫の側に札が1枚ずつ。どちらも同じ大きさ（どちらの言い分も同じ重さ）" },
  { key: "18", title: "第1章：どの時期？", C: P18, sec: 11.3, lines: "その答えは、第3章で", move: "二枚の札が右上の小さな天秤へ吸い込まれる（第3章の予告）。末っ子の年齢の線が左から引かれ、真ん中に「？」" },
  { key: "19", title: "第2章：クイズ（2択）", C: P19, sec: 19.4, lines: "ここで、クイズです", move: "第2章の扉 → 2択。3秒の輪。「夜泣きやおむつ」で A がわずかに揺れる（引っかけ）" },
  { key: "20", title: "第2章：答えは B（末っ子の年齢別）", C: P20, sec: 20.0, lines: "答えは、Bです", move: "B が塗られ、100%の柱が5本立つ。上（満足でない）が濃く、学校の時期の2本で濃い所が厚くなる。2018年の点線が後から重なる" },
  { key: "21", title: "第2章：小学校に上がると育児が減る", C: P21, sec: 25.4, lines: "なぜ、手がかかる時期より", move: "夫と妻の一日の柱（高さ＝分）が2本ずつ。上がる前→小学生で、上の育児の段が二人とも縮み、柱が1時間ほど低くなる（帯でつなぐ）" },
  { key: "22", title: "第2章：中身の入れ替わり", C: P22, sec: 20.8, lines: "変わるのは、長さより中身", move: "妻の小学生の柱で、家事と仕事の段が太枠になり＋47分・＋56分。夫の家事の段は細いまま（46分）。夫を悪く見せない：夫の仕事の段もそのまま見せる" },
  { key: "23", title: "第2章：夫の育児への満足（妻）", C: P23, sec: 18.5, lines: "妻たちに", move: "柱が左から立つ。1〜2歳の74.5%と6〜11歳の56.6%だけ大きく。下に「第1章の谷と同じ時期」の括弧" },
  { key: "24", title: "第2章：仮説・冒頭の二人もこの時期", C: P24, sec: 14.1, lines: "子どもが学校に上がると", move: "仮説の札が1行ずつ。右に冒頭の車が小さく戻る（後ろの子が中2・小5）" },
  { key: "25", title: "第2章：夫も下がる（満足の点数）", C: P25, sec: 27.9, lines: "では、夫は下がっていないのでしょうか", move: "縦軸1〜4点（尺度の端から端まで）。夫の線が先に描かれて下がる → 妻の線。20年過ぎの底に−0.24・−0.45。最後に「差ははっきりしない」が出る" },
  { key: "26", title: "第2章：海外のまとめ（10万人）", C: P26, sec: 24.4, lines: "海外には、二百を超える調査", move: "左のカード（＝）→ 右のカード（＞）の順。右のカードだけ妻の人型が濃くなる" },
  { key: "27", title: "第2章：ここまでの答え合わせ", C: P27, sec: 18.1, lines: "ここまでの答え合わせです", move: "第1章の二本の線が戻り、上に「ここまでの答え合わせ」。右に問いの札" },
  { key: "28", title: "第3章：天秤に家事をのせる", C: P28, sec: 25.7, lines: "夫婦の一日を、天秤にのせて", move: "第3章の扉 → 天秤が下から立つ。左に夫、右に妻の名前。家事の分銅（高さ＝分）が落ちてきて、妻の側へ大きく傾く（ばね）" },
  { key: "29", title: "第3章：夫が受け持つ家事の割合", C: P29, sec: 15.6, lines: "夫が受け持つ家事の割合は", move: "100%の柱が4本、夫の段（濃い青）が年齢とともに低くなる。22.6%と12.9%だけ大きく" },
  { key: "30", title: "第3章：相手の家事への満足", C: P30, sec: 18.0, lines: "相手の家事への満足も", move: "夫の柱 → 妻の柱の順に立つ。右に「やはり家事か」の札" },
  { key: "31", title: "第3章：仕事の分銅（動いている途中）", C: P31, sec: 28.8, lines: "でも、この天秤には", move: "夫の皿に仕事の分銅（朝の電車・会議・残業・帰りの電車の小さな絵が入った1つの塊、高さ＝分）、妻の皿にも分銅。天秤が戻りはじめた途中で止め、揺れの弧と「？」。数字は出さない。止まる位置は答え合わせまで見せない" },
  { key: "32", title: "第3章：家事の割合は結びつかない", C: P32, sec: 21.8, lines: "では、満足している人と", move: "表の1行目が左から埋まる（はっきりしない）。2行目は点線の「？」" },
  { key: "33", title: "第3章：心の支え（妻も夫も）", C: P33, sec: 19.3, lines: "はっきり結びついていたのは", move: "2行目が墨で塗られる。下に3つの支えの札が1枚ずつ" },
  { key: "34", title: "第3章：期待との差（説明の図）", C: P34, sec: 20.2, lines: "なぜ家事の量より", move: "同じ高さの家事の棒が2本。妻の期待の点線が左は上、右は棒の高さに降りてくる" },
  { key: "35", title: "第3章：働く妻では量の結びつきが消える", C: P35, sec: 11.4, lines: "とくに外で働く妻では", move: "4行の灰の棒が、期待との差を入れると細い墨の棒に縮む。常勤・自営の2行に太字" },
  { key: "36", title: "第3章：支えは合っていたか", C: P36, sec: 23.7, lines: "海外の研究にも", move: "左右に同じ2匹（灰の猫＝男女を決めない）。左は「こうすれば？」で話す猫がしょんぼり、右は「そうだったんだ」で笑う。左→右の順" },
  { key: "37", title: "第3章：悩みを聞いてくれる（2本の線）", C: P37, sec: 24.7, lines: "最初の三千人の調査に戻ります", move: "第1章と同じ形のグラフ。妻の線が約98%から約72%へ下がり、夫は8〜9割で平ら。右上に第1章の満足の線が小さく並び、同じ形と分かる" },
  { key: "38", title: "第3章：どちらが先か", C: P38, sec: 22.7, lines: "ただし、どちらが先かは", move: "2つの札を結ぶ矢印が行き来して両方に「？」。最後に右下へ小さな天秤（動いている途中）が戻る" },
  { key: "39", title: "答え合わせ：天秤が止まる・差2分", C: P39, sec: 17.7, lines: "答え合わせです", move: "第3章の天秤がゆっくり水平へ。止まった瞬間に 9時間6分・9時間8分。右上に予想の答え B。ゴサは出さない（数字の画面）" },
  { key: "40", title: "答え合わせ：ほかの時期も1時間未満", C: P40, sec: 23.6, lines: "ほかの時期も見ておきます", move: "夫と妻の棒が4組並ぶ（縦軸0から）。下に差の分が1つずつ。右に「楽をしている、という数字ではない」" },
  { key: "41", title: "答え合わせ：長さではなく中身", C: P41, sec: 10.4, lines: "家事と仕事を足した時間の長さでは", move: "第2章の一日の柱が戻り、妻の家事と仕事の段に太枠" },
  { key: "42", title: "答え合わせ △", C: P42, sec: 26.7, lines: "では、今日の説です", move: "判定のカード → 証拠が3つ → 刻み → △。ゴサ「ひげ、のびます。」" },
  { key: "43", title: "答え合わせ：家族の時期", C: P43, sec: 20.9, lines: "満足を分けているものも", move: "100%の柱が5本。谷の3本に括弧、最後の「家を出た」80.1%だけ大きく" },
  { key: "44", title: "答え合わせ：子が家を出たあと（米国）", C: P44, sec: 27.3, lines: "子どもが家を出たあとについては", move: "ベンチに猫の夫婦。上の札（時間が増えたから）が灰色に沈み、下の札（楽しめるように）が出る" },
  { key: "45", title: "答え合わせ：分けるもの2つ", C: P45, sec: 14.5, lines: "日本では、さっきのように", move: "2枚の札が並ぶ。1の札の下に「国や調査で分かれる」が小さく" },
  { key: "46", title: "教訓：車に戻る・あと5分", C: P46, sec: 11.4, lines: "もう一度、土曜の夕方の車に", move: "冒頭と同じ車。カーナビが20分→5分。信号はない（走っている）。妻はまだ窓の外" },
  { key: "47", title: "教訓：天秤はつり合う、線は二本", C: P47, sec: 8.9, lines: "彼の一日も、妻の一日も", move: "左に水平の天秤、右に二本の線が並ぶ" },
  { key: "48", title: "教訓：数えやすいもの", C: P48, sec: 12.0, lines: "私たちは、数えやすいものから", move: "時計・時計・硬貨が1つずつ置かれる" },
  { key: "49", title: "教訓：どちらも言える", C: P49, sec: 13.3, lines: "夫は、こう言えます", move: "夫の吹き出し → 妻の吹き出し（同じ大きさ）。真ん中の時計の針が回る。どちらも怒った顔にしない" },
  { key: "50", title: "教訓：「うん」は数えられない", C: P50, sec: 15.0, lines: "でも、数えやすいものが", move: "カーナビの数字が5分のまま一分ずつ点滅。妻の頭の上に点線の「うん」が残る" },
  { key: "51", title: "教訓：「今日、疲れた？」「そっちこそ」", C: P51, sec: 12.2, lines: "信号で止まったとき", move: "信号が赤。夫が助手席へ顔を向ける →「今日、疲れた？」→ 妻が窓から顔を戻し、少し笑って「そっちこそ」" },
  { key: "52", title: "教訓：天秤はつり合っていた", C: P52, sec: 12.4, lines: "天秤は、つり合っていました", move: "水平の天秤。台の上に、どちらの皿にものっていない点線の分銅が1つ（量り忘れていたもの）。締めの一文で引いていく" },
  { key: "53", title: "締めのひと言（毎回同じ）", C: P53, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];

const storyboard: StoryboardDef = { id: "004-marriage-forty-dip", title: "40代、夫婦の満足は二本に分かれる（第1版）", panels };
export default storyboard;
