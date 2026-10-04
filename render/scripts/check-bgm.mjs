// BGM の曲を数字で確かめる（耳で選んだあとの確認用。良し悪しの判断はしない）。
// 使い方：npm run bgm            … $YT_DATA_DIR/bgm/（未設定なら _local/bgm/）の曲をすべて測る
//         npm run bgm -- --voice -17   … 声の大きさ（LUFS）を指定する（省くと各回の音声から測る）
//
// 測るもの：長さ、音量（LUFS）、ピーク（音割れ）、途中の無音、終わりのフェードアウト（ループの切れ目）、
//          テンポの目安（BPM）、声の聞き取りに効く帯域（1〜4kHz）の強さ（声とぶつかりやすさの目安）。
// 書き出すもの：
//   - <bgm>/levels.json  … 曲ごとの音量の直し（dB）。npm run sync で public/bgm/ に写り、Episode が自動で使う
//                          （どの曲も、声の下で約19dB小さく聞こえるようにそろえる）
//   - research/bgm.md    … 結果の表（Git に入れて、別のパソコンの Claude と共有する）
// ffmpeg は Remotion に入っているもの（npx remotion ffmpeg）を使うので、別に入れなくてよい。
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const render = process.cwd();
const repo = path.resolve(render, "..");
const dataDir = process.env.YT_DATA_DIR || path.join(repo, "_local");
const bgmDir = path.join(dataDir, "bgm");
const AUDIO = /\.(mp3|wav|m4a|aac|ogg|opus|flac)$/i;
const UNDER_VOICE_DB = 20 * Math.log10(0.11); // Episode の声の下の音量（約 -19dB）
const DEFAULT_VOICE = -18;                    // 声の音声がないときの仮の大きさ（LUFS）

const ffmpeg = (args, opts = {}) => spawnSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-nostats", ...args],
  { shell: process.platform === "win32", maxBuffer: 512 * 1024 * 1024, ...opts });

/** 音量（LUFS）・ピーク（dBTP）・幅（LRA）。loudnorm の測定だけ使う */
const loudness = (file) => {
  const r = ffmpeg(["-i", file, "-af", "loudnorm=I=-23:TP=-2:print_format=json", "-f", "null", "-"]);
  const err = r.stderr.toString();
  const m = err.match(/\{[^{}]*"input_i"[^{}]*\}/);
  if (!m) throw new Error(`音量を測れませんでした：${file}\n${err.slice(-400)}`);
  const j = JSON.parse(m[0]);
  return { lufs: Number(j.input_i), peak: Number(j.input_tp), lra: Number(j.input_lra) };
};

/** 途中の無音（-50dB 以下が1秒以上）。頭と終わりの無音は除く */
const silences = (file, dur) => {
  const err = ffmpeg(["-i", file, "-af", "silencedetect=noise=-50dB:d=1", "-f", "null", "-"]).stderr.toString();
  const out = [];
  const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
  for (let m; (m = re.exec(err));) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a > 0.5 && b < dur - 0.5) out.push([a, b]);
  }
  return out;
};

const SR = 11025;
/** モノラル・11025Hz に落とした波形（一時ファイルの wav を経由する。Remotion の ffmpeg は生の波形を書き出せないため） */
const pcm = (file) => {
  const tmp = path.join(os.tmpdir(), `bgm-check-${process.pid}.wav`);
  const r = ffmpeg(["-y", "-i", file, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", tmp]);
  if (r.status !== 0) throw new Error(`曲を読めませんでした：${file}\n${r.stderr.toString().slice(-400)}`);
  const b = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  // wav の "data" の塊を探す
  let p = 12;
  while (p + 8 <= b.length && b.toString("ascii", p, p + 4) !== "data") p += 8 + b.readUInt32LE(p + 4);
  const start = p + 8, n = Math.floor((b.length - start) / 2);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(start + i * 2) / 32768;
  return x;
};

/** 高速フーリエ変換（その場で。re, im は長さ 2 のべき乗） */
const fft = (re, im) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
};

/** 波形から：声の帯域の強さ、テンポの目安、終わりのフェード */
const analyze = (x) => {
  const N = 1024, HOP = 220, fps = SR / HOP;
  const win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  const bin = (hz) => Math.round((hz * N) / SR);
  const [b60, b1k, b4k, bTop] = [bin(60), bin(1000), bin(4000), bin(5400)];
  let pAll = 0, pVoice = 0;
  const flux = [];
  let prev = null;
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let s = 0; s + N <= x.length; s += HOP) {
    for (let i = 0; i < N; i++) { re[i] = x[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float64Array(N / 2);
    let f = 0;
    for (let k = b60; k < bTop; k++) {
      const p = re[k] * re[k] + im[k] * im[k];
      pAll += p; if (k >= b1k && k < b4k) pVoice += p;
      mag[k] = Math.log1p(1000 * Math.sqrt(p));
      if (prev) f += Math.max(0, mag[k] - prev[k]);
    }
    flux.push(f);
    prev = mag;
  }
  // テンポ：音の立ち上がりの強さの自己相関。60〜180 BPM の中で、110 前後を少しだけ優先する
  const mean = flux.reduce((a, b) => a + b, 0) / flux.length;
  const o = flux.map((v) => v - mean);
  const ac = (lag) => { let s = 0; for (let i = lag; i < o.length; i++) s += o[i] * o[i - lag]; return s / (o.length - lag); };
  const ac0 = ac(0) || 1;
  let best = { score: -Infinity, lag: 0, r: 0 };
  const lo = Math.floor((fps * 60) / 180), hi = Math.ceil((fps * 60) / 60);
  const acs = [];
  for (let lag = lo - 1; lag <= hi + 1; lag++) acs[lag] = ac(lag) / ac0;
  for (let lag = lo; lag <= hi; lag++) {
    if (!(acs[lag] >= acs[lag - 1] && acs[lag] >= acs[lag + 1])) continue;
    const bpm = (fps * 60) / lag;
    const score = acs[lag] * Math.exp(-0.5 * (Math.log2(bpm / 110) / 0.9) ** 2);
    if (score > best.score) best = { score, lag, r: acs[lag] };
  }
  let bpm = null;
  if (best.lag) {
    const [a, b, c] = [acs[best.lag - 1], acs[best.lag], acs[best.lag + 1]];
    const d = a - 2 * b + c ? (0.5 * (a - c)) / (a - 2 * b + c) : 0; // 山の頂点をなめらかに
    bpm = (fps * 60) / (best.lag + d);
  }
  // 終わりのフェード：最後の3秒の大きさと、曲全体のふつうの大きさ（1秒ごとの中央値）の差
  const rmsDb = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return 10 * Math.log10(s / Math.max(1, b - a) + 1e-12); };
  const secs = [];
  for (let s = 0; s + SR <= x.length; s += SR) secs.push(rmsDb(s, s + SR));
  const median = [...secs].sort((a, b) => a - b)[Math.floor(secs.length / 2)] ?? -99;
  const tail = rmsDb(Math.max(0, x.length - 3 * SR), x.length) - median;
  const head = rmsDb(0, Math.min(x.length, SR)) - median;
  return { voiceBand: pVoice / (pAll || 1), bpm, beat: best.r, tail, head };
};

/** 声の大きさ：各回の音声（$YT_DATA_DIR/episodes/<回>/audio/*.wav）の中央値 */
const voiceLevel = () => {
  const i = process.argv.indexOf("--voice");
  if (i > 0) return { lufs: Number(process.argv[i + 1]), from: "指定" };
  const epRoot = path.join(dataDir, "episodes");
  const vals = [];
  if (fs.existsSync(epRoot)) {
    for (const ep of fs.readdirSync(epRoot)) {
      const dir = path.join(epRoot, ep, "audio");
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter((f) => AUDIO.test(f)).slice(0, 8)) {
        const l = loudness(path.join(dir, f)).lufs;
        if (Number.isFinite(l) && l > -50) vals.push(l); // 無音の仮の音声は除く
      }
    }
  }
  if (!vals.length) return { lufs: DEFAULT_VOICE, from: `仮（声の音声がまだないので ${DEFAULT_VOICE} LUFS とした）` };
  vals.sort((a, b) => a - b);
  return { lufs: vals[Math.floor(vals.length / 2)], from: `各回の音声 ${vals.length} 本の中央値` };
};

const files = fs.existsSync(bgmDir) ? fs.readdirSync(bgmDir).filter((f) => AUDIO.test(f)).sort() : [];
if (!files.length) {
  console.error(`曲が見つかりません：${bgmDir}\n（mp3・wav・m4a などを置いてください。YT_DATA_DIR を設定しているときはその中の bgm/）`);
  process.exit(1);
}

const voice = voiceLevel();
console.log(`声の大きさ：${voice.lufs.toFixed(1)} LUFS（${voice.from}）`);
const rows = [];
for (const f of files) {
  process.stdout.write(`測っています：${f} … `);
  const file = path.join(bgmDir, f);
  const x = pcm(file);
  const dur = x.length / SR;
  const l = loudness(file);
  const a = analyze(x);
  const sil = silences(file, dur);
  // 声の下で「声より約19dB小さい」になるように、曲の大きさを声にそろえる（上げすぎ・下げすぎは ±12dB まで）
  const gain = Math.max(-12, Math.min(12, voice.lufs - l.lufs));
  const notes = [];
  if (l.peak > -0.1) notes.push("音割れの恐れ（ピークが 0dB 近く）");
  if (sil.length) notes.push(`途中に無音 ${sil.map(([s, e]) => `${s.toFixed(0)}〜${e.toFixed(0)}秒`).join("・")}`);
  if (a.tail < -10) notes.push(`終わりがフェードアウト（${a.tail.toFixed(0)}dB）。場面が曲より長いとループの切れ目で一度静かになる`);
  if (dur < 120) notes.push("2分未満（長い場面ではループが目立ちやすい）");
  if (a.beat < 0.1) notes.push("拍がはっきりしない（テンポの目安は当てにならない）");
  else if (a.bpm && (a.bpm < 80 || a.bpm > 120)) notes.push(`テンポの目安が ${a.bpm.toFixed(0)}（決まりは90〜110。倍・半分に聞こえる曲もあるので耳で確かめる）`);
  if (Math.abs(voice.lufs - l.lufs) > 12) notes.push("音量の差が大きく、直しを ±12dB で止めた");
  rows.push({ file: f, dur, ...l, ...a, gain, notes });
  console.log("済み");
}

// 声の帯域の強さは曲どうしで比べる（絶対の基準はないので、いちばん強い曲に印を付ける）
const maxBand = Math.max(...rows.map((r) => r.voiceBand));
for (const r of rows) if (rows.length > 1 && r.voiceBand === maxBand) r.notes.push("声の帯域（1〜4kHz）がこの中でいちばん強い。声の下で聞き取りにくくならないか確かめる");

const levels = Object.fromEntries(rows.map((r) => [r.file, { gainDb: Number(r.gain.toFixed(1)), lufs: Number(r.lufs.toFixed(1)) }]));
fs.writeFileSync(path.join(bgmDir, "levels.json"), JSON.stringify({ voiceLufs: Number(voice.lufs.toFixed(1)), files: levels }, null, 2) + "\n");

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const md = [
  "# BGM の測定結果",
  "",
  `\`render/scripts/check-bgm.mjs\`（\`npm run bgm\`）の出力。${new Date().toISOString().slice(0, 10)}、${rows.length}曲。`,
  "耳での良し悪しは測らない。数字は目安（テンポと声の帯域は特に）。",
  "",
  `- 声の大きさ：${voice.lufs.toFixed(1)} LUFS（${voice.from}）`,
  `- 直し：曲の大きさを声にそろえる（Episode が声の下で ${UNDER_VOICE_DB.toFixed(1)}dB 下げるので、声より約19dB小さく聞こえる）。\`levels.json\` に書き、Episode が自動で使う`,
  "",
  "| 曲 | 長さ | 音量 LUFS | ピーク dBTP | 幅 LU | 直し dB | テンポの目安 | 声の帯域 | 気になる点 |",
  "|---|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.file} | ${mmss(r.dur)} | ${r.lufs.toFixed(1)} | ${r.peak.toFixed(1)} | ${r.lra.toFixed(1)} | ${r.gain >= 0 ? "+" : ""}${r.gain.toFixed(1)} | ${r.bpm && r.beat >= 0.1 ? r.bpm.toFixed(0) : "―"} | ${(r.voiceBand * 100).toFixed(0)}% | ${r.notes.join("／") || "なし"} |`),
  "",
  "- 音量 LUFS：曲全体の聞こえの大きさ。曲どうしの差は「直し」で自動でそろう",
  "- 幅 LU：静かな所と大きな所の差。大きい（10以上）と、声の下で急に大きくなる所がある",
  "- 声の帯域：1〜4kHz（言葉の聞き取りに効く高さ）が全体に占める割合。曲どうしで比べる",
  "",
].join("\n");
const out = path.join(repo, "research", "bgm.md");
fs.writeFileSync(out, md);
console.log("\n" + md);
console.log(`書き出しました：${path.join(bgmDir, "levels.json")}、${out}`);
