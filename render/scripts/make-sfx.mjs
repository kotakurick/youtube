// 効果音をコードで作る（他人の音源を使わない。毎回同じ音になる）。npm run sync から呼ばれ、public/sfx/*.wav を書く。
// 決まり（docs/brand.md）：0.5秒以下、表情ごとに1つ、鳴き声は使わない。判定は「刻み → 無音 → 打撃 → 印ごとの余韻」。
import fs from "fs";
import path from "path";

const RATE = 44100;
const TAU = Math.PI * 2;

// 決まった乱数（ノイズ用）
let seed = 12345;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

const buf = (secs) => new Float32Array(Math.round(secs * RATE));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d)); // 立ち上がり a 秒、減衰の速さ d

/** 周波数が f(t) で変わる音を足す */
const tone = (out, at, secs, f, { amp = 0.5, a = 0.005, d = 0.1, shape = "sine" } = {}) => {
  let ph = 0;
  const n0 = Math.round(at * RATE);
  for (let i = 0; i < secs * RATE && n0 + i < out.length; i++) {
    const t = i / RATE;
    ph += (TAU * (typeof f === "function" ? f(t) : f)) / RATE;
    const s = shape === "tri" ? (2 / Math.PI) * Math.asin(Math.sin(ph)) : Math.sin(ph);
    out[n0 + i] += s * amp * env(t, a, d);
  }
};
const hiss = (out, at, secs, { amp = 0.3, d = 0.02, tint = 0.5 } = {}) => {
  const n0 = Math.round(at * RATE);
  let lp = 0;
  for (let i = 0; i < secs * RATE && n0 + i < out.length; i++) {
    lp += (noise() - lp) * tint; // tint が小さいほどこもった音
    out[n0 + i] += lp * amp * env(i / RATE, 0.001, d);
  }
};
const bell = (out, at, f, amp = 0.35, d = 0.25) => {
  tone(out, at, 0.6, f, { amp, d });
  tone(out, at, 0.6, f * 2.01, { amp: amp * 0.4, d: d * 0.6 });
  tone(out, at, 0.6, f * 3.02, { amp: amp * 0.2, d: d * 0.4 });
};

const SOUNDS = {
  // ゴサ
  "gosa-surprised": () => { const o = buf(0.3); tone(o, 0, 0.3, (t) => 420 + 900 * Math.min(1, t / 0.12), { d: 0.08, shape: "tri" }); return o; },
  "gosa-assertive": () => { const o = buf(0.12); hiss(o, 0, 0.03, { amp: 0.5, d: 0.004, tint: 0.9 }); tone(o, 0, 0.1, 2100, { amp: 0.35, d: 0.015 }); return o; },
  "gosa-depends": () => { const o = buf(0.5); tone(o, 0, 0.5, (t) => 720 - 420 * Math.min(1, t / 0.45) + 18 * Math.sin(TAU * 9 * t), { d: 0.25, shape: "tri", amp: 0.4 }); return o; },
  "gosa-skeptical": () => { const o = buf(0.4); tone(o, 0, 0.12, 820, { d: 0.03, amp: 0.45 }); tone(o, 0.16, 0.22, (t) => 600 + 500 * t, { d: 0.05, amp: 0.4 }); return o; },
  "gosa-idea": () => { const o = buf(0.5); bell(o, 0, 1318); bell(o, 0.07, 1976, 0.25); return o; },
  "gosa-panic": () => { const o = buf(0.4); tone(o, 0, 0.4, (t) => 640 + 40 * Math.sin(TAU * 22 * t), { d: 0.2, amp: 0.35, shape: "tri" }); return o; },
  // 章の合図（短い2音。チャンネルの合図）
  signal: () => { const o = buf(0.5); bell(o, 0, 784, 0.35, 0.18); bell(o, 0.12, 1175, 0.35, 0.25); return o; },
  // 判定：1.5秒の刻み（だんだん速く）
  roll: () => {
    const o = buf(1.5);
    let t = 0, gap = 0.16;
    while (t < 1.45) { hiss(o, t, 0.06, { amp: 0.35, d: 0.015, tint: 0.35 }); tone(o, t, 0.05, 190, { amp: 0.2, d: 0.02 }); t += gap; gap = Math.max(0.045, gap * 0.86); }
    return o;
  },
  hit: () => { const o = buf(0.5); tone(o, 0, 0.5, (t) => 120 - 60 * Math.min(1, t / 0.2), { amp: 0.9, a: 0.002, d: 0.12 }); hiss(o, 0, 0.12, { amp: 0.45, d: 0.03, tint: 0.25 }); return o; },
  "verdict-o": () => { const o = buf(0.5); [1047, 1319, 1568].forEach((f, i) => bell(o, i * 0.06, f, 0.28, 0.25)); return o; },
  "verdict-tri": () => { const o = buf(0.5); bell(o, 0, 988, 0.3, 0.2); bell(o, 0.16, 784, 0.3, 0.22); return o; },
  "verdict-x": () => { const o = buf(0.5); tone(o, 0, 0.5, 220, { amp: 0.45, d: 0.18, shape: "tri" }); tone(o, 0, 0.5, 330, { amp: 0.15, d: 0.12 }); return o; },
};

const wav = (data) => {
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0.89 ? 0.89 / peak : 1; // -1 dBTP より下に
  const b = Buffer.alloc(44 + data.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data.length * 2, 4); b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * g)) * 32767), 44 + i * 2));
  return b;
};

export const makeSfx = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, make] of Object.entries(SOUNDS)) fs.writeFileSync(path.join(dir, `${name}.wav`), wav(make()));
  return Object.keys(SOUNDS).length;
};
