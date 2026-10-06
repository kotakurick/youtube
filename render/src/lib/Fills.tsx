// 塗りの種類（塗り／斜線／水玉）。同じ人（同じ色）の中の内訳を、濃い・淡いを使わずに分けるときに使う（2026-10-06 4本目の絵コンテ第2版）。
// 決まり：濃い・淡いは「満足でない／満足」など、その回で決めた1つの意味にだけ使う。内訳（家事・育児・仕事など）は塗りの種類で分ける。
//   solid＝その色の塗り（白の文字）／hatch＝白の地にその色の斜線（45度、線6・間隔18）／dots＝白の地にその色の水玉。
// 斜線と水玉の上の文字は墨にして、白のふち（halo）を付ける（textHalo）。
// 使い方：SVG の中で <FillDefs colors={[C.male, C.female]} /> を一度置き、fill={fillOf("hatch", C.male)} とする。
import React from "react";
import { C } from "./theme";

export type FillKind = "solid" | "hatch" | "dots";

const pid = (kind: FillKind, color: string) => `fill-${kind}-${color.replace(/[^0-9a-zA-Z]/g, "")}`;

/** 塗りの値（SVG の fill に入れる） */
export const fillOf = (kind: FillKind | undefined, color: string) => (!kind || kind === "solid" ? color : `url(#${pid(kind, color)})`);

/** 斜線と水玉の模様の定義。同じ色で何度置いても同じ中身なので重なってよい */
export const FillDefs: React.FC<{ colors: string[] }> = ({ colors }) => (
  <defs>
    {colors.map((c) => (
      <React.Fragment key={c}>
        <pattern id={pid("hatch", c)} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={18} height={18} fill={C.white} />
          <rect width={5} height={18} fill={c} />
        </pattern>
        <pattern id={pid("dots", c)} width={22} height={22} patternUnits="userSpaceOnUse">
          <rect width={22} height={22} fill={C.white} />
          <circle cx={5.5} cy={5.5} r={4.5} fill={c} />
          <circle cx={16.5} cy={16.5} r={4.5} fill={c} />
        </pattern>
      </React.Fragment>
    ))}
  </defs>
);

/** 模様の上の文字を読みやすくする白のふち（SVG の text の style に足す） */
export const textHalo: React.CSSProperties = { stroke: C.white, strokeWidth: 16, paintOrder: "stroke", strokeLinejoin: "round" };

/** 凡例の小さな見本（x,y は左上） */
export const FillSwatch: React.FC<{ x: number; y: number; kind: FillKind; color: string; w?: number; h?: number }> = ({ x, y, kind, color, w = 56, h = 40 }) => (
  <rect data-qa="mark" data-qa-label="凡例の見本" x={x} y={y} width={w} height={h} rx={6} fill={fillOf(kind, color)} stroke={color} strokeWidth={3} />
);
