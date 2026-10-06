// 6本目「どこからが浮気？ 浮気の線がぴったり合う確率」の絵コンテ 第1版（2026-10-06。台本は script.md の第2稿・推敲後）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（episodes/006-cheating-line/data/sb_secs.py で計算）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。
// 色の決まり（この回）：男女の色だけ（男性＝male、女性＝female）。「そろった組・残った組」は濃い色、「消えた組・対象外」は淡い色（Figure の dim）。
//   浮気の経験・幸福度など性別でない区分は、墨（ink）と灰（rest）で分ける。データの色を増やさない。
// 物語の場面（居間・ドラマ・せりふ）は猫、データの人数は人型。同じ場面に混ぜない。
// 地図の比喩：ひとりの線＝1枚の地図の国境線（BorderMap）。第2章で出し、締めで2枚を重ねて回収する。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { BorderMap } from "@lib/BorderMap";
import { TodayCard } from "@lib/Cards";
import { Cat } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { Couple, CouplePairs, PeopleRows } from "@lib/CouplePairs";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { Facts, Note } from "@lib/Labels";
import { Sofa, Tv } from "@lib/Living";
import { PairedBars } from "@lib/PairedBars";
import { PairedRows } from "@lib/PairedRows";
import { PercentColumns } from "@lib/PercentColumns";
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
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1640, ...font("question"), lineHeight: 1.2 }}>{children}</div>
);
const SubHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 168, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{children}</div>
);

const SRC = {
  raison: "レゾンデートル「結婚と浮気に関する実態調査」2025年（既婚6,805人、既婚者向けサービスの会社の調査、複数回答）",
  raisonCalc: "レゾンデートル 2025年（既婚6,805人）の割合から計算。既婚者向けサービスの会社の調査",
  albona: "ALBONA「セカンドパートナーと浮気に関する実態調査」2023年（2,000人、複数回答）",
  osf: "Kulibert & Thompson 2019 の公開データ（米国の大人、異性愛の男性272・女性282人）から計算。他人どうしを組ませた値",
  buss: "Buss ほか 1999（日本の大学生316人、1990年代の調査）",
  sagami: "相模ゴム工業「ニッポンのセックス」2026年版、レゾンデートル 2025年",
  gss: "米国 General Social Survey（結婚したことがある人）。相関で、どちらが先かは分からない",
  gssMarried: "米国 General Social Survey 2010〜22年（いま既婚・離婚歴なし）。相関",
  raison2: "レゾンデートル 第2報 2025年（既婚の浮気経験者480人）、相模ゴム工業 2026年版",
  law: "民法770条1項1号、最高裁 昭和48年11月15日判決",
};

// ================= 居間（冒頭・第3章の入口・教訓で同じ部屋） =================
// ソファは画面の左寄り、テレビは右。彼（male）が左、彼女（female）が右に座る。
const ROOM = { floor: 880, sofaX: 640, tvX: 1460, catY: 830, size: 4.2 };
type Mood = "watch" | "argue" | "ask" | "quiet" | "end";
const LivingRoom: React.FC<{ mood?: Mood; tv?: "dinner" | "glow" | "blank"; children?: React.ReactNode }> = ({ mood = "watch", tv = "dinner", children }) => {
  const him = { watch: "normal", argue: "smile", ask: "surprised", quiet: "think", end: "think" } as const;
  const her = { watch: "normal", argue: "normal", ask: "think", quiet: "think", end: "think" } as const;
  const gap = mood === "quiet" ? 140 : 95;
  return (
    <>
      <Backdrop kind="room" night floor={ROOM.floor} variant={2} />
      <Svg>
        <Tv x={ROOM.tvX} y={ROOM.floor} size={2.6} scene={tv} />
        <Sofa x={ROOM.sofaX} y={ROOM.floor} size={2.6} w={180} />
        <Cat kind="male" x={ROOM.sofaX - gap} y={ROOM.catY} size={ROOM.size} pose="sit" face={him[mood]}
          turn={mood === "ask" || mood === "argue" ? 0.4 : 0.6} label="彼" />
        <Cat kind="female" x={ROOM.sofaX + gap} y={ROOM.catY} size={ROOM.size} pose="sit" face={her[mood]}
          turn={mood === "ask" ? -0.6 : mood === "argue" ? -0.3 : 0.6} label="彼女" seed={2} />
        {children}
      </Svg>
    </>
  );
};

export const S01: React.FC = () => <AbsoluteFill><LivingRoom /></AbsoluteFill>;
export const S02: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Svg>
      {/* テレビの画面に寄る：ドラマの1場面（既婚の男性と同僚の女性が、ふたりで夕食） */}
      <rect x={260} y={140} width={1400} height={720} rx={R.lg} fill="#3A4566" />
      <rect x={760} y={560} width={400} height={26} rx={8} fill={C.wall} />
      <Cat kind="male" x={700} y={760} size={5} pose="sit" face="smile" turn={0.5} label="ドラマの夫" seed={7} />
      <Cat kind="female" x={1220} y={760} size={5} pose="sit" face="smile" turn={-0.5} label="ドラマの同僚" seed={9} />
      <circle cx={960} cy={300} r={36} fill="#FFE7A3" />
      <Label x={300} y={210} color={C.wall}>ドラマ</Label>
    </Svg>
  </AbsoluteFill>
);
export const S03: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="argue">
      <Bubble x={170} y={300} text="これはセーフでしょ" tail={[ROOM.sofaX - 95, 560]} />
      <Bubble x={760} y={170} text="アウト。完全に" tail={[ROOM.sofaX + 95, 560]} />
    </LivingRoom>
  </AbsoluteFill>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="ask" tv="glow">
      <Bubble x={720} y={200} text="先週の同期の子とのランチは？" tail={[ROOM.sofaX + 95, 560]} />
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
      <PercentColumns x={520} y={260} width={880} height={480} colW={220} lower={C.male} upper={C.maleTint}
        cols={[{ label: "男性", value: 29.7, text: "約3割" }]} />
      <PercentColumns x={1000} y={260} width={880} height={480} colW={220} lower={C.female} upper={C.femaleTint}
        cols={[{ label: "女性", value: 48.6, text: "約半分" }]} />
    </Svg>
    <SourceNote text={SRC.raison} />
  </AbsoluteFill>
);
// ---- くじで組ませると、2組に1組が食い違う ----
/** 組の床をふち取り（mark）した組＝答えが食い違った組。濃い色の人＝「浮気だ」と答えた人 */
const lotPairs = (seed: number, pm: number, pf: number, n = 20): Couple[] => {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => {
    const husband = r() < pm, wife = r() < pf;
    return { husband, wife, mark: husband !== wife };
  });
};
export const S07: React.FC = () => {
  const items = lotPairs(11, 0.3, 0.49);
  const odd = items.filter((c) => c.mark).length;
  return (
    <AbsoluteFill>
      <Heading>くじで組ませた男女20組</Heading>
      <SubHead>濃い色＝手をつないだら浮気、と答えた人</SubHead>
      <Svg>
        <CouplePairs x={260} y={460} items={items} cols={10} size={2.2} gap={40} row={200} />
        <Label x={960} y={790} anchor="middle" size="value">{`ふち取り＝答えが食い違った組（${odd}組）`}</Label>
      </Svg>
      <SourceNote text={SRC.raisonCalc} />
    </AbsoluteFill>
  );
};
export const S08: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <BorderMap x={420} y={250} w={520} h={380} lines={[{ color: C.male, seed: 3 }]} label="彼の線" labelColor={C.male} />
      <BorderMap x={980} y={250} w={520} h={380} lines={[{ color: C.female, seed: 8, shift: -40 }]} label="彼女の線" labelColor={C.female} />
    </Svg>
    <Note x={420} y={90} question text="ふたりの線が、ぜんぶそろう確率は？" />
  </AbsoluteFill>
);

// ================= 今日の答え合わせ・予想タイム・順番 =================
export const S09: React.FC = () => <AbsoluteFill><TodayCard claim="浮気の線のずれは、男女の違い" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の前に：使うデータ</Heading>
    <Facts x={120} y={220} items={["アメリカの大人が答えた、公開のデータ", "32の行動を「浮気かどうか」7段階で採点（5以上を浮気）", "他人どうしの男女を、無作為に組ませる", "32の行動すべてで答えがそろうかを数える"]} />
    <Svg>
      <CouplePairs x={1340} y={560} items={lotPairs(5, 0.5, 0.5, 6).map((c) => ({ ...c, mark: false }))} cols={3} size={2} gap={36} row={150} />
    </Svg>
    <SourceNote text={SRC.osf} />
  </AbsoluteFill>
);
export const S11: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="32の行動すべてで、ふたりの答えがそろう確率は？" choices={["2組に1組", "10組に1組", "200組に1組ほど", "10万組に1組"]} />
    <SourceNote prefix="" text="B＝男女の差の分だけずれる、D＝ひとつずつの確率の掛け算（答えは最後の答え合わせで）" />
  </AbsoluteFill>
);
export const S11b: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="32の行動すべてで、ふたりの答えがそろう確率は？" choices={["2組に1組", "10組に1組", "200組に1組ほど", "10万組に1組"]} />
    <Gosa cues={[[-60, "thinking"]]} size="M" />
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
              <rect x={x} y={250} width={520} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 40} y={330} size="value">{`第${i + 1}章`}</Label>
              {i === 0 && <g>{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={x + 120 + k * 56} y={600 - k * 44} width={56} height={44 + k * 44} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} />)}
                <line x1={x + 100} y1={510} x2={x + 420} y2={510} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="16 10" /></g>}
              {i === 1 && <BorderMap x={x + 110} y={420} w={300} h={190} lines={[{ color: C.male, seed: 3 }, { color: C.female, seed: 8, shift: -30 }]} />}
              {i === 2 && <g><line x1={x + 260} y1={420} x2={x + 260} y2={640} stroke={C.ink} strokeWidth={LINE.heavy} strokeDasharray="20 12" />
                <Figure kind="male" x={x + 330} y={640} size={2.4} pose="walk" /></g>}
              <Label x={x + 260} y={700} anchor="middle" size="note" weight={700}>{t}</Label>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 第1章：日本の線 =================
const ITEMS13 = [
  ["異性が接待するお店に行く", 11.3, 19.1], ["性風俗を利用する", 17.1, 30.8], ["ふたりきりで食事", 21.5, 34.3], ["頻繁に親しく連絡", 24.4, 34.9],
  ["ふたりきりで会う", 27.3, 40.1], ["パパ活・ママ活でデート", 30.6, 43.5], ["手をつなぐ", 29.7, 48.6], ["秘密にして会う", 32.2, 48.5],
  ["パパ活・ママ活で体の関係", 35.8, 49.2], ["頻繁にふたりきりで会う", 34.9, 52.1], ["恋愛感情を持つ", 35.0, 54.9], ["キスやハグ", 44.1, 59.8], ["体の関係を持つ", 54.4, 64.4],
] as const;
export const S13: React.FC = () => (
  <AbsoluteFill>
    <Heading>どこから上が、浮気？</Heading>
    <Svg>
      {[...ITEMS13].reverse().map(([t], j) => {
        const i = 12 - j, y = 190 + j * 50, w = 420 + i * 70;
        return (
          <g key={t}>
            <rect data-qa="mark" data-qa-label={`段：${t}`} x={1840 - w} y={y} width={w} height={44} rx={R.sm} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} />
            <text x={1840 - w + 20} y={y + 33} style={font("note", C.ink)} fontWeight={700}>{t}</text>
          </g>
        );
      })}
      <line x1={100} y1={517} x2={1840} y2={517} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="22 14" />
      <Label x={100} y={500} size="value">あなたの線は？</Label>
      <Label x={100} y={250} color={C.ink2}>重い</Label>
      <Label x={100} y={810} color={C.ink2}>軽い</Label>
    </Svg>
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S14: React.FC = () => (
  <AbsoluteFill>
    <Heading>「浮気だ」と答えた割合（13の行動）</Heading>
    <PairedRows x={96} y={230} width={1728} rowH={44} labelW={560} max={70}
      rows={ITEMS13.map(([label, m, f]) => ({ label, male: m, female: f, focus: label === "手をつなぐ" || label === "恋愛感情を持つ" }))} />
    <SourceNote text={SRC.raison} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S15: React.FC = () => (
  <AbsoluteFill>
    <Heading>2千人の調査：差が最大は「気持ち」</Heading>
    <PairedRows x={96} y={260} width={1728} rowH={64} labelW={520} max={100}
      rows={[{ label: "性行為", male: 82.6, female: 85.9 }, { label: "キス", male: 72.5, female: 72.5, focus: true },
        { label: "手をつなぐ", male: 54.5, female: 59.4 }, { label: "デート", male: 49.0, female: 66.9 },
        { label: "気持ちが動いたら", male: 38.8, female: 71.3, focus: true }, { label: "ふたりきりで食事", male: 29.4, female: 39.2 },
        { label: "連絡をとる", male: 10.8, female: 24.6 }]} />
    <SourceNote text={SRC.albona} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
// 浮気にした行動の数（32のうち）の分布。4つずつの区分、男女それぞれ100%（S15 の osf の計算）
export const S16: React.FC = () => (
  <AbsoluteFill>
    <Heading>32の行動のうち、いくつを浮気にした？</Heading>
    <PairedBars x={200} y={330} width={1500} height={390} max={45}
      rows={[{ label: "0〜3", male: 2, female: 1 }, { label: "4〜7", male: 7, female: 2 }, { label: "8〜11", male: 20, female: 11 },
        { label: "12〜15", male: 41, female: 36 }, { label: "16〜19", male: 18, female: 25 }, { label: "20〜23", male: 6, female: 13 },
        { label: "24〜27", male: 5, female: 6 }, { label: "28〜32", male: 1, female: 5 }]} />
    <Svg>
      <Label x={950} y={830} anchor="middle" size="note" color={C.ink2}>浮気にした行動の数（それぞれの性別の中の割合）。平均の差は2つほど、同じ性別の中の幅のほうが広い</Label>
    </Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cat kind="female" x={620} y={820} size={5} face="normal" turn={0.3} label="厳しい？" seed={4} />
      <Cat kind="male" x={1300} y={820} size={5} face="smile" turn={-0.3} label="ゆるい？" seed={6} />
      <Label x={620} y={300} anchor="middle" size="value" color={C.female}>厳しい女性？</Label>
      <Label x={1300} y={300} anchor="middle" size="value" color={C.male}>ゆるい男性？</Label>
      <Label x={960} y={560} anchor="middle" size="hero">？</Label>
    </Svg>
    <Note x={560} y={880} question text="それなら、男性どうしの線はそろう？" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);

// ================= 第2章：誰と誰がずれる =================
/** 同性どうしの組（20組）。mark の組は床をふち取る */
const SamePairs: React.FC<{ x: number; y: number; kind: "male" | "female" | "mix"; odd: number; title: string }> = ({ x, y, kind, odd, title }) => (
  <g>
    <Label x={x} y={y - 90} weight={900} color={kind === "male" ? C.male : kind === "female" ? C.female : C.ink}>{title}</Label>
    {Array.from({ length: 10 }, (_, i) => {
      const px = x + i * 74; // 1組＝肩を接した2人（CouplePairs と同じ間隔 39px）
      const a = kind === "female" ? "female" : "male", b = kind === "male" ? "male" : "female";
      return (
        <g key={i}>
          <rect data-qa="bg" x={px - 18} y={y - 3} width={70} height={12} rx={4} fill={C.paper2} stroke={i < odd ? C.ink : "none"} strokeWidth={LINE.hair} />
          <Figure kind={a} x={px} y={y} size={1.3} dim={i < odd && i % 2 === 0} />
          <Figure kind={b} x={px + 39} y={y} size={1.3} dim={i < odd && i % 2 === 1} />
        </g>
      );
    })}
    <Label x={x + 770} y={y} size="value">{`10組に${odd}組`}</Label>
  </g>
);
export const S18: React.FC = () => (
  <AbsoluteFill>
    <Heading>手をつなぐのは浮気？ 答えが食い違う組</Heading>
    <SubHead>ふち取り＝食い違った組（日本の割合から計算）</SubHead>
    <Svg>
      <SamePairs x={300} y={400} kind="mix" odd={5} title="男女の組" />
      <SamePairs x={300} y={600} kind="male" odd={4} title="男性どうし" />
      <SamePairs x={300} y={790} kind="female" odd={5} title="女性どうし" />
    </Svg>
    <SourceNote text={SRC.raisonCalc} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S19: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Cat kind="male" x={420} y={760} size={4.6} face="normal" turn={0.4} label="あなた" />
      <Cat kind="male" x={760} y={760} size={4.6} face="smile" turn={-0.4} label="男友達" seed={3} />
      {Array.from({ length: 32 }, (_, i) => {
        const x = 1000 + (i % 8) * 92, y = 300 + Math.floor(i / 8) * 110;
        const odd = [2, 5, 9, 12, 14, 19, 23, 26, 30].includes(i);
        return <rect key={i} data-qa="mark" data-qa-label={`行動${i + 1}`} x={x} y={y} width={76} height={86} rx={R.sm}
          fill={odd ? C.ink : C.white} stroke={C.ink} strokeWidth={LINE.hair} />;
      })}
      <Label x={1000} y={780} size="value">32のうち、平均9つが食い違う</Label>
      <Label x={1000} y={830} size="note" color={C.ink2}>墨のマス＝答えが食い違った行動（男女の組とほぼ同じ数）</Label>
    </Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S20: React.FC = () => (
  <AbsoluteFill>
    <Quiz title="クイズ" question="「相手の体の大事なところに触れる」で答えが割れやすいのは？" choices={["男性どうし", "女性どうし"]} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <Heading>男性どうしは体で、女性どうしは心で割れる</Heading>
    <PairedBars x={300} y={330} width={1300} height={390} max={50} names={["男性どうし", "女性どうし"]}
      rows={[{ label: "体の大事なところに触れる", male: 22.4, female: 10.1 }, { label: "心の支えになる", male: 27.1, female: 43.2 }]} />
    <Svg><Label x={1600} y={240} anchor="end" color={C.ink2}>答えが食い違う確率</Label></Svg>
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S22: React.FC = () => (
  <AbsoluteFill>
    <Heading>「心の浮気のほうがつらい」と答えた人</Heading>
    <SubHead>1990年代の日本の大学生（「男性は体、女性は心」と言われるが）</SubHead>
    <Svg>
      <PercentColumns x={520} y={280} width={880} height={460} colW={220} lower={C.male} upper={C.maleTint}
        cols={[{ label: "男子学生", value: 62 }]} />
      <PercentColumns x={1000} y={280} width={880} height={460} colW={220} lower={C.female} upper={C.femaleTint}
        cols={[{ label: "女子学生", value: 87 }]} />
    </Svg>
    <SourceNote text={SRC.buss} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S23: React.FC = () => (
  <AbsoluteFill>
    <Heading>ひとりひとりが、自分の地図を持っている</Heading>
    <Svg>
      <BorderMap x={140} y={300} w={460} h={330} lines={[{ color: C.male, seed: 3 }]} label="Aさんの線" labelColor={C.male} tilt={-3} />
      <BorderMap x={730} y={300} w={460} h={330} lines={[{ color: C.female, seed: 8 }]} label="Bさんの線" labelColor={C.female} />
      <BorderMap x={1320} y={300} w={460} h={330} lines={[{ color: C.male, seed: 21, shift: 30 }]} label="Cさんの線" labelColor={C.male} tilt={3} />
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);
// ---- はしご：100組を消していく ----
const allPairs = (on: boolean): Couple[] => Array.from({ length: 100 }, () => ({ husband: on, wife: on }));
const Ladder: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const steps = ["全員が同じ線", "男女で1本ずつ", "ひとりひとりの線"];
  return (
    <>
      <SimBackground />
      <Heading>{steps[step - 1]}</Heading>
      <SubHead>32の行動で、答えがずれた組を消す（男女100組）</SubHead>
      <Svg>
        <CouplePairs x={200} y={320} items={allPairs(step < 3)} cols={20} size={1.1} gap={30} row={86} />
        {steps.map((t, i) => (
          <g key={t}>
            <rect x={170 + i * 560} y={780} width={520} height={70} rx={R.md} fill={i + 1 === step ? C.ink : C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <text x={430 + i * 560} y={828} textAnchor="middle" style={font("label", i + 1 === step ? C.white : C.ink)}>
              {`${t}：${i < 2 ? "100組" : step === 3 ? "ほぼ0組" : "？"}`}
            </text>
          </g>
        ))}
      </Svg>
      <SourceNote text={SRC.osf} y={880} />
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
    <Svg>
      {Array.from({ length: 13 }, (_, i) => {
        const x = 150 + i * 125, h = 70 + i * 40;
        return <rect key={i} data-qa="mark" data-qa-label={`段${i + 1}`} x={x} y={860 - h} width={118} height={h} rx={R.sm} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} />;
      })}
      {[[400, C.male], [520, C.female], [610, C.male], [700, C.female], [470, C.female], [650, C.male]].map(([y, c], i) => (
        <line key={i} x1={120} y1={y as number} x2={1800} y2={(y as number) - 30 + i * 12} stroke={c as string} strokeWidth={LINE.thin} opacity={0.9} />
      ))}
      <line x1={1580} y1={300} x2={1800} y2={300} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={1800} y={270} anchor="end" weight={900}>法律の「不貞」＝体の関係</Label>
    </Svg>
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
      <SubHead>32の行動すべてがそろう組（男女、100組あたり）</SubHead>
      <Svg>
        {bars.map(([t, v, s], i) => {
          const x = 260 + i * 500, h = v * 260;
          return (
            <g key={t}>
              <rect data-qa="mark" data-qa-label={t} x={x} y={720 - h} width={220} height={h} rx={R.sm} fill={i === 2 ? C.ink : C.rest} />
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
    <Heading>食い違いやすいのは、灰色の行動</Heading>
    <Facts x={140} y={240} items={["マッチングサイトを一人で眺める（男女の組の48%で食い違い）", "好意のメッセージを受け取る（同 45%）", "色っぽいメッセージを受け取る（同 42%）", "暗い部屋でふたりで映画を見る（同 42%）"]} />
    <SourceNote text={SRC.osf} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S30: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <line x1={960} y1={220} x2={960} y2={820} stroke={C.ink} strokeWidth={LINE.heavy} strokeDasharray="28 16" />
      <Figure kind="male" x={760} y={820} size={5} pose="walk" />
      <Figure kind="female" x={1160} y={820} size={5} pose="walk" facing={-1} />
    </Svg>
    <Note x={520} y={880} question text="実際に線を越える人は、男女で違う？" />
    <ChapterDots current={2} />
  </AbsoluteFill>
);

// ================= 第3章：線を越える人 =================
export const S31: React.FC = () => (
  <AbsoluteFill>
    <LivingRoom mood="argue" tv="dinner">
      <Bubble x={120} y={260} text="やっぱり、男はそういうもんでしょ" tail={[ROOM.sofaX - 95, 560]} />
    </LivingRoom>
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S32: React.FC = () => (
  <AbsoluteFill>
    <Heading>結婚後に浮気をしたことがある人（日本の既婚者）</Heading>
    <SubHead>100人あたり。ふたつの調査とも、男性が女性の2倍ほど</SubHead>
    <Svg>
      <Label x={120} y={330} weight={900} color={C.male}>男性</Label>
      <PeopleRows x={300} y={310} kind="male" n={100} on={22} cols={25} dx={44} dy={56} size={1} />
      <Label x={120} y={610} weight={900} color={C.female}>女性</Label>
      <PeopleRows x={300} y={590} kind="female" n={100} on={11} cols={25} dx={44} dy={56} size={1} />
      <Label x={1700} y={400} anchor="end" size="value" color={C.male}>約2割</Label>
      <Label x={1700} y={680} anchor="end" size="value" color={C.female}>約1割</Label>
    </Svg>
    <SourceNote text={SRC.sagami} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S33: React.FC = () => (
  <AbsoluteFill>
    <Heading>同じ60代でも、男女の差は縮んだ（アメリカ）</Heading>
    <PairedBars x={420} y={330} width={1080} height={390} max={30}
      rows={[{ label: "1990年代の60代", male: 23.9, female: 8.8 }, { label: "2010年代の60代", male: 22.4, female: 15.0 }]} />
    <SourceNote text={SRC.gss} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S34: React.FC = () => (
  <AbsoluteFill>
    <Quiz title="クイズ" question="米国の18〜29歳（結婚したことがある人）。浮気の経験が多いのは？" choices={["男性がずっと多い", "男性が少し多い", "ほぼ同じ", "女性が多い"]} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
  <AbsoluteFill>
    <Heading>18〜29歳：男女でほぼ同じ</Heading>
    <PairedBars x={620} y={330} width={680} height={390} max={30} rows={[{ label: "18〜29歳", male: 8.2, female: 8.6 }]} />
    <Svg><Label x={1340} y={600} color={C.ink2} size="note">若い人は、結婚している年数がまだ短い</Label></Svg>
    <SourceNote text={SRC.gss} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S36: React.FC = () => {
  const bars: [string, number, string][] = [["とても幸せ", 6.4, "6%"], ["まあ幸せ", 12.6, "13%"], ["あまり幸せでない", 24.4, "4人に1人"]];
  return (
    <AbsoluteFill>
      <Heading>結婚の満足度で分けると</Heading>
      <SubHead>結婚中に浮気をしたことがある人（いま既婚・離婚歴なし）</SubHead>
      <Svg>
        {bars.map(([t, v, s], i) => {
          const x = 300 + i * 480, h = v * 18;
          return (
            <g key={t}>
              <rect data-qa="mark" data-qa-label={t} x={x} y={740 - h} width={240} height={h} rx={R.sm} fill={i === 2 ? C.ink : C.rest} />
              <text x={x + 120} y={720 - h} textAnchor="middle" style={font("value")}>{s}</text>
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
  const groups: [string, number, string][] = [["とても幸せ", 45, C.ink], ["まあ幸せ", 47, C.ink2], ["あまり幸せでない", 8, C.rest]];
  let k = 0;
  return (
    <AbsoluteFill>
      <Heading>浮気をしたことがある人を、100人に縮めると</Heading>
      <SubHead>自分の結婚をどう答えたか</SubHead>
      <Svg>
        {groups.map(([t, n, c], gi) => {
          const x0 = 140 + gi * 600;
          const out = Array.from({ length: n }, (_, i) => {
            k++;
            return <Figure key={i} kind="other" color={c} x={x0 + (i % 10) * 50} y={360 + Math.floor(i / 10) * 74} size={1.3} />;
          });
          return (
            <g key={t}>
              {out}
              <text x={x0} y={790} style={font("label")} fontWeight={900}>{`${t}　${n}人`}</text>
            </g>
          );
        })}
        <Label x={960} y={870} anchor="middle" size="value">9割は「幸せ」と答えていた</Label>
      </Svg>
      <SourceNote text={SRC.gssMarried} y={900} />
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};
export const S38: React.FC = () => (
  <AbsoluteFill>
    <Heading>日本の浮気の経験者に聞いた理由と、出会った場所</Heading>
    <Svg>
      {[["なんとなく、その場の雰囲気で", 29.0], ["夫婦関係が悪いから", 7.3]].map(([t, v], i) => (
        <g key={t as string}>
          <text x={120} y={330 + i * 120} style={font("label")}>{t}</text>
          <rect data-qa="mark" data-qa-label={t as string} x={760} y={290 + i * 120} width={(v as number) * 22} height={56} rx={R.sm} fill={C.ink} />
          <text x={780 + (v as number) * 22} y={334 + i * 120} style={font("value")}>{`${v}%`}</text>
        </g>
      ))}
      <rect x={120} y={560} width={1680} height={2} fill={C.rest} />
      <text x={120} y={660} style={font("label")}>浮気の相手と出会った場所の1位</text>
      <text x={760} y={672} style={font("value")}>職場　約4割</text>
      <text x={120} y={760} style={font("note", C.ink2)}>理由の男女別（画面だけ）：性欲 男性32%・女性18%／相手を好きになった 女性26%・男性20%</text>
    </Svg>
    <SourceNote text={SRC.raison2} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>平均の差は、本当にある。けれど</Heading>
    <Facts x={140} y={240} items={["平均では、浮気の経験は男性に多く、不幸な結婚に多い", "それでも、浮気をした人の9割は「幸せ」と答える結婚の中にいた", "平均の差は、目の前のひとりのことをあまり教えてくれない"]} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);

// ================= 答え合わせ =================
export const S40: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="平均すると、女性のほうが線を手前に引く" mark="〇"
      reason={["日本の7千人：13の行動すべてで\n女性のほうが「浮気」と答えた", "別の調査（2千人）でも向きは同じ"]} />
  </AbsoluteFill>
);
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="浮気の線のずれは、男性と女性の違いから生まれる" mark="×"
      reason={["男性どうし・女性どうしでも、\n男女と同じだけずれる", "男女それぞれの多数決の線は、\n32の行動すべてで同じ"]} />
  </AbsoluteFill>
);
export const S42: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="32の行動すべてで、ふたりの答えがそろう確率は？" choices={["2組に1組", "10組に1組", "200組に1組ほど", "10万組に1組"]} answer={2} reveal />
    <SourceNote prefix="" text="正確には約170組に1組（0.59%）。米国の公開データ、他人どうしを組ませた値" />
  </AbsoluteFill>
);
export const S43: React.FC = () => (
  <AbsoluteFill>
    <Heading>掛け算の答えより、500倍ほど多く残る</Heading>
    <Svg>
      <rect x={300} y={300} width={1320} height={60} rx={R.sm} fill={C.paper2} />
      <rect data-qa="mark" data-qa-label="ものさし" x={300} y={300} width={1320} height={60} rx={R.sm} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      {Array.from({ length: 33 }, (_, i) => <line key={i} x1={300 + i * 40} y1={300} x2={300 + i * 40} y2={i % 4 === 0 ? 340 : 325} stroke={C.ink} strokeWidth={LINE.hair} />)}
      <Label x={960} y={440} anchor="middle" size="value">厳しい人は、だいたいどの行動にも厳しい</Label>
      <Label x={960} y={560} anchor="middle">ひとりの線は、1本のものさしでつながっている</Label>
      <Label x={560} y={720} anchor="middle" color={C.ink2}>掛け算：約9万組に1組</Label>
      <Label x={1360} y={720} anchor="middle" weight={900}>実際：約170組に1組</Label>
    </Svg>
    <SourceNote text={SRC.osf} />
  </AbsoluteFill>
);

// ================= 教訓 =================
export const S44: React.FC = () => <AbsoluteFill><LivingRoom mood="end" tv="blank" /></AbsoluteFill>;
export const S45: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      {/* 2枚の地図を重ねる：どちらの線も筋は通っているが、重ならない */}
      <BorderMap x={560} y={220} w={800} h={540} lines={[{ color: C.male, seed: 3 }, { color: C.female, seed: 8, shift: -60 }]} />
      <Label x={960} y={850} anchor="middle" size="label">ひとりの地図には、筋が通っている。</Label>
      <Label x={960} y={910} anchor="middle" size="label">それでも、ふたりの地図は重ならない。</Label>
    </Svg>
  </AbsoluteFill>
);
export const S46: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

export const panels: Panel[] = [
  { key: "01", title: "冒頭：夜の居間、ドラマを見るふたり", C: S01, sec: 10.3, lines: "金曜の夜、部屋の明かりを", move: "夜の窓から部屋へ引く。テレビの光が床にゆれる。名札（会社員（31））は1.5秒" },
  { key: "02", title: "冒頭：ドラマの画面（夫と同僚の夕食）", C: S02, sec: 6.0, lines: "画面の中では、結婚している", move: "テレビの画面に寄る（画面いっぱいへ）。ふたりの人影がグラスを上げる" },
  { key: "03", title: "冒頭：「セーフ」「アウト」", C: S03, sec: 10.1, lines: "彼は「これはセーフでしょ」", move: "居間に戻る。彼の吹き出し→彼女が首を振り（左右に2回）、吹き出し。ふたりが顔を見合わせる" },
  { key: "04", title: "冒頭：先週のランチは？", C: S04, sec: 11.4, lines: "それから、少しだけ黙って", move: "彼女がゆっくり彼を見る。吹き出し。彼の目が丸くなる（驚きの顔）" },
  { key: "05", title: "冒頭：静かになった部屋", C: S05, sec: 7.1, lines: "やましいことは、何もありません", move: "ふたりの間が少し空く（彼女が端へ寄る）。テレビの音だけ（画面の光が点滅）" },
  { key: "06", title: "最初の数字：手をつないだら浮気", C: S06, sec: 10.9, lines: "既婚の男女、およそ七千人", move: "男性の柱、女性の柱の順に下から伸びる。値（約3割・約半分）が数えながら出る" },
  { key: "07", title: "くじで組むと、2組に1組が食い違う", C: S07, sec: 11.7, lines: "男女の差は、2割ほどです", move: "男女が1人ずつ箱から引かれて組になる（20組）。食い違った組の床が1組ずつふち取られる" },
  { key: "08", title: "問い：ぜんぶそろう確率は？", C: S08, sec: 14.1, lines: "意見が半々に割れている", move: "2枚の地図が左右から出て、国境線が引かれる（線の位置が違う）。問いの札" },
  { key: "09", title: "今日の答え合わせ", C: S09, sec: 7.2, lines: "今日の答え合わせは、この説", move: "共通のカード" },
  { key: "10", title: "予想の前に：使うデータ", C: S10, sec: 18.6, lines: "予想の前に、使うデータを", move: "条件の札が1つずつ出る。右下に組が6組並ぶ" },
  { key: "11", title: "予想タイム（4択）", C: S11, sec: 19.3, lines: "予想してみてください。", move: "共通の予想タイム。B と D には説明の小さな札" },
  { key: "11b", title: "予想タイム：考える間（C・D）", C: S11b, sec: 13.0, lines: "Cは、200組に1組ほどです", move: "C・D の札が出て、3秒の輪。ゴサが考える顔" },
  { key: "12", title: "今日の順番", C: S12, sec: 16.9, lines: "今日は、三つの順に", move: "3枚の札が左から並ぶ（階段・地図・線を越える人）。最後に1枚目が拡大して第1章の扉へ" },
  { key: "13", title: "第1章：13の行動の階段、自分の線を引く", C: S13, sec: 29.5, lines: "まず、日本の線です。", move: "第1章の扉 → 段が左から1段ずつ立つ。点線（あなたの線）が上下にゆれて止まる。一時停止を促す間" },
  { key: "14", title: "13の行動、男女の割合", C: S14, sec: 12.3, lines: "〔間・長〕さきほどの七千人", move: "階段が横棒に並び直す（行動名は同じ順）。男性→女性の棒が伸びる。全行で女性が長い" },
  { key: "15", title: "2千人の調査：気持ちとキス", C: S15, sec: 25.8, lines: "別の会社の、二千人の調査", move: "横棒が出る。「気持ちが動いたら」の行の差に墨の括弧、「キス」の行に同点の印。最後の2文（平均で見れば〜）で、全行の女性の棒が少し明るく脈打つ" },
  { key: "16", title: "ひとりひとりの散らばり（32の行動）", C: S16, sec: 30.2, lines: "それなら、ひとりひとりの線は", move: "男女の山が下から出る。平均の印（2つほどずれる）→ 山の幅に括弧（8〜20個）" },
  { key: "17", title: "先回り：厳しい女性とゆるい男性？", C: S17, sec: 18.1, lines: "ここまで聞くと、ずれの正体", move: "2匹の猫に「厳しい？」「ゆるい？」の札 → 札が消えて「？」。問いの札" },
  { key: "18", title: "第2章：同性どうしでも食い違う", C: S18, sec: 19.2, lines: "さきほどの日本の割合で", move: "第2章の扉 → 男女の組の列 → 男性どうし → 女性どうしの順に、食い違った組がふち取られる" },
  { key: "19", title: "あなたと男友達：32のうち9つ", C: S19, sec: 20.6, lines: "仲のいい男友達を", move: "2匹の猫が並ぶ。32のマスが1つずつ開き、食い違ったマスが墨に（9つ）" },
  { key: "20", title: "クイズ：体の大事なところに触れる", C: S20, sec: 14.3, lines: "ここで、小さな問題です。", move: "共通のクイズ（2択）。3秒の輪" },
  { key: "21", title: "答え：男性どうしは体、女性どうしは心", C: S21, sec: 25.0, lines: "〔間・長〕答えは、男性どうし", move: "体の行の棒が出て男性どうしが長い → 心の行で逆になる（女性どうしが長い）" },
  { key: "22", title: "「男性は体、女性は心」：1990年代の日本の学生", C: S22, sec: 16.5, lines: "「男性は体の浮気、女性は心", move: "2本の柱が伸びる。男子学生の柱に「6割」" },
  { key: "23", title: "比喩：自分だけの地図", C: S23, sec: 22.4, lines: "ひとりひとりが、自分だけの", move: "3枚の地図が配られるように落ちてきて、それぞれに違う国境線が描かれる" },
  { key: "24", title: "はしご1：全員が同じ線", C: S24, sec: 13.9, lines: "ここから、百組の男女を", move: "方眼の背景。100組が並ぶ。1段目の札。どの組も消えない" },
  { key: "25", title: "はしご2：男女で1本ずつの線", C: S25, sec: 18.6, lines: "次は、男性は男性の多数決", move: "2段目の札。「どうなるでしょうか」の間 → やはり1組も消えない（全組が小さく跳ねる）" },
  { key: "26", title: "はしご3：ひとりひとりの線", C: S26, sec: 15.0, lines: "最後に、ひとりひとりの", move: "3段目の札。端から順に組が淡くなって消えていく（ほとんど全部）" },
  { key: "27", title: "社会の線は奥に1本", C: S27, sec: 10.6, lines: "ちなみに、法律で「不貞」", move: "階段に人ごとの線（男女の色）が何本も引かれ、最後にいちばん上に墨の太い線が1本" },
  { key: "28", title: "ミクロ：3つ先にそろえたら", C: S28, sec: 18.1, lines: "それなら、この計算の中で", move: "3本の棒。無作為は少し伸びるだけ → 食い違いやすい3つは2倍半に伸びる" },
  { key: "29", title: "食い違いやすい灰色の行動", C: S29, sec: 13.8, lines: "食い違いやすいのは、体の関係", move: "札が1つずつ出る（体の関係・キスの札は線で消して始める）" },
  { key: "30", title: "次の問い：線を越える人は？", C: S30, sec: 11.3, lines: "ここまでは、線を引くときの", move: "太い点線の左右に男女が歩いてくる。問いの札" },
  { key: "31", title: "第3章：ドラマの続き、彼の台詞", C: S31, sec: 15.5, lines: "冒頭のドラマに戻ります。", move: "第3章の扉 → 居間。テレビの中で夫が線を越える（画面だけ）。彼の吹き出し" },
  { key: "32", title: "日本：男性 約2割・女性 約1割", C: S32, sec: 19.5, lines: "日本で結婚後に浮気を", move: "男性100人・女性100人が並び、浮気の経験がある人が濃くなる（左上から）" },
  { key: "33", title: "同じ60代：3倍 → 1倍半", C: S33, sec: 16.1, lines: "ただ、この差は", move: "1990年代の組が出て、次に2010年代。女性の棒が伸びて差が縮む" },
  { key: "34", title: "クイズ：18〜29歳", C: S34, sec: 21.3, lines: "ここで、問題です。", move: "共通のクイズ（4択）" },
  { key: "35", title: "答え：ほぼ同じ", C: S35, sec: 12.4, lines: "〔間・長〕答えは、Cの", move: "2本の棒がほぼ同じ高さまで伸びる。条件の注記" },
  { key: "36", title: "満足度で分けると4倍", C: S36, sec: 19.8, lines: "次に、男女ではなく", move: "3本の柱が左から伸びる。右端の柱に「4人に1人」" },
  { key: "37", title: "数え直し：浮気経験者の9割は「幸せ」", C: S37, sec: 17.8, lines: "〔間〕ところが、浮気をした", move: "前の柱の濃い部分から人が出てきて100人に縮み、幸福度ごとに並び直す（左の2群が大きい）" },
  { key: "38", title: "日本：理由と出会った場所", C: S38, sec: 26.7, lines: "日本の、浮気をしたことがある", move: "理由の棒2本 → 区切り線 → 職場 約4割の文字" },
  { key: "39", title: "まとめ：平均の差はある、けれど", C: S39, sec: 27.1, lines: "平均で見れば、浮気の経験は", move: "3つの札が順に出る" },
  { key: "40", title: "答え合わせ（前半：〇）", C: S40, sec: 13.4, lines: "答え合わせです。", move: "共通の判定。証拠2つ → 〇" },
  { key: "41", title: "答え合わせ（後半：×）", C: S41, sec: 21.8, lines: "二つ目の証拠。", move: "前の判定が左上に小さく残り、後半の判定。証拠2つ → ×" },
  { key: "42", title: "予想の答え：C", C: S42, sec: 9.1, lines: "〔間〕予想タイムの答えです", move: "予想の4択に戻り、C を塗る（選択肢は残す）" },
  { key: "43", title: "掛け算の500倍：1本のものさし", C: S43, sec: 15.5, lines: "Dを選んだ人は、掛け算を", move: "ものさしが伸び、目盛りが1つずつ刻まれる。掛け算と実際の数を左右に" },
  { key: "44", title: "教訓：居間に戻る", C: S44, sec: 22.9, lines: "ドラマを見ていたふたりに", move: "テレビが消えた居間。ふたりは少し離れて座ったまま、同じ方を見る" },
  { key: "45", title: "締め：2枚の地図", C: S45, sec: 14.3, lines: "ひとりの地図には、ちゃんと", move: "彼の地図と彼女の地図が重なる。どちらの線もなめらかなまま、重ならない" },
  { key: "46", title: "締めのひと言（毎回同じ）", C: S46, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const storyboard: StoryboardDef = { id: "006-cheating-line", title: "どこからが浮気？ 浮気の線がぴったり合う確率（第1版）", panels };
export default storyboard;
