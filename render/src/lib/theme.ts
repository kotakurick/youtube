// 見た目の決まり（docs/brand.md）。数字はここだけに書き、部品はここから読む。
import type React from "react";
import { loadFont } from "@remotion/fonts";
import { Easing, spring, SpringConfig, staticFile } from "remotion";

export const C = {
  bg: "#F5F2EA",      // paper：背景
  paper2: "#EBE6D9",  // 面・帯・方眼の地
  ink: "#1D2333",     // 文字・ゴサ・軸・性別と関係ない「注目の値」
  ink2: "#5B6070",    // 補足の文字（opacity で薄くしない）
  male: "#2F6FDE",
  female: "#D9541E",
  maleTint: "#B9CBE6",   // 話の対象外の人（男性）
  femaleTint: "#EDC3AD", // 話の対象外の人（女性）
  other: "#8C877E",   // その他・無回答（読ませる棒にも使える濃さ）
  otherTint: "#D8D3C8",
  rest: "#CFC9BC",    // 背景の固まり・注目しない棒
  marker: "#FFD23F",  // 蛍光ペン。文字や数字の下に敷くだけ（データの塗りには使わない）
  white: "#FFFFFF",
} as const;

export const W = 1920;
export const H = 1080;
export const FPS = 30;

/** 画面の区画（1920×1080）。下80px は再生バーが重なるので何も置かない。 */
export const Z = {
  margin: { x: 96, top: 56, bottom: 80 },
  header: { x: 96, y: 56, w: 1300, h: 120 },         // 問い（左寄せ、2行まで）
  stage: { x: 96, y: 200, w: 1728, h: 680 },          // 主役の絵（ゴサがいるときは右端 1520 まで）
  stageWithGosa: { x: 96, y: 200, w: 1424, h: 680 },
  noteY: 884,                                          // 出典（グラフの左下）
  dock: { x: 1690, foot: 880 },                        // ゴサの足元（右下に固定）
  sub: { y: 920, h: 80, w: 1440 },                     // 字幕
} as const;

/** 文字の大きさ／太さ */
export const T = {
  hero: [200, 900], chapter: [96, 900], question: [72, 900], value: [64, 900],
  label: [40, 700], body: [44, 500], sub: [54, 700], note: [28, 500],
} as const satisfies Record<string, readonly [number, number]>;

/** 線の太さ：目盛り／軸・縁取り／誤差棒・指し示し・折れ線（ゴサのひげ M と同じ）／印 */
export const LINE = { hair: 2, thin: 4, base: 7, heavy: 14 } as const;
/** 角の丸み：棒の上の角・人型の胴／字幕・札／カード */
export const R = { sm: 8, md: 16, lg: 28 } as const;

/** ばねは3種類だけ */
export const SPRING = {
  enter: { damping: 20, stiffness: 170, overshootClamping: true }, // 文字・カード・グラフ（約18f）
  move: { damping: 26, stiffness: 120 },                           // 群衆の移動（約30f）
  pop: { damping: 11, stiffness: 200 },                            // ゴサと答えの数字だけ（10%行き過ぎる）
} as const satisfies Record<string, Partial<SpringConfig>>;

/** 伸び・数え上げの曲線 */
export const EASE = Easing.bezier(0.2, 0, 0, 1);

export const sp = (kind: keyof typeof SPRING, frame: number, fps: number) =>
  spring({ frame, fps, config: SPRING[kind] });

/** ゴサの大きさ（体の直径 px） */
export const GOSA_SIZE = { S: 96, M: 140, L: 220 } as const;

/** 群衆の1人の大きさ。100人の場面で高さ64px以上（Figure の素の高さは約50px） */
export const CROWD_SIZE = 1.3;

// フォントは Noto Sans JP（OFL）。npm run sync が public/fonts/ に一度だけ取ってくる。
// 書き出しのたびにネットから取らないので、速く、オフラインでも同じ見た目になる。
export const FONT = "NotoSansJP";
loadFont({ family: FONT, url: staticFile("fonts/NotoSansJP.ttf"), weight: "100 900" });

/** 文字の役割から style を作る（数字は等幅） */
export const font = (role: keyof typeof T, color: string = C.ink): React.CSSProperties => ({
  fontFamily: FONT, fontSize: T[role][0], fontWeight: T[role][1], color, fontVariantNumeric: "tabular-nums",
});

/** 秒をフレームに */
export const sec = (s: number) => Math.round(s * FPS);
