// Remotion の設定。webpack の追加設定は webpack-override.mjs（npm run check と共通）。
import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override.mjs";

// 文字のふちをくっきり保つ（2026-10-08）：途中の絵は PNG、圧縮は crf 12（既定は jpeg・18）。
// 測った結果、元の絵とのずれは最大42→13段階（256段階中）、ファイルは約8%増。書き出しは少し遅くなる。
Config.setVideoImageFormat("png");
Config.setCrf(12);
Config.setConcurrency(null); // CPU のコア数に合わせる
Config.setDelayRenderTimeoutInMilliseconds(120000); // 待ちの上限（フォントは FontGate.tsx で動画ごとに待つ）
Config.overrideWebpackConfig(webpackOverride);
