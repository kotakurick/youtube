// 色・大きさ・フォントの決まり（docs/decisions.md と assets/characters/gosa/README.md に合わせる）
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  bg: "#F5F2EA",      // 背景
  ink: "#1D2333",     // 線・文字・ゴサ
  male: "#2F6FDE",    // 男性
  female: "#D9541E",  // 女性
  other: "#9A958C",   // その他・比較対象
  white: "#FFFFFF",
} as const;

export const W = 1920;
export const H = 1080;
export const FPS = 30;

// フォントは Noto Sans JP（OFL）。npm run sync が public/fonts/ に一度だけ取ってくる。
// 書き出しのたびにネットから取らないので、速く、オフラインでも同じ見た目になる。
export const FONT = "NotoSansJP";
loadFont({ family: FONT, url: staticFile("fonts/NotoSansJP.ttf"), weight: "100 900" });

/** 秒をフレームに */
export const sec = (s: number) => Math.round(s * FPS);
