// 記号を使わない答え合わせ（7本目「情報漏えい」の絵コンテ第2版で作った。2026-10-07）。
//   - SplitClaim：1つの話（通説）のカードが、「当たっていた所」（左の縁が青緑）と「外れていた所」（左の縁が灰）に割れる。
//                 外れていた所は、少し右下へずれて灰になる（hit がなければ全部が外れ）。最後に判定の言葉（word）を文字だけで出す。
//   - ClaimStrip：答え合わせの舞台の上に、4つの話を小さな札で横1列に並べる。current の札を墨の太い枠、済んだ札には縁の帯と言葉。
// 決まり：
//   - 〇△×などの記号は出さない（docs/owner-feedback.md「判定を記号で読む」）。判定は、帯の色（青緑＝当たり、灰＝外れ）と言葉だけ。
//   - 青緑は「当たっていた所」の意味でだけ使う。回の意味の色と重なるときは、帯は細く（18px）して面は白のままにする。
//   - 文字は 40px（話の一文・割れた札の中身）、名前は 64px、言葉は 72px。28px 未満にしない。札の中の文は \n で手で改行する。
//   - 4つを同じ舞台で順に入れ替える（場面ごとに型を変えない）。動き：割れる → 外れがずれる（enter のばね）→ 言葉が出る。
//   - 印：割れた札はそれぞれ data-qa="mark"（中の文字は入れ子なので重ならないとみなす）。x, y は左上。
import React from "react";
import { C, font, LINE, R } from "./theme";
import type { ClaimTone } from "./Claims";

const Part: React.FC<{ left: number; top: number; w: number; h: number; tone: "hit" | "miss"; head: string; text: string }> = ({ left, top, w, h, tone, head, text }) => (
  <div data-qa="mark" data-qa-label={`割れた札：${head}`} style={{ position: "absolute", left, top, width: w, height: h, boxSizing: "border-box", borderRadius: R.lg,
    background: tone === "hit" ? C.white : C.bg, border: `${LINE.thin}px ${tone === "hit" ? "solid" : "dashed"} ${tone === "hit" ? C.ink : C.other}`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: tone === "hit" ? C.teal : C.rest }} />
    <div style={{ position: "absolute", left: 44, top: 18, ...font("note", C.ink2), fontSize: 32 }}>{head}</div>
    <div style={{ position: "absolute", left: 44, top: 70, ...font("label", tone === "hit" ? C.ink : C.ink2), fontWeight: 900, lineHeight: 1.35, whiteSpace: "pre" }}>{text}</div>
  </div>
);

export const SplitClaim: React.FC<{
  x: number; y: number; w?: number; name: string; claim: string;
  hit?: string; miss: string; word: string; hitHead?: string; missHead?: string;
}> = ({ x, y, w = 1728, name, claim, hit, miss, word, hitHead = "当たっていた所", missHead = "外れていた所" }) => {
  const headH = 170, gap = 36, partH = 200, shift = 36; // partH 230→200（2026-10-07 判定の言葉が字幕の帯に近すぎた）
  const hitW = hit ? Math.round((w - gap - shift) / 2) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {/* 話のカード */}
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: headH, boxSizing: "border-box", borderRadius: R.lg, background: C.white, border: `${LINE.thin}px solid ${C.ink}` }}>
        <div style={{ position: "absolute", left: 32, top: 40, ...font("value"), whiteSpace: "nowrap" }}>「{name}」</div>
        <div style={{ position: "absolute", left: 32 + (name.length + 2) * 64 + 24, top: 58, ...font("label", C.ink2), whiteSpace: "nowrap" }}>{claim}</div>
      </div>
      {/* 割れた札 */}
      {hit && <Part left={0} top={headH + gap} w={hitW} h={partH} tone="hit" head={hitHead} text={hit} />}
      <Part left={hit ? hitW + gap + shift : shift} top={headH + gap + shift} w={hit ? w - hitW - gap - shift : w - shift} h={partH} tone="miss" head={missHead} text={miss} />
      {/* 判定の言葉（記号は出さない） */}
      <div style={{ position: "absolute", left: 0, top: headH + gap + shift + partH + 28, ...font("question"), whiteSpace: "nowrap" }}>{word}</div>
    </div>
  );
};

export const ClaimStrip: React.FC<{ x: number; y: number; w?: number; names: string[]; current: number; tones?: (ClaimTone | undefined)[]; words?: (string | undefined)[] }> = (
  { x, y, w = 1728, names, current, tones = [], words = [] },
) => {
  const gap = 24, cw = (w - gap * (names.length - 1)) / names.length, h = 104;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      {names.map((n, i) => {
        const tone = tones[i], cur = i === current;
        return (
          <div key={i} style={{ position: "absolute", left: i * (cw + gap), top: 0, width: cw, height: h, boxSizing: "border-box", borderRadius: R.md, overflow: "hidden",
            background: C.white, border: `${cur ? LINE.base : LINE.hair}px solid ${cur ? C.ink : C.rest}` }}>
            {tone && <div data-qa="mark" data-qa-label={`済んだ札の帯 ${n}`} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14,
              background: tone === "hit" ? C.teal : tone === "miss" ? C.rest : `linear-gradient(${C.teal} 50%, ${C.rest} 50%)` }} />}
            <div style={{ position: "absolute", left: 30, top: 26, ...font("label", cur || tone ? C.ink : C.ink2), fontWeight: 900, whiteSpace: "nowrap" }}>「{n}」</div>
            {words[i] && <div style={{ position: "absolute", right: 20, top: 30, ...font("note", C.ink2), fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }}>{words[i]}</div>}
          </div>
        );
      })}
    </div>
  );
};
