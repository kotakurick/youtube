// よく聞く話（通説）を並べるカードと、「いくつ本当？」の数の札（7本目「情報漏えい」で作った。2026-10-07）。
//   - ClaimCards：通説を2列（cols=2。名前＋一文）か横1列（cols=4。名前だけ）のカードで並べる。
//                 shown で出ているカードの数（残りは点線の空き枠）。marks で判定の印（〇△×、墨だけ）と、その下の言葉（words）を押す。
//                 答え合わせの最後に、4つの判定をまとめて見せるときにも使う。
//   - CountPick ：「本当の話は、いくつ？」の数の札（0〜n）。answer を付けるとその札だけ墨で塗り、ほかを薄くする。
// 決まり：
//   - 印の形は Verdict と同じ（〇＝円、△＝三角、×＝ばつ）。色は墨だけ。言葉は回ごとに渡す（例：本当／半分本当／ちがう）。
//   - 文字は 40px 以上（名前は 64px）。カードの中の一文は1行に収まる長さにする（cols=2 で18字まで）。
//   - 印：カードは HTML の箱なので、文字は自動で拾われる。印の図形は data-qa="mark"。
import React from "react";
import { C, font, LINE, R } from "./theme";
import type { Mark } from "./Verdict";

export type Claim = { name: string; text?: string };

const MarkIcon: React.FC<{ mark: Mark; size: number }> = ({ mark, size }) => {
  const st = { fill: "none", stroke: C.ink, strokeWidth: LINE.heavy - 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ display: "block" }}>
      <g data-qa="mark" data-qa-label={`判定の印 ${mark}`}>
        {mark === "〇" && <circle r={46} {...st} />}
        {mark === "△" && <path d="M0 -48 L50 40 H-50 Z" {...st} />}
        {mark === "×" && <path d="M-40 -40 L40 40 M40 -40 L-40 40" {...st} />}
      </g>
    </svg>
  );
};

export const ClaimCards: React.FC<{
  x: number; y: number; w: number; items: Claim[]; cols?: 2 | 4; shown?: number;
  marks?: (Mark | undefined)[]; words?: (string | undefined)[]; numbered?: boolean;
}> = ({ x, y, w, items, cols = 2, shown, marks = [], words = [], numbered = true }) => {
  const gap = 32;
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = cols === 2 ? 220 : 250;
  const n = shown ?? items.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexWrap: "wrap", gap }}>
      {items.map((it, i) => {
        const on = i < n;
        const mk = marks[i];
        return (
          <div key={i} style={{ width: cw, height: ch, boxSizing: "border-box", position: "relative", borderRadius: R.lg,
            background: on ? C.white : "transparent", border: `${LINE.thin}px ${on ? "solid" : "dashed"} ${on ? C.ink : C.rest}` }}>
            {on && <>
              {numbered && <div style={{ position: "absolute", left: 24, top: 14, ...font("label", C.ink2) }}>{`${i + 1}つ目`}</div>}
              <div style={{ position: "absolute", left: 24, top: cols === 2 ? 70 : 80, ...font("value"), ...(cols === 4 ? { fontSize: 56 } : {}), whiteSpace: "nowrap" }}>「{it.name}」</div>
              {cols === 2 && it.text && <div style={{ position: "absolute", left: 28, top: 162, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{it.text}</div>}
              {mk && <div style={{ position: "absolute", right: cols === 2 ? 28 : 20, top: cols === 2 ? 30 : 150, display: "flex", flexDirection: cols === 2 ? "column" : "row",
                alignItems: "center", gap: 6 }}>
                <MarkIcon mark={mk} size={cols === 2 ? 110 : 80} />
                {words[i] && <div style={{ ...font("label"), fontWeight: 900, whiteSpace: "nowrap" }}>{words[i]}</div>}
              </div>}
            </>}
          </div>
        );
      })}
    </div>
  );
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
          {k}<span style={{ fontSize: 40 }}>{unit}</span>
        </div>
      );
    })}
  </div>
);
