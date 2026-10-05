// 毎回の締めのひと言「数えてみると、景色が変わりました。」の共通アニメーション（2026-10-05 オーナー決定：字幕は出さない・ゴサが動く・毎回同じ）。
// 流れ（約5秒。読み上げの長さに関係なく同じ動き）：
//   0〜40f   紙の地の丘にゴサが立ち、上に100個の点（1つ＝1人）が1つずつ数えられて10×10に並ぶ。ゴサはひげで点を指して数える
//   40〜80f  丘のてっぺんから夜が丸く広がり（景色が変わる）、点は散らばって星になる。ゴサは驚き、一文が出ると笑う
//   70f〜    夜空の真ん中に締めの一文、その下にチャンネル名。星はゆっくりまたたく
// 台本では〔字幕なし〕を付けて読む（tts/narrate.py）。場面の側は <SignOff /> を置くだけ。
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Gosa } from "./Gosa";
import { rng } from "./random";
import { Sfx } from "./Sfx";
import { C, CHANNEL_NAME, EASE, font, sp } from "./theme";

export const SIGN_OFF = "数えてみると、景色が変わりました。";

const HILL_TOP = 830;
const hill = `M0 1080 L0 ${HILL_TOP + 150} C 520 ${HILL_TOP + 40} 760 ${HILL_TOP} 960 ${HILL_TOP} C 1160 ${HILL_TOP} 1400 ${HILL_TOP + 40} 1920 ${HILL_TOP + 150} L1920 1080 Z`;
const NIGHT_HILL = "#1A2038";
const STAR = "#F5F2EA";

/** 色を混ぜる（#RRGGBB どうし） */
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t)).join(",")})`;
};

export const SignOff: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // 100個の点：はじめは10×10（数える）、あとで星の位置へ。文字の帯（y 400〜600 の真ん中）は避ける
  const dots = useMemo(() => {
    const r = rng(2026);
    return Array.from({ length: 100 }, (_, i) => {
      const gx = 960 + ((i % 10) - 4.5) * 40, gy = 290 + (Math.floor(i / 10) - 4.5) * 40;
      let sx = 0, sy = 0;
      do { sx = 60 + r() * 1800; sy = 50 + r() * 720; } while ((sy > 320 && sy < 560 && sx > 300 && sx < 1620) || (sx > 820 && sx < 1100 && sy > 560) || sy > HILL_TOP - 60 + Math.abs(sx - 960) * 0.08);
      return { gx, gy, sx, sy, size: 3 + r() * 5, tw: r() * 6.28 };
    });
  }, []);

  const night = interpolate(frame, [40, 80], [0, 1], { ...clamp, easing: EASE }); // 夜の広がり
  const radius = night * 2300;
  const scatter = sp("move", frame - 46, fps);
  const text = sp("enter", frame - 74, fps);
  const name = sp("enter", frame - 92, fps);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <clipPath id="signoff-night"><circle cx={960} cy={HILL_TOP} r={radius} /></clipPath>
        </defs>
        {/* 紙の地の丘 */}
        <path d={hill} fill={C.paper2} />
        {/* 夜（丘のてっぺんから丸く広がる） */}
        <g clipPath="url(#signoff-night)">
          <rect width={1920} height={1080} fill={C.night} />
          <path d={hill} fill={NIGHT_HILL} />
        </g>
        {/* 100個の点 → 星 */}
        {dots.map((d, i) => {
          const appear = sp("enter", frame - i * 0.36, fps);
          if (appear <= 0) return null;
          const x = d.gx + (d.sx - d.gx) * scatter, y = d.gy + (d.sy - d.gy) * scatter;
          const tw = frame > 90 ? 0.75 + 0.25 * Math.sin(frame * 0.12 + d.tw) : 1;
          const r = (9 + (d.size - 9) * scatter) * appear * tw;
          return <circle key={i} data-qa-skip cx={x} cy={y} r={Math.max(0, r)} fill={mixHex(C.ink, STAR, night)} />;
        })}
      </svg>
      {/* 丘の上のゴサ（2026-10-05 オーナー「ゴサ猫が動いているイメージがよい」）。数えるあいだは点を指し、夜が来ると驚き、一文が出ると笑う。
          夜になったら白い体（dark）に替える。夜は丘のてっぺん（ゴサの足元）から広がるので、替わる瞬間は見えない */}
      {frame < 44
        ? <Gosa cues={[[0, "point"]]} size={150} x={960} foot={HILL_TOP + 46} sfx={false} reachTo={{ x: 900, y: 420 }} />
        : <Gosa cues={[[-60, "point"], [44, "surprised"], [76, "happy"]]} size={150} x={960} foot={HILL_TOP + 46} dark sfx={false} />}
      {/* 締めの一文とチャンネル名 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: text, transform: `translateY(${(1 - text) * 24}px)` }}>
        <div style={{ ...font("question", STAR), whiteSpace: "nowrap" }}>{SIGN_OFF}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", opacity: name }}>
        <span style={{ ...font("label", C.paper2), fontWeight: 900 }}>{CHANNEL_NAME}</span>
      </div>
      <Sfx name="tick" at={start + 2} volume={0.3} />
      <Sfx name="flip" at={start + 42} volume={0.4} />
    </AbsoluteFill>
  );
};
