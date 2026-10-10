// 6本目「どこからが浮気？ 浮気の線がぴったり合う確率」の絵コンテ 第2版（2026-10-06。台本は script.md の第2稿・日本語の確認後）。
// 第2版：3役（アニメーター・イラストレーター・デザイナー）の見直しを反映（review/storyboard-summary.md）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（data/sb_secs.py で入れる）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。key は一覧の番号と同じ（01〜。並べた順に自動で付く）。
// 色の決まり（この回）：男女の色だけ（男性＝male、女性＝female）。人の濃い色＝その答えを選んだ人・残った組、淡い色＝そうでない人・消えた組。
//   性別でない区分（結婚の満足度など）は墨の濃さで分け、どの場面でも「あまり幸せでない＝墨（ink）」「まあ幸せ＝墨2（ink2）」「とても幸せ＝灰（rest）」。
//   金（C.gold）＝「線がそろった組・残った組」（2026-10-06 オーナー「OK。背景がうすいベージュなので目立てばいい」）。床を金で塗り、金の太い枠。食い違いは墨の枠。
// 左右：男性が左、女性が右（居間・組・グラフ・猫）。上下：重い行動が上（階段・横棒）。
// 物語の場面（居間・ドラマ・せりふ）は猫、データの人数は人型。同じ場面に混ぜない。テレビの中の人物は猫の形の影（壁の色）、ドラマの登場人物は灰の猫。
// 地図の比喩：ひとりの線＝1枚の地図の国境線（BorderMap）。どの地図にも同じ行動の目印。線の右（アウト）をその人の色で淡く塗る。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { BorderMap, FEMALE_LINE, MALE_LINE } from "@lib/BorderMap";
import { TodayCard } from "@lib/Cards";
import { Cat, CatLabel } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { Couple, CouplePairs, PeopleRows } from "@lib/CouplePairs";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { Facts, Note } from "@lib/Labels";
import { Sofa, Tv } from "@lib/Living";
import { LogRuler } from "@lib/LogRuler";
import { PairedBars } from "@lib/PairedBars";
import { PairedRows } from "@lib/PairedRows";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Bubble } from "@lib/StoryAnim";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
/** 見出し（header の決まり：幅1300まで。右上の章の点とぶつけない） */
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1300, ...font("question"), lineHeight: 1.2 }}>{children}</div>
);
const SubHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 150, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{children}</div>
);
/** 問いの札（字幕の帯 y920 より上に置く） */
const Ask: React.FC<{ text: string; x?: number }> = ({ text, x = 480 }) => <Note x={x} y={740} question text={text} />;
/** 100%の柱1本（濃い部分＝value）。値は濃い部分の上端の横に書く（柱全体の値に見えないように） */
const ShareCol: React.FC<{ x: number; y: number; h: number; value: number; text: string; color: string; tint: string; name: string }> = ({ x, y, h, value, text, color, tint, name }) => {
  const hv = (h * value) / 100;
  return (
    <g>
      <rect data-qa="mark" data-qa-label={`${name}：100%`} x={x} y={y} width={200} height={h} rx={R.sm} fill={tint} />
      <rect data-qa="mark" data-qa-allow="mark" data-qa-label={name} x={x} y={y + h - hv} width={200} height={hv} rx={R.sm} fill={color} />
      <line x1={x + 200} y1={y + h - hv} x2={x + 236} y2={y + h - hv} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={x + 248} y={y + h - hv + 20} style={font("value", color)}>{text}</text>
      <text x={x + 100} y={y + h + 52} textAnchor="middle" style={font("label")} fontWeight={900}>{name}</text>
      <text x={x - 12} y={y + 28} textAnchor="end" style={font("note", C.ink2)}>100%</text>
    </g>
  );
};

const SRC = {
  raison: "レゾンデートル「結婚と浮気に関する実態調査」2025年（既婚6,805人、既婚者向けサービスの会社の調査、複数回答）",
  raisonCalc: "レゾンデートル 2025年（既婚6,805人）の割合から計算。既婚者向けサービスの会社の調査",
  albona: "ALBONA「セカンドパートナーと浮気に関する実態調査」2023年（2,000人、複数回答）",
  osf: "Kulibert & Thompson 2019 の公開データ（米国の大人、男性272・女性282人）から計算。他人どうしを組ませた値",
  buss: "Buss ほか 1999（日本の大学生316人、1990年代の調査）",
  jp: "レゾンデートル 2025年（既婚者向けサービスの会社）、相模ゴム工業「ニッポンのセックス」2026年版",
  gss: "米国 General Social Survey（結婚したことがある人）。相関で、どちらが先かは分からない",
  gssMarried: "米国 General Social Survey 2010〜22年（いま既婚・離婚歴なし）。相関",
  raison2: "レゾンデートル 第2報 2025年（既婚の浮気経験者480人）、相模ゴム工業 2026年版",
  law: "民法770条1項1号、最高裁 昭和48年11月15日判決",
};

// ================= 居間（冒頭・第3章の入口・教訓で同じ部屋） =================
// 夜：壁に夜の色を薄く重ね、テレビの前だけ明るい。ソファは左寄り、テレビは右。彼（male）が左、彼女（female）が右。
const ROOM = { floor: 880, sofaX: 640, tvX: 1460, catY: 830, size: 4.2 };
type Mood = "watch" | "argue" | "ask" | "quiet" | "drama" | "end";
const LivingRoom: React.FC<{ mood?: Mood; tv?: "dinner" | "glow" | "blank"; children?: React.ReactNode }> = ({ mood = "watch", tv = "dinner", children }) => {
  const him = { watch: "normal", argue: "smile", ask: "surprised", quiet: "sad", drama: "smile", end: "normal" } as const;
  const her = { watch: "normal", argue: "think", ask: "think", quiet: "normal", drama: "think", end: "smile" } as const;
  const himTurn = { watch: 0.6, argue: 0.4, ask: 0.4, quiet: 0, drama: 0.4, end: 0.5 }[mood];
  const herTurn = { watch: 0.6, argue: 0.6, ask: -0.6, quiet: -0.6, drama: -0.4, end: -0.5 }[mood];
  const gap = mood === "quiet" ? 200 : mood === "end" ? 120 : 95;
  return (
    <>
      <Backdrop kind="room" night floor={ROOM.floor} variant={2} />
      <Svg>
        <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.28} />
        {tv !== "blank" && <path data-qa="bg" d={`M${ROOM.tvX - 180},${ROOM.floor - 250} L${ROOM.sofaX - 300},${ROOM.floor} L${ROOM.tvX + 120},${ROOM.floor} Z`} fill={C.white} opacity={0.12} />}
        <Tv x={ROOM.tvX} y={ROOM.floor} size={2.6} scene={tv} />
        <Sofa x={ROOM.sofaX} y={ROOM.floor} size={2.6} w={mood === "quiet" ? 220 : 180} />
        <Cat kind="male" x={ROOM.sofaX - gap} y={ROOM.catY} size={ROOM.size} pose="sit" face={him[mood]} turn={himTurn} look={mood === "quiet" ? [0, 0.6] : undefined} label="彼" />
        <Cat kind="female" x={ROOM.sofaX + gap} y={ROOM.catY} size={ROOM.size} pose="sit" face={her[mood]} turn={herTurn} label="彼女" seed={2} />
        {children}
      </Svg>
    </>
  );
};

export const S01: React.FC = () => (
  <AbsoluteFill><LivingRoom><CatLabel x={ROOM.sofaX - 95} y={ROOM.catY} size={ROOM.size} text="会社員（31）" /></LivingRoom></AbsoluteFill>
);
export const S02: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Svg>
      {/* テレビの画面に寄る：ドラマの1場面（夫と同僚の女性がふたりで夕食）。登場人物は灰の猫（主人公と別の色） */}
      <rect x={260} y={140} width={1400} height={720} rx={R.lg} fill={C.night} />
      <rect x={720} y={600} width={480} height={30} rx={8} fill={C.wall} />
      <rect x={760} y={630} width={20} height={150} fill={C.wall} /><rect x={1140} y={630} width={20} height={150} fill={C.wall} />
      <circle cx={900} cy={585} r={22} fill={C.white} /><circle cx={1020} cy={585} r={22} fill={C.white} />
      <Cat kind="other" x={640} y={780} size={5} pose="sit" face="smile" turn={0.5} label="ドラマの夫" seed={7} />
      <Cat kind="other" x={1280} y={780} size={5} pose="sit" face="smile" turn={-0.5} label="ドラマの同僚" seed={9} />
      <Label x={300} y={210} color={C.wall}>ドラマ「ふたりの夕食」</Label>
    </Svg>
  </AbsoluteFill>
);
export const S03: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="argue">
      <Bubble x={120} y={330} text="これはセーフでしょ" tail={[ROOM.sofaX - 95, 560]} />
      <Bubble x={720} y={330} text="アウト。完全に" tail={[ROOM.sofaX + 95, 560]} />
    </LivingRoom>
  </AbsoluteFill>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="ask" tv="glow">
      <Bubble x={700} y={260} text="先週の同期の子とのランチは？" tail={[ROOM.sofaX + 95, 560]} />
    </LivingRoom>
  </AbsoluteFill>
);
export const S05: React.FC = () => <AbsoluteFill><LivingRoom mood="quiet" tv="glow" /></AbsoluteFill>;

// ---- 冒頭の数字：手をつないだら浮気（女性 約半分・男性 約3割） ----
export const S06: React.FC = () => (
  <AbsoluteFill>
    <Heading>「手をつないだら浮気」と答えた人</Heading>
    <SubHead>既婚の男女 およそ7千人</SubHead>
    <Svg>
      <ShareCol x={520} y={250} h={480} value={29.7} text="約3割" color={C.male} tint={C.maleTint} name="男性" />
      <ShareCol x={1060} y={250} h={480} value={48.6} text="約半分" color={C.female} tint={C.femaleTint} name="女性" />
    </Svg>
    <SourceNote text={SRC.raison} />
  </AbsoluteFill>
);
// ---- くじで組ませると、2組に1組が食い違う（20組のうち10組。両方〇3・両方×7・男性だけ〇3・女性だけ〇7） ----
const LOT20: Couple[] = [
  [1, 1], [0, 0], [0, 1], [1, 0], [0, 0], [0, 1], [0, 1], [1, 1], [0, 0], [0, 1],
  [1, 0], [0, 0], [0, 1], [0, 0], [1, 1], [0, 1], [0, 0], [1, 0], [0, 0], [0, 1],
].map(([h, w]) => ({ husband: !!h, wife: !!w, mark: h !== w }));
export const S07: React.FC = () => (
  <AbsoluteFill>
    <Heading>くじで組ませた男女20組</Heading>
    <SubHead>濃い色＝「手をつないだら浮気」と答えた人</SubHead>
    <Svg>
      <CouplePairs x={190} y={420} items={LOT20} cols={10} size={1.6} gap={70} row={190} />
      <Label x={960} y={760} anchor="middle" size="value">黒い枠＝答えが食い違った組（10組）</Label>
    </Svg>
    <SourceNote text={SRC.raisonCalc} />
  </AbsoluteFill>
);
export const S08: React.FC = () => (
  <AbsoluteFill>
    <Heading>ふたりの基準が、ぜんぶそろう確率は？</Heading>
    <Svg>
      <BorderMap x={200} y={250} w={700} h={460} lines={[{ ...MALE_LINE, seed: 3 }]} label="彼の基準" labelColor={C.male} sides />
      <BorderMap x={1020} y={250} w={700} h={460} lines={[{ ...FEMALE_LINE, seed: 8, shift: -110 }]} label="彼女の基準" labelColor={C.female} sides />
    </Svg>
  </AbsoluteFill>
);

// ================= 今日の答え合わせ・予想タイム・順番 =================
const QUIZ_Q = "そろう組は、9万組に1組の何倍？";
const QUIZ_C = ["ほぼ同じ", "10倍ほど", "500倍ほど", "1万倍ほど"];
export const S09: React.FC = () => <AbsoluteFill><TodayCard claim="浮気の基準のずれは、男女の違い" /><Gosa cues={[[-60, "thinking"]]} size="M" foot={850} /></AbsoluteFill>;
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の前に：使うデータ</Heading>
    <Facts x={120} y={220} items={["アメリカの大人が答えた、公開のデータ", "32の行動を「浮気かどうか」7段階で採点（5以上を浮気）", "他人どうしの男女を、無作為に組ませる", "32の行動すべてで答えがそろうかを数える"]} />
    <Svg>
      <CouplePairs x={1300} y={640} items={Array.from({ length: 6 }, () => ({ husband: true, wife: true }))} cols={3} size={2} gap={60} row={150} />
    </Svg>
    <SourceNote text={SRC.osf} />
  </AbsoluteFill>
);
export const S11: React.FC = () => (
  <AbsoluteFill>
    <Quiz question={QUIZ_Q} choices={QUIZ_C} gosaFoot={850} />
  </AbsoluteFill>
);
export const S11b: React.FC = () => (
  <AbsoluteFill>
    <Heading>32の行動を、1つずつ掛け算すると</Heading>
    <Svg>
      <LogRuler x={230} y={560} width={1140} pins={[{ n: 87000, label: "掛け算：約9万組に1組", color: C.ink2 }]} />
      <Label x={700} y={800} anchor="middle" size="label">本当に32の行動すべてでそろう組は、9万組に1組の何倍？</Label>
    </Svg>
    <Gosa cues={[[-60, "thinking"]]} size="M" foot={850} />
  </AbsoluteFill>
);
export const S12: React.FC = () => {
  const cards = ["日本の人は、どこに線を引く？", "誰と誰の線がずれる？", "線を越える人は、男女で違う？"];
  return (
    <AbsoluteFill>
      <Heading>今日の順番</Heading>
      <Svg>
        {cards.map((t, i) => {
          const x = 120 + i * 580;
          return (
            <g key={t}>
              <rect x={x} y={220} width={520} height={560} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 40} y={300} size="value">{`第${i + 1}章`}</Label>
              {i === 0 && <g>{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={x + 90 + k * 40} y={600 - (k + 1) * 46} width={300} height={40} rx={6} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} />)}
                <line x1={x + 70} y1={466} x2={x + 470} y2={466} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="16 10" /></g>}
              {i === 1 && <BorderMap x={x + 90} y={360} w={340} h={250} marks={false} lines={[{ ...MALE_LINE, seed: 3 }, { ...FEMALE_LINE, seed: 8, shift: -50 }]} />}
              {i === 2 && <g><line x1={x + 260} y1={360} x2={x + 260} y2={620} stroke={C.ink} strokeWidth={LINE.heavy} strokeDasharray="20 12" />
                <Figure kind="male" x={x + 170} y={620} size={2.4} pose="walk" /><Figure kind="female" x={x + 350} y={620} size={2.4} pose="walk" facing={-1} /></g>}
              <Label x={x + 260} y={720} anchor="middle" size="note" weight={700}>{t}</Label>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 第1章：日本の線 =================
// 13の行動（軽い順）。階段・横棒・社会の線の場面で、重い行動を上にそろえる。
const ITEMS13 = [
  ["異性が接待するお店に行く", 11.3, 19.1], ["性風俗を利用する", 17.1, 30.8], ["ふたりきりで食事", 21.5, 34.3], ["頻繁に親しく連絡", 24.4, 34.9],
  ["ふたりきりで会う", 27.3, 40.1], ["パパ活・ママ活でデート", 30.6, 43.5], ["手をつなぐ", 29.7, 48.6], ["秘密にして会う", 32.2, 48.5],
  ["パパ活・ママ活で体の関係", 35.8, 49.2], ["頻繁にふたりきりで会う", 34.9, 52.1], ["恋愛感情を持つ", 35.0, 54.9], ["キスやハグ", 44.1, 59.8], ["体の関係を持つ", 54.4, 64.4],
] as const;
/** 階段（重い行動が上、上の段ほど右へずれる）。lineAt：その段の上に点線（あなたの線）。people：人ごとの短い線。law：いちばん上に法律の線 */
const Stairs: React.FC<{ lineAt?: number; law?: boolean; people?: { i: number; color: string }[] }> = ({ lineAt, law, people = [] }) => {
  const rowY = (i: number) => 830 - (i + 1) * 50;
  return (
    <g>
      {ITEMS13.map(([t], i) => {
        const x = 320 + i * 44, y = rowY(i);
        return (
          <g key={t}>
            <rect data-qa="mark" data-qa-label={`段：${t}`} x={x} y={y} width={700} height={44} rx={R.sm} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} />
            <text data-qa-allow="mark" x={x + 20} y={y + 33} style={font("note", C.ink)} fontWeight={700}>{t}</text>
          </g>
        );
      })}
      <Label x={300} y={rowY(12) + 34} anchor="end" color={C.ink2}>重い</Label>
      <Label x={300} y={rowY(0) + 34} anchor="end" color={C.ink2}>軽い</Label>
      {lineAt !== undefined && <>
        <line x1={260} y1={rowY(lineAt) - 3} x2={1840} y2={rowY(lineAt) - 3} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="22 14" />
        <Label x={1840} y={rowY(lineAt) - 14} anchor="end" size="label" weight={900}>あなたの基準は？</Label>
      </>}
      {people.map((p, k) => <line key={k} x1={1590 + k * 30} y1={rowY(p.i) - 3} x2={1590 + k * 30 + 22} y2={rowY(p.i) - 3} stroke={p.color} strokeWidth={LINE.heavy} strokeLinecap="round" />)}
      {law && <>
        <line x1={260} y1={rowY(12) - 3} x2={1840} y2={rowY(12) - 3} stroke={C.ink} strokeWidth={LINE.heavy} />
        <Label x={1840} y={rowY(12) - 22} anchor="end" weight={900}>法律の「不貞」</Label>
      </>}
    </g>
  );
};
export const S13: React.FC = () => (
  <AbsoluteFill>
    <Heading>どこから上が、浮気？</Heading>
    <Svg><Stairs lineAt={7} /></Svg>
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S14: React.FC = () => (
  <AbsoluteFill>
    <Heading>「浮気だ」と答えた割合（13の行動）</Heading>
    <PairedRows x={96} y={250} width={1728} rowH={44} labelW={560} max={70}
      rows={[...ITEMS13].reverse().map(([label, m, f]) => ({ label, male: m, female: f, focus: label === "手をつなぐ" || label === "恋愛感情を持つ" }))} />
    <SourceNote text={SRC.raison} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S15: React.FC = () => (
  <AbsoluteFill>
    <Heading>2千人の調査：差が最大は「気持ち」</Heading>
    <PairedRows x={96} y={270} width={1728} rowH={70} labelW={520} max={100}
      rows={[{ label: "性行為", male: 82.6, female: 85.9 }, { label: "キス", male: 72.5, female: 72.5, focus: true },
        { label: "手をつなぐ", male: 54.5, female: 59.4 }, { label: "デート", male: 49.0, female: 66.9 },
        { label: "気持ちが動いたら", male: 38.8, female: 71.3, focus: true }, { label: "ふたりきりで食事", male: 29.4, female: 39.2 },
        { label: "連絡をとる", male: 10.8, female: 24.6 }]} />
    <SourceNote text={SRC.albona} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
// 浮気にした行動の数（32のうち）の分布。4つずつ（最後は28以上）、それぞれの性別で100%（最大剰余で丸め）
const SPREAD = [
  { label: "0〜3", male: 2, female: 2 }, { label: "4〜7", male: 7, female: 2 }, { label: "8〜11", male: 20, female: 11 },
  { label: "12〜15", male: 41, female: 36 }, { label: "16〜19", male: 18, female: 25 }, { label: "20〜23", male: 6, female: 13 },
  { label: "24〜27", male: 5, female: 6 }, { label: "28以上", male: 1, female: 5 },
];
const SpreadChart: React.FC<{ step: 1 | 2 }> = ({ step }) => {
  const x = 160, w = 1600, slot = w / 8;
  const at = (mean: number) => x + slot * (mean / 4);
  return (
    <>
      <PairedBars x={x} y={340} width={w} height={340} max={45} rows={SPREAD} format={(v) => `${Math.round(v)}`} />
      <Svg>
        <Label x={1760} y={250} anchor="end" size="note" color={C.ink2}>それぞれの性別の中の割合（%）</Label>
        {/* 平均の印（男性14.0・女性16.4） */}
        {([[14.0, C.male, "男性の平均 14"], [16.4, C.female, "女性の平均 16"]] as const).map(([m, c, t], i) => (
          <g key={t}>
            <path d={`M${at(m)},${300} l-14,-24 h28 Z`} fill={c} />
            <text x={at(m) + (i ? 24 : -24)} y={292} textAnchor={i ? "start" : "end"} style={font("note", c)} fontWeight={900}>{t}</text>
          </g>
        ))}
        {step === 2 && <g>
          {/* 男性の10人中8人が入る幅（8〜20個） */}
          <path d={`M${at(8)},${770} v-16 H${at(20)} v16`} fill="none" stroke={C.male} strokeWidth={LINE.base} />
          <text x={(at(8) + at(20)) / 2} y={820} textAnchor="middle" style={font("label", C.male)} fontWeight={900}>男性の10人中8人：8〜20個</text>
        </g>}
      </Svg>
    </>
  );
};
export const S16: React.FC = () => (
  <AbsoluteFill>
    <Heading>32の行動のうち、いくつを浮気に？</Heading>
    <SpreadChart step={1} />
    <SourceNote text={SRC.osf} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S16b: React.FC = () => (
  <AbsoluteFill>
    <Heading>平均の差は2つ。同じ性別の中の幅は12</Heading>
    <SpreadChart step={2} />
    <SourceNote text={SRC.osf} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cat kind="male" x={620} y={640} size={5} face="smile" turn={0.3} label="ゆるい？" seed={6} />
      <Cat kind="female" x={1300} y={640} size={5} face="think" turn={-0.3} label="厳しい？" seed={4} />
      <Label x={620} y={200} anchor="middle" size="value" color={C.male}>ゆるい男性？</Label>
      <Label x={1300} y={200} anchor="middle" size="value" color={C.female}>厳しい女性？</Label>
      <Label x={960} y={440} anchor="middle" size="hero">？</Label>
    </Svg>
    <Ask text="男性どうしなら、基準はそろう？" x={560} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);

// ================= 第2章：誰と誰がずれる =================
/** 同性どうし・男女の組（10組）。1組＝肩を接した2人＋台。食い違った組は墨の太い枠。濃い色＝浮気だと答えた人 */
const PairRow: React.FC<{ x: number; y: number; kind: "male" | "female" | "mix"; pattern: [number, number][]; title: string; odd: number }> = ({ x, y, kind, pattern, title, odd }) => (
  <g>
    <Label x={x - 40} y={y - 4} anchor="end" weight={900} color={kind === "male" ? C.male : kind === "female" ? C.female : C.ink}>{title}</Label>
    {pattern.map(([a, b], i) => {
      const px = x + i * 104, ka = kind === "female" ? "female" : "male", kb = kind === "male" ? "male" : "female";
      return (
        <g key={i}>
          {a !== b && <rect data-qa="bg" x={px - 22} y={y - 76} width={84} height={92} rx={R.sm} fill="none" stroke={C.ink} strokeWidth={LINE.base} />}
          <rect data-qa="bg" x={px - 18} y={y - 3} width={76} height={12} rx={4} fill={C.paper2} />
          <Figure kind={ka} x={px} y={y} size={1.3} dim={!a} />
          <Figure kind={kb} x={px + 39} y={y} size={1.3} dim={!b} />
        </g>
      );
    })}
    <Label x={x + 1060} y={y - 10} size="value">{`10組に${odd}組`}</Label>
  </g>
);
export const S18: React.FC = () => (
  <AbsoluteFill>
    <Heading>手をつなぐのは浮気？ 食い違う組</Heading>
    <SubHead>濃い色＝浮気だと答えた人。黒い枠＝食い違った組（日本の割合から計算）</SubHead>
    <Svg>
      <PairRow x={400} y={380} kind="mix" title="男女" odd={5} pattern={[[1, 1], [0, 1], [0, 0], [1, 0], [0, 1], [0, 0], [1, 1], [0, 1], [0, 0], [0, 1]]} />
      <PairRow x={400} y={560} kind="male" title="男性どうし" odd={4} pattern={[[0, 0], [1, 0], [0, 0], [0, 1], [1, 1], [0, 0], [0, 1], [0, 0], [1, 0], [0, 0]]} />
      <PairRow x={400} y={740} kind="female" title="女性どうし" odd={5} pattern={[[1, 1], [0, 1], [0, 0], [1, 0], [1, 1], [0, 0], [0, 1], [1, 0], [0, 0], [1, 0]]} />
    </Svg>
    <SourceNote text={SRC.raisonCalc} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const ODD9 = [2, 5, 9, 12, 14, 19, 23, 26, 30];
export const S19: React.FC = () => (
  <AbsoluteFill>
    <Heading>あなたと男友達、32の行動の答え</Heading>
    <Svg>
      <Cat kind="male" x={330} y={680} size={4.4} face="normal" turn={0.4} label="あなた" />
      <Cat kind="male" x={660} y={680} size={4.4} face="smile" turn={-0.4} label="男友達" seed={3} />
      <Label x={330} y={750} anchor="middle" color={C.male} weight={900}>あなた</Label>
      <Label x={660} y={750} anchor="middle" color={C.male} weight={900}>男友達</Label>
      {Array.from({ length: 32 }, (_, i) => {
        const x = 940 + (i % 8) * 100, y = 230 + Math.floor(i / 8) * 104;
        const odd = ODD9.includes(i);
        return <rect key={i} data-qa="mark" data-qa-label={`行動${i + 1}`} x={x} y={y} width={84} height={88} rx={R.sm}
          fill={odd ? C.ink : C.white} stroke={C.ink} strokeWidth={LINE.hair} />;
      })}
      <Label x={940} y={700} size="value">32のうち、平均9つが食い違う</Label>
      <Label x={940} y={770} size="note" color={C.ink2}>黒いマス＝答えが食い違った行動。男女の組とほぼ同じ数</Label>
    </Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <Heading>割れる行動は、性別で違う</Heading>
    <SubHead>他人どうしを組ませたとき（体は男性どうし、心は女性どうしで割れやすい）</SubHead>
    <PairedBars x={300} y={330} width={1300} height={380} max={50} names={["男性どうし", "女性どうし"]}
      rows={[{ label: "体の大事なところに触れる", male: 22.4, female: 10.1 }, { label: "心の支えになる", male: 27.1, female: 43.2 }]} />
    <Svg><Label x={1600} y={250} anchor="end" color={C.ink2} size="note">答えが食い違う確率</Label></Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S22: React.FC = () => (
  <AbsoluteFill>
    <Heading>「心の浮気のほうがつらい」と答えた人</Heading>
    <SubHead>1990年代の日本の大学生（「男性は体、女性は心」と言われるが）</SubHead>
    <Svg>
      <ShareCol x={520} y={260} h={460} value={62} text="6割" color={C.male} tint={C.maleTint} name="男子学生" />
      <ShareCol x={1060} y={260} h={460} value={87} text="9割" color={C.female} tint={C.femaleTint} name="女子学生" />
    </Svg>
    <SourceNote text={SRC.buss} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S23: React.FC = () => (
  <AbsoluteFill>
    <Heading>ひとりひとりが、自分の地図を持つ</Heading>
    <Svg>
      <BorderMap x={110} y={280} w={520} h={380} lines={[{ ...MALE_LINE, seed: 3, shift: 40 }]} label="男性Aの基準" labelColor={C.male} tilt={-2} />
      <BorderMap x={700} y={280} w={520} h={380} lines={[{ ...FEMALE_LINE, seed: 8, shift: -80 }]} label="女性Bの基準" labelColor={C.female} />
      <BorderMap x={1290} y={280} w={520} h={380} lines={[{ ...MALE_LINE, seed: 21, shift: -140 }]} label="男性Cの基準" labelColor={C.male} tilt={2} />
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);
// ---- はしご：100組（10×10）を32の行動でふるう。右に「線」の帯 ----
/** remain：3段目で、まだ消えていない組の数（動画で 100→0 と数え下げる。絵コンテは 0）。37番の組は最後まで残る */
export const Ladder: React.FC<{ step: 1 | 2 | 3; remain?: number }> = ({ step, remain = 0 }) => {
  const steps = ["全員が同じ線", "男女で1本ずつ（多数決）", "ひとりひとりの線"];
  const items: Couple[] = Array.from({ length: 100 }, (_, i) => (step < 3 || i === 37 ? { husband: true, wife: true, gold: true, goldFrame: step === 3 && remain === 0 }
    : i < remain ? { husband: true, wife: true, gold: true } : { husband: false, wife: false }));
  return (
    <>
      <SimBackground />
      <Heading>{steps[step - 1]}</Heading>
      <SubHead>32の行動のうち、一つでもずれた組を消す（男女100組）</SubHead>
      <Svg>
        <CouplePairs x={180} y={262} items={items} cols={10} size={1.0} gap={36} row={54} />
        <rect x={1260} y={250} width={520} height={460} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={1520} y={300} anchor="middle" size="note" color={C.ink2}>みんなの線</Label>
        {step === 1 && <line x1={1300} y1={480} x2={1740} y2={480} stroke={C.ink} strokeWidth={LINE.heavy} />}
        {step === 2 && <>
          <line x1={1300} y1={480} x2={1740} y2={480} stroke={C.male} strokeWidth={LINE.heavy} />
          <line x1={1300} y1={480} x2={1740} y2={480} stroke={C.female} strokeWidth={LINE.heavy} strokeDasharray="24 24" />
          <Label x={1520} y={560} anchor="middle" size="note">男性の線＝女性の線</Label>
        </>}
        {step === 3 && Array.from({ length: 24 }, (_, k) => (
          <line key={k} x1={1300} y1={340 + ((k * 37) % 330)} x2={1740} y2={330 + ((k * 53) % 340)} stroke={k % 2 ? C.male : C.female} strokeWidth={LINE.hair} />
        ))}
        <rect x={160} y={760} width={1620} height={64} rx={R.md} fill={C.ink} stroke={C.gold} strokeWidth={LINE.base} />
        <text x={970} y={805} textAnchor="middle" style={font("label", C.white)}>
          {step < 3 ? "残った組：100組" : remain > 0 ? `残った組：${remain + 1}組` : "残った組：100組に1組もない（平均0.6組＝約170組に1組）"}
        </text>
      </Svg>
      <SourceNote sim text="Kulibert & Thompson 2019 の公開データから計算" />
      <ChapterDots current={2} />
    </>
  );
};
export const S24: React.FC = () => <AbsoluteFill><Ladder step={1} /></AbsoluteFill>;
export const S25: React.FC = () => <AbsoluteFill><Ladder step={2} /></AbsoluteFill>;
export const S26: React.FC = () => <AbsoluteFill><Ladder step={3} /></AbsoluteFill>;
export const S27: React.FC = () => (
  <AbsoluteFill>
    <Heading>社会の線は、奥に1本だけ</Heading>
    <Svg><Stairs law people={[{ i: 2, color: C.female }, { i: 6, color: C.male }, { i: 4, color: C.female }, { i: 9, color: C.male }, { i: 7, color: C.female }, { i: 11, color: C.male }, { i: 5, color: C.male }, { i: 3, color: C.female }]} /></Svg>
    <SourceNote text={SRC.law} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S28: React.FC = () => {
  const bars: [string, number, string][] = [["そろえない", 0.61, "170組に1組"], ["無作為に3つそろえる", 0.83, "120組に1組"], ["食い違いやすい3つをそろえる", 1.56, "60組に1組"]];
  return (
    <AbsoluteFill>
      <SimBackground />
      <Heading>3つの行動の答えを、先にそろえたら</Heading>
      <SubHead>32の行動すべてがそろう組（男女）</SubHead>
      <Svg>
        {bars.map(([t, v, s], i) => {
          const x = 260 + i * 500, h = v * 260;
          return (
            <g key={t}>
              <rect data-qa="mark" data-qa-label={t} x={x} y={720 - h} width={220} height={h} rx={R.sm} fill={i === 2 ? C.gold : C.goldTint} stroke={C.gold} strokeWidth={LINE.thin} />
              <text x={x + 110} y={700 - h} textAnchor="middle" style={font("value")}>{s}</text>
              <text x={x + 110} y={780} textAnchor="middle" style={font("note")} fontWeight={700}>{t}</text>
            </g>
          );
        })}
      </Svg>
      <SourceNote sim text="そろえた行動は必ず一致すると決めた計算" />
      <ChapterDots current={2} />
    </AbsoluteFill>
  );
};
export const S29: React.FC = () => (
  <AbsoluteFill>
    <Heading>食い違いやすいのは、意見が割れる行動</Heading>
    <PairedRows x={96} y={320} width={1728} rowH={96} labelW={700} max={100}
      rows={[{ label: "マッチングサイトを一人で眺める", male: 56.2, female: 66.0 }, { label: "好意のメッセージを受け取る", male: 60.3, female: 77.0 },
        { label: "暗い部屋でふたりで映画", male: 22.1, female: 35.1 }, { label: "体の関係（くらべる）", male: 91.5, female: 93.3 }]} />
    <Svg><Label x={96} y={240} size="note" color={C.ink2}>「浮気だ」と答えた割合。半々に近い行動ほど、ふたりの答えが食い違う</Label></Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S30: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <line x1={960} y1={160} x2={960} y2={660} stroke={C.ink} strokeWidth={LINE.heavy} strokeDasharray="28 16" />
      <Figure kind="male" x={760} y={660} size={5} pose="walk" />
      <Figure kind="female" x={1160} y={660} size={5} pose="walk" facing={-1} />
    </Svg>
    <Ask text="実際に浮気をする人は、男女で違う？" x={560} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);

// ================= 第3章：線を越える人 =================
export const S31: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="drama" tv="dinner">
      <Bubble x={120} y={330} text="やっぱり、男はそういうもんでしょ" tail={[ROOM.sofaX - 95, 560]} />
    </LivingRoom>
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S32: React.FC = () => (
  <AbsoluteFill>
    <Heading>結婚後に浮気をした人（日本）</Heading>
    <SubHead>100人あたり。ふたつの調査とも、男性が女性の2倍ほど</SubHead>
    <Svg>
      <Label x={120} y={330} weight={900} color={C.male}>男性</Label>
      <PeopleRows x={300} y={310} kind="male" n={100} on={22} cols={25} dx={44} dy={56} size={1} />
      <Label x={120} y={610} weight={900} color={C.female}>女性</Label>
      <PeopleRows x={300} y={590} kind="female" n={100} on={11} cols={25} dx={44} dy={56} size={1} />
      <Label x={1700} y={400} anchor="end" size="value" color={C.male}>約2割</Label>
      <Label x={1700} y={680} anchor="end" size="value" color={C.female}>約1割</Label>
    </Svg>
    <SourceNote text={SRC.jp} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** 昔の60代といまの60代、男女50人ずつ（濃い色＝浮気の経験がある人。100人あたりの値の半分の人数） */
export const S33: React.FC = () => (
  <AbsoluteFill>
    <Heading>昔の60代と、いまの60代（アメリカ）</Heading>
    <SubHead>結婚中に浮気をしたことがある人。男女の差が縮んだ</SubHead>
    <Svg>
      {([["1990年代の60代", 24, 9, "男性は女性の約3倍"], ["2010年代の60代", 22, 15, "約1.5倍"]] as const).map(([t, m, f, r], i) => {
        const x0 = 140 + i * 860;
        return (
          <g key={t}>
            <Label x={x0} y={270}>{t}</Label>
            <Label x={x0 + 700} y={270} anchor="end" weight={900}>{r}</Label>
            <PeopleRows x={x0 + 20} y={360} kind="male" n={50} on={Math.round(m / 2)} cols={25} dx={28} dy={56} size={0.75} />
            <PeopleRows x={x0 + 20} y={520} kind="female" n={50} on={Math.round(f / 2)} cols={25} dx={28} dy={56} size={0.75} />
            <Label x={x0} y={690} color={C.male} size="note" weight={900}>{`男性 ${m}%`}</Label>
            <Label x={x0 + 240} y={690} color={C.female} size="note" weight={900}>{`女性 ${f}%`}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text={SRC.gss} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
  <AbsoluteFill>
    <Heading>いまの若い世代では、ほぼ同じ</Heading>
    <SubHead>結婚したことがある18〜29歳（米国）。浮気の経験</SubHead>
    <PairedBars x={620} y={330} width={680} height={380} max={30} rows={[{ label: "18〜29歳", male: 8.2, female: 8.6 }]} />
    <Svg><Label x={1340} y={600} color={C.ink2} size="note">若い人は、結婚している年数がまだ短い</Label></Svg>
    <SourceNote text={SRC.gss} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
const HAPPY = [["とても幸せ", C.rest], ["まあ幸せ", C.ink2], ["あまり幸せでない", C.ink]] as const;
export const S36: React.FC = () => {
  const vals = [6.4, 12.6, 24.4];
  return (
    <AbsoluteFill>
      <Heading>結婚の満足度で分けると</Heading>
      <SubHead>結婚中に浮気をしたことがある人（いま既婚・離婚歴なし）</SubHead>
      <Svg>
        {HAPPY.map(([t, c], i) => {
          const x = 300 + i * 480, h = vals[i] * 18;
          return (
            <g key={t}>
              <rect data-qa="mark" data-qa-label={t} x={x} y={740 - h} width={240} height={h} rx={R.sm} fill={c} />
              <text x={x + 120} y={720 - h} textAnchor="middle" style={font("value")}>{`${Math.round(vals[i])}%`}</text>
              <text x={x + 120} y={800} textAnchor="middle" style={font("label")}>{t}</text>
            </g>
          );
        })}
      </Svg>
      <SourceNote text={SRC.gssMarried} />
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};
/** 浮気の経験がある人100人を、幸福度で並べ直す（44.4・47.3・8.2% を最大剰余で丸めて 45・47・8） */
export const S37: React.FC = () => {
  const n = [45, 47, 8];
  return (
    <AbsoluteFill>
      <Heading>浮気した人を、100人に縮めると</Heading>
      <SubHead>自分の結婚をどう答えたか（いま既婚・離婚歴なし）</SubHead>
      <Svg>
        {HAPPY.map(([t, c], gi) => {
          const x0 = 140 + gi * 600;
          return (
            <g key={t}>
              {Array.from({ length: n[gi] }, (_, i) => <Figure key={i} kind="other" color={c} x={x0 + (i % 10) * 50} y={340 + Math.floor(i / 10) * 74} size={1.3} />)}
              <text x={x0} y={726} style={font("label")} fontWeight={900}>{`${t}　${n[gi]}人`}</text>
            </g>
          );
        })}
        <path d={`M140,750 v14 H1190 v-14`} fill="none" stroke={C.ink} strokeWidth={LINE.base} />
        <Label x={665} y={812} anchor="middle" size="label" weight={900}>9割は「幸せ」と答えていた</Label>
      </Svg>
      <SourceNote text={SRC.gssMarried} />
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};
const Desk: React.FC = () => (
  <g transform="translate(1500,600)">
    <rect x={-120} y={-20} width={240} height={14} rx={4} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
    <rect x={-60} y={-96} width={120} height={70} rx={6} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
  </g>
);
export const S38: React.FC = () => (
  <AbsoluteFill>
    <Heading>日本の浮気の経験者が答えた理由と場所</Heading>
    <Svg>
      {[["なんとなく、その場の雰囲気で", 29.0], ["夫婦関係が悪いから", 7.3]].map(([t, v], i) => (
        <g key={t as string}>
          <text x={120} y={300 + i * 110} style={font("label")}>{t}</text>
          <rect data-qa="mark" data-qa-label={t as string} x={760} y={260 + i * 110} width={(v as number) * 22} height={56} rx={R.sm} fill={C.ink} />
          <text x={780 + (v as number) * 22} y={304 + i * 110} style={font("value")}>{`${v}%`}</text>
        </g>
      ))}
      <rect x={120} y={480} width={1680} height={2} fill={C.rest} />
      {/* 出会った場所の1位：職場。机の絵は伝わらなかったので、上の理由と同じ棒にした（2026-10-10 オーナー） */}
      <text x={120} y={570} style={font("label")}>浮気の相手と出会った場所：職場</text>
      <rect data-qa="mark" data-qa-label="職場" x={760} y={530} width={40.2 * 22} height={56} rx={R.sm} fill={C.ink} />
      <text x={780 + 40.2 * 22} y={574} style={font("value")}>40.2%</text>
      <text x={120} y={720} style={font("note", C.ink2)}>男女別の理由：性欲 男性32%・女性18%／相手を好きになった 女性26%・男性20%</text>
    </Svg>
    <SourceNote text={SRC.raison2} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** まとめ：ここまでの3つの絵を小さく並べる（文字だけの画面にしない） */
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>平均の差はある。それでも</Heading>
    <Svg>
      <rect x={120} y={220} width={520} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <PeopleRows x={170} y={330} kind="male" n={20} on={4} cols={10} dx={44} dy={56} size={1} />
      <PeopleRows x={170} y={460} kind="female" n={20} on={2} cols={10} dx={44} dy={56} size={1} />
      <Label x={380} y={640} anchor="middle" size="note" weight={900}>浮気の経験は男性に多い</Label>
      <rect x={700} y={220} width={520} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={790} y={540} width={120} height={40} rx={6} fill={C.rest} /><rect x={1000} y={420} width={120} height={160} rx={6} fill={C.ink} />
      <Label x={960} y={640} anchor="middle" size="note" weight={900}>不幸な結婚に多い</Label>
      <rect x={1280} y={220} width={520} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.heavy} />
      {Array.from({ length: 20 }, (_, i) => <Figure key={i} kind="other" color={i < 18 ? C.rest : C.ink} x={1340 + (i % 10) * 44} y={350 + Math.floor(i / 10) * 70} size={1} />)}
      <Label x={1540} y={590} anchor="middle" size="note" weight={900}>それでも、浮気した人の</Label>
      <Label x={1540} y={640} anchor="middle" size="note" weight={900}>9割は「幸せ」な結婚の中</Label>
    </Svg>
    <ChapterDots current={3} />
  </AbsoluteFill>
);

// ================= 答え合わせ =================
export const S40: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="平均では、女性のほうが軽い行動から数える" mark="〇"
      reason={["日本の7千人：13の行動\nすべてで女性が上", "別の調査（2千人）でも\n向きは同じ"]} />
  </AbsoluteFill>
);
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="基準のずれは、男女の違いから" mark="×"
      reason={["男性どうし・女性どうしでも\n男女と同じだけずれる", "男女の差より、同じ性別の\n中の幅のほうがずっと大きい"]} />
  </AbsoluteFill>
);
export const S42: React.FC = () => (
  <AbsoluteFill>
    <Quiz question={QUIZ_Q} choices={QUIZ_C} answer={2} reveal gosaFoot={850} />
    <SourceNote prefix="" text="実際は約170組に1組、掛け算は約9万組に1組（米国の公開データ）" />
  </AbsoluteFill>
);
export const S43: React.FC = () => (
  <AbsoluteFill>
    <Heading>掛け算より、500倍ほど多くそろう</Heading>
    <Svg>
      <LogRuler x={260} y={420} width={1400} pins={[{ n: 170, label: "実際：約170組に1組", strong: true, color: C.gold }, { n: 87000, label: "掛け算：約9万組に1組", color: C.ink2 }]}
        span={{ from: 170, to: 87000, text: "約500倍" }} />
      <Label x={960} y={790} anchor="middle" size="label">厳しい人は、だいたいどの行動にも厳しい</Label>
    </Svg>
    <SourceNote text={SRC.osf} />
  </AbsoluteFill>
);

/** 32の行動すべてで答えがそろう男女：170組に1組（予想タイムをやめた代わりに、判定の最後でタイトルの数字を見せる。2026-10-10） */
export const S43b: React.FC = () => (
  <AbsoluteFill>
    <Heading>全部そろうのは、170組に1組</Heading>
    <SubHead>知らない男女をくじで組ませて、32の行動すべてで「浮気かどうか」の答えがそろう組</SubHead>
    <Svg>
      <CouplePairs x={150} y={330} items={Array.from({ length: 170 }, (_, i) => ({ husband: i === 169, wife: i === 169, gold: i === 169, goldFrame: i === 169 }))} cols={17} size={0.9} gap={42} row={52} />
    </Svg>
    <SourceNote text={SRC.osf} />
  </AbsoluteFill>
);

// ================= 教訓 =================
export const S44: React.FC = () => <AbsoluteFill><LivingRoom mood="end" tv="blank" /></AbsoluteFill>;
export const S45: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      {/* 2枚の地図を重ねる：どちらの線もなめらかで筋が通っているが、交わらず、重ならない（同じ形を左右にずらす） */}
      <BorderMap x={460} y={160} w={1000} h={580} lines={[{ ...MALE_LINE, seed: 3, shift: 90 }, { ...FEMALE_LINE, seed: 3, shift: -90 }]} />
      <Label x={960} y={830} anchor="middle" size="label">ひとりの地図には、筋が通っている。</Label>
      <Label x={960} y={890} anchor="middle" size="label">それでも、ふたりの地図は重ならない。</Label>
    </Svg>
  </AbsoluteFill>
);
export const S46: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const P: Omit<Panel, "key">[] = [
  { title: "冒頭：夜の居間、ドラマを見るふたり", C: S01, sec: 10.3, lines: "金曜の夜、部屋の明かりを", move: "夜の窓から部屋へ引く。テレビの光が床にゆれる。名札（会社員（31））は1.5秒" },
  { title: "冒頭：ドラマの画面（夫と同僚の夕食）", C: S02, sec: 6.0, lines: "画面の中では、結婚している", move: "テレビの画面に寄る（画面いっぱいへ）。ドラマの2匹（灰の猫）がグラスを上げる" },
  { title: "冒頭：「セーフ」「アウト」", C: S03, sec: 10.1, lines: "彼は「これはセーフでしょ」", move: "居間に戻る。彼の吹き出し→彼女が首を振り（左右に2回）、吹き出し。ふたりが顔を見合わせる" },
  { title: "冒頭：先週のランチは？", C: S04, sec: 13.0, lines: "それから、少しだけ黙って", move: "彼女がゆっくり彼を見る。吹き出し。彼の目が丸くなる" },
  { title: "冒頭：静かになった部屋", C: S05, sec: 7.1, lines: "やましいことは、何もありません", move: "彼女が窓の方へ顔をそらし、ソファの端へ寄る。彼は下を向く。テレビの光だけが点滅" },
  { title: "最初の数字：手をつないだら浮気", C: S06, sec: 10.9, lines: "既婚の男女、およそ七千人", move: "男性の柱、女性の柱の順に濃い部分が下から伸びる。値（約3割・約半分）が濃い部分の端に出る" },
  { title: "くじで組むと、2組に1組が食い違う", C: S07, sec: 11.7, lines: "男女の差は、2割ほどです", move: "男女が1人ずつ箱から引かれて組になる（20組）。食い違った組に1組ずつ墨の枠（10組まで数える）" },
  { title: "問い：ぜんぶそろう確率は？", C: S08, sec: 16.7, lines: "意見が半々に割れている", move: "2枚の地図が左右から出る（同じ目印）。国境線が上から引かれ、アウト側が淡く塗られる" },
  { title: "今日の答え合わせ", C: S09, sec: 7.2, lines: "今日の答え合わせは、この説", move: "共通のカード" },
  { title: "予想の前に：使うデータ", C: S10, sec: 19.0, lines: "予想の前に、使うデータを", move: "条件の札が1つずつ出る。右下に組が6組並ぶ" },
  { title: "予想の前：掛け算の数", C: S11b, sec: 10.0, lines: "それを32個、掛け算すると", move: "対数のものさしに「掛け算：約9万組に1組」のピンが立つ。下に「この何倍？」。ゴサが考える顔" },
  { title: "予想タイム（4択：何倍か）", C: S11, sec: 19.3, lines: "予想してみてください。", move: "共通の予想タイム。A と D には説明の小さな札。3秒の輪" },
  { title: "今日の順番", C: S12, sec: 16.9, lines: "今日は、三つの順に", move: "3枚の札が左から並ぶ（階段・地図・線の両側の男女）。最後に1枚目が拡大して第1章の扉へ" },
  { title: "第1章：13の行動の階段、自分の線を引く", C: S13, sec: 29.5, lines: "まず、日本の線です。", move: "第1章の扉 → 段が下から1段ずつ積まれる（重い行動が上）。点線（あなたの線）が上下にゆれて止まる。一時停止を促す間" },
  { title: "13の行動、男女の割合", C: S14, sec: 12.3, lines: "〔間・長〕さきほどの七千人", move: "階段の段がそのまま横棒の行に変わる（上下の順は同じ）。男性→女性の棒が伸びる。全行で女性が長い" },
  { title: "2千人の調査：気持ちとキス", C: S15, sec: 29.9, lines: "別の会社の、2000人の調査", move: "横棒が出る。「気持ちが動いたら」の行の差に墨の括弧。「キス」は男女同じ長さ。最後の文で全行の女性の棒が少し脈打つ" },
  { title: "ひとりひとりの散らばり：平均", C: S16, sec: 15.0, lines: "それなら、ひとりひとりの線は", move: "男女の山が下から出る。平均の印が2つ、少しずれて落ちる（14と16）" },
  { title: "ひとりひとりの散らばり：幅", C: S16b, sec: 15.2, lines: "ところが、同じ男性の中でも", move: "男性の山の下に括弧が伸びる（8〜20個）。平均の差（2つ）と幅（12）を並べて見せる" },
  { title: "先回り：ゆるい男性と厳しい女性？", C: S17, sec: 19.0, lines: "それでも、平均の差を聞くと", move: "2匹の猫に「ゆるい？」「厳しい？」の札 → 札が消えて「？」。問いの札" },
  { title: "第2章：同性どうしでも食い違う", C: S18, sec: 19.2, lines: "さきほどの日本の割合で", move: "第2章の扉 → 男女の組 → 男性どうし → 女性どうしの順に、食い違った組に墨の枠" },
  { title: "あなたと男友達：32のうち9つ", C: S19, sec: 20.6, lines: "仲のいい男友達を", move: "2匹の猫が並ぶ。32のマスが1つずつ開き、食い違ったマスが墨に（9つ）" },
  { title: "割れる行動：男性どうしは体、女性どうしは心", C: S21, sec: 18.0, lines: "ただし、答えが割れる行動は", move: "見出し → 体の行の棒（男性どうしが長い）→ 心の行で逆になる" },
  { title: "「男性は体、女性は心」：1990年代の日本の学生", C: S22, sec: 16.5, lines: "「男性は体の浮気、女性は心", move: "2本の柱の濃い部分が伸びる。男子学生の柱の端に「6割」" },
  { title: "比喩：自分だけの地図", C: S23, sec: 24.9, lines: "たとえるなら、ひとりひとりが", move: "3枚の地図が配られるように落ちてきて（同じ目印）、それぞれ違う位置に国境線が引かれる" },
  { title: "はしご1：全員が同じ線", C: S24, sec: 14.8, lines: "ここから、100組の男女を", move: "方眼の背景。100組（10×10）が並ぶ。右の帯に1本の線。どの組も消えない" },
  { title: "はしご2：男女で1本ずつの線", C: S25, sec: 18.6, lines: "次は、男性は男性の多数決", move: "右の帯で線が男性・女性の2本に分かれようとして、ぴったり重なる。短い間 → 1組も消えない（全組が小さく跳ねる）" },
  { title: "はしご3：ひとりひとりの線", C: S26, sec: 15.0, lines: "最後に、ひとりひとりの", move: "右の帯の線がばらける。組が1組ずつ抜けて淡くなる（残りの数を数え下げる）。最後の1組を光らせ「平均0.6組」" },
  { title: "社会の線は奥に1本", C: S27, sec: 10.6, lines: "ちなみに、法律で「不貞」", move: "階段の右に人ごとの短い線（男女の色）がばらばらの高さに引かれ、最後にいちばん上の段の上に墨の太い線が1本" },
  { title: "ミクロ：3つ先にそろえたら", C: S28, sec: 19.3, lines: "もう一度、100組の計算です。", move: "3本の棒。無作為はわずかに伸びるだけ → 食い違いやすい3つは2倍半に伸びる" },
  { title: "食い違いやすい灰色の行動", C: S29, sec: 13.8, lines: "食い違いやすいのは、体の関係", move: "体の関係の行（ほぼ全員が浮気）を先に出し、その上に半々に近い3つの行が出る" },
  { title: "次の問い：線を越える人は？", C: S30, sec: 11.3, lines: "ここまでは、線を引くときの", move: "太い点線の左右に男女が歩いてくる。問いの札" },
  { title: "第3章：ドラマの続き、彼の台詞", C: S31, sec: 17.0, lines: "冒頭のドラマに戻ります。", move: "第3章の扉 → 居間。テレビの中で2匹の影が寄り添う（画面だけ）。彼の吹き出し、彼女はジト目で画面の外へ" },
  { title: "日本：男性 約2割・女性 約1割", C: S32, sec: 19.5, lines: "日本で結婚後に浮気を", move: "男性100人・女性100人が並び、浮気の経験がある人が左上から濃くなる" },
  { title: "1990年代と2010年代の60代：約3倍 → 約1.5倍", C: S33, sec: 17.0, lines: "ただ、この差は", move: "左（1990年代）の男女50人ずつが灯る → 右（2010年代）で女性の灯りが増えて差が縮む" },
  { title: "いまの若い世代：ほぼ同じ", C: S35, sec: 14.0, lines: "いまの若い世代では", move: "見出し → 2本の棒がほぼ同じ高さまで伸びる。条件の注記" },
  { title: "満足度で分けると4倍", C: S36, sec: 19.8, lines: "次に、男女ではなく", move: "3本の棒が左から伸びる（灰・墨2・墨）。右端に「4人に1人」" },
  { title: "数え直し：浮気経験者の9割は「幸せ」", C: S37, sec: 17.8, lines: "〔間〕ところが、浮気をした", move: "前の棒の中から人が出てきて100人に縮み、幸福度ごとに並び直す（左の2群が大きい）。括弧と「9割」" },
  { title: "日本：理由と出会った場所", C: S38, sec: 26.7, lines: "日本の、浮気をしたことがある", move: "理由の棒2本 → 区切り線 → 職場の机の絵と「約4割」" },
  { title: "まとめ：平均の差はある。それでも", C: S39, sec: 21.0, lines: "平均で見れば、浮気の経験は", move: "第3章の3つの絵が小さくなって並ぶ（男女・満足度・9割）。3枚目の枠が太くなる。最後の2文で今日の説の札が上から下りてくる" },
  { title: "答え合わせ（前半：〇）", C: S40, sec: 13.4, lines: "浮気の線のずれは、男性と", move: "共通の判定。証拠2つ → 〇" },
  { title: "答え合わせ（後半：×）", C: S41, sec: 21.8, lines: "2つ目の証拠。", move: "前の判定が左上に小さく残り、後半の判定。証拠2つ → ×" },
  { title: "予想の答え：C", C: S42, sec: 9.1, lines: "〔間〕そして、予想タイムの答え", move: "予想の4択に戻り、C（500倍ほど）を塗る（選択肢は残す）" },
  { title: "掛け算の500倍：ひとりの線には筋がある", C: S43, sec: 19.9, lines: "掛け算の数よりずっと多いのは", move: "予想のものさし（12）に戻る。D のピンが「掛け算」、C の近くに「実際」のピンが立ち、間に括弧「約500倍」" },
  { title: "教訓：居間に戻る", C: S44, sec: 22.9, lines: "ドラマを見ていたふたりに", move: "テレビが消えた居間。ふたりは少し寄って、顔を見合わせる。頭の上に小さな地図が1枚ずつ浮かぶ" },
  { title: "締め：2枚の地図", C: S45, sec: 14.3, lines: "ひとりの地図には、ちゃんと", move: "ふたりの地図が重なる。どちらの線もなめらかなまま、平行に離れて重ならない" },
  { title: "締めのひと言（毎回同じ）", C: S46, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const panels: Panel[] = P.map((p, i) => ({ key: String(i + 1).padStart(2, "0"), ...p }));
export const storyboard: StoryboardDef = { id: "006-cheating-line", title: "どこからが浮気？ 浮気の線がぴったり合う確率（第2版）", panels };
export default storyboard;
