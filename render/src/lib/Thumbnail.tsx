// サムネイル（1280×720）。様式は1つ（2026-10-04 決定）：
//   紙色の地 ＋ 左6割に100人の10×10（主役の人数だけ色）＋ 右4割に墨の帯に載せた特大の文字2かたまり ＋ 右下にゴサ（高さの12〜15%）。
//   テスト用に全面墨の地（ground: "ink"）も同じ中身で作れる。〇△×は出さない（答えのネタバレになる）。
//   男女の対立の回は、ゴサを出さない（gosa: null）か「考え中」だけにする。
import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, Kind } from "./Figure";
import { Expression, Gosa } from "./Gosa";
import { C, FONT, R } from "./theme";

export type ThumbProps = {
  lines: [string, string] | [string];   // 大きな文字（2かたまりまで、1かたまり7字まで）
  count: number;                         // 色を付ける人数（100人中）
  kinds?: "both" | "male" | "female";    // 色を付ける人の性別
  gosa?: "surprised" | "skeptical" | "depends" | "thinking" | null;
  ground?: "paper" | "ink";
};
export const THUMB = { w: 1280, h: 720 } as const;

export const Thumbnail: React.FC<ThumbProps> = ({ lines, count, kinds = "both", gosa = "surprised", ground = "paper" }) => {
  for (const l of lines) if (l.length > 7) throw new Error(`Thumbnail: 「${l}」が${l.length}字です。1かたまり7字までにしてください。`);
  if (count < 0 || count > 100) throw new Error("Thumbnail: count は0〜100にしてください。");
  const ink = ground === "ink";
  const kindOf = (i: number): Kind => (kinds === "both" ? (i % 2 ? "female" : "male") : kinds);
  const rest = ink ? C.ink2 : C.rest;
  // 10×10：左下から行の順に埋める（100マスと同じ並び）
  const people = Array.from({ length: 100 }, (_, i) => ({
    x: 70 + (i % 10) * 70, y: 690 - Math.floor(i / 10) * 64, kind: kindOf(i), on: i < count,
  }));
  return (
    <AbsoluteFill style={{ background: ink ? C.ink : C.bg }}>
      <svg width={THUMB.w} height={THUMB.h} style={{ position: "absolute" }}>
        {people.map((p, i) => <Figure key={i} kind={p.kind} x={p.x} y={p.y} size={1.0} color={p.on ? undefined : rest} />)}
      </svg>
      <div style={{ position: "absolute", left: 780, right: 40, top: 70, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
        {lines.map((l) => (
          <div key={l} style={{
            fontFamily: FONT, fontWeight: 900, fontSize: Math.min(110, Math.floor(420 / l.length)), lineHeight: 1.1, whiteSpace: "nowrap",
            color: C.bg, background: ink ? "transparent" : C.ink, borderRadius: R.md, padding: ink ? 0 : "8px 20px",
          }}>{l}</div>
        ))}
      </div>
      {gosa && <Gosa cues={[[-60, gosa as Expression]]} size={66} x={1150} foot={690} dark={ink} sfx={false} />}
    </AbsoluteFill>
  );
};
