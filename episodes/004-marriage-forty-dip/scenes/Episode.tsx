// 4本目「40代、夫婦の満足は二本に分かれる」の動画（台本 script.md 第5稿・改、絵コンテ 第2版 Storyboard.tsx の63場面）。
// 場面の絵と配置の道具は Storyboard.tsx から読み（同じ絵を二度書かない）、ここでは「いつ・どう動くか」だけを書く。
// 台本の場面（timing.json の8つ）の中を、読み上げの語（useCue().find）で区切り（Beat）、絵コンテの場面を順に出す。
// 絵コンテの番号（S01〜S63）をコメントに書いた。動きは絵コンテの move どおり。部品は render/src/lib（Motion.tsx の Beat・Enter・Wipe・ramp）。
// 章の扉（ch1-card など）と終了画面（end）は台本にないので、ここで場面の並びに差し込む（台本は変えない）。
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Balance, LooseWeight, tiltOf } from "@lib/Balance";
import { Bracket } from "@lib/Bracket";
import { Camera, Shot } from "@lib/Camera";
import { CAR, Navi } from "@lib/Car";
import { ChannelTag, MidCheck, TodayCard } from "@lib/Cards";
import { Cat } from "@lib/Cat";
import { CHAPTER_FRAMES, ChapterCard, ChapterDots } from "@lib/Chapter";
import { couples, CouplePairs, PeopleRows } from "@lib/CouplePairs";
import type { EpisodeDef, SceneDef } from "@lib/Episode";
import { EndScreen, END_FRAMES } from "@lib/EndScreen";
import { Figure } from "@lib/Figure";
import { GenderLines } from "@lib/GenderLines";
import { Gosa } from "@lib/Gosa";
import { Beat, Enter, EnterG, ramp, useCue, Wipe } from "@lib/Motion";
import { fromTiming, Timing } from "@lib/Narration";
import { Clock } from "@lib/Props";
import { Quiz } from "@lib/Quiz";
import { SignOff } from "@lib/SignOff";
import { SimBackground } from "@lib/SimBackground";
import { SourceNote } from "@lib/SourceNote";
import { Bubble, Thought } from "@lib/StoryAnim";
import { Verdict } from "@lib/Verdict";
import { Note } from "@lib/Labels";
import { PercentColumns } from "@lib/PercentColumns";
import { C, font, FPS, LINE, R, sp } from "@lib/theme";
import timing from "../timing.json";
import {
  AGE_TICKS, AGE_XS, ANSWERS, AxisTitle, BAL, BalanceAt, Card, CarScene, CH, Chip, chores, Coin, Heading, Label, LegendHW,
  MEAN, MEAN_FRAME, MiniBalance, RowsLabel, S13, S16, S18, S21, S23, S26, S27, S28, S29, S31, S33, S35, S37, S43, S44,
  S47, S49, S50, S52, S55, S57, SAT_WIFE, satSeries, SRC, Stopwatch, SubHead, SUP_HUSBAND, SUP_WIFE, SUPPORTS, Svg, Table3, TwoTags,
  veiled, work, BenchCats, NSFJ_WIFE,
} from "./Storyboard";
import { Briefcase, House } from "@lib/Icons";

/** ゴサの足元：字幕の帯から離す（既定の 880 だと、長い字幕の帯に近すぎる） */
const GF = 850;
/** S52 の「家を出た」の柱の真ん中（PercentColumns x140・幅1500・5本） */
const COL52_X = 140 + 300 * 4 + 150;
/** 長く同じ絵が続く所は、カメラをゆっくり寄せて止まって見せない（1.00→1.04倍） */
const Drift: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => <Camera drift={len}>{children}</Camera>;

// ================= 冒頭の物語（S01〜S07） =================
const WIDE: Shot = { x: 960, y: 540, scale: 1 };
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { find, end } = useCue();
  const red = find("信号が赤", 52), hus = find("ハンドルを握った", 282), say = find("来週は", 402), wife = find("助手席の妻", 527);
  const un = find("「うん」", 600), navi = find("カーナビが", 670), dual = find("共働きで15年", 800), fight = find("けんかを", 928);
  const think = find("彼は、うちは", 1016), green = find("信号が、青", 1149), nat = find("全国で聞くと", 1219);
  const thirty = find("30歳前後", 1324), mid = find("それが40代の半ば", 1411), also = find("もちろん", 1561), q = find("同じ年ごろの夫", 1695);
  const signal = frame < red ? "green" : frame < green ? "red" : "green";
  return (
    <>
      {/* S01〜S05：車（夕方の空から寄る → 夫 → 妻 → カーナビ → 引き → 青で少し前へ） */}
      <Beat from={0} to={nat}>
        <Camera dur={36} keys={[[0, { x: 960, y: 330, scale: 1.35 }], [12, WIDE], [hus, { x: 690, y: 440, scale: 1.7 }],
          [wife, { x: 1150, y: 440, scale: 1.7 }], [navi, { x: 920, y: 560, scale: 1.3 }], [fight, WIDE], [green, { x: 960, y: 520, scale: 1.04 }]]}>
          <CarScene signal={signal} names={frame > 30 && frame < 75}>
            <Thought x={430} y={240} text="うちはうまくいっている" toward={[650, 412]} start={think} />
          </CarScene>
        </Camera>
        <Beat from={0} to={hus}><Enter at={8}><Chip x={96} y={56}>土曜の夕方</Chip></Enter></Beat>
        <Beat from={say} to={wife}><Svg><Bubble x={600} y={340} w={800} text="来週は、水曜の帰りが遅い。金曜は出張" tail={[905, 490]} role="label" /></Svg></Beat>
        <Beat from={un} to={navi}><Svg><Bubble x={1150} y={350} text="うん" tail={[1110, 498]} role="label" /></Svg></Beat>
        <Beat from={navi + 20} to={fight}>
          <Enter><Svg><Navi x={96} y={300} w={480} lines={["到着まで", "あと20分"]} from={{ x: 960, y: 596 }} /></Svg></Enter>
          <Beat from={dual - navi - 20} to={9999}><Enter><Chip x={96} y={56}>共働き 15年</Chip></Enter></Beat>
        </Beat>
      </Beat>
      {/* S06：100人の妻が2列。上で7人、間を置いて下で23人が点く */}
      <Beat from={nat} to={also}>
        <Crowd06 top={thirty - nat} bottom={mid - nat} />
      </Beat>
      {/* S07：では、夫は？（下の列が夫の色の点線の枠と「？」に） */}
      <Beat from={also} to={end + 30}>
        <Heading>では、同じ年ごろの夫は？</Heading>
        <Svg>
          <RowsLabel y={380} top="40代半ばの妻" bottom="100人" />
          <PeopleRows x={380} y={290} kind="female" on={23} dy={68} />
          <Label x={1500} y={380}>満足していない</Label>
          <Label x={1500} y={440} color={C.female} weight={900}>23人</Label>
          <EnterG at={20}><Label x={1500} y={510} color={C.ink2}>満足 77人</Label></EnterG>
          <EnterG at={q - also}>
            <RowsLabel y={670} top="40代半ばの夫" bottom="100人" color={C.male} />
            <rect x={360} y={530} width={1120} height={280} rx={R.lg} fill="none" stroke={C.male} strokeWidth={LINE.thin} strokeDasharray="16 12" />
            <Label x={920} y={740} anchor="middle" size="hero" color={C.male}>？</Label>
          </EnterG>
        </Svg>
        <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
      </Beat>
      <ChannelTag start={90} />
    </>
  );
};
/** S06：上の列の7人が1人ずつ濃くなり、下の列の23人があとから点く。数字は値の文字だけ数え上げる */
const Crowd06: React.FC<{ top: number; bottom: number }> = ({ top, bottom }) => {
  const frame = useCurrentFrame();
  const a = Math.round(7 * ramp(frame, top, 40)), b = Math.round(23 * ramp(frame, bottom, 50));
  return (
    <>
      <Heading>夫婦の関係に満足していない妻</Heading>
      <Svg>
        <EnterG><RowsLabel y={380} top="30歳前後の妻" bottom="100人" /><PeopleRows x={380} y={290} kind="female" on={a} dy={68} /></EnterG>
        {frame >= top && <><Label x={1500} y={400} size="value" color={C.female}>{(6.5 * a / 7).toFixed(1)}%</Label><Label x={1500} y={462}>15人に1人</Label></>}
        <EnterG at={top + 45}><RowsLabel y={670} top="40代半ばの妻" bottom="100人" /><PeopleRows x={380} y={580} kind="female" on={b} dy={68} /></EnterG>
        {frame >= bottom && <><Label x={1500} y={690} size="value" color={C.female}>{(23.1 * b / 23).toFixed(1)}%</Label><Label x={1500} y={752}>4人に1人近く</Label></>}
      </Svg>
      <SourceNote text={`${SRC.nfrj}（28〜32歳・43〜47歳）`} />
    </>
  );
};

// ================= 今日の答え合わせ（S08） =================
const Today: React.FC = () => (
  <>
    <TodayCard claim="夫婦は、二人いっしょに冷めていく" start={4} />
    <Gosa cues={[[20, "thinking"]]} size="M" foot={GF} />
  </>
);

// ================= 予想タイム（S09〜S11） =================
const QuizScene: React.FC = () => {
  const { find, endOf, end } = useCue();
  const cond = find("家事や育児", 244), sum = find("その一日の合計", 369), A = find("Aは", 563), B = find("Bは", 650), Cc = find("Cは", 702);
  const D = find("Dは", 790), dEnd = endOf("Dは", 863), order = find("今日見ていくのは", 1005);
  const first = find("まず、夫と妻", 1093), second = find("次に", 1203), last = find("最後に", 1364);
  return (
    <>
      {/* S09：猫が立ち、同じ形の点線の札（量は表さない）、真ん中に「足すと？」 */}
      <Beat from={0} to={A}>
        <Heading w={1728}>予想タイム：共働き、末っ子が高学年〜中学生</Heading>
        <Svg>
          <EnterG at={10}>
            <Cat kind="male" x={480} y={820} size={4} look={[0, -0.8]} label="夫" />
            <Cat kind="female" x={1440} y={820} size={4} look={[0, -0.8]} label="妻" seed={2} />
            <Label x={600} y={800} color={C.male} weight={900}>夫</Label>
            <Label x={1320} y={800} anchor="end" color={C.female} weight={900}>妻</Label>
          </EnterG>
          <EnterG at={cond}><TwoTags x={480} /></EnterG>
          <EnterG at={cond + 12}><TwoTags x={1440} /></EnterG>
          <EnterG at={sum}><Label x={960} y={700} anchor="middle" size="value">足すと？</Label></EnterG>
        </Svg>
      </Beat>
      {/* S10：選択肢は読み上げに合わせて1つずつ、Dを読み終えてから3秒の輪 */}
      <Beat from={A} to={order}>
        <Quiz question="家事・育児＋仕事・通勤、長いのは？" choices={["夫が1時間以上", "ほぼ同じ", "妻が1時間以上", "妻が3時間以上"]}
          choiceAt={[0, B - A, Cc - A, D - A]} ringAt={dEnd - A} gosaFoot={GF} />
        <SourceNote prefix="" text="共働き・末っ子が10〜14歳の夫婦（答えは最後の答え合わせで）" />
      </Beat>
      {/* S11：今日の順番（3枚が左から） */}
      <Beat from={order} to={end + 30}>
        <Order11 at={[first - order, second - order, last - order]} />
      </Beat>
    </>
  );
};
const Order11: React.FC<{ at: number[] }> = ({ at }) => {
  const cards: [string, string, React.ReactNode][] = [
    ["1", "夫と妻の満足を年齢ごとに", <g key="a"><polyline points="-110,-40 -40,-44 30,-30 110,-32" fill="none" stroke={C.male} strokeWidth={10} strokeLinecap="round" /><polyline points="-110,-40 -40,-10 30,20 110,24" fill="none" stroke={C.female} strokeWidth={10} strokeLinecap="round" /></g>],
    ["2", "妻の満足が下がる時期", <g key="b">{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={-130 + i * 54} y={-70} width={40} height={140} fill={C.female} /><rect x={-130 + i * 54} y={-70 + (i < 3 ? 20 : 40)} width={40} height={140 - (i < 3 ? 20 : 40)} fill={C.femaleTint} /></g>)}</g>],
    ["3", "二人の一日を天秤に", <MiniBalance key="c" x={0} y={-30} s={0.26} />],
  ];
  return (
    <>
      <Heading>今日の順番</Heading>
      <Svg>
        {cards.map(([n, t, icon], i) => {
          const x = 120 + i * 580;
          return (
            <EnterG key={n} at={at[i]} dx={-30} dy={0}>
              <rect x={x} y={250} width={520} height={520} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 40} y={330} size="value">{`第${n}章`}</Label>
              <g transform={`translate(${x + 260},${500})`}>{icon}</g>
              <Label x={x + 260} y={710} anchor="middle">{t}</Label>
            </EnterG>
          );
        })}
      </Svg>
    </>
  );
};

// ================= 第1章（S12〜S23） =================
const Ch1: React.FC = () => {
  const { find, end } = useCue();
  const four = find("かなり満足、どちらか", 299), sat = find("かなり満足、", 369), dis = find("どちらかといえば不満", 466), two = find("このうち前の2つ", 572);
  const line = find("ここでは満足度と呼んで", 660), but = find("ところが30代", 1107), forty = find("40代の半ばでは", 1254);
  const you = find("30代の後半から40代なら", 1521), other = find("妻だけに聞いた", 1873);
  const still = find("上の年代になっても", 2471);
  const home = find("1つの家の中では", 2645), w23 = find("満足していない妻は23人", 2885), h13 = find("満足していない夫は13人", 2971), diff = find("10人多い", 3055);
  const pair = find("満足していない夫13人が", 3138), rest = find("それでも、満足していない妻が", 3308), left = find("余った10人", 3423);
  const house = find("つまり少なくとも", 3543), chores_ = find("ここまで聞くと", 3989), wifeT = find("夫が家事をしない", 4132), husT = find("あるいは夫の立場なら", 4242);
  const ch3 = find("その答えは、このあと天秤", 4408), when = find("その前に", 4500);
  return (
    <>
      {/* S12：答えの札4枚 → 括弧「満足として数える」と色の約束 */}
      <Beat from={0} to={line}>
        <Answers12 four={four} sat={sat} dis={dis} two={two} />
      </Beat>
      {/* S13：30歳前後は二本が重なる（夫は輪、妻は中の点） */}
      <Beat from={line} to={but}><Enter><S13 /></Enter></Beat>
      {/* S14：二本の線が左から伸び、35歳を過ぎて妻だけ下がる */}
      <Beat from={but} to={you}><Lines14 callAt={forty - but} /></Beat>
      {/* S15：35〜45歳の帯。「あなた」の目印が帯の中を1往復 */}
      <Beat from={you} to={other}><You15 /></Beat>
      {/* S16：別の調査の灰の輪 */}
      <Beat from={other} to={still}><Enter dy={0}><S16 /></Enter></Beat>
      {/* S18：上の年代も妻は4人に3人のまま */}
      <Beat from={still} to={home}><Enter><S18 /></Enter></Beat>
      {/* S19：百組の妻と夫。濃くなる → 差10人の括弧 */}
      <Beat from={home} to={pair}><Hundred19 w={w23 - home} h={h13 - home} d={diff - home} /></Beat>
      {/* S20：組にすると10組あまる（シミュレーション） */}
      <Beat from={pair} to={house}><Pairs20 rest={rest - pair} mark={left - pair} /></Beat>
      {/* S21：十組に一組の家 */}
      <Beat from={house} to={chores_}><Enter dy={0}><S21 /></Enter></Beat>
      {/* S22：同じ大きさの考え中の吹き出しが1つずつ */}
      <Beat from={chores_} to={ch3}><Think22 wife={wifeT - chores_} hus={husT - chores_} /></Beat>
      {/* S23：末っ子の年齢の線が左から引かれる */}
      <Beat from={ch3} to={end + 30}><Wipe dur={45}><S23 /></Wipe><Beat from={when - ch3} to={9999}><Gosa cues={[[0, "thinking"]]} size="S" foot={GF} /></Beat></Beat>
    </>
  );
};
const Answers12: React.FC<{ four: number; sat: number; dis: number; two: number }> = ({ four, sat, dis, two }) => (
  <>
    <ChapterDots current={1} />
    <Heading>夫婦の関係全体に、満足していますか</Heading>
    <Svg>
      {ANSWERS.map((a, i) => {
        const x = 130 + i * 430, s = i < 2;
        return (
          <EnterG key={i} at={Math.min(four, 75) + i * 12}>
            <rect x={x} y={360} width={380} height={200} rx={R.md} fill={s ? C.white : C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />
            {a.split("\n").map((l, k) => <Label key={k} x={x + 190} y={424 + k * 58} anchor="middle">{l}</Label>)}
            <EnterG at={two - Math.min(four, 75) - i * 12 + 20}>
              <rect data-qa="mark" data-qa-label="色の見本" x={x + 110} y={514} width={80} height={26} fill={s ? C.maleTint : C.male} />
              <rect data-qa="mark" data-qa-label="色の見本" x={x + 190} y={514} width={80} height={26} fill={s ? C.femaleTint : C.female} />
            </EnterG>
          </EnterG>
        );
      })}
      {useCurrentFrame() >= two && <Bracket x1={130} x2={890} y={340} label="この2つを「満足」として数える" start={two} />}
      <EnterG at={two + 30}><Label x={130} y={630}>この回の色：淡い色＝満足、濃い色＝満足していない</Label></EnterG>
      <EnterG at={20}><Label x={130} y={720} color={C.ink2}>全国から無作為に選んだ28〜72歳、約3,000人（有効回答3,033人）</Label></EnterG>
    </Svg>
    <SourceNote text="日本家族社会学会『第4回 家族についての全国調査（NFRJ18）』2019年調査" />
  </>
);
const Lines14: React.FC<{ callAt: number }> = ({ callAt }) => {
  const frame = useCurrentFrame();
  const upTo = Math.max(1, Math.min(9, 1 + Math.floor(frame / 14))); // 区分の番号は 1（30歳）〜9（70歳）
  return (
    <>
      <ChapterDots current={1} />
      <Heading>三十代の後半から、妻の線が下がる</Heading>
      <Svg>
        <AxisTitle />
        <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} upTo={upTo} endLabels={upTo >= 9}
          callouts={frame >= callAt ? [{ s: 0, i: 3, text: "87.2%", dy: -6 }, { s: 1, i: 3, text: "76.9%", above: false }] : []} />
      </Svg>
      <SourceNote text={SRC.nfrj} />
    </>
  );
};
const You15: React.FC = () => {
  const frame = useCurrentFrame();
  const k = 2 + 2 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * ramp(frame, 20, 150))); // 35歳 → 45歳 → 35歳
  const mx = CH.x + 125 * k;
  return (
    <>
    <ChapterDots current={1} />
    <SourceNote text={SRC.nfrj} />
    <Camera dur={40} keys={[[0, WIDE], [1, { x: 960, y: 540, scale: 1.06 }]]}>
      <Heading>三十代後半〜四十代：線が離れていく年ごろ</Heading>
      <Svg>
        <AxisTitle />
        <GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} band={{ from: 2, to: 4, label: "線が離れていく年ごろ", labelAt: "bottom" }} />
        <path d={`M${mx} ${CH.y + 10} V${CH.y + 400}`} stroke={C.ink} strokeWidth={LINE.thin} strokeDasharray="10 10" />
        <Label x={mx} y={CH.y - 18} anchor="middle" weight={900}>あなた</Label>
      </Svg>
    </Camera>
    </>
  );
};
const Hundred19: React.FC<{ w: number; h: number; d: number }> = ({ w, h, d }) => {
  const frame = useCurrentFrame();
  const a = Math.round(23 * ramp(frame, w, 40)), b = Math.round(13 * ramp(frame, h, 30));
  return (
    <>
      <ChapterDots current={1} />
      <Heading>40代の夫婦を百組：満足していない人は</Heading>
      <Svg>
        <EnterG><RowsLabel y={370} top="妻 100人" bottom="40代半ば" color={C.female} /><PeopleRows x={380} y={280} kind="female" on={a} dy={68} /></EnterG>
        {frame >= w && <Label x={1500} y={390} size="value" color={C.female}>{a}人</Label>}
        <EnterG at={12}><RowsLabel y={670} top="夫 100人" bottom="40代半ば" color={C.male} /><PeopleRows x={380} y={580} kind="male" on={b} dy={68} /></EnterG>
        {frame >= h && <Label x={1500} y={690} size="value" color={C.male}>{b}人</Label>}
        <EnterG at={d}>
          <path d="M1660 370 h30 V670 h-30" fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
          <Label x={1710} y={500} weight={900}>差</Label>
          <Label x={1710} y={560} weight={900}>10人</Label>
        </EnterG>
      </Svg>
      <SourceNote text={`${SRC.nfrj}（43〜47歳。100−満足の割合）`} />
    </>
  );
};
const ALL = couples(100, 13, 10);
const Pairs20: React.FC<{ rest: number; mark: number }> = ({ rest, mark }) => {
  const frame = useCurrentFrame();
  const rowB = ALL.slice(13, 23).map((c) => ({ ...c, mark: frame >= mark }));
  return (
    <>
      <SimBackground />
      <ChapterDots current={1} />
      <Heading w={1728}>満足していない夫が全員、そういう妻と組んでも</Heading>
      <Svg>
        <EnterG at={10} dx={-40} dy={0}>
          <Label x={96} y={290}>二人とも満足していない</Label>
          <Label x={96} y={350} weight={900}>13組</Label>
          <CouplePairs x={600} y={340} items={ALL.slice(0, 13)} cols={13} gap={16} />
        </EnterG>
        <EnterG at={rest} dx={-40} dy={0}>
          <Label x={96} y={412} color={C.female}>妻だけ満足していない</Label>
          <Label x={96} y={472} color={C.female} weight={900}>10組</Label>
          <CouplePairs x={600} y={460} items={rowB} cols={13} gap={16} />
        </EnterG>
        <EnterG at={0}>
          <CouplePairs x={150} y={560} items={ALL.slice(23)} cols={20} size={1.15} gap={12} row={70} />
          <Label x={1530} y={750} color={C.ink2}>残りの77組は、</Label>
          <Label x={1530} y={810} color={C.ink2}>二人とも満足</Label>
        </EnterG>
      </Svg>
      <SourceNote sim prefix="条件：" text="満足していない夫が全員、満足していない妻と組むとき（NFRJ18 の割合から計算）" />
    </>
  );
};
const Think22: React.FC<{ wife: number; hus: number }> = ({ wife, hus }) => (
  <>
    <ChapterDots current={1} />
    <Heading>理由は、家事？</Heading>
    <Svg>
      <EnterG>
        <Cat kind="male" x={500} y={820} size={3.6} look={[0, -0.8]} label="夫の側" />
        <Cat kind="female" x={1420} y={820} size={3.6} look={[0, -0.8]} label="妻の側" seed={2} />
      </EnterG>
      <Thought x={1060} y={420} w={700} text={"夫が家事をしないから、\n妻だけが冷めていく？"} toward={[1420, 618]} start={wife} />
      <Thought x={160} y={420} w={700} text={"こちらは外で\n働いている"} toward={[500, 618]} start={hus} />
    </Svg>
  </>
);

// ================= 第2章（S24〜S35） =================
const Ch2: React.FC = () => {
  const { find, end } = useCue();
  const why = find("なぜ、学校の時期", 1208);
  const care = find("小学校に上がると、育児", 1658), change = find("ただ、変わるのは長さより", 1975), only = find("その家事を夫が受け持つ", 2349);
  const alone = find("夫婦で一緒にやっていた", 2464), hypo = find("それが、学校の時期に妻", 3200);
  const car = find("冒頭の車の2人も", 3586), hus = find("夫のほうは、下がって", 3702), wifeDown = find("下がり方は妻のほう", 4263), abroad = find("海外には", 4539);
  const normal = find("ふつうの夫婦では", 4695), counsel = find("妻のほうがはっきり低く", 4856), sum = find("まとめると、冷めていく", 5270), what = find("次は、満足度が高い妻", 5611);
  return (
    <>
      {/* S25：100%の柱が立つ（答えを先に見せる。章の中のクイズはやめた 2026-10-07） */}
      <Beat from={0} to={why}>
        <Wipe dir="up" dur={40}><S25NoGhost /></Wipe>
      </Beat>
      {/* S26〜S28：一日の柱 */}
      <Beat from={why} to={care}><Wipe dir="up" dur={36}><S26 /></Wipe></Beat>
      <Beat from={care} to={change}><Enter dy={0}><S27 /></Enter></Beat>
      <Beat from={change} to={only}><Enter dy={0}><S28 /></Enter></Beat>
      {/* S29：左が先、1秒おいて右（一緒に → 一人で） */}
      <Beat from={only} to={hypo}><Half29 right={alone - only} /></Beat>
      {/* S31：仮説・冒頭の車が小さく戻る */}
      <Beat from={hypo} to={hus}><Hypo31 car={car - hypo} /></Beat>
      {/* S32：夫の線だけが先に描かれて下がる */}
      <Beat from={hus} to={wifeDown}><Mean32 /></Beat>
      {/* S33：妻の線が重なる・差ははっきりしない */}
      <Beat from={wifeDown} to={abroad}><Enter dy={0}><S33 /></Enter></Beat>
      {/* S34：海外のまとめ。左のカード → 右のカード */}
      <Beat from={abroad} to={sum}><Meta34 left={normal - abroad} right={counsel - abroad} /></Beat>
      {/* S35：ここまでの答え合わせ */}
      <Beat from={sum} to={end + 30}><Mid35 ask={what - sum} /></Beat>
    </>
  );
};
const COLS25 = [{ label: "0歳", value: 86.2, ghost: 89.5 }, { label: "1〜2歳", value: 83.5, ghost: 80.9 }, { label: "3〜5歳", value: 85.3, ghost: 82.0 },
  { label: "6〜11歳", value: 72.8, ghost: 75.4, big: true }, { label: "12〜17歳", value: 73.8, ghost: 76.9, big: true },
  { label: "18歳〜同居", value: 72.0, ghost: 78.1, sub: "家を出るまで続く", text: "72.0%" }];
/** S25：柱の値だけ（2018年の線は第7稿で声から外したので出さない） */
const S25NoGhost: React.FC = () => {
  return (
    <AbsoluteFill>
      <ChapterDots current={2} />
      <Heading>答えは B：学校に通う時期のほうが低い</Heading>
      <Svg>
        <PercentColumns x={130} y={240} width={1440} height={400} lower={C.femaleTint} upper={C.female} valuePos="inside" colW={200}
          cols={COLS25.map(({ ghost: _g, ...c }) => c)}
          groups={[{ from: 0, to: 2, label: "上がる前：8割台" }, { from: 3, to: 4, label: "小学生〜高校生：7割台前半" }]}
          upperName="満足でない" lowerName="満足" />
      </Svg>
      <SourceNote text="国立社会保障・人口問題研究所『全国家庭動向調査』第7回（2022）。妻が回答、集計表から計算" />
    </AbsoluteFill>
  );
};
/** S29：右の枠（小学生になると）は、左のあとに開く。それまでは紙色で伏せる */
const Half29: React.FC<{ right: number }> = ({ right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame < right ? 0 : sp("enter", frame - right, fps);
  return (
    <>
      <S29 />
      {t < 1 && <div style={{ position: "absolute", left: 975, top: 215, width: 830, height: 600, background: C.bg, opacity: 1 - t }} />}
    </>
  );
};
const Hypo31: React.FC<{ car: number }> = ({ car }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {frame < car ? (
        <Enter dy={0}>
          <ChapterDots current={2} />
          <Heading>いまの数字から考えられる仮説</Heading>
          <Chip x={96} y={300}>仮説</Chip>
          <Enter at={12}><S31Note /></Enter>
        </Enter>
      ) : <S31 />}
    </>
  );
};
const S31Note: React.FC = () => {
  return <Note x={96} y={360} role="label" question text={"子どもが学校に上がると、\n夫婦が一緒にやることが減り、\n妻が一人でやることが増える"} />;
};
const Mean32: React.FC = () => {
  const frame = useCurrentFrame();
  const upTo = Math.min(2, Math.floor(frame / 40));
  return (
    <>
      <ChapterDots current={2} />
      <Heading>満足の度合い（4点満点の平均）：夫も下がる</Heading>
      <Svg>
        <GenderLines {...MEAN_FRAME} series={[MEAN[0]]} upTo={upTo} callouts={upTo >= 1 ? [{ s: 0, i: 1, text: "−0.24", dy: -20 }] : []} />
        <EnterG at={120}>
          <Label x={1460} y={420} color={C.ink2}>底は、結婚して</Label>
          <Label x={1460} y={480} color={C.ink2}>20年を過ぎるころ</Label>
        </EnterG>
      </Svg>
      <SourceNote text="稲葉昭英（2021）NFRJ18 第2次報告書（初婚を続けている夫婦、2,137人）。図の線から読み取り。間の年数は省いている" />
    </>
  );
};
const Meta34: React.FC<{ left: number; right: number }> = ({ left, right }) => {
  const items = [["ふつうの夫婦", "＝", "夫と妻の差は、ほとんどない"], ["カウンセリングに通う夫婦", "＞", "妻のほうがはっきり低い"]];
  return (
    <>
      <ChapterDots current={2} />
      <Heading>海外：226の調査・約10万人をまとめると</Heading>
      <Svg>
        {/* 226の小さな四角が集まる（3秒） */}
        <Squares226 />
        {items.map(([t, sym, d], i) => {
          const x = 140 + i * 840;
          return (
            <EnterG key={i} at={i === 0 ? Math.min(left, 100) : right}>
              <rect x={x} y={240} width={780} height={500} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Label x={x + 390} y={320} anchor="middle" weight={900}>{t}</Label>
              <Figure kind="male" x={x + 230} y={560} size={3} dim />
              <Label x={x + 390} y={520} anchor="middle" size="hero">{sym}</Label>
              <Figure kind="female" x={x + 550} y={560} size={3} dim={i === 0} />
              <Label x={x + 230} y={620} anchor="middle" color={C.male}>夫</Label>
              <Label x={x + 550} y={620} anchor="middle" color={C.female}>妻</Label>
              <Label x={x + 390} y={700} anchor="middle">{d}</Label>
            </EnterG>
          );
        })}
      </Svg>
      <SourceNote text="Jackson, Miller, Oka, Henry（2014）Journal of Marriage and Family 76（要旨）。欧米が中心。淡い色＝満足、濃い色＝満足していない" />
    </>
  );
};
/** 226の小さな四角が散らばった所から左のカードの位置へ集まって消える（はじめの3秒） */
const Squares226: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 100) return null;
  const t = ramp(frame, 10, 70), o = 1 - ramp(frame, 80, 20);
  return (
    <g opacity={o}>
      {Array.from({ length: 226 }, (_, i) => {
        const sx = 140 + ((i * 97) % 1640), sy = 240 + ((i * 53) % 500);
        const tx = 530 + ((i % 15) - 7) * 14, ty = 490 + (Math.floor(i / 15) - 7) * 14;
        return <rect key={i} x={sx + (tx - sx) * t} y={sy + (ty - sy) * t} width={10} height={10} fill={C.rest} />;
      })}
    </g>
  );
};
const Mid35: React.FC<{ ask: number }> = ({ ask }) => (
  <>
    <ChapterDots current={2} />
    <MidCheck text="冷めるのは二人とも。不満は妻に多く出る" />
    <Svg><GenderLines {...CH} ticks={AGE_TICKS} series={satSeries} />
      <EnterG at={ask}><MiniBalance x={1500} y={470} s={0.16} /></EnterG></Svg>
    <Enter at={ask}><Card x={760} y={500} w={620}>妻の満足を下げているものは？<br />やはり、家事？</Card></Enter>
    <SourceNote text={SRC.nfrj} />
  </>
);

// ================= 第3章（S36〜S47） =================
const Ch3: React.FC = () => {
  const { find, end } = useCue();
  const husW = find("夫は、一日におよそ40分", 530), wifeW = find("妻は、4時間", 614), share = find("夫が受け持つ家事の割合は", 772);
  const ask = find("年齢ごとに比べた3000人の調査では", 1259), h83 = find("妻の家事に満足と答える夫", 1483), w66 = find("夫の家事に満足と答える妻", 1598), yahari = find("ここまでなら", 1723);
  const notYet = find("でも、この天秤には", 1829), husBag = find("夫の皿に、仕事のおもり", 2028), train = find("朝の電車", 2147), wifeBag = find("妻の皿にも", 2263);
  const moves = find("天秤が、ゆっくり", 2385), yours = find("天秤がどこで止まるか", 2473), split = find("満足している人と、していない人", 2695), cond = find("年齢や収入", 3025);
  const res = find("すると、夫が家事を多く", 3150), sup = find("はっきり差が出たのは", 3356), three = find("悩みを聞いてくれる、努力", 3512), why = find("なぜ家事の量より", 3802);
  const expect = find("期待どおりだったかどうか", 4314), work_ = find("とくに常勤で働く", 4492), abroad = find("海外の研究でも", 4850);
  const fit = find("話を聞いてほしいとき", 5328), back = find("心の支えを、3000人の調査", 5563), overlay = find("最初に見た、夫と妻の満足度", 6217);
  const order = find("ただし、どちらが先", 6305), bal = find("そろそろ、天秤が止まります", 6732);
  return (
    <>
      {/* S36：天秤。夫の家事の分銅（細い）が先、妻の分銅でドンと傾く */}
      <Beat from={0} to={share}><Scale36 hus={husW} wife={wifeW} /></Beat>
      {/* S37：夫が受け持つ家事の割合 */}
      <Beat from={share} to={ask}><Drift len={ask - share}><Wipe dir="up" dur={36}><S37 /></Wipe></Drift></Beat>
      {/* S38：相手の家事への満足（夫の柱 → 妻の柱 → 札） */}
      <Beat from={ask} to={notYet}><Sat38 h={h83 - ask} w={w66 - ask} c={yahari - ask} /></Beat>
      {/* S39〜S40：仕事の分銅（袋）。夫の皿 → 妻の皿 → ゆっくり動きはじめ、途中で止める */}
      <Beat from={notYet} to={split}><Bags39 hus={husBag - notYet} train={train - notYet} wife={wifeBag - notYet} moves={moves - notYet} yours={yours - notYet} /></Beat>
      {/* S41〜S42：満足と一緒に動くのは？（表） */}
      <Beat from={split} to={sup}><Table41 cond={cond - split} res={res - split} /></Beat>
      <Beat from={sup} to={why}><Support42 three={three - sup} /></Beat>
      {/* S43：期待との差（説明の図） */}
      <Beat from={why} to={work_}><Drift len={work_ - why}><Expect43 at={expect - why} /></Drift></Beat>
      {/* S44：働く妻では量の結びつきが消える */}
      <Beat from={work_} to={abroad}><Wipe dur={40}><S44 /></Wipe></Beat>
      {/* S45：支えは合っていたか（左 → 右） */}
      <Beat from={abroad} to={back}><Fit45 open={fit - abroad} /></Beat>
      {/* S46：悩みを聞いてくれる（同じ枠に第1章の妻の線を重ねる） */}
      <Beat from={back} to={order}><Listen46 overlay={overlay - back} /></Beat>
      {/* S47：どちらが先か → 最後に40の天秤（動いている途中）が戻る */}
      <Beat from={order} to={bal}><Drift len={bal - order}><Enter dy={0}><S47 /></Enter></Drift></Beat>
      <Beat from={bal} to={end + 30}>
        <Heading w={1728}>仕事のおもりをのせた天秤は、どこで止まる？</Heading>
        <Svg><BalanceAt left={[chores("husband"), veiled("husband")]} right={[chores("wife"), veiled("wife")]} tilt={4} from={10} moving /></Svg>
      </Beat>
    </>
  );
};
const Scale36: React.FC<{ hus: number; wife: number }> = ({ hus, wife }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const full = tiltOf(39, 263);
  const tilt = frame < hus ? 0 : frame < wife ? -1.2 * sp("enter", frame - hus, fps) : -1.2 + (full + 1.2) * sp("pop", frame - wife, fps);
  return (
    <>
      <ChapterDots current={3} />
      <Heading>天秤に、まず家事・育児・買い物</Heading>
      <Enter at={150}><SubHead>共働き・末っ子10〜14歳（冒頭の二人と同じ時期）</SubHead></Enter>
      <Wipe dir="up" dur={30}>
        <Svg>
          <Balance x={BAL.x} y={BAL.y} tilt={tilt} leftName="夫" rightName="妻" leftColor={C.male} rightColor={C.female}
              left={frame >= hus ? [chores("husband")] : []} right={frame >= wife ? [chores("wife")] : []} />
        </Svg>
      </Wipe>
      <SourceNote text={SRC.time} />
    </>
  );
};
const Sat38: React.FC<{ h: number; w: number; c: number }> = ({ h, w, c }) => {
  return (
    <>
      <ChapterDots current={3} />
      <Heading>相手の家事に満足している人（40代半ば）</Heading>
      <Svg>
        <EnterG at={Math.min(h, 60)}>
          <PercentColumns x={240} y={260} width={420} height={420} lower={C.maleTint} upper={C.male} colW={200} valuePos="inside"
            cols={[{ label: "夫 → 妻の家事", value: 83.0, big: true, sub: "8割を超える", text: "83.0%" }]} />
        </EnterG>
        <EnterG at={w}>
          <PercentColumns x={760} y={260} width={420} height={420} lower={C.femaleTint} upper={C.female} colW={200} valuePos="inside"
            cols={[{ label: "妻 → 夫の家事", value: 65.7, big: true, sub: "3人に2人ほど" }]} upperName="満足でない" lowerName="満足" />
        </EnterG>
      </Svg>
      <Enter at={c}><Card x={1420} y={460} w={400}>ここまでなら、<br />やはり家事か</Card></Enter>
      <SourceNote text={`${SRC.nfrj}（43〜47歳）`} />
    </>
  );
};
const Bags39: React.FC<{ hus: number; train: number; wife: number; moves: number; yours: number }> = ({ hus, train, wife, moves, yours }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, moves, 75);
  const tilt = 10 + (4 - 10) * t; // 10° → 4°（止まる位置は答え合わせまで見せない）
  const left = frame >= hus ? [chores("husband"), veiled("husband")] : [chores("husband")];
  const right = frame >= wife ? [chores("wife"), veiled("wife")] : [chores("wife")];
  return (
    <>
      <ChapterDots current={3} />
      {frame < yours ? <Heading>でも、まだのせていないもの：仕事と通勤</Heading> : <Heading>どこで止まるかは、答え合わせで</Heading>}
      {frame >= train && frame < wife && <Enter><SubHead>夫のおもり：朝の電車・会議・残業・帰りの電車</SubHead></Enter>}
      <Camera dur={45} keys={[[0, WIDE], [Math.max(1, yours), { x: BAL.x, y: BAL.y + 160, scale: 1.25 }]]}>
        <Svg><BalanceAt left={left} right={right} tilt={tilt} from={10} moving={frame >= moves} /></Svg>
      </Camera>
      {frame < yours && <SourceNote text={`${SRC.time}。止まる位置は答え合わせで`} />}
    </>
  );
};
const Table41: React.FC<{ cond: number; res: number }> = ({ cond, res }) => (
  <>
    <ChapterDots current={3} />
    <Heading>満足と一緒に動くのは？</Heading>
    <Enter at={cond}><SubHead>年齢・収入などをそろえて比べた（28〜47歳の結婚している人）</SubHead></Enter>
    <Enter at={Math.min(res, 200)}><Table3 showSupport={false} /></Enter>
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。時間の調査とは別の調査。相関" />
  </>
);
const Support42: React.FC<{ three: number }> = ({ three }) => (
  <>
    <ChapterDots current={3} />
    <Heading>はっきり結びついていたのは、心の支え</Heading>
    <Table3 showSupport />
    <Svg>
      {SUPPORTS.map(([t, Icon], i) => {
        const x = 540 + i * 320;
        return (
          <EnterG key={t} at={three + i * 25}>
            <rect x={x} y={640} width={300} height={170} rx={R.md} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
            <Icon x={x + 150} y={690} s={0.8} />
            <Label x={x + 150} y={784} anchor="middle">{t}</Label>
          </EnterG>
        );
      })}
    </Svg>
    <SourceNote text="永瀬圭（2021）NFRJ18 第2次報告書。妻を調べた末盛慶（1999）も同じ向き。相関" />
  </>
);
/** S43：右の期待の点線が上から棒の上端まで降りてくる */
const Expect43: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const ey = 300 + (420 - 300) * ramp(frame, at, 45);
  return (
    <>
      <ChapterDots current={3} />
      <Heading>同じ量でも、期待との差で受け取り方が変わる</Heading>
      <Svg>
        {[["期待より少ない", 300], ["期待どおり", ey]].map(([t, e], i) => {
          const x = 420 + i * 640, yy = e as number;
          return (
            <EnterG key={i} at={i * 30}>
              <rect data-qa="mark" data-qa-label="夫の家事" x={x} y={420} width={220} height={330} rx={R.sm} fill={C.maleTint} stroke={C.male} strokeWidth={LINE.thin} />
              <line x1={x - 60} x2={x + 280} y1={yy} y2={yy} stroke={C.female} strokeWidth={LINE.base} strokeDasharray="16 12" />
              <Label x={x + 300} y={yy + 14} color={C.female}>妻の期待</Label>
              {i === 0 && <g><path d={`M${x + 250} ${yy + 14} V${406}`} stroke={C.female} strokeWidth={LINE.thin} /><path d={`M${x + 240} ${yy + 24} L${x + 250} ${yy + 8} L${x + 260} ${yy + 24} M${x + 240} ${396} L${x + 250} ${412} L${x + 260} ${396}`} fill="none" stroke={C.female} strokeWidth={LINE.thin} /></g>}
              <text data-qa-allow="mark" x={x + 110} y={600} textAnchor="middle" style={font("label")}>夫の家事</text>
              <Label x={x + 110} y={810} anchor="middle" weight={900}>{t}</Label>
            </EnterG>
          );
        })}
      </Svg>
      <SourceNote text="李基平（2008）家族社会学研究 20(1)。1994年の妻886人。図は説明のための例（量は同じに描いた）" />
    </>
  );
};
/** S45：左の場面のあいだ、右の枠は灰色で伏せる。右を開くと「そうだったんだ」でうなずいて笑う */
const Fit45: React.FC<{ open: number }> = ({ open }) => {
  const frame = useCurrentFrame();
  const shown = frame >= open;
  return (
    <>
      <ChapterDots current={3} />
      <Heading>支えは、量より「合っていたか」</Heading>
      <SubHead>海外の小さな日記研究（同居カップル67組）</SubHead>
      <Svg>
        {[0, 1].map((i) => {
          const x = 120 + i * 860;
          if (i === 1 && !shown) return <rect key={i} x={x} y={250} width={800} height={560} rx={R.lg} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />;
          return (
            <EnterG key={i} at={i === 0 ? 0 : open}>
              <rect x={x} y={250} width={800} height={560} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
              <Cat kind="other" x={x + 220} y={760} size={3.4} face={i === 0 ? (frame > 200 ? "sad" : "normal") : "smile"} turn={0.5} label="話す人" seed={i} />
              <Cat kind="other" x={x + 560} y={760} size={3.4} turn={-0.5} label="聞く人" seed={i + 4} />
              <Label x={x + 400} y={320} anchor="middle" weight={900}>{i === 0 ? "合っていない支え" : "合っている支え"}</Label>
            </EnterG>
          );
        })}
        <Bubble x={190} y={420} text="聞いてほしい" tail={[330, 560]} role="label" start={60} />
        <Bubble x={560} y={500} text="こうすれば？" tail={[660, 590]} role="label" start={140} />
        {shown && <Bubble x={1050} y={420} text="聞いてほしい" tail={[1190, 560]} role="label" start={open + 10} />}
        {shown && <Bubble x={1400} y={500} text="そうだったんだ" tail={[1510, 590]} role="label" start={open + 50} />}
      </Svg>
      <SourceNote text="Maisel & Gable（2009）Psychological Science。米国の同居カップル67組の日記（要旨）" />
    </>
  );
};
const Listen46: React.FC<{ overlay: number }> = ({ overlay }) => {
  const frame = useCurrentFrame();
  const upTo = Math.max(1, Math.min(9, 1 + Math.floor(frame / 12)));
  const on = frame >= overlay;
  return (
    <>
      <ChapterDots current={3} />
      <Heading>「配偶者は悩みを聞いてくれる」と答えた人</Heading>
      <Svg>
        <AxisTitle text="あてはまると答えた割合" />
        {on && <><path d="M1180 200 H1250" stroke={C.femaleTint} strokeWidth={LINE.thin} strokeDasharray="14 12" /><Label x={1264} y={214} color={C.ink2}>第1章：妻の満足</Label></>}
        <GenderLines {...CH} ticks={AGE_TICKS} endLabels={upTo >= 9} upTo={upTo}
          series={[...(on ? [{ label: "", color: C.femaleTint, values: SAT_WIFE, xs: AGE_XS, thin: true, dashed: true }] : []),
            { label: "夫", color: C.male, values: SUP_HUSBAND, xs: AGE_XS }, { label: "妻", color: C.female, values: SUP_WIFE, xs: AGE_XS }]}
          callouts={upTo >= 4 ? [{ s: on ? 2 : 1, i: 0, text: "約98%", above: false, dx: -40, dy: -48, anchor: "end" }, { s: on ? 2 : 1, i: 4, text: "約72%", above: false }] : []} />
      </Svg>
      <SourceNote text={SRC.nfrjSupport} />
    </>
  );
};
// ================= 答え合わせ（S48〜S55） =================
const VerdictScene: React.FC = () => {
  const { find, end } = useCue();
  const load = find("天秤に、仕事と通勤", 140), h = find("夫が9時間6分", 245), w = find("妻は、9時間", 320), diff = find("差は、2分", 400), b = find("答えは、Bの", 456);
  const other = find("ほかの時期も", 530), notTime = find("ですから、時間の長さでは", 1238), claim = find("続いて、今日の説", 1610);
  const r1 = find("満足の点数の平均は", 1790), r2 = find("でも、満足していないと答える", 1910), hit = find("判定は、半分だけ正解", 2094), split = find("満足度と一緒に動くものも", 2412);
  const us = find("子どもが家を出たあとについては", 3039), reason = find("上がった理由は", 3430), enjoy = find("一緒にいる時間を", 3591), japan = find("ただ、年齢ごとに比べた日本", 3867);
  const second = find("2つ目は", 4143), still = find("それでも、どの時期", 783), outside = find("外で長く", 908);
  const after = find("子どもが家を出たあとの妻", 2708), valley = find("満足度がいちばん低いのは", 2860);
  return (
    <>
      {/* S48：袋が外れ、針が残りを動いて真ん中で止まる → 9時間6分・9時間8分 → 差2分 → 予想の答え B */}
      <Beat from={0} to={other}><Stop48 load={load} h={h} w={w} diff={diff} b={b} /></Beat>
      {/* S49：ほかの時期も1時間未満 */}
      <Beat from={other} to={notTime}>
        {/* 「どの時期でも」で差の行へ少し寄り、「外で長く働く夫も」で引く */}
        <Camera dur={40} keys={[[0, WIDE], [still - other, { x: 960, y: 540, scale: 1.06 }], [outside - other, WIDE]]}><Wipe dir="up" dur={40}><S49 /></Wipe></Camera>
      </Beat>
      {/* S50：長さではなく中身 */}
      <Beat from={notTime} to={claim}><Enter dy={0}><S50 /></Enter></Beat>
      {/* S51：判定 △（証拠は読み上げに合わせて1つずつ、「判定は、三角」で印） */}
      <Beat from={claim} to={split}>
        <Verdict claim="夫婦は、二人いっしょに冷めていく" mark="△" chipAt={[r1 - claim, r2 - claim, hit - claim - 50]} hitAt={hit - claim + 20}
          reason={["満足の点数の平均は、\n夫も妻も下がる", "満足していない人は、\n30代後半から妻に多い", "家事＋仕事の時間は、\nほぼ同じ（差2分）"]} />
      </Beat>
      {/* S52：家族の時期 */}
      <Beat from={split} to={us}>
        {/* 「家を出たあとの妻」で右端の柱を下から指し、「谷が深い」まで残す */}
        <Drift len={us - split}>
          <Wipe dir="up" dur={40}><S52 /></Wipe>
          <Beat from={after - split} to={valley - split + 90}><Svg><EnterG><path d={`M${COL52_X} 806 l0 -46 m-16 16 l16 -16 l16 16`} fill="none" stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" /></EnterG></Svg></Beat>
        </Drift>
      </Beat>
      {/* S53〜S54：子が家を出たあと（米国） */}
      <Beat from={us} to={reason}><Bench53 /></Beat>
      <Beat from={reason} to={japan}><Bench54 enjoy={enjoy - reason} /></Beat>
      {/* S55：分けるもの2つ */}
      <Beat from={japan} to={end + 30}><Two55 second={second - japan} /></Beat>
    </>
  );
};
const Stop48: React.FC<{ load: number; h: number; w: number; diff: number; b: number }> = ({ load, h, w, diff, b }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, load, 50);
  const opened = frame >= load;
  const tilt = 4 * (1 - t) + tiltOf(39 + 507, 263 + 285) * t;
  const L = opened ? [chores("husband"), work("husband", "仕事・通勤\n8時間27分")] : [chores("husband"), veiled("husband")];
  const Rr = opened ? [chores("wife"), work("wife", "仕事・通勤\n4時間45分")] : [chores("wife"), veiled("wife")];
  return (
    <>
      {frame < diff ? <Heading>答え合わせ：天秤が止まる</Heading> : <Heading>天秤が止まる：差は 2分</Heading>}
      <Svg>
        <Balance x={BAL.x} y={BAL.y} left={L} right={Rr} tilt={tilt} moving={!opened || t < 1} from={opened ? 4 : 10}
          leftName="夫" rightName="妻" leftColor={C.male} rightColor={C.female} />
        {frame >= h && <PopG at={h}><Label x={BAL.x - 560} y={BAL.y + 490} anchor="middle" size="value" color={C.male}>9時間6分</Label></PopG>}
        {frame >= w && <PopG at={w}><Label x={BAL.x + 560} y={BAL.y + 490} anchor="middle" size="value" color={C.female}>9時間8分</Label></PopG>}
      </Svg>
      <Enter at={b} dy={0}>
        <div style={{ position: "absolute", right: 96, top: 56, whiteSpace: "nowrap", background: C.ink, borderRadius: R.md, padding: "8px 22px", ...font("label", C.white) }}>
          予想の答え B ほぼ同じ
        </div>
      </Enter>
      <SourceNote text={`${SRC.time}。末っ子10〜14歳`} />
    </>
  );
};
/** 答えの数字のばね（pop：10%行き過ぎる） */
const PopG: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp("pop", frame - at, fps);
  return <g opacity={Math.min(1, s * 2)}>{children}</g>;
};
const Bench53: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Heading>子が家を出たあと（米国・女性を18年追跡）</Heading>
      <Svg>
        <BenchCats look={false} />
        <Clock x={1400} y={400} r={110} hour={4 + frame / 120} minute={(frame * 6) % 60} />
      </Svg>
      <Enter at={120}><Card x={1060} y={560} w={760}>子どもが家を出ると、<br />結婚の満足は上がっていた</Card></Enter>
      <SourceNote text="Gorchoff, John, Helson（2008）Psychological Science 19(11)。中年の女性（要旨）" />
    </>
  );
};
const Bench54: React.FC<{ enjoy: number }> = ({ enjoy }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Heading>子が家を出たあと（米国・女性を18年追跡）</Heading>
      <Svg><BenchCats look={frame >= enjoy} /></Svg>
      <Enter><Card x={1060} y={260} w={760} bg={frame >= enjoy - 30 ? C.paper2 : C.white}>一緒に過ごす時間が増えたから<br />→ ではなかった</Card></Enter>
      <Enter at={enjoy}><Card x={1060} y={480} w={760}>一緒の時間を楽しめるようになって<br />→ 結婚の満足が上がった</Card></Enter>
      <SourceNote text="Gorchoff, John, Helson（2008）Psychological Science 19(11)。中年の女性（要旨）" />
    </>
  );
};
const Two55: React.FC<{ second: number }> = ({ second }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Enter dy={0}><S55 /></Enter>
      {/* 2枚目は「二つ目は」まで紙色で伏せる */}
      {frame < second && <div style={{ position: "absolute", left: 975, top: 235, width: 815, height: 515, background: C.bg }} />}
    </>
  );
};

// ================= 教訓（S56〜S62）と締め（S63） =================
const Lesson: React.FC = () => {
  const frame = useCurrentFrame();
  const { find, end } = useCue();
  const five = find("家まで、あと5分", 97), day = find("彼の一日も", 342), count = find("私たちは、数えやすい", 610), kinds = find("家事をした時間や", 711);
  const he = find("夫は、こう言えます", 978), him = find("俺のほうが", 1039), she = find("妻は、こう言えます", 1118), her = find("わたしのほうが", 1178);
  const but = find("でも、数えやすいものだけでは", 1377), minute = find("1分ごとに", 1565), un = find("助手席の「うん」", 1671);
  const stop = find("信号で止まったとき", 1827), q = find("「今日、疲れた", 1983), turn = find("妻が、窓から", 2039), ans = find("「そっちこそ」", 2141);
  const balance = find("天秤は、つり合って", 2192), forgot = find("量り忘れていたのは", 2271);
  const sign = end - 8; // 締めのひと言は字幕がないので、最後の字幕の終わりから（001 と同じ）
  return (
    <>
      {/* S56：車に戻る。日はさらに沈み、背景がゆっくり流れ、カーナビ 20分 → 5分 */}
      <Beat from={0} to={day}>
        <Car56 five={five} />
      </Beat>
      {/* S57：天秤はつり合う、線は二本 */}
      <Beat from={day} to={count}><Enter dy={0}><S57 /></Enter></Beat>
      {/* S58：数えやすいもの */}
      <Beat from={count} to={he}><Count58 at={kinds - count} /></Beat>
      {/* S59：どちらも言える。真ん中の時計の針が右へ、左へ */}
      <Beat from={he} to={but}><Both59 him={him - he} her={her - he} /></Beat>
      {/* S60：「うん」は数えられない（カーナビが5分→4分、点線の「うん」が浮く） */}
      <Beat from={but} to={stop}><Un60 navi={minute - but} un={un - but} /></Beat>
      {/* S61：「今日、疲れた？」「そっちこそ」 */}
      <Beat from={stop} to={balance}><Car61 turnH={q - stop - 20} q={q - stop} turnW={turn - stop} ans={ans - stop} /></Beat>
      {/* S62：天秤はつり合っていた。量り忘れていた点線の分銅 */}
      <Beat from={balance} to={sign}><Level62 forgot={forgot - balance} /></Beat>
      {/* S63：締めのひと言（毎回同じ） */}
      <Beat from={sign} to={sign + 600}><SignOff /></Beat>
    </>
  );
};
const Car56: React.FC<{ five: number }> = ({ five }) => {
  const frame = useCurrentFrame();
  return (
    <Drift len={330}>
      <CarScene signal="none" time={0.6 + 0.4 * ramp(frame, 0, 200)}>
        <Navi x={96} y={330} lines={["到着まで", frame < five ? "あと20分" : "あと5分"]} from={{ x: CAR.navi.x - 70, y: CAR.navi.y }} />
      </CarScene>
    </Drift>
  );
};
const Count58: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const n = (to: number, k: number) => Math.round(to * ramp(frame, at + k * 25, 40));
  return (
    <>
      <Heading>私たちは、数えやすいものから数える</Heading>
      <Svg>
        <EnterG at={at}><Stopwatch x={420} y={480} icon={<House x={400} y={510} s={0.6} />} /></EnterG>
        <EnterG at={at + 25}><Stopwatch x={960} y={480} icon={<Briefcase x={940} y={512} s={0.6} />} /></EnterG>
        <EnterG at={at + 50}><Coin x={1500} y={480} /></EnterG>
        {/* それぞれの下で数字が数え上がって止まる（数えやすい、を動きで。値は第3章の妻の家事 263分・夫の家事＋仕事 約9時間。年収は数字を出さない） */}
        {frame >= at && <><Label x={420} y={680} anchor="middle" weight={900}>家事の分数</Label><Label x={420} y={740} anchor="middle" color={C.ink2}>{n(263, 0)}分</Label></>}
        {frame >= at + 25 && <><Label x={960} y={680} anchor="middle" weight={900}>働いた時間</Label><Label x={960} y={740} anchor="middle" color={C.ink2}>{n(9, 1)}時間</Label></>}
        {frame >= at + 50 && <Label x={1500} y={680} anchor="middle" weight={900}>年収</Label>}
        <EnterG at={at + 120}><Label x={960} y={800} anchor="middle" color={C.ink2}>比べやすく、言い返しやすい</Label></EnterG>
      </Svg>
    </>
  );
};
const Both59: React.FC<{ him: number; her: number }> = ({ him, her }) => {
  const frame = useCurrentFrame();
  const ang = 40 * ramp(frame, him, 30) - 80 * ramp(frame, her, 30); // 夫の言葉で右へ、妻の言葉で左へ
  return (
    <Svg>
      <Bubble x={200} y={470} w={700} text="俺のほうが、長く働いている" tail={[480, 610]} role="label" start={him} />
      <Bubble x={1124} y={470} w={700} text="わたしのほうが、家のことをしている" tail={[1440, 610]} role="label" start={her} />
      <Cat kind="male" x={480} y={820} size={4} look={[0, -0.6]} label="夫" />
      <Cat kind="female" x={1440} y={820} size={4} look={[0, -0.6]} label="妻" seed={2} />
      <g data-qa="prop" data-qa-label="時計">
        <circle cx={960} cy={600} r={90} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} />
        <rect x={944} y={476} width={32} height={30} fill={C.ink} />
        <line x1={960} y1={600} x2={960 + 64 * Math.sin((ang * Math.PI) / 180)} y2={600 - 64 * Math.cos((ang * Math.PI) / 180)} stroke={C.ink} strokeWidth={LINE.base} strokeLinecap="round" />
      </g>
      {frame >= her + 40 && <Label x={960} y={790} anchor="middle" color={C.ink2}>どちらも、時計で測れば確かめられる</Label>}
    </Svg>
  );
};
const Un60: React.FC<{ navi: number; un: number }> = ({ navi, un }) => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, un + 60, 120);
  return (
    <CarScene signal="none" time={1}>
      <Navi x={96} y={330} lines={["到着まで", frame < navi + 30 ? "あと5分" : "あと4分"]} from={{ x: CAR.navi.x - 70, y: CAR.navi.y }} />
      {frame >= un && <Thought x={1190} y={292 - 200 * rise} w={150} text="うん" toward={[1190, 408 - 200 * rise]} dashed start={un} />}
    </CarScene>
  );
};
const Car61: React.FC<{ turnH: number; q: number; turnW: number; ans: number }> = ({ turnH, q, turnW, ans }) => {
  const frame = useCurrentFrame();
  const h = ramp(frame, turnH, 20), w = ramp(frame, turnW, 20);
  return (
    <CarScene signal="red" time={1} husbandTurn={0.8 * h} wifeTurn={0.7 - 1.3 * w} wifeFace={frame >= turnW + 20 ? "smile" : "normal"} inward={30 * w}>
      <Bubble x={560} y={290} text="今日、疲れた？" tail={[735, 420]} role="sub" start={q} />
      <Bubble x={1030} y={290} text="そっちこそ" tail={[1110, 420]} role="sub" start={ans} />
    </CarScene>
  );
};
const Level62: React.FC<{ forgot: number }> = ({ forgot }) => {
  const frame = useCurrentFrame();
  const drop = ramp(frame, forgot, 40);
  const out = 1 - 0.1 * ramp(frame, forgot + 90, 60); // 締めの一文のあと、少し引く
  return (
    <AbsoluteFill style={{ transform: `scale(${out})` }}>
      <Svg>
        <BalanceAt left={[chores("husband", false), work("husband")]} right={[chores("wife", false), work("wife")]} names={false} />
        {frame >= forgot && (
          <g opacity={drop} transform={`translate(0,${(1 - drop) * -300})`}>
            <LooseWeight x={BAL.x - 560} y={846} h={100} color={C.male} label="夫" />
            <LooseWeight x={BAL.x + 560} y={846} h={100} color={C.female} label="妻" />
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================= 章の扉と終了画面（台本にない、声のない場面） =================
const chapterScene = (no: number, title: string): SceneDef => ({ id: `ch${no}-card`, seconds: CHAPTER_FRAMES / FPS, Scene: () => <ChapterCard no={no} title={title} /> });
const End: React.FC = () => <EndScreen lesson={"天秤はつり合っていた。\n量り忘れていたのは、\n二人とも。"} />;

const narrated = fromTiming(timing as Timing, {
  opening: Opening, today: Today, quiz: QuizScene, ch1: Ch1, ch2: Ch2, ch3: Ch3, verdict: VerdictScene, lesson: Lesson,
});
const scenes: SceneDef[] = narrated.flatMap((s) => {
  if (s.id === "ch1") return [chapterScene(1, "夫と妻の満足を、年齢ごとに"), s];
  if (s.id === "ch2") return [chapterScene(2, "妻の満足が下がる時期"), s];
  if (s.id === "ch3") return [chapterScene(3, "二人の一日を、天秤に"), s];
  return [s];
});
scenes.push({ id: "end", seconds: END_FRAMES / FPS, Scene: End });

const episode: EpisodeDef = {
  id: "004-marriage-forty-dip",
  title: "40代、夫婦の満足は二本に分かれる", // 仮。タイトルはオーナーが決める（meta.md）
  scenes,
  // BGM は曲を決めてから（ローカルの工程）。例：bgm: [{ file: "…mp3", from: "opening", to: "today" }]
};
export default episode;
