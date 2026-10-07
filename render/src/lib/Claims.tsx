// よく聞く話（通説）を並べるカードと、「いくつ本当？」の数の札（7本目「情報漏えい」で作った。2026-10-07）。
//   - ClaimCards：通説を2列（cols=2。名前＋一文）か横1列（cols=4。名前だけ）のカードで並べる。
//                 shown で出ているカードの数（残りは点線の空き枠）。icons でカードごとの小さな目印（SVG の要素。中心 0,0、約96px）。
//                 答え合わせのあとは tones（hit＝当たり、half＝半分、miss＝外れ）でカードの左の縁に帯（青緑／半分だけ青緑／灰）を付け、
//                 words でその下に言葉（「半分本当」「ちがう」など）を出す。
//   - CountPick ：「本当の話は、いくつ？」の数の札（0〜n）。answer を付けるとその札だけ墨で塗り、ほかを薄くする。
// 決まり：
//   - 判定の記号（〇△×）は使わない（docs/owner-feedback.md「判定を記号で読む」。第2版で印をやめ、縁の帯と言葉だけにした）。
//   - 文字は 40px 以上（名前は 56〜64px）。カードの中の一文は1行に収まる長さにする（cols=2 で18字まで）。
//   - 印：カードは HTML の箱なので、文字は自動で拾われる。縁の帯と目印は data-qa="mark"（カードの中の文字とは重ねない）。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type Claim = { name: string; text?: string };
export type ClaimTone = "hit" | "half" | "miss";

const Band: React.FC<{ tone: ClaimTone; h: number }> = ({ tone, h }) => (
  <div data-qa="mark" data-qa-label={`判定の帯：${tone}`} style={{ position: "absolute", left: 0, top: 0, width: 18, height: h, borderRadius: `${R.lg}px 0 0 ${R.lg}px`, overflow: "hidden",
    background: tone === "hit" ? C.teal : tone === "miss" ? C.rest : `linear-gradient(${C.teal} 50%, ${C.rest} 50%)` }} />
);

export const ClaimCards: React.FC<{
  x: number; y: number; w: number; items: Claim[]; cols?: 2 | 4; shown?: number;
  icons?: (React.ReactNode | undefined)[]; tones?: (ClaimTone | undefined)[]; words?: (string | undefined)[]; numbered?: boolean;
}> = ({ x, y, w, items, cols = 2, shown, icons = [], tones = [], words = [], numbered = true }) => {
  const gap = 32;
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = cols === 2 ? 260 : 300;
  const n = shown ?? items.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexWrap: "wrap", gap }}>
      {items.map((it, i) => {
        const on = i < n;
        const tone = tones[i];
        const ic = icons[i];
        return (
          <div key={i} style={{ width: cw, height: ch, boxSizing: "border-box", position: "relative", borderRadius: R.lg,
            background: on ? C.white : "transparent", border: `${LINE.thin}px ${on ? "solid" : "dashed"} ${on ? C.ink : C.rest}` }}>
            {on && <>
              {tone && <Band tone={tone} h={ch - LINE.thin * 2} />}
              {numbered && <div style={{ position: "absolute", left: 32, top: 14, ...font("label", C.ink2) }}>{`${i + 1}つ目`}</div>}
              <div style={{ position: "absolute", left: 32, top: cols === 2 ? 66 : 76, ...font("value"), ...(cols === 4 ? { fontSize: 56 } : {}), whiteSpace: "nowrap" }}>「{it.name}」</div>
              {cols === 2 && it.text && <div style={{ position: "absolute", left: 36, top: 168, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{it.text}</div>}
              {ic && <svg width={120} height={110} viewBox="-60 -55 120 110" style={{ position: "absolute", ...(cols === 2 ? { right: 28, top: 20 } : { right: 20, top: 172 }) }}>
                <g data-qa="mark" data-qa-label={`目印：${it.name}`}>{ic}</g>
              </svg>}
              {words[i] && <div style={{ position: "absolute", left: 36, top: cols === 2 ? 168 : 196, ...font("label"), fontWeight: 900, whiteSpace: "nowrap" }}>{words[i]}</div>}
            </>}
          </div>
        );
      })}
    </div>
  );
};

/** 4つの話の目印（ClaimCards の icons に渡す）：上向きの矢印・硬貨と矢印・電球・硬貨の山。墨と紙色、硬貨だけ金 */
export const ClaimIcon: React.FC<{ kind: "up" | "cash" | "genius" | "rich" }> = ({ kind }) => {
  const st = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "up") return <g><path d="M-40 34 L-10 4 L8 18 L40 -26" fill="none" {...st} /><path d="M40 -26 L18 -24 M40 -26 L38 -4" fill="none" {...st} /></g>;
  if (kind === "cash") return <g><circle cx={-22} cy={10} r={24} fill={C.gold} {...st} /><path d="M10 10 H44 M32 -2 L44 10 L32 22" fill="none" {...st} /><path d="M-30 -30 H-14" {...st} /></g>;
  if (kind === "genius") return <g><path d="M-22 4 A28 28 0 1 1 22 4 Q14 14 14 24 H-14 Q-14 14 -22 4 Z" fill={C.white} {...st} /><path d="M-12 34 H12" {...st} /></g>;
  return <g>{[[-26, 30], [0, 30], [26, 30], [-13, 14], [13, 14], [0, -2]].map(([cx, cy], k) => <ellipse key={k} cx={cx} cy={cy} rx={16} ry={8} fill={C.gold} {...st} strokeWidth={3} />)}</g>;
};

export const CountPick: React.FC<{ x: number; y: number; max?: number; unit?: string; answer?: number; label?: string }> = (
  { x, y, max = 4, unit = "つ", answer, label },
) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
    {label && <div style={{ ...font("label"), fontWeight: 900, marginRight: 12 }}>{label}</div>}
    {Array.from({ length: max + 1 }, (_, k) => {
      const on = answer === k, dim = answer !== undefined && !on;
      return (
        <div key={k} style={{ minWidth: 120, boxSizing: "border-box", textAlign: "center", padding: "6px 20px", borderRadius: R.md,
          border: `${LINE.thin}px solid ${dim ? C.rest : C.ink}`, background: on ? C.ink : C.white,
          ...font("value", on ? C.white : dim ? C.rest : C.ink) }}>
          {`${k}`}<span style={{ fontSize: 40 }}>{unit}</span>
        </div>
      );
    })}
  </div>
);
