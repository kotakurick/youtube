// Remotion の設定。webpack の追加設定は webpack-override.mjs（npm run check と共通）。
import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override.mjs";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(null); // CPU のコア数に合わせる
Config.setDelayRenderTimeoutInMilliseconds(120000); // 待ちの上限（フォントは FontGate.tsx で動画ごとに待つ）
Config.overrideWebpackConfig(webpackOverride);
