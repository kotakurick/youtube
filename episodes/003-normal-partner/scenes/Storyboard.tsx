// 3本目「『普通の相手』の条件を全部満たす人の数」の絵コンテ 第2版（台本は script.md の第6稿・手直し版。2026-10-06）。
// 第1版（31場面）を3役が見直した指摘（review/storyboard-summary.md）で作り直した：物差しを人の乗った図に（TwoRulers）、
// ふるいを描く（Sieve）、いちばんの数字「26人に1人」を3段に割って大きく、人型は64px以上、出典は字幕の帯の上、
// 色は男女の色に加えて物差しの意味の色（お金＝金、身長・体型＝青緑。人型には使わない）。
// 各場面は「動き終わりの姿」。秒数（sec）は台本の文字数からの見積もり（1分390字）、動き（move）は本編で付ける動き。
// 数字は sources.csv（S2〜S4・S12・S13・S15・S16）と data/count_result.md。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { ChapterDots } from "@lib/Chapter";
import { TodayCard } from "@lib/Cards";
import { Cat } from "@lib/Cat";
import { Dumbbell } from "@lib/Dumbbell";
import { EndScreen } from "@lib/EndScreen";
import { Figure, Kind } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { Table } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SearchRow, SearchScreen } from "@lib/SearchScreen";
import { Sieve } from "@lib/Sieve";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { TwoRulers } from "@lib/TwoRulers";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number; fs?: number }> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight, fs }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}), ...(fs ? { fontSize: fs } : {}) }}>{children}</text>
);
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1500, ...font("question"), whiteSpace: "nowrap" }}>{children}</div>
);
/** 100人（20×5、1人の高さ65px）。lit の人だけ色、ほかは薄く。frame の範囲（1行目の列）に墨の枠 */
const Hundred: React.FC<{ x: number; y: number; kind: Kind; lit: (i: number) => boolean; dx?: number; frame?: [number, number] }> = ({ x, y, kind, lit, dx = 46, frame }) => (
  <g>
    {frame && <rect x={x + frame[0] * dx - 6} y={y - 6} width={(frame[1] - frame[0]) * dx + 12} height={92 + 12} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.base} />}
    {Array.from({ length: 100 }, (_, i) => <Figure key={i} kind={kind} x={x + (i % 20) * dx + dx / 2} y={y + Math.floor(i / 20) * 92 + 78} size={1.3} dim={!lit(i)} />)}
  </g>
);
const spread = (n: number, total = 100) => { const s = new Set<number>(); for (let k = 0; k < n; k++) s.add(Math.floor((k * total) / n)); return (i: number) => s.has(i); };
const MONEY = C.gold, BODY = C.teal;
const FLOOR = 820; // 物語の場面の床。猫の足元が字幕の帯（y920、上に28px空ける）に入らない高さ
/** 夜の部屋：壁を暗くし、スマホの光だけ。低いテーブルの前に彼女（2本目の寝室とは別の部屋・別の構図） */
const Room: React.FC<{ face?: "normal" | "sad" | "think"; phone?: "hand" | "table"; children?: React.ReactNode }> = ({ face = "normal", phone = "hand", children }) => (
  <>
    <Backdrop kind="room" floor={FLOOR} variant={5} night />
    <Svg>
      <rect x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.55} />
      <circle cx={960} cy={700} r={260} fill={C.white} opacity={0.16} />
      <Table x={960} y={FLOOR} size={5.2} w={120} />
      {phone === "table" && <g transform={`translate(860,${FLOOR - 21 * 5.2 - 6}) rotate(90)`}><rect x={-10} y={-40} width={20} height={80} rx={6} fill={C.ink} /></g>}
      <Cat kind="female" x={1060} y={FLOOR + 30} size={5.4} pose={phone === "hand" ? "phone" : "sit"} face={face} facing={-1} label="彼女" />
      {children}
    </Svg>
  </>
);
const ROWS = (on: number, mark?: number): SearchRow[] => [
  { label: "年収 500万円以上", on: on >= 1, mark: mark === 0, axis: MONEY },
  { label: "大学卒業以上", on: on >= 2, mark: mark === 1, axis: MONEY },
  { label: "身長 170cm以上", on: on >= 3, mark: mark === 2, axis: BODY },
  { label: "たばこを吸わない", on: false, dim: true },
  { label: "正社員", on: false, dim: true },
];
const DISCLAIM = "人数は国の統計の割合を千人に置き換えた架空のもの（就業構造基本調査2022ほか）。身長は見積もり";
// 冒頭の100人（1人＝10人）：年収 13 → 大卒 11 → 身長 6
const LIT = [100, 13, 11, 6];
const litAt = (step: number) => (i: number) => i < LIT[step];
const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 96, top: 64, ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "4px 16px" }}>{text}</div>
);

// ================= 冒頭 =================
const P01: React.FC = () => <AbsoluteFill><Room face="normal" /><Tag text="会社員（33）　相談所に入って3か月　午前1時" /></AbsoluteFill>;
const P02: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="washitsu" floor={FLOOR} variant={1} />
    <Svg>
      <Table x={960} y={FLOOR} size={4} w={70} />
      <Cat kind="female" x={780} y={FLOOR + 10} size={4} pose="sit" face="happy" facing={1} label="彼女" />
      <Cat kind="male" x={1140} y={FLOOR + 10} size={4} pose="sit" face="happy" facing={-1} label="二回目の人" />
      <g data-qa-allow="prop">
        <rect x={1260} y={180} width={560} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={1290} y={240} size="note" color={C.ink2}>翌日　相手の相談所から</Label>
        <Label x={1290} y={300}>今回はお見送りに…</Label>
      </g>
    </Svg>
    <Tag text="二回目のお見合い（回想）" />
  </AbsoluteFill>
);
const Screen: React.FC<{ count: number; on: number; prev?: number; mark?: number; step: number; gone?: boolean }> = ({ count, on, prev, mark, step, gone }) => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={400} y={500} h={640} count={count} prev={prev} rows={ROWS(on, mark)} />
      <Label x={760} y={250} color={C.ink2}>25〜34歳の結婚していない男性　1人＝10人</Label>
      <Hundred x={760} y={290} kind="male" lit={litAt(step)} dx={52} />
      {gone && (
        <g data-qa="mark" data-qa-label="消える1人">
          <rect x={760} y={760} width={720} height={64} rx={R.md} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 8" />
          <Cat kind="male" x={810} y={816} size={1.1} pose="sit" face="happy" label="二回目の人" />
          <Label x={860} y={804} color={C.ink2}>二回目の人：この画面には出てこない</Label>
        </g>
      )}
    </Svg>
    <SourceNote text={DISCLAIM} prefix="" />
  </AbsoluteFill>
);
const P03: React.FC = () => <Screen count={1000} on={0} step={0} />;
const P04: React.FC = () => <Screen count={132} on={1} prev={1000} mark={0} step={1} />;
const P05: React.FC = () => <Screen count={106} on={2} prev={132} mark={1} step={2} />;
const P06: React.FC = () => <Screen count={59} on={3} prev={106} mark={2} step={3} gone />;
const QROWS: SearchRow[] = [0, 1, 2, 3, 4].map((i) => ({ label: "？", on: i < 3, dim: i >= 3 }));
const P07: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={560} y={500} h={620} count={59} rows={ROWS(3)} title="彼女の画面" />
      <SearchScreen x={1360} y={500} h={620} count="？" unit="" title="あの人の画面" rows={QROWS} />
      <Label x={960} y={520} anchor="middle" size="value">⇄</Label>
    </Svg>
  </AbsoluteFill>
);
const P08: React.FC = () => <AbsoluteFill><TodayCard claim="普通の相手は、数%しかいない" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
const P09: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="年収850万円以上の男性だけなら、背による差は？" choices={["ほとんど消える", "半分くらいに縮む", "変わらない", "もっと広がる"]} />
    <Svg><Label x={96} y={790} color={C.ink2}>全体では 160cm以下 27.6%・172cm 37.4%</Label></Svg>
    <SourceNote text="IBJ 結婚みらい研究所（2026）。成婚率＝成婚者÷（成婚者＋退会者）" />
  </AbsoluteFill>
);

// ================= 第1章 =================
const P10: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>画面の千人の正体</Heading>
    <Svg>
      <Hundred x={140} y={250} kind="male" lit={() => true} dx={70} />
      <Label x={140} y={790} color={C.ink2}>25〜34歳の結婚していない男性を、国の統計の割合どおりに千人。1人＝10人</Label>
    </Svg>
    <SourceNote text="総務省「就業構造基本調査」2022（働いていない人を含む）" />
  </AbsoluteFill>
);
const P11: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="年収500万円以上の人のうち、大学を出ている人は？" choices={["約2割", "約5割", "約8割", "ほぼ全員"]} answer={2} reveal title="考えてみよう" />
  </AbsoluteFill>
);
// 100人の中の13人（年収500万円以上）を枠で囲み、大卒に色：枠の中11人（約8割）、枠の外38人（全体で49人＝約5割）
const outside = spread(38, 87);
const P12: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>年収の高い人には、大学を出た人が多い</Heading>
    <Svg>
      <Hundred x={140} y={240} kind="male" dx={70} frame={[0, 13]} lit={(i) => (i < 13 ? i < 11 : outside(i - 13))} />
      <Label x={140} y={730} weight={900}>枠の中（年収500万円以上）：大学を出た人 約8割</Label>
      <Label x={140} y={790} color={C.ink2}>100人全体では 約5割　（色が付いた人＝大学を出た人）</Label>
    </Svg>
    <SourceNote text="就業構造基本調査2022 第40表・第118表から当チャンネルが集計（年収500万円以上の人のうち大卒以上80.1%、全体49.3%）" />
  </AbsoluteFill>
);
const CUTS = [{ at: 10, label: "大学", on: true }, { at: 17, label: "年収500万円", on: true }];
const P13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>同じ物差しの上の条件は、重ねても減らない</Heading>
    <Svg><TwoRulers x={120} y={220} xCuts={CUTS} yCut={{ at: 3, label: "170cm", on: false }} /></Svg>
    <SourceNote text="模式図（横＝お金の物差しの順、縦＝身長の順）" prefix="" />
  </AbsoluteFill>
);
const P13b: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>別の物差しの条件は、掛け算で減る</Heading>
    <Svg><TwoRulers x={120} y={220} xCuts={CUTS} yCut={{ at: 3, label: "170cm", on: true }} /></Svg>
    <SourceNote text="模式図。身長と給料の関係は弱い（慶應義塾大学 PDRC DP2009-010）。身長は見積もり" prefix="" />
  </AbsoluteFill>
);
const Survivors: React.FC<{ x: number; y: number; n: number; title: string; value: string }> = ({ x, y, n, title, value }) => (
  <g>
    <Label x={x} y={y}>{title}</Label>
    {Array.from({ length: n }, (_, i) => <Figure key={i} kind="male" x={x + 22 + (i % 20) * 40} y={y + 100 + Math.floor(i / 20) * 86} size={1.3} />)}
    <Label x={x} y={y + 100 + Math.ceil(n / 20) * 86 + 30} size="value">{value}</Label>
  </g>
);
const P14: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>ばらばらに掛け算すると、少なく出る</Heading>
    <Svg>
      <Survivors x={140} y={250} n={36} title="掛け算の世界で残る人" value="千人に36人" />
      <Survivors x={1000} y={250} n={59} title="実際に重ねた世界で残る人" value="千人に59人" />
    </Svg>
    <SourceNote text="当チャンネルの計算と第40表の重なり。ここでは1人＝1人。身長は見積もり" />
  </AbsoluteFill>
);

// ================= 第2章 =================
const SIX: [string, string][] = [["年齢", C.other], ["年収", MONEY], ["仕事の形", MONEY], ["学歴", MONEY], ["身長", BODY], ["体型", BODY]];
const P15: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>独身の男女 約1万人が、自分で答えた六つの条件</Heading>
    <Svg>
      {SIX.map(([s, col], i) => (
        <g key={s}><rect x={110 + i * 285} y={300} width={260} height={110} rx={R.md} fill={C.white} stroke={col} strokeWidth={LINE.base} />
          <rect x={110 + i * 285} y={300} width={16} height={110} rx={6} fill={col} />
          <Label x={250 + i * 285} y={372} anchor="middle" size="value" fs={52}>{s}</Label></g>
      ))}
      {Array.from({ length: 10 }, (_, i) => <Figure key={i} kind={i % 2 ? "female" : "male"} x={460 + i * 110} y={680} size={2} />)}
      <Label x={960} y={780} anchor="middle" color={C.ink2}>この1万人を、一つの結婚の市場とみなして数えた</Label>
    </Svg>
    <SourceNote text="鈴木亘・八代尚宏（2025）内閣府経済社会総合研究所『経済分析』211号。2024年3月調査、25〜49歳" />
  </AbsoluteFill>
);
const Big: React.FC<{ x: number; y: number; text: string; sub?: string }> = ({ x, y, text, sub }) => (
  <g><Label x={x} y={y} size="hero" fs={150}>{text}</Label>{sub && <Label x={x + 6} y={y + 80} color={C.ink2}>{sub}</Label>}</g>
);
const P16: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>女性の六つの条件を、全部満たす男性</Heading>
    <Svg>
      <Hundred x={100} y={240} kind="male" lit={spread(13)} dx={46} />
      <Big x={1080} y={480} text="8人に1人" sub="数パーセント、ではない" />
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（女性の希望率13.3%）" />
  </AbsoluteFill>
);
const P17: React.FC = () => {
  const one = [52.9, 43.1, 70.0, 78.0, 65.1, 64.0];
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>一つずつなら4〜8割。掛け算すると約5%</Heading>
      <Svg>
        {one.map((v, i) => {
          const x = 160 + i * 230, h = v * 5;
          return (
            <g key={i}><rect data-qa="mark" data-qa-label={SIX[i][0]} x={x} y={740 - h} width={140} height={h} rx={R.sm / 2} fill={C.male} />
              <Label x={x + 70} y={722 - h} anchor="middle">{`${Math.round(v)}%`}</Label>
              <Label x={x + 70} y={800} anchor="middle">{SIX[i][0]}</Label></g>
          );
        })}
        <Label x={1580} y={400} color={C.ink2}>掛け算</Label>
        <Label x={1580} y={470} size="value">約5%</Label>
        <Label x={1580} y={600} color={C.ink2}>実際</Label>
        <Label x={1580} y={670} size="value">13%</Label>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2（条件1つだけの女性の希望率）。掛け算（約5.2%）は当チャンネルの計算" />
    </AbsoluteFill>
  );
};
const P18: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>掛け算より多く残る理由として、考えられるのは二つ</Heading>
    <Svg>
      <rect x={140} y={230} width={760} height={460} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={180} y={300} weight={900}>① 相手の側で、条件がそろう</Label>
      {[0, 1, 2].map((i) => <Figure key={i} kind="male" x={330 + i * 160} y={590} size={2.6} dim={i !== 1} />)}
      <Label x={520} y={650} anchor="middle" size="note" color={C.ink2}>年収も学歴も、同じ人が満たす</Label>
      <rect x={1020} y={230} width={760} height={460} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={300} weight={900}>② 選ぶ側に、こだわりの差</Label>
      <Figure kind="female" x={1220} y={590} size={2.6} /><Label x={1220} y={650} anchor="middle" size="note" color={C.ink2}>何にでもこだわる</Label>
      <Figure kind="female" x={1580} y={590} size={2.6} /><Label x={1580} y={650} anchor="middle" size="note" color={C.ink2}>あまりこだわらない</Label>
      <Label x={960} y={770} anchor="middle" color={C.ink2}>どちらがどれだけ効いているかは、この論文からは分からない</Label>
    </Svg>
  </AbsoluteFill>
);
const P19: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>男性の六つの条件を、全部満たす女性</Heading>
    <Svg>
      <Hundred x={100} y={240} kind="female" lit={spread(33)} dx={46} />
      <Big x={1080} y={480} text="3人に1人" />
      <Label x={1086} y={580} color={C.ink2}>年収・仕事・身長を気にしない男性が多い</Label>
      <Label x={1086} y={650}>年齢と体型は、男性もよく気にする</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（男性の希望率32.5%）、図2〜7" />
  </AbsoluteFill>
);
const SieveStage: React.FC<{ kind: Kind; n: number; title: string; who: string }> = ({ kind, n, title, who }) => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>{title}</Heading>
    <Svg>
      <Sieve x={330} y={400} w={400} label={who} />
      <Hundred x={680} y={240} kind={kind} lit={spread(n)} dx={52} />
      <Label x={680} y={790} size="value">{`100人に${n}人`}</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2" />
  </AbsoluteFill>
);
const P20a: React.FC = () => <SieveStage kind="male" n={13} title="一枚目：女性が男性を選ぶふるい" who="女性の条件" />;
const P20b: React.FC = () => <SieveStage kind="female" n={33} title="二枚目：男性が女性を選ぶふるい" who="男性の条件" />;
const P20c: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>お互いに条件を満たし合う男女</Heading>
    <Svg>
      <Sieve x={300} y={330} w={300} label="女性の条件" />
      <Sieve x={300} y={640} w={300} label="男性の条件" />
      <Big x={620} y={520} text="26人に1人" sub="研究者は「極めて狭き門」と書いている" />
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（成立率3.8%）、要旨・p.90" />
  </AbsoluteFill>
);
const P21: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>数えているのは、自分の側のふるいだけ</Heading>
    <Svg>
      <Sieve x={560} y={360} w={440} label="自分のふるい" />
      <Sieve x={1360} y={360} w={440} label="相手のふるい" dashed />
      <Cat kind="female" x={560} y={780} size={2.8} pose="stand" face="think" facing={1} label="彼女" />
      <Cat kind="male" x={1360} y={780} size={2.8} pose="stand" face="normal" facing={-1} label="相手" />
      <Label x={960} y={600} anchor="middle" color={C.ink2}>両方を通らないと、二人は会えない</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）p.90「６つそれぞれの条件が重なり合うことで、3.8％という狭き門を作り出している」" />
  </AbsoluteFill>
);

// ================= 第3章 =================
const P22: React.FC = () => (
  <AbsoluteFill>
    <Room face="sad">
      <g data-qa-allow="prop">
        <rect x={1320} y={180} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={1350} y={240} size="note" color={C.ink2}>選ぶ側で、選ばれる側</Label>
        <Label x={1350} y={300}>今回はお見送りに…</Label>
      </g>
    </Room>
    <ChapterDots current={3} />
  </AbsoluteFill>
);
const P23: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="会う前の理想の条件は、会ったときの気持ちをどれくらい当てる？" choices={["ほぼ言い当てる", "半分くらい", "少しだけ", "ほとんど言い当てない"]} answer={3} reveal title="考えてみよう" />
  </AbsoluteFill>
);
const P24: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>会う前の条件 と 会ったときの気持ち</Heading>
    <Svg>
      <rect x={140} y={230} width={760} height={500} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={180} y={300} weight={900}>会う前のアンケート</Label>
      <Figure kind="male" x={330} y={540} size={2.4} /><Label x={330} y={610} anchor="middle">見た目を</Label><Label x={330} y={660} anchor="middle">重く見る</Label>
      <Figure kind="female" x={690} y={540} size={2.4} /><Label x={690} y={610} anchor="middle">稼ぐ見込みを</Label><Label x={690} y={660} anchor="middle">重く見る</Label>
      <rect x={1020} y={230} width={760} height={500} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={300} weight={900}>スピードデートで会ったとき</Label>
      <Figure kind="male" x={1210} y={540} size={2.4} /><Figure kind="female" x={1570} y={540} size={2.4} />
      <Label x={1400} y={610} anchor="middle">男女の差は出なかった</Label>
      <Label x={960} y={800} anchor="middle" weight={900}>会う前の条件は、会ったときの気持ちを、ほとんど言い当てなかった</Label>
    </Svg>
    <SourceNote text="Eastwick & Finkel（2008）J Pers Soc Psychol。米国の大学生163人。初対面で惹かれるかの研究" />
  </AbsoluteFill>
);
const P25: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Svg>
      <SearchScreen x={520} y={500} h={640} count={59} rows={ROWS(3)} title="会う前の条件" />
      <Label x={1000} y={300}>欄の外にあったもの</Label>
      {["話が弾んだ", "笑うと目がなくなる", "断られた理由"].map((t, i) => (
        <g key={t}><rect x={1000} y={350 + i * 130} width={620} height={100} rx={R.md} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={i === 2 ? "12 8" : undefined} />
          <Label x={1040} y={414 + i * 130}>{t}</Label></g>
      ))}
    </Svg>
  </AbsoluteFill>
);

// ================= 答え合わせ =================
const P26: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="普通の相手は、数%しかいない" mark="△" reason={["自分の条件だけなら：8人に1人・3人に1人", "お互いに満たし合うと：26人に1人", "片側か両側かで決まる"]} />
  </AbsoluteFill>
);
const IBJ: [string, number, number][] = [["850万円以上", 41.8, 43.9], ["550万〜750万円", 33.1, 41.3], ["450万円以下", 10.7, 23.6]];
const P27a: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の答え：A　差がほとんど消える</Heading>
    <Dumbbell rows={IBJ.slice(0, 1).map(([label, a, b]) => ({ label, a, b }))} aLabel="160cm以下" bLabel="172cm以上" max={50} x={140} y={340} width={1500} rowH={150} format={(v) => `${v.toFixed(1)}%`} />
    <SourceNote text="IBJ（2026年6月5日 PR TIMES、図2）。成婚率。会社の集計で、区分ごとの人数は出ていない" />
  </AbsoluteFill>
);
const P27b: React.FC = () => (
  <AbsoluteFill>
    <Heading>年収が上がるにつれて、身長の差は縮む</Heading>
    <Dumbbell rows={IBJ.map(([label, a, b]) => ({ label, a, b }))} aLabel="160cm以下" bLabel="172cm以上" max={50} x={140} y={300} width={1500} rowH={150} format={(v) => `${v.toFixed(1)}%`} />
    <Svg><Label x={140} y={790} size="note" color={C.ink2}>記事に出ている年収の区分だけ（ほかの区分は省いた）。なぜそうなるかは分からない</Label></Svg>
    <SourceNote text="IBJ（2026年6月5日 PR TIMES、図2）。成婚率＝成婚者÷（成婚者＋退会者）" />
  </AbsoluteFill>
);

// ================= ミクロ・教訓 =================
const Squares: React.FC<{ x: number; y: number; n: number; label: string }> = ({ x, y, n, label }) => (
  <g>
    {Array.from({ length: 100 }, (_, i) => <rect key={i} data-qa="mark" data-qa-label="組" x={x + (i % 10) * 44} y={y + Math.floor(i / 10) * 44} width={38} height={38} rx={6} fill={i < n ? C.ink : C.paper2} />)}
    <Label x={x} y={y + 500} size="value">{label}</Label>
  </g>
);
const P28: React.FC = () => (
  <AbsoluteFill>
    <Heading>条件を一つゆるめて数え直すと（研究の試算）</Heading>
    <Svg>
      <Squares x={200} y={220} n={4} label="100組に4組" />
      <Label x={860} y={460} size="value">→</Label>
      <Squares x={1040} y={220} n={19} label="100組に19組" />
      <Label x={1540} y={360} color={C.ink2}>六つのうち</Label>
      <Label x={1540} y={420} color={C.ink2}>どれか一つは</Label>
      <Label x={1540} y={480} color={C.ink2}>外れてよい</Label>
      <Label x={1540} y={600} size="note" color={C.ink2}>大事な条件が</Label>
      <Label x={1540} y={640} size="note" color={C.ink2}>外れた組も入る</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）表5（お互いに満たし合う男女 3.8%→18.8%）、脚注5" />
  </AbsoluteFill>
);
const P29: React.FC = () => (
  <AbsoluteFill>
    <Room face="think" phone="table">
      <g data-qa-allow="prop">
        <ellipse cx={560} cy={330} rx={240} ry={150} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <circle cx={760} cy={500} r={22} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <circle cx={820} cy={560} r={12} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      </g>
      <Cat kind="male" x={560} y={430} size={1.8} pose="sit" face="happy" label="あの人（思い出）" />
    </Room>
  </AbsoluteFill>
);
const P30a: React.FC = () => (
  <AbsoluteFill>
    <Heading>同じ物差しは減らず、別の物差しは掛け算</Heading>
    <Svg><TwoRulers x={120} y={220} xCuts={CUTS} yCut={{ at: 3, label: "170cm", on: true }} /></Svg>
  </AbsoluteFill>
);
const P30b: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={560} y={470} h={620} count={59} rows={ROWS(3)} title="彼女の画面" />
      <SearchScreen x={1360} y={470} h={620} count="？" unit="" title="相手の画面" rows={QROWS} />
      <Label x={960} y={840} anchor="middle" color={C.ink2}>相手の物差しの上に、自分が乗らなければ会えない</Label>
    </Svg>
  </AbsoluteFill>
);
const P30c: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Sieve x={560} y={300} w={360} label="自分のふるい" />
      <Sieve x={1360} y={300} w={360} label="相手のふるい" />
      <Cat kind="female" x={760} y={700} size={3} pose="stand" face="normal" facing={1} label="彼女" />
      <Cat kind="male" x={1160} y={700} size={3} pose="stand" face="happy" facing={-1} label="相手" />
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 760, width: 1728, ...font("value"), fontSize: 48, textAlign: "center" }}>
      相手の数を数えるとき、私たちは、相手の側のふるいを数え忘れています。
    </div>
  </AbsoluteFill>
);
const P31: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;
// 終了画面（共通の部品。ゴサと教訓の1行、次の1本・再生リストの枠。20秒、ナレーションなし）
const P32: React.FC = () => <AbsoluteFill><EndScreen lesson={"相手の数を数えるとき、\n相手の側のふるいを\n数え忘れている。"} /></AbsoluteFill>;

const panels: Panel[] = [
  { key: "01", title: "冒頭：午前1時の部屋", C: P01, sec: 9, move: "暗い部屋。スマホの光だけが彼女の顔を照らす。低いテーブルの前" },
  { key: "02", title: "冒頭：二回目のお見合い（回想）", C: P02, sec: 9, move: "回想（色を少し淡く）。向かい合って笑う2匹 → 翌日の通知の札が上から降りる" },
  { key: "03", title: "冒頭：検索画面 千人", C: P03, sec: 7, move: "スマホに寄ると検索画面。右に100人（1人＝10人）が並ぶ" },
  { key: "04", title: "冒頭：年収 → 132人", C: P04, sec: 6, move: "親指が年収の欄（金の帯）に触れる → 数字が千から132へ数え下がり、右の100人のうち13人だけが色を残す" },
  { key: "05", title: "冒頭：大卒 → 106人", C: P05, sec: 7, move: "大学の欄（金の帯）にチェック → 106。色の人は13→11人とほとんど減らない" },
  { key: "06", title: "冒頭：身長 → 59人（あの人が消える）", C: P06, sec: 14, move: "身長の欄（青緑の帯）にチェック → 59。色の人が11→6人に。下に「二回目の人」の札が出て点線になって薄れる" },
  { key: "07", title: "冒頭：あの人の画面", C: P07, sec: 9, move: "彼女の画面が左へ寄り、右に同じ形の「あの人の画面」が鏡のように現れる（欄は「？」）" },
  { key: "08", title: "今日の答え合わせ", C: P08, sec: 8, move: "2つの画面を払ってカード" },
  { key: "09", title: "予想タイム（IBJ）", C: P09, sec: 28, move: "問い → 全体の差（約10ポイント）の一行 → 選択肢4つ（答えは判定で）" },
  { key: "10", title: "第1章：千人の正体", C: P10, sec: 13, move: "第1章の扉 → 冒頭の右の100人が中央に大きく並び直す" },
  { key: "11", title: "第1章：考えてみよう（大卒は何割）", C: P11, sec: 9, move: "問いと選択肢 → 3秒の輪 → Cが光る" },
  { key: "12", title: "第1章：枠の中は8割", C: P12, sec: 16, move: "100人のうち年収500万円以上の13人を墨の枠で囲む → 大卒に色：枠の中11人、外38人" },
  { key: "13", title: "第1章：同じ物差しの上（大学と年収）", C: P13, sec: 16, move: "100人が横（お金の順）と縦（身長の順）の物差しの間に並ぶ → 金の縦線が2本（大学・年収）。年収の右の人はほぼ大学の右にもいる" },
  { key: "13b", title: "第1章：別の物差し（身長）", C: P13b, sec: 14, move: "青緑の横線（170cm）が入り、年収の右に残った人がさらに上下に分かれる" },
  { key: "14", title: "第1章：掛け算と実際", C: P14, sec: 21, move: "左に掛け算で残る36人、右に実際の59人が1人ずつ並ぶ（ここは1人＝1人）" },
  { key: "15", title: "第2章：1万人の六つの条件", C: P15, sec: 23, move: "第2章の扉 → 六つの札（物差しの色の帯）が並ぶ → 下に男女の人型" },
  { key: "16", title: "第2章：全部なら8人に1人", C: P16, sec: 11, move: "100人が沈み、13人が残る → 〔間〕のあと「8人に1人」が大きく" },
  { key: "17", title: "第2章：一つずつなら4〜8割（掛け算は約5%）", C: P17, sec: 9, move: "六本の棒が左から伸びる → 右に「掛け算 約5%」と「実際 13%」" },
  { key: "18", title: "第2章：理由は二つ考えられる", C: P18, sec: 18, move: "左の札（同じ人に条件がそろう）→ 右の札（こだわりの差）→ 下に「論文からは分からない」" },
  { key: "19", title: "第2章：男性の条件は3人に1人", C: P19, sec: 16, move: "女性100人が沈み、33人が残る → 「3人に1人」→ 年齢と体型の一文" },
  { key: "20a", title: "第2章：一枚目のふるい（女性の条件）", C: P20a, sec: 9, move: "ふるいの上から男性100人がふるわれ、13人が残る" },
  { key: "20b", title: "第2章：二枚目のふるい（男性の条件）", C: P20b, sec: 9, move: "もう一枚のふるいで女性100人がふるわれ、33人が残る" },
  { key: "20c", title: "第2章：26人に1人", C: P20c, sec: 11, move: "二枚のふるいが縦に重なる → 〔間〕→「26人に1人」が大きく出る（この回いちばんの数字）" },
  { key: "21", title: "第2章：自分のふるいと相手のふるい", C: P21, sec: 25, move: "自分のふるい（実線）だけ → 相手のふるい（点線）が浮かび上がる。2匹の間に一文" },
  { key: "22", title: "第3章：選ばれる側でもあった", C: P22, sec: 9, move: "第3章の扉 → 冒頭の部屋。お断りの通知がもう一度" },
  { key: "23", title: "第3章：考えてみよう（言い当てる？）", C: P23, sec: 11, move: "問いと選択肢 → 3秒の輪 → Dが光る" },
  { key: "24", title: "第3章：会う前と会ったとき", C: P24, sec: 21, move: "左の札（会う前：男女で別の条件）→ 右の札（会ったとき：差が消える）→ 下に答えの一文" },
  { key: "25", title: "第3章：欄の外", C: P25, sec: 14, move: "検索画面の右に、欄に書けないものの札が1枚ずつ。「断られた理由」は点線" },
  { key: "26", title: "答え合わせ △", C: P26, sec: 17, move: "証拠の札が3枚 → △の印" },
  { key: "27a", title: "予想の答え：A", C: P27a, sec: 11, move: "850万円以上の1段だけ。2つの点がほぼ重なる" },
  { key: "27b", title: "年収ごとの身長の差", C: P27b, sec: 16, move: "上に550万〜750万円、450万円以下の段が足され、下の段ほど点が離れる" },
  { key: "28", title: "ミクロ：一つゆるめて数え直すと", C: P28, sec: 21, move: "100マスのうち4マスが墨 → 右に19マスの100マスが並ぶ（約5倍）。右に但し書き" },
  { key: "29", title: "教訓：午前1時半の部屋", C: P29, sec: 11, move: "冒頭と同じ部屋。スマホはテーブルの上、彼女は座って考える。思い出の吹き出しに、笑う青い猫" },
  { key: "30a", title: "教訓：物差しに戻る", C: P30a, sec: 11, move: "第1章の二本の物差しの図が戻る（同じ物差しは減らず、別の物差しは掛け算）" },
  { key: "30b", title: "教訓：二つの画面", C: P30b, sec: 9, move: "彼女の画面と相手の画面が向かい合う。相手の画面の欄が点線から実線に" },
  { key: "30c", title: "締めの一文", C: P30c, sec: 9, move: "二枚のふるいの下で2匹が向き合う。締めの一文" },
  { key: "31", title: "締めのひと言（毎回同じ）", C: P31, sec: 7, move: "共通のアニメーション（SignOff）。字幕なし" },
  { key: "32", title: "終了画面（共通）", C: P32, sec: 20, move: "共通の終了画面（EndScreen）：ゴサと教訓の1行。右に次の1本・再生リストの枠（YouTube Studio で要素を重ねる）。ナレーションなし、BGMだけ" },
];

const storyboard: StoryboardDef = { id: "003-normal-partner", title: "「普通の相手」の数（第2版）", panels };
export default storyboard;
