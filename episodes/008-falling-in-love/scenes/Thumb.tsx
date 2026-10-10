// 8本目のサムネイル（2026-10-10 の様式：白い人形＋太いゴシック。docs/brand.md のサムネイル。部品は @lib/ThumbKit）。
// 人形は Gemini の API（scripts/gemini_image.py。指示文は meta.md）→ scripts/chroma_key.py で抜いた PNG
// （render/public/episodes/008-falling-in-love/thumb/。Git の外。元は _local/episodes/008-falling-in-love/thumb/doll-src3.png）。
// 情景：夜。長い条件の表（ケプラーの表）を手に持ったまま、顔は表ではなく右上の光を見上げている。
// 光は暖かい色、空は紺から紫。星は少しだけ（冒頭の天文学者）。男女の対立の回ではないので、人形は1人・性別を強く出さない。
// npx remotion still src/index.ts 008-falling-in-love-thumb-after out/008-thumb.png
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Cutout, ThumbStage, ThumbWord, TW, TYELLOW, Vignette } from "@lib/ThumbKit";

const DOLL = { src: "episodes/008-falling-in-love/thumb/doll.png", aspect: 378 / 1088 };

/** 右上の暖かい光と、まばらな星 */
const Sky: React.FC = () => {
  let s = 8 * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 1150px 70px, rgba(255,214,140,.95) 0%, rgba(255,150,120,.55) 20%, rgba(200,90,150,.30) 46%, rgba(0,0,0,0) 66%)" }} />
      <svg width={TW} height={720} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={560 + rnd() * 700} cy={rnd() * 360} r={1.2 + rnd() * 2.2} fill="#FFF6DD" opacity={0.35 + rnd() * 0.5} />
        ))}
      </svg>
    </>
  );
};

const WORD = 132;
// レビュー r1（review/thumbnail-r1.md）：地を明るく・光を文字の側へ広げる・人形を右下から少し離す・字を大きく。
// r2：人形を上げて右下（再生時間）を空ける・字を中心へ・周りの暗さを軽く。
// hi＝黄にする行（全部白だと何が言いたいか立たない。r1）
const Thumb: React.FC<{ lines: [string, string]; size?: number; hi?: 0 | 1 }> = ({ lines, size = WORD, hi }) => (
  <ThumbStage ground={["#1B2258", "#5A2E78"]}>
    <Sky />
    <Cutout {...DOLL} cx={990} top={8} h={700} rim="rgba(255,200,140,.75)" glow={{ x: 0.62, y: 0.1, r: 120 }} />
    <Vignette strength={0.3} />
    <ThumbWord text={lines[0]} size={size} top={225} color={hi === 0 ? TYELLOW : undefined} />
    <ThumbWord text={lines[1]} size={size} top={225 + size * 1.22} color={hi === 1 ? TYELLOW : undefined} />
  </ThumbStage>
);


// ── 人でない案（2026-10-10 オーナー「人間じゃなくてもいいから最高のサムネイルにして」）──
// 絵は Gemini の API（指示文は meta.md）→ chroma_key.py。どれも本編の比喩そのもの：
// heart＝条件のチェックリストで折ったハート（表が恋の形に書き換わる。第3章の山と締め）
// cheart＝塩の結晶に覆われた枝のハート（スタンダールの結晶。締め「結晶は、好きになったあとから付きはじめます」）
const OBJ = {
  heart: { src: "episodes/008-falling-in-love/thumb/heart.png", aspect: 724 / 787 },
  // xheart＝左半分は条件のチェックリスト、右半分が塩の結晶に変わっていく紙のハート（レビュー r3 の案X。表から恋への書き換わりを1枚で）
  xheart: { src: "episodes/008-falling-in-love/thumb/xheart.png", aspect: 731 / 711 },
  cheart: { src: "episodes/008-falling-in-love/thumb/cheart.png", aspect: 860 / 902, tone: "saturate(.5) brightness(1.12) contrast(1.08)" }, // 黄色いと砂糖に見えるので色を抑える
};

/** 物の絵：cx・top・h、rot＝傾き（度） */
// edge＝ふちの細い光（r4：紙のふちに白い光。地の紺から紙を浮かせる）
const Obj: React.FC<{ o: { src: string; aspect: number; tone?: string }; cx: number; top: number; h: number; rot?: number; rim?: string; edge?: string }> = ({ o, cx, top, h, rot = 0, rim = "rgba(255,200,140,.8)", edge }) => (
  <Img data-qa="figure" src={staticFile(o.src)} style={{
    position: "absolute", left: cx - (h * o.aspect) / 2, top, height: h, width: h * o.aspect, zIndex: 2,
    transform: `rotate(${rot}deg)`,
    filter: `${o.tone ?? ""} ${edge ? `drop-shadow(0 0 3px ${edge})` : ""} drop-shadow(0 0 22px ${rim}) drop-shadow(0 26px 34px rgba(0,0,0,.6))`,
  }} />
);

/** 物の後ろの光（スポットライト） */
const Spot: React.FC<{ x: number; y: number; color: string; r?: number }> = ({ x, y, color, r = 420 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${color} 0%, rgba(0,0,0,0) 100%)` }} />
);

// 字の右端（6字×120px で約750）とハートの左端（約770）が重ならない寸法
const ObjThumb: React.FC<{ o: keyof typeof OBJ; lines: [string, string]; size?: number; hi?: 0 | 1; ground: [string, string]; spot: string; rot?: number; h?: number; cx?: number; top?: number; rim?: string; edge?: string; wordTop?: number }> = ({
  o, lines, size = 120, hi, ground, spot, rot = -6, h = 600, cx = 1060, top = 60, rim, edge, wordTop = 225,
}) => (
  <ThumbStage ground={ground}>
    <Spot x={cx} y={top + h * 0.45} color={spot} />
    <Obj o={OBJ[o]} cx={cx} top={top} h={h} rot={rot} rim={rim} edge={edge} />
    <Vignette strength={0.35} />
    <ThumbWord text={lines[0]} size={size} top={wordTop} color={hi === 0 ? TYELLOW : undefined} />
    <ThumbWord text={lines[1]} size={size} top={wordTop + size * 1.22} color={hi === 1 ? TYELLOW : undefined} />
  </ThumbStage>
);

export default [
  // r5：ハートを0.94倍にして右の余白を空け、字を下へ（字とハートの間も広がる）
  // r4 の直し：字を小さくして1行目の右端をハートの左先端から離す・結晶の光を約0.6倍に・紙のふちに白い光
  // （絵は tools/fix_xheart.py で、紙を明るく・赤を鮮やかに・下で切れていた4つ目の✗を消した）
  { id: "008-falling-in-love-thumb-xheart", component: () => <ObjThumb o="xheart" lines={["好みのほうが", "書き換わる"]} size={110} hi={1} ground={["#141A44", "#4A2266"]} spot="rgba(255,175,120,.5)" rim="rgba(255,200,140,.5)" edge="rgba(255,255,255,.55)" rot={-4} h={508} cx={1005} top={113} wordTop={245} /> },
  { id: "008-falling-in-love-thumb-heart", component: () => <ObjThumb o="heart" lines={["好みのほうが", "書き換わる"]} hi={1} ground={["#141A44", "#4A2266"]} spot="rgba(255,170,120,.55)" /> },
  { id: "008-falling-in-love-thumb-cheart", component: () => <ObjThumb o="cheart" lines={["好みのほうが", "書き換わる"]} hi={1} ground={["#0E1436", "#3A1E52"]} spot="rgba(255,190,110,.5)" rot={0} h={580} top={70} cx={1045} /> },
  { id: "008-falling-in-love-thumb-crystal", component: () => <ObjThumb o="cheart" lines={["恋は", "結晶する"]} size={150} hi={1} ground={["#0E1436", "#3A1E52"]} spot="rgba(255,190,110,.5)" rot={0} h={620} top={50} cx={1000} /> },
  // A：締め（結晶は好きになったあとから付きはじめる。S68 スタンダール・S65 フランクファート・S16 の読み直し）。
  // 「条件の表は当たらない」は、好みが網としてある程度当たる（S20）ので言い過ぎとしてやめた
  { id: "008-falling-in-love-thumb-after", component: () => <Thumb lines={["好きな理由は", "あとから付く"]} size={114} /> },
  // B：第3章の山（好きになった人に合わせて、好みの条件のほうが変わる。S20 Gerlach 2019）。タイトル B と分担
  { id: "008-falling-in-love-thumb-rewrite", component: () => <Thumb lines={["好みのほうが", "書き換わる"]} hi={1} /> },
  // B'（r1 の任意の案）：「ほう」の比べる相手を見せる。本編の「動いたのは、条件のほうだった」と同じ語
  { id: "008-falling-in-love-thumb-joken", component: () => <Thumb lines={["条件のほうが", "書き換わる"]} hi={1} /> },
  // C：B を自分に当てはめる言い方
  { id: "008-falling-in-love-thumb-type", component: () => <Thumb lines={["理想のタイプは", "あとで変わる"]} size={100} /> },
];
