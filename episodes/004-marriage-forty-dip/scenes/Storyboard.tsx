// 4本目「40代、夫婦の満足は二本に分かれる」の絵コンテ 第2版（2026-10-06。台本は script.md の第5稿・改。第1版は53場面）。
// 第2版：3役（アニメーター・イラストレーター・デザイナー）の見直しを反映（review/storyboard-summary.md）。長く同じ絵が続く所は場面を割った（63場面。合計秒数は第1版と同じ）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から。lines はその場面の最初の文。動き（move）は本編で付ける動き。
// 色の決まり（この回）：
//   - 男女の色（夫＝male、妻＝female）。濃い・淡いは「満足でない（濃い）／満足（淡い）」だけに使う（第1章の札で一度だけ教える）。
//   - 一日の中身と天秤の分銅は、その人の色1つで塗りの種類を変える：家事など＝塗り、育児＝水玉、仕事・通勤＝斜線（凡例は最初の一日の柱で一度）。仕事を灰にしない。
//   - 左右は夫が左・妻が右（車・天秤・組・表）。上下に並べる群衆は、話の主役の妻を上。
// 物語の場面（車の中・せりふ）は猫、データの人数は人型。同じ場面に混ぜない。妻も夫も責めない（think の顔を人に向けない。悪役の顔・ぼんやり顔にしない）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Balance, LooseWeight, Weight } from "@lib/Balance";
import { Bracket } from "@lib/Bracket";
import { Camera, Shot } from "@lib/Camera";
import { MidCheck, TodayCard } from "@lib/Cards";
import { CAR, CarFront, Navi, Signal } from "@lib/Car";
import { Cat, CatFace, CatLabel } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { CohortRace } from "@lib/CohortRace";
import { couples, CouplePairs, PeopleRows } from "@lib/CouplePairs";
import { DayCol, DayStack } from "@lib/DayStack";
import { Figure } from "@lib/Figure";
import { FillDefs, FillSwatch } from "@lib/Fills";
import { GenderLines, GLSeries } from "@lib/GenderLines";
import { Gosa } from "@lib/Gosa";
import { Ball, Bottle, Briefcase, Bulb, Ear, Hanamaru, House, Randoseru, SchoolBag } from "@lib/Icons";
import { Note } from "@lib/Labels";
import { PercentColumns } from "@lib/PercentColumns";
import { Bench, Clock, Cup, Table } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Bubble, Thought } from "@lib/StoryAnim";
import { Verdict } from "@lib/Verdict";
import { shuffle } from "@lib/random";
import { cohortBy } from "@lib/sim/cohort";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具（絵の部品は render/src/lib） ----
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
export const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（左上の決まった位置。1行に収める） */
export const Heading: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 1640 }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: w, ...font("question"), lineHeight: 1.2 }}>{children}</div>
);
/** 見出しの下の条件（ink2 の1行） */
export const SubHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 168, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{children}</div>
);
/** 墨の札（HTML、左上を x,y に） */
export const Card: React.FC<{ x: number; y: number; w?: number; h?: number; children: React.ReactNode; border?: string; bg?: string }> = ({ x, y, w, h, children, border = C.ink, bg = C.white }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: "18px 28px", background: bg, border: `${LINE.thin}px solid ${border}`, borderRadius: R.md, ...font("label"), lineHeight: 1.4, boxSizing: "border-box" }}>{children}</div>
);
/** 黒地の小札（「土曜の夕方」「仮説」など） */
export const Chip: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, background: C.ink, borderRadius: R.sm, padding: "4px 18px", ...font("label", C.white), whiteSpace: "nowrap" }}>{children}</div>
);

export const SRC = {
  nfrj: "NFRJ18（日本家族社会学会、2019年調査）図から読み取り。年齢の違う人を同じ年に調べたもの",
  nfrjSupport: "NFRJ18 第一次報告書 図8（2019年調査）図から読み取り。年齢の違う人を同じ年に調べたもの",
  nsfj7: "国立社会保障・人口問題研究所『第7回全国家庭動向調査』2022年（妻が回答）。集計表から計算",
  time: "総務省『社会生活基本調査』2021年。共働き・夫婦と子の世帯、週全体の平均。家事＝家事関連（家事・育児・買い物・介護など）",
};

// ================= 車の中（冒頭と教訓で同じ車） =================
// 向き（Cat の turn）：妻は窓の外（画面の右）＝turn 0.7、夫は前＝turn 0（黒目だけ少し上）。締め（61）は夫が助手席へ 0.8、妻が顔を戻す −0.6、2匹を30pxずつ寄せる。
export const CarScene: React.FC<{
  signal?: Signal; time?: number; wifeFace?: CatFace; husbandFace?: CatFace; wifeTurn?: number; husbandTurn?: number; inward?: number;
  names?: boolean; kids?: boolean; children?: React.ReactNode;
}> = ({ signal = "red", time = 0, wifeFace = "normal", husbandFace = "normal", wifeTurn = 0.7, husbandTurn = 0, inward = 0, names = false, kids = true, children }) => (
  <Svg>
    <CarFront signal={signal} time={time}
      back={<>
        <Cat kind="male" x={CAR.backL.x} y={CAR.backL.y} size={CAR.size.back} face="sleep" facing={1} label="息子" seed={3} />
        <Cat kind="female" x={CAR.backR.x} y={CAR.backR.y} size={CAR.size.back} face="sleep" facing={-1} label="娘" seed={5} />
        {kids && <><Ball x={CAR.backL.x - 34} y={556} s={0.5} label="息子のボール" /><Randoseru x={CAR.backR.x + 38} y={552} s={0.42} color={C.femaleTint} label="娘のランドセル" /></>}
      </>}
      front={<>
        <Cat kind="male" x={CAR.driver.x + inward} y={CAR.driver.y} size={CAR.size.front} face={husbandFace} turn={husbandTurn}
          look={husbandTurn ? undefined : [0, -0.4]} label="夫" />
        <Cat kind="female" x={CAR.passenger.x - inward} y={CAR.passenger.y} size={CAR.size.front} face={wifeFace} turn={wifeTurn} label="妻" seed={2} />
        {names && <CatLabel x={CAR.driver.x} y={CAR.driver.y} size={CAR.size.front} text="夫（45）" />}
        {names && <CatLabel x={CAR.passenger.x} y={CAR.passenger.y} size={CAR.size.front} text="妻（44）" />}
      </>} />
    {children}
  </Svg>
);
/** カメラの寄り（絵コンテでは止めた1コマ。本編では前のショットから寄る） */
export const CamShot: React.FC<{ shot: Shot; children: React.ReactNode }> = ({ shot, children }) => <Camera keys={[[0, shot]]}>{children}</Camera>;

// ---- 第1章の線（S7c：28〜72歳、5歳ごと。横軸は25〜75歳の11区分、データは30〜70歳の9区分） ----
export const AGE_TICKS = ["", "30歳", "35", "40", "45", "50", "55", "60", "65", "70", ""];
export const AGE_XS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const SAT_HUSBAND = [93.5, 95.0, 89.4, 87.2, 89.2, 93.3, 87.9, 84.5, 89.4];
export const SAT_WIFE = [93.5, 86.7, 84.7, 76.9, 76.8, 77.0, 76.9, 78.2, 73.6];
export const satSeries: GLSeries[] = [
  { label: "夫", color: C.male, values: SAT_HUSBAND, xs: AGE_XS },
  { label: "妻", color: C.female, values: SAT_WIFE, xs: AGE_XS },
];
// 妻だけの別の調査（S14。聞き方が違うのでつながない・墨の灰の輪）。25〜29・40〜44・45〜49・50〜54・60〜64歳
export const NSFJ_WIFE: GLSeries = { label: "妻だけの調査", color: C.ink2, ghost: true, values: [93.9, 79.0, 75.5, 77.8, 74.7], xs: [0.4, 3.4, 4.4, 5.4, 7.4] };
/** 二本の線のグラフの枠（11〜13・27・37 で同じ。5歳ぶん 125px） */
export const CH = { x: 300, y: 250, width: 1250, height: 470 };
export const AxisTitle: React.FC<{ text?: string }> = ({ text = "満足している割合" }) => <Label x={96} y={200} color={C.ink2}>{text}</Label>; // 100%の目盛り（y264）と上下16px以上
/** 夫の輪・妻の点の凡例（グラフの外の右上） */
export const LegendHW: React.FC<{ x?: number; y?: number }> = ({ x = 1330, y = 200 }) => (
  <g>
    <circle cx={x} cy={y - 14} r={17} fill="none" stroke={C.male} strokeWidth={LINE.base} />
    <Label x={x + 30} y={y} color={C.male}>夫</Label>
    <circle cx={x + 120} cy={y - 14} r={10} fill={C.female} />
    <Label x={x + 142} y={y} color={C.female}>妻</Label>
  </g>
);

// ---- 時間（S9c：共働き・末子の年齢別。分／日） ----
// 家事など＝家事＋介護・看護＋買い物（塗り）、育児（水玉）、仕事・通勤（斜線）。どれもその人の色
export const TIME = {
  husband: { pre: { work: 493, chores: 52, care: 63 }, post: { work: 491, chores: 46, care: 15 } },
  wife: { pre: { work: 241, chores: 189, care: 204 }, post: { work: 297, chores: 236, care: 40 } },
};
export const dayCol = (who: "husband" | "wife", when: "pre" | "post", title: string, sub: string, focus: string[] = []): DayCol => {
  const t = TIME[who][when];
  const main = who === "husband" ? C.male : C.female;
  return {
    title, sub, titleColor: main,
    segs: [
      { key: "work", label: "仕事・通勤", min: t.work, color: main, fill: "hatch", focus: focus.includes("work") },
      { key: "chores", label: "家事など", min: t.chores, color: main, focus: focus.includes("chores") },
      { key: "care", label: "育児", min: t.care, color: main, fill: "dots", focus: focus.includes("care") },
    ],
  };
};
// 柱の位置：夫（上がる前 x100・小学生 x440）、妻（x1000・x1340）。右の余白 x1824 を超えない
export const DAY = { x: 100, base: 710, k: 0.72, colW: 230, gap: [110, 330, 110, 0] };
export const DAY2 = { ...DAY, gap: [110 + 230 + 330] }; // 「上がる前」の2本だけ（4本のときと同じ位置）
export const dayY = (who: "husband" | "wife", when: "pre" | "post", seg: "work" | "chores" | "care") => {
  const t = TIME[who][when];
  const below = seg === "work" ? 0 : seg === "chores" ? t.work : t.work + t.chores;
  return DAY.base - (below + t[seg] / 2) * DAY.k;
};
export const Leader: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = (p) => <path d={`M${p.x1} ${p.y1} L${p.x2} ${p.y2}`} stroke={C.ink} strokeWidth={LINE.hair} fill="none" />;
/** 塗りの凡例（一日の柱で最初に一度だけ） */
export const FillLegend: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <FillDefs colors={[C.ink2]} />
    {([["solid", "家事など"], ["dots", "育児"], ["hatch", "仕事・通勤"]] as const).map(([k, t], i) => (
      <g key={k}><FillSwatch x={x} y={y + i * 70} kind={k} color={C.ink2} /><Label x={x + 72} y={y + i * 70 + 34}>{t}</Label></g>
    ))}
    <Label x={x} y={y + 230} color={C.ink2}>色は、その人の色</Label>
  </g>
);

// ---- 天秤（S9c：末子10〜14歳。家事・育児・買い物＝家事関連 夫39分・妻263分、仕事・通勤 夫507分・妻285分） ----
export const chores = (who: "husband" | "wife", text = true): Weight => who === "husband"
  ? { label: "夫の家事など", value: 39, color: C.male, text: text ? "家事など\n39分" : undefined }
  : { label: "妻の家事など", value: 263, color: C.female, text: text ? "家事など\n4時間23分" : undefined };
export const work = (who: "husband" | "wife", text?: string): Weight => ({ label: who === "husband" ? "夫の仕事" : "妻の仕事", value: who === "husband" ? 507 : 285,
  color: who === "husband" ? C.male : C.female, fill: "hatch", text });
export const veiled = (who: "husband" | "wife"): Weight => ({ ...work(who), veiled: true });
export const BAL = { x: 960, y: 320 }; // 妻の皿が下がっても皿の名前が出典と16px以上離れる高さ
export const BalanceAt: React.FC<{ left: Weight[]; right: Weight[]; tilt?: number; moving?: boolean; from?: number; names?: boolean }> = ({ left, right, tilt, moving, from, names = true }) => (
  <Balance x={BAL.x} y={BAL.y} left={left} right={right} tilt={tilt} moving={moving} from={from}
    leftName={names ? "夫" : undefined} rightName={names ? "妻" : undefined} leftColor={C.male} rightColor={C.female} />
);
/** 小さな天秤（何ものっていない。札の絵・予告に）。文字は入れない */
export const MiniBalance: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s}) translate(${-BAL.x},${-BAL.y})`}><Balance x={BAL.x} y={BAL.y} left={[]} right={[]} tilt={0} /></g>
);

// ================= 冒頭の物語（車。カメラで 引き → 夫 → 妻 → カーナビ → 引き の5カット） =================
export const S01: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="red" names />
    <Chip x={96} y={56}>土曜の夕方</Chip>
  </AbsoluteFill>
);
export const S02: React.FC = () => (
  <AbsoluteFill>
    <CamShot shot={{ x: 690, y: 440, scale: 1.7 }}><CarScene signal="red" /></CamShot>
    <Svg><Bubble x={600} y={340} w={800} text="来週は、水曜の帰りが遅い。金曜は出張" tail={[905, 490]} role="label" /></Svg>
  </AbsoluteFill>
);
export const S03: React.FC = () => (
  <AbsoluteFill>
    <CamShot shot={{ x: 1150, y: 440, scale: 1.7 }}><CarScene signal="red" /></CamShot>
    <Svg><Bubble x={1150} y={350} text="うん" tail={[1110, 498]} role="label" /></Svg>
  </AbsoluteFill>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <CamShot shot={{ x: 920, y: 560, scale: 1.3 }}><CarScene signal="red" /></CamShot>
    <Svg><Navi x={96} y={300} w={480} lines={["到着まで", "あと20分"]} from={{ x: 960, y: 596 }} /></Svg>
    <Chip x={96} y={56}>共働き 15年</Chip>
  </AbsoluteFill>
);
export const S05: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="green">
      <Thought x={430} y={240} text="うちはうまくいっている" toward={[650, 412]} />
    </CarScene>
  </AbsoluteFill>
);
export const RowsLabel: React.FC<{ y: number; top: string; bottom: string; color?: string }> = ({ y, top, bottom, color = C.ink }) => (
  <><Label x={96} y={y} color={color}>{top}</Label><Label x={96} y={y + 60} color={C.ink2}>{bottom}</Label></>
);
export const S06: React.FC = () => (
  <AbsoluteFill>
    <Heading>夫婦の関係に満足していない妻</Heading>
    <Svg>
      <RowsLabel y={380} top="30歳前後の妻" bottom="100人" />
      <PeopleRows x={380} y={290} kind="female" on={7} dy={68} />
      <Label x={1500} y={400} size="value" color={C.female}>6.5%</Label>
      <Label x={1500} y={462}>15人に1人</Label>
      <RowsLabel y={670} top="40代半ばの妻" bottom="100人" />
      <PeopleRows x={380} y={580} kind="female" on={23} dy={68} />
      <Label x={1500} y={690} size="value" color={C.female}>23.1%</Label>
      <Label x={1500} y={752}>4人に1人近く</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（28〜32歳・43〜47歳）`} />
  </AbsoluteFill>
);
export const S07: React.FC = () => (
  <AbsoluteFill>
    <Heading>では、同じ年ごろの夫は？</Heading>
    <Svg>
      <RowsLabel y={380} top="40代半ばの妻" bottom="100人" />
      <PeopleRows x={380} y={290} kind="female" on={23} dy={68} />
      <Label x={1500} y={380}>満足していない</Label>
      <Label x={1500} y={440} color={C.female} weight={900}>23人</Label>
      <Label x={1500} y={510} color={C.ink2}>満足 77人</Label>
      <RowsLabel y={670} top="40代半ばの夫" bottom="100人" color={C.male} />
      <rect x={360} y={530} width={1120} height={280} rx={R.lg} fill="none" stroke={C.male} strokeWidth={LINE.thin} strokeDasharray="16 12" />
      <Label x={920} y={740} anchor="middle" size="hero" color={C.male}>？</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
  </AbsoluteFill>
);

// ================= 今日の答え合わせ・予想タイム・順番 =================
export const S08: React.FC = () => <AbsoluteFill><TodayCard claim="夫婦は、2人いっしょに冷めていく" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
/** 予想の条件：量を表さない札（同じ形の札を横に並べるだけ。高さで答えをにおわせない） */
export const TwoTags: React.FC<{ x: number }> = ({ x }) => (
  <g>
    {["家事・育児", "仕事・通勤"].map((t, i) => (
      <g key={t}>
        <rect x={x - 305 + i * 350} y={420} width={260} height={90} rx={R.md} fill="none" stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 10" />
        <Label x={x - 175 + i * 350} y={479} anchor="middle">{t}</Label>
      </g>
    ))}
    <Label x={x} y={482} anchor="middle" size="value" color={C.ink2}>＋</Label>
  </g>
);
export const S09: React.FC = () => (
  <AbsoluteFill>
    <Heading w={1728}>予想タイム：共働き、末っ子が高学年〜中学生</Heading>
    <Svg>
      <TwoTags x={480} />
      <TwoTags x={1440} />
      <Cat kind="male" x={480} y={820} size={4} look={[0, -0.8]} label="夫" />
      <Cat kind="female" x={1440} y={820} size={4} look={[0, -0.8]} label="妻" seed={2} />
      <Label x={600} y={800} color={C.male} weight={900}>夫</Label>
      <Label x={1320} y={800} anchor="end" color={C.female} weight={900}>妻</Label>
      <Label x={960} y={700} anchor="middle" size="value">足すと？</Label>
    </Svg>
  </AbsoluteFill>
);
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="家事・育児＋仕事・通勤、長いのは？" choices={["夫が1時間以上", "ほぼ同じ", "妻が1時間以上", "妻が3時間以上"]} />
    <SourceNote prefix="" text="共働き・末っ子が10〜14歳の夫婦（答えは最後の答え合わせで）" />
  </AbsoluteFill>
);
export const S11: React.FC = () => {
  const cards: [string, string, React.ReactNode][] = [
    ["1", "夫と妻の満足を年齢ごとに", <g key="a"><polyline points="-110,-40 -40,-44 30,-30 110,-32" fill="none" stroke={C.male} strokeWidth={10} strokeLinecap="round" /><polyline points="-110,-40 -40,-10 30,20 110,24" fill="none" stroke={C.female} strokeWidth={10} strokeLinecap="round" /></g>],
    ["2", "妻の満足が下がる時期", <g key="b">{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={-130 + i * 54} y={-70} width={40} height={140} fill={C.female} /><rect x={-130 + i * 54} y={-70 + (i < 3 ? 20 : 40)} width={40} height={140 - (i < 3 ? 20 : 40)} fill={C.femaleTint} /></g>)}</g>],
    ["3", "二人の一日を天秤に", <MiniBalance key="c" x={0} y={-30} s={0.26} />],
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
              <Label x={x + 40} y={330} size="value">{`第${n}章`}</Label>
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
export const ANSWERS = ["かなり\n満足", "どちらかといえば\n満足", "どちらかといえば\n不満", "かなり\n不満"];
export const S12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>夫婦の関係全体に、満足していますか</Heading>
    <Svg>
      {ANSWERS.map((a, i) => {
        const x = 130 + i * 430;
        const sat = i < 2;
        return (
          <g key={i}>
            <rect x={x} y={360} width={380} height={200} rx={R.md} fill={sat ? C.white : C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
            {a.split("\n").map((l, k) => <Label key={k} x={x + 190} y={424 + k * 58} anchor="middle">{l}</Label>)}
            {/* 色の約束の見本：満足＝淡い色、満足でない＝濃い色（夫・妻の半分ずつ） */}
            <rect data-qa="mark" data-qa-label="色の見本" x={x + 110} y={514} width={80} height={26} fill={sat ? C.maleTint : C.male} />
            <rect data-qa="mark" data-qa-label="色の見本" x={x + 190} y={514} width={80} height={26} fill={sat ? C.femaleTint : C.female} />
          </g>
        );
      })}
      <Bracket x1={130} x2={890} y={340} label="この2つを「満足」として数える" />
      <Label x={130} y={630}>この回の色：淡い色＝満足、濃い色＝満足していない</Label>
      <Label x={130} y={720} color={C.ink2}>全国から無作為に選んだ28〜72歳、約3,000人（有効回答3,033人）</Label>
    </Svg>
    <SourceNote text="日本家族社会学会『第4回 家族についての全国調査（NFRJ18）』2019年調査" />
  </AbsoluteFill>
);
export const S13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>夫婦の関係に満足している人の割合</Heading>
    <Svg>
      <AxisTitle />
      <LegendHW />
      <GenderLines {...CH} ticks={AGE_TICKS} series={[{ ...satSeries[0], ring: true }, satSeries[1]]} upTo={1} endLabels={false}
        callouts={[{ s: 1, i: 0, text: "夫も妻も 93.5%", color: C.ink, above: false, dx: 44, dy: -20, anchor: "start" }]} />
    </Svg>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);
export const S14: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>三十代の後半から、妻の線が下がる</Heading>
    <Svg>
      <AxisTitle />
      <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries}
        callouts={[{ s: 0, i: 3, text: "87.2%", dy: -6 }, { s: 1, i: 3, text: "76.9%", above: false }]} />
    </Svg>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);
export const S15: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>三十代後半〜四十代：線が離れていく年ごろ</Heading>
    <Svg>
      <AxisTitle />
      <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} band={{ from: 2, to: 4, label: "線が離れていく年ごろ", labelAt: "bottom" }} />
      {/* 「あなた」の目印（本編では 35〜45歳の上を左右に1往復） */}
      <path d={`M${CH.x + 125 * 3} ${CH.y + 10} V${CH.y + 400}`} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 10" />
      <Label x={CH.x + 125 * 3} y={CH.y - 18} anchor="middle" weight={900}>あなた</Label>
    </Svg>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);
export const S16: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>別の調査でも、同じ形</Heading>
    <Svg>
      <AxisTitle />
      <GenderLines {...CH} ticks={AGE_TICKS} series={[...satSeries, NSFJ_WIFE]} band={{ from: 6, to: 9, label: "上の年代", labelAt: "bottom" }} />
      <circle cx={CH.x + 420} cy={CH.y - 28} r={12} fill={C.white} stroke={C.ink2} strokeWidth={5} />
      <Label x={CH.x + 446} y={CH.y - 14} color={C.ink2}>妻だけに聞いた別の調査（聞き方が違う・4,649人）</Label>
    </Svg>
    <SourceNote text="NFRJ18（2019年）・第7回全国家庭動向調査（2022年、妻のみ。75歳以上は80.6%）。どちらも横断データ" />
  </AbsoluteFill>
);
/** 説明のための図：不満の大きい夫婦が途中で別れて抜けると、残った夫婦の満足は高めに出る（人数は例。共通部品 CohortRace の leave）。
 *  妻100人（満足していない23人）を45歳から20年進める。別れる割合は例：満足していない人 年2.2%、満足している人 年0.3%（種2）。
 *  結果：別れた12人、残った88人のうち満足していない16人（18%）。誰の気持ちも変わっていないのに、23%→18%に見える。 */
export const DROP_FOCUS = (() => { const idx = shuffle(Array.from({ length: 100 }, (_, i) => i), 42).slice(0, 23); return Array.from({ length: 100 }, (_, i) => idx.includes(i)); })();
export const DROP = { focus: DROP_FOCUS, events: cohortBy(100, 45, 20, (i) => (DROP_FOCUS[i] ? 0.022 : 0.003), 2), years: 20 };
export const DropRace: React.FC<{ perYear?: number; start?: number }> = ({ perYear = 9, start = 0 }) => (
  <CohortRace x={96} y={250} kinds={Array(100).fill("female")} years={DROP.years} perYear={perYear} start={start} mode="leave"
    verb="別れて抜けた" focusName="満足していない" cols={20} dx={56} dy={80} size={1.1}
    groups={[{ label: "40代半ばの妻 100人（例）", startAge: 45, events: DROP.events, focus: DROP.focus }]} />
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <SimBackground />
    <ChapterDots current={1} />
    <Heading>上の年代の数字には、くせがある</Heading>
    <SubHead>不満の大きい夫婦は、途中で別れて、調査に出てこない</SubHead>
    <DropRace />
    <Svg>
      <Label x={1276} y={750} color={C.ink2}>はじめは 23人（23%）</Label>
      <Label x={1276} y={810} color={C.ink2}>誰の気持ちも変わらない</Label>
    </Svg>
    <SourceNote sim prefix="" text="説明の図（人数は例）。Bühler ほか（2021）の注意" />
  </AbsoluteFill>
);
export const S18: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>それでも、妻の線は上がってこない</Heading>
    <Svg>
      <AxisTitle />
      <GenderLines {...CH} ticks={AGE_TICKS} series={[...satSeries, NSFJ_WIFE]} callouts={[{ s: 1, i: 6, text: "4人に3人ほど", above: false }]} />
    </Svg>
    <SourceNote text="NFRJ18（2019年）・第7回全国家庭動向調査（2022年）。どちらも横断データ" />
  </AbsoluteFill>
);
export const S19: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>40代の夫婦を百組：満足していない人は</Heading>
    <Svg>
      <RowsLabel y={370} top="妻 100人" bottom="40代半ば" color={C.female} />
      <PeopleRows x={380} y={280} kind="female" on={23} dy={68} />
      <Label x={1500} y={390} size="value" color={C.female}>23人</Label>
      <RowsLabel y={670} top="夫 100人" bottom="40代半ば" color={C.male} />
      <PeopleRows x={380} y={580} kind="male" on={13} dy={68} />
      <Label x={1500} y={690} size="value" color={C.male}>13人</Label>
      <path d="M1660 370 h30 V670 h-30" fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1710} y={500} weight={900}>差</Label>
      <Label x={1710} y={560} weight={900}>10人</Label>
    </Svg>
    <SourceNote text={`${SRC.nfrj}（43〜47歳。100−満足の割合）`} />
  </AbsoluteFill>
);
export const S20: React.FC = () => {
  const all = couples(100, 13, 10);
  const rowB = all.slice(13, 23).map((c) => ({ ...c, mark: true }));
  return (
    <AbsoluteFill>
      <SimBackground />
      <ChapterDots current={1} />
      <Heading w={1728}>満足していない夫が全員、そういう妻と組んでも</Heading>
      <Svg>
        <Label x={96} y={290}>二人とも満足していない</Label>
        <Label x={96} y={350} weight={900}>13組</Label>
        <CouplePairs x={600} y={340} items={all.slice(0, 13)} cols={13} gap={16} />
        <Label x={96} y={412} color={C.female}>妻だけ満足していない</Label>
        <Label x={96} y={472} color={C.female} weight={900}>10組</Label>
        <CouplePairs x={600} y={460} items={rowB} cols={13} gap={16} />
        <CouplePairs x={150} y={560} items={all.slice(23)} cols={20} size={1.15} gap={12} row={70} />
        <Label x={1530} y={750} color={C.ink2}>残りの77組は、</Label>
        <Label x={1530} y={810} color={C.ink2}>二人とも満足</Label>
      </Svg>
      <SourceNote sim prefix="条件：" text="満足していない夫が全員、満足していない妻と組むとき（NFRJ18 の割合から計算）" />
    </AbsoluteFill>
  );
};
export const S21: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>少なくとも十組に一組は、こういう家</Heading>
    <Svg>
      <path d="M560 360 L960 200 L1360 360 V820 H560 Z" fill={C.wall} stroke={C.ink2} strokeWidth={LINE.thin} strokeLinejoin="round" />
      <Table x={960} y={800} size={4} w={50} />
      <Cup x={930} y={800 - 84} size={3} steam={false} />
      <Cup x={995} y={800 - 84} size={3} steam={false} />
      <Cat kind="male" x={740} y={800} size={5.6} face="happy" turn={0.2} label="夫" />
      <Cat kind="female" x={1180} y={800} size={5.6} look={[0.6, 0.7]} label="妻" seed={2} />
      <Thought x={600} y={340} text="うちはうまくいっている" toward={[720, 522]} />
      <Label x={330} y={720} anchor="middle" color={C.male} weight={900}>夫：満足</Label>
      <Label x={1600} y={720} anchor="middle" color={C.female} weight={900}>妻：満足していない</Label>
    </Svg>
    <SourceNote text="NFRJ18 の割合から計算：23人 − 13人 ＝ 少なくとも10組（無関係に組むなら約20組）" />
  </AbsoluteFill>
);
export const S22: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>理由は、家事？</Heading>
    <Svg>
      <Thought x={160} y={420} w={700} text={"こちらは外で\n働いている"} toward={[500, 618]} />
      <Thought x={1060} y={420} w={700} text={"夫が家事をしないから、\n妻だけが冷めていく？"} toward={[1420, 618]} />
      <Cat kind="male" x={500} y={820} size={3.6} look={[0, -0.8]} label="夫の側" />
      <Cat kind="female" x={1420} y={820} size={3.6} look={[0, -0.8]} label="妻の側" seed={2} />
    </Svg>
  </AbsoluteFill>
);
export const S23: React.FC = () => {
  const X = (age: number) => 200 + age * 75; // 1年 75px（等間隔）
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>妻の線が下がるのは、子育てのどの時期？</Heading>
      <Svg>
        <line x1={X(0)} x2={X(18)} y1={520} y2={520} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
        {([["0歳", 0], ["小学校", 6], ["中学", 12], ["高校", 15], ["18歳", 18]] as const).map(([t, a]) => (
          <g key={t}><circle cx={X(a)} cy={520} r={14} fill={C.ink} /><Label x={X(a)} y={590} anchor="middle" color={C.ink2}>{t}</Label></g>
        ))}
        <Bottle x={X(3)} y={690} label="哺乳びん" />
        <Randoseru x={X(9)} y={690} label="ランドセル" />
        <SchoolBag x={X(15)} y={690} label="学生かばん" />
        <Label x={X(0)} y={460} color={C.ink2}>末っ子の年齢</Label>
        <Label x={X(9)} y={440} anchor="middle" size="value">？</Label>
        <MiniBalance x={1690} y={250} s={0.2} />
        <Label x={1660} y={420} anchor="middle" color={C.ink2}>家事か仕事かは</Label>
        <Label x={1660} y={480} anchor="middle" color={C.ink2}>第3章で</Label>
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 第2章 =================
export const S25: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>答えは B：学校に通う時期のほうが低い</Heading>
    <Svg>
      <PercentColumns x={130} y={240} width={1440} height={400} lower={C.femaleTint} upper={C.female} valuePos="inside" colW={200}
        cols={[{ label: "0歳", value: 86.2, ghost: 89.5 }, { label: "1〜2歳", value: 83.5, ghost: 80.9 }, { label: "3〜5歳", value: 85.3, ghost: 82.0 },
          { label: "6〜11歳", value: 72.8, ghost: 75.4, big: true }, { label: "12〜17歳", value: 73.8, ghost: 76.9, big: true },
          { label: "18歳〜同居", value: 72.0, ghost: 78.1, sub: "家を出るまで続く", text: "72.0%" }]}
        groups={[{ from: 0, to: 2, label: "上がる前：8割台" }, { from: 3, to: 4, label: "小学生〜高校生：7割台前半" }]}
        upperName="満足でない" lowerName="満足" />
      <line x1={1580} x2={1620} y1={196} y2={196} stroke={C.ink} strokeWidth={LINE.base} />
      <Label x={1640} y={210} color={C.ink2}>2018年の値</Label>
    </Svg>
    <SourceNote text="国立社会保障・人口問題研究所『全国家庭動向調査』第7回（2022）・第6回（2018、柱の横の線）。妻が回答、集計表から計算" />
  </AbsoluteFill>
);
export const S26: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>小学校に上がると、一日の中身はどう変わる？</Heading>
    <Svg>
      <DayStack {...DAY2} cols={[dayCol("husband", "pre", "夫", "上がる前"), dayCol("wife", "pre", "妻", "上がる前")]} />
      <FillLegend x={1440} y={300} />
    </Svg>
    <SourceNote text={`${SRC.time}。末っ子6歳未満`} />
  </AbsoluteFill>
);
export const S27: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>育児が減り、合計は二人とも約1時間短く</Heading>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前", ["care"]), dayCol("husband", "post", "夫", "小学生", ["care"]),
        dayCol("wife", "pre", "妻", "上がる前", ["care"]), dayCol("wife", "post", "妻", "小学生", ["care"])]} />
      <Leader x1={676} y1={dayY("husband", "post", "care")} x2={716} y2={420} />
      <Label x={724} y={420} color={C.ink2}>夫の育児</Label>
      <Label x={724} y={480} color={C.ink2}>63分→15分</Label>
      <Leader x1={1576} y1={dayY("wife", "post", "care")} x2={1606} y2={300} />
      <Label x={1614} y={300} color={C.ink2}>妻の育児</Label>
      <Label x={1614} y={360} color={C.ink2}>204分→40分</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。末っ子6歳未満 → 6〜9歳`} />
  </AbsoluteFill>
);
export const S28: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>変わるのは中身：妻の家事と仕事が増える</Heading>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前"), dayCol("husband", "post", "夫", "小学生", ["chores"]),
        dayCol("wife", "pre", "妻", "上がる前"), dayCol("wife", "post", "妻", "小学生", ["chores", "work"])]} />
      <Leader x1={676} y1={dayY("husband", "post", "chores")} x2={716} y2={430} />
      <Label x={724} y={440} color={C.ink2}>夫の家事など</Label>
      <Label x={724} y={500} color={C.ink2}>52分→46分</Label>
      <Label x={1600} y={420} color={C.female} weight={900}>家事など</Label>
      <Label x={1600} y={480} color={C.female} weight={900}>＋47分</Label>
      <Label x={1600} y={610} color={C.female} weight={900}>仕事・通勤</Label>
      <Label x={1600} y={670} color={C.female} weight={900}>＋56分</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。育児は、上がる前は夫が約4分の1（63分÷267分）`} />
  </AbsoluteFill>
);
/** 一緒に → 一人で（猫の場面。第2章の仮説の中身） */
export const S29: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>一緒にやることが減り、一人でやることが増える</Heading>
    <Svg>
      {[0, 1].map((i) => <rect key={i} x={120 + i * 860} y={220} width={820} height={590} rx={R.lg} fill={C.wall} stroke={C.ink} strokeWidth={LINE.thin} />)}
      <Label x={530} y={290} anchor="middle" weight={900}>小学校に上がる前</Label>
      <Label x={1390} y={290} anchor="middle" weight={900}>小学生になると</Label>
      {/* 前：二人で子の世話 */}
      <Cat kind="male" x={330} y={760} size={3.6} face="smile" turn={0.4} label="夫" />
      <Cat kind="female" x={530} y={760} size={2.2} face="happy" label="末っ子" seed={7} />
      <Cat kind="female" x={730} y={760} size={3.6} face="smile" turn={-0.4} label="妻" seed={2} />
      <Label x={530} y={400} anchor="middle" color={C.ink2}>育児を二人で</Label>
      {/* 後：夫は外で仕事、妻は家で一人 */}
      <Cat kind="male" x={1130} y={760} size={3.6} turn={-0.6} label="夫" />
      <Briefcase x={1240} y={700} label="仕事の鞄" />
      <Label x={1130} y={400} anchor="middle" color={C.ink2}>外で仕事</Label>
      <line x1={1300} x2={1300} y1={430} y2={790} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="10 10" />
      <Cat kind="female" x={1560} y={760} size={3.6} look={[0.3, 0.6]} label="妻" seed={2} />
      <House x={1690} y={640} label="家事" />
      <Label x={1560} y={400} anchor="middle" color={C.ink2}>家事と仕事を一人で</Label>
    </Svg>
    <SourceNote text={`${SRC.time}から考えた図（仮説）`} />
  </AbsoluteFill>
);
export const S30: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>夫の育児に満足している妻（末っ子の年齢別）</Heading>
    <Svg>
      <PercentColumns x={180} y={240} width={1300} height={420} lower={C.femaleTint} upper={C.female} valuePos="inside" colW={190}
        cols={[{ label: "0歳", value: 69.9 }, { label: "1〜2歳", value: 74.5, big: true }, { label: "3〜5歳", value: 65.3 },
          { label: "6〜11歳", value: 56.6, big: true }, { label: "12〜17歳", value: 59.1 }]}
        groups={[{ from: 3, to: 4, label: "関係の満足（前の図）と同じ時期" }]} upperName="満足でない" lowerName="満足" />
    </Svg>
    <SourceNote text={`${SRC.nsfj7.replace("。集計表から計算", "")}。妻50歳未満・18歳未満の子と同居`} />
  </AbsoluteFill>
);
export const S31: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>いまの数字から考えられる仮説</Heading>
    <Chip x={96} y={300}>仮説</Chip>
    <Note x={96} y={360} role="label" question text={"子どもが学校に上がると、\n夫婦が一緒にやることが減り、\n妻が一人でやることが増える"} />
    <Svg>
      <g transform="translate(1000,300) scale(0.42)">
        <rect x={0} y={0} width={1920} height={1080} fill={C.wall} />
        <CarFront signal="none" front={<>
          <Cat kind="male" x={CAR.driver.x} y={CAR.driver.y} size={CAR.size.front} look={[0, -0.4]} label="夫" />
          <Cat kind="female" x={CAR.passenger.x} y={CAR.passenger.y} size={CAR.size.front} turn={0.7} label="妻" seed={2} />
        </>} back={<>
          <Cat kind="male" x={CAR.backL.x} y={CAR.backL.y} size={CAR.size.back} face="sleep" label="息子" />
          <Cat kind="female" x={CAR.backR.x} y={CAR.backR.y} size={CAR.size.back} face="sleep" label="娘" />
          <Ball x={CAR.backL.x - 34} y={556} s={0.5} /><Randoseru x={CAR.backR.x + 38} y={552} s={0.42} color={C.femaleTint} />
        </>} />
      </g>
      <rect x={1000} y={300} width={806} height={454} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1000} y={240}>冒頭の二人も、この時期</Label>
      <Label x={1000} y={810} color={C.ink2}>息子は中学2年、娘は小学5年</Label>
    </Svg>
  </AbsoluteFill>
);
export const MEAN: GLSeries[] = [
  { label: "夫", color: C.male, values: [3.41, 3.17, 3.26] },
  { label: "妻", color: C.female, values: [3.31, 2.86, 2.93] },
];
export const MEAN_FRAME = { x: 360, y: 250, width: 1000, height: 440, ticks: ["結婚0〜9年", "20〜29年", "40年以上"], domain: [1, 4] as [number, number], yTicks: [1, 2, 3, 4], yFormat: (v: number) => `${v}点` };
export const S32: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>満足の度合い（4点満点の平均）：夫も下がる</Heading>
    <Svg>
      <GenderLines {...MEAN_FRAME} series={[MEAN[0]]} callouts={[{ s: 0, i: 1, text: "−0.24", dy: -20 }]} />
      <Label x={1460} y={420} color={C.ink2}>底は、結婚して</Label>
      <Label x={1460} y={480} color={C.ink2}>20年を過ぎるころ</Label>
    </Svg>
    <SourceNote text="稲葉昭英（2021）NFRJ18 第2次報告書（初婚を続けている夫婦、2,137人）。図の線から読み取り。間の年数は省いている" />
  </AbsoluteFill>
);
export const S33: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>妻の下がり方は大きい。でも差ははっきりしない</Heading>
    <Svg>
      <GenderLines {...MEAN_FRAME} series={MEAN} callouts={[{ s: 0, i: 1, text: "−0.24", dy: -20 }, { s: 1, i: 1, text: "−0.45", above: false }]} />
      {/* 20〜29年の2点のあいだの括弧（どの差の話か） */}
      <path d="M906 384 h18 V408 h-18" fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="6 6" />
      <Label x={1460} y={420} color={C.ink2}>夫と妻の差は、</Label>
      <Label x={1460} y={480} color={C.ink2}>この人数では</Label>
      <Label x={1460} y={540} color={C.ink2}>はっきりしない</Label>
    </Svg>
    <SourceNote text="稲葉昭英（2021）NFRJ18 第2次報告書（初婚を続けている夫婦、2,137人）。男女の差は有意でない" />
  </AbsoluteFill>
);
export const S34: React.FC = () => (
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
            <Figure kind="male" x={x + 230} y={560} size={3} dim />
            <Label x={x + 390} y={520} anchor="middle" size="hero">{sym}</Label>
            <Figure kind="female" x={x + 550} y={560} size={3} dim={i === 0} />
            <Label x={x + 230} y={620} anchor="middle" color={C.male}>夫</Label>
            <Label x={x + 550} y={620} anchor="middle" color={C.female}>妻</Label>
            <Label x={x + 390} y={700} anchor="middle">{d}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text="Jackson, Miller, Oka, Henry（2014）Journal of Marriage and Family 76（要旨）。欧米が中心。淡い色＝満足、濃い色＝満足していない" />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <MidCheck text="冷めるのは二人とも。不満は妻に多く出る" />
    <Svg>
      <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} />
      <MiniBalance x={1500} y={470} s={0.16} />
    </Svg>
    <Card x={760} y={500} w={620}>何が妻の満足を下げている？<br />やはり、家事？</Card>
    <SourceNote text={SRC.nfrj} />
  </AbsoluteFill>
);

// ================= 第3章 =================
export const S36: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>天秤に、まず家事・育児・買い物</Heading>
    <SubHead>共働き・末っ子10〜14歳（冒頭の二人と同じ時期）</SubHead>
    <Svg><BalanceAt left={[chores("husband")]} right={[chores("wife")]} /></Svg>
    <SourceNote text={SRC.time} />
  </AbsoluteFill>
);
export const S37: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>夫が受け持つ家事の割合</Heading>
    <Svg>
      <PercentColumns x={260} y={240} width={1200} height={420} lower={C.male} upper={C.female} colW={190} valuePos="aboveLower"
        cols={[{ label: "6歳未満", value: 22.6, big: true }, { label: "6〜9歳", value: 18.1 }, { label: "10〜14歳", value: 12.9, big: true }, { label: "15〜17歳", value: 10.4 }]}
        upperName="妻" lowerName="夫" />
      <Label x={1440} y={708} color={C.ink2}>末っ子の年齢</Label>
      <Label x={1560} y={460}>4分の1近く</Label>
      <Label x={1560} y={520}>→ 8分の1ほど</Label>
      <Label x={1430} y={214} color={C.ink2}>100%</Label>
    </Svg>
    <SourceNote text={`${SRC.time}。表の値から計算`} />
  </AbsoluteFill>
);
export const S38: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>相手の家事に満足している人（40代半ば）</Heading>
    <Svg>
      <PercentColumns x={240} y={260} width={420} height={420} lower={C.maleTint} upper={C.male} colW={200} valuePos="inside"
        cols={[{ label: "夫 → 妻の家事", value: 83.0, big: true, sub: "8割を超える", text: "83.0%" }]} />
      <PercentColumns x={760} y={260} width={420} height={420} lower={C.femaleTint} upper={C.female} colW={200} valuePos="inside"
        cols={[{ label: "妻 → 夫の家事", value: 65.7, big: true, sub: "3人に2人ほど" }]} upperName="満足でない" lowerName="満足" />
    </Svg>
    <Card x={1420} y={460} w={400}>ここまでなら、<br />やはり家事か</Card>
    <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
  </AbsoluteFill>
);
export const S39: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>でも、まだのせていないもの：仕事と通勤</Heading>
    <SubHead>夫のおもり：朝の電車・会議・残業・帰りの電車</SubHead>
    <Svg><BalanceAt left={[chores("husband"), veiled("husband")]} right={[chores("wife")]} tilt={10} /></Svg>
    <SourceNote text={`${SRC.time}。仕事のおもりの重さは答え合わせで`} />
  </AbsoluteFill>
);
export const S40: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>どこで止まるかは、答え合わせで</Heading>
    <Svg><BalanceAt left={[chores("husband"), veiled("husband")]} right={[chores("wife"), veiled("wife")]} tilt={4} from={10} moving /></Svg>
    <SourceNote text={`${SRC.time}。止まる位置は答え合わせで`} />
  </AbsoluteFill>
);
export const Cell: React.FC<{ x: number; y: number; on?: boolean; text: string; hidden?: boolean }> = ({ x, y, on, text, hidden }) => (
  <g>
    <rect x={x} y={y} width={440} height={120} rx={R.md} fill={hidden ? "none" : on ? C.ink : C.paper2} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={hidden ? "12 10" : undefined} />
    <Label x={x + 220} y={y + (hidden ? 84 : 74)} anchor="middle" size={hidden ? "value" : "label"} color={hidden ? C.ink2 : on ? C.white : C.ink} weight={on ? 900 : 700}>{hidden ? "？" : text}</Label>
  </g>
);
export const Table3: React.FC<{ showSupport: boolean }> = ({ showSupport }) => (
  <Svg>
    <Label x={760} y={290} anchor="middle" color={C.male} weight={900}>夫（277人）</Label>
    <Label x={1260} y={290} anchor="middle" color={C.female} weight={900}>妻（322人）</Label>
    <Label x={120} y={374}>夫が受け持つ</Label>
    <Label x={120} y={434}>家事の割合</Label>
    <Cell x={540} y={330} text="はっきりしない" />
    <Cell x={1040} y={330} text="はっきりしない" />
    <Label x={120} y={534}>相手からの</Label>
    <Label x={120} y={594}>心の支え</Label>
    <Cell x={540} y={490} on text="はっきり結びつく" hidden={!showSupport} />
    <Cell x={1040} y={490} on text="はっきり結びつく" hidden={!showSupport} />
  </Svg>
);
export const S41: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>満足と一緒に動くのは？</Heading>
    <SubHead>年齢・収入などをそろえて比べた（28〜47歳の結婚している人）</SubHead>
    <Table3 showSupport={false} />
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。相関" />
  </AbsoluteFill>
);
export const SUPPORTS: [string, React.FC<{ x: number; y: number; s?: number }>][] = [["悩みを聞く", Ear], ["努力を認める", Hanamaru], ["助言をくれる", Bulb]];
export const S42: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>はっきり結びついていたのは、心の支え</Heading>
    <Table3 showSupport />
    <Svg>
      {SUPPORTS.map(([t, Icon], i) => {
        const x = 540 + i * 320;
        return (
          <g key={t}>
            <rect x={x} y={640} width={300} height={170} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <Icon x={x + 150} y={690} s={0.8} />
            <Label x={x + 150} y={784} anchor="middle">{t}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。妻を調べた末盛慶（1999）も同じ向き。相関" />
  </AbsoluteFill>
);
export const S43: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>同じ量でも、期待との差で受け取り方が変わる</Heading>
    <Svg>
      {/* 左：期待（点線）が棒の上端より上＝期待より少ない。右：期待が棒の上端と同じ＝期待どおり */}
      {[["期待より少ない", 300], ["期待どおり", 420]].map(([t, ey], i) => {
        const x = 420 + i * 640, e = ey as number;
        return (
          <g key={i}>
            <rect data-qa="mark" data-qa-label="夫の家事" x={x} y={420} width={220} height={330} rx={R.sm} fill={C.maleTint} stroke={C.male} strokeWidth={LINE.thin} />
            <line x1={x - 60} x2={x + 280} y1={e} y2={e} stroke={C.female} strokeWidth={LINE.base} strokeDasharray="16 12" />
            <Label x={x + 300} y={e + 14} color={C.female}>妻の期待</Label>
            {i === 0 && <g><path d={`M${x + 250} ${e + 14} V${406}`} stroke={C.female} strokeWidth={LINE.thin} /><path d={`M${x + 240} ${e + 24} L${x + 250} ${e + 8} L${x + 260} ${e + 24} M${x + 240} ${396} L${x + 250} ${412} L${x + 260} ${396}`} fill="none" stroke={C.female} strokeWidth={LINE.thin} /></g>}
            <text data-qa-allow="mark" x={x + 110} y={600} textAnchor="middle" style={font("label")}>夫の家事</text>
            <Label x={x + 110} y={810} anchor="middle" weight={900}>{t}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text="李基平（2008）家族社会学研究 20(1)。1994年の妻886人。図は説明のための例（量は同じに描いた）" />
  </AbsoluteFill>
);
export const S44: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>期待との差を入れると、家事の量との結びつきは</Heading>
    <Svg>
      {[["常勤の妻", ".092", ".049", "はっきりしない"], ["自営の妻", ".082", ".030", "はっきりしない"], ["パートの妻", ".090", ".047", "弱まる"], ["専業主婦", ".062", ".038", "弱まる"]].map(([t, a, b, d], i) => {
        const y = 260 + i * 130;
        const out = i < 2;
        return (
          <g key={t}>
            <Label x={160} y={y + 44} weight={900}>{t}</Label>
            <rect data-qa="mark" data-qa-label="前の係数" x={460} y={y} width={Number(a) * 5000} height={28} fill={C.rest} />
            <rect data-qa="mark" data-qa-label="あとの係数" x={460} y={y + 34} width={Number(b) * 5000} height={28} fill={C.ink} />
            <Label x={1000} y={y + 44} color={out ? C.ink : C.ink2} weight={out ? 900 : 700}>{d}（{a} → {b}）</Label>
          </g>
        );
      })}
      <Label x={160} y={800} color={C.ink2}>灰＝家事の量だけのとき、墨＝期待との差を入れたあと（係数）</Label>
    </Svg>
    <SourceNote text="李基平（2008）家族社会学研究 20(1)。1994年の妻886人。相関" />
  </AbsoluteFill>
);
export const S45: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>支えは、量より「合っていたか」</Heading>
    <SubHead>海外の小さな日記研究（同居カップル67組）</SubHead>
    <Svg>
      {[0, 1].map((i) => {
        const x = 120 + i * 860;
        return (
          <g key={i}>
            <rect x={x} y={250} width={800} height={560} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <Cat kind="other" x={x + 220} y={760} size={3.4} face={i === 0 ? "sad" : "smile"} turn={0.5} label="話す人" seed={i} />
            <Cat kind="other" x={x + 560} y={760} size={3.4} turn={-0.5} label="聞く人" seed={i + 4} />
            <Label x={x + 400} y={320} anchor="middle" weight={900}>{i === 0 ? "合っていない支え" : "合っている支え"}</Label>
          </g>
        );
      })}
      <Bubble x={190} y={420} text="聞いてほしい" tail={[330, 560]} role="label" />
      <Bubble x={560} y={500} text="こうすれば？" tail={[660, 590]} role="label" />
      <Bubble x={1050} y={420} text="聞いてほしい" tail={[1190, 560]} role="label" />
      <Bubble x={1400} y={500} text="そうだったんだ" tail={[1510, 590]} role="label" />
    </Svg>
    <SourceNote text="Maisel & Gable（2009）Psychological Science。米国の同居カップル67組の日記（要旨）" />
  </AbsoluteFill>
);
export const SUP_WIFE = [98, 88, 85, 78, 72, 76, 78, 76, 72];
export const SUP_HUSBAND = [90, 90, 89, 86, 85, 91, 83, 87, 85];
export const S46: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>「配偶者は悩みを聞いてくれる」と答えた人</Heading>
    <Svg>
      <AxisTitle text="あてはまると答えた割合" />
      {/* 第1章の妻の満足の線を、同じ枠に細い点線で重ねる（同じ形かを見比べる） */}
      <path d="M1180 200 H1250" stroke={C.femaleTint} strokeWidth={LINE.thin} strokeDasharray="14 12" />
      <Label x={1264} y={214} color={C.ink2}>第1章：妻の満足</Label>
      <GenderLines {...CH} ticks={AGE_TICKS} endLabels
        series={[{ label: "", color: C.femaleTint, values: SAT_WIFE, xs: AGE_XS, thin: true, dashed: true },
          { label: "夫", color: C.male, values: SUP_HUSBAND, xs: AGE_XS }, { label: "妻", color: C.female, values: SUP_WIFE, xs: AGE_XS }]}
        callouts={[{ s: 2, i: 0, text: "約98%", above: false, dx: -40, dy: -48, anchor: "end" }, { s: 2, i: 4, text: "約72%", above: false }]} />
    </Svg>
    <SourceNote text={SRC.nfrjSupport} />
  </AbsoluteFill>
);
export const S47: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>どちらが先かは、分からない</Heading>
    <Svg>
      <rect x={260} y={300} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={520} y={390} anchor="middle" weight={900}>心の支えを感じる</Label>
      <rect x={1140} y={300} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1400} y={390} anchor="middle" weight={900}>満足している</Label>
      <path d="M800 330 Q960 250 1120 330" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M1096 306 L1122 332 L1088 340" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M1120 420 Q960 500 800 420" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <path d="M824 444 L798 418 L832 410" fill="none" stroke={C.ink} strokeWidth={LINE.base} />
      <Label x={960} y={250} anchor="middle" size="value">？</Label>
      <Label x={960} y={560} anchor="middle" size="value">？</Label>
    </Svg>
  </AbsoluteFill>
);

// ================= 答え合わせ =================
export const S48: React.FC = () => (
  <AbsoluteFill>
    <Heading>天秤が止まる：差は 2分</Heading>
    <Svg>
      <BalanceAt left={[chores("husband"), work("husband", "仕事・通勤\n8時間27分")]} right={[chores("wife"), work("wife", "仕事・通勤\n4時間45分")]} />
      <Label x={BAL.x - 560} y={BAL.y + 490} anchor="middle" size="value" color={C.male}>9時間6分</Label>
      <Label x={BAL.x + 560} y={BAL.y + 490} anchor="middle" size="value" color={C.female}>9時間8分</Label>
    </Svg>
    <div style={{ position: "absolute", right: 96, top: 56, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 14, background: C.ink, borderRadius: R.md, padding: "8px 22px", ...font("label", C.white) }}>
      予想の答え B ほぼ同じ
    </div>
    <SourceNote text={`${SRC.time}。末っ子10〜14歳`} />
  </AbsoluteFill>
);
export const hm = (m: number): [string, string] => [`${Math.floor(m / 60)}時間`, `${m % 60}分`];
export const S49: React.FC = () => {
  const rows = [{ label: "6歳未満", h: 608, w: 634 }, { label: "6〜9歳", h: 552, w: 573 }, { label: "10〜14歳", h: 546, w: 548 }, { label: "15〜17歳", h: 529, w: 570 }];
  const base = 720, k = 380 / 700, bw = 124;
  return (
    <AbsoluteFill>
      <Heading>ほかの時期も：差は1時間に届かない</Heading>
      <SubHead>どちらかが楽をしている、という数字ではない</SubHead>
      <Svg>
        {rows.map((r, i) => {
          const cx = 200 + 380 * i + 190;
          return (
            <g key={r.label}>
              {([[r.h, C.male, -bw - 12, "夫"], [r.w, C.female, 12, "妻"]] as const).map(([v, c, dx, n]) => {
                const h = v * k, [a, b] = hm(v);
                return (
                  <g key={n}>
                    <rect data-qa="mark" data-qa-label={`${n}：${r.label}`} x={cx + dx} y={base - h} width={bw} height={h} rx={R.sm / 2} fill={c} />
                    <Label x={cx + dx + bw / 2} y={base - h - 76} anchor="middle">{a}</Label>
                    <Label x={cx + dx + bw / 2} y={base - h - 16} anchor="middle">{b}</Label>
                    <text data-qa-allow="mark" x={cx + dx + bw / 2} y={base - 24} textAnchor="middle" style={font("label", C.white)}>{n}</text>
                  </g>
                );
              })}
              <Label x={cx} y={756} anchor="middle">{r.label}</Label>
              <Label x={cx} y={814} anchor="middle" weight={900}>{`差 ${r.w - r.h}分`}</Label>
            </g>
          );
        })}
        <line x1={160} x2={1760} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      </Svg>
      <SourceNote text={`${SRC.time}。家事関連＋仕事・通勤（縦軸は0から）`} />
    </AbsoluteFill>
  );
};
export const S50: React.FC = () => (
  <AbsoluteFill>
    <Heading>時間の長さでは、説明できない</Heading>
    <SubHead>夫が受け持つ家事の割合でも、はっきりした差は出ない（第3章。ほかの条件をそろえたうえで）</SubHead>
    <Svg>
      <DayStack {...DAY} links={[[0, 1], [2, 3]]} cols={[
        dayCol("husband", "pre", "夫", "上がる前"), dayCol("husband", "post", "夫", "小学生"),
        dayCol("wife", "pre", "妻", "上がる前"), dayCol("wife", "post", "妻", "小学生", ["chores", "work"])]} />
    </Svg>
    <SourceNote text={SRC.time} />
  </AbsoluteFill>
);
export const S51: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="夫婦は、2人いっしょに冷めていく" mark="△"
      reason={["満足の点数の平均は、\n夫も妻も下がる", "満足していない人は、\n30代後半から妻に多い", "家事＋仕事の時間は、\nほぼ同じ（差2分）"]} />
  </AbsoluteFill>
);
export const S52: React.FC = () => (
  <AbsoluteFill>
    <Heading>一緒に動くもの1：本人の年齢ではなく、末っ子の年齢</Heading>
    <Svg>
      <PercentColumns x={140} y={250} width={1500} height={400} lower={C.femaleTint} upper={C.female} valuePos="inside" colW={190}
        cols={[{ label: "0〜5歳", value: 84.8 }, { label: "6〜11歳", value: 72.8 }, { label: "12〜17歳", value: 73.8 },
          { label: "18歳〜同居", value: 72.0, text: "72.0%" }, { label: "家を出た", value: 80.1, big: true }]}
        groups={[{ from: 1, to: 3, label: "いちばん低い：小学校に上がってから家を出るまで" }]} upperName="満足でない" lowerName="満足" />
      <Label x={140} y={226} color={C.ink2}>末っ子の年齢・暮らし方</Label>
    </Svg>
    <SourceNote text="国立社会保障・人口問題研究所『第7回全国家庭動向調査』2022年（妻が回答）。集計表から計算。横断データ" />
  </AbsoluteFill>
);
/** ベンチの夫婦（44 の2カット） */
export const BenchCats: React.FC<{ look: boolean }> = ({ look }) => (
  <g>
    <rect x={180} y={300} width={300} height={260} fill={C.wall} stroke={C.ink2} strokeWidth={LINE.thin} />
    <path d="M160 300 L330 210 L500 300" fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} strokeLinejoin="round" />
    <rect x={220} y={350} width={90} height={80} fill={C.night} />
    <rect x={350} y={350} width={90} height={80} fill={C.white} stroke={C.ink2} strokeWidth={LINE.hair} />
    <Label x={330} y={600} anchor="middle" color={C.ink2}>子ども部屋が空いた</Label>
    <Bench x={720} y={800} size={4.2} w={110} />
    <Cat kind="male" x={620} y={762} size={4} pose="sit" face={look ? "smile" : "normal"} turn={look ? 0.6 : 0} label="夫" />
    <Cat kind="female" x={840} y={762} size={4} pose="sit" face={look ? "smile" : "normal"} turn={look ? -0.6 : 0} label="妻" seed={2} />
  </g>
);
export const S53: React.FC = () => (
  <AbsoluteFill>
    <Heading>子が家を出たあと（米国・女性を18年追跡）</Heading>
    <Svg>
      <BenchCats look={false} />
      <Clock x={1400} y={400} r={110} hour={4} minute={40} />
    </Svg>
    <Card x={1060} y={560} w={760}>子どもが家を出ると、<br />結婚の満足は上がっていた</Card>
    <SourceNote text="Gorchoff, John, Helson（2008）Psychological Science 19(11)。中年の女性（要旨）" />
  </AbsoluteFill>
);
export const S54: React.FC = () => (
  <AbsoluteFill>
    <Heading>子が家を出たあと（米国・女性を18年追跡）</Heading>
    <Svg><BenchCats look /></Svg>
    <Card x={1060} y={260} w={760} bg={C.paper2}>一緒に過ごす時間が増えたから<br />→ ではなかった</Card>
    <Card x={1060} y={480} w={760}>一緒の時間を楽しめるようになって<br />→ 結婚の満足が上がった</Card>
    <SourceNote text="Gorchoff, John, Helson（2008）Psychological Science 19(11)。中年の女性（要旨）" />
  </AbsoluteFill>
);
export const S55: React.FC = () => (
  <AbsoluteFill>
    <Heading>満足と一緒に動くもの</Heading>
    <Card x={140} y={240} w={800} h={500}><b>1　末っ子の年齢</b><br />いちばん低いのは、末っ子が小学校に<br />上がってから、家を出るまで<br /><span style={{ color: C.ink2 }}>家を出たあとに戻るかは、<br />国や調査で分かれる</span></Card>
    <Card x={980} y={240} w={800} h={500}><b>2　心の支えがあると感じるか</b><br />悩みを聞く・努力を認める・助言<br /><span style={{ color: C.ink2 }}>（第3章）</span></Card>
    <Svg>
      <Bottle x={250} y={650} s={0.9} /><Randoseru x={400} y={650} s={0.9} /><SchoolBag x={550} y={650} s={0.9} /><House x={700} y={650} s={0.9} />
      <Ear x={1100} y={650} s={0.9} /><Hanamaru x={1260} y={650} s={0.9} /><Bulb x={1420} y={650} s={0.9} />
    </Svg>
    <SourceNote text="第7回全国家庭動向調査（2022）・稲葉（2011）・永瀬（2021）" />
  </AbsoluteFill>
);

// ================= 教訓 =================
export const S56: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="none" time={1}>
      <Navi x={96} y={330} lines={["到着まで", "あと5分"]} from={{ x: CAR.navi.x - 70, y: CAR.navi.y }} />
    </CarScene>
  </AbsoluteFill>
);
export const S57: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <g transform="translate(40,150) scale(0.6)"><BalanceAt left={[chores("husband", false), work("husband")]} right={[chores("wife", false), work("wife")]} /></g>
      <GenderLines x={1240} y={260} width={500} height={400} ticks={["", "30", "", "", "", "50", "", "", "", "70", ""]} series={satSeries} yTicks={[0, 100]} />
      <Label x={616} y={800} anchor="middle">天秤は、ほぼつり合う</Label>
      <Label x={1490} y={800} anchor="middle">満足の線は、二本に分かれる</Label>
    </Svg>
    <SourceNote text="総務省『社会生活基本調査』2021年（末っ子10〜14歳）・NFRJ18（2019年）" />
  </AbsoluteFill>
);
export const Stopwatch: React.FC<{ x: number; y: number; icon?: React.ReactNode }> = ({ x, y, icon }) => (
  <g data-qa="prop" data-qa-label="時計">
    <circle cx={x} cy={y} r={90} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
    <rect x={x - 16} y={y - 124} width={32} height={30} fill={C.ink} />
    <line x1={x} y1={y} x2={x + 40} y2={y - 50} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
    {icon}
  </g>
);
export const Coin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g data-qa="prop" data-qa-label="硬貨"><circle cx={x} cy={y} r={90} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.base} /><text x={x} y={y + 30} textAnchor="middle" style={font("value")}>円</text></g>
);
export const S58: React.FC = () => (
  <AbsoluteFill>
    <Heading>私たちは、数えやすいものから数える</Heading>
    <Svg>
      <Stopwatch x={420} y={480} icon={<House x={400} y={510} s={0.6} />} />
      <Stopwatch x={960} y={480} icon={<Briefcase x={940} y={512} s={0.6} />} />
      <Coin x={1500} y={480} />
      {["家事の分数", "働いた時間", "年収"].map((t, i) => <Label key={t} x={420 + i * 540} y={680} anchor="middle" weight={900}>{t}</Label>)}
      <Label x={960} y={800} anchor="middle" color={C.ink2}>比べやすく、言い返しやすい</Label>
    </Svg>
  </AbsoluteFill>
);
export const S59: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Bubble x={200} y={470} w={700} text="俺のほうが、長く働いている" tail={[480, 610]} role="label" />
      <Bubble x={1124} y={470} w={700} text="わたしのほうが、家のことをしている" tail={[1440, 610]} role="label" />
      <Cat kind="male" x={480} y={820} size={4} look={[0, -0.6]} label="夫" />
      <Cat kind="female" x={1440} y={820} size={4} look={[0, -0.6]} label="妻" seed={2} />
      <Stopwatch x={960} y={600} />
      <Label x={960} y={790} anchor="middle" color={C.ink2}>どちらも、時計で測れば確かめられる</Label>
    </Svg>
  </AbsoluteFill>
);
export const S60: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="none" time={1}>
      <Navi x={96} y={330} lines={["到着まで", "あと5分"]} from={{ x: CAR.navi.x - 70, y: CAR.navi.y }} />
      <Thought x={1190} y={292} w={150} text="うん" toward={[1190, 408]} dashed />
    </CarScene>
  </AbsoluteFill>
);
export const S61: React.FC = () => (
  <AbsoluteFill>
    <CarScene signal="red" time={1} husbandTurn={0.8} wifeTurn={-0.6} wifeFace="smile" inward={30}>
      <Bubble x={560} y={290} text="今日、疲れた？" tail={[735, 420]} role="sub" />
      <Bubble x={1030} y={290} text="そっちこそ" tail={[1110, 420]} role="sub" />
    </CarScene>
  </AbsoluteFill>
);
export const S62: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <BalanceAt left={[chores("husband", false), work("husband")]} right={[chores("wife", false), work("wife")]} names={false} />
      {/* 量り忘れていたもの：夫の色と妻の色の点線の分銅（中は塗らない） */}
      <LooseWeight x={BAL.x - 560} y={846} h={100} color={C.male} label="夫" />
      <LooseWeight x={BAL.x + 560} y={846} h={100} color={C.female} label="妻" />
    </Svg>
  </AbsoluteFill>
);
export const S63: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

export const panels: Panel[] = [
  { key: "01", title: "冒頭：交差点の赤信号（引き）", C: S01, sec: 9.4, lines: "土曜の夕方です。", move: "夕方の空から車の正面へ寄る（日は半分ビルに沈んでいる）。信号が赤に変わる（光がふくらむ）。後ろの席で息子（ボール）と娘（ランドセル）が眠る（寝息で肩が上下）。名札は1.5秒だけ" },
  { key: "02", title: "冒頭：夫に寄る・来週の段取り", C: S02, sec: 8.2, lines: "ハンドルを握った夫が", move: "カメラが運転席の夫に寄る（1.7倍）。夫は前を向いたまま（黒目だけ少し上の信号へ）。吹き出しが頭のすぐ上に出る" },
  { key: "03", title: "冒頭：妻に寄る・「うん」", C: S03, sec: 4.7, lines: "助手席の妻は", move: "カメラが助手席へ横に移る。妻は顔を窓（画面の右）へ向けたまま。窓の外の景色が少し横に流れる。小さな吹き出し「うん」" },
  { key: "04", title: "冒頭：カーナビ・あと20分・共働き15年", C: S04, sec: 8.6, lines: "カーナビが、到着まであと二十分", move: "カメラがダッシュボードのカーナビへ寄り、大きな画面がせり出す（点線でつなぐ）。「共働き 15年」の札" },
  { key: "05", title: "冒頭：引き・うちはうまくいっている", C: S05, sec: 9.7, lines: "けんかをしたわけではありません。", move: "引きに戻る。夫の頭の上に考え中の吹き出し（言っていない・思っているだけ）。最後に信号が赤→青、車がわずかに前へ。次は車が右へ走り去り、道路の白線が100人の列の並びに変わる" },
  { key: "06", title: "冒頭：満足していない妻 15人に1人→4人に1人近く", C: S06, sec: 11.4, lines: "全国で聞くと", move: "100人の妻が2列できる。上の列で7人が1人ずつ濃くなり、少し間を置いて下の列の23人が点く（増えた、を時間差で）。数字は値の文字だけ数え上げる" },
  { key: "07", title: "冒頭：では、夫は？", C: S07, sec: 12.3, lines: "もちろん、四十代の妻でも", move: "上の列の淡い77人に「満足」が付く。下の列が夫の色の点線の枠に変わり、大きな「？」（この枠は19で夫100人が入って埋まる）" },
  { key: "08", title: "今日の答え合わせ", C: S08, sec: 7.2, lines: "今日の答え合わせは", move: "点線の枠を左へ払ってカード。ゴサが考え中で出る" },
  { key: "09", title: "予想タイム：条件", C: S09, sec: 17.3, lines: "まず、ひとつ予想して", move: "夫（左）と妻（右）の猫が立ち、頭の上を見上げる。同じ形の点線の札（家事・育児＋仕事・通勤）が横に並ぶ（量は表さない）。真ん中に「足すと？」" },
  { key: "10", title: "予想タイム：4択", C: S10, sec: 14.7, lines: "Aは、夫のほうが一時間以上長い", move: "選択肢が1つずつ。3秒の輪。答えは出さない（答え合わせで）" },
  { key: "11", title: "今日の順番", C: S11, sec: 16.3, lines: "今日は、三つの順に", move: "3枚の札が左から並ぶ（線・柱・天秤の絵）。最後の3秒で1枚目の線の絵が拡大して第1章の扉へ" },
  { key: "12", title: "第1章：3,000人の調査と4つの答え・色の約束", C: S12, sec: 22.0, lines: "全国から無作為に選ばれた", move: "第1章の扉 → 4枚の答えの札。左の2枚に括弧「満足として数える」。札の下の色の見本で「淡い＝満足、濃い＝満足していない」を一度だけ教える。最後に「満足」の2枚が1つになり、次のグラフの縦軸の上半分へ流れ込む" },
  { key: "13", title: "第1章：30歳前後は二本が重なる", C: S13, sec: 14.9, lines: "満足と答えた人の割合を", move: "06の30歳前後の妻100人が呼び戻され、軸の30歳の位置で100%の柱に積まれて、満足の境目が点になる（群衆→点）。続けて夫100人でも同じことをして、同じ高さに落ちる。夫は太い輪、妻は中の点（重なりが見える）" },
  { key: "14", title: "第1章：妻の線が下がる", C: S14, sec: 13.8, lines: "ところが三十代の後半から", move: "二本の線が左から右へ同じ速さで伸びる。35歳を過ぎて妻の線だけ大きく下がる。45歳に 87.2%（夫）・76.9%（妻）" },
  { key: "15", title: "第1章：あなたの年ごろ（自分に当てはめる場面）", C: S15, sec: 11.7, lines: "30代の後半から40代なら", move: "カメラが35〜45歳の帯へ少し寄る。帯が敷かれ、点線の「あなた」の目印が帯の中を左右に1往復。3秒止める" },
  { key: "16", title: "第1章：別の調査でも同じ形", C: S16, sec: 8.8, lines: "妻だけに聞いた、四千人を超える", move: "カメラが引いて全体へ。墨の灰の輪（妻だけの別の調査。つながない）が5つ落ちてくる。「上の年代」の帯が右に敷かれる" },
  { key: "18", title: "第1章：それでも妻の線は4人に3人", C: S18, sec: 5.8, lines: "それでも妻の線は", move: "グラフに戻り、妻の線の上の年代に「4人に3人ほど」" },
  { key: "19", title: "第1章：百組の妻と夫", C: S19, sec: 16.8, lines: "では、一つの家の中では", move: "グラフの線が人に分かれて、妻100人・夫100人の2列に並び直す（夫の列は07の点線の枠に入って埋まる）。満足していない妻23人・夫13人が濃くなり、右に「差10人」の括弧" },
  { key: "20", title: "第1章：組にすると10組あまる（シミュレーション）", C: S20, sec: 11.3, lines: "満足していない夫13人が", move: "方眼の地。夫13人が濃い妻の隣へ歩いて13組（4秒）。残った濃い妻10人の隣へ、淡い夫が歩いてくる（4秒）。10組の床に墨のふち（3秒）。77組は下で一斉に組む" },
  { key: "21", title: "第1章：十組に一組の家", C: S21, sec: 14.9, lines: "だから少なくとも十組に一組は", move: "20の10組のうち1組に寄り、画面いっぱいでハードカット（位置と色を合わせる。人型を猫に変身させない）。家の中、湯のみ2つのテーブルをはさんで夫婦。夫の頭の上に考え中の吹き出し。妻は黒目を下・外へ（責めない・考えている）" },
  { key: "22", title: "第1章：理由は家事？（先回り）", C: S22, sec: 13.9, lines: "ここまで聞くと", move: "夫（左）・妻（右）の頭の上に、同じ大きさの考え中の吹き出しが1つずつ（どちらの言い分も同じ重さ）。猫は自分の吹き出しを見上げる" },
  { key: "23", title: "第1章：どの時期？", C: S23, sec: 11.3, lines: "その答えは、第3章で", move: "二つの吹き出しが分銅の形に縮んで、右上の小さな天秤へ吸い込まれる（第3章の予告）。末っ子の年齢の線（1年75px）が左から引かれ、哺乳びん・ランドセル・学生かばんが置かれる。「？」が線の上を左右に動き、学校の時期の上で止まる" },
  { key: "25", title: "第2章：末っ子の年齢別（答えを先に。章の中のクイズはやめた）", C: S25, sec: 20.0, lines: "妻の満足度がいちばん下がるのは", move: "第2章の扉 → 100%の柱が6本立つ（18歳〜同居も出す）。上（満足でない）が濃く、学校の時期の2本で濃い所が厚くなる（答えの数字のばね）（2018年の線は第7稿で声から外したので出さない）" },
  { key: "26", title: "第2章：一日の柱（上がる前）・凡例", C: S26, sec: 15.0, lines: "なぜ、手がかかる時期より", move: "25の6〜11歳の柱が横へ倒れて画面の外へ。夫と妻の一日の柱（高さ＝分）が立つ。右に塗りの凡例（家事＝塗り・育児＝水玉・仕事＝斜線。色はその人の色）。凡例はここで一度だけ" },
  { key: "27", title: "第2章：小学校に上がると育児が減る", C: S27, sec: 10.4, lines: "小学校に上がると、育児の時間は", move: "「小学生」の柱が右に立ち、帯でつながる。育児（水玉）の段が二人とも縮み、柱が1時間ほど低くなる" },
  { key: "28", title: "第2章：中身の入れ替わり", C: S28, sec: 11.3, lines: "変わるのは、長さより中身", move: "妻の小学生の柱で、家事と仕事の段が太枠になり＋47分・＋56分。夫の家事の段は細いまま（46分、引き出し線）。夫の仕事の段も同じ物差しでそのまま見せる" },
  { key: "29", title: "第2章：一緒に → 一人で（猫）", C: S29, sec: 9.5, lines: "その家事を、夫はほとんど受け持っていません。", move: "左：上がる前、夫婦の猫が並んで末っ子の世話。右：小学生になると、夫は鞄を持って外へ、妻は家で一人。左が先、1秒おいて右" },
  { key: "31", title: "第2章：仮説・冒頭の二人もこの時期", C: S31, sec: 14.1, lines: "夫婦で一緒にやることが減り", move: "「仮説」の小札 → 札が1行ずつ。右に冒頭の車が小さく戻る（後ろの席の息子のボール・娘のランドセルで、同じ子と分かる）" },
  { key: "32", title: "第2章：夫も下がる（満足の点数）", C: S32, sec: 18.7, lines: "では、夫は下がっていないのでしょうか", move: "縦軸1〜4点（尺度の端から端まで）。夫の線だけが先に描かれて下がり、20年過ぎに底（−0.24）" },
  { key: "33", title: "第2章：妻の下がり方は大きいが、差ははっきりしない", C: S33, sec: 9.2, lines: "下がり方は、妻のほうが大きく出ました。", move: "妻の線が重なって下がる（−0.45）。20〜29年の2点のあいだに点線の括弧、右に「差ははっきりしない」" },
  { key: "34", title: "第2章：海外のまとめ（10万人）", C: S34, sec: 24.4, lines: "海外には、二百を超える調査", move: "小さな四角226個が集まって1枚のカードになる（3秒）。カメラが左のカード（＝、二人とも淡い）→ 右のカード（妻だけ濃くなる）へ横に移る" },
  { key: "35", title: "第2章：ここまでの答え合わせ", C: S35, sec: 18.1, lines: "ここまでを、まとめます。", move: "第1章の二本の線が同じ枠で戻り、上に「ここまでの答え合わせ」。グラフの下の空きに問いの札。札の横の小さな天秤が下りてきて、28の天秤へ大きくなる" },
  { key: "36", title: "第3章：天秤に家事をのせる", C: S36, sec: 25.7, lines: "夫婦の一日を、天秤にのせて", move: "第3章の扉 → 天秤が下から立つ。左に夫、右に妻の名前。夫の家事の分銅（細い）が先に落ちて梁がほんの少し動き、次に妻の分銅でドンと妻の側へ傾く（答えの数字のばね）" },
  { key: "37", title: "第3章：夫が受け持つ家事の割合", C: S37, sec: 15.6, lines: "夫が受け持つ家事の割合は", move: "100%の柱が4本（夫の段・妻の段とも塗り）。夫の段が年齢とともに低くなる。22.6%と12.9%だけ大きく。右上に36の天秤を小さく残す" },
  { key: "38", title: "第3章：相手の家事への満足", C: S38, sec: 18.0, lines: "第1章の三千人の調査では", move: "夫の柱 → 妻の柱の順に立つ。右に「やはり家事か」の札。右上に天秤を小さく残す" },
  { key: "39", title: "第3章：夫の皿に仕事の分銅（中身は隠す）", C: S39, sec: 14.5, lines: "でも、この天秤には", move: "夫の皿に「？」の袋（仕事・通勤。中身と重さは隠す）がのる。朝の電車・会議・残業・帰りの電車の小さな札が袋に吸い込まれる。梁はまだ動かない" },
  { key: "40", title: "第3章：妻の皿にも・動きはじめる（考える場面）", C: S40, sec: 14.3, lines: "妻の皿にも、仕事の分銅をのせます。", move: "妻の皿にも同じ大きさの「？」の袋。梁がゆっくり戻りはじめ（前の角度を淡く残す）、夫の皿の外に下向きの矢印。カメラは針と目盛りに寄り、針が振れている途中で止める（一時停止の絵）。止まる位置は48まで見せない" },
  { key: "41", title: "第3章：家事の割合は結びつかない", C: S41, sec: 21.8, lines: "では、満足している人と", move: "36の夫の家事の分銅が表の1行目へ飛んで行き、灰の「はっきりしない」の箱になる。2行目は点線の「？」" },
  { key: "42", title: "第3章：心の支え（妻も夫も）", C: S42, sec: 19.3, lines: "はっきり結びついていたのは", move: "2行目が墨で塗られる（答えのばね）。下に3つの支えの札が絵（耳・花丸・電球）と一緒に1枚ずつ" },
  { key: "43", title: "第3章：期待との差（説明の図）", C: S43, sec: 20.2, lines: "なぜ家事の量より", move: "同じ高さの夫の家事の棒が2本（淡い青＋青の縁。満足の濃淡とは関係ない）。妻の期待の点線が、左は棒の上に止まり（差の両矢印）、右は上から棒の上端まで降りてきて重なる" },
  { key: "44", title: "第3章：常勤の妻では量の結びつきが消える", C: S44, sec: 11.4, lines: "とくに常勤で働く妻では", move: "4行の灰の棒の下に、期待との差を入れたあとの墨の棒（同じ太さ）が伸びて止まる。常勤・自営の2行に太字" },
  { key: "45", title: "第3章：支えは合っていたか", C: S45, sec: 23.7, lines: "海外の研究にも", move: "左右に同じ2匹（灰の猫＝男女を決めない。向き合う）。左の場面のあいだ、右の枠は灰色で伏せておく。左は「こうすれば？」で話す猫がしょんぼり → 右を開き、「そうだったんだ」でうなずいて笑う" },
  { key: "46", title: "第3章：悩みを聞いてくれる（同じ枠で重ねる）", C: S46, sec: 24.7, lines: "最初の三千人の調査に戻ります", move: "第1章と同じ枠。妻の線が約98%から約72%へ下がり、夫は8〜9割で平ら。最後に第1章の妻の満足の線が淡い点線で重なり、同じ形と分かる" },
  { key: "47", title: "第3章：どちらが先か", C: S47, sec: 22.7, lines: "ただし、どちらが先かは", move: "2つの札を結ぶ矢印の先が交互に伸び縮みする。「仮説」の札。最後に40の天秤（袋のまま・動いている途中）が戻って48へ" },
  { key: "48", title: "答え合わせ：天秤が止まる・差2分", C: S48, sec: 17.7, lines: "答え合わせです", move: "40の続き：袋が外れて仕事の分銅（斜線）の本当の高さが見え、針が残りを動いて真ん中で止まる。止まった瞬間に 9時間6分・9時間8分（答えのばね）。右上に予想の答え B。ゴサは出さない" },
  { key: "49", title: "答え合わせ：ほかの時期も1時間未満", C: S49, sec: 23.6, lines: "ほかの時期も見ておきます", move: "夫と妻の棒が4組並ぶ（縦軸0から）。値は「◯時間／◯分」の2行。下に差の分が1つずつ" },
  { key: "50", title: "答え合わせ：長さではなく中身", C: S50, sec: 10.4, lines: "家事と仕事を足した時間の長さでは", move: "第2章の一日の柱が同じ見た目で戻り、妻の家事と仕事の段に太枠" },
  { key: "51", title: "答え合わせ", C: S51, sec: 26.7, lines: "続いて、今日の説です", move: "判定のカード → 証拠が3つ（手で改行）→ 打撃でゴサ「ひげ、のびます。」（〇△×の札は出さない。2026-10-07）" },
  { key: "52", title: "答え合わせ：家族の時期", C: S52, sec: 20.9, lines: "満足と一緒に動くものも", move: "100%の柱が5本。谷の3本に括弧、最後の「家を出た」80.1%だけ大きく。右に第1章の妻の線（上の年代で戻らない）を小さく並べ、調査で分かれることを見せる" },
  { key: "53", title: "答え合わせ：子が家を出たあと①（米国）", C: S53, sec: 13.0, lines: "子どもが家を出たあとについては", move: "家の子ども部屋の窓が暗くなる。ベンチに猫の夫婦。時計の針が速く回る（時間が増えた？）" },
  { key: "54", title: "答え合わせ：子が家を出たあと②", C: S54, sec: 14.3, lines: "上がった理由は", move: "上の札（時間が増えたから）が灰色に沈む → 2匹が顔を見合わせて少し笑う → 下の札（楽しめるように）" },
  { key: "55", title: "答え合わせ：分けるもの2つ", C: S55, sec: 14.5, lines: "ただ、日本には", move: "2枚の札が同じ高さで並ぶ。1の札に時期の絵（哺乳びん・ランドセル・学生かばん・家）、2の札に支えの絵（耳・花丸・電球）" },
  { key: "56", title: "教訓：車に戻る・あと5分", C: S56, sec: 11.4, lines: "もう一度、土曜の夕方の車に", move: "冒頭と同じ構図を引きで。日はさらに沈み（上の端だけ）、空の帯が下へ広がり、ビルの窓に明かり。背景のビルが左へゆっくり流れる（走っている）。カーナビが20分→5分。妻はまだ窓の外" },
  { key: "57", title: "教訓：天秤はつり合う、線は二本", C: S57, sec: 8.9, lines: "彼の一日も、妻の一日も", move: "カーナビの画面に天秤と線が映り、それが画面いっぱいに。天秤は48の絵をそのまま縮めて左へ" },
  { key: "58", title: "教訓：数えやすいもの", C: S58, sec: 12.0, lines: "私たちは、数えやすいものから", move: "時計（家の絵）・時計（鞄の絵）・硬貨が1つずつ置かれ、それぞれの下で数字が数え上がって止まる（数えやすい、を動きで）" },
  { key: "59", title: "教訓：どちらも言える", C: S59, sec: 13.3, lines: "夫は、こう言えます", move: "夫の吹き出し → 妻の吹き出し（同じ高さ・同じ幅）。真ん中の時計の針が、夫の言葉で右へ、妻の言葉で左へ回り、どちらにも決まらない。どちらも怒った顔にしない" },
  { key: "60", title: "教訓：「うん」は数えられない", C: S60, sec: 15.0, lines: "でも、数えやすいものが", move: "カーナビの「5分」が「4分」に1回だけ変わる。妻の頭の上の点線の考え中の吹き出し「うん」が、ゆっくり上へ浮いて画面の上に小さく残る（62へ）" },
  { key: "61", title: "教訓：「今日、疲れた？」「そっちこそ」", C: S61, sec: 12.2, lines: "信号で止まったとき", move: "冒頭と同じ構図・同じ赤信号。夫が段取りのかわりに助手席へ顔を向ける →「今日、疲れた？」→ 間 → 妻が窓から顔を戻し、目を細めて少し笑う「そっちこそ」。2匹の距離が冒頭より少し近い" },
  { key: "62", title: "教訓：天秤はつり合っていた", C: S62, sec: 12.4, lines: "天秤は、つり合っていました。", move: "水平の天秤。60で浮いた点線の「うん」が降りてきて、点線の分銅2つ（夫の色・妻の色、中に「？」）に分かれ、それぞれの皿の下に置かれる（量り忘れていたのは、二人とも）。締めの一文で線が少し太くなり、引いていく" },
  { key: "63", title: "締めのひと言（毎回同じ）", C: S63, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];

export const storyboard: StoryboardDef = { id: "004-marriage-forty-dip", title: "40代、夫婦の満足は二本に分かれる（第2版）", panels };
export default storyboard;
