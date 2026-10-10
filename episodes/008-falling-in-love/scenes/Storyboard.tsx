// 8本目「人を好きになるって、どういうこと？」（仮の題）の絵コンテ 第1版（2026-10-10。台本は script.md の第9稿・B案）。
// 各場面は「動き終わりの姿」。秒数（sec）は timing.json（無音の仮通し）の文の時刻から（data/sb_secs.py で入れる）。
// lines はその場面の最初の文。動き（move）は本編で付ける動き。key は一覧の番号と同じ（01〜。並べた順に自動で付く）。
// B案（2026-10-10 オーナー。008 で試す）：「今日の答え合わせ」カードと最後の判定はない。予想の答えは第2章の山場で1回だけ（ゴサのひげ短め）。
// 色の決まり（この回の意味の色）：好きになりやすさ＝青緑（teal）、好かれやすさ＝金（gold）、相性＝赤（debt。いちばん目立つ色）。
//   条件の表・予測の針・出会いの帯は墨と灰（色を使わない）。結晶は白と紙色（意味の色と混ぜない）。
// 人物：男女の回ではないので、ケプラーも群衆も紫の猫（kind="plain"）。実在の人物（ケプラー・ベッカーなど）は猫で、似顔にしない。
//   ベッカー・スタンダール・フランクファートは本と引用の札で見せ、猫にしない（物語の主人公はケプラーだけ）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "@lib/Backdrop";
import { Cat, CatLabel } from "@lib/Cat";
import { ChapterDots } from "@lib/Chapter";
import { Gosa } from "@lib/Gosa";
import { Facts, Note } from "@lib/Labels";
import { Desk, Phone } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SourceNote } from "@lib/SourceNote";
import type { Panel, StoryboardDef } from "@lib/Storyboard";
import { Bubble, Thought } from "@lib/StoryAnim";
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
const Ask: React.FC<{ text: string; x?: number; y?: number }> = ({ text, x = 480, y = 740 }) => <Note x={x} y={y} question text={text} />;

const SRC = {
  kepler: "Ferguson 1989（ケプラーの伝記）。1613年10月23日付の手紙",
  ipss: "国立社会保障・人口問題研究所 出生動向基本調査 第17回 2025年（調査前5年に結婚した初婚どうし570組）。分け方はこの動画の計算",
  ipss2: "出生動向基本調査 第16回 2021年・第17回 2025年。ネット＋結婚相談所",
  seat: "Back ほか 2008（ドイツの大学の新入生、席をくじで決めた）。友人関係の研究",
  school: "Rohrer ほか 2021（ハンガリーの小学校40校・2,966人、1学期）。友人関係の研究",
  joel: "Joel ほか 2017（米国の大学生のスピードデート、2つの標本163人・187人。4分の会話のあとの好意）",
  becker: "Becker 1973／1974（結婚の経済学）",
  brain: "Bartels と Zeki 2000（17人、友人の写真と比較）ほか。脳の働きの相対的な差で、判断の誤りを測ったものではない",
  stendhal: "スタンダール『恋愛論』1822年",
  frankfurt: "Frankfurt『愛の理由』2004年（書評で確認）",
  gerlach: "Gerlach ほか 2019（ドイツの独身者763人、18〜40歳、5か月）",
};

// ================= ケプラーの部屋（冒頭と教訓で同じ部屋。夜、机とろうそく） =================
const ROOM = { floor: 860, deskX: 1100, catX: 860, catY: 840, size: 4.4 };
const Candle: React.FC<{ x: number; y: number; lit?: boolean }> = ({ x, y, lit = true }) => (
  <g data-qa="prop" data-qa-label="ろうそく">
    {lit && <circle cx={x} cy={y - 76} r={70} fill={C.goldTint} opacity={0.35} />}
    <rect x={x - 10} y={y - 60} width={20} height={60} rx={4} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
    {lit && <path d={`M${x},${y - 94} q12,16 0,30 q-12,-14 0,-30 Z`} fill={C.gold} />}
  </g>
);
const Letter: React.FC<{ x: number; y: number; done?: boolean }> = ({ x, y, done }) => (
  <g data-qa="prop" data-qa-label="手紙">
    <rect x={x - 70} y={y - 16} width={140} height={14} rx={3} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
    {done && <circle cx={x + 40} cy={y - 9} r={10} fill={C.debt} />}
  </g>
);
const Study: React.FC<{ face?: "normal" | "think" | "sad" | "smile"; done?: boolean; children?: React.ReactNode }> = ({ face = "think", done, children }) => (
  <>
    <Backdrop kind="room" night floor={ROOM.floor} variant={5} />
    <Svg>
      <rect data-qa="bg" x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.32} />
      <Desk x={ROOM.deskX} y={ROOM.floor} size={ROOM.size} w={80} />
      <Candle x={ROOM.deskX + 120} y={ROOM.floor - 96} />
      <Letter x={ROOM.deskX - 40} y={ROOM.floor - 96} done={done} />
      <Cat kind="plain" x={ROOM.catX} y={ROOM.catY} size={ROOM.size} pose="sit" face={face} turn={0.5} look={[0.6, 0.5]} label="ケプラー" />
      {children}
    </Svg>
  </>
);

export const S01: React.FC = () => (
  <AbsoluteFill><Study><CatLabel x={ROOM.catX} y={ROOM.catY} size={ROOM.size} text="天文学者 ケプラー" /></Study></AbsoluteFill>
);
/** 火星の通り道：点線の円（当時の考え）と、実線の楕円（ケプラーの計算） */
export const S02: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Svg>
      <circle cx={960} cy={480} r={300} fill="none" stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="14 12" />
      <ellipse data-qa="mark" data-qa-label="楕円" cx={960} cy={480} rx={380} ry={260} fill="none" stroke={C.white} strokeWidth={LINE.heavy} />
      <circle cx={860} cy={480} r={40} fill={C.gold} />
      <circle cx={1340} cy={480} r={18} fill={C.debtTint} />
      <Label x={1340} y={440} anchor="middle" color={C.white}>火星</Label>
      <Label x={860} y={560} anchor="middle" color={C.goldTint}>太陽</Label>
      <Label x={960} y={810} anchor="middle" color={C.white} size="value">円ではなく、楕円</Label>
    </Svg>
  </AbsoluteFill>
);
/** 妻を亡くしたあと、ひとりの部屋（昼）。最初の結婚は周りがまとめた縁談 */
export const S03: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={ROOM.floor} variant={5} />
    <Svg>
      <Cat kind="plain" x={760} y={ROOM.catY} size={ROOM.size} pose="sit" face="sad" turn={-0.4} look={[-0.6, 0.3]} label="ケプラー" />
      <Desk x={ROOM.deskX} y={ROOM.floor} size={ROOM.size} w={80} />
      <Label x={1500} y={300} anchor="middle" size="value">1611年</Label>
    </Svg>
  </AbsoluteFill>
);
/** 候補の11人：壁の11枚の額（中は紫の猫の顔の影）。番号つき */
const Frames: React.FC<{ y?: number; hi?: number }> = ({ y = 300, hi }) => (
  <g>
    {Array.from({ length: 11 }, (_, i) => {
      const x = 150 + i * 150;
      return (
        <g key={i}>
          <rect x={x} y={y} width={120} height={150} rx={R.sm} fill={C.white} stroke={i + 1 === hi ? C.ink : C.ink2} strokeWidth={i + 1 === hi ? LINE.heavy : LINE.thin} />
          <circle cx={x + 60} cy={y + 80} r={34} fill={C.plain} opacity={0.75} />
          <path d={`M${x + 32},${y + 58} l8,-30 l16,22 Z M${x + 88},${y + 58} l-8,-30 l-16,22 Z`} fill={C.plain} opacity={0.75} />
          <Label x={x + 60} y={y + 200} anchor="middle" size="note" weight={700}>{`${i + 1}`}</Label>
        </g>
      );
    })}
  </g>
);
export const S04: React.FC = () => (
  <AbsoluteFill>
    <Heading>再婚の候補は、11人</Heading>
    <Svg>
      <Frames />
      <Label x={960} y={640} anchor="middle" size="value">比べた期間：約2年</Label>
      <Label x={960} y={720} anchor="middle" size="label" color={C.ink2}>持参金・相手の親との話し合い・友人たちの意見</Label>
    </Svg>
    <SourceNote text={SRC.kepler} />
  </AbsoluteFill>
);

// ================= ケプラーの表（冒頭・ミクロ・締めで同じ表） =================
// 列＝会う前に書き出せる条件（墨の丸＝満たす、灰の輪＝満たさない）＋最後の列「心が惹かれた」（相性の赤）。
const COLS = ["身分", "財産", "相手の親", "友人の評判"];
// 1〜11番目の条件（1＝満たす）。5番目は条件を満たさず、心だけ。4番目は条件がそろう
const ROWS: number[][] = [
  [1, 0, 1, 0], [0, 1, 1, 0], [1, 1, 0, 1], [1, 1, 1, 1], [0, 0, 0, 0], [1, 0, 0, 1],
  [0, 1, 0, 0], [1, 0, 1, 1], [0, 0, 1, 0], [1, 1, 0, 0], [0, 1, 1, 1],
];
const TB = { x: 300, y: 200, row: 50, col: 220, nameW: 200 };
type TableMode = "plain" | "heart" | "friends" | "married" | "rewrite";
const KeplerTable: React.FC<{ mode?: TableMode; x?: number; y?: number }> = ({ mode = "heart", x = TB.x, y = TB.y }) => {
  const heartX = x + TB.nameW + COLS.length * TB.col;
  return (
    <g>
      {COLS.map((c, j) => <Label key={c} x={x + TB.nameW + j * TB.col + TB.col / 2} y={y + 36} anchor="middle" size="note" weight={700}>{c}</Label>)}
      {mode !== "plain" && <Label x={heartX + TB.col / 2} y={y + 36} anchor="middle" size="note" weight={900} color={C.debt}>心</Label>}
      {ROWS.map((r, i) => {
        const ry = y + 60 + i * TB.row;
        const five = i === 4, four = i === 3;
        const rewrite = mode === "rewrite";
        return (
          <g key={i}>
            {five && mode !== "plain" && <rect x={x - 12} y={ry} width={TB.nameW + (COLS.length + 1) * TB.col + 24} height={TB.row - 6} rx={R.sm}
              fill="none" stroke={C.ink} strokeWidth={LINE.heavy} />}
            <Label x={x + 20} y={ry + 38} size="note" weight={five ? 900 : 500}>{`${i + 1}番目`}</Label>
            {r.map((v, j) => {
              const cx = x + TB.nameW + j * TB.col + TB.col / 2, cy = ry + 26;
              const on = rewrite && five ? 1 : v;
              return on
                ? <circle key={j} data-qa="mark" data-qa-label="条件を満たす" cx={cx} cy={cy} r={14} fill={rewrite && five ? C.ink2 : C.ink} />
                : <circle key={j} data-qa="mark" data-qa-label="満たさない" cx={cx} cy={cy} r={14} fill="none" stroke={C.rest} strokeWidth={LINE.thin} />;
            })}
            {mode !== "plain" && five && <path data-qa="mark" data-qa-label="心が惹かれた" transform={`translate(${heartX + TB.col / 2},${ry + 30}) scale(1.4)`}
              d="M0 14 C-22 0 -18 -18 -6 -16 C-2 -15 0 -12 0 -10 C0 -12 2 -15 6 -16 C18 -18 22 0 0 14 Z" fill={C.debt} />}
            {four && (mode === "married" || mode === "rewrite") && <line x1={x} y1={ry + 26} x2={x + TB.nameW + COLS.length * TB.col} y2={ry + 26} stroke={C.ink} strokeWidth={LINE.base} />}
            {four && mode === "friends" && <rect x={x - 12} y={ry} width={TB.nameW + COLS.length * TB.col + 24} height={TB.row - 6} rx={R.sm}
              fill="none" stroke={C.ink2} strokeWidth={LINE.base} strokeDasharray="12 8" />}
          </g>
        );
      })}
    </g>
  );
};
export const S05: React.FC = () => (
  <AbsoluteFill>
    <Heading>ケプラーの表</Heading>
    <Svg><KeplerTable mode="heart" /></Svg>
    <SourceNote text="条件の丸は説明のための絵（伝記に表はない）。5番目に強く惹かれたことと、身分・財産がなかったことは伝記から" />
  </AbsoluteFill>
);
/** 友人たちの説得：「4番目の人にしなさい」 */
export const S06: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={ROOM.floor} variant={5} />
    <Svg>
      <Cat kind="plain" x={1240} y={ROOM.catY} size={3.6} pose="stand" face="think" turn={-0.5} label="ケプラー" />
      <Cat kind="plain" x={560} y={ROOM.catY} size={3.2} pose="stand" face="normal" turn={0.6} label="友人1" seed={3} />
      <Cat kind="plain" x={300} y={ROOM.catY} size={3.2} pose="stand" face="normal" turn={0.6} label="友人2" seed={5} />
      <Bubble x={200} y={260} text="4番目の人に申し込みなさい" tail={[560, 600]} />
    </Svg>
  </AbsoluteFill>
);
/** 4番目に断られ、5番目と結婚 */
export const S07: React.FC = () => (
  <AbsoluteFill>
    <Heading>最後に結婚したのは、5番目の女性</Heading>
    <Svg>
      <KeplerTable mode="married" />
      <Label x={1530} y={444} size="note" color={C.ink2}>断られた</Label>
    </Svg>
    <SourceNote text={SRC.kepler} />
  </AbsoluteFill>
);

// ================= 400年後：スマートフォンの条件の画面（架空。実在のサービスに似せない） =================
const CondPhone: React.FC<{ x: number; y: number; h?: number; rows?: number }> = ({ x, y, h = 560, rows = 3 }) => {
  const w = h * 0.5;
  const items = ["性格", "価値観", "好きなタイプ", "年収", "趣味", "住む場所", "休日", "お酒"].slice(0, rows);
  return (
    <g data-qa="prop" data-qa-label="条件の画面">
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w * 0.14} fill={C.ink} />
      <rect x={x - w / 2 + 14} y={y - h / 2 + 34} width={w - 28} height={h - 68} rx={8} fill={C.white} />
      {items.map((t, i) => {
        const ry = y - h / 2 + 56 + i * Math.min(62, (h - 110) / rows);
        return (
          <g key={t}>
            <rect x={x - w / 2 + 30} y={ry} width={w - 60} height={Math.min(50, (h - 110) / rows - 10)} rx={8} fill={C.paper2} />
            <circle cx={x + w / 2 - 54} cy={ry + Math.min(25, ((h - 110) / rows - 10) / 2)} r={10} fill={C.ink} />
          </g>
        );
      })}
    </g>
  );
};
export const S08: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={ROOM.floor} variant={2} />
    <Svg>
      <Cat kind="plain" x={640} y={ROOM.catY} size={4.4} pose="phone" face="normal" label="いまの人" seed={4} />
      <CondPhone x={1240} y={470} h={560} rows={3} />
      <Label x={1460} y={340} size="label">性格</Label>
      <Label x={1460} y={402} size="label">価値観</Label>
      <Label x={1460} y={464} size="label">好きなタイプ</Label>
    </Svg>
  </AbsoluteFill>
);
/** 条件のそろった相手に心が動かない／条件の外の人をなぜか好きになる */
export const S09: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect x={120} y={200} width={800} height={500} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <rect x={1000} y={200} width={800} height={500} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Cat kind="plain" x={360} y={620} size={3.6} pose="sit" face="normal" turn={0.5} label="自分" />
      <Cat kind="plain" x={680} y={620} size={3.6} pose="sit" face="smile" turn={-0.5} label="条件のそろった人" seed={6} />
      <Label x={520} y={260} anchor="middle" size="note" weight={700}>条件はそろっているのに、心が動かない</Label>
      <Cat kind="plain" x={1240} y={620} size={3.6} pose="sit" face="happy" turn={0.5} label="自分" seed={2} />
      <Cat kind="plain" x={1560} y={620} size={3.6} pose="sit" face="normal" turn={-0.5} label="条件の外の人" seed={8} />
      <Label x={1400} y={260} anchor="middle" size="note" weight={700}>条件に入っていなかった人を、なぜか</Label>
    </Svg>
    <Ask x={300} y={760} text="表をどれだけ細かくすれば、好きになる相手は当てられる？" />
  </AbsoluteFill>
);

// ================= 予想タイム =================
/** スピードデート：向かい合う4組、4分の砂時計 */
const SpeedDate: React.FC<{ y?: number }> = ({ y = 640 }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const x = 260 + i * 330;
      return (
        <g key={i}>
          <rect data-qa="prop" data-qa-label="テーブル" x={x - 60} y={y - 70} width={120} height={14} rx={4} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
          <Cat kind="plain" x={x - 105} y={y} size={2.4} pose="sit" face="normal" turn={0.6} label={`左${i}`} seed={i} />
          <Cat kind="plain" x={x + 105} y={y} size={2.4} pose="sit" face="smile" turn={-0.6} label={`右${i}`} seed={i + 5} />
        </g>
      );
    })}
  </g>
);
export const S10: React.FC = () => (
  <AbsoluteFill>
    <Heading>アメリカの大学のスピードデート</Heading>
    <SubHead>相手を替えながら、4分ずつ話す</SubHead>
    <Svg>
      <SpeedDate />
      <Label x={1640} y={420} anchor="middle" size="value">4分</Label>
      <path data-qa="prop" data-qa-label="砂時計" d="M1600,460 h80 l-40,60 l40,60 h-80 l40,-60 Z" fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={700} y={760} anchor="middle" size="label">会う前に、100を超える質問に答えている</Label>
    </Svg>
    <SourceNote text={SRC.joel} />
  </AbsoluteFill>
);
/** 会う前の答え → コンピューター → 点数の予想。知りたいのは「この相手にだけ向ける好意」（相性の赤） */
export const S11: React.FC = () => (
  <AbsoluteFill>
    <Heading>会う前の答えから、「好き」の点数を予想させる</Heading>
    <Svg>
      {[0, 1, 2].map((k) => <rect key={k} x={150 + k * 16} y={260 + k * 16} width={300} height={380} rx={R.sm} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />)}
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={210} y={330 + k * 50} width={200} height={14} rx={7} fill={C.rest} />)}
      <Label x={330} y={720} anchor="middle" size="note" weight={700}>会う前の答え（100以上）</Label>
      <path d="M520,460 h120" stroke={C.ink} strokeWidth={LINE.base} markerEnd="url(#ar)" />
      <defs><marker id="ar" markerWidth={10} markerHeight={10} refX={6} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.ink} /></marker></defs>
      <rect data-qa="prop" data-qa-label="コンピューター" x={680} y={340} width={300} height={220} rx={R.sm} fill={C.ink} />
      <rect x={700} y={360} width={260} height={150} rx={6} fill={C.ink2} />
      <Label x={830} y={620} anchor="middle" size="note" weight={700}>学習させる</Label>
      <path d="M1020,460 h120" stroke={C.ink} strokeWidth={LINE.base} markerEnd="url(#ar)" />
      <rect x={1180} y={280} width={600} height={160} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={1210} y={350} size="note" color={C.ink2}>誰にでも高い点を付ける傾向</Label>
      <Label x={1210} y={405} size="note" color={C.ink2}>ではなく</Label>
      <rect x={1180} y={470} width={600} height={170} rx={R.lg} fill={C.debtTint} stroke={C.debt} strokeWidth={LINE.heavy} />
      <Label x={1210} y={540} size="label" weight={900}>この相手にだけ向ける</Label>
      <Label x={1210} y={600} size="label" weight={900}>特別な好意</Label>
    </Svg>
    <SourceNote text={SRC.joel} />
  </AbsoluteFill>
);
const QUIZ_Q = "特別な好意の差を、会う前の答えでどれだけ言い当てられた？";
const QUIZ_C = ["8割ほど", "半分ほど", "2割ほど", "ほぼゼロ"];
export const S12: React.FC = () => <AbsoluteFill><Quiz question={QUIZ_Q} choices={QUIZ_C} gosaFoot={850} /></AbsoluteFill>;
/** 3つの問い（章の順番）。どの札にも、その章の主役の絵を小さく */
const QCARDS = ["誰と出会っている？", "誰を好きになる？", "好きな理由はどこから？"];
const ThreeQ: React.FC<{ focus?: number }> = ({ focus }) => (
      <Svg>
        {QCARDS.map((t, i) => {
          const x = 120 + i * 580;
          return (
            <g key={t} opacity={focus !== undefined && focus !== i ? 0.35 : 1}>
              <rect x={x} y={200} width={520} height={580} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={focus === i ? LINE.heavy : LINE.thin} />
              <Label x={x + 40} y={280} size="value">{`第${i + 1}章`}</Label>
              {i === 0 && <g>
                <rect x={x + 60} y={420} width={220} height={70} fill={C.ink} /><rect x={x + 280} y={420} width={110} height={70} fill={C.ink2} /><rect x={x + 390} y={420} width={70} height={70} fill={C.rest} />
              </g>}
              {i === 1 && <g>
                <circle cx={x + 170} cy={460} r={60} fill={C.teal} /><circle cx={x + 290} cy={430} r={78} fill={C.gold} /><circle cx={x + 360} cy={520} r={90} fill={C.debt} />
              </g>}
              {i === 2 && <Branch x={x + 260} y={600} k={0.8} crystals={14} />}
              <Label x={x + 260} y={720} anchor="middle" size="note" weight={700}>{t}</Label>
            </g>
          );
        })}
      </Svg>
);
export const S13: React.FC = () => <AbsoluteFill><Heading>3つの問い</Heading><ThreeQ /></AbsoluteFill>;

// ================= 第1章：誰と出会っているのか =================
export const S14: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={ROOM.floor} variant={3} />
    <Svg>
      <Cat kind="plain" x={760} y={ROOM.catY} size={4.4} pose="sit" face="think" look={[0.6, -0.6]} label="あなた" />
      <Thought x={1050} y={260} text="初めて会ったのは、どこ？" toward={[860, 520]} />
    </Svg>
    <ChapterDots current={1} />
  </AbsoluteFill>
);
/** 知り合ったきっかけを100%の帯に（55.1・27.9・17.0）。面積＝割合 */
const MEET = [
  { t: "もともとの人間関係", sub: "職場・学校・友人の紹介", v: 55.1, c: C.ink, txt: "約55%" },
  { t: "探しに行った", sub: "ネット・結婚相談所", v: 27.9, c: C.ink2, txt: "約28%" },
  { t: "それ以外", sub: "", v: 17.0, c: C.rest, txt: "" },
];
const MeetBand: React.FC<{ y?: number; w?: number; n?: number }> = ({ y = 360, w = 1600, n = 3 }) => {
  let x = 160;
  return (
    <g>
      {MEET.map((m, i) => {
        const ww = (w * m.v) / 100, x0 = x;
        x += ww;
        if (i >= n) return <rect key={m.t} x={x0} y={y} width={ww - 4} height={150} fill="none" stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="12 8" />;
        return (
          <g key={m.t}>
            <rect data-qa="mark" data-qa-label={m.t} x={x0} y={y} width={ww - 4} height={150} fill={m.c} />
            {m.txt && <Label x={x0 + 24} y={y + 100} size="value" color={C.white}>{m.txt}</Label>}
            <Label x={x0} y={y + 210} size="label" weight={900}>{m.t}</Label>
            {m.sub && <Label x={x0} y={y + 266} size="note" color={C.ink2}>{m.sub}</Label>}
          </g>
        );
      })}
    </g>
  );
};
export const S15a: React.FC = () => (
  <AbsoluteFill>
    <Heading>夫婦が知り合ったきっかけ</Heading>
    <SubHead>ここ5年ほどに結婚した、初婚どうしの夫婦</SubHead>
    <Svg><MeetBand n={1} /></Svg>
    <SourceNote text={SRC.ipss} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S15: React.FC = () => (
  <AbsoluteFill>
    <Heading>夫婦が知り合ったきっかけ</Heading>
    <SubHead>ここ5年ほどに結婚した、初婚どうしの夫婦</SubHead>
    <Svg><MeetBand /></Svg>
    <SourceNote text={SRC.ipss} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
/** 探しに行く出会い：4年前 約18% → いま 約28%（柱。0から） */
export const S16: React.FC = () => {
  const base = 700, k = 12;
  return (
    <AbsoluteFill>
      <Heading>探しに行く出会いは、4年で1割台から約28%に</Heading>
      <Svg>
        {[["2021年", 17.7, "1割台"], ["2025年", 27.9, "約28%"]].map(([t, v, s], i) => {
          const x = 300 + i * 360, h = (v as number) * k;
          return (
            <g key={t as string}>
              <rect data-qa="mark" data-qa-label={t as string} x={x} y={base - h} width={200} height={h} rx={R.sm} fill={C.ink2} />
              <Label x={x + 100} y={base - h - 24} anchor="middle" size="value">{s}</Label>
              <Label x={x + 100} y={base + 52} anchor="middle" size="label" weight={900}>{t}</Label>
            </g>
          );
        })}
        <line x1={260} y1={base} x2={1000} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
        <rect x={1160} y={300} width={640} height={300} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
        <Label x={1480} y={380} anchor="middle" size="label">それでも半分以上は</Label>
        <Label x={1480} y={450} anchor="middle" size="label" weight={900}>もともとの人間関係</Label>
        <Label x={1480} y={530} anchor="middle" size="value">約55%</Label>
      </Svg>
      <SourceNote text={SRC.ipss2} />
      <ChapterDots current={1} />
    </AbsoluteFill>
  );
};
/** くじの席：上から見た教室。6列×5段の席に新入生 */
const SEAT = { x0: 260, y0: 300, dx: 150, dy: 110, cols: 6, rows: 4 };
const Seats: React.FC<{ links?: boolean }> = ({ links }) => (
  <g>
    {links && <g>
      {[[0, 0], [2, 1], [4, 2], [1, 3], [3, 0]].map(([c, r]) => {
        const x = SEAT.x0 + c * SEAT.dx, y = SEAT.y0 + r * SEAT.dy;
        return <line key={`${c}${r}`} x1={x} y1={y - 30} x2={x + SEAT.dx} y2={y - 30} stroke={C.ink} strokeWidth={LINE.heavy} />;
      })}
      <path d={`M${SEAT.x0 + SEAT.dx},${SEAT.y0 - 30} Q${SEAT.x0 + 3 * SEAT.dx},${SEAT.y0 + 120} ${SEAT.x0 + 5 * SEAT.dx},${SEAT.y0 + 2 * SEAT.dy - 30}`}
        fill="none" stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="10 8" />
    </g>}
    {Array.from({ length: SEAT.cols * SEAT.rows }, (_, i) => {
      const c = i % SEAT.cols, r = Math.floor(i / SEAT.cols);
      const x = SEAT.x0 + c * SEAT.dx, y = SEAT.y0 + r * SEAT.dy;
      return <Cat key={i} kind="plain" x={x} y={y} size={1.5} pose="sit" face={links ? "smile" : "normal"} label={`学生${i}`} seed={i} />;
    })}
  </g>
);
export const S17: React.FC = () => (
  <AbsoluteFill>
    <Heading>入学した最初の日、席をくじで決めた</Heading>
    <SubHead>ドイツの大学の新入生</SubHead>
    <Svg>
      <Seats />
      <rect x={1380} y={360} width={260} height={200} rx={R.sm} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
      <rect x={1460} y={350} width={100} height={16} rx={6} fill={C.ink} />
      <Label x={1510} y={480} anchor="middle" size="label" weight={900}>くじ</Label>
    </Svg>
    <SourceNote text={SRC.seat} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
export const S18: React.FC = () => (
  <AbsoluteFill>
    <Heading>1年後：隣や同じ列だった2人ほど、親しい友人に</Heading>
    <Svg>
      <Seats links />
      <line x1={1300} y1={400} x2={1420} y2={400} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={1440} y={412} size="note">親しい友人（隣・同じ列）</Label>
      <line x1={1300} y1={480} x2={1420} y2={480} stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="10 8" />
      <Label x={1440} y={492} size="note" color={C.ink2}>離れた席どうし</Label>
    </Svg>
    <SourceNote text={SRC.seat} />
    <ChapterDots current={1} />
  </AbsoluteFill>
);
/** 小学校：隣の席 22.3% ／ 隣でない 15.3%（友だちになった割合。0から） */
export const S19: React.FC = () => {
  const base = 720, k = 18;
  return (
    <AbsoluteFill>
      <Heading>小学校でも、隣の席の子と友だちに</Heading>
      <SubHead>1学期のあとに友だちになっていた割合（友人の研究）</SubHead>
      <Svg>
        {[["隣の席", 22.3, C.ink], ["隣でない", 15.3, C.rest]].map(([t, v, c], i) => {
          const x = 520 + i * 480, h = (v as number) * k;
          return (
            <g key={t as string}>
              <rect data-qa="mark" data-qa-label={t as string} x={x} y={base - h} width={240} height={h} rx={R.sm} fill={c as string} />
              <Label x={x + 120} y={base - h - 24} anchor="middle" size="value">{`${v}%`}</Label>
              <Label x={x + 120} y={base + 52} anchor="middle" size="label" weight={900}>{t}</Label>
            </g>
          );
        })}
        <line x1={460} y1={base} x2={1300} y2={base} stroke={C.ink} strokeWidth={LINE.thin} />
      </Svg>
      <SourceNote text={SRC.school} />
      <ChapterDots current={1} />
    </AbsoluteFill>
  );
};
/** 大勢の中の、たった1人（群衆は紫の猫。1匹だけ墨の輪） */
export const S20: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      {Array.from({ length: 24 }, (_, i) => {
        const c = i % 8, r = Math.floor(i / 8);
        const x = 220 + c * 190 + (r % 2) * 60, y = 330 + r * 150;
        return <Cat key={i} kind="plain" x={x} y={y} size={2} pose="stand" face="normal" label={`同じ部署${i}`} seed={i} />;
      })}
      <circle cx={220 + 5 * 190 + 60} cy={480 - 50} r={80} fill="none" stroke={C.ink} strokeWidth={LINE.heavy} />
    </Svg>
    <Ask x={420} y={740} text="好きになるたった1人は、何で決まる？" />
    <ChapterDots current={1} />
  </AbsoluteFill>
);

// ================= 第2章：誰を好きになるのか =================
/** 3つの理由：好きになりやすさ（青緑）・好かれやすさ（金）・相性（赤） */
const Three: React.FC<{ y?: number; n?: number }> = ({ y = 300, n = 3 }) => (
  <g>
    {[
      { t: "好きになりやすさ", s: "誰にでも高い点を付ける", c: C.teal, tint: C.tealTint },
      { t: "好かれやすさ", s: "誰からも高い点をもらう", c: C.gold, tint: C.goldTint },
      { t: "相性", s: "その2人の組み合わせだけ", c: C.debt, tint: C.debtTint },
    ].map((d, i) => {
      const x = 120 + i * 580;
      if (i >= n) return <rect key={d.t} x={x} y={y} width={520} height={460} rx={R.lg} fill="none" stroke={C.rest} strokeWidth={LINE.thin} strokeDasharray="12 8" />;
      return (
        <g key={d.t}>
          <rect x={x} y={y} width={520} height={460} rx={R.lg} fill={d.tint} stroke={d.c} strokeWidth={i === 2 ? LINE.heavy : LINE.base} />
          <Label x={x + 260} y={y + 70} anchor="middle" size="label" weight={900}>{d.t}</Label>
          <Label x={x + 260} y={y + 420} anchor="middle" size="note">{d.s}</Label>
          {i === 0 && <g>
            <Cat kind="plain" x={x + 130} y={y + 330} size={2.2} pose="sit" face="happy" turn={0.6} label="付ける人" />
            {[0, 1, 2].map((k) => <Cat key={k} kind="plain" x={x + 300 + k * 70} y={y + 330 - (k % 2) * 90} size={1.3} pose="sit" label={`相手${k}`} seed={k} />)}
          </g>}
          {i === 1 && <g>
            <Cat kind="plain" x={x + 390} y={y + 330} size={2.2} pose="sit" face="smile" turn={-0.6} label="もらう人" seed={3} />
            {[0, 1, 2].map((k) => <Cat key={k} kind="plain" x={x + 90 + k * 70} y={y + 330 - (k % 2) * 90} size={1.3} pose="sit" label={`相手${k}`} seed={k + 4} />)}
          </g>}
          {i === 2 && <g>
            <Cat kind="plain" x={x + 170} y={y + 330} size={2.2} pose="sit" face="happy" turn={0.6} label="ひとり" seed={6} />
            <Cat kind="plain" x={x + 350} y={y + 330} size={2.2} pose="sit" face="smile" turn={-0.6} label="もうひとり" seed={7} />
            <path transform={`translate(${x + 260},${y + 150}) scale(1.6)`} d="M0 14 C-22 0 -18 -18 -6 -16 C-2 -15 0 -12 0 -10 C0 -12 2 -15 6 -16 C18 -18 22 0 0 14 Z" fill={C.debt} />
          </g>}
        </g>
      );
    })}
  </g>
);
export const S21: React.FC = () => (
  <AbsoluteFill>
    <Heading>「好き」の点数が高くなる理由を、3つに分ける</Heading>
    <Svg><Three y={220} n={2} /></Svg>
    <SourceNote text={SRC.joel} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S21b: React.FC = () => (
  <AbsoluteFill>
    <Heading>3つ目：その2人の組み合わせだけ＝「相性」</Heading>
    <Svg><Three y={220} /></Svg>
    <SourceNote text={SRC.joel} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
/** 「なぜか」の部分：友人の評判はいまひとつ、でも自分には特別 */
export const S22: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="office" floor={ROOM.floor} variant={1} />
    <Svg>
      <Cat kind="plain" x={300} y={ROOM.catY} size={3.2} pose="stand" face="normal" turn={0.5} label="友人1" seed={3} />
      <Cat kind="plain" x={540} y={ROOM.catY} size={3.2} pose="stand" face="think" turn={0.5} label="友人2" seed={5} />
      <Bubble x={140} y={240} text="ふつうの人じゃない？" tail={[420, 600]} />
      <Cat kind="plain" x={1200} y={ROOM.catY} size={3.8} pose="stand" face="happy" turn={0.5} look={[1, 0]} label="あなた" />
      <Cat kind="plain" x={1560} y={ROOM.catY} size={3.4} pose="stand" face="normal" turn={-0.5} label="その人" seed={8} />
      <path transform="translate(1380,500) scale(1.6)" d="M0 14 C-22 0 -18 -18 -6 -16 C-2 -15 0 -12 0 -10 C0 -12 2 -15 6 -16 C18 -18 22 0 0 14 Z" fill={C.debt} />
      <Label x={1380} y={420} anchor="middle" size="label" weight={900} color={C.debt}>なぜか</Label>
    </Svg>
    <ChapterDots current={2} />
  </AbsoluteFill>
);
/** 点数の高い低いの内訳（100%の帯。面積＝割合）。いちばん大きいのは相性 */
const PARTS = [
  { t: "好きになりやすさ", v: 13, c: C.teal, txt: "約13%" },
  { t: "好かれやすさ", v: 25, c: C.gold, txt: "約25%" },
  { t: "相性", v: 33, c: C.debt, txt: "約3分の1" },
  { t: "分からない部分", v: 29, c: C.rest, txt: "" },
];
const PartsBand: React.FC<{ y?: number }> = ({ y = 380 }) => {
  let x = 160;
  const W = 1600;
  return (
    <g>
      {PARTS.map((p, i) => {
        const ww = (W * p.v) / 100, x0 = x;
        x += ww;
        return (
          <g key={p.t}>
            <rect data-qa="mark" data-qa-label={p.t} x={x0} y={y} width={ww - 4} height={160} fill={p.c} />
            {p.txt && <Label x={x0 + ww / 2} y={y + 100} anchor="middle" size={i === 2 ? "value" : "label"} weight={900} color={C.white}>{p.txt}</Label>}
            <Label x={x0 + ww / 2} y={y + (i % 2 ? 280 : 220)} anchor="middle" size="note" weight={700}>{p.t}</Label>
          </g>
        );
      })}
      <path d={`M${160 + W * 0.38},${y - 20} v-20 H${160 + W * 0.71 - 4} v20`} fill="none" stroke={C.debt} strokeWidth={LINE.base} />
      <Label x={160 + W * 0.545} y={y - 60} anchor="middle" size="label" weight={900} color={C.debt}>いちばん大きい</Label>
    </g>
  );
};
export const S23: React.FC = () => (
  <AbsoluteFill>
    <Heading>「好き」の点数の高い低いを生んだもの</Heading>
    <Svg><PartsBand /></Svg>
    <SourceNote text="Joel ほか 2017。2つの標本の幅：好きになりやすさ12〜14%・好かれやすさ23〜26%・相性31〜36%・残り27〜32%（誤差を含む）" />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
/** 会う前の答えで、どれだけ言い当てられたか（針の目盛り。0〜100%）。帯＝2つの標本の幅 */
const Gauge: React.FC<{ x?: number; y: number; name: string; color: string; lo: number; hi: number; text: string; w?: number; strong?: boolean; ghost?: boolean }> = (
  { x = 640, y, name, color, lo, hi, text, w = 900, strong, ghost },
) => (
  <g opacity={ghost ? 0.35 : 1}>
    <Label x={x - 40} y={y + 42} anchor="end" size="label" weight={900}>{name}</Label>
    <rect x={x} y={y} width={w} height={60} rx={R.sm} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
    <rect data-qa="mark" data-qa-label={name} x={x + (w * lo) / 100} y={y} width={Math.max(8, (w * (hi - lo)) / 100)} height={60} rx={R.sm} fill={color} />
    <line x1={x + (w * hi) / 100} y1={y - 16} x2={x + (w * hi) / 100} y2={y + 76} stroke={C.ink2} strokeWidth={LINE.base} />
    <Label x={x + (w * hi) / 100 + 24} y={y + 44} size={strong ? "value" : "label"} weight={900} color={strong ? color : C.ink}>{text}</Label>
  </g>
);
const GaugeAxis: React.FC<{ x?: number; y: number; w?: number }> = ({ x = 640, y, w = 900 }) => (
  <g>
    {[0, 50, 100].map((v) => <Label key={v} x={x + (w * v) / 100} y={y} anchor="middle" size="note" color={C.ink2}>{`${v}%`}</Label>)}
  </g>
);
export const S24: React.FC = () => (
  <AbsoluteFill>
    <Heading>会う前の答えで、言い当てられたか</Heading>
    <Svg>
      <GaugeAxis y={280} />
      <Gauge y={330} name="好きになりやすさ" color={C.teal} lo={4} hi={18} text="4〜18%" />
      <Gauge y={470} name="好かれやすさ" color={C.gold} lo={7} hi={27} text="7〜27%" />
      <rect x={640} y={610} width={900} height={60} rx={R.sm} fill={C.white} stroke={C.debt} strokeWidth={LINE.heavy} strokeDasharray="14 10" />
      <Label x={600} y={652} anchor="end" size="label" weight={900}>相性</Label>
      <Label x={1090} y={654} anchor="middle" size="value" color={C.debt}>？</Label>
    </Svg>
    <SourceNote text={SRC.joel} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
export const S25: React.FC = () => (
  <AbsoluteFill>
    <Quiz question={QUIZ_Q} choices={QUIZ_C} answer={3} reveal gosaFoot={850} />
    <SourceNote prefix="" text="米国の大学生のスピードデート。別の年の参加者でも同じ（Joel ほか 2017）" />
  </AbsoluteFill>
);
export const S26: React.FC = () => (
  <AbsoluteFill>
    <Heading>相性は、ほぼゼロ</Heading>
    <SubHead>性格が似ているか・価値観が合うか・理想に近いか。質問には入っていた</SubHead>
    <Svg>
      <GaugeAxis y={300} />
      <Gauge y={350} name="好きになりやすさ" color={C.teal} lo={4} hi={18} text="4〜18%" ghost />
      <Gauge y={490} name="好かれやすさ" color={C.gold} lo={7} hi={27} text="7〜27%" ghost />
      <Gauge y={630} name="相性" color={C.debt} lo={0} hi={1} text="ほぼ0%" strong />
    </Svg>
    <SourceNote text="Joel ほか 2017。相性は −4.55〜1.34%（別の年の標本に当てはめると0.1%未満）" />
    <Gosa cues={[[-60, "assertive"]]} says={[[-60, "ひげ、短め。"]]} size="S" foot={850} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
/** 話した直後の印象を使うと、相性も多くて3割 */
export const S27: React.FC = () => (
  <AbsoluteFill>
    <Heading>話した直後の印象を使うと、相性も当たりはじめる</Heading>
    <Svg>
      <GaugeAxis y={330} />
      <Gauge y={380} name="会う前の答え" color={C.debt} lo={0} hi={1} text="ほぼ0%" ghost />
      <Gauge y={560} name="話した直後" color={C.debt} lo={16} hi={29} text="多くて3割" strong />
      <path d="M660,460 C700,520 760,540 800,550" fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeDasharray="12 8" />
    </Svg>
    <SourceNote text="Joel ほか 2017。会った直後の18〜20項目の答えを使うと16〜29%" />
    <ChapterDots current={2} />
  </AbsoluteFill>
);
/** 経済学者ベッカー：本と引用の札（似顔は描かない） */
export const S28: React.FC = () => (
  <AbsoluteFill>
    <Heading>経済学者ベッカーの結婚の理論</Heading>
    <Svg>
      <rect x={160} y={260} width={360} height={480} rx={R.sm} fill={C.ink2} />
      <rect x={190} y={290} width={300} height={420} rx={6} fill={C.paper2} />
      <Label x={340} y={420} anchor="middle" size="label" weight={900}>結婚の</Label>
      <Label x={340} y={480} anchor="middle" size="label" weight={900}>経済学</Label>
      <rect x={640} y={260} width={1120} height={180} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={680} y={330} size="note" color={C.ink2}>説明したこと</Label>
      <Label x={680} y={400} size="label" weight={900}>結婚＝2人とも得をする組み合わせ</Label>
      <rect x={640} y={480} width={1120} height={240} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={680} y={550} size="note" color={C.ink2}>踏み込まなかったこと</Label>
      <Label x={680} y={620} size="label" weight={900}>なぜ、ほかでもないその人を愛するのか</Label>
      <Label x={680} y={690} size="note">「自分が付け加えられることはない」</Label>
    </Svg>
    <SourceNote text={SRC.becker} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);

export const S28b: React.FC = () => (
  <AbsoluteFill>
    <Heading>会う前に手がかりがないなら、好きな理由はどこから？</Heading>
    <ThreeQ focus={2} />
    <ChapterDots current={2} />
  </AbsoluteFill>
);

// ================= 第3章：好きな理由はどこから来るのか =================
/** 写真の額2枚：恋人と友人（中は紫の猫の顔の影。比べ方を見せる） */
export const S29a: React.FC = () => (
  <AbsoluteFill>
    <Heading>好きな相手は、どう映っている？</Heading>
    <SubHead>恋人の写真と、友人の写真を見ているときの脳を比べる</SubHead>
    <Svg>
      {["恋人の写真", "友人の写真"].map((t, i) => {
        const x = 380 + i * 640;
        return (
          <g key={t}>
            <rect data-qa="prop" data-qa-label={t} x={x} y={260} width={480} height={460} rx={R.sm} fill={C.white} stroke={C.ink} strokeWidth={i ? LINE.thin : LINE.heavy} />
            <circle cx={x + 240} cy={480} r={110} fill={C.plain} opacity={0.75} />
            <path d={`M${x + 150},${430} l20,-90 l50,60 Z M${x + 330},${430} l-20,-90 l-50,60 Z`} fill={C.plain} opacity={0.75} />
            <Label x={x + 240} y={790} anchor="middle" size="label" weight={900}>{t}</Label>
          </g>
        );
      })}
    </Svg>
    <SourceNote text={SRC.brain} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** 脳（横から見た形）。ごほうびの回路は明るく、相手を採点する部分のいくつかは静か。部位の名前は出典の注にだけ */
export const S29: React.FC = () => (
  <AbsoluteFill>
    <Heading>恋人の写真を見ているときの脳</Heading>
    <Svg>
      <path data-qa="mark" data-qa-label="脳" d="M520,620 C380,620 320,500 360,410 C380,300 500,250 620,260 C700,200 860,210 940,280 C1060,290 1120,380 1100,470 C1110,560 1040,640 940,640 C900,700 800,720 740,680 C680,700 600,680 520,620 Z"
        fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
      <circle cx={760} cy={540} r={60} fill={C.ink} />
      <circle cx={760} cy={540} r={100} fill="none" stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="8 8" />
      <ellipse cx={520} cy={380} rx={90} ry={60} fill={C.rest} opacity={0.5} />
      <line x1={860} y1={540} x2={1220} y2={540} stroke={C.ink} strokeWidth={LINE.thin} />
      <Label x={1240} y={530} size="label" weight={900}>ごほうびの回路</Label>
      <Label x={1240} y={590} size="note" color={C.ink2}>活発になる</Label>
      <line x1={520} y1={320} x2={520} y2={240} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={1240} y={300} size="label" weight={900}>相手を採点する部分</Label>
      <Label x={1240} y={360} size="note" color={C.ink2}>いくつかが静かになる</Label>
      <path d="M520,240 H1220" stroke={C.ink2} strokeWidth={LINE.thin} />
    </Svg>
    <SourceNote text={SRC.brain} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** スタンダール『恋愛論』と「結晶作用」 */
export const S30: React.FC = () => (
  <AbsoluteFill>
    <Heading>200年前、スタンダールの「結晶作用」</Heading>
    <Svg>
      <rect x={300} y={260} width={380} height={500} rx={R.sm} fill={C.ink2} />
      <rect x={330} y={290} width={320} height={440} rx={6} fill={C.paper2} />
      <Label x={490} y={500} anchor="middle" size="value">恋愛論</Label>
      <Label x={490} y={580} anchor="middle" size="note">1822年</Label>
      <Branch x={1260} y={760} k={1.4} crystals={30} />
    </Svg>
    <SourceNote text={SRC.stendhal} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** 葉を落とした枝。crystals＝付いた塩の粒の数（白と紙色。意味の色と混ぜない） */
const TWIGS: [number, number, number, number][] = [
  [0, 0, 0, -220], [0, -80, -90, -170], [0, -120, 80, -200], [-90, -170, -140, -230], [-90, -170, -60, -260],
  [80, -200, 140, -260], [80, -200, 50, -280], [0, -220, -30, -300], [0, -220, 40, -310], [0, -40, 70, -90],
];
const Branch: React.FC<{ x: number; y: number; k?: number; crystals?: number }> = ({ x, y, k = 1, crystals = 0 }) => {
  const pts: [number, number][] = [];
  TWIGS.forEach(([a, b, c, d]) => { for (let t = 0.15; t <= 1; t += 0.17) pts.push([a + (c - a) * t, b + (d - b) * t]); });
  return (
    <g data-qa="mark" data-qa-label="枝" transform={`translate(${x},${y}) scale(${k})`}>
      {TWIGS.map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={C.ink2} strokeWidth={i === 0 ? 10 : 5} strokeLinecap="round" />)}
      {pts.slice(0, crystals).map(([px, py], i) => (
        <path key={i} transform={`translate(${px + ((i * 7) % 11) - 5},${py + ((i * 5) % 9) - 4}) rotate(${(i * 37) % 90})`} d="M0,-11 L8,0 L0,11 L-8,0 Z"
          fill={i % 3 ? C.white : C.paper2} stroke={C.ink} strokeWidth={2} />
      ))}
    </g>
  );
};
/** ザルツブルクの塩の坑道：奥へ、枝を1本投げ込む（暗い背景） */
export const S31: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Svg>
      <path d="M200,880 L760,520 L1160,520 L1720,880 Z" fill={C.ink2} />
      <path d="M760,520 L760,300 Q960,200 1160,300 L1160,520 Z" fill={C.ink} />
      <path d="M760,300 Q960,200 1160,300" fill="none" stroke={C.rest} strokeWidth={LINE.thin} />
      <Branch x={960} y={500} k={0.6} />
      <path d="M1300,300 C1180,320 1080,360 1020,420" fill="none" stroke={C.white} strokeWidth={LINE.thin} strokeDasharray="10 8" />
      <Label x={360} y={260} color={C.white} size="label" weight={900}>ザルツブルクの塩の坑道</Label>
      <Label x={360} y={320} color={C.paper2} size="note">冬に葉を落とした枝を1本、奥へ</Label>
    </Svg>
  </AbsoluteFill>
);
/** 2、3か月後：枝は先の先まで塩の粒に覆われ、もとの形が分からない */
export const S32: React.FC = () => (
  <AbsoluteFill>
    <Heading>2、3か月後に取り出すと</Heading>
    <Svg>
      <Branch x={520} y={760} k={1.6} />
      <Label x={520} y={830} anchor="middle" size="note" color={C.ink2}>投げ込んだとき</Label>
      <Branch x={1340} y={760} k={1.6} crystals={60} />
      <Label x={1340} y={830} anchor="middle" size="note" weight={700}>先の先まで、塩の粒</Label>
      <path d="M800,500 H1020" stroke={C.ink} strokeWidth={LINE.base} markerEnd="url(#ar2)" />
      <defs><marker id="ar2" markerWidth={10} markerHeight={10} refX={6} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.ink} /></marker></defs>
    </Svg>
    <SourceNote text={SRC.stendhal} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** 枝＝恋の相手、塩の粒＝見つけていく良い所（相手の猫のまわりに粒が増える） */
export const S33: React.FC = () => {
  const good = ["笑い方", "声", "字", "歩き方", "気づかい"];
  return (
    <AbsoluteFill>
      <Heading>枝は恋の相手、塩の粒は見つけていく良い所</Heading>
      <Svg>
        <Cat kind="plain" x={560} y={800} size={4} pose="sit" face="happy" turn={0.6} look={[1, -0.2]} label="恋する人" />
        <Cat kind="plain" x={1260} y={800} size={4} pose="sit" face="normal" turn={-0.4} label="相手" seed={6} />
        {good.map((g, i) => {
          const a = -Math.PI * (0.15 + i * 0.175), r = 330;
          const x = 1260 + Math.cos(a) * r, y = 560 + Math.sin(a) * r * 0.75;
          return (
            <g key={g}>
              <path transform={`translate(${x},${y - 46})`} d="M0,-18 L13,0 L0,18 L-13,0 Z" fill={C.white} stroke={C.ink} strokeWidth={2} />
              <Label x={x} y={y + 6} anchor="middle" size="note" weight={700}>{g}</Label>
            </g>
          );
        })}
        <Label x={560} y={420} anchor="middle" size="label">「いいな」から</Label>
      </Svg>
      <ChapterDots current={3} />
    </AbsoluteFill>
  );
};
/** フランクファート：矢印の向きが逆 */
export const S34: React.FC = () => (
  <AbsoluteFill>
    <Heading>哲学者フランクファート：愛するから、大切になる</Heading>
    <Svg>
      <defs><marker id="ar3" markerWidth={10} markerHeight={10} refX={6} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.ink} /></marker></defs>
      <rect x={260} y={280} width={420} height={120} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={470} y={358} anchor="middle" size="label" color={C.ink2}>大切だと思う</Label>
      <path d="M700,340 H1060" stroke={C.rest} strokeWidth={LINE.base} markerEnd="url(#ar3)" />
      <rect x={1100} y={280} width={420} height={120} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={1310} y={358} anchor="middle" size="label" color={C.ink2}>愛する</Label>
      <Label x={880} y={460} anchor="middle" size="note" color={C.ink2}>とは限らない</Label>
      <rect x={260} y={560} width={420} height={120} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={470} y={638} anchor="middle" size="label" weight={900}>愛する</Label>
      <path d="M700,620 H1060" stroke={C.ink} strokeWidth={LINE.heavy} markerEnd="url(#ar3)" />
      <rect x={1100} y={560} width={420} height={120} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.heavy} />
      <Label x={1310} y={638} anchor="middle" size="label" weight={900}>大切になる</Label>
    </Svg>
    <SourceNote text={SRC.frankfurt} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** 好みのものさし：上ほど条件が厳しい。好みの線（点線）と、できた恋人の位置（猫） */
const PrefRuler: React.FC<{ pref: number; partner: number; old?: number }> = ({ pref, partner, old }) => {
  const x = 700, top = 240, h = 520, yOf = (v: number) => top + h - (h * v) / 100;
  return (
    <g>
      <rect x={x} y={top} width={60} height={h} rx={R.sm} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      <Label x={x - 30} y={top + 30} anchor="end" size="note" color={C.ink2}>条件が厳しい</Label>
      <Label x={x - 30} y={top + h} anchor="end" size="note" color={C.ink2}>ゆるい</Label>
      {old !== undefined && <g>
        <line x1={x - 20} y1={yOf(old)} x2={x + 520} y2={yOf(old)} stroke={C.rest} strokeWidth={LINE.base} strokeDasharray="14 10" />
        <Label x={x + 540} y={yOf(old) + 12} size="note" color={C.ink2}>最初の好み</Label>
        <path d={`M${x + 380},${yOf(old) + 16} V${yOf(pref) - 24}`} stroke={C.ink} strokeWidth={LINE.heavy} markerEnd="url(#ar4)" />
      </g>}
      <defs><marker id="ar4" markerWidth={10} markerHeight={10} refX={6} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.ink} /></marker></defs>
      <line data-qa="mark" data-qa-label="好みの線" x1={x - 20} y1={yOf(pref)} x2={x + 520} y2={yOf(pref)} stroke={C.ink} strokeWidth={LINE.heavy} strokeDasharray="14 10" />
      <Label x={x + 540} y={yOf(pref) + 12} size="label" weight={900}>{old !== undefined ? "下げた好み" : "最初の好み"}</Label>
      <Cat kind="plain" x={x + 200} y={yOf(partner) + 60} size={2.2} pose="stand" face="smile" label="恋人" seed={6} />
    </g>
  );
};
export const S35: React.FC = () => (
  <AbsoluteFill>
    <Heading>好みは、まったくの的外れではない</Heading>
    <SubHead>ドイツの独身の大人763人を、5か月追いかけた</SubHead>
    <Svg><PrefRuler pref={68} partner={60} /></Svg>
    <SourceNote text={SRC.gerlach} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
export const S36: React.FC = () => (
  <AbsoluteFill>
    <Heading>恋人が届かないとき、動いたのは条件のほう</Heading>
    <Svg><PrefRuler old={78} pref={46} partner={40} /></Svg>
    <SourceNote text={SRC.gerlach} />
    <ChapterDots current={3} />
  </AbsoluteFill>
);
/** スピードデートを見直す：会う前（空の表）→ 話す → 理由が生まれる（粒が付きはじめる） */
export const S37: React.FC = () => (
  <AbsoluteFill>
    <Heading>好きな理由の多くは、会う前にはまだなかった？</Heading>
    <Svg>
      <defs><marker id="ar5" markerWidth={10} markerHeight={10} refX={6} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.ink} /></marker></defs>
      <rect x={140} y={280} width={420} height={420} rx={R.lg} fill={C.white} stroke={C.ink2} strokeWidth={LINE.thin} />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={190} y={340 + k * 60} width={320} height={14} rx={7} fill={C.rest} />)}
      <Label x={350} y={760} anchor="middle" size="label" weight={900}>会う前</Label>
      <path d="M600,490 H700" stroke={C.ink} strokeWidth={LINE.base} markerEnd="url(#ar5)" />
      <Cat kind="plain" x={830} y={640} size={2.4} pose="sit" face="happy" turn={0.6} label="ひとり" />
      <Cat kind="plain" x={1010} y={640} size={2.4} pose="sit" face="smile" turn={-0.6} label="もうひとり" seed={7} />
      <Label x={920} y={760} anchor="middle" size="label" weight={900}>話す</Label>
      <path d="M1110,490 H1210" stroke={C.ink} strokeWidth={LINE.base} markerEnd="url(#ar5)" />
      <Branch x={1500} y={680} k={1.1} crystals={22} />
      <Label x={1500} y={760} anchor="middle" size="label" weight={900}>理由が付きはじめる</Label>
    </Svg>
    <ChapterDots current={3} />
  </AbsoluteFill>
);

// ================= 結論 =================
export const S38: React.FC = () => (
  <AbsoluteFill>
    <Heading>100を超える質問でも、会う前には当てられなかった</Heading>
    <Svg>
      <CondPhone x={340} y={520} h={560} rows={8} />
      <GaugeAxis x={760} y={420} w={900} />
      <Gauge x={760} y={470} name="" color={C.debt} lo={0} hi={1} text="相性：ほぼ0%" strong />
    </Svg>
    <SourceNote text={SRC.joel} />
  </AbsoluteFill>
);
/** ミクロ：会う前に分かるのは「誰が好かれやすいか」まで。ケプラーの友人たちが見ていた列も、会う前に書ける条件 */
export const S39: React.FC = () => (
  <AbsoluteFill>
    <Heading>会う前に分かるのは、好かれやすさまで</Heading>
    <Svg>
      <KeplerTable mode="friends" x={140} y={200} />
      <rect x={140 + TB.nameW - 10} y={196} width={COLS.length * TB.col + 20} height={620} rx={R.lg} fill="none" stroke={C.gold} strokeWidth={LINE.heavy} />
      <Label x={1500} y={330} size="label" weight={900} color={C.gold}>会う前に</Label>
      <Label x={1500} y={390} size="label" weight={900} color={C.gold}>書き出せること</Label>
    </Svg>
  </AbsoluteFill>
);

// ================= 教訓 =================
export const S40: React.FC = () => <AbsoluteFill><Study face="normal" done /></AbsoluteFill>;
/** 5番目の女性と並ぶケプラー（後ろの壁に、身分・財産の丸が空のままの額） */
export const S41: React.FC = () => (
  <AbsoluteFill>
    <Backdrop kind="room" floor={ROOM.floor} variant={5} />
    <Svg>
      <Cat kind="plain" x={820} y={ROOM.catY} size={4.4} pose="stand" face="smile" turn={0.5} label="ケプラー" />
      <Cat kind="plain" x={1120} y={ROOM.catY} size={4.0} pose="stand" face="smile" turn={-0.5} label="5番目の女性" seed={6} />
      <path transform="translate(970,420) scale(1.6)" d="M0 14 C-22 0 -18 -18 -6 -16 C-2 -15 0 -12 0 -10 C0 -12 2 -15 6 -16 C18 -18 22 0 0 14 Z" fill={C.debt} />
    </Svg>
  </AbsoluteFill>
);
export const S42: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Branch x={960} y={780} k={1.9} crystals={18} />
      <Label x={960} y={860} anchor="middle" size="label" weight={900}>結晶は、好きになったあとから</Label>
    </Svg>
  </AbsoluteFill>
);
/** 締め：ケプラーの表。5番目の行の条件の丸が埋まり直す（書き換わったのは表のほう） */
export const S43: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <KeplerTable mode="rewrite" />
      <Label x={960} y={866} anchor="middle" size="label" weight={900}>書き換わっていたのは、表のほう</Label>
    </Svg>
  </AbsoluteFill>
);
export const S44: React.FC = () => <AbsoluteFill><SignOff /></AbsoluteFill>;

const P: Omit<Panel, "key">[] = [
  { title: "冒頭：夜、手紙を書くケプラー", C: S01, sec: 6.6, lines: "1613年の秋、ひとりの天文学者", move: "夜の窓から書斎へ引く。ろうそくの火がゆれる。ペンが動く。名札（天文学者 ケプラー）は1.5秒" },
  { title: "冒頭：円ではなく、楕円", C: S02, sec: 8.0, lines: "ヨハネス・ケプラー。", move: "点線の円の上を火星が回りはじめ、通り道が実線の楕円に描き直される" },
  { title: "冒頭：2年前に妻を亡くす", C: S03, sec: 11.7, lines: "手紙を書く2年前に", move: "昼の同じ部屋。猫が窓の方を向いて座る。「1611年」が出る" },
  { title: "候補は11人、約2年", C: S04, sec: 15.7, lines: "候補に挙がった女性は", move: "額が左から1枚ずつかかる（11枚）。「約2年」の札。比べる材料が1つずつ出る" },
  { title: "ケプラーの表（5番目に心）", C: S05, sec: 13.2, lines: "この11人を、条件ごとに", move: "額が縮んで表の行に並び直す。列ごとに丸が付く → 最後の列「心」に赤い印が5番目だけ。5番目の行に墨の枠" },
  { title: "友人たちの説得", C: S06, sec: 11.8, lines: "心配した友人たちは", move: "友人2匹が寄ってくる。吹き出し。ケプラーが困った顔でうなずく" },
  { title: "4番目に断られ、5番目と結婚", C: S07, sec: 5.1, lines: "最後に彼が結婚したのは", move: "表に戻る。4番目の行に線が引かれ「断られた」。間のあと、5番目の行の枠が太くなる" },
  { title: "400年後：スマートフォンの条件", C: S08, sec: 10.0, lines: "400年がたち、ケプラーの", move: "表の行がスマホの画面の行に縮む（同じ並び）。条件の札が3つ出る" },
  { title: "問い：表をどれだけ細かくすれば", C: S09, sec: 16.2, lines: "条件のそろった相手に", move: "左の枠（心が動かない）→ 右の枠（なぜか好き）。問いの札" },
  { title: "予想の前に：スピードデート", C: S10, sec: 25.9, lines: "この問いを、実際に確かめた", move: "4組が向かい合う。砂時計が返るたびに右の猫が1つ横へずれる（相手を替える）" },
  { title: "会う前の答え → 点数の予想", C: S11, sec: 13.3, lines: "研究者は、会う前の答えを", move: "質問の紙の束 → コンピューター → 右の札。「誰にでも高い点」が灰色に沈み、赤の札「この相手にだけ」が出る" },
  { title: "予想タイム（4択）", C: S12, sec: 24.9, lines: "予想してみてください。", move: "共通の予想タイム。A と D には説明の小さな札。3秒の輪。答えは中ほどで" },
  { title: "3つの問い", C: S13, sec: 18.4, lines: "今日は、3つの問いを", move: "3枚の札が左から並ぶ（出会いの帯・3つの円・結晶の枝）。1枚目が拡大して第1章の扉へ" },
  { title: "第1章：初めて会った場所は？", C: S14, sec: 9.2, lines: "いま、好きになった人を", move: "第1章の扉 → 猫が上を見る。考えの吹き出し" },
  { title: "知り合ったきっかけ：もともとの人間関係", C: S15a, sec: 20.9, lines: "国の調査では", move: "100%の帯の枠（点線）が出て、左から「もともとの人間関係」が伸びる。「約55%」" },
  { title: "知り合ったきっかけ：探しに行った出会い", C: S15, sec: 14.0, lines: "もう1つは、マッチングアプリ", move: "帯の残りが「約28%」と「それ以外」に分かれる" },
  { title: "探しに行く出会い：4年で増えた", C: S16, sec: 22.5, lines: "探しに行く出会いは", move: "2021年の柱 → 2025年の柱が伸びる。右の札「それでも半分以上は」" },
  { title: "くじの席", C: S17, sec: 16.4, lines: "その「たまたま」が", move: "くじの箱から番号が出て、学生（紫の猫）が1匹ずつ席に座る" },
  { title: "1年後の友だちの線", C: S18, sec: 11.0, lines: "1年後、隣や同じ列", move: "隣・同じ列の2人を太い線が結ぶ（5本）。離れた席の点線は1本だけ" },
  { title: "小学校：隣の席", C: S19, sec: 17.4, lines: "ここまでは、恋人ではなく", move: "「友人の話」の札 → 2本の柱が伸びる" },
  { title: "たった1人", C: S20, sec: 13.8, lines: "ただ、同じ部署や同じ教室", move: "大勢の猫が並ぶ → 1匹にだけ墨の輪。問いの札" },
  { title: "第2章：3つに分ける", C: S21, sec: 25.6, lines: "さきほど予想してもらった", move: "第2章の扉 → 青緑の枠 → 金の枠が出る。3つ目は点線の枠のまま" },
  { title: "3つ目：相性", C: S21b, sec: 13.2, lines: "3つ目は、その2人の組み合わせ", move: "赤の枠が太く出て、2匹の間にハート" },
  { title: "相性＝「なぜか」", C: S22, sec: 9.5, lines: "友人の評判はいまひとつ", move: "友人の吹き出し → 「あなた」がその人を見る。赤い「なぜか」" },
  { title: "内訳：相性が約3分の1", C: S23, sec: 13.7, lines: "点数の高い低いを", move: "100%の帯が4つに分かれる。赤の区画が少し大きくなり、括弧「いちばん大きい」" },
  { title: "先回り：好かれやすさは当たる", C: S24, sec: 16.9, lines: "ただ、相性といっても", move: "針の目盛りが3本。青緑・金の帯が伸びる。赤の行は点線の「？」のまま" },
  { title: "予想の答え：D（ほぼゼロ）", C: S25, sec: 3.1, lines: "予想の答えは、Dの", move: "予想の4択に戻り、D を塗る。ゴサ「ひげ、短め。」" },
  { title: "相性はほぼゼロ", C: S26, sec: 20.4, lines: "100を超える質問に答えて", move: "目盛りに戻る。青緑・金が薄くなり、赤の帯は0の所で止まる（伸びかけて戻る）" },
  { title: "話した直後：多くて3割", C: S27, sec: 18.4, lines: "ところが、話した直後に", move: "会う前の行が薄くなり、下の行で赤い帯が0から3割手前まで伸びる" },
  { title: "ベッカー：踏み込まなかったこと", C: S28, sec: 23.0, lines: "なぜ好きになるのかには", move: "本が開く。上の札 → 下の札（太い枠）" },
  { title: "章の終わり：好きな理由はどこから？", C: S28b, sec: 9.6, lines: "会う前の答えに手がかりがない", move: "冒頭の3つの問いの札に戻り、3枚目だけ太い枠で残る → 第3章の扉へ" },
  { title: "第3章：恋人の写真と友人の写真", C: S29a, sec: 14.3, lines: "まず、好きになった相手が", move: "第3章の扉 → 写真の額が2枚かかる。左（恋人）の枠が太くなる" },
  { title: "脳：ごほうびの回路と採点する部分", C: S29, sec: 21.7, lines: "恋人の写真では、ごほうび", move: "写真の額が脳の形に変わる。ごほうびの回路が明るく脈打つ → 採点する部分が灰に沈む。断りは出典の注で" },
  { title: "スタンダールの結晶作用", C: S30, sec: 12.4, lines: "好きな人が特別に見えて", move: "本が置かれ、右に結晶の付いた枝。「結晶作用」の札" },
  { title: "塩の坑道", C: S31, sec: 12.3, lines: "名前の由来は", move: "坑道の奥へ寄る。枝が放物線で奥へ落ちる" },
  { title: "2、3か月後の枝", C: S32, sec: 9.1, lines: "2、3か月たって", move: "枝が取り出され、粒が根元から先へ付いていく（右）。左は投げ込んだときの枝" },
  { title: "枝は恋の相手", C: S33, sec: 16.4, lines: "スタンダールは、この枝を", move: "「いいな」の札 → 相手のまわりに粒（良い所）が1つずつ増える" },
  { title: "フランクファート", C: S34, sec: 15.1, lines: "アメリカの哲学者", move: "上の矢印（灰）→「とは限らない」→ 下の矢印が逆向きに太く引かれる" },
  { title: "好みは的外れではない", C: S35, sec: 22.1, lines: "会う前に持っていた好みは", move: "ものさしと好みの線。恋人の猫が線の少し下に立つ" },
  { title: "発見：動いたのは条件のほう", C: S36, sec: 17.0, lines: "ところが、この研究には", move: "恋人の猫が線より下に立つ → 好みの線が下へ降りて恋人の上で止まる（墨の太い矢印）" },
  { title: "スピードデートを見直す", C: S37, sec: 13.4, lines: "こう考えると", move: "会う前の紙 → 話す2匹 → 枝に粒が付きはじめる" },
  { title: "結論：会う前には当てられない", C: S38, sec: 15.8, lines: "最初の問いに戻ります", move: "条件の画面の行が8つまで増える。右の目盛りの赤い帯は0のまま" },
  { title: "ミクロ：会う前に分かるのは", C: S39, sec: 13.6, lines: "研究で言えば", move: "ケプラーの表に戻る。条件の列を金の枠で囲む（会う前に書き出せること）" },
  { title: "教訓：手紙を書き終える", C: S40, sec: 4.6, lines: "1613年の秋、ケプラーは", move: "冒頭の書斎。ペンが止まり、手紙に封の赤い印" },
  { title: "5番目の女性を選んだ", C: S41, sec: 9.5, lines: "5番目の女性は", move: "2匹が並ぶ。間にハート" },
  { title: "結晶は、好きになったあとから", C: S42, sec: 3.8, lines: "結晶は、好きになった", move: "裸の枝に粒が付きはじめる（途中で止まる）" },
  { title: "締め：書き換わっていたのは表のほう", C: S43, sec: 13.0, lines: "条件の表に届かない人を", move: "ケプラーの表。5番目の行の空の丸が、1つずつ灰に埋まり直す。4番目の線はそのまま" },
  { title: "締めのひと言（毎回同じ）", C: S44, sec: 5, lines: "数えてみると、景色が変わりました。", move: "共通のアニメーション（SignOff）。字幕なし" },
];
export const panels: Panel[] = P.map((p, i) => ({ key: String(i + 1).padStart(2, "0"), ...p }));
export const storyboard: StoryboardDef = { id: "008-falling-in-love", title: "人を好きになるって、どういうこと？（絵コンテ 第1版）", panels };
export default storyboard;
