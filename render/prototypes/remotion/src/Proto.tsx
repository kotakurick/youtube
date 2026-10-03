import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

const INK = "#1D2333";
const BG = "#F5F2EA";
const MALE = "#2F6FDE";
const FEMALE = "#D9541E";
const FONT = "'IPAGothic', sans-serif";

// 決まった乱数（毎回同じ結果になるように）
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Person = { id: number; male: boolean; x: number; y: number; pair: number | null; tx: number; ty: number };

const N = 120;
const PAIRS = 23; // 46人がペア＝約38%
const people: Person[] = (() => {
  const r = rng(7);
  const ps: Person[] = Array.from({ length: N }, (_, i) => ({
    id: i, male: i % 2 === 0, x: 140 + r() * 760, y: 280 + r() * 520, pair: null, tx: 0, ty: 0,
  }));
  const men = ps.filter((p) => p.male).sort(() => r() - 0.5);
  const women = ps.filter((p) => !p.male).sort(() => r() - 0.5);
  for (let k = 0; k < PAIRS; k++) {
    const col = k % 6, row = Math.floor(k / 6);
    const bx = 1060 + col * 110, by = 330 + row * 120;
    men[k].pair = k; women[k].pair = k;
    men[k].tx = bx; men[k].ty = by; women[k].tx = bx + 40; women[k].ty = by;
  }
  return ps;
})();

const Figure: React.FC<{ male: boolean; x: number; y: number; s?: number; o?: number }> = ({ male, x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o} fill={male ? MALE : FEMALE}>
    <circle cx={0} cy={-36} r={9} />
    {male ? <rect x={-10} y={-25} width={20} height={30} rx={8} />
      : <path d="M-9 -25 h18 q2 0 3 3 l3 24 q0 3 -3 3 h-24 q-3 0 -3 -3 l3 -24 q1 -3 3 -3 z" />}
  </g>
);

const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const lines: [number, number, string][] = [
    [0, 90, "1000人で婚活を始めたら、"],
    [90, 195, "人気は条件の上位に集中して、"],
    [195, 300, "ペアになれたのは、たった38%でした。"],
  ];
  const cur = lines.find(([a, b]) => frame >= a && frame < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", bottom: 46, width: "100%", textAlign: "center" }}>
      <span style={{ fontFamily: FONT, fontSize: 52, fontWeight: 700, color: "#fff", background: "rgba(29,35,51,.88)", padding: "10px 28px", borderRadius: 12 }}>
        {cur[2]}
      </span>
    </div>
  );
};

export const Proto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0〜2秒：問い
  const titleIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  // 2〜6秒：ペアができていく
  const matched = Math.round(interpolate(frame, [60, 180], [0, PAIRS], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  // 6〜8.5秒：棒グラフ
  const bar = interpolate(frame, [195, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const showChart = frame >= 190;
  const crowdFade = interpolate(frame, [185, 200], [1, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ゴサ：考え中 → 驚き
  const gosaIn = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const pop = spring({ frame: frame - 250, fps, config: { damping: 8 } });
  const gosaSrc = frame < 250 ? "gosa/thinking.svg" : "gosa/surprised.svg";

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", top: 60, left: 90, fontFamily: FONT, fontSize: 64, fontWeight: 700, color: INK, opacity: titleIn }}>
        1000人で婚活したら、何人がペアになる？
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {people.map((p) => {
          const k = p.pair;
          const start = k === null ? 0 : 60 + (k / PAIRS) * 110;
          const t = k === null ? 0 : spring({ frame: frame - start, fps, config: { damping: 18 } });
          const x = k === null ? p.x : p.x + (p.tx - p.x) * t;
          const y = k === null ? p.y : p.y + (p.ty - p.y) * t;
          return <Figure key={p.id} male={p.male} x={x} y={y} o={crowdFade * (k === null && frame > 150 ? 0.45 : 1)} />;
        })}
        <text x={1060} y={250} fontFamily={FONT} fontSize={40} fontWeight={700} fill={INK} opacity={crowdFade}>
          ペア成立：{matched}組
        </text>

        {showChart && (
          <g transform="translate(560,860)">
            {[{ label: "ペア成立", v: 0.38, c: INK }, { label: "相手が見つからない", v: 0.62, c: "#9A958C" }].map((b, i) => (
              <g key={b.label} transform={`translate(${i * 420},0)`}>
                <rect x={0} y={-520 * b.v * bar} width={260} height={520 * b.v * bar} rx={10} fill={b.c} />
                <text x={130} y={-520 * b.v * bar - 24} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={700} fill={INK} opacity={bar}>
                  {Math.round(b.v * 100 * bar)}%
                </text>
                <text x={130} y={50} textAnchor="middle" fontFamily={FONT} fontSize={36} fill={INK}>{b.label}</text>
              </g>
            ))}
            <line x1={-40} y1={0} x2={720} y2={0} stroke={INK} strokeWidth={4} />
          </g>
        )}
      </svg>

      {showChart && (
        <div style={{ position: "absolute", left: 90, bottom: 150, fontFamily: FONT, fontSize: 26, color: INK, opacity: 0.8 }}>
          出典：試作用の仮の数字（シミュレーション）
        </div>
      )}

      <Img src={staticFile(gosaSrc)} style={{
        position: "absolute", right: 70, bottom: 150, width: 300,
        transform: `translateY(${(1 - gosaIn) * 300}px) scale(${1 + 0.15 * pop - 0.15 * Math.min(pop, 1) * 0})`,
      }} />
      <Subtitle frame={frame} />
    </AbsoluteFill>
  );
};
