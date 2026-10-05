// 物語の場面のアニメーション（シミュレーションでない絵）。2026-10-05、オーナー「シミュレーションだけでなく、もっとリッチなアニメーションを」。
//   SwipeDeck   … スマホの中のプロフィールのカードが、次々と右（いいね）・左（見送り）へ飛ぶ
//   NotifStack  … スマホの上に「いいねが届きました」の通知が積もり、数が増えていく
//   Bubble      … 吹き出し（セリフ）。しっぽは話す人の頭へ
//   OfficeYears … 職場の早回し：年が進むにつれて、机の島から人が減り、宴会の札が消える
// どれも data-qa の印を付ける（画面のチェックで重なりを調べる）。色は theme.ts の C だけ。
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Kind } from "./Figure";
import { Desk } from "./Props";
import { Heart } from "./TownsSim";
import { C, EASE, font, LINE, R, sp } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** スマホの枠（原点＝中心）。中身は children（スマホの画面の座標：左上が 0,0、幅 w-24・高さ h-60） */
const PhoneFrame: React.FC<{ x: number; y: number; h: number; children?: React.ReactNode; label?: string }> = ({ x, y, h, children, label = "スマホ" }) => {
  const w = h * 0.52;
  return (
    <g data-qa="prop" data-qa-label={label} transform={`translate(${x - w / 2},${y - h / 2})`}>
      <rect width={w} height={h} rx={w * 0.14} fill={C.ink} />
      <rect x={12} y={30} width={w - 24} height={h - 60} rx={8} fill={C.white} />
      <svg x={12} y={30} width={w - 24} height={h - 60} overflow="hidden">{children}</svg>
    </g>
  );
};

/** プロフィールのカード（人の顔の丸と2本の線）。kind で色を変える */
const Card: React.FC<{ w: number; h: number; kind: Kind }> = ({ w, h, kind }) => (
  <g>
    <rect width={w} height={h} rx={14} fill={C.paper2} stroke={C.ink} strokeWidth={3} />
    <circle cx={w / 2} cy={h * 0.36} r={w * 0.22} fill={kind === "female" ? C.femaleTint : C.maleTint} />
    <rect x={w * 0.18} y={h * 0.68} width={w * 0.64} height={12} rx={6} fill={C.ink2} />
    <rect x={w * 0.28} y={h * 0.78} width={w * 0.44} height={10} rx={5} fill={C.rest} />
  </g>
);

/**
 * スワイプし続けるスマホ。every フレームごとに1枚飛ぶ。pattern の true は右（いいね・ハート）、false は左（見送り・×）。
 * count を付けると、画面の下に「いいね N」の数が出る。
 */
export const SwipeDeck: React.FC<{ x: number; y: number; h?: number; every?: number; start?: number; kind?: Kind; pattern?: boolean[]; count?: boolean }> = (
  { x, y, h = 520, every = 18, start = 0, kind = "female", pattern = [true, true, false, true, true, true, false, true], count = true },
) => {
  const frame = useCurrentFrame() - start;
  const w = h * 0.52 - 24, sh = h - 60;
  const cw = w * 0.84, ch = sh * 0.7, cx = (w - cw) / 2, cy = sh * 0.08;
  const k = Math.max(0, Math.floor(frame / every)); // 何枚目が飛んでいるか
  const u = frame < 0 ? 0 : (frame % every) / every;
  const right = pattern[k % pattern.length];
  const likes = frame < 0 ? 0 : Array.from({ length: k + (u > 0.5 ? 1 : 0) }, (_, i) => pattern[i % pattern.length]).filter(Boolean).length;
  const fly = interpolate(u, [0.25, 0.75], [0, 1], { ...clamp, easing: EASE });
  return (
    <>
      <PhoneFrame x={x} y={y} h={h}>
        {/* 下の1枚（次のカード） */}
        <g transform={`translate(${cx},${cy})`}><Card w={cw} h={ch} kind={kind} /></g>
        {/* いま飛ぶカード */}
        <g transform={`translate(${cx + (right ? 1 : -1) * fly * w * 1.2},${cy - fly * 30}) rotate(${(right ? 1 : -1) * fly * 18} ${cw / 2} ${ch})`}>
          <Card w={cw} h={ch} kind={kind} />
        </g>
        {/* 下のボタン（× と ハート）。押した方が少し大きくなる */}
        <g transform={`translate(${w / 2 - 70},${sh * 0.88})`}>
          <circle r={30 * (!right && u > 0.2 && u < 0.5 ? 1.15 : 1)} fill={C.white} stroke={C.ink} strokeWidth={3} />
          <path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke={C.ink2} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g transform={`translate(${w / 2 + 70},${sh * 0.88})`}>
          <circle r={30 * (right && u > 0.2 && u < 0.5 ? 1.15 : 1)} fill={C.white} stroke={C.ink} strokeWidth={3} />
          <Heart x={0} y={2} r={16} fill={C.female} />
        </g>
      </PhoneFrame>
      {count && (
        <text x={x} y={y + h / 2 + 56} textAnchor="middle" style={font("label")} data-qa="label" data-qa-label="いいねの数">{`送ったいいね ${likes}`}</text>
      )}
    </>
  );
};

/** 通知が積もるスマホ。every フレームごとに1件。上に新しい通知が入り、古いものは下へ押し出される */
export const NotifStack: React.FC<{ x: number; y: number; h?: number; every?: number; start?: number; max?: number; from?: Kind }> = (
  { x, y, h = 520, every = 10, start = 0, max = 15, from = "male" },
) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  const w = h * 0.52 - 24;
  const n = frame < 0 ? 0 : Math.min(max, Math.floor(frame / every) + 1);
  const rowH = 64;
  return (
    <>
      <PhoneFrame x={x} y={y} h={h} label="スマホ（通知）">
        {Array.from({ length: n }, (_, i) => {
          const age = n - 1 - i; // 0＝いちばん新しい
          const t = sp("enter", frame - i * every, fps);
          const top = 14 + age * rowH;
          return (
            <g key={i} transform={`translate(10,${top - (1 - t) * 30})`} opacity={t}>
              <rect width={w - 20} height={rowH - 10} rx={12} fill={C.paper2} />
              <Heart x={28} y={(rowH - 10) / 2} r={14} fill={from === "male" ? C.male : C.female} />
              <rect x={56} y={14} width={(w - 20) * 0.55} height={10} rx={5} fill={C.ink2} />
              <rect x={56} y={32} width={(w - 20) * 0.35} height={8} rx={4} fill={C.rest} />
            </g>
          );
        })}
      </PhoneFrame>
      {/* 未読の数の札（スマホの右上） */}
      {n > 0 && (
        <g data-qa="label" data-qa-label="未読の数" transform={`translate(${x + (w + 24) / 2 - 6},${y - h / 2 + 8})`}>
          <circle r={34} fill={C.female} />
          <text y={12} textAnchor="middle" style={{ ...font("label", C.white), fontWeight: 900 }}>{n}</text>
        </g>
      )}
    </>
  );
};

/** 吹き出し（左上を x,y に置く）。tail は話す人の口のあたり（画面の座標） */
export const Bubble: React.FC<{ x: number; y: number; text: string; tail: [number, number]; start?: number; role?: "sub" | "label" }> = (
  { x, y, text, tail, start = 0, role = "sub" },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  if (frame < start) return null;
  const fs = role === "sub" ? 54 : 40;
  const w = text.length * fs + 64, h = fs + 40;
  const bx = x + w * 0.3;
  return (
    <g opacity={t} transform={`translate(0,${(1 - t) * 12})`}>
      <path d={`M${bx - 24} ${y + h - 4} L${tail[0]} ${tail[1]} L${bx + 24} ${y + h - 4} Z`} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <rect x={bx - 22} y={y + h - 8} width={44} height={10} fill={C.white} />
      <text x={x + w / 2} y={y + h / 2 + fs * 0.36} textAnchor="middle" style={font(role)}>{text}</text>
    </g>
  );
};

/**
 * 職場の早回し。years の年が順に出て、年ごとに机の島から人が減る（seated＝その年に座っている人の割合）。
 * party が true の年は、天井から「歓迎会」の札が下がる（職場の行事）。
 */
export const OfficeYears: React.FC<{
  years: { year: string; seated: number; party?: boolean; note?: string }[]; start?: number; per?: number; floor?: number;
}> = ({ years, start = 0, per = 60, floor = 800 }) => {
  const frame = useCurrentFrame() - start;
  const k = Math.max(0, Math.min(years.length - 1, Math.floor(frame / per)));
  const cur = years[k];
  const u = interpolate(frame - k * per, [0, 20], [0, 1], clamp);
  const prevSeated = k > 0 ? years[k - 1].seated : cur.seated;
  const seated = prevSeated + (cur.seated - prevSeated) * u;
  const cols = 6, rows = 2, size = 2.2;
  const seats = Array.from({ length: cols * rows }, (_, i) => ({ x: 360 + (i % cols) * 230, y: floor - 40 - Math.floor(i / cols) * 210, i }));
  // 人が減る順は決めておく（毎回同じ）
  const order = [3, 8, 0, 11, 5, 9, 1, 6, 10, 2, 7, 4];
  const n = Math.round(seated * seats.length);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={0} x2={1920} y1={floor} y2={floor} stroke={C.ink} strokeWidth={LINE.thin} />
        {seats.map((s) => {
          const here = order.indexOf(s.i) >= seats.length - n;
          return (
            <g key={s.i}>
              <Desk x={s.x + 60} y={s.y} size={size} w={56} />
              {here && <Figure kind={s.i % 2 ? "female" : "male"} x={s.x} y={s.y} size={size} pose="sit" facing={1} />}
            </g>
          );
        })}
        {cur.party && (
          <g opacity={u} data-qa="prop" data-qa-label="歓迎会の札">
            <path d="M600 220 Q960 280 1320 220" fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={`M${640 + i * 110} ${232 + Math.sin((i / 6) * Math.PI) * 26} l30 0 l-15 34 z`} fill={i % 2 ? C.male : C.female} />
            ))}
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", left: 96, top: 200, ...font("hero"), lineHeight: 1 }}>{cur.year}</div>
      {cur.note && <div style={{ position: "absolute", left: 96, top: 420, ...font("label", C.ink2), opacity: u }}>{cur.note}</div>}
    </>
  );
};
