// 7本目「漏えいのニュースが止まらない。漏れた情報は、どこへ行くのか」の絵コンテ。
// 第2版：3役の見直しを反映（review/storyboard-summary.md）。2026-10-07。台本は script.md の第6稿・改。
//   第1版からの主な変更：答え合わせの記号（〇△×）をやめて SplitClaim（当たっていた所／外れていた所に割れる札）の1つの舞台に。
//   質屋の3つの状態を描き分け（開＝暖簾と金の光、半分＝シャッター65%、閉＝灰と「閉」の札）。第2章の質屋の場面に小さな受信箱（InboxMini）。
//   09と10、14と15、32と33をそれぞれ1枚に。証券の月ごとの棒は2025年1月〜2026年8月をすべて同じ間隔で（金融庁の表。data/fsa_securities_monthly.csv）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（data/sb_secs.py で入れる）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。key は一覧の番号と同じ（01〜。並べた順に自動で付く）。
// 意味の色（この回）：青緑（teal）＝情報（漏れた件数・人数・盗品）、金（gold）＝お金に換わった額（不正利用・身代金・犯人の取り分）、
//   赤（debt）＝損（被害を受けた側の後始末）、灰（other）＝ミスの件数。それ以外は墨と灰。墨と墨2を別の意味に使わない。
//   答え合わせだけは、青緑の縁＝当たっていた所、灰の縁＝外れていた所（SplitClaim）。
// 物語の場面は猫（彼＝male、名札「会社員（28）」）、データの人数は人型。同じ場面に混ぜない。章の中では猫の代わりに小さな受信箱で彼の話をつなぐ。
// 比喩は「質屋」（Pawnshop）：開いている／半分閉まった／閉まった。闇の売り場は抽象的な屋台（Stall）。
// 特定の企業・大学を責めない（会社名・ロゴを描かない。漏えいは大きさの順に並べない）。攻撃の手口は描かない。助言に見える強調はしない。
// 割合は分母を図の中に1行で書く。速報は薄い塗りと注。期間は「…」で省かない。比の図には1倍の線。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BarChart } from "@lib/BarChart";
import { Bracket } from "@lib/Bracket";
import { Cat, CatLabel } from "@lib/Cat";
import type { CatFace, CatPose } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { ClaimCards, ClaimIcon, CountPick } from "@lib/Claims";
import { Gosa } from "@lib/Gosa";
import { CallDesk, CarIcon, Clipboard, CloudIcon, Envelope, Gavel, Grill, ICChip, IdCard, Ingot, Mug, Office, StockChart, Tool } from "@lib/Icons";
import { Inbox, InboxMini } from "@lib/Inbox";
import { EnterG, ramp } from "@lib/Motion";
import { Note } from "@lib/Labels";
import { LineChart } from "@lib/LineChart";
import { Coins, Loot, Pawnshop, Stall } from "@lib/Pawnshop";
import { Desk, Table } from "@lib/Props";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import { ClaimStrip, SplitClaim } from "@lib/SplitClaim";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Thought } from "@lib/StoryAnim";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
// 細かい動き（2026-10-10 仮通し）：どれも4秒（120コマ）以内に終える。絵コンテの静止画（最後のコマ）は変わらない
const num = (v: number) => Math.round(v).toLocaleString("en-US");
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
/** 矢印（線と三角。色は意味の色：青緑＝情報が進む、金＝お金が出る、墨2＝それ以外） */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, color = C.ink2, w = LINE.base }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), k = 16 + w * 1.6;
  const p1 = [x2 - k * Math.cos(a - 0.45), y2 - k * Math.sin(a - 0.45)], p2 = [x2 - k * Math.cos(a + 0.45), y2 - k * Math.sin(a + 0.45)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 10 * Math.cos(a)} y2={y2 - 10 * Math.sin(a)} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} fill={color} />
    </g>
  );
};
/** 100%の柱1本（濃い部分＝value）。値は濃い部分の上端の横に書く。of は柱の上に書く分母（1行） */
const ShareCol: React.FC<{ x: number; y: number; h: number; value: number; text: string; color: string; tint: string; name: string; w?: number; of?: string }> = (
  { x, y, h, value, text, color, tint, name, w = 200, of },
) => {
  const hv = (h * value) / 100;
  return (
    <g>
      {of && <text x={x} y={y - 24} style={font("note", C.ink2)}>{of}</text>}
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
  court: "NordVPN 2025年。慰謝料は判決の報道から（2019〜2023年の判決）",
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

// 彼の4通（受信箱の順。冒頭・第2章の小さな受信箱・教訓で同じ並び）
const MAIL = [
  { name: "焼肉", from: "焼肉の店のアプリ", subject: "会員情報の漏えいに関するお詫び", date: "10/5", icon: (x: number, y: number, s = 1) => <Grill x={x} y={y} s={s} label="焼肉の目印" /> },
  { name: "アンケート", from: "アンケートのサイト（ポイント）", subject: "不正アクセスに関するお詫び", date: "10/5", icon: (x: number, y: number, s = 1) => <Clipboard x={x} y={y} s={s} label="アンケートの目印" /> },
  { name: "車", from: "カーシェア", subject: "お客さま情報の漏えいのお詫び", date: "9/28", icon: (x: number, y: number, s = 1) => <CarIcon x={x} y={y} s={s} label="車の目印" /> },
  { name: "株", from: "証券会社", subject: "委託先での情報漏えいのお詫び", date: "10/6", icon: (x: number, y: number, s = 1) => <StockChart x={x} y={y} s={s} label="株の目印" /> },
];
/** 第2章の質屋の場面の右上に、彼の4通を小さく残す（focus の1通が光る） */
const Mini: React.FC<{ focus: number }> = ({ focus }) => (
  <InboxMini x={1440} y={150} w={420} focus={focus} rows={MAIL.map((m) => ({ name: m.name, icon: (x: number, y: number) => m.icon(x, y, 0.75) }))} />
);

// ================= 夜の台所（冒頭・教訓で同じ部屋） =================
// 第2版：夜を暗く（夜の色を重ねる）、台所の物（流し台・やかん・掛け時計 23:40・冷蔵庫）、机の上のランプの光だまり。
const K = { floor: 820, tableX: 860, catX: 1120, size: 5.2 };
const KitchenRoom: React.FC<{ glow?: number }> = ({ glow = 0.2 }) => {
  const ink = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const hand = (deg: number, len: number) => `L${640 + Math.sin((deg * Math.PI) / 180) * len} ${250 - Math.cos((deg * Math.PI) / 180) * len}`;
  return (
    <Svg>
      <g data-qa="bg" data-qa-label="夜の台所">
        <rect x={0} y={0} width={1920} height={K.floor} fill={C.wall} />
        <rect x={0} y={K.floor} width={1920} height={260} fill={C.floor} />
        <line x1={0} x2={1920} y1={K.floor} y2={K.floor} {...ink} />
        {/* 窓（夜の空と月） */}
        <rect x={130} y={170} width={360} height={290} rx={R.sm} fill={C.night} {...ink} />
        <circle cx={410} cy={240} r={30} fill={C.wall} />
        {[[190, 220], [250, 300], [330, 210], [200, 390]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={C.wall} />)}
        <path d="M310 170 V460 M130 315 H490" {...ink} />
        {/* 流し台とやかん */}
        <rect x={90} y={600} width={570} height={220} fill={C.paper2} {...ink} />
        <rect x={76} y={582} width={598} height={22} rx={4} fill={C.white} {...ink} />
        <path d="M280 604 V820 M470 604 V820" stroke={C.ink2} strokeWidth={LINE.hair} />
        <path d="M210 582 V520 H262 V548" fill="none" {...ink} strokeWidth={LINE.base} />
        <path d="M520 582 Q512 520 566 516 Q622 520 612 582 Z" fill={C.white} {...ink} />
        <path d="M612 560 L652 532 M540 520 Q566 486 592 520" fill="none" {...ink} />
        {/* 掛け時計（23:40） */}
        <circle cx={640} cy={250} r={58} fill={C.white} {...ink} />
        <path d={`M640 250 ${hand(23 * 30 + 20, 30)} M640 250 ${hand(240, 44)}`} {...ink} strokeWidth={LINE.base - 2} />
        {/* 冷蔵庫 */}
        <rect x={1600} y={380} width={220} height={440} rx={R.md} fill={C.white} {...ink} />
        <path d="M1600 540 H1820 M1630 420 V500 M1630 580 V680" {...ink} />
      </g>
      {/* 夜の暗さ */}
      <rect data-qa="bg" data-qa-label="夜の暗さ" x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.42} />
      {/* つり下げのランプと、机の上の光だまり */}
      <g data-qa="bg" data-qa-label="ランプ">
        <path d={`M760 300 L960 300 L1300 ${K.floor} L420 ${K.floor} Z`} fill={C.white} opacity={glow} />
        <ellipse cx={860} cy={K.floor + 10} rx={460} ry={34} fill={C.white} opacity={glow + 0.1} />
        <line x1={860} y1={0} x2={860} y2={240} stroke={C.ink} strokeWidth={LINE.hair} />
        <path d="M790 300 L824 240 H896 L930 300 Z" fill={C.ink2} {...ink} />
        <ellipse cx={860} cy={300} rx={40} ry={8} fill={C.goldTint} />
      </g>
    </Svg>
  );
};
const Kitchen: React.FC<{ face?: CatFace; pose?: CatPose; look?: [number, number]; glow?: number; children?: React.ReactNode }> = (
  { face = "think", pose = "phone", look, glow, children },
) => (
  <>
    <KitchenRoom glow={glow} />
    <Svg>
      <Table x={K.tableX} y={K.floor} size={K.size} w={50} />
      <Cat kind="plain" x={K.catX} y={K.floor} size={K.size} pose={pose} face={face} facing={-1} look={look} label="彼" />
      {children}
    </Svg>
  </>
);

export const S01: React.FC = () => (
  <AbsoluteFill><Kitchen face="think"><CatLabel x={K.catX} y={K.floor} size={K.size} text="会社員（28）" /></Kitchen></AbsoluteFill>
);
export const S02: React.FC = () => (
  <AbsoluteFill>
    <Svg><Inbox phone x={410} y={130} w={1100} query="お詫び" count="4件" rows={MAIL.map((r, i) => ({ ...r, icon: (x: number, y: number) => r.icon(x, y), mark: i === 1 }))} /></Svg>
  </AbsoluteFill>
);
export const S03: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      {/* 左：3通目の中身（会社名は書かない） */}
      <rect x={110} y={200} width={800} height={580} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Envelope x={180} y={270} />
      <Label x={240} y={284} weight={900}>カーシェア</Label>
      <Label x={150} y={370} color={C.ink2}>漏れた可能性のある情報</Label>
      <Label x={170} y={440}>・会員の名前、住所、電話番号</Label>
      <Label x={170} y={510}>・運転免許証などの画像</Label>
      <rect x={150} y={580} width={720} height={150} rx={R.md} fill={C.tealTint} />
      <Label x={180} y={676} size="value" color={C.ink} weight={900}>画像 約160万件</Label>
      {/* 右：回想（昼の明るい色。免許証を撮った日） */}
      <defs><clipPath id="memo3"><circle cx={1380} cy={480} r={320} /></clipPath></defs>
      <g clipPath="url(#memo3)">
        <rect data-qa="bg" x={1060} y={160} width={640} height={640} fill={C.bg} />
        <rect data-qa="bg" x={1060} y={720} width={640} height={100} fill={C.paper2} />
        <Cat kind="plain" x={1220} y={740} size={3.4} pose="phone" face="normal" facing={1} look={[1, -0.3]} label="回想の彼" />
        <IdCard x={1500} y={500} s={2.4} label="免許証" />
        <g data-qa="bg" data-qa-label="フラッシュ">
          {[[-40, -24], [0, 0], [40, 24]].map(([dy, dx], i) => (
            <path key={i} d={`M${1350 + Math.abs(dx)} ${560 + dy} L${1310 + Math.abs(dx)} ${590 + dy * 1.6}`} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
          ))}
        </g>
      </g>
      <circle cx={1380} cy={480} r={320} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="18 12" />
      <Label x={1380} y={860} anchor="middle" color={C.ink2}>免許証の表と裏を撮った日</Label>
    </Svg>
  </AbsoluteFill>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <Heading>焼肉と、アンケートと、車と、株</Heading>
    <Svg>
      {MAIL.map((m, i) => {
        const x = 300 + i * 440;
        return (
          <g key={m.name}>
            <rect data-qa="bg" x={x - 110} y={350} width={220} height={220} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            {m.icon(x, 460, 2.3)}
            <Label x={x} y={650} anchor="middle" weight={900}>{m.name}</Label>
          </g>
        );
      })}
      {[520, 960, 1400].map((x) => <Label key={x} x={x} y={485} anchor="middle" size="question" color={C.ink}>？</Label>)}
    </Svg>
  </AbsoluteFill>
);
// 受信箱と同じ順（大きさの順にしない＝会社の順位に見せない）。1本の積み上げの帯にして合計を見せる
const LEAKS: { name: string; v: number; text: string }[] = [
  { name: "焼肉の店のアプリ", v: 10788963, text: "約1,079万件" },
  { name: "アンケートのサイト", v: 948498, text: "最大 約95万件" },
  { name: "カーシェア", v: 6600000, text: "約660万件" },
  { name: "問い合わせの委託先", v: 713126, text: "延べ 約71万件" },
  { name: "医療の会員サイト", v: 558700, text: "最大 約56万件" },
  { name: "大学", v: 130000, text: "約13万件" },
];
export const S05: React.FC = () => {
  const X0 = 160, BW = 1600, Y = 330, BH = 150;
  const total = LEAKS.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  const seg = LEAKS.map((l) => { const x = X0 + (acc / total) * BW, w = (l.v / total) * BW; acc += l.v; return { ...l, x, w }; });
  const below = [1, 3, 4, 5];
  const f = useCurrentFrame(), at = (i: number) => 6 + i * 10; // 帯を受信箱の順に伸ばし、合計を数え上げる
  return (
    <AbsoluteFill>
      <Heading>この半月ほどの主な漏えい</Heading>
      <SubHead>彼の受信箱と同じ順。帯の長さ＝件数</SubHead>
      <Svg>
        <Label x={X0 + BW} y={300} anchor="end" size="value" color={C.teal} weight={900}>{`合わせて 約${num(2000 * seg.reduce((t, x, i) => t + x.v * ramp(f, at(i), 16), 0) / total)}万件`}</Label>
        {seg.map((s, i) => (
          <rect key={s.name} data-qa="mark" data-qa-label={`帯：${s.name}`} x={s.x} y={Y} width={Math.max(s.w, 3) * ramp(f, at(i), 16)} height={BH} fill={i % 2 ? C.tealTint : C.teal} stroke={C.white} strokeWidth={3} />
        ))}
        {[0, 2].map((i) => (
          <g key={i} opacity={ramp(f, at(i) + 10, 8)}>
            <text x={seg[i].x + 24} y={Y + 64} style={font("label", C.white)} fontWeight={900} data-qa-allow="mark">{seg[i].name === "焼肉の店のアプリ" ? "焼肉の店のアプリ" : "カーシェア"}</text>
            <text x={seg[i].x + 24} y={Y + 120} style={font("label", C.white)} fontWeight={900} data-qa-allow="mark">{seg[i].text}</text>
          </g>
        ))}
        {below.map((i, k) => {
          const cx = seg[i].x + seg[i].w / 2, ty = 570 + k * 70;
          return (
            <g key={i} opacity={ramp(f, at(i) + 10, 8)}>
              <line x1={cx} y1={Y + BH} x2={cx} y2={ty - 8} stroke={C.ink2} strokeWidth={LINE.hair} />
              <Label x={cx - 20} y={ty} anchor="end">{`${seg[i].name} ${seg[i].text}`}</Label>
            </g>
          );
        })}
      </Svg>
      <SourceNote text={SRC.companies} />
    </AbsoluteFill>
  );
};
export const S06: React.FC = () => (
  <AbsoluteFill>
    <Kitchen face="sad">
      {/* 右上の空いた壁：SNS の投稿（抽象。実在の画面に似せない） */}
      <g data-qa="prop" data-qa-label="SNSの投稿">
        <rect x={1290} y={100} width={540} height={230} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <circle cx={1350} cy={156} r={26} fill={C.rest} />
        <rect x={1392} y={140} width={200} height={14} rx={7} fill={C.rest} />
        <rect x={1392} y={166} width={120} height={12} rx={6} fill={C.paper2} />
        <Loot x={1370} y={262} kind="card" s={1.3} label="投稿の中のカード" />
        <Label x={1440} y={254} size="note" weight={900}>日本のカード情報</Label>
        <Label x={1440} y={298} size="note" color={C.ink2}>名前・電話番号つき</Label>
      </g>
      <Thought x={980} y={340} text={"売られた情報は、\nそのあと、どうなるんだろう"} toward={[1110, 545]} />
    </Kitchen>
  </AbsoluteFill>
);

// ================= 最初の驚き =================
export const S07: React.FC = () => { const f = useCurrentFrame(); return ( // 平均の棒が先、日本の棒があとから伸びる
  <AbsoluteFill>
    <Heading>盗まれたカード1枚の値段</Heading>
    <SubHead>売り場の平均。値段のある132か国で、日本がいちばん高い</SubHead>
    <Svg>
      <HBar x={560} y={300} h={120} w={1000 * ramp(f, 34, 36)} color={C.gold} name="日本" value="22.8ドル" />
      <g opacity={ramp(f, 72, 10)}><Label x={1584} y={480} weight={900}>平均の約2.6倍</Label></g>
      <HBar x={560} y={560} h={120} w={(8.82 / 22.8) * 1000 * ramp(f, 6, 20)} color={C.goldTint} name="132か国の平均" value="8.82ドル" valueColor={C.ink2} />
    </Svg>
    <SourceNote text={SRC.nord} />
  </AbsoluteFill>
); };
export const S08: React.FC = () => { const f = useCurrentFrame(); return ( // 3,400 を数え上げる
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 200, top: 240, ...font("hero", C.gold), whiteSpace: "nowrap", lineHeight: 1 }}>
      <span style={{ fontSize: 100 }}>約</span>{num(Math.round(34 * ramp(f, 4, 40)) * 100)}<span style={{ fontSize: 100 }}>円</span>
    </div>
    <div style={{ position: "absolute", left: 210, top: 470, ...font("label", C.ink2), whiteSpace: "nowrap" }}>日本のカード1枚（22.8ドル）</div>
    <Svg>
      <Mug x={1420} y={340} s={2.6} label="ジョッキ" />
      <Label x={1420} y={510} anchor="middle" weight={900}>飲み会1回ぶんほど</Label>
    </Svg>
    <Note x={360} y={640} question text="この2,000万件は、どれだけのお金に変わる？" />
    <SourceNote text={SRC.nord} />
  </AbsoluteFill>
); };

// ================= 今日の答え合わせ・予想タイム・順番 =================
const CLAIMS = [
  { name: "激増", text: "漏えいは、この数年で激増した" },
  { name: "すぐ現金", text: "漏れた情報は、すぐお金になる" },
  { name: "天才", text: "盗むのは、腕のいい天才ハッカー" },
  { name: "大儲け", text: "盗む側は、大儲けしている" },
];
const CLAIM_ICONS = [<ClaimIcon kind="up" />, <ClaimIcon kind="cash" />, <ClaimIcon kind="genius" />, <ClaimIcon kind="rich" />];
export const S09: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏えいのニュースで、よく聞く話</Heading>
    <ClaimCards x={96} y={220} w={1728} items={CLAIMS} icons={CLAIM_ICONS} />
  </AbsoluteFill>
);
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Heading>この4つのうち、本当の話はいくつ？</Heading>
    <SubHead>予想タイム（答えは最後に）</SubHead>
    <ClaimCards x={96} y={230} w={1728} items={CLAIMS} cols={4} icons={CLAIM_ICONS} />
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
export const S11: React.FC = () => (
  <AbsoluteFill>
    <Heading>今日の順番</Heading>
    <Svg>
      <OrderCard x={160} no={1} text="本当に増えたのか">
        {[[60, C.rest], [140, C.rest], [260, C.teal]].map(([h, c], i) => (
          <rect key={i} data-qa="mark" data-qa-label={`増えたかの棒${i + 1}`} x={260 + i * 100} y={580 - (h as number)} width={70} height={h as number} rx={R.sm} fill={c as string} />
        ))}
      </OrderCard>
      <OrderCard x={720} no={2} text="情報はどこへ行くのか">
        <Pawnshop x={960} y={580} s={0.66} state="open" />
      </OrderCard>
      <OrderCard x={1280} no={3} text="盗む側の稼ぎ">
        <Coins x={1520} y={570} n={10} stacks={3} s={1.6} label="稼ぎ" />
      </OrderCard>
    </Svg>
  </AbsoluteFill>
);

// ================= 第1章：増えたのか =================
export const S12: React.FC = () => { const f = useCurrentFrame(); return ( // 100マスを順に埋める（人のミス → 盗まれる → その他）
  <AbsoluteFill>
    <Heading>国に届く漏えいの報告（昨年度）</Heading>
    <SubHead>13,345件を100マスに</SubHead>
    <Svg>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        const on = f >= 6 + i * 0.6, c = !on ? C.paper2 : i < 81 ? C.other : i < 90 ? C.teal : C.otherTint;
        return <rect key={i} data-qa="mark" data-qa-label={`マス${i + 1}`} x={200 + col * 56} y={240 + row * 56} width={48} height={48} rx={6} fill={c} stroke={on && i >= 90 ? C.other : "none"} strokeWidth={2} />;
      })}
      {[[C.other, "人のミス（渡し間違いなど）", "81"], [C.teal, "外から盗まれる（不正アクセス）", "9"], [C.otherTint, "盗難・内部の不正・その他", "10"]].map(([c, n, v], i) => (
        <g key={n}>
          <rect data-qa="mark" data-qa-label={`凡例：${n}`} x={860} y={290 + i * 110} width={48} height={48} rx={6} fill={c} stroke={i === 2 ? C.other : "none"} strokeWidth={2} />
          <Label x={930} y={330 + i * 110}>{n}</Label>
          <Label x={1800} y={334 + i * 110} anchor="end" size="value">{`${v}マス`}</Label>
        </g>
      ))}
      <g opacity={ramp(f, 66, 10)}><Label x={860} y={700} size="value" weight={900}>8割は、人のミス</Label></g>
    </Svg>
    <SourceNote text={SRC.ppc7} />
    <ChapterDots current={1} />
  </AbsoluteFill>
); };
const Y12 = Array.from({ length: 14 }, (_, i) => 2012 + i);
const STOLEN = [9, 31, 11, 10, 22, 29, 25, 41, 51, 68, 91, 93, 114, 116];
const MISS = [62, 76, 59, 77, 67, 61, 60, 45, 52, 69, 74, 82, 75, 64];
export const S13: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗まれる漏えいは約6倍、ミスは横ばい</Heading>
    <SubHead>上場企業とその子会社が公表した事故（件／年）</SubHead>
    <Svg>
      <BarChart x={120} y={300} width={720} height={420} max={120} format={(v) => `${Math.round(v)}件`}
        bars={[{ label: "2012〜14年", value: 17, color: C.tealTint }, { label: "2023〜25年", value: 108, color: C.teal, focus: true }]} />
      <Label x={150} y={420} size="value" weight={900}>約6倍</Label>
      <Label x={150} y={470} size="note" color={C.ink2}>（3年の平均どうし）</Label>
      <LineChart start={40} x={1000} y={300} width={560} height={420} xDomain={[2012, 2025]} yDomain={[0, 130]} xTicks={[2012, 2025]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v)}件`}
        series={[{ label: "ミスなど", points: Y12.map((y, i) => [y, MISS[i]]), color: C.other }, { label: "盗まれる", points: Y12.map((y, i) => [y, STOLEN[i]]), color: C.teal, focus: true }]} />
    </Svg>
    <SourceNote text={SRC.tsr} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
const HALF = ["21上", "21下", "22上", "22下", "23上", "23下", "24上", "24下", "25上", "25下", "26上"];
const RANSOM = [61, 85, 114, 116, 103, 94, 114, 108, 116, 110, 123];
export const S14: React.FC = () => {
  const base = 740, k = 420 / 130, slot = 145, x0 = 170;
  const f = useCurrentFrame(); // 棒を古い順に伸ばす
  return (
    <AbsoluteFill>
      <Heading>ランサムウェアの届け出（半年ごと）</Heading>
      <SubHead>上＝上半期（1〜6月）、下＝下半期（7〜12月）。2026年上半期は123件で、半年の数で過去最多</SubHead>
      <Svg>
        <line x1={x0 - 20} x2={x0 + slot * HALF.length} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        {HALF.map((l, i) => {
          const h = RANSOM[i] * k * ramp(f, 4 + i * 6, 18), x = x0 + i * slot + 20, last = i === HALF.length - 1;
          return (
            <g key={l}>
              <rect data-qa="mark" data-qa-label={`届け出：${l}`} x={x} y={base - h} width={100} height={h} rx={R.sm} fill={C.rest} stroke={last ? C.ink : "none"} strokeWidth={LINE.thin} />
              <Label x={x + 50} y={base - h - 16} anchor="middle" size={last ? "label" : "note"} weight={last ? 900 : 500} color={last ? C.ink : C.ink2}>{`${RANSOM[i]}件`}</Label>
              <Label x={x + 50} y={base + 50} anchor="middle" weight={last ? 900 : 500}>{l}</Label>
            </g>
          );
        })}
      </Svg>
      <SourceNote text={SRC.npaRansom} />
      <ChapterDots current={1} />
    </AbsoluteFill>
  );
};
export const S15: React.FC = () => (
  <AbsoluteFill>
    <Heading>手がかりは、4通目</Heading>
    <Svg>
      <g>
        <Envelope x={440} y={470} s={3.2} label="4通目" />
        <circle cx={540} cy={540} r={52} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <StockChart x={540} y={540} s={1.1} label="証券のしるし" />
      </g>
      <Label x={440} y={680} anchor="middle" weight={900}>証券会社（4通目）</Label>
      <Arrow x1={680} y1={470} x2={1220} y2={470} color={C.ink2} w={LINE.heavy - 4} />
      <Label x={950} y={420} anchor="middle" color={C.ink2}>受付の仕事を頼む</Label>
      <CallDesk x={1440} y={460} s={3.2} label="問い合わせを受ける机" />
      <Label x={1440} y={680} anchor="middle" weight={900}>問い合わせ受付の専門の会社</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S16: React.FC = () => (
  <AbsoluteFill>
    <Heading>1か所が破られて、おわびは最大5社</Heading>
    <SubHead>1つの事故が、会社の数だけニュースになる</SubHead>
    <Svg>
      {[360, 660, 960, 1260, 1560].map((x) => (
        <g key={x}>
          <line x1={960} y1={610} x2={x} y2={470} stroke={C.teal} strokeWidth={LINE.base} strokeLinecap="round" />
          <Office x={x} y={300} s={1.6} label={`おわびを出した会社 ${x}`} />
          <Loot x={x + 78} y={290} kind="card" s={0.8} label={`渡った情報 ${x}`} />
          <Envelope x={x} y={410} s={1.1} label={`おわび ${x}`} />
        </g>
      ))}
      <CallDesk x={960} y={690} s={2.4} label="委託先" />
      <Label x={960} y={815} anchor="middle" weight={900}>委託先（1か所）</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <Heading>国への報告は、会社の数で数える</Heading>
    <SubHead>過去最多と報じられた年度（令和6年度）の報告 19,056件</SubHead>
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
export const S18: React.FC = () => { const f = useCurrentFrame(), a = 480 * Math.sqrt(ramp(f, 26, 44)); return ( // 人口が先、延べの正方形が面積で育つ
  <AbsoluteFill>
    <Heading>漏れた人数を足すと、延べ2億人超</Heading>
    <SubHead>面積＝人数</SubHead>
    <Svg>
      <rect data-qa="mark" data-qa-label="延べの人数" x={560 - a / 2} y={790 - a} width={a} height={a} fill={C.teal} />
      <Label x={560} y={290} anchor="middle" weight={900}>漏れた人数（延べ）2億1,313万</Label>
      <g opacity={ramp(f, 4, 14)}><rect data-qa="mark" data-qa-label="人口" x={1120} y={426} width={364} height={364} fill={C.rest} /></g>
      <Label x={1302} y={406} anchor="middle" weight={900}>日本の人口 1億2,265万</Label>
      <g opacity={ramp(f, 74, 10)}><Label x={960} y={700} anchor="middle" size="value">約1.7倍</Label></g>
    </Svg>
    <SourceNote text={SRC.tsrPop} />
    <ChapterDots current={1} />
  </AbsoluteFill>
); };
export const S19: React.FC = () => (
  <AbsoluteFill>
    <Heading>延べなので、同じ人が何度も数えられる</Heading>
    <Svg>
      <Cat kind="plain" x={520} y={760} size={6} label="1人" />
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
// 濃さ＝回数（0回＝灰、1〜2回＝淡い青緑、3回以上＝青緑。第2版）
const MIX_C = [C.rest, C.tealTint, C.teal];
const TOWN_AT = [0, 64, 83]; // 町の通し番号の始まり（猫が順に出る・色が順に変わる）
const Town: React.FC<{ colored?: boolean }> = ({ colored }) => { const f = useCurrentFrame(); return (
  <Svg>
    {TOWN.map((g, gi) => (
      <g key={g.name}>
        <Label x={g.x} y={270} weight={900}>{`${g.name} ${g.n}人`}</Label>
        <Label x={g.x} y={316} size="note" color={C.ink2}>{`使うサービス ${g.use}`}</Label>
        {Array.from({ length: g.n }, (_, i) => {
          const k = i < g.mix[0] ? 0 : i < g.mix[0] + g.mix[1] ? 1 : 2;
          const n = TOWN_AT[gi] + i;
          const cat = <Cat key={i} kind="plain" color={colored && f >= 8 + n * 0.6 ? MIX_C[k] : undefined} x={g.x + 20 + (i % g.cols) * 50} y={420 + Math.floor(i / g.cols) * 88} size={1.4} seed={i} />;
          return colored ? cat : <g key={i} opacity={ramp(f, 6 + n * 0.5, 8)}>{cat}</g>;
        })}
      </g>
    ))}
    {colored && [["0回", "31人"], ["1〜2回", "44人"], ["3回以上", "25人"]].map(([n, v], i) => (
      <g key={n} opacity={ramp(f, 72 + i * 6, 10)}>
        <rect data-qa="mark" data-qa-label={`凡例：${n}`} x={120 + i * 520} y={722} width={44} height={44} rx={6} fill={MIX_C[i]} />
        <Label x={184 + i * 520} y={758} weight={900}>{`${n} ${v}`}</Label>
      </g>
    ))}
  </Svg>
); };
export const S20: React.FC = () => (
  <AbsoluteFill>
    <Heading>延べの数を、100人の町に配る</Heading>
    <SubHead>漏えいのたびに、そのサービスを使う人へしるしを1つ</SubHead>
    <Town />
    <SourceNote sim prefix="" text="ヤフー「パスワードに関する意識調査」の分け方、東京商工リサーチの延べ人数から" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏れ方は、人によって大きく偏る</Heading>
    <SubHead>しるしを配り終えた町（何回漏れたか）</SubHead>
    <Town colored />
    <SourceNote sim prefix="" text="上場企業の公表分だけなので、実際の回数はこれより多い" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S22: React.FC = () => {
  const X = (n: number) => 200 + (n / 35) * 1500;
  const base = 690;
  return (
    <AbsoluteFill>
      <Heading>使うサービスの数と、漏れた回数</Heading>
      <Svg>
        <line x1={200} y1={base} x2={1700} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        {[[5, 0.78, "少ない人"], [15, 2.34, "ふつうの人"], [30, 4.68, "多い人"]].map(([n, m, name]) => (
          <g key={name as string}>
            <rect data-qa="mark" data-qa-label={`平均の回数：${name}`} x={X(n as number) - 60} y={base - (m as number) * 76} width={120} height={(m as number) * 76} rx={R.sm} fill={C.teal} />
            <Label x={X(n as number)} y={base - (m as number) * 76 - 20} anchor="middle" size="value">{`${m}回`}</Label>
            <Label x={X(n as number)} y={base + 52} anchor="middle">{`${n}個`}</Label>
          </g>
        ))}
        <line x1={X(20)} y1={290} x2={X(20)} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="14 10" />
        <Label x={X(20)} y={base + 52} anchor="middle" weight={900}>20個</Label>
        <Label x={1700} y={base + 104} anchor="end" size="note" color={C.ink2}>ログインするサービスの数</Label>
        <Label x={200} y={290} size="note" color={C.ink2}>平均で何回漏れたか</Label>
      </Svg>
      <SourceNote sim prefix="" text="100人の町（data/town_sim.py）" />
      <ChapterDots current={1} />
    </AbsoluteFill>
  );
};

// ================= 第2章：どこへ行くのか（質屋） =================
export const S23: React.FC = () => (
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
export const S24: React.FC = () => (
  <AbsoluteFill>
    <Heading>盗品は、質屋に持ちこんでお金になる</Heading>
    <Svg>
      <Loot x={300} y={520} kind="card" s={2.6} label="盗んだカード情報" />
      <Label x={300} y={650} anchor="middle" weight={900}>盗んだカード情報</Label>
      <Arrow x1={460} y1={540} x2={700} y2={540} color={C.teal} w={LINE.heavy - 4} />
      <Pawnshop x={960} y={700} state="open" label="盗んだ情報を、お金に換える所" big />
      <Arrow x1={1220} y1={540} x2={1440} y2={540} color={C.gold} w={LINE.heavy - 4} />
      <Coins x={1620} y={620} n={8} stacks={2} s={1.6} label="お金" />
      <Label x={1620} y={700} anchor="middle" weight={900}>お金</Label>
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S25: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect x={260} y={170} width={1400} height={440} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={320} y={250} color={C.ink2}>闇の売り場を調べた論文の題</Label>
      <Label x={960} y={400} anchor="middle" size="question" weight={900}>「金を、銀の値段で売る人はいない」</Label>
      <Label x={960} y={530} anchor="middle" color={C.ink2}>すぐお金に換えられるなら、安く売らずに自分で換えるはず</Label>
      <Ingot x={700} y={720} s={2.4} kind="gold" label="金の延べ棒" />
      <Label x={820} y={740} weight={900}>金</Label>
      <Ingot x={1160} y={720} s={2.4} kind="silver" label="銀の延べ棒" />
      <Label x={1280} y={740} weight={900}>銀</Label>
    </Svg>
    <SourceNote text={SRC.herley} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S26: React.FC = () => (
  <AbsoluteFill>
    <Heading>だから、安い</Heading>
    <Svg>
      <Stall x={420} y={720} s={0.85} items={["card", "id", "list", "card", "key", "card"]} />
      <g data-qa="mark" data-qa-label="品物を渡さない">
        <path d="M640 290 L740 390 M740 290 L640 390" stroke={C.ink} strokeWidth={LINE.heavy} strokeLinecap="round" />
      </g>
      <Label x={420} y={790} anchor="middle">代金だけ取る売り手があふれる</Label>
      {["換えるのが難しい", "売り場も信用できない"].map((t, i) => (
        <g key={t}>
          <rect x={1000} y={260 + i * 150} width={720} height={116} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={1360} y={334 + i * 150} anchor="middle" weight={900}>{t}</Label>
        </g>
      ))}
      <Arrow x1={1360} y1={548} x2={1360} y2={620} />
      <Label x={1360} y={708} anchor="middle" size="question" weight={900}>だから安い</Label>
    </Svg>
    <SourceNote text={SRC.herley} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S27: React.FC = () => (
  <AbsoluteFill>
    <Heading>2通目：ポイントの交換先が質屋に</Heading>
    <Svg>
      <Mini focus={1} />
      <Clipboard x={190} y={560} s={2.2} label="アンケートのサイト" />
      <Label x={190} y={690} anchor="middle">アンケートの</Label>
      <Label x={190} y={750} anchor="middle">サイト</Label>
      <Arrow x1={300} y1={560} x2={410} y2={560} color={C.teal} />
      <Loot x={510} y={560} kind="point" s={2} label="会員のポイント" />
      <Label x={510} y={690} anchor="middle">会員の</Label>
      <Label x={510} y={750} anchor="middle">ポイント</Label>
      <Arrow x1={600} y1={560} x2={710} y2={560} color={C.teal} />
      <Pawnshop x={900} y={720} s={0.85} state="open" label="ポイントの交換先" big />
      <Arrow x1={1080} y1={560} x2={1170} y2={560} color={C.gold} />
      <Coins x={1310} y={630} n={6} stacks={2} s={1.4} label="交換された額" />
      <Label x={1310} y={700} anchor="middle" weight={900}>勝手に交換 611件</Label>
      <Label x={1310} y={780} anchor="middle" size="value" color={C.gold} weight={900}>約287万円</Label>
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S28: React.FC = () => (
  <AbsoluteFill>
    <Heading>1通目：名前とメールでは換えられない</Heading>
    <Svg>
      <Mini focus={0} />
      {["名前", "メール", "電話番号"].map((t, i) => (
        <g key={t} data-qa="mark" data-qa-label={`漏れた情報：${t}`}>
          <rect x={120} y={250 + i * 110} width={320} height={86} rx={R.md} fill={C.teal} />
          <text x={280} y={307 + i * 110} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{t}</text>
        </g>
      ))}
      <g data-qa="mark" data-qa-label="カードはない">
        <rect x={120} y={600} width={120} height={78} rx={10} fill="none" stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="10 8" />
        <path d="M118 680 L242 598" stroke={C.ink2} strokeWidth={LINE.thin} strokeLinecap="round" />
      </g>
      <Label x={270} y={654} color={C.ink2}>カードの情報はない</Label>
      <Arrow x1={470} y1={420} x2={630} y2={420} color={C.teal} />
      {/* 柵（もう一歩の手間） */}
      <g data-qa="prop" data-qa-label="柵">
        {[0, 1, 2, 3].map((k) => <rect key={k} x={670 + k * 50} y={300} width={20} height={300} rx={4} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />)}
        <rect x={660} y={360} width={190} height={22} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect x={660} y={510} width={190} height={22} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
      </g>
      <Label x={760} y={660} anchor="middle" weight={900}>もう一歩</Label>
      <Label x={760} y={710} anchor="middle" size="note" color={C.ink2}>本人をだます手間</Label>
      <Pawnshop x={1180} y={680} s={0.9} state="open" label="質屋" />
    </Svg>
    <SourceNote text={SRC.each} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S29: React.FC = () => (
  <AbsoluteFill>
    <Heading>去年の春に開いた質屋</Heading>
    <Svg>
      <Mini focus={3} />
      <Pawnshop x={520} y={715} s={1.25} state="open" label="証券口座" big />
      <StockChart x={1100} y={420} s={2.4} label="株" />
      <Arrow x1={1000} y1={440} x2={820} y2={500} color={C.teal} />
      <Label x={1100} y={600} anchor="middle">乗っ取られた口座で、</Label>
      <Label x={1100} y={660} anchor="middle">株が勝手に売り買いされた</Label>
    </Svg>
    <SourceNote text={SRC.fsa} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);

// ---- 質屋の舞台（第2章の後半）：左に質屋を置いたまま、右の絵だけを差し替える ----
const Stage: React.FC<{ state: "open" | "half" | "closed"; name: string; shut?: number; children: React.ReactNode }> = ({ state, name, shut, children }) => (
  <Svg>
    <Pawnshop x={290} y={720} s={0.8} state={state} label={name} shut={shut} big />
    <line x1={560} y1={240} x2={560} y2={820} stroke={C.paper2} strokeWidth={LINE.thin} />
    {children}
  </Svg>
);
// 金融庁「インターネット取引サービスへの不正アクセス・不正取引の発生状況」（2026-09-09更新）の売却金額（億円）。data/fsa_securities_monthly.csv
const SEC_M = [2, 0.8, 175, 1625, 1151, 233, 255, 271, 58, 111, 43, 23, 49, 115, 159, 74, 14, 8, 0.2, 2];
export const S30: React.FC = () => {
  const x0 = 620, slot = 59, base = 730, k = 420 / 1700;
  const bx = (i: number) => x0 + i * slot + 10;
  const dl = x0 + 18 * slot; // 2026年6月末と7月のあいだ
  const f = useCurrentFrame(); // 棒を月の順に伸ばし、期限の線のあとでシャッターが半分下りる
  return (
    <AbsoluteFill>
      <Heading>勝手に売られた株（月ごと）</Heading>
      <SubHead>売却金額（億円）。売られた株の額で、被害額ではない</SubHead>
      <Stage state="half" name="証券口座" shut={0.65 * ramp(f, 76, 24)}>
        <line x1={x0} x2={x0 + 20 * slot} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        {SEC_M.map((v, i) => (
          <rect key={i} data-qa="mark" data-qa-label={`売却金額 ${i}`} x={bx(i)} y={base - Math.max(v * k, 2) * ramp(f, 4 + i * 3, 14)} width={40} height={Math.max(v * k, 2) * ramp(f, 4 + i * 3, 14)} rx={4}
            fill={i === 3 || i === 19 ? C.gold : C.goldTint} />
        ))}
        {[0, 3, 6, 9, 12, 15, 18].map((i) => <Label key={i} x={bx(i) + 20} y={base + 40} anchor="middle" size="note" color={C.ink2}>{`${(i % 12) + 1}月`}</Label>)}
        <Label x={x0} y={base + 84} size="note" weight={900}>2025年</Label>
        <Label x={x0 + 12 * slot} y={base + 84} size="note" weight={900}>2026年</Label>
        <line x1={x0 + 12 * slot - 4} x2={x0 + 12 * slot - 4} y1={base} y2={base + 90} stroke={C.ink2} strokeWidth={LINE.hair} />
        <Label x={bx(3) + 64} y={base - 1625 * k + 30} weight={900}>1,625億円（2025年4月）</Label>
        <line x1={dl} x2={dl} y1={250} y2={base} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="14 10" />
        <Label x={dl - 16} y={300} anchor="end" size="note" weight={900}>国の求めの期限</Label>
        <Label x={dl - 16} y={346} anchor="end" size="note" color={C.ink2}>（2026年6月末）</Label>
        <Label x={dl + 14} y={base - 40} weight={900}>約2億円</Label>
        <Label x={dl + 14} y={base - 96} size="note" color={C.ink2}>8月</Label>
      </Stage>
      <SourceNote text={SRC.fsa} />
      <ChapterDots current={2} />
    </AbsoluteFill>
  );
};
const FORGE: [number, number][] = [[1997, 12], [1998, 28], [1999, 90.9], [2000, 140.2], [2001, 146.4], [2002, 165], [2003, 164.4], [2004, 105.6], [2005, 83.4], [2006, 45.6],
  [2007, 39.1], [2008, 52.5], [2009, 49.2], [2010, 41.3], [2011, 25.8], [2012, 24.1], [2013, 25.8], [2014, 19.5], [2015, 23.1], [2016, 30.6], [2017, 31.7],
  [2018, 16], [2019, 17.8], [2020, 8], [2021, 1.5], [2022, 1.7], [2023, 3.1], [2024, 5.9], [2025, 7.2]];
export const S31: React.FC = () => (
  <AbsoluteFill>
    <Heading>偽造カードの被害（年ごと）</Heading>
    <SubHead>億円</SubHead>
    <Stage state="closed" name="偽造カード">
      <LineChart x={660} y={260} width={900} height={460} xDomain={[1997, 2025]} yDomain={[0, 180]} xTicks={[2000, 2010, 2020]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v * 10) / 10}億円`} eras={[{ x: 2014, label: "数え方が変わる" }]}
        series={[{ label: "偽造", points: FORGE, color: C.gold, focus: true }]} />
      <Label x={860} y={270} weight={900}>2002年 165億円</Label>
    </Stage>
    <SourceNote text={SRC.jca} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S32: React.FC = () => { const f = useCurrentFrame(); return ( // 偽造カードの質屋のシャッターが下りる
  <AbsoluteFill>
    <Heading>偽造カードの質屋は、閉まった</Heading>
    <Svg>
      <Pawnshop x={260} y={720} s={0.7} state="closed" shut={ramp(f, 8, 30)} label="偽造カード" />
      <ICChip x={560} y={560} s={2} label="ICチップ" />
      <Label x={560} y={680} anchor="middle" size="note" weight={900}>ICチップへの切り替え</Label>
      <Pawnshop x={980} y={720} s={0.8} state="open" label="カード番号" big />
      <ShareCol x={1330} y={300} h={440} w={180} value={93} text="93%" color={C.gold} tint={C.goldTint} name="番号の盗用" of="カードの不正利用の被害額（2025年）のうち" />
    </Svg>
    <SourceNote text={SRC.jcaShare} />
    <ChapterDots current={2} />
  </AbsoluteFill>
); };
const MISUSE: [number, number][] = [[2014, 67.3], [2015, 72.2], [2016, 88.9], [2017, 176.7], [2018, 187.6], [2019, 222.9], [2020, 223.6], [2021, 311.7], [2022, 411.7], [2023, 504.7], [2024, 513.5], [2025, 475.4]];
export const S33: React.FC = () => (
  <AbsoluteFill>
    <Heading>番号を盗んで使う被害（年ごと）</Heading>
    <SubHead>億円。2025年に、記録が残るなかではじめて減った</SubHead>
    <Stage state="open" name="カード番号">
      <LineChart x={660} y={260} width={900} height={460} xDomain={[2014, 2025]} yDomain={[0, 600]} xTicks={[2014, 2020, 2025]} xTickLabel={(v) => `${v}年`}
        format={(v) => `${Math.round(v)}億円`} series={[{ label: "番号の盗用", points: MISUSE, color: C.gold, focus: true }]} />
    </Stage>
    <SourceNote text={SRC.jca} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
// 比の図（2018年＝1倍）。37 と 52 で同じ絵に戻す
const Times: React.FC = () => {
  const one = 560 + 1260 / 123;
  const f = useCurrentFrame(); // 入り口（だますメール）の棒が長く伸び、そのあと被害額の棒が少しだけ伸びる
  return (
    <>
      <Heading>7年で何倍になったか（2018→2025年）</Heading>
      <SubHead>比の図：2018年を1倍として、2025年が何倍か</SubHead>
      <Svg>
        <HBar x={560} y={340} h={130} w={1260 * ramp(f, 6, 44)} color={C.teal} name="だますメールの届け出" value="123倍（約2万件 → 約245万件）" valueAbove />
        <HBar x={560} y={620} h={130} w={(2.2 / 123) * 1260 * ramp(f, 56, 16)} color={C.gold} name="カードの被害額" value="2.2倍（235億円 → 511億円）" />
        <line x1={one} x2={one} y1={300} y2={790} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 8" />
        <Label x={one + 12} y={810} size="note" weight={900}>1倍（2018年）</Label>
      </Svg>
    </>
  );
};
export const S34: React.FC = () => (
  <AbsoluteFill>
    <Times />
    <SourceNote text={SRC.jcaPhish} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S35: React.FC = () => (
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
export const S36: React.FC = () => {
  // 20列×5段を、列の順（上から下）に並べる：左の14列＝10代と20代（紫の猫）、右の6列＝それ以外（灰）
  const px = (i: number) => 220 + Math.floor(i / 5) * 62, py = (i: number) => 400 + (i % 5) * 92;
  const f = useCurrentFrame(); // 100匹が列の順に出て、そのあと右の30匹が灰になる
  return (
    <AbsoluteFill>
      <Heading>不正アクセスで捕まった100人</Heading>
      <SubHead>去年 248人を100人にすると</SubHead>
      <Svg>
        {Array.from({ length: 100 }, (_, i) => (
          <g key={i} opacity={ramp(f, 4 + i * 0.4, 8)}><Cat kind="plain" color={i < 70 || f < 62 ? undefined : C.rest} x={px(i)} y={py(i)} size={1.4} seed={i} /></g>
        ))}
        <g opacity={ramp(f, 66, 10)}>
          <Bracket x1={190} x2={px(69) + 30} y={300} label="約7割（10代 33人・20代 37人）" />
          <Bracket x1={px(70) - 30} x2={px(99) + 30} y={300} label="それ以外 30人" color={C.ink2} />
        </g>
        <Label x={1500} y={480} weight={900}>多くは、</Label>
        <Label x={1500} y={540} weight={900}>なりすましの</Label>
        <Label x={1500} y={600} weight={900}>ログイン</Label>
      </Svg>
      <SourceNote text={SRC.npaArrest} />
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};
export const S37: React.FC = () => (
  <AbsoluteFill>
    <Heading>大きな攻撃も、分業の仕事</Heading>
    <SubHead>ランサムウェアの大きなグループ</SubHead>
    <Svg>
      <Tool x={420} y={460} s={2.6} label="攻撃の道具" />
      <Label x={420} y={620} anchor="middle" weight={900}>道具を作る側</Label>
      <Arrow x1={600} y1={460} x2={1040} y2={460} />
      <Label x={820} y={420} anchor="middle" color={C.ink2}>道具を貸す</Label>
      {Array.from({ length: 6 }, (_, i) => (
        <Cat key={i} kind="plain" x={1140 + (i % 3) * 140} y={440 + Math.floor(i / 3) * 160} size={2} seed={i} />
      ))}
      <Label x={1280} y={720} anchor="middle" weight={900}>借りて攻撃する実行役</Label>
    </Svg>
    <SourceNote text={SRC.nca} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S38: React.FC = () => { const f = useCurrentFrame(); return ( // 194匹の色が順に灯る（報酬なし＝灰、あり＝金）
  <AbsoluteFill>
    <Heading>作る側は2割、実行役の多くは無報酬</Heading>
    <Svg>
      <Label x={130} y={280} weight={900}>身代金の取り分</Label>
      <ShareCol x={200} y={330} h={400} w={180} value={20} text="2割" color={C.gold} tint={C.goldTint} name="作る側" />
      <Label x={428} y={460} size="note" color={C.ink2}>残り8割は</Label>
      <Label x={428} y={506} size="note" color={C.ink2}>実行役などへ</Label>
      <line x1={690} x2={690} y1={250} y2={820} stroke={C.paper2} strokeWidth={LINE.thin} />
      <Label x={740} y={280} weight={900}>実行役 194人のうち</Label>
      <rect data-qa="mark" data-qa-label="凡例：報酬あり" x={740} y={318} width={40} height={40} rx={6} fill={C.gold} />
      <Label x={796} y={350}>報酬あり 80人</Label>
      <rect data-qa="mark" data-qa-label="凡例：報酬なし" x={1100} y={318} width={40} height={40} rx={6} fill={C.rest} />
      <Label x={1156} y={350}>報酬なし 最大114人</Label>
      {Array.from({ length: 194 }, (_, i) => (
        <Cat key={i} kind="plain" color={f < 10 + i * 0.4 ? undefined : i < 114 ? C.rest : C.gold} x={760 + (i % 20) * 54} y={430 + Math.floor(i / 20) * 43} size={0.8} seed={i} />
      ))}
    </Svg>
    <SourceNote text={SRC.doj} />
    <ChapterDots current={3} />
  </AbsoluteFill>
); };
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>仕事の多くは、地味で退屈な保守作業</Heading>
    <Svg>
      <Desk x={760} y={760} size={4} w={110} />
      <Cat kind="plain" x={600} y={760} size={4} pose="sit" />
      <rect x={1080} y={360} width={740} height={220} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1130} y={460} weight={900}>地味で退屈な保守作業</Label>
      <Label x={1130} y={520} size="note" color={C.ink2}>（現場で聞き取った研究）</Label>
    </Svg>
    <SourceNote text={SRC.collier} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S40: React.FC = () => { const f = useCurrentFrame(); return ( // 63マスが順に赤になる
  <AbsoluteFill>
    <Heading>襲われた側の損</Heading>
    <SubHead>国内のランサムウェア被害（令和7年）</SubHead>
    <Svg>
      <Label x={160} y={250} size="note" color={C.ink2}>被害を受けた組織 226件を100に</Label>
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} data-qa="mark" data-qa-label={`組織${i + 1}`} x={160 + (i % 10) * 50} y={280 + Math.floor(i / 10) * 50} width={40} height={40} rx={6} fill={i < 63 && f >= 8 + i ? C.debt : C.rest} />
      ))}
      <rect data-qa="mark" data-qa-label="凡例：中小企業" x={720} y={380} width={44} height={44} rx={6} fill={C.debt} />
      <Label x={780} y={416} weight={900}>中小企業 63%</Label>
      <rect data-qa="mark" data-qa-label="凡例：それ以外" x={720} y={470} width={44} height={44} rx={6} fill={C.rest} />
      <Label x={780} y={506}>それ以外 37%</Label>
      <ShareCol x={1340} y={320} h={400} w={180} value={52} text="52%" color={C.debt} tint={C.debtTint} name="1,000万円以上" of="回答した組織のうち（調べと復旧の費用）" />
    </Svg>
    <SourceNote text={SRC.npaDamage} />
    <ChapterDots current={3} />
  </AbsoluteFill>
); };
const PAY: [number, number][] = [[2022.875, 37], [2023.875, 29], [2024.875, 25], [2025.375, 26], [2025.625, 23], [2025.875, 20]];
const Firms: React.FC<{ y: number; n: number; text: string }> = ({ y, n, text }) => (
  <g>
    <text x={160} y={y} style={font("label")} fontWeight={900}>{text}</text>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} data-qa="mark" data-qa-label={`組織${y}-${i + 1}`}>
        <rect x={160 + i * 150} y={y + 30} width={110} height={140} rx={R.sm} fill={i === 0 ? C.gold : C.rest} />
        {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={160 + i * 150 + 22 + c * 40} y={y + 56 + r * 44} width={26} height={26} rx={3} fill={C.white} />))}
      </g>
    ))}
  </g>
);
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Heading>身代金を払う組織の割合</Heading>
    <SubHead>金色の1社が身代金を払った（四半期ごとの調べ）</SubHead>
    <Svg>
      <Firms y={290} n={3} text="2022年末：3社に1社" />
      <Firms y={560} n={5} text="2025年末：5社に1社" />
      <LineChart x={1080} y={300} width={500} height={320} xDomain={[2022.75, 2026]} yDomain={[0, 40]} xTicks={[2022.875, 2025.875]} xTickLabel={(v) => `${Math.floor(v)}年末`}
        format={(v) => `${Math.round(v)}%`} series={[{ label: "払った割合", points: PAY, color: C.gold, focus: true }]} />
    </Svg>
    <SourceNote text={SRC.coveware} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
const RANSOM_Y: [number, number][] = [[2020, 6.9], [2021, 7.7], [2022, 5.7], [2023, 12.5], [2024, 8.9], [2025, 8.2]];
export const S42: React.FC = () => {
  const base = 720, k = 400 / 13, x0 = 260, slot = 230;
  const top = (v: number) => base - v * k;
  const peakY = top(12.5);
  const f = useCurrentFrame(), g = (i: number) => ramp(f, 4 + i * 8, 18); // 棒を年の順に伸ばし、最後に「約3割少ない」
  return (
    <AbsoluteFill>
      <Heading>世界で払われた身代金（年ごと）</Heading>
      <SubHead>2025年は速報（白い棒）</SubHead>
      <Svg>
        <line x1={x0} x2={x0 + slot * 6} y1={base} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        {RANSOM_Y.map(([y, v], i) => {
          const x = x0 + i * slot + 40, pre = y === 2025;
          return (
            <g key={y}>
              <rect data-qa="mark" data-qa-label={`身代金 ${y}年`} x={x} y={base - v * k * g(i)} width={150} height={v * k * g(i)} rx={R.sm}
                fill={pre ? C.white : C.goldTint} stroke={pre ? C.gold : "none"} strokeWidth={LINE.thin} strokeDasharray={pre ? "12 8" : undefined} />
              <Label x={x + 75} y={base - v * k * g(i) - 16} anchor="middle" size="note" weight={700}>{`${v.toFixed(1)}億ドル`}</Label>
              <Label x={x + 75} y={base + 48} anchor="middle" weight={pre ? 900 : 500}>{pre ? "2025年" : `${y}年`}</Label>
            </g>
          );
        })}
        <g opacity={ramp(f, 62, 12)}>
        <line x1={x0 + 3 * slot + 40} x2={x0 + 5 * slot + 190} y1={peakY} y2={peakY} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="14 10" />
        <Arrow x1={x0 + 5 * slot + 115} y1={peakY + 8} x2={x0 + 5 * slot + 115} y2={top(8.2) - 52} color={C.ink} w={LINE.thin} />
        <Label x={x0 + 5 * slot + 190} y={peakY - 72} anchor="end" weight={900}>いちばん多い年より、約3割少ない</Label>
        </g>
      </Svg>
      <SourceNote text={SRC.chain} />
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};

// ================= 答え合わせ（記号なし。1つの舞台で4つを順に割る） =================
const NAMES = CLAIMS.map((c) => c.name);
const SPLIT = [
  { hit: "盗まれる漏えいは\n約6倍に増えた", miss: "見出しの数は、延べや\n1つの事故の何社分", word: "半分本当", tone: "half" as const },
  { miss: "お金に変わるのは、質屋に持ちこめた分だけ。\n名前とメールだけでは換えられない", word: "ちがう", tone: "miss" as const },
  { miss: "捕まった事件の多くは、なりすましのログイン。\n大きな攻撃も、分業の仕事", word: "ちがう", tone: "miss" as const },
  { hit: "道具を作る側は\n身代金の2割", miss: "実行役の6割近くは\n無報酬（多い見積もり）", word: "半分本当", tone: "half" as const },
];
const Judge: React.FC<{ i: number }> = ({ i }) => (
  <AbsoluteFill>
    <Heading>答え合わせ</Heading>
    <ClaimStrip x={96} y={160} names={NAMES} current={i} tones={SPLIT.map((s, k) => (k < i ? s.tone : undefined))} words={SPLIT.map((s, k) => (k < i ? s.word : undefined))} />
    <SplitClaim x={96} y={300} name={CLAIMS[i].name} claim={CLAIMS[i].text} hit={SPLIT[i].hit} miss={SPLIT[i].miss} word={SPLIT[i].word} />
  </AbsoluteFill>
);
export const S43: React.FC = () => <Judge i={0} />;
export const S44: React.FC = () => <Judge i={1} />;
export const S45: React.FC = () => <Judge i={2} />;
export const S46: React.FC = () => <Judge i={3} />;
export const S47: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の答え：本当の話は、ゼロ</Heading>
    <SubHead>半分本当が2つ、ちがうが2つ</SubHead>
    <ClaimCards x={96} y={230} w={1728} items={CLAIMS} cols={4} tones={SPLIT.map((s) => s.tone)} words={SPLIT.map((s) => s.word)} />
    <CountPick x={96} y={600} label="本当の話は" answer={0} />
  </AbsoluteFill>
);

// ================= 示唆・教訓 =================
export const S48: React.FC = () => (
  <AbsoluteFill>
    <Heading>漏えいのニュースを読み直す3つの点</Heading>
    <Svg>
      {["見出しの件数は、延べか、最大の見込みか", "1つの事故が、何社分のおわびになっているか", "漏れた情報を、そのまま換えられる質屋があるか"].map((t, i) => (
        <EnterG key={i} at={6 + i * 30}>
          <rect x={160} y={230 + i * 180} width={1600} height={140} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <circle cx={240} cy={300 + i * 180} r={40} fill={C.ink} />
          <text x={240} y={316 + i * 180} textAnchor="middle" style={font("label", C.white)} fontWeight={900}>{i + 1}</text>
          <text x={320} y={318 + i * 180} style={font("body")} fontWeight={900}>{t}</text>
        </EnterG>
      ))}
    </Svg>
  </AbsoluteFill>
);
export const S49: React.FC = () => (
  <AbsoluteFill>
    <Kitchen face="normal" pose="sit" look={[-0.7, -0.7]} glow={0.26}>
      {MAIL.map((m, i) => {
        const x = 640 + i * 230, y = 440;
        return (
          <g key={m.name}>
            <Envelope x={x} y={y} s={2.8} label={`おわび${i + 1}`} />
            <circle cx={x + 52} cy={y + 32} r={34} fill={C.white} stroke={C.ink} strokeWidth={LINE.hair} />
            {m.icon(x + 52, y + 32, 0.8)}
          </g>
        );
      })}
    </Kitchen>
  </AbsoluteFill>
);
export const S50: React.FC = () => (
  <AbsoluteFill>
    <Heading>売り場とお金のあいだに、質屋がある</Heading>
    <Svg>
      <Stall x={300} y={720} s={0.75} />
      <Label x={300} y={790} anchor="middle">売り場</Label>
      <Arrow x1={500} y1={560} x2={620} y2={560} color={C.teal} />
      <Pawnshop x={820} y={720} s={0.75} state="closed" label="偽造カード" />
      <Pawnshop x={1220} y={720} s={0.75} state="half" label="証券口座" />
      <Arrow x1={1410} y1={560} x2={1530} y2={560} color={C.gold} />
      <Coins x={1680} y={640} n={4} stacks={2} s={1.4} label="お金" />
      <Label x={1680} y={720} anchor="middle">お金</Label>
    </Svg>
  </AbsoluteFill>
);
export const S51: React.FC = () => (
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
export const S52: React.FC = () => (
  <AbsoluteFill>
    <Times />
    <SourceNote text={SRC.jcaPhish} />
  </AbsoluteFill>
);
export const S53: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const P: Omit<Panel, "key">[] = [
  { title: "冒頭：秋の火曜の夜、台所の彼", C: S01, sec: 6.9, lines: "秋の、火曜の夜です。", move: "夜の窓から台所へ引く（時計は23:40、ランプの光だまり）。彼は半目でスマホに「お詫び」と打つ。名札（会社員（28））は1.5秒" },
  { title: "冒頭：受信箱の4通", C: S02, sec: 12.8, lines: "出てきたのは4通です。", move: "スマホの画面に寄る（枠が画面の外へ出ていく）。4行が読み上げの語に合わせて上から出て小さく弾む。読む行に墨の枠が移る（1通目→2通目）" },
  { title: "冒頭：3通目、免許証の画像", C: S03, sec: 14.1, lines: "3通目は、ときどき使う", move: "3通目が開いて中身の札に。「運転免許証などの画像」に青緑の帯。右に昼の色の回想の円がひらき、彼が免許証を撮る（白いフラッシュは1回だけ強く）" },
  { title: "冒頭：焼肉と、アンケートと、車と、株", C: S04, sec: 10.2, lines: "4通目は、去年口座を", move: "4通の目印が受信箱から抜け出し、同じ大きさの枠に入って横に並ぶ。目印を結ぶ線が出ては切れ、「？」が墨でぽん、ぽん、ぽん" },
  { title: "冒頭：この半月で約2,000万件", C: S05, sec: 8.3, lines: "この半月ほどで公表された", move: "受信箱と同じ順に、帯が左から1つずつ伸びてつながる（大きさの順にしない）。最後に右上の合計が数え上がる" },
  { title: "冒頭：SNSの投稿と、彼のため息", C: S06, sec: 17.6, lines: "SNSでは、日本人の", move: "台所に戻る。右上の空いた壁に投稿が流れてきて止まる。彼が息をつく。吹き出しは頭の上に1つずつ：「なんで、こんなに続くんだ」が消えてから、この吹き出し。カメラがゆっくり寄る" },
  { title: "最初の驚き：日本のカードがいちばん高い", C: S07, sec: 13.5, lines: "盗まれたカードの売り場を", move: "平均の棒が先に伸び、日本の棒がそれを追い越して伸びる。棒の右端に「平均の約2.6倍」" },
  { title: "最初の驚き：それでも約3,400円", C: S08, sec: 14.2, lines: "ただ、1枚およそ", move: "日本の棒の先が金の数字に変わって数え上がる。右にジョッキ。最後の文で数字の続きとして札（待たない）" },
  { title: "今日の答え合わせ：よく聞く4つの話", C: S09, sec: 24.3, lines: "漏えいのニュースのたびに", move: "カードが読み上げに合わせて1枚ずつ表に返る（4枚続けて）。各カードの右上に目印" },
  { title: "予想タイム：本当の話はいくつ？", C: S10, sec: 7.8, lines: "この4つのうち、本当の", move: "4枚が上に縮んで横1列。下に0〜4の札が並ぶ。ゴサが考える顔。輪は5秒、動きは静かに" },
  { title: "今日の順番", C: S11, sec: 10.6, lines: "まず、本当に増えたのか", move: "3枚の札が左から並ぶ（棒・開いている質屋・硬貨）。最後に1枚目が拡大して第1章の扉へ" },
  { title: "第1章：国への報告の8割は人のミス", C: S12, sec: 14.1, lines: "国に届く漏えいの報告は", move: "第1章の扉 → 100マスが左上から灰で埋まり（81）、青緑（9）、淡い灰（10。枠つき）。青緑の9マスが少し遅れて跳ねる。「8割は、人のミス」" },
  { title: "盗まれる漏えいは約6倍、ミスは横ばい", C: S13, sec: 26.3, lines: "上場企業とその子会社が", move: "左の2本の棒が伸び「約6倍」。棒の頂点から右の折れ線へつながり、灰の線（ミス）が横ばいで引かれ、青緑の線（盗まれる）が追い越す" },
  { title: "ランサムウェアの届け出：半年で過去最多", C: S14, sec: 8.4, lines: "会社のデータを人質に", move: "灰の棒が左から順に伸び、最後の棒（26上）は灰のまま細い墨の枠が付いて数字が大きくなる" },
  { title: "4通目：証券会社 → 問い合わせの机", C: S15, sec: 14.6, lines: "彼の4通は、なぜ", move: "グラフが縮んで4通目の封筒に。太い矢印が右へ伸び、ヘッドセットの机（専門の会社）が出る" },
  { title: "1か所から、最大5社のおわび", C: S16, sec: 16.1, lines: "その専門の会社は、同じ", move: "下の受付の机から青緑の線が5本伸び、上の5社に青緑のカードが渡る。そのあと各社の下におわびの封筒が1通ずつ弾む（5通目は少し大きく）" },
  { title: "国への報告の7件に1件が、1つの事故から", C: S17, sec: 19.5, lines: "国への報告も、事故の数", move: "全体の帯が出て、左端の墨の部分が伸びる（14%）。下にクラウドの目印" },
  { title: "延べ2億人超：人口の約1.7倍", C: S18, sec: 15.2, lines: "ここまで聞くと、日本人は", move: "人口の正方形が先に出て、その横で青緑の正方形が大きく育つ（面積＝人数）" },
  { title: "延べなので、同じ人が何度も", C: S19, sec: 10.0, lines: "でも、延べなので", move: "1人の人型にしるしが1つずつ付く（3つ）。右の札で「最大」「延べ」に墨の下線" },
  { title: "100人の町に配る", C: S20, sec: 16.8, lines: "そこで、延べの数を", move: "100人が3つの層に歩いて並ぶ（少ない人が多い）。層ごとに使うサービスの数の札" },
  { title: "3人に1人は一度も漏れていない", C: S21, sec: 16.3, lines: "しるしを配り終えると", move: "しるしが人ごとに時間差で雨のように降り、人の色が変わる（濃さ＝回数：0回は灰、1〜2回は淡い青緑、3回以上は青緑）。0回の31人が灰で残る瞬間に0.5秒の間。下に凡例" },
  { title: "サービスが20を超えるなら", C: S22, sec: 11.3, lines: "ログインするサービスが20", move: "町の3つの層が縮んで棒になる（群衆のばね）。20個の点線が上から下りる" },
  { title: "第2章：盗品の値段と慰謝料", C: S23, sec: 12.7, lines: "SNSの投稿のとおり", move: "第2章の扉 → 屋台の棚に盗品が並び、金の値札が下がる。右に木づちが下りて赤い数字（被害の側＝赤）" },
  { title: "質屋に持ちこんで、はじめてお金に", C: S24, sec: 15.7, lines: "なぜ、それほど安いの", move: "質屋の看板「質」を最初に大きく。カードが青緑の矢印に沿って質屋へ入り、反対側の金の矢印から硬貨が積み上がる" },
  { title: "論文の題：金を、銀の値段で売る人はいない", C: S25, sec: 15.2, lines: "闇の売り場を調べた研究者", move: "題の札が上から下りる。下に金と銀の延べ棒が並んで置かれる" },
  { title: "代金だけ取る売り手：だから安い", C: S26, sec: 13.3, lines: "しかも売り場には", move: "屋台の横に × が押される（品物を渡さない）。右に理由の札2つ → 矢印 → 「だから安い」" },
  { title: "2通目：ポイントの交換先が質屋", C: S27, sec: 17.8, lines: "彼の2通目にも", move: "右上に小さな受信箱（2通目が光る）。アンケート → ポイント → 質屋 → 硬貨の順に、読み上げに合わせて矢印が1本ずつ伸びる。最後に「約287万円」が数え上がる" },
  { title: "1通目：名前とメールでは換えられない", C: S28, sec: 17.3, lines: "一方、焼肉のアプリで", move: "小さな受信箱の1通目が光る。青緑の札3枚が矢印に沿って進み、柵で止まる。柵の下に「もう一歩」" },
  { title: "去年の春に開いた質屋：証券口座", C: S29, sec: 15.0, lines: "質屋は、新しく開くことも", move: "小さな受信箱の4通目が光る。質屋のシャッターが上がり、暖簾が出て床に金の光。株の目印から質屋へ矢印" },
  { title: "勝手に売られた株：20か月の月ごと", C: S30, sec: 24.4, lines: "多い月には、勝手に", move: "質屋を左に置いたまま、右に20か月の棒が左から順に伸びる（2025年4月が金で跳ねる）。期限の点線が下りた瞬間、質屋のシャッターが65%まで下りる。最後に「約2億円」" },
  { title: "もっと前に閉まった質屋：偽造カード", C: S31, sec: 15.5, lines: "もっと前に閉まった質屋", move: "左の質屋が偽造カードの質屋に入れ替わる（シャッターが閉まり灰に）。右の絵が金の線に変わり、2002年の山を越えて0近くまで落ちる" },
  { title: "ICチップと、番号の盗用93%", C: S32, sec: 11.8, lines: "カードにICチップを", move: "ICチップが大きく出て、閉まった質屋の扉にはまる（シャッターが一気に下りる）。右にカード番号の質屋が開き、隣の柱の濃い部分が伸びる" },
  { title: "番号の盗用、はじめて減った", C: S33, sec: 11.0, lines: "同じころ、ネットの店にも", move: "左はカード番号の質屋（開いている）のまま。右に金の線が右肩上がりに引かれ、2025年で少し下がる点に輪" },
  { title: "だますメール123倍、被害額2.2倍", C: S34, sec: 15.1, lines: "その番号を聞き出す", move: "線が縮んで比の図へ。1倍の点線が先に立ち、青緑の棒が画面の端まで伸びる。下の金の棒はほとんど伸びない" },
  { title: "4つの質屋：盗む側はどれだけ稼ぐ？", C: S35, sec: 8.8, lines: "けれど、だますメールの", move: "棒が縮んで質屋の看板になり、第2章の質屋が4軒並ぶ（閉・開・半・開）。奥の暗がりから人型の影が出てくる（次の100人へ）" },
  { title: "第3章：捕まった人の約7割は10代と20代", C: S36, sec: 11.5, lines: "不正アクセスで去年捕まった", move: "第3章の扉 → 100人が歩いてきて並ぶ。左の70人が墨に変わり、括弧「約7割」" },
  { title: "大きな攻撃も分業", C: S37, sec: 15.8, lines: "お金が大きく動く攻撃も", move: "左に道具、右に実行役が6人。道具が矢印に沿って配られる" },
  { title: "道具を作る側は2割、実行役の多くは無報酬", C: S38, sec: 14.7, lines: "アメリカの司法省の発表", move: "左の柱の金（2割）が伸びる。右の194人が灰で並び、金が80人だけ灯る（見出しを左右で分ける）" },
  { title: "地味で退屈な保守作業", C: S39, sec: 7.0, lines: "サイバー犯罪の現場で", move: "机の人型があくびをする。右の札が出る" },
  { title: "襲われた側の損", C: S40, sec: 13.8, lines: "一方、襲われた側の損", move: "100マスの組織のうち63マスが赤に変わる。右の柱の赤が伸びる（52%）" },
  { title: "身代金を払う組織は5社に1社へ", C: S41, sec: 15.9, lines: "ただ、稼ぎの元になる", move: "組織の列が3つ → 5つに増え、金は1つのまま。右上の小さな線が右下がりに引かれる" },
  { title: "世界の身代金は増えていない", C: S42, sec: 14.7, lines: "世界で払われた身代金の合計", move: "薄い金の棒が左から順に伸びる（2023年が山）。山の高さの点線が右へ引かれ、2025年（速報・白い棒）までの差に矢印" },
  { title: "答え合わせ1：激増は半分本当", C: S43, sec: 20.0, lines: "1つ目の「激増」。", move: "上に4つの話の札。「激増」のカードが割れ、当たっていた所（青緑の縁）が残り、外れていた所が灰になって右下へずれる。最後に「半分本当」の文字" },
  { title: "答え合わせ2：すぐ現金はちがう", C: S44, sec: 7.7, lines: "2つ目の「すぐ現金」。", move: "同じ舞台。上の札の1つ目に帯と言葉が残る。「すぐ現金」のカードは全部が灰になってずれる。「ちがう」" },
  { title: "答え合わせ3：天才はちがう", C: S45, sec: 10.2, lines: "3つ目の「天才」。", move: "同じ舞台。「天才」のカードが全部灰になってずれる。「ちがう」" },
  { title: "答え合わせ4：大儲けは半分本当", C: S46, sec: 17.3, lines: "4つ目の「大儲け」。", move: "同じ舞台。「大儲け」のカードが割れる（作る側の2割＝青緑の縁／実行役の無報酬＝灰）。「半分本当」" },
  { title: "予想の答え：ゼロ", C: S47, sec: 9.0, lines: "予想の答えは、ゼロ。", move: "判定の4枚が予想タイムの4枚に戻り、縁の帯と言葉が付く。下の札で「0つ」だけ墨に（記号は出さない）" },
  { title: "示唆：読み直す3つの点", C: S48, sec: 15.3, lines: "漏えいのニュースは、3つの", move: "3枚の札が上から1枚ずつ出る" },
  { title: "教訓：台所の4通", C: S49, sec: 10.1, lines: "彼は、4通のおわびを", move: "札が4通の封筒に変わって台所へ。冒頭と同じ夜・同じ窓で、少しだけ寄る。目印つきの封筒4通を彼が座って見る（スマホは持たない）" },
  { title: "教訓：売り場とお金のあいだの質屋", C: S50, sec: 16.2, lines: "ただ、売り場に並ぶことと", move: "屋台から青緑の矢印が伸び、閉まった質屋・半分の質屋で止まる。金の矢印の先の硬貨は少しだけ" },
  { title: "教訓：開いている質屋で被害は変わる", C: S51, sec: 9.1, lines: "漏えいの被害は、盗まれた", move: "2軒の質屋の横に、前と後の額が出る（前の額に取り消し線は引かない）" },
  { title: "締め：入り口は123倍、被害額は2.2倍", C: S52, sec: 16.1, lines: "盗む入り口の、だますメール", move: "第2章の比の図に戻る（34と同じ絵）。ゆっくりカメラが引く" },
  { title: "締めのひと言（毎回同じ）", C: S53, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const panels: Panel[] = P.map((p, i) => ({ key: String(i + 1).padStart(2, "0"), ...p }));
export const storyboard: StoryboardDef = { id: "007-data-leaks", title: "情報漏えい（第2版）", panels };
export default storyboard;
