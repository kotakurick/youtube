// 7本目「漏えいのニュースが止まらない。漏れた情報は、どこへ行くのか」の絵コンテ 第1版（2026-10-07。台本は script.md の第6稿・改）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（data/sb_secs.py で入れる）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。key は一覧の番号と同じ（01〜。並べた順に自動で付く）。
// 意味の色（この回）：青緑（teal）＝情報（漏れた件数・人数・盗品）、金（gold）＝お金に換わった額（不正利用・身代金・犯人の取り分）、
//   赤（debt）＝損（被害を受けた側の後始末）、灰（other）＝ミスの件数。それ以外は墨と灰。
// 物語の場面は猫（彼＝male、名札「会社員（28）」）、データの人数は人型。同じ場面に混ぜない。
// 比喩は「質屋」（Pawnshop）：開いている／半分閉まった／閉まった。闇の売り場は抽象的な屋台（Stall）。
// 特定の企業・大学を責めない（会社名・ロゴを描かない）。攻撃の手口は描かない。助言に見える強調はしない。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { BarChart } from "@lib/BarChart";
import { Cat, CatLabel } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { ClaimCards, CountPick } from "@lib/Claims";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { CarIcon, Clipboard, CloudIcon, Envelope, Gavel, Grill, ICChip, IdCard, Mug, Office, StockChart, Tool } from "@lib/Icons";
import { Inbox } from "@lib/Inbox";
import { Note } from "@lib/Labels";
import { LineChart } from "@lib/LineChart";
import { Coins, Loot, Pawnshop, Stall } from "@lib/Pawnshop";
import { Desk, Table } from "@lib/Props";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Thought } from "@lib/StoryAnim";
import { Verdict } from "@lib/Verdict";
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
/** 矢印（墨2の線と三角） */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string }> = ({ x1, y1, x2, y2, color = C.ink2 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), k = 22;
  const p1 = [x2 - k * Math.cos(a - 0.45), y2 - k * Math.sin(a - 0.45)], p2 = [x2 - k * Math.cos(a + 0.45), y2 - k * Math.sin(a + 0.45)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 10 * Math.cos(a)} y2={y2 - 10 * Math.sin(a)} stroke={color} strokeWidth={LINE.base} strokeLinecap="round" />
      <path d={`M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} fill={color} />
    </g>
  );
};
/** 100%の柱1本（濃い部分＝value）。値は濃い部分の上端の横に書く */
const ShareCol: React.FC<{ x: number; y: number; h: number; value: number; text: string; color: string; tint: string; name: string; w?: number }> = (
  { x, y, h, value, text, color, tint, name, w = 200 },
) => {
  const hv = (h * value) / 100;
  return (
    <g>
      <rect data-qa="mark" data-qa-label={`${name}：100%`} x={x} y={y} width={w} height={h} rx={R.sm} fill={tint} />
      <rect data-qa="mark" data-qa-allow="mark" data-qa-label={name} x={x} y={y + h - hv} width={w} height={hv} rx={R.sm} fill={color} />
      <line x1={x + w} y1={y + h - hv} x2={x + w + 36} y2={y + h - hv} stroke={C.ink} strokeWidth={LINE.thin} />
      <text x={x + w + 48} y={y + h - hv + 22} style={font("value", color)}>{text}</text>
      <text x={x + w / 2} y={y + h + 52} textAnchor="middle" style={font("label")} fontWeight={900}>{name}</text>
      <text x={x - 12} y={y + 28} textAnchor="end" style={font("note", C.ink2)}>100%</text>
    </g>
  );
};
/** 横棒1本（左に名前、棒の右か上に値） */
const HBar: React.FC<{ x: number; y: number; w: number; h?: number; color: string; name: string; value: string; valueAbove?: boolean; valueColor?: string }> = (
  { x, y, w, h = 90, color, name, value, valueAbove, valueColor },
) => (
  <g>
    <text x={x - 32} y={y + h / 2 + 14} textAnchor="end" style={font("label")} fontWeight={900}>{name}</text>
    <rect data-qa="mark" data-qa-label={`横棒：${name}`} x={x} y={y} width={Math.max(w, 4)} height={h} rx={R.sm} fill={color} />
    {valueAbove
      ? <text x={x} y={y - 20} style={font("value", valueColor ?? C.ink)}>{value}</text>
      : <text x={x + Math.max(w, 4) + 24} y={y + h / 2 + 22} style={font("value", valueColor ?? C.ink)}>{value}</text>}
  </g>
);

const SRC = {
  companies: "各社の公表（2026年9〜10月）を筆者が合計。見込みを含む",
  each: "各社の公表（2026年9〜10月）",
  nord: "NordVPN 2025年（盗まれたカードの売り場の調べ。値段のある132か国）",
  ppc7: "個人情報保護委員会 年次報告（令和7年度、13,345件）",
  ppc6: "個人情報保護委員会 年次報告（令和6年度）",
  tsr: "東京商工リサーチ（上場企業とその子会社が公表した事故）",
  tsrPop: "東京商工リサーチ（上場企業とその子会社の公表、延べ）、総務省 人口推計",
  npaRansom: "警察庁「サイバー空間をめぐる脅威の情勢」（半期ごと）",
  court: "NordVPN 2025年、漏えいの裁判の報道（2019〜2023年の判決）",
  herley: "Herley & Florêncio 2009「Nobody Sells Gold for the Price of Silver」",
  fsa: "金融庁（2026年9月更新）。売却金額は売られた株の額で、被害額ではない",
  jca: "日本クレジット協会（2014年から数え方が変わる）",
  jcaShare: "日本クレジット協会（2025年）",
  jcaPhish: "フィッシング対策協議会、日本クレジット協会（2018→2025年）",
  npaArrest: "警察庁・総務省・経済産業省「不正アクセス行為の発生状況」（令和7年、248人）",
  nca: "英国 国家犯罪対策庁（NCA）2024年",
  doj: "米国司法省（起訴の発表）、英国 NCA 2024年（実行役194人のうち最大114人）",
  collier: "Collier ほか 2021（サイバー犯罪の現場の聞き取り）",
  npaDamage: "警察庁（令和7年、国内のランサムウェア被害 226件）",
  coveware: "Coveware（四半期の報告、身代金を払った組織の割合）",
  chain: "Chainalysis（2026年版。2025年は速報）",
};

// ================= 夜の台所（冒頭・教訓で同じ部屋） =================
const K = { floor: 820, tableX: 860, catX: 1120, size: 5.2 };
const Kitchen: React.FC<{ face?: "normal" | "think" | "sad"; pose?: "phone" | "sit"; children?: React.ReactNode }> = ({ face = "normal", pose = "phone", children }) => (
  <>
    <Backdrop kind="room" night floor={K.floor} variant={3} />
    <Svg>
      <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.22} />
      <Table x={K.tableX} y={K.floor} size={K.size} w={50} />
      <Cat kind="male" x={K.catX} y={K.floor} size={K.size} pose={pose} face={face} facing={-1} label="彼" />
      {children}
    </Svg>
  </>
);

export const S01: React.FC = () => (
  <AbsoluteFill><Kitchen><CatLabel x={K.catX} y={K.floor} size={K.size} text="会社員（28）" /></Kitchen></AbsoluteFill>
);

const ICON4 = [
  { from: "焼肉の店のアプリ", subject: "会員情報の漏えいに関するお詫び", date: "10/5", icon: (x: number, y: number) => <Grill x={x} y={y} /> },
  { from: "アンケートのサイト（ポイント）", subject: "不正アクセスに関するお詫び", date: "10/5", icon: (x: number, y: number) => <Clipboard x={x} y={y} /> },
  { from: "カーシェア", subject: "お客さま情報の漏えいのお詫び", date: "9/28", icon: (x: number, y: number) => <CarIcon x={x} y={y} /> },
  { from: "証券会社", subject: "委託先での情報漏えいのお詫び", date: "10/6", icon: (x: number, y: number) => <StockChart x={x} y={y} /> },
];
export const S02: React.FC = () => (
  <AbsoluteFill>
    <Svg><Inbox x={310} y={170} query="お詫び" count="4件" rows={ICON4.map((r, i) => ({ ...r, mark: i === 1 }))} /></Svg>
  </AbsoluteFill>
);
export const S03: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      {/* 左：3通目の中身（会社名は書かない） */}
      <rect x={110} y={200} width={800} height={560} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Envelope x={180} y={270} />
      <Label x={240} y={284} weight={900}>カーシェア</Label>
      <Label x={150} y={370} color={C.ink2}>漏れた可能性のある情報</Label>
      <Label x={170} y={440}>・会員の名前、住所、電話番号</Label>
      <Label x={170} y={510}>・運転免許証などの画像</Label>
      <rect x={150} y={590} width={720} height={110} rx={R.md} fill={C.tealTint} />
      <Label x={180} y={668} size="value" color={C.ink} weight={900}>画像 約160万件</Label>
      {/* 右：回想（台所で免許証を撮った夜） */}
      <defs><clipPath id="memo3"><circle cx={1380} cy={480} r={320} /></clipPath></defs>
      <g clipPath="url(#memo3)">
        <rect data-qa="bg" x={1060} y={160} width={640} height={640} fill={C.wall} />
        <rect data-qa="bg" x={1060} y={690} width={640} height={120} fill={C.floor} />
        <Table x={1440} y={720} size={3.4} w={110} />
        <Cat kind="male" x={1250} y={720} size={3.4} pose="phone" face="normal" facing={1} label="回想の彼" />
        <IdCard x={1500} y={630} s={1.4} label="免許証" />
      </g>
      <circle cx={1380} cy={480} r={320} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="18 12" />
      <Label x={1380} y={860} anchor="middle" color={C.ink2}>免許証の表と裏を撮った夜</Label>
    </Svg>
  </AbsoluteFill>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <Heading>焼肉と、アンケートと、車と、株</Heading>
    <Svg>
      {[
        { x: 300, n: "焼肉", C: Grill }, { x: 740, n: "アンケート", C: Clipboard }, { x: 1180, n: "車", C: CarIcon }, { x: 1620, n: "株", C: StockChart },
      ].map(({ x, n, C: Ic }) => (
        <g key={n}><Ic x={x} y={460} s={2.4} /><Label x={x} y={630} anchor="middle" weight={900}>{n}</Label></g>
      ))}
      {[520, 960, 1400].map((x) => <Label key={x} x={x} y={490} anchor="middle" size="question" color={C.ink2}>？</Label>)}
    </Svg>
  </AbsoluteFill>
);
const LEAKS: [string, number, string][] = [
  ["焼肉の店のアプリ", 10788963, "約1,079万件"], ["カーシェア", 6600000, "約660万件"], ["アンケートのサイト", 948498, "最大 約95万件"],
  ["問い合わせの委託先", 713126, "延べ 約71万件"], ["医療の会員サイト", 558700, "最大 約56万件"], ["大学", 130000, "約13万件"],
];
export const S05: React.FC = () => (
  <AbsoluteFill>
    <Heading>この半月ほどの主な漏えい</Heading>
    <Svg>
      <Label x={1820} y={250} anchor="end" size="value" color={C.teal} weight={900}>合わせて 約2,000万件</Label>
      {LEAKS.map(([n, v, t], i) => (
        <HBar key={n} x={560} y={300 + i * 84} h={60} w={(v / 10788963) * 900} color={C.teal} name={n} value={t} valueColor={C.ink} />
      ))}
    </Svg>
    <SourceNote text={SRC.companies} />
  </AbsoluteFill>
);
export const S06: React.FC = () => (
  <AbsoluteFill>
    <Kitchen face="think">
      {/* 右上：SNS の投稿（抽象。実在の画面に似せない） */}
      <g data-qa="prop" data-qa-label="SNSの投稿">
        <rect x={1240} y={150} width={560} height={300} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <circle cx={1300} cy={210} r={28} fill={C.rest} />
        <rect x={1345} y={195} width={200} height={14} rx={7} fill={C.rest} />
        <rect x={1345} y={220} width={120} height={12} rx={6} fill={C.paper2} />
        <Loot x={1330} y={330} kind="card" s={1.3} label="投稿の中のカード" />
        <Label x={1400} y={320} size="note" weight={900}>日本のカード情報</Label>
        <Label x={1400} y={364} size="note" color={C.ink2}>名前・電話番号つき</Label>
      </g>
      <Thought x={480} y={180} text="なんで、こんなに続くんだ" toward={[1080, 560]} />
      <Thought x={120} y={330} text="売られた情報は、そのあと、どうなるんだろう" toward={[1060, 600]} />
    </Kitchen>
  </AbsoluteFill>
);

// ================= 最初の驚き =================
export const S07: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗まれたカード1枚の値段（売り場の平均）</Heading>
    <Svg>
      <HBar x={560} y={330} h={120} w={1000} color={C.gold} name="日本" value="22.8ドル" />
      <HBar x={560} y={540} h={120} w={(8.82 / 22.8) * 1000} color={C.goldTint} name="132か国の平均" value="8.82ドル" valueColor={C.ink2} />
      <Label x={560} y={500} size="note" color={C.ink2}>調べた国の中で、いちばん高い</Label>
      <Label x={1200} y={770} anchor="middle" size="value" weight={900}>平均の約2.6倍</Label>
    </Svg>
    <SourceNote text={SRC.nord} />
  </AbsoluteFill>
);
export const S08: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 200, top: 240, ...font("hero", C.gold), whiteSpace: "nowrap", lineHeight: 1 }}>
      <span style={{ fontSize: 100 }}>約</span>3,400<span style={{ fontSize: 100 }}>円</span>
    </div>
    <div style={{ position: "absolute", left: 210, top: 470, ...font("label", C.ink2), whiteSpace: "nowrap" }}>日本のカード1枚（22.8ドル）</div>
    <Svg>
      <Mug x={1420} y={340} s={2.6} label="ジョッキ" />
      <Label x={1420} y={510} anchor="middle" weight={900}>飲み会1回ぶんほど</Label>
    </Svg>
    <Note x={360} y={640} question text="この2,000万件は、どれだけのお金に変わる？" />
    <SourceNote text={SRC.nord} />
  </AbsoluteFill>
);

// ================= 今日の答え合わせ・予想タイム・順番 =================
const CLAIMS = [
  { name: "激増", text: "漏えいは、この数年で激増した" },
  { name: "すぐ現金", text: "漏れた情報は、すぐお金になる" },
  { name: "天才", text: "盗むのは、腕のいい天才ハッカー" },
  { name: "大儲け", text: "盗む側は、大儲けしている" },
];
export const S09: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏えいのニュースで、よく聞く話</Heading>
    <ClaimCards x={96} y={220} w={1728} items={CLAIMS} shown={2} />
  </AbsoluteFill>
);
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏えいのニュースで、よく聞く話</Heading>
    <ClaimCards x={96} y={220} w={1728} items={CLAIMS} />
  </AbsoluteFill>
);
export const S11: React.FC = () => (
  <AbsoluteFill>
    <Heading>この4つのうち、本当の話はいくつ？</Heading>
    <SubHead>予想タイム（答えは最後に）</SubHead>
    <ClaimCards x={96} y={250} w={1728} items={CLAIMS} cols={4} />
    <CountPick x={96} y={600} label="本当の話は" />
    <Gosa cues={[[-60, "thinking"]]} size="M" foot={850} />
  </AbsoluteFill>
);
const OrderCard: React.FC<{ x: number; no: number; text: string; children: React.ReactNode }> = ({ x, no, text, children }) => (
  <g>
    <rect x={x} y={240} width={480} height={460} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
    <circle cx={x + 56} cy={296} r={32} fill={C.ink} />
    <text x={x + 56} y={310} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{no}</text>
    {children}
    <text x={x + 240} y={660} textAnchor="middle" style={font("label")} fontWeight={900}>{text}</text>
  </g>
);
export const S12: React.FC = () => (
  <AbsoluteFill>
    <Heading>今日の順番</Heading>
    <Svg>
      <OrderCard x={160} no={1} text="本当に増えたのか">
        {[[60, C.rest], [140, C.rest], [260, C.teal]].map(([h, c], i) => (
          <rect key={i} data-qa="mark" data-qa-label={`増えたかの棒${i + 1}`} x={260 + i * 100} y={580 - (h as number)} width={70} height={h as number} rx={R.sm} fill={c as string} />
        ))}
      </OrderCard>
      <OrderCard x={720} no={2} text="情報はどこへ行くのか">
        <Pawnshop x={960} y={590} s={0.66} state="open" />
      </OrderCard>
      <OrderCard x={1280} no={3} text="盗む側の稼ぎ">
        <Coins x={1520} y={570} n={10} stacks={3} s={1.6} label="稼ぎ" />
      </OrderCard>
    </Svg>
  </AbsoluteFill>
);

// ================= 第1章：増えたのか =================
export const S13: React.FC = () => (
  <AbsoluteFill>
    <Heading>国に届く漏えいの報告（昨年度）</Heading>
    <SubHead>13,345件を100マスに</SubHead>
    <Svg>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        const c = i < 81 ? C.other : i < 90 ? C.teal : C.otherTint;
        return <rect key={i} data-qa="mark" data-qa-label={`マス${i + 1}`} x={200 + col * 56} y={240 + row * 56} width={48} height={48} rx={6} fill={c} />;
      })}
      {[[C.other, "人のミス（渡し間違いなど）", "81"], [C.teal, "外から盗まれる（不正アクセス）", "9"], [C.otherTint, "盗難・内部の不正・その他", "10"]].map(([c, n, v], i) => (
        <g key={n}>
          <rect data-qa="mark" data-qa-label={`凡例：${n}`} x={860} y={290 + i * 110} width={48} height={48} rx={6} fill={c} />
          <Label x={930} y={330 + i * 110}>{n}</Label>
          <Label x={1800} y={334 + i * 110} anchor="end" size="value">{`${v}マス`}</Label>
        </g>
      ))}
      <Label x={860} y={700} size="value" weight={900}>8割は、人のミス</Label>
    </Svg>
    <SourceNote text={SRC.ppc7} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S14: React.FC = () => (
  <AbsoluteFill>
    <Heading>外から盗まれる漏えい（年あたり）</Heading>
    <SubHead>上場企業とその子会社が公表した事故</SubHead>
    <Svg>
      <BarChart x={360} y={280} width={900} height={460} max={120} format={(v) => `${Math.round(v)}件`}
        bars={[{ label: "2012〜14年の平均", value: 17, color: C.tealTint }, { label: "2023〜25年の平均", value: 108, color: C.teal, focus: true }]} />
      <Label x={1360} y={460} size="value" weight={900}>約6倍</Label>
    </Svg>
    <SourceNote text={SRC.tsr} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
const Y12 = Array.from({ length: 14 }, (_, i) => 2012 + i);
const STOLEN = [9, 31, 11, 10, 22, 29, 25, 41, 51, 68, 91, 93, 114, 116];
const MISS = [62, 76, 59, 77, 67, 61, 60, 45, 52, 69, 74, 82, 75, 64];
export const S15: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗まれる漏えいと、ミスによる事故</Heading>
    <SubHead>上場企業とその子会社（件／年）</SubHead>
    <Svg>
      <LineChart x={200} y={250} width={1200} height={500} xDomain={[2012, 2025]} yDomain={[0, 130]} xTicks={[2012, 2015, 2020, 2025]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v)}件`}
        series={[{ label: "ミスなど", points: Y12.map((y, i) => [y, MISS[i]]), color: C.other }, { label: "盗まれる", points: Y12.map((y, i) => [y, STOLEN[i]]), color: C.teal, focus: true }]} />
    </Svg>
    <SourceNote text={SRC.tsr} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
const HALF = ["21上", "21下", "22上", "22下", "23上", "23下", "24上", "24下", "25上", "25下", "26上"];
const RANSOM = [61, 85, 114, 116, 103, 94, 114, 108, 116, 110, 123];
export const S16: React.FC = () => (
  <AbsoluteFill>
    <Heading>ランサムウェアの届け出（半年ごと）</Heading>
    <SubHead>今年の上半期は123件。半年の数で過去最多（上＝上半期、下＝下半期）</SubHead>
    <Svg>
      <BarChart x={160} y={280} width={1560} height={460} max={130} format={(v) => `${Math.round(v)}件`}
        bars={HALF.map((l, i) => ({ label: l, value: RANSOM[i], color: i === 10 ? C.ink : C.rest, focus: i === 10 }))} />
    </Svg>
    <SourceNote text={SRC.npaRansom} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <Heading>手がかりは、4通目</Heading>
    <Svg>
      <StockChart x={480} y={460} s={2.6} label="証券会社" />
      <Label x={480} y={640} anchor="middle" weight={900}>証券会社</Label>
      <Office x={1440} y={460} s={2.6} label="専門の会社" />
      <Label x={1440} y={640} anchor="middle" weight={900}>問い合わせ受付の専門の会社</Label>
      <Arrow x1={640} y1={460} x2={1280} y2={460} />
      <Label x={960} y={420} anchor="middle" color={C.ink2}>受付の仕事を頼む</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S18: React.FC = () => (
  <AbsoluteFill>
    <Heading>1か所が破られて、おわびは最大5社</Heading>
    <SubHead>1つの事故が、会社の数だけニュースになる</SubHead>
    <Svg>
      {[360, 660, 960, 1260, 1560].map((x) => (
        <g key={x}>
          <line x1={960} y1={600} x2={x} y2={400} stroke={C.ink2} strokeWidth={LINE.thin} />
          <Office x={x} y={300} s={1.6} label={`おわびを出した会社 ${x}`} />
          <Envelope x={x} y={400} s={1.1} label={`おわび ${x}`} />
        </g>
      ))}
      <Office x={960} y={660} s={2.4} label="委託先" />
      <Label x={960} y={820} anchor="middle" weight={900}>委託先（1か所）</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S19: React.FC = () => (
  <AbsoluteFill>
    <Heading>国への報告は、会社の数で数える</Heading>
    <SubHead>過去最多と報じられた年度の報告 19,056件</SubHead>
    <Svg>
      <rect data-qa="mark" data-qa-label="報告の全体" x={160} y={300} width={1600} height={120} rx={R.sm} fill={C.rest} />
      <rect data-qa="mark" data-qa-allow="mark" data-qa-label="1つの事故の分" x={160} y={300} width={1600 * 0.144} height={120} rx={R.sm} fill={C.ink} />
      <Label x={160} y={280} size="note" color={C.ink2}>0</Label>
      <Label x={1760} y={280} anchor="end" size="note" color={C.ink2}>100%（19,056件）</Label>
      <Label x={160} y={490} size="value" weight={900}>7件に1件（2,745件）は、1つの事故から</Label>
      <CloudIcon x={360} y={650} s={2.4} label="クラウド" />
      <Label x={540} y={640}>給与や社会保険の事務を、</Label>
      <Label x={540} y={700}>たくさんの会社から預かるクラウド</Label>
    </Svg>
    <SourceNote text={SRC.ppc6} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S20: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏れた人数を足すと、延べ2億人超</Heading>
    <SubHead>面積＝人数</SubHead>
    <Svg>
      <rect data-qa="mark" data-qa-label="延べの人数" x={320} y={310} width={480} height={480} fill={C.teal} />
      <Label x={560} y={290} anchor="middle" weight={900}>漏れた人数（延べ）2億1,313万</Label>
      <rect data-qa="mark" data-qa-label="人口" x={1120} y={426} width={364} height={364} fill={C.rest} />
      <Label x={1302} y={406} anchor="middle" weight={900}>日本の人口 1億2,265万</Label>
      <Label x={960} y={700} anchor="middle" size="value">約1.7倍</Label>
    </Svg>
    <SourceNote text={SRC.tsrPop} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <Heading>延べなので、同じ人が何度も数えられる</Heading>
    <Svg>
      <Figure kind="other" color={C.ink2} x={520} y={760} size={6} label="1人" />
      {[[360, 380], [520, 330], [680, 380]].map(([x, y], i) => (
        <g key={i} data-qa="mark" data-qa-label={`しるし${i + 1}`}>
          <circle cx={x} cy={y} r={34} fill={C.teal} />
          <text x={x} y={y + 14} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{i + 1}</text>
        </g>
      ))}
      <rect x={1020} y={260} width={800} height={420} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={330} color={C.ink2}>見出しの件数によくあるもの</Label>
      <Label x={1060} y={430} size="value" weight={900}>最大 948,498件</Label>
      <Label x={1060} y={480} size="note" color={C.ink2}>最大の見込み（アンケートのサイト）</Label>
      <Label x={1060} y={580} size="value" weight={900}>延べ 713,126件</Label>
      <Label x={1060} y={630} size="note" color={C.ink2}>延べ（委託先。最大5社）</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);

// ---- 100人の町（data/town_sim.py の町2） ----
const TOWN = [
  { name: "少ない人", n: 64, cols: 16, x: 120, use: "5個前後", mix: [29, 32, 3] },
  { name: "ふつうの人", n: 19, cols: 5, x: 1000, use: "15個前後", mix: [2, 9, 8] },
  { name: "多い人", n: 17, cols: 5, x: 1400, use: "30個前後", mix: [0, 3, 14] },
];
const MIX_C = [C.ink2, C.tealTint, C.teal];
const Town: React.FC<{ colored?: boolean }> = ({ colored }) => (
  <Svg>
    {TOWN.map((g) => (
      <g key={g.name}>
        <Label x={g.x} y={280} weight={900}>{`${g.name} ${g.n}人`}</Label>
        <Label x={g.x} y={326} size="note" color={C.ink2}>{`使うサービス ${g.use}`}</Label>
        {Array.from({ length: g.n }, (_, i) => {
          const k = i < g.mix[0] ? 0 : i < g.mix[0] + g.mix[1] ? 1 : 2;
          return <Figure key={i} kind="other" color={colored ? MIX_C[k] : C.ink2} x={g.x + 20 + (i % g.cols) * 50} y={430 + Math.floor(i / g.cols) * 92} size={1.4} />;
        })}
      </g>
    ))}
    {colored && [["0回", "31人"], ["1〜2回", "44人"], ["3回以上", "25人"]].map(([n, v], i) => (
      <g key={n}>
        <rect data-qa="mark" data-qa-label={`凡例：${n}`} x={120 + i * 520} y={770} width={44} height={44} rx={6} fill={MIX_C[i]} />
        <Label x={184 + i * 520} y={806} weight={900}>{`${n} ${v}`}</Label>
      </g>
    ))}
  </Svg>
);
export const S22: React.FC = () => (
  <AbsoluteFill>
    <Heading>延べの数を、100人の町に配る</Heading>
    <SubHead>漏えいのたびに、そのサービスを使う人へしるしを1つ</SubHead>
    <Town />
    <SourceNote sim prefix="" text="ヤフー「パスワードに関する意識調査」の分け方、東京商工リサーチの延べ人数から" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S23: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏れ方は、人によって大きく偏る</Heading>
    <SubHead>しるしを配り終えた町（何回漏れたか）</SubHead>
    <Town colored />
    <SourceNote sim prefix="" text="上場企業の公表分だけなので、実際の回数はこれより多い" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S24: React.FC = () => {
  const X = (n: number) => 200 + (n / 35) * 1500;
  const base = 760;
  return (
    <AbsoluteFill>
      <Heading>使うサービスの数と、漏れた回数</Heading>
      <Svg>
        <line x1={200} y1={base} x2={1700} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        {[[5, 0.78, "少ない人"], [15, 2.34, "ふつうの人"], [30, 4.68, "多い人"]].map(([n, m, name]) => (
          <g key={name as string}>
            <rect data-qa="mark" data-qa-label={`平均の回数：${name}`} x={X(n as number) - 60} y={base - (m as number) * 80} width={120} height={(m as number) * 80} rx={R.sm} fill={C.teal} />
            <Label x={X(n as number)} y={base - (m as number) * 80 - 20} anchor="middle" size="value">{`${m}回`}</Label>
            <Label x={X(n as number)} y={base + 52} anchor="middle">{`${n}個`}</Label>
          </g>
        ))}
        <line x1={X(20)} y1={300} x2={X(20)} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="14 10" />
        <Label x={X(20)} y={base + 52} anchor="middle" weight={900}>20個</Label>
        <Label x={1700} y={base + 100} anchor="end" size="note" color={C.ink2}>ログインするサービスの数</Label>
        <Label x={200} y={300} size="note" color={C.ink2}>平均で何回漏れたか</Label>
      </Svg>
      <SourceNote sim prefix="" text="100人の町（data/town_sim.py）" />
      <ChapterDots current={1} />
    </AbsoluteFill>
  );
};

// ================= 第2章：どこへ行くのか（質屋） =================
export const S25: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗品の値段と、慰謝料</Heading>
    <Svg>
      <Stall x={480} y={800} tag="1枚 約3,400円" />
      <Gavel x={1480} y={420} s={2.6} label="裁判" />
      <Label x={1480} y={590} anchor="middle" weight={900}>裁判で認められた慰謝料</Label>
      <Label x={1480} y={680} anchor="middle" size="value" color={C.debt} weight={900}>1人 1,000〜6,000円</Label>
    </Svg>
    <SourceNote text={SRC.court} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S26: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗品は、質屋に持ちこんでお金になる</Heading>
    <Svg>
      <Loot x={300} y={520} kind="card" s={2.6} label="盗んだカード情報" />
      <Label x={300} y={650} anchor="middle" weight={900}>盗んだカード情報</Label>
      <Arrow x1={460} y1={540} x2={700} y2={540} />
      <Pawnshop x={960} y={700} state="open" label="カードで買い物ができる店" big />
      <Arrow x1={1220} y1={540} x2={1440} y2={540} />
      <Coins x={1620} y={620} n={8} stacks={2} s={1.6} label="お金" />
      <Label x={1620} y={700} anchor="middle" weight={900}>お金</Label>
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S27: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect x={260} y={200} width={1400} height={480} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={320} y={280} color={C.ink2}>闇の売り場を調べた論文の題</Label>
      <Label x={960} y={440} anchor="middle" size="question" weight={900}>「金を、銀の値段で売る人はいない」</Label>
      <Label x={960} y={580} anchor="middle" color={C.ink2}>すぐお金に換えられるなら、安く売らずに自分で換えるはず</Label>
    </Svg>
    <SourceNote text={SRC.herley} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S28: React.FC = () => (
  <AbsoluteFill>
    <Heading>だから、安い</Heading>
    <Svg>
      <Stall x={420} y={760} s={0.85} items={["card", "id", "list", "card", "key", "card"]} />
      <g data-qa="mark" data-qa-label="品物を渡さない">
        <path d="M640 330 L740 430 M740 330 L640 430" stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" />
      </g>
      <Label x={420} y={820} anchor="middle">代金だけ取る売り手があふれる</Label>
      {["換えるのが難しい", "売り場も信用できない"].map((t, i) => (
        <g key={t}>
          <rect x={1000} y={270 + i * 160} width={720} height={120} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={1360} y={346 + i * 160} anchor="middle" weight={900}>{t}</Label>
        </g>
      ))}
      <Arrow x1={1360} y1={570} x2={1360} y2={640} />
      <Label x={1360} y={730} anchor="middle" size="question" weight={900}>だから安い</Label>
    </Svg>
    <SourceNote text={SRC.herley} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S29: React.FC = () => (
  <AbsoluteFill>
    <Heading>2通目：ポイントの交換先が質屋に</Heading>
    <Svg>
      <Clipboard x={220} y={500} s={2.4} label="アンケートのサイト" />
      <Label x={220} y={650} anchor="middle">アンケートのサイト</Label>
      <Arrow x1={340} y1={500} x2={480} y2={500} />
      <Loot x={580} y={500} kind="point" s={2.2} label="会員のポイント" />
      <Label x={580} y={650} anchor="middle">会員のポイント</Label>
      <Arrow x1={680} y1={500} x2={820} y2={500} />
      <Pawnshop x={1060} y={660} s={0.9} state="open" label="ポイントの交換先" big />
      <Arrow x1={1260} y1={500} x2={1380} y2={500} />
      <Coins x={1580} y={560} n={6} stacks={2} s={1.4} label="交換された額" />
      <Label x={1580} y={640} anchor="middle" weight={900}>勝手に交換 611件</Label>
      <Label x={1580} y={720} anchor="middle" size="value" color={C.gold} weight={900}>約287万円</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S30: React.FC = () => (
  <AbsoluteFill>
    <Heading>1通目：名前とメールでは換えられない</Heading>
    <Svg>
      {["名前", "メール", "電話番号"].map((t, i) => (
        <g key={t}>
          <g data-qa="mark" data-qa-label={`漏れた情報：${t}`}>
            <rect x={140} y={260 + i * 120} width={340} height={90} rx={R.md} fill={C.teal} />
            <text x={310} y={320 + i * 120} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{t}</text>
          </g>
        </g>
      ))}
      <Label x={140} y={680} color={C.ink2}>カードの情報は含まれない</Label>
      <Arrow x1={520} y1={480} x2={780} y2={480} />
      {/* 柵（もう一歩の手間） */}
      <g data-qa="prop" data-qa-label="柵">
        {[0, 1, 2, 3].map((k) => <rect key={k} x={820 + k * 50} y={380} width={20} height={300} rx={4} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />)}
        <rect x={810} y={440} width={190} height={22} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect x={810} y={590} width={190} height={22} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
      </g>
      <Label x={910} y={740} anchor="middle" weight={900}>もう一歩</Label>
      <Label x={910} y={790} anchor="middle" size="note" color={C.ink2}>本人をだます手間</Label>
      <Pawnshop x={1480} y={680} s={0.9} state="open" label="質屋" />
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S31: React.FC = () => (
  <AbsoluteFill>
    <Heading>去年の春に開いた質屋</Heading>
    <Svg>
      <Pawnshop x={620} y={715} s={1.25} state="open" label="証券口座" big />
      <StockChart x={1340} y={420} s={2.4} label="株" />
      <Label x={1340} y={580} anchor="middle">乗っ取られた口座で、</Label>
      <Label x={1340} y={640} anchor="middle">株が勝手に売り買いされた</Label>
    </Svg>
    <SourceNote text={SRC.fsa} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const M25 = [2, 0.8, 175, 1625, 1151, 233];
const fmtOku = (v: number) => (v >= 10 ? Math.round(v).toLocaleString() : `${Math.round(v * 10) / 10}`);
export const S32: React.FC = () => (
  <AbsoluteFill>
    <Heading>勝手に売られた株（月ごと）</Heading>
    <SubHead>売却金額（億円）。被害額ではない</SubHead>
    <Svg>
      <BarChart x={160} y={280} width={1000} height={440} max={1700} format={fmtOku}
        bars={M25.map((v, i) => ({ label: `${i + 1}月`, value: v, color: i === 3 ? C.gold : C.goldTint, focus: i === 3 }))} />
      <Label x={660} y={818} anchor="middle" size="note" color={C.ink2}>2025年</Label>
      <Label x={1240} y={700} anchor="middle" size="value" color={C.ink2}>…</Label>
      <line x1={1320} y1={260} x2={1320} y2={720} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="14 10" />
      <Label x={1340} y={300} size="note" weight={900}>国の求めの期限</Label>
      <Label x={1340} y={350} size="note" color={C.ink2}>（2026年6月末）</Label>
      <BarChart x={1400} y={280} width={360} height={440} max={1700} format={fmtOku}
        bars={[{ label: "7月", value: 0.2, color: C.goldTint }, { label: "8月", value: 2, color: C.goldTint }]} />
      <Label x={1580} y={818} anchor="middle" size="note" color={C.ink2}>2026年</Label>
    </Svg>
    <SourceNote text={SRC.fsa} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S33: React.FC = () => (
  <AbsoluteFill>
    <Heading>期限のあとは、多い月でも約2億円</Heading>
    <SubHead>時期は重なるが、それだけが原因かは分からない</SubHead>
    <Svg>
      <Pawnshop x={460} y={720} state="half" label="証券口座" big />
      <rect data-qa="mark" data-qa-label="2025年4月" x={1000} y={760 - 480} width={200} height={480} rx={R.sm} fill={C.gold} />
      <Label x={1100} y={260} anchor="middle" size="value">1,625億円</Label>
      <Label x={1100} y={810} anchor="middle">2025年4月</Label>
      <rect data-qa="mark" data-qa-label="2026年8月" x={1440} y={760 - 4} width={200} height={4} fill={C.gold} />
      <Label x={1540} y={730} anchor="middle" size="value">約2億円</Label>
      <Label x={1540} y={810} anchor="middle">2026年8月</Label>
      <line x1={940} y1={760} x2={1700} y2={760} stroke={C.ink} strokeWidth={LINE.thin} />
    </Svg>
    <SourceNote text={SRC.fsa} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const FORGE: [number, number][] = [[1997, 12], [1998, 28], [1999, 90.9], [2000, 140.2], [2001, 146.4], [2002, 165], [2003, 164.4], [2004, 105.6], [2005, 83.4], [2006, 45.6],
  [2007, 39.1], [2008, 52.5], [2009, 49.2], [2010, 41.3], [2011, 25.8], [2012, 24.1], [2013, 25.8], [2014, 19.5], [2015, 23.1], [2016, 30.6], [2017, 31.7],
  [2018, 16], [2019, 17.8], [2020, 8], [2021, 1.5], [2022, 1.7], [2023, 3.1], [2024, 5.9], [2025, 7.2]];
export const S34: React.FC = () => (
  <AbsoluteFill>
    <Heading>偽造カードの被害（年ごと）</Heading>
    <SubHead>億円</SubHead>
    <Svg>
      <LineChart x={200} y={250} width={1300} height={500} xDomain={[1997, 2025]} yDomain={[0, 180]} xTicks={[2000, 2005, 2010, 2015, 2020]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v * 10) / 10}億円`} eras={[{ x: 2014, label: "数え方が変わる" }]}
        series={[{ label: "偽造", points: FORGE, color: C.gold, focus: true }]} />
      <Label x={420} y={260} weight={900}>2002年 165億円</Label>
    </Svg>
    <SourceNote text={SRC.jca} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
  <AbsoluteFill>
    <Heading>偽造カードの質屋は、閉まった</Heading>
    <Svg>
      <Pawnshop x={420} y={720} state="closed" label="偽造カード" big />
      <ICChip x={900} y={420} s={2.4} label="ICチップ" />
      <Label x={900} y={560} anchor="middle">ICチップへの切り替え</Label>
      <ShareCol x={1260} y={260} h={480} value={93} text="93%" color={C.gold} tint={C.goldTint} name="番号の盗用（2025年）" />
    </Svg>
    <SourceNote text={SRC.jcaShare} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const MISUSE: [number, number][] = [[2014, 67.3], [2015, 72.2], [2016, 88.9], [2017, 176.7], [2018, 187.6], [2019, 222.9], [2020, 223.6], [2021, 311.7], [2022, 411.7], [2023, 504.7], [2024, 513.5], [2025, 475.4]];
export const S36: React.FC = () => (
  <AbsoluteFill>
    <Heading>番号を盗んで使う被害（年ごと）</Heading>
    <SubHead>億円。2025年に、記録が残るなかではじめて減った</SubHead>
    <Svg>
      <LineChart x={200} y={250} width={1300} height={500} xDomain={[2014, 2025]} yDomain={[0, 600]} xTicks={[2014, 2017, 2020, 2023, 2025]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v)}億円`} series={[{ label: "番号の盗用", points: MISUSE, color: C.gold, focus: true }]} />
    </Svg>
    <SourceNote text={SRC.jca} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
const Times: React.FC = () => (
  <Svg>
    <HBar x={560} y={340} h={130} w={1260} color={C.teal} name="だますメールの届け出" value="123倍（約2万件 → 約245万件）" valueAbove />
    <HBar x={560} y={620} h={130} w={(2.2 / 123) * 1260} color={C.gold} name="カードの被害額" value="2.2倍（235億円 → 511億円）" />
  </Svg>
);
export const S37: React.FC = () => (
  <AbsoluteFill>
    <Heading>7年で何倍になったか（2018→2025年）</Heading>
    <Times />
    <SourceNote text={SRC.jcaPhish} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S38: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗む側は、どれだけ稼いでいる？</Heading>
    <Svg>
      {([[290, "closed", "偽造カード"], [723, "open", "カード番号"], [1157, "half", "証券口座"], [1590, "open", "ポイント交換"]] as const).map(([x, st, n]) => (
        <Pawnshop key={n} x={x} y={640} s={0.75} state={st} label={n} />
      ))}
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);

// ================= 第3章：盗む側の稼ぎ =================
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>不正アクセスで捕まった100人</Heading>
    <SubHead>去年 248人を100人にすると。7割近くが10代と20代</SubHead>
    <Svg>
      {Array.from({ length: 100 }, (_, i) => (
        <Figure key={i} kind="other" color={i < 33 ? C.ink : i < 70 ? C.ink2 : C.rest} x={180 + (i % 20) * 60} y={340 + Math.floor(i / 20) * 100} size={1.4} />
      ))}
      {[[C.ink, "10代", "33人"], [C.ink2, "20代", "37人"], [C.rest, "それ以外", "30人"]].map(([c, n, v], i) => (
        <g key={n}>
          <rect data-qa="mark" data-qa-label={`凡例：${n}`} x={1440} y={330 + i * 110} width={44} height={44} rx={6} fill={c} />
          <Label x={1504} y={366 + i * 110} weight={900}>{`${n} ${v}`}</Label>
        </g>
      ))}
      <Label x={1440} y={720} size="note" color={C.ink2}>多くは、なりすましのログイン</Label>
    </Svg>
    <SourceNote text={SRC.npaArrest} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S40: React.FC = () => (
  <AbsoluteFill>
    <Heading>大きな攻撃も、分業の仕事</Heading>
    <SubHead>ランサムウェアの大きなグループ</SubHead>
    <Svg>
      <Tool x={420} y={460} s={2.6} label="攻撃の道具" />
      <Label x={420} y={620} anchor="middle" weight={900}>道具を作る側</Label>
      <Arrow x1={600} y1={460} x2={1040} y2={460} />
      <Label x={820} y={420} anchor="middle" color={C.ink2}>道具を貸す</Label>
      {Array.from({ length: 6 }, (_, i) => (
        <Figure key={i} kind="other" color={C.ink2} x={1140 + (i % 3) * 140} y={440 + Math.floor(i / 3) * 160} size={2} />
      ))}
      <Label x={1280} y={720} anchor="middle" weight={900}>借りて攻撃する実行役</Label>
    </Svg>
    <SourceNote text={SRC.nca} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Heading>作る側は2割、実行役の多くは無報酬</Heading>
    <Svg>
      <ShareCol x={220} y={260} h={480} value={20} text="2割" color={C.gold} tint={C.goldTint} name="身代金の取り分" />
      <Label x={720} y={250} weight={900}>実行役 194人</Label>
      <rect data-qa="mark" data-qa-label="凡例：報酬あり" x={1000} y={218} width={40} height={40} rx={6} fill={C.gold} />
      <Label x={1056} y={250}>報酬あり</Label>
      <rect data-qa="mark" data-qa-label="凡例：報酬なし" x={1260} y={218} width={40} height={40} rx={6} fill={C.rest} />
      <Label x={1316} y={250}>報酬なし（最大114人）</Label>
      {Array.from({ length: 194 }, (_, i) => (
        <Figure key={i} kind="other" color={i < 114 ? C.rest : C.gold} x={740 + (i % 20) * 54} y={330 + Math.floor(i / 20) * 50} size={0.8} />
      ))}
    </Svg>
    <SourceNote text={SRC.doj} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S42: React.FC = () => (
  <AbsoluteFill>
    <Heading>仕事の多くは、地味で退屈な保守作業</Heading>
    <Svg>
      <Desk x={760} y={760} size={4} w={110} />
      <Figure kind="other" color={C.ink2} x={600} y={760} size={4} pose="sit" />
      <Clipboard x={1300} y={420} s={2.2} label="点検の一覧" />
      <Tool x={1300} y={640} s={2.2} label="手入れの道具" />
      <Label x={1440} y={440}>設備の手入れ</Label>
      <Label x={1440} y={660}>問い合わせの対応</Label>
    </Svg>
    <SourceNote text={SRC.collier} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S43: React.FC = () => (
  <AbsoluteFill>
    <Heading>襲われた側の損</Heading>
    <SubHead>国内のランサムウェア被害</SubHead>
    <Svg>
      <ShareCol x={420} y={260} h={460} value={63} text="63%" color={C.debt} tint={C.debtTint} name="中小企業" />
      <ShareCol x={1160} y={260} h={460} value={52} text="52%" color={C.debt} tint={C.debtTint} name="1,000万円以上かかった" />
    </Svg>
    <SourceNote text={SRC.npaDamage} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
const PAY: [number, number][] = [[2022.875, 37], [2023.875, 29], [2024.875, 25], [2025.375, 26], [2025.625, 23], [2025.875, 20]];
const Firms: React.FC<{ y: number; n: number; text: string }> = ({ y, n, text }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} data-qa="mark" data-qa-label={`組織${i + 1}`} x={1380 + i * 84} y={y} width={60} height={80} rx={6} fill={i === 0 ? C.gold : C.rest} />
    ))}
    <text x={1380} y={y + 136} style={font("label")} fontWeight={900}>{text}</text>
  </g>
);
export const S44: React.FC = () => (
  <AbsoluteFill>
    <Heading>身代金を払う組織の割合</Heading>
    <Svg>
      <LineChart x={200} y={260} width={960} height={460} xDomain={[2022.5, 2026]} yDomain={[0, 40]} xTicks={[2023, 2024, 2025, 2026]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v)}%`} series={[{ label: "払った割合", points: PAY, color: C.gold, focus: true }]} />
      <Firms y={280} n={3} text="3社に1社（2022年末）" />
      <Firms y={560} n={5} text="5社に1社（2025年末）" />
    </Svg>
    <SourceNote text={SRC.coveware} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S45: React.FC = () => (
  <AbsoluteFill>
    <Heading>世界で払われた身代金（年ごと）</Heading>
    <SubHead>2025年は速報</SubHead>
    <Svg>
      <BarChart x={260} y={260} width={1400} height={480} max={13} format={(v) => `${(Math.round(v * 10) / 10).toFixed(1)}億ドル`}
        bars={[[2020, 6.9], [2021, 7.7], [2022, 5.7], [2023, 12.5], [2024, 8.9], [2025, 8.2]].map(([y, v]) => ({ label: `${y}年`, value: v, color: y === 2025 ? C.gold : C.goldTint, focus: y === 2025 }))} />
    </Svg>
    <SourceNote text={SRC.chain} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);

// ================= 答え合わせ =================
export const S46: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="漏えいは、この数年で激増した" mark="△" word="半分本当"
      reason={["盗まれる漏えいは\n約6倍に", "見出しの数は延べや\n1つの事故の何社分"]} />
  </AbsoluteFill>
);
export const S47: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="漏れた情報は、すぐお金になる" mark="×" word="ちがう"
      reason={["お金に変わるのは\n質屋に持ちこめた分だけ", "名前とメールだけでは\n換えられない"]} />
  </AbsoluteFill>
);
export const S48: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="盗むのは、腕のいい天才ハッカー" mark="×" word="ちがう"
      reason={["捕まった事件の多くは\nなりすましのログイン", "大きな攻撃も\n分業の仕事"]} />
  </AbsoluteFill>
);
export const S49: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="盗む側は、大儲けしている" mark="△" word="半分本当"
      reason={["道具を作る側は\n身代金の2割", "実行役の6割近くは\n無報酬（多い見積もり）"]} />
  </AbsoluteFill>
);
export const S50: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の答え：本当の話は、ゼロ</Heading>
    <SubHead>半分本当が2つ、ちがうが2つ</SubHead>
    <ClaimCards x={96} y={250} w={1728} items={CLAIMS} cols={4} marks={["△", "×", "×", "△"]} words={["半分本当", "ちがう", "ちがう", "半分本当"]} />
    <CountPick x={96} y={600} label="本当の話は" answer={0} />
  </AbsoluteFill>
);

// ================= 示唆・教訓 =================
export const S51: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏えいのニュースを読み直す3つの点</Heading>
    <Svg>
      {["見出しの件数は、延べか、最大の見込みか", "1つの事故が、何社分のおわびになっているか", "漏れた情報を、そのまま換えられる質屋があるか"].map((t, i) => (
        <g key={i}>
          <rect x={160} y={230 + i * 180} width={1600} height={140} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <circle cx={240} cy={300 + i * 180} r={40} fill={C.ink} />
          <text x={240} y={316 + i * 180} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{i + 1}</text>
          <text x={320} y={318 + i * 180} style={font("body")} fontWeight={900}>{t}</text>
        </g>
      ))}
    </Svg>
  </AbsoluteFill>
);
export const S52: React.FC = () => (
  <AbsoluteFill>
    <Kitchen face="normal" pose="sit">
      {[770, 830, 890, 950].map((x, i) => <Envelope key={x} x={x - 0} y={688} s={0.85} label={`おわび${i + 1}`} />)}
    </Kitchen>
  </AbsoluteFill>
);
export const S53: React.FC = () => (
  <AbsoluteFill>
    <Heading>売り場とお金のあいだに、質屋がある</Heading>
    <Svg>
      <Stall x={300} y={720} s={0.75} />
      <Label x={300} y={790} anchor="middle">売り場</Label>
      <Arrow x1={500} y1={560} x2={620} y2={560} />
      <Pawnshop x={820} y={720} s={0.75} state="closed" label="偽造カード" />
      <Pawnshop x={1220} y={720} s={0.75} state="half" label="証券口座" />
      <Arrow x1={1410} y1={560} x2={1530} y2={560} />
      <Coins x={1680} y={640} n={4} stacks={2} s={1.4} label="お金" />
      <Label x={1680} y={720} anchor="middle">お金</Label>
    </Svg>
  </AbsoluteFill>
);
export const S54: React.FC = () => (
  <AbsoluteFill>
    <Heading>開いている質屋で、被害は変わる</Heading>
    <Svg>
      <Pawnshop x={320} y={470} s={0.7} state="closed" />
      <Label x={620} y={360} size="value" color={C.gold} weight={900}>165億円 → 7.2億円</Label>
      <Label x={620} y={420} color={C.ink2}>偽造カードの被害（2002年 → 2025年）</Label>
      <Pawnshop x={320} y={800} s={0.7} state="half" />
      <Label x={620} y={690} size="value" color={C.gold} weight={900}>1,625億円 → 約2億円</Label>
      <Label x={620} y={750} color={C.ink2}>勝手に売られた株（2025年4月 → 2026年8月）</Label>
    </Svg>
    <SourceNote text="日本クレジット協会、金融庁" />
  </AbsoluteFill>
);
export const S55: React.FC = () => (
  <AbsoluteFill>
    <Heading>入り口は123倍、被害額は2.2倍</Heading>
    <Times />
    <SourceNote text={SRC.jcaPhish} />
  </AbsoluteFill>
);
export const S56: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const P: Omit<Panel, "key">[] = [
  { title: "冒頭：秋の火曜の夜、台所の彼", C: S01, sec: 6.9, lines: "秋の、火曜の夜です。", move: "夜の窓から台所へ引く。彼がスマホに「お詫び」と打つ。名札（会社員（28））は1.5秒" },
  { title: "冒頭：受信箱の4通", C: S02, sec: 12.8, lines: "出てきたのは4通です。", move: "スマホの画面に寄る（受信箱が画面いっぱい）。検索結果の4行が上から順に出る。読む行に墨の枠が移る（1通目→2通目）" },
  { title: "冒頭：3通目、免許証の画像", C: S03, sec: 14.1, lines: "3通目は、ときどき使う", move: "3通目が開いて中身の札に。「運転免許証などの画像」に青緑の帯。右に回想の円がひらき、彼が免許証を撮る（フラッシュ1回）" },
  { title: "冒頭：焼肉と、アンケートと、車と、株", C: S04, sec: 10.2, lines: "4通目は、去年口座を", move: "4通の目印が受信箱から抜け出して横に並ぶ。あいだに「？」がぽん、ぽん、ぽん" },
  { title: "冒頭：この半月で約2,000万件", C: S05, sec: 8.3, lines: "この半月ほどで公表された", move: "6本の横棒が上から順に伸びる（同じ物差し）。最後に右上の合計が数え上がる" },
  { title: "冒頭：SNSの投稿と、彼のため息", C: S06, sec: 17.6, lines: "SNSでは、日本人の", move: "台所に戻る。右上に投稿が流れてきて止まる。彼が息をつき、考えの吹き出しが2つ" },
  { title: "最初の驚き：日本のカードがいちばん高い", C: S07, sec: 13.5, lines: "盗まれたカードの売り場を", move: "平均の棒が先に伸び、日本の棒がそれを追い越して伸びる。最後に「約2.6倍」" },
  { title: "最初の驚き：それでも約3,400円", C: S08, sec: 14.2, lines: "それでも、1枚およそ", move: "金の数字が数え上がって止まる。右にジョッキ。最後の文で問いの札" },
  { title: "今日の答え合わせ：よく聞く4つの話（1・2）", C: S09, sec: 14.3, lines: "漏えいのニュースのたびに", move: "カードが1枚ずつ表に返る（1つ目・2つ目）。残りは点線の空き枠" },
  { title: "今日の答え合わせ：4つの話（3・4）", C: S10, sec: 10.0, lines: "3つ目は「天才」。", move: "3枚目・4枚目が表に返る" },
  { title: "予想タイム：本当の話はいくつ？", C: S11, sec: 7.8, lines: "この4つのうち、本当の", move: "4枚が上に縮んで横1列。下に0〜4の札が並ぶ。ゴサが考える顔。3秒の輪" },
  { title: "今日の順番", C: S12, sec: 10.6, lines: "まず、本当に増えたのか", move: "3枚の札が左から並ぶ（棒・質屋・硬貨）。最後に1枚目が拡大して第1章の扉へ" },
  { title: "第1章：国への報告の8割は人のミス", C: S13, sec: 14.1, lines: "国に届く漏えいの報告は", move: "第1章の扉 → 100マスが左上から灰で埋まり（81）、青緑（9）、淡い灰（10）。「8割は、人のミス」" },
  { title: "盗まれる漏えい：17件 → 108件", C: S14, sec: 18.8, lines: "上場企業とその子会社が", move: "左の棒が伸び、右の棒が大きく伸びる。間に括弧と「約6倍」" },
  { title: "ミスの事故は、ほとんど増えていない", C: S15, sec: 7.5, lines: "同じ調べで、ミスによる", move: "灰の線（ミス）が先に横ばいで引かれ、青緑の線（盗まれる）が右肩上がりで追い越す" },
  { title: "ランサムウェアの届け出：半年で過去最多", C: S16, sec: 8.4, lines: "会社のデータを人質に", move: "灰の棒が左から順に伸び、最後の棒（26上）だけ墨で伸びて跳ねる" },
  { title: "4通目：証券会社 → 専門の会社", C: S17, sec: 14.6, lines: "それなら、彼の4通は", move: "受信箱の4通目が拡大して証券会社の目印に。矢印が右へ伸び、専門の会社が出る" },
  { title: "1か所から、最大5社のおわび", C: S18, sec: 16.1, lines: "その専門の会社は、同じ", move: "下の委託先から線が5本伸び、上の5社に封筒が1通ずつ飛ぶ" },
  { title: "国への報告の7件に1件が、1つの事故から", C: S19, sec: 19.5, lines: "国への報告も、事故の数", move: "全体の帯が出て、左端の墨の部分が伸びる（14%）。下にクラウドの目印" },
  { title: "延べ2億人超：人口の約1.7倍", C: S20, sec: 15.2, lines: "ここまで聞くと、日本人は", move: "人口の正方形が先に出て、その横で青緑の正方形が大きく育つ（面積＝人数）" },
  { title: "延べなので、同じ人が何度も", C: S21, sec: 10.0, lines: "でも、延べなので", move: "1人の人型にしるしが1つずつ付く（3つ）。右の札で「最大」「延べ」に墨の下線" },
  { title: "100人の町に配る", C: S22, sec: 16.8, lines: "そこで、延べの数を", move: "100人が3つの層に歩いて並ぶ（少ない人が多い）。層ごとに使うサービスの数の札" },
  { title: "3人に1人は一度も漏れていない", C: S23, sec: 16.3, lines: "しるしを配り終えると", move: "しるしが雨のように降り、人の色が変わる（0回は墨2のまま、3回以上は青緑）。下に凡例と人数" },
  { title: "サービスが20を超えるなら", C: S24, sec: 11.3, lines: "ログインするサービスが20", move: "町の3つの層が縮んで棒になる。20個の点線が上から下りる" },
  { title: "第2章：盗品の値段と慰謝料", C: S25, sec: 12.7, lines: "SNSの投稿のとおり", move: "第2章の扉 → 屋台の棚に盗品が並び、金の値札が下がる。右に木づちが下りて赤い数字" },
  { title: "質屋に持ちこんで、はじめてお金に", C: S26, sec: 15.7, lines: "なぜ、それほど安いの", move: "カードが矢印に沿って質屋へ入り、反対側から硬貨が積み上がる" },
  { title: "論文の題：金を、銀の値段で売る人はいない", C: S27, sec: 15.2, lines: "闇の売り場を調べた研究者", move: "題の札が上から下りる。「金」と「銀」に下線。下の説明が出る" },
  { title: "代金だけ取る売り手：だから安い", C: S28, sec: 13.3, lines: "しかも売り場には", move: "屋台の横に × が押される。右に理由の札2つ → 矢印 → 「だから安い」" },
  { title: "2通目：ポイントの交換先が質屋", C: S29, sec: 17.8, lines: "彼の2通目にも", move: "アンケート → ポイント → 質屋 → 硬貨の順に矢印が伸びる。最後に「約287万円」" },
  { title: "1通目：名前とメールでは換えられない", C: S30, sec: 17.3, lines: "一方、焼肉のアプリで", move: "青緑の札3枚が矢印に沿って進み、柵で止まる。柵の下に「もう一歩」" },
  { title: "去年の春に開いた質屋：証券口座", C: S31, sec: 15.0, lines: "質屋は、新しく開くことも", move: "質屋のシャッターが上がり、暖簾が出る。右に株の目印" },
  { title: "勝手に売られた株：多い月は1,600億円超", C: S32, sec: 14.1, lines: "多い月には、勝手に", move: "2025年の棒が伸び、4月が金で跳ねる。期限の点線が下り、2026年の棒はほぼ0のまま" },
  { title: "期限のあと：多い月でも約2億円", C: S33, sec: 10.3, lines: "その期限を過ぎた今年の", move: "質屋のシャッターが半分まで下りる。同じ物差しで右の棒がほぼ0に" },
  { title: "もっと前に閉まった質屋：偽造カード", C: S34, sec: 15.5, lines: "もっと前に閉まった質屋", move: "金の線が1997年から引かれ、2002年の山を越えて0近くまで落ちる" },
  { title: "ICチップと、番号の盗用93%", C: S35, sec: 11.8, lines: "カードにICチップを", move: "質屋のシャッターが下まで下りる。ICチップがカードにはまる。右の柱の濃い部分が伸びる" },
  { title: "番号の盗用、はじめて減った", C: S36, sec: 11.0, lines: "同じころ、ネットの店にも", move: "金の線が右肩上がりに引かれ、2025年で少し下がる" },
  { title: "だますメール123倍、被害額2.2倍", C: S37, sec: 15.1, lines: "その番号を聞き出す", move: "青緑の棒が画面の端まで伸びる。下の金の棒はほとんど伸びない" },
  { title: "4つの質屋：盗む側はどれだけ稼ぐ？", C: S38, sec: 8.8, lines: "それでも、だますメールの", move: "第2章の質屋が4軒並ぶ（閉・開・半・開）。見出しの問い" },
  { title: "第3章：捕まった人の7割近くは10代と20代", C: S39, sec: 11.5, lines: "不正アクセスで去年捕まった", move: "第3章の扉 → 100人が並び、10代（墨）・20代（墨2）の順に色が付く" },
  { title: "大きな攻撃も分業", C: S40, sec: 15.8, lines: "お金が大きく動く攻撃も", move: "左に道具、右に実行役が6人。道具が矢印に沿って配られる" },
  { title: "道具を作る側は2割、実行役の多くは無報酬", C: S41, sec: 14.7, lines: "アメリカの司法省の発表", move: "柱の金（2割）が伸びる。右の194人が灰で並び、金が80人だけ灯る" },
  { title: "地味で退屈な保守作業", C: S42, sec: 7.0, lines: "サイバー犯罪の現場で", move: "机の人型があくびをする。右の札が1つずつ出る" },
  { title: "襲われた側の損", C: S43, sec: 13.8, lines: "一方、襲われた側の損", move: "赤い柱が2本、下から伸びる（63%・52%）" },
  { title: "身代金を払う組織は5社に1社へ", C: S44, sec: 15.9, lines: "それでも、稼ぎの元になる", move: "金の線が右下がりに引かれる。右の組織の列が3つ → 5つに増え、金は1つのまま" },
  { title: "世界の身代金は増えていない", C: S45, sec: 14.7, lines: "世界で払われた身代金の合計", move: "金の棒が左から順に伸びる（2023年が山）。2025年の棒が跳ねる" },
  { title: "答え合わせ1：激増 → 半分本当", C: S46, sec: 20.0, lines: "1つ目の「激増」。", move: "共通の判定。証拠2つ → △「半分本当」" },
  { title: "答え合わせ2：すぐ現金 → ちがう", C: S47, sec: 7.7, lines: "2つ目の「すぐ現金」。", move: "共通の判定。証拠2つ → ×「ちがう」" },
  { title: "答え合わせ3：天才 → ちがう", C: S48, sec: 10.2, lines: "3つ目の「天才」。", move: "共通の判定。証拠2つ → ×「ちがう」" },
  { title: "答え合わせ4：大儲け → 半分本当", C: S49, sec: 17.3, lines: "4つ目の「大儲け」。", move: "共通の判定。証拠2つ → △「半分本当」" },
  { title: "予想の答え：ゼロ", C: S50, sec: 9.0, lines: "予想の答えは、ゼロ。", move: "予想タイムの4枚に戻り、印が1枚ずつ押される。下の札で「0つ」が墨に" },
  { title: "示唆：読み直す3つの点", C: S51, sec: 15.3, lines: "漏えいのニュースは、3つの", move: "3枚の札が上から1枚ずつ出る" },
  { title: "教訓：台所の4通", C: S52, sec: 10.1, lines: "彼は、4通のおわびを", move: "台所に戻る。テーブルに封筒が4通並ぶ。彼が座って見下ろす" },
  { title: "教訓：売り場とお金のあいだの質屋", C: S53, sec: 16.2, lines: "ただ、売り場に並ぶことと", move: "屋台から矢印が伸び、閉まった質屋・半分の質屋で止まる。硬貨は少しだけ" },
  { title: "教訓：開いている質屋で被害は変わる", C: S54, sec: 9.1, lines: "漏えいの被害は、盗まれた", move: "2軒の質屋の横に、前と後の額が出る（前の額に取り消し線は引かない）" },
  { title: "締め：入り口は123倍、被害額は2.2倍", C: S55, sec: 16.1, lines: "盗む入り口の、だますメール", move: "第2章の横棒に戻る（回収）。青緑の棒が伸び切り、金の棒は短いまま" },
  { title: "締めのひと言（毎回同じ）", C: S56, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const panels: Panel[] = P.map((p, i) => ({ key: String(i + 1).padStart(2, "0"), ...p }));
export const storyboard: StoryboardDef = { id: "007-data-leaks", title: "漏えいのニュースが止まらない。漏れた情報は、どこへ行くのか（第1版）", panels };
export default storyboard;
