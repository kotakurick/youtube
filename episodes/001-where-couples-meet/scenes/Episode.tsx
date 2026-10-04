// 1本目「アプリで、結婚につながる出会いは増えたのか」の動画（台本は script.md の第6稿）。
// 部品は render/src/lib/、決まりは docs/brand.md。数字は sources.csv の値（細かい値は画面に、読み上げは丸め）。
// 場面の中は「区切り（Beat）」で10〜20秒ごとに絵を替える。区切りの時刻は読み上げの語（useNarration().find）に合わせる。
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, WALL_FREE } from "@lib/Backdrop";
import { BarChart } from "@lib/BarChart";
import { Bracket } from "@lib/Bracket";
import { Camera } from "@lib/Camera";
import { ChannelTag, MidCheck, SubscribeNudge, TodayCard } from "@lib/Cards";
import { ChapterCard, ChapterDots } from "@lib/Chapter";
import { EndScreen } from "@lib/EndScreen";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { HeroNumber } from "@lib/HeroNumber";
import { fromTiming, Timing, useNarration } from "@lib/Narration";
import { PairedBars } from "@lib/PairedBars";
import { Clock, Cup, Desk, Phone, Table, tableTop } from "@lib/Props";
import { Question } from "@lib/Question";
import { Quiz } from "@lib/Quiz";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { StackedTrend } from "@lib/StackedTrend";
import { Verdict } from "@lib/Verdict";
import { C, font, R, sp, Z } from "@lib/theme";
import type { EpisodeDef } from "@lib/Episode";
import timing from "../timing.json";

// ---------- 共通 ----------
const SRC = "出典：社人研「第17回出生動向基本調査」";
const SRC_EST = "推計：出生動向基本調査の割合×人口動態統計の初婚どうしの婚姻件数";
const CLAIM = "アプリで、結婚の出会いは増えた"; // 通説のカードは1行16字まで（読み上げは台本どおり）

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

/** 読み上げの語の始まり（見つからなければ代わりの時刻）。台本を直して語が消えても止まらないように */
const useCue = () => {
  const n = useNarration();
  const find = (word: string, fallback: number) => { try { return n.find(word); } catch { return fallback; } };
  return { n, find, end: n.end() };
};

/** from から to まで中身を出す区切り。中のフレームは区切りの頭が0になる */
const Beat: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) =>
  to > from ? <Sequence from={from} durationInFrames={to - from}>{children}</Sequence> : null;

/** 大きな文字だけの画面（問い・言い切り）。enter で入る */
const Statement: React.FC<{ text: string; sub?: string; y?: number }> = ({ text, sub, y = 360 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame, fps);
  return (
    <div style={{ position: "absolute", left: Z.header.x, top: y, width: 1400, opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ ...font("question"), lineHeight: 1.35, whiteSpace: "pre-line" }}>{text}</div>
      {sub && <div style={{ ...font("label", C.ink2), marginTop: 28, whiteSpace: "pre-line" }}>{sub}</div>}
    </div>
  );
};

/** 3つの道案内 */
const Roadmap: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: Z.header.x, top: 260, display: "flex", flexDirection: "column", gap: 44 }}>
      {items.map((it, k) => {
        const t = sp("enter", frame - k * 20, fps);
        return (
          <div key={k} style={{ display: "flex", gap: 32, alignItems: "baseline", opacity: t }}>
            <span style={font("value", C.ink2)}>{k + 1}</span>
            <span style={font("sub")}>{it}</span>
          </div>
        );
      })}
    </div>
  );
};

/** 大きく描いた人物の頭の上の小さな名札（Figure の label は群衆の大きさ向けなので、寄りの絵ではこちら） */
const NameTag: React.FC<{ x: number; y: number; text: string; strong?: boolean }> = ({ x, y, text, strong }) => (
  <text x={x} y={y} textAnchor="middle" style={font("label", strong ? C.ink : C.ink2)}>{text}</text>
);

// ---------- 居間（冒頭と教訓） ----------
const S = 4;
const FLOOR = 800;
const LivingRoom: React.FC<{ phone?: boolean; dimOthers?: boolean }> = ({ phone, dimOthers }) => (
  <>
    <Backdrop kind="washitsu" floor={FLOOR} variant={1} />
    <Svg>
      <Clock x={WALL_FREE.x2 * 1920} y={250} r={46} hour={12} minute={30} />
      <Figure kind="female" x={560} y={FLOOR} size={S} pose="sit" facing={1} age="elder" dim={dimOthers} />
      <Figure kind="female" x={1300} y={FLOOR} size={S} pose="sit" facing={-1} dim={dimOthers} />
      <Figure kind="female" x={930} y={FLOOR} size={S} pose={phone ? "phone" : "sit"} />
      <NameTag x={560} y={FLOOR - 250} text="祖母" />
      <NameTag x={930} y={FLOOR - 250} text="孫娘（30）" strong />
      <NameTag x={1300} y={FLOOR - 250} text="母" />
      <Table x={930} y={FLOOR} size={S} w={90} />
      <Cup x={850} y={FLOOR + tableTop(S)} size={S} />
      <Cup x={1020} y={FLOOR + tableTop(S)} size={S} steam={false} />
    </Svg>
  </>
);

// ---------- 冒頭の物語 ----------
const Opening: React.FC = () => {
  const { find, end } = useCue();
  const app = find("アプリ」", 300);
  const half = find("およそ半分", 700);
  const grandma = find("いまは便利", 1000);
  const net = find("たしかに", 1300);
  const q = find("本当に増えた", 1600);
  return (
    <>
      <Beat from={0} to={half}>
        <Camera keys={[[0, { x: 960, y: 560, scale: 1.25 }], [90, { x: 960, y: 540, scale: 1 }]]} dur={60}>
          <LivingRoom />
        </Camera>
        <Beat from={app} to={half}><Svg><Phone x={1560} y={420} h={420} screen="message" /></Svg></Beat>
      </Beat>
      <Beat from={half} to={grandma}>
        <HeroNumber value={50} unit="%" prefix="約" x={Z.header.x} y={520} detail="1960〜64年に結婚した夫婦のうち、お見合い結婚（49.8%）" />
        <SourceNote text={SRC + " 図表5-2"} />
      </Beat>
      <Beat from={grandma} to={net}><LivingRoom phone /></Beat>
      <Beat from={net} to={q}>
        <Svg>
          <BarChart bars={[{ label: "2021年", value: 11.0 }, { label: "2025年", value: 20.2, focus: true }]}
            x={240} y={260} width={900} height={520} max={25} format={(v) => `${v.toFixed(1)}%`} />
        </Svg>
        <div style={{ position: "absolute", left: 1200, top: 360, ...font("sub"), width: 560 }}>ネットで出会った夫婦の割合</div>
        <SourceNote text={SRC + " 図表5-3（過去5年間に結婚した初婚どうしの夫婦）"} />
      </Beat>
      <Beat from={q} to={end + 30}><Statement text={"結婚につながる出会いは、\n本当に増えたのか？"} /></Beat>
      <ChannelTag />
    </>
  );
};

const Today: React.FC = () => (
  <>
    <TodayCard claim={CLAIM} />
    <Gosa cues={[[6, "thinking"]]} />
  </>
);

// ---------- 予想タイム ----------
/** 消えた10組の列（戻った組は色、空いた組は点線）。back は戻った組の数 */
const TenCouples: React.FC<{ back?: number; start?: number; y?: number }> = ({ back = 0, start = 0, y = 640 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Svg>
      {Array.from({ length: 10 }, (_, k) => {
        const x = 200 + k * 130;
        const filled = k < back;
        const t = filled ? sp("move", frame - start - k * 8, fps) : 1;
        return (
          <g key={k}>
            <rect x={x - 52} y={y - 200} width={104} height={220} rx={R.md} fill="none" stroke={C.ink2} strokeWidth={3} strokeDasharray="10 10" />
            {filled && (
              <g opacity={t} transform={`translate(0 ${(1 - t) * 40})`}>
                <Figure kind="male" x={x - 22} y={y} size={1.6} />
                <Figure kind="female" x={x + 22} y={y} size={1.6} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
};

const QUIZ_Q = "周りの出会いが10組消えたら、ネットと結婚相談所で戻ったのは？";
const QUIZ_CHOICES = ["8組以上（ほぼ埋まった）", "5〜7組", "2〜4組", "1組以下"];

const QuizScene: React.FC = () => {
  const { find, end } = useCue();
  const ask = find("予想して", 450);
  const road = find("三つの順", 1100);
  return (
    <>
      <Beat from={0} to={ask}>
        <Statement text={"減っている出会いもある"} sub="昔なら、周りの人が相手を用意してくれた出会い" y={220} />
        <TenCouples back={0} />
      </Beat>
      <Beat from={ask} to={road}><Quiz question={QUIZ_Q} choices={QUIZ_CHOICES} title="予想タイム" /></Beat>
      <Beat from={road} to={end + 30}>
        <Roadmap items={["出会い方は、どう入れ替わってきたか", "ネットは、何に取って代わったか", "割合ではなく、夫婦の数で数え直す"]} />
      </Beat>
      <Gosa cues={[[0, "normal"], [ask, "thinking"]]} />
    </>
  );
};

// ---------- 第1章 ----------
const CATS = ["見合い", "職場", "友人", "学校", "ネット", "その他"];
// 図表5-3（%）。その他＝結婚相談所・街なか・サークル・アルバイト・幼なじみ・その他・不詳（区分は6つまで）
const ROWS = [
  { label: "1982", values: [29.3, 25.3, 20.5, 6.1, 0, 18.8] },
  { label: "1992", values: [14.9, 35.0, 22.3, 7.7, 0, 20.1] },
  { label: "2005", values: [5.3, 29.9, 30.9, 11.1, 0, 22.8] },
  { label: "2015", values: [3.9, 28.2, 30.8, 11.7, 0, 25.4] },
  { label: "2021", values: [2.2, 25.6, 24.9, 13.8, 11.0, 22.5] },
  { label: "2025", values: [1.1, 20.9, 20.2, 14.0, 20.2, 23.6] },
];

const Ch1Card: React.FC = () => <ChapterCard no={1} title="出会い方は、どう入れ替わったか" />;

const Ch1: React.FC = () => {
  const { find, end } = useCue();
  const ans = find("およそ1組", 330);
  const trend = find("国の調査で", 700);
  const office = find("母が結婚した", 1500);
  const map = find("当てはめて", 2100);
  const latest = find("最新の調査", 3000);
  const net = find("急に伸びて", 3300);
  return (
    <>
      <ChapterDots current={1} />
      <Beat from={0} to={trend}>
        <Quiz question="いま結婚する夫婦のうち、お見合いで出会ったのは100組に何組？" choices={["約1組", "約5組", "約10組", "約20組"]} answer={0} reveal={true} title="小さな問題" />
        <Beat from={ans + 60} to={trend}>
          <HeroNumber value={1} unit="組" prefix="100組に" x={Z.header.x} y={860} detail="2025年 1.1%（1982年は29.3%）" />
        </Beat>
      </Beat>
      <Beat from={trend} to={office}>
        <StackedTrend categories={CATS} rows={ROWS.slice(0, 4)} focus={0} x={Z.stage.x} y={Z.stage.y + 20} width={Z.stageWithGosa.w - 160} />
        <SourceNote text={SRC + " 図表5-3（調査の年。過去5年間に結婚した初婚どうしの夫婦）"} />
      </Beat>
      <Beat from={office} to={map}>
        <Backdrop kind="office" floor={FLOOR} variant={0} />
        <Svg>
          <Desk x={620} y={FLOOR} size={S} />
          <Figure kind="male" x={520} y={FLOOR} size={S} pose="stand" facing={1} />
          <Figure kind="female" x={1100} y={FLOOR} size={S} pose="stand" facing={-1} />
          <NameTag x={1100} y={FLOOR - 330} text="母（20代）" strong />
        </Svg>
        <HeroNumber value={35} unit="%" x={Z.header.x} y={260} detail="1992年調査：職場や仕事で（およそ3組に1組）" />
      </Beat>
      <Beat from={map} to={latest}>
        <StackedTrend categories={CATS} rows={ROWS.slice(0, 4)} focus={2} x={Z.stage.x} y={Z.stage.y + 20} width={Z.stageWithGosa.w - 160} />
        <div style={{ position: "absolute", left: Z.stage.x, top: Z.stage.y - 70, ...font("label", C.ink2) }}>ご両親が結婚したころは？（調査の年 ≒ その前の5年に結婚）</div>
        <SourceNote text={SRC + " 図表5-3"} />
      </Beat>
      <Beat from={latest} to={end + 30}>
        <StackedTrend categories={CATS} rows={ROWS} focus={4} x={Z.stage.x} y={Z.stage.y + 20} width={Z.stageWithGosa.w - 160} start={net - latest} />
        <SourceNote text={SRC + " 図表5-3。ネットは第16回（2021年）から"} />
      </Beat>
      <Gosa cues={[[0, "thinking"], [ans + 10, "surprised"], [trend, "normal"], [net, "point"]]} />
    </>
  );
};

// ---------- 第2章 ----------
const Ch2Card: React.FC = () => <ChapterCard no={2} title="ネットは、何に取って代わったか" />;

const Ch2: React.FC = () => {
  const { find, end } = useCue();
  const before = find("すでに20組", 200);
  const cmp = find("前回と今回", 500);
  const us = find("アメリカでも", 1300);
  const bridge = find("橋が", 2300);
  const yoso = find("予想タイムで", 2700);
  const think = find("紹介してくれる人", 3200);
  const study = find("研究があります", 3700);
  const quiz = find("クイズ", 5000);
  const ans = find("ほぼ同じです", 5600);
  const agency = find("結婚相談所です", 6600);
  const mid = find("ここまでの答え合わせ", 7600);
  return (
    <>
      <ChapterDots current={2} />
      <Beat from={0} to={cmp}>
        <HeroNumber value={5.3} decimals={1} unit="%" x={Z.header.x} y={520} detail="2005年調査：見合いで出会った夫婦（ネットが広がる前）" start={before} />
        <SourceNote text={SRC + " 図表5-3"} />
      </Beat>
      <Beat from={cmp} to={us}>
        <Svg>
          <BarChart bars={[
            { label: "ネット", value: 20.2, focus: true }, { label: "友人", value: 20.2 }, { label: "職場", value: 20.9 }, { label: "学校", value: 14.0 },
          ]} x={200} y={230} width={1150} height={540} max={30} format={(v) => `${v.toFixed(1)}%`} />
        </Svg>
        <div style={{ position: "absolute", left: 1400, top: 260, width: 420, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={font("label", C.ink2)}>2021年 → 2025年</div>
          <div style={font("body")}>ネット　11.0 → 20.2</div>
          <div style={font("body")}>友人　24.9 → 20.2</div>
          <div style={font("body")}>職場　25.6 → 20.9</div>
          <div style={font("body")}>学校　13.8 → 14.0</div>
        </div>
        <SourceNote text={SRC + " 図表5-3（第16回と第17回）"} />
      </Beat>
      <Beat from={us} to={bridge}>
        <Svg>
          <BarChart bars={[
            { label: "ネット 1995", value: 2 }, { label: "ネット 2017", value: 39, focus: true },
            { label: "友人 1995", value: 33 }, { label: "友人 2017", value: 20 },
          ]} x={200} y={230} width={1200} height={540} max={45} format={(v) => `${v}%`} />
        </Svg>
        <SourceNote text="出典：Rosenfeld, Thomas & Hausen (2019) PNAS 116(36)。米国の異性カップルが出会った年ごと" />
      </Beat>
      <Beat from={bridge} to={think}>
        <Backdrop kind="night" floor={FLOOR} variant={1} />
        <Svg>
          <Figure kind="male" x={500} y={FLOOR} size={4} pose="phone" facing={1} />
          <Figure kind="female" x={1400} y={FLOOR} size={4} pose="phone" facing={-1} />
          <Phone x={960} y={440} h={360} screen="like" likes={1} />
        </Svg>
        <Beat from={yoso - bridge} to={think - bridge}>
          <Statement text={"周りが用意する出会い"} sub="お見合いの親せき・職場の同僚・友人の紹介" y={120} />
        </Beat>
      </Beat>
      <Beat from={think} to={study}>
        <Statement text={"あなたの周りに、\n「いい人がいるよ」と\n紹介してくれる人は何人？"} y={260} />
      </Beat>
      <Beat from={study} to={quiz}>
        <Svg>
          <BarChart bars={[
            { label: "見合いの減少", value: 50, focus: true }, { label: "職場の出会いの減少", value: 38, focus: true }, { label: "それ以外", value: 12 },
          ]} x={200} y={260} width={1150} height={500} max={60} format={(v) => (v === 50 ? "約5割" : v === 38 ? "4割近く" : "残り")} />
        </Svg>
        <div style={{ position: "absolute", left: Z.header.x, top: 150, ...font("label", C.ink2) }}>初婚率が下がった分の内訳（2000年代のはじめまで）</div>
        <SourceNote text="出典：岩澤美帆・三田房美「職縁結婚の盛衰と未婚化の進展」日本労働研究雑誌 No.535（2005）" />
      </Beat>
      <Beat from={quiz} to={ans + 150}>
        <Quiz question="若い独身の人で、交際を望んでいない人は？" choices={["男性が多い", "女性が多い", "ほぼ同じ"]} answer={2} reveal title="クイズ" />
      </Beat>
      <Beat from={ans + 150} to={agency}>
        <Svg>
          <PairedBars rows={[
            { label: "交際を望まない", male: 35.7, female: 35.3 },
            { label: "いずれ結婚するつもり", male: 75.1, female: 77.8 },
          ]} max={100} x={200} y={240} width={1250} height={520} format={(v) => `${v.toFixed(1)}%`} />
        </Svg>
        <SourceNote text={SRC + " 図表1-1・2-2（18〜34歳の未婚者）。結婚するつもり：前回 男性81.4%・女性84.3%"} />
      </Beat>
      <Beat from={agency} to={mid}>
        <Svg>
          <BarChart bars={[{ label: "2010〜14年", value: 5.3 }, { label: "2020〜24年", value: 8.9, focus: true }]}
            x={240} y={260} width={900} height={500} max={12} format={(v) => `${v.toFixed(1)}%`} />
        </Svg>
        <div style={{ position: "absolute", left: 1200, top: 320, width: 600, ...font("sub") }}>お見合い＋結婚相談所で結婚した夫婦</div>
        <SourceNote text={SRC + " 図表5-2（結婚した年ごと）"} />
      </Beat>
      <Beat from={mid} to={end + 30}>
        <MidCheck text="ネットと相談所が、消える出会いを補う" />
        <SubscribeNudge start={40} />
      </Beat>
      <Gosa cues={[[0, "thinking"], [cmp + 40, "idea"], [quiz, "thinking"], [ans, "surprised"], [mid, "normal"]]} />
    </>
  );
};

// ---------- 第3章 ----------
const Ch3Card: React.FC = () => <ChapterCard no={3} title="夫婦の数で、数え直す" />;

/** ケーキ（全体）と取り分（割合）。scale でケーキが小さくなる */
const Cake: React.FC<{ scale: number; share: number; label: string; cx: number }> = ({ scale, share, label, cx }) => {
  const r = 220 * scale, cy = 520;
  const a = share * 2 * Math.PI;
  const x = cx + r * Math.sin(a), y = cy - r * Math.cos(a);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.paper2} stroke={C.ink} strokeWidth={4} />
      <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x} ${y} Z`} fill={C.ink} />
      <text x={cx} y={cy + r + 70} textAnchor="middle" style={font("label")}>{label}</text>
    </g>
  );
};

const Ch3: React.FC = () => {
  const { find, end } = useCue();
  const cake = find("ケーキ", 300);
  const marriages = find("4分の1", 900);
  const method = find("数え直して", 1100);
  const net = find("まずは", 1600);
  const guess = find("何組くらい", 2000);
  const seven = find("7万組ほど", 2400);
  const lead = find("どこまで埋めた", 3200);
  return (
    <>
      <ChapterDots current={3} />
      <SimBackground />
      <Beat from={0} to={cake}><Statement text={"消えた出会いの穴は、\n埋まったのか？"} y={300} /></Beat>
      <Beat from={cake} to={method}>
        <Svg>
          <Cake cx={560} scale={1} share={0.11} label="4年前：取り分 11%" />
          <Cake cx={1260} scale={0.82} share={0.2} label="いま：取り分 20%、ケーキは小さく" />
        </Svg>
        <Beat from={marriages - cake} to={method - cake}>
          <div style={{ position: "absolute", left: Z.header.x, top: 120, ...font("sub") }}>初婚どうしの結婚：年に約49万組 → 約37万組</div>
          <SourceNote text="出典：厚生労働省「人口動態統計」（2010〜14年平均と2020〜24年平均）" />
        </Beat>
      </Beat>
      <Beat from={method} to={net}>
        <Statement text={"結婚の数 × 出会い方の割合\n＝ 出会い方ごとの組数"} sub="ネットの答え方がそろう、前回（2021年）と今回（2025年）の調査で比べる" y={280} />
        <SourceNote text={SRC_EST} />
      </Beat>
      <Beat from={net} to={guess}>
        <Svg>
          <BarChart bars={[{ label: "2016〜20年", value: 4.7 }, { label: "2020〜24年", value: 7.5, focus: true }]}
            x={240} y={260} width={900} height={500} max={25} format={(v) => `${v.toFixed(1)}万組`} />
        </Svg>
        <div style={{ position: "absolute", left: 1200, top: 320, width: 600, ...font("sub") }}>ネットで出会った夫婦（年あたり・推計）</div>
        <SourceNote text={SRC_EST} />
      </Beat>
      <Beat from={guess} to={lead}>
        <Svg>
          <BarChart bars={[
            { label: "周りが用意 2016〜20年", value: 22.7 }, { label: "周りが用意 2020〜24年", value: 15.7, focus: true },
            { label: "ネット 2016〜20年", value: 4.7 }, { label: "ネット 2020〜24年", value: 7.5 },
          ]} x={200} y={260} width={1250} height={500} max={25} start={seven - guess} format={(v) => `${v.toFixed(1)}万組`} />
        </Svg>
        <Beat from={seven - guess} to={lead - guess}>
          <HeroNumber value={7} unit="万組" prefix="−" x={1480} y={420} detail="周りが用意する出会い（見合い＋職場＋友人）年あたり" />
        </Beat>
        <SourceNote text={SRC_EST} />
      </Beat>
      <Beat from={lead} to={end + 30}><Statement text={"消えた穴を、\nどこまで埋めたのか？"} sub="答えは、答え合わせで" y={300} /></Beat>
      <Gosa cues={[[0, "thinking"], [seven, "surprised"], [lead, "skeptical"]]} />
    </>
  );
};

// ---------- 答え合わせ ----------
const VerdictScene: React.FC = () => {
  const { find, end } = useCue();
  const hole = find("次に、消えた", 400);
  const four = find("4組ほど", 900);
  const quizAns = find("予想タイムの答え", 1100);
  const total = find("最後に、全体", 1500);
  const judge = find("判定は", 1900);
  return (
    <>
      <Beat from={0} to={hole}>
        <Statement text={"ネットで出会う夫婦は、数でも増えた"} sub="ここは、説のとおり（年あたり 約4.7万組 → 約7.5万組・推計）" y={300} />
      </Beat>
      <Beat from={hole} to={quizAns}>
        <Statement text={"消えた10組のうち、戻ってきたのは"} y={140} />
        <TenCouples back={4} start={four - hole} />
        <Beat from={four - hole} to={quizAns - hole}>
          <div style={{ position: "absolute", left: Z.header.x, top: 760, ...font("label", C.ink2) }}>推計 約4組（39%）。数え方による幅 約15〜62%</div>
        </Beat>
        <SourceNote text={SRC_EST} />
      </Beat>
      <Beat from={quizAns} to={total}>
        <Quiz question={QUIZ_Q} choices={QUIZ_CHOICES} answer={2} reveal title="予想タイムの答え" />
      </Beat>
      <Beat from={total} to={judge}>
        <HeroNumber value={25} unit="%" prefix="約" x={Z.header.x} y={520} detail="初婚どうしの結婚の減り方（2010〜14年平均 → 2020〜24年平均）" />
        <SourceNote text="出典：厚生労働省「人口動態統計」" />
      </Beat>
      <Beat from={judge} to={end + 30}>
        <Verdict claim={CLAIM} mark="×" reason={["ネットの出会いは、数でも増えた", "でも、消えた周りの出会いの4割ほどしか埋まっていない", "初婚どうしの結婚は、約4分の1減った"]} />
      </Beat>
      <Gosa cues={[[0, "normal"], [four, "surprised"], [judge - 10, "assertive"]]} />
    </>
  );
};

// ---------- 教訓 ----------
const Lesson: React.FC = () => {
  const { find, end } = useCue();
  const half = find("半分だけ", 300);
  const smile = find("笑って", 800);
  return (
    <>
      <LivingRoom />
      <Beat from={half} to={smile}>
        <div style={{ position: "absolute", left: Z.header.x, top: 90, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={font("sub")}>〇 スマホで相手を探せるようになった</div>
          <div style={font("sub")}>× 結婚につながる出会いは増えていない</div>
        </div>
      </Beat>
      <Beat from={smile} to={end + 30}>
        <Statement text={"「わたしのときは、\n親せきのおばさんが、\nアプリだったのね」"} y={90} />
      </Beat>
      <Gosa cues={[[0, "happy"]]} size="S" />
    </>
  );
};

const LessonMain: React.FC = () => {
  const { find, end } = useCue();
  const look = find("伸びた割合", 400);
  const self = find("うまくいかない", 900);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Beat from={0} to={look}><Statement text={"出会いの場所を用意していたのは、\nいつも本人の外にある仕組み"} y={320} /></Beat>
      <Beat from={look} to={self}><Statement text={"伸びた割合の陰で、\n何が消えたか。\n全体の数はどうなったか。"} y={260} /></Beat>
      <Beat from={self} to={end + 30}><Statement text={"うまくいかない理由の一部は、\n仕組みの変化かもしれない"} y={320} /></Beat>
    </AbsoluteFill>
  );
};

const End: React.FC = () => <EndScreen lesson={"伸びた割合の陰で、\n何が消えたかを見る。"} />;

const episode: EpisodeDef = {
  id: "001-where-couples-meet",
  title: "アプリで、結婚につながる出会いは増えたのか", // 仮。タイトルは meta.md で決める
  scenes: fromTiming(timing as Timing, {
    opening: Opening, today: Today, quiz: QuizScene,
    "ch1-card": Ch1Card, ch1: Ch1, "ch2-card": Ch2Card, ch2: Ch2, "ch3-card": Ch3Card, ch3: Ch3,
    verdict: VerdictScene, lesson: Lesson, "lesson-main": LessonMain, end: End,
  }),
  // BGM の割り当て（2026-10-04 決定、docs/decisions.md）。章の扉と終了画面の場面を足したので from/to を合わせた。
  bgm: [
    { file: "Sizzr - Schwartzy.mp3", from: "opening", to: "quiz", startAt: 10 },
    { file: "Stayin' Lazy - Godmode.mp3", from: "ch1-card", to: "ch2" },
    { file: "Jomon Grove - The Mini Vandals.mp3", from: "ch3-card", to: "ch3" },
    { file: "Traversing - Godmode.mp3", from: "verdict" },
    { file: "Sizzr - Schwartzy.mp3", from: "lesson", startAt: 10 },
    { file: "Away - Patrick Patrikios.mp3", from: "lesson-main", to: "end" },
  ],
};
export default episode;
