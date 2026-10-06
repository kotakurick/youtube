// 3本目「『普通の相手』の条件を全部満たす人の数」の絵コンテ 第1版（台本は script.md の第6稿・手直し版。2026-10-06）。
// 各場面は「動き終わりの姿」。秒数（sec）は台本の文字数からの見積もり（1分390字）、動き（move）は本編で付ける動き。
// 数字は sources.csv の値（S2〜S4・S12・S13・S15・S16）と data/count_result.md。男女の回なので色は男女の色だけ。
// 物語の主人公は猫（女性＝オレンジ）。2回目のお見合いの相手は青い猫で、顔は出さず後ろ姿か名札だけ（「笑うと目がなくなる」は台本の声で）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { ChapterDots } from "@lib/Chapter";
import { TodayCard } from "@lib/Cards";
import { Cat } from "@lib/Cat";
import { Dumbbell } from "@lib/Dumbbell";
import { Figure } from "@lib/Figure";
import { Gosa } from "@lib/Gosa";
import { hundred } from "@lib/layout";
import { Clock, Cup, Table } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SearchScreen } from "@lib/SearchScreen";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { TwoSieves } from "@lib/TwoSieves";
import { Verdict } from "@lib/Verdict";
import { C, font, LINE, R } from "@lib/theme";

// ---- この回の配置の道具 ----
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: "label" | "value" | "question" | "body" | "note" | "hero";
  color?: string; anchor?: "start" | "middle" | "end"; weight?: number }> = ({ x, y, children, size = "label", color = C.ink, anchor = "start", weight }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...font(size, color), ...(weight ? { fontWeight: weight } : {}) }}>{children}</text>
);
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 96, top: 56, width: 1500, ...font("question") }}>{children}</div>
);
const FLOOR = 900;
/** 夜の部屋：低いテーブルの前に座る彼女（2本目の寝室とは別の部屋・別の構図） */
const Room: React.FC<{ face?: "normal" | "sad" | "think" | "surprised"; minute?: number; cup?: boolean }> = ({ face = "normal", minute = 10, cup = true }) => (
  <>
    <Backdrop kind="room" floor={FLOOR} variant={5} night />
    <Svg>
      <Clock x={1080} y={300} r={56} hour={1} minute={minute} />
      <Table x={760} y={FLOOR} size={4.2} w={110} />
      {cup && <Cup x={620} y={FLOOR - 21 * 4.2} size={3.6} steam={false} />}
      <Cat kind="female" x={1180} y={FLOOR + 10} size={4.2} pose="phone" face={face} facing={-1} label="彼女" />
    </Svg>
  </>
);
const ROWS = (on: number, mark?: number) => [
  { label: "年収 500万円以上", on: on >= 1, mark: mark === 0 },
  { label: "大学卒業以上", on: on >= 2, mark: mark === 1 },
  { label: "身長 170cm以上", on: on >= 3, mark: mark === 2 },
  { label: "たばこを吸わない", on: false, dim: true },
  { label: "正社員", on: false, dim: true },
];
const DISCLAIM = "人数は国の統計の割合を千人に置き換えた架空のもの（就業構造基本調査2022ほか）。身長は見積もり";

// ================= 冒頭 =================
const P01: React.FC = () => (
  <AbsoluteFill><Room face="normal" />
    <div style={{ position: "absolute", left: 96, top: 64, ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "4px 16px" }}>会社員（33）　相談所に入って3か月</div>
  </AbsoluteFill>
);
const P02: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={FLOOR} variant={2} />
    <Svg>
      <Table x={960} y={FLOOR} size={4} w={90} />
      <Cup x={880} y={FLOOR - 84} size={3.2} />
      <Cup x={1040} y={FLOOR - 84} size={3.2} />
      <Cat kind="female" x={640} y={FLOOR + 10} size={3.8} pose="sit" face="happy" facing={1} label="彼女" />
      <Cat kind="male" x={1300} y={FLOOR + 10} size={3.8} pose="sit" face="happy" facing={-1} label="二回目の人" />
      <g data-qa-allow="prop">
        <rect x={1180} y={180} width={600} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
        <Label x={1220} y={240} size="note" color={C.ink2}>翌日　相手の相談所から</Label>
        <Label x={1220} y={300}>今回はお見送りに…</Label>
      </g>
    </Svg>
  </AbsoluteFill>
);
const Screen: React.FC<{ count: number; on: number; prev?: number; mark?: number; ghost?: boolean; side?: React.ReactNode }> = ({ count, on, prev, mark, ghost, side }) => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={620} y={520} h={820} count={count} prev={prev} rows={ROWS(on, mark)} />
      {ghost && <g data-qa="mark" data-qa-label="消える1人"><rect x={1180} y={680} width={560} height={110} rx={R.md} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="12 8" /><Label x={1460} y={750} anchor="middle" color={C.ink2}>二回目の人</Label></g>}
      {side}
    </Svg>
    <SourceNote text={DISCLAIM} prefix="" y={968} />
  </AbsoluteFill>
);
const P03: React.FC = () => <Screen count={1000} on={0} side={<><Label x={1180} y={500} color={C.ink2}>25〜34歳の</Label><Label x={1180} y={560} color={C.ink2}>結婚していない男性</Label></>} />;
const P04: React.FC = () => <Screen count={132} on={1} prev={1000} mark={0} side={<Label x={1180} y={540} size="value">千人 → 132人</Label>} />;
const P05: React.FC = () => (
  <Screen count={106} on={2} prev={132} mark={1} side={<>
    <Label x={1180} y={500} size="value">132人 → 106人</Label>
    <Label x={1180} y={580} color={C.ink2}>二割しか減らない</Label>
    <Cat kind="female" x={1560} y={900} size={2.6} pose="stand" face="think" facing={-1} label="彼女" />
  </>} />
);
const P06: React.FC = () => (
  <Screen count={59} on={3} prev={106} mark={2} ghost side={<>
    <Label x={1180} y={500} size="value">106人 → 59人</Label>
    <Label x={1180} y={580} color={C.ink2}>半分近くが、一度に消える</Label>
    <Label x={1180} y={860} color={C.ink2}>この画面には、出てこない</Label>
  </>} />
);
const P07: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={520} y={540} h={760} count={59} rows={ROWS(3)} title="彼女の画面" />
      <SearchScreen x={1400} y={540} h={760} count="？" unit="" title="あの人の画面" rows={[
        { label: "？", on: true }, { label: "？", on: true }, { label: "？", on: true }, { label: "？", on: false, dim: true }, { label: "？", on: false, dim: true }]} />
      <Label x={960} y={560} anchor="middle" size="value">⇄</Label>
    </Svg>
  </AbsoluteFill>
);
const P08: React.FC = () => <AbsoluteFill><TodayCard claim="普通の相手は、数%しかいない" /><Gosa cues={[[-60, "thinking"]]} size="M" /></AbsoluteFill>;
const P09: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="年収850万円以上の男性だけなら、背による差は？" choices={["ほとんど消える", "半分くらいに縮む", "変わらない", "もっと広がる"]} />
    <Svg>
      <Label x={96} y={800} color={C.ink2}>男性会員全体では</Label>
      <Label x={96} y={860}>160cm以下 27.6%　／　172cm 37.4%　（差 約10ポイント）</Label>
    </Svg>
    <SourceNote text="IBJ 結婚みらい研究所（2026）。成婚率＝成婚者÷（成婚者＋退会者）" y={930} />
  </AbsoluteFill>
);

// ================= 第1章 =================
const P10: React.FC = () => {
  const pts = hundred(100, { x: 1020, bottom: 800, cols: 10, dx: 64, dy: 66 }, 1.1);
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>画面の千人の正体</Heading>
      <Svg>
        <SearchScreen x={420} y={500} h={600} count={1000} rows={ROWS(0)} />
        {pts.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={1.1} />)}
        <Label x={1680} y={520} color={C.ink2}>1人＝</Label>
        <Label x={1680} y={580} color={C.ink2}>10人</Label>
      </Svg>
      <SourceNote text="総務省「就業構造基本調査」2022（25〜34歳の未婚男性。働いていない人を含む）" />
    </AbsoluteFill>
  );
};
// 年収500万円以上（13人）を前に出し、その中の大卒（約8割＝10人）と、千人全体の大卒（約5割）
const P11: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="年収500万円以上の人のうち、大学を出ている人は？" choices={["約2割", "約5割", "約8割", "ほぼ全員"]} title="考えてみよう" />
  </AbsoluteFill>
);
const P12: React.FC = () => {
  const top = hundred(13, { x: 200, bottom: 560, cols: 13, dx: 64, dy: 80 }, 1.3);
  const all = hundred(100, { x: 1080, bottom: 800, cols: 10, dx: 58, dy: 54 }, 0.9);
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>年収と学歴は、同じ人のところにそろう</Heading>
      <Svg>
        <Label x={200} y={330}>年収500万円以上の人（100人に13人）</Label>
        {top.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={1.3} dim={i >= 10} />)}
        <Label x={200} y={680} size="value">大学を出た人 約8割</Label>
        <Label x={1080} y={250}>千人全体（100人に換算）</Label>
        {all.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={0.9} dim={i >= 49} />)}
        <Label x={1650} y={520}>大学を</Label>
        <Label x={1650} y={580}>出た人</Label>
        <Label x={1650} y={660} size="value">約5割</Label>
      </Svg>
      <SourceNote text="就業構造基本調査2022 第40表・第118表から当チャンネルが集計（年収500万円以上の人のうち大卒以上80.1%、全体49.3%）" />
    </AbsoluteFill>
  );
};
// 物差しの比喩：お金の物差し（年収・学歴の目盛り）と、別の物差し（身長）
const Ruler: React.FC<{ x: number; y: number; w: number; title: string; ticks: [number, string][]; color: string }> = ({ x, y, w, title, ticks, color }) => (
  <g>
    <Label x={x} y={y - 40}>{title}</Label>
    <rect x={x} y={y} width={w} height={70} rx={R.sm} fill={color} stroke={C.ink} strokeWidth={LINE.thin} />
    {Array.from({ length: 21 }, (_, i) => <line key={i} x1={x + (i * w) / 20} x2={x + (i * w) / 20} y1={y} y2={y + (i % 5 === 0 ? 34 : 18)} stroke={C.ink} strokeWidth={3} />)}
    {ticks.map(([t, s]) => (
      <g key={s}><path d={`M${x + t * w} ${y + 70} v40`} stroke={C.ink} strokeWidth={LINE.base} /><Label x={x + t * w} y={y + 150} anchor="middle">{s}</Label></g>
    ))}
  </g>
);
const P13: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={1} />
    <Heading>同じ物差しの上の条件と、別の物差しの条件</Heading>
    <Svg>
      <Ruler x={160} y={330} w={1500} title="お金の物差し" color={C.paper2} ticks={[[0.62, "大学"], [0.86, "年収500万円"]]} />
      <Ruler x={160} y={680} w={700} title="身長の物差し（別の一本）" color={C.white} ticks={[[0.5, "170cm"]]} />
      <Label x={980} y={760} color={C.ink2}>身長と給料の関係は弱い</Label>
    </Svg>
    <SourceNote text="身長と賃金：慶應義塾大学パネルデータ設計・解析センター DP2009-010（正規雇用の男性で1cmあたり時給約0.7%）" />
  </AbsoluteFill>
);
// 掛け算の世界と、実際の世界（冒頭の3条件）
const P14: React.FC = () => {
  const L = hundred(100, { x: 200, bottom: 800, cols: 10, dx: 58, dy: 56 }, 0.95);
  const Rr = hundred(100, { x: 1100, bottom: 800, cols: 10, dx: 58, dy: 56 }, 0.95);
  return (
    <AbsoluteFill>
      <ChapterDots current={1} />
      <Heading>ばらばらに掛け算すると、少なく出る</Heading>
      <Svg>
        <Label x={200} y={250}>掛け算の世界</Label>
        {L.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={0.95} dim={i >= 4} />)}
        <Label x={200} y={890} size="value">千人に36人</Label>
        <Label x={1100} y={250}>実際に重ねた世界</Label>
        {Rr.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={0.95} dim={i >= 6} />)}
        <Label x={1100} y={890} size="value">千人に59人</Label>
      </Svg>
      <SourceNote text="当チャンネルの計算と第40表の重なり。1人＝10人、身長は見積もり" y={950} />
    </AbsoluteFill>
  );
};

// ================= 第2章 =================
const SIX = ["年齢", "年収", "仕事の形", "学歴", "身長", "体型"];
const P15: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>独身の男女 約1万人が、自分で答えた六つの条件</Heading>
    <Svg>
      {SIX.map((s, i) => (
        <g key={s}><rect x={140 + i * 270} y={360} width={240} height={110} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={260 + i * 270} y={430} anchor="middle" size="value">{s}</Label></g>
      ))}
      {Array.from({ length: 10 }, (_, i) => <Figure key={i} kind={i % 2 ? "female" : "male"} x={460 + i * 110} y={690} size={2} />)}
      <Label x={960} y={790} anchor="middle" color={C.ink2}>この1万人を、一つの結婚の市場とみなして数えた</Label>
    </Svg>
    <SourceNote text="鈴木亘・八代尚宏（2025）内閣府経済社会総合研究所『経済分析』211号。2024年3月調査、25〜49歳の独身者 男性5,103・女性4,897" />
  </AbsoluteFill>
);
const P16: React.FC = () => {
  const one = [52.9, 43.1, 70.0, 78.0, 65.1, 64.0];
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>女性の条件：一つずつなら、4割から8割の男性が満たす</Heading>
      <Svg>
        {one.map((v, i) => {
          const x = 180 + i * 250, h = v * 5.2;
          return (
            <g key={i}><rect data-qa="mark" data-qa-label={SIX[i]} x={x} y={820 - h} width={150} height={h} rx={R.sm / 2} fill={C.male} />
              <Label x={x + 75} y={800 - h} anchor="middle">{`${Math.round(v)}%`}</Label>
              <Label x={x + 75} y={870} anchor="middle">{SIX[i]}</Label></g>
          );
        })}
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2「女性の希望率」（条件1つだけのとき）" y={930} />
    </AbsoluteFill>
  );
};
const P17: React.FC = () => {
  const pts = hundred(100, { x: 260, bottom: 820, cols: 10, dx: 62, dy: 63 }, 1.05);
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>六つ全部を満たす男性</Heading>
      <Svg>
        {pts.map((p, i) => <Figure key={i} kind="male" x={p.x} y={p.y} size={1.05} dim={i >= 13} />)}
        <Label x={1060} y={430} size="hero">8人に1人</Label>
        <Label x={1070} y={560} color={C.ink2}>数パーセント、ではない</Label>
        <Label x={1070} y={680}>一つずつ掛け算すると　20人に1人ほど</Label>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2（女性の希望率13.3%）。掛け算（約5.2%）は当チャンネルの計算" y={930} />
    </AbsoluteFill>
  );
};
const P18: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>掛け算より多く残る理由として、考えられるのは二つ</Heading>
    <Svg>
      <rect x={140} y={300} width={760} height={420} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={180} y={370} weight={900}>① 相手の側で、条件がそろう</Label>
      {[0, 1, 2].map((i) => <Figure key={i} kind="male" x={330 + i * 160} y={640} size={2.6} dim={i !== 1} />)}
      <Label x={520} y={690} anchor="middle" size="note" color={C.ink2}>年収も学歴も、同じ人が満たす</Label>
      <rect x={1020} y={300} width={760} height={420} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={370} weight={900}>② 選ぶ側に、こだわりの差</Label>
      <Figure kind="female" x={1220} y={640} size={2.6} />
      <Label x={1220} y={690} anchor="middle" size="note" color={C.ink2}>何にでもこだわる</Label>
      <Figure kind="female" x={1580} y={640} size={2.6} />
      <Label x={1580} y={690} anchor="middle" size="note" color={C.ink2}>あまりこだわらない</Label>
      <Label x={960} y={810} anchor="middle" color={C.ink2}>どちらがどれだけ効いているかは、この論文からは分からない</Label>
    </Svg>
  </AbsoluteFill>
);
const P19: React.FC = () => {
  const pts = hundred(100, { x: 260, bottom: 820, cols: 10, dx: 62, dy: 63 }, 1.05);
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>男性の条件：六つ全部を満たす女性</Heading>
      <Svg>
        {pts.map((p, i) => <Figure key={i} kind="female" x={p.x} y={p.y} size={1.05} dim={i >= 33} />)}
        <Label x={1060} y={430} size="hero">3人に1人</Label>
        <Label x={1070} y={560} color={C.ink2}>年収・仕事・身長を気にしない男性が多い</Label>
        <Label x={1070} y={640}>年齢と体型は、男性もよく気にする</Label>
      </Svg>
      <SourceNote text="鈴木・八代（2025）表2（男性の希望率32.5%）、図2〜7" y={930} />
    </AbsoluteFill>
  );
};
const P20: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>お互いに条件を満たし合う男女は？</Heading>
    <Svg>
      <TwoSieves x={120} y={250} left={{ pass: 13, label: "女性の条件を満たす男性" }} right={{ pass: 33, label: "男性の条件を満たす女性" }}
        both={{ pass: 4, label: "お互いに満たし合う組" }} />
    </Svg>
    <SourceNote text="鈴木・八代（2025）表2（成立率3.8%。研究者は「極めて狭き門」）。人の数は丸めて描いている" y={930} />
  </AbsoluteFill>
);
const P21: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={2} />
    <Heading>数えているのは、自分の側のふるいだけ</Heading>
    <Svg>
      <path d="M260 330 H860 L700 560 H420 Z" fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
      <Label x={560} y={300} anchor="middle">自分のふるい</Label>
      <path d="M1060 330 H1660 L1500 560 H1220 Z" fill={C.paper2} stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="14 10" />
      <Label x={1360} y={300} anchor="middle">相手のふるい</Label>
      <Cat kind="female" x={560} y={820} size={2.6} pose="stand" face="think" facing={1} label="彼女" />
      <Cat kind="male" x={1360} y={820} size={2.6} pose="stand" face="normal" facing={-1} label="相手" />
      <Label x={960} y={700} anchor="middle" color={C.ink2}>両方を通らないと、二人は会えない</Label>
    </Svg>
    <SourceNote text="鈴木・八代（2025）p.90「６つそれぞれの条件が重なり合うことで、3.8％という狭き門を作り出している」" y={930} />
  </AbsoluteFill>
);

// ================= 第3章 =================
const P22: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Room face="sad" />
    <Svg><g data-qa-allow="prop">
      <rect x={1320} y={160} width={520} height={150} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1350} y={220} size="note" color={C.ink2}>選ぶ側で、選ばれる側</Label>
      <Label x={1350} y={280}>今回はお見送りに…</Label>
    </g></Svg>
  </AbsoluteFill>
);
const P23: React.FC = () => (
  <AbsoluteFill>
    <Quiz question="会う前の理想の条件は、会ったときの気持ちをどれくらい当てる？" choices={["ほぼ言い当てる", "半分くらい", "少しだけ", "ほとんど言い当てない"]} title="考えてみよう" />
  </AbsoluteFill>
);
const P24: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Heading>会う前の条件 と 会ったときの気持ち</Heading>
    <Svg>
      <rect x={140} y={260} width={760} height={520} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={180} y={330} weight={900}>会う前のアンケート</Label>
      <Figure kind="male" x={330} y={620} size={2.4} /><Label x={330} y={700} anchor="middle">見た目を重く見る</Label>
      <Figure kind="female" x={690} y={620} size={2.4} /><Label x={690} y={700} anchor="middle">稼ぐ見込みを重く見る</Label>
      <rect x={1020} y={260} width={760} height={520} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1060} y={330} weight={900}>スピードデートで会ったとき</Label>
      <Figure kind="male" x={1210} y={620} size={2.4} /><Figure kind="female" x={1570} y={620} size={2.4} />
      <Label x={1400} y={700} anchor="middle">男女の差は出なかった</Label>
      <Label x={1400} y={750} anchor="middle" size="note" color={C.ink2}>会う前の条件は、ほとんど言い当てなかった</Label>
    </Svg>
    <SourceNote text="Eastwick & Finkel（2008）J Pers Soc Psychol。米国の大学生163人。初対面で惹かれるかの研究" y={930} />
  </AbsoluteFill>
);
const P25: React.FC = () => (
  <AbsoluteFill>
    <ChapterDots current={3} />
    <Svg>
      <SearchScreen x={620} y={540} h={760} count={59} rows={ROWS(3)} title="会う前の条件" />
      <Label x={1180} y={420}>欄の外にあったもの</Label>
      {["話が弾んだ", "笑うと目がなくなる", "断られた理由"].map((t, i) => (
        <g key={t}><rect x={1180} y={470 + i * 120} width={560} height={90} rx={R.md} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray={i === 2 ? "12 8" : undefined} />
          <Label x={1210} y={530 + i * 120}>{t}</Label></g>
      ))}
    </Svg>
  </AbsoluteFill>
);

// ================= 答え合わせ =================
const P26: React.FC = () => (
  <AbsoluteFill>
    <Verdict claim="普通の相手は、数%しかいない" mark="△"
      reason={["自分の条件だけなら：女性の側 8人に1人、男性の側 3人に1人", "お互いに満たし合う組まで数えると：26人に1人", "片側だけ数えるか、両側を数えるかで決まる"]} />
  </AbsoluteFill>
);
const IBJ: [string, number, number][] = [["年収450万円以下", 10.7, 23.6], ["550万〜750万円", 33.1, 41.3], ["850万円以上", 41.8, 43.9]];
const P27: React.FC = () => (
  <AbsoluteFill>
    <Heading>予想の答え：A　年収が上がるほど、身長の差は縮む</Heading>
    <Dumbbell rows={IBJ.map(([label, a, b]) => ({ label, a, b }))} aLabel="160cm以下" bLabel="172cm以上" max={50} x={140} y={340} width={1500} rowH={150}
      format={(v) => `${v.toFixed(1)}%`} />
    <SourceNote text="IBJ（2026年6月5日 PR TIMES、図2）。成婚率＝成婚者÷（成婚者＋退会者）。会社の集計で、区分ごとの人数は出ていない" y={930} />
  </AbsoluteFill>
);

// ================= ミクロ・教訓 =================
const P28: React.FC = () => (
  <AbsoluteFill>
    <Heading>どれか一つは外れていてもいい、とすると</Heading>
    <Svg>
      <TwoSieves x={120} y={250} left={{ pass: 33, label: "女性の側（5つでよい）" }} right={{ pass: 61, label: "男性の側（5つでよい）" }}
        both={{ pass: 19, label: "お互いに満たし合う組" }} />
    </Svg>
    <SourceNote text="鈴木・八代（2025）表5（成立率3.8%→18.8%）。大事な条件が外れている組も含む（脚注5）" y={930} />
  </AbsoluteFill>
);
const P29: React.FC = () => (
  <AbsoluteFill><Room face="think" minute={30} cup={false} />
    <Svg><Cat kind="male" x={260} y={FLOOR + 10} size={2.2} pose="stand" facing={1} face="normal" label="あの人（思い出）" /></Svg>
  </AbsoluteFill>
);
const P30: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <SearchScreen x={520} y={540} h={760} count={59} rows={ROWS(3)} title="彼女の画面" />
      <SearchScreen x={1400} y={540} h={760} count="？" unit="" title="相手の画面" rows={[
        { label: "？", on: true }, { label: "？", on: true }, { label: "？", on: true }, { label: "？", on: false, dim: true }, { label: "？", on: false, dim: true }]} />
    </Svg>
    <div style={{ position: "absolute", left: 96, top: 940, width: 1728, ...font("label"), textAlign: "center" }}>
      相手の数を数えるとき、私たちは、相手の側のふるいを数え忘れています。
    </div>
  </AbsoluteFill>
);
const P31: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const panels: Panel[] = [
  { key: "01", title: "冒頭：午前1時の部屋", C: P01, sec: 11, move: "夜の部屋を引きで。低いテーブルの前で彼女がスマホを見る。時計は1時10分（2本目の寝室とは別の部屋・構図）" },
  { key: "02", title: "冒頭：二回目のお見合い", C: P02, sec: 11, move: "回想（色を少し淡く）。向かい合って笑う2匹 → 翌日の通知の札が上から降りる" },
  { key: "03", title: "冒頭：検索画面 千人", C: P03, sec: 5, move: "スマホに寄ると検索画面。上に「千人」" },
  { key: "04", title: "冒頭：年収 → 132人", C: P04, sec: 5, move: "年収の欄にチェック → 数字が千から132へ数え下がる" },
  { key: "05", title: "冒頭：大卒 → 106人", C: P05, sec: 7, move: "大学の欄にチェック → 106。数字がほとんど動かず、彼女が首をかしげる" },
  { key: "06", title: "冒頭：身長 → 59人（あの人が消える）", C: P06, sec: 16, move: "身長の欄にチェック → 59へ大きく下がる。下の「二回目の人」の札が点線になって薄れる" },
  { key: "07", title: "冒頭：あの人の画面", C: P07, sec: 7, move: "彼女の画面が左へ寄り、右に同じ形の「あの人の画面」が鏡のように現れる（欄は「？」）" },
  { key: "08", title: "今日の答え合わせ", C: P08, sec: 8, move: "2つの画面を払ってカード" },
  { key: "09", title: "予想タイム（IBJ）", C: P09, sec: 27, move: "問い → 下に全体の差（約10ポイント）→ 選択肢4つ（答えは判定で）" },
  { key: "10", title: "第1章：千人の正体", C: P10, sec: 11, move: "第1章の扉 → 画面の千人が、右の100人（1人＝10人）に並び直す" },
  { key: "11", title: "第1章：考えてみよう（大卒は何割）", C: P11, sec: 8, move: "問いと選択肢。3秒の輪。答えは次の場面で" },
  { key: "12", title: "第1章：8割と5割", C: P12, sec: 13, move: "100人から年収500万円以上の13人が左へ出て、そのうち10人に色が残る。右の100人は大卒の約半分に色" },
  { key: "13", title: "第1章：二本の物差し", C: P13, sec: 24, move: "お金の物差しが伸び、目盛りに「大学」「年収500万円」が近くに並ぶ → 下に別の短い物差し（身長）が現れる" },
  { key: "14", title: "第1章：掛け算と実際", C: P14, sec: 23, move: "左右に100人。同じ3つのふるいを同時に重ねる。左は4人、右は6人が残る（1人＝10人）" },
  { key: "15", title: "第2章：1万人の六つの条件", C: P15, sec: 24, move: "第2章の扉 → 六つの札が並ぶ → 下に男女の人型が並ぶ" },
  { key: "16", title: "第2章：一つずつなら4〜8割", C: P16, sec: 8, move: "六本の棒が左から伸びる（男性の色：女性の条件を満たす男性）" },
  { key: "17", title: "第2章：全部なら8人に1人", C: P17, sec: 16, move: "100人が条件ごとに沈み、13人が残る。「8人に1人」が出たあと、小さく掛け算の値" },
  { key: "18", title: "第2章：理由は二つ考えられる", C: P18, sec: 16, move: "左の札（同じ人に条件がそろう）→ 右の札（こだわりの差）→ 下に「論文からは分からない」" },
  { key: "19", title: "第2章：男性の条件は3人に1人", C: P19, sec: 16, move: "女性100人が沈み、33人が残る。年齢と体型の札" },
  { key: "20", title: "第2章：お互いに満たし合う組", C: P20, sec: 24, move: "左右の100人のふるいが並ぶ → 間から、両方を通った組だけが右へ集まり、100組に4組が光る" },
  { key: "21", title: "第2章：自分のふるいと相手のふるい", C: P21, sec: 19, move: "自分のふるい（実線）だけ見えている → 相手のふるい（点線）が浮かび上がる。2匹の間に一文" },
  { key: "22", title: "第3章：選ばれる側でもあった", C: P22, sec: 8, move: "第3章の扉 → 冒頭の部屋。お断りの通知がもう一度" },
  { key: "23", title: "第3章：考えてみよう（言い当てる？）", C: P23, sec: 13, move: "問いと選択肢。3秒の輪" },
  { key: "24", title: "第3章：会う前と会ったとき", C: P24, sec: 24, move: "左の札（会う前：男女で別の条件）→ 右の札（会ったとき：差が消える）。答え「ほとんど言い当てない」" },
  { key: "25", title: "第3章：欄の外", C: P25, sec: 12, move: "検索画面の右に、欄に書けないものの札が1枚ずつ。「断られた理由」は点線" },
  { key: "26", title: "答え合わせ △", C: P26, sec: 20, move: "証拠の札が3枚 → △の印。「片側だけ数えるか、両側を数えるか」" },
  { key: "27", title: "予想の答え：A（年収ごとの身長の差）", C: P27, sec: 30, move: "年収の3段のダンベルが上から順に伸びる。下の段ほど点が近づき、850万円以上でほぼ重なる" },
  { key: "28", title: "ミクロ：一つは外れていてもいい", C: P28, sec: 24, move: "第2章の両側のふるいに戻り、両方の通る人が増える → 組が4から19へ増える（約5倍）" },
  { key: "29", title: "教訓：午前1時半の部屋", C: P29, sec: 16, move: "冒頭と同じ部屋。時計は1時半。指はどのチェックにも触れない。左に思い出の青い猫が薄く浮かんで消える" },
  { key: "30", title: "締め：二つの画面", C: P30, sec: 30, move: "彼女の画面と相手の画面が向かい合う。教訓の文に合わせて、相手の画面の欄が点線から実線に。締めの一文" },
  { key: "31", title: "締めのひと言（毎回同じ）", C: P31, sec: 8, move: "共通のアニメーション（SignOff）。字幕なし" },
];

const storyboard: StoryboardDef = { id: "003-normal-partner", title: "「普通の相手」の数（第1版）", panels };
export default storyboard;
