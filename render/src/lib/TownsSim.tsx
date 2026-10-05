// 「紹介の町」と「アプリの町」の描画。計算は sim/towns.ts（純粋な関数）で、ここは結果を群衆の動きにするだけ。
//   Town       … 町を1か月ずつ動かす。左が町、右が「ペア」の置き場。ペアになった2人が右へ歩いて並ぶ。
//                紹介の町は知り合いの輪（薄い円）と、引き合わせの線（成立＝墨の実線、不成立＝点線）。
//                アプリの町は全員がばらばらに立ち、いいねのハートが送った人から受けた人へ飛ぶ。
//   HeartRows  … アプリの町の人を、受け取ったいいねの多い順に男女2列に並べ直し、頭の上にハートを積む（ハートの山）。
//   PairPanel  … 100人を10×10に並べ、ペアになった人だけ色を付ける（「もしも」の比べ合い）。
// 人の大きさは、名札（22px×1.25倍×size）が28px以上になるよう、名札を出すときは size 1.05 以上にする。
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Crowd, Person } from "./Crowd";
import { Figure, kindColor } from "./Figure";
import { FOOT, GAP, Pt, scatter } from "./layout";
import type { Resident, TownResult } from "./sim/towns";
import { C, EASE, font, LINE, R, sp } from "./theme";

export type Box = { x: number; y: number; w: number; h: number };
export type Tag = { id: number; label: string };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** ハート（原点＝中心、幅は約 2r） */
export const Heart: React.FC<{ x: number; y: number; r?: number; fill?: string; stroke?: string; opacity?: number }> = (
  { x, y, r = 10, fill = C.female, stroke, opacity = 1 },
) => (
  <path transform={`translate(${x},${y}) scale(${r / 11})`} opacity={opacity}
    d="M0 9 C-14 0 -12 -12 -4 -10.5 C-1.5 -10 0 -8 0 -6.5 C0 -8 1.5 -10 4 -10.5 C12 -12 14 0 0 9 Z"
    fill={fill} stroke={stroke} strokeWidth={stroke ? 2 : 0} />
);

/** 知り合いの輪（楕円）の横・縦の半径。輪の中は5人ずつ上下2列 */
const ringDx = (size: number) => (FOOT.w + GAP) * size * 1.15;
const ringDy = (size: number) => (FOOT.top + FOOT.bottom + GAP) * size * 1.15;
const ringRx = (size: number) => 2 * ringDx(size) + (FOOT.w / 2 + 12) * size;
const ringRy = (size: number) => ringDy(size) / 2 + 41 * size;

/** 町の中の家の位置。紹介の町は輪ごとに円く、アプリの町はばらばら */
export const homes = (res: TownResult, box: Box, size: number, seed = 5) => {
  if (res.town === "app") {
    // 位置は住人の id で引く（町の一部だけの住人でも使えるように）
    const sc = scatter(res.residents.length, box, seed, size);
    const pts: Pt[] = [];
    res.residents.forEach((a, i) => { pts[a.id] = sc[i]; });
    return { pts, rings: [] as { cx: number; cy: number; r: number }[] };
  }
  const nc = Math.max(...res.residents.map((a) => a.circle)) + 1;
  // 輪の大きさから、横に何個並ぶかを決める（狭い箱なら段を増やす）。輪は蛇行して並び、隣どうしがつながる
  const ringW = 2 * ringRx(size) + 4 * size, ringH = 2 * ringRy(size) + 10 * size;
  const cols = Math.max(1, Math.min(nc, Math.floor(box.w / ringW))), nrows = Math.ceil(nc / cols);
  if (nrows * ringH > box.h) throw new Error(`TownsSim: 知り合いの輪が箱に入りません（${nrows}段×${Math.round(ringH)}px > ${box.h}px）。size を小さくするか箱を広げてください。`);
  const cw = box.w / cols, ch = box.h / nrows;
  const rings = Array.from({ length: nc }, (_, c) => {
    const row = Math.floor(c / cols), k = c % cols, col = row % 2 === 0 ? k : cols - 1 - k;
    return { cx: box.x + cw * (col + 0.5), cy: box.y + ch * (row + 0.5), r: (FOOT.w + GAP) * size * 1.15 * 2.5 };
  });
  const members = rings.map((_, c) => res.residents.filter((a) => a.circle === c));
  const pts: Pt[] = [];
  // 輪の中は、男女が交互になるように上下2列に並ぶ（テーブルを囲むように）
  const dx = ringDx(size), dy = ringDy(size);
  members.forEach((ms, c) => {
    const { cx, cy } = rings[c];
    const m = ms.filter((a) => a.kind === "male"), f = ms.filter((a) => a.kind === "female");
    const alt: Resident[] = [];
    for (let i = 0; i < Math.max(m.length, f.length); i++) { if (m[i]) alt.push(m[i]); if (f[i]) alt.push(f[i]); }
    const per = Math.ceil(alt.length / 2);
    alt.forEach((a, i) => {
      const row = Math.floor(i / per), col = i % per;
      pts[a.id] = { x: cx + (col - (per - 1) / 2) * dx, y: cy + (row - 0.5) * dy + FOOT.top * size * 0.5 };
    });
  });
  return { pts, rings };
};

/** ペアの置き場：k 組目の2人の位置 */
const pairSlots = (box: Box, size: number, n: number) => {
  const off = (FOOT.w * size + 4) / 2;
  const slotW = 2 * off + FOOT.w * size + GAP * size * 2.2, slotH = (FOOT.top + FOOT.bottom + GAP) * size * 1.12;
  const cols = Math.max(1, Math.floor(box.w / slotW)), rows = Math.max(1, Math.floor(box.h / slotH));
  if (n > cols * rows) throw new Error(`TownsSim: ペアの置き場が足りません（${n}組に対して ${cols * rows} か所）。`);
  return (k: number): [Pt, Pt] => {
    const x = box.x + slotW / 2 + (k % cols) * slotW, y = box.y + (FOOT.top + GAP / 2) * size + Math.floor(k / cols) * slotH;
    return [{ x: x - off, y }, { x: x + off, y }];
  };
};

/** 各月の位置（0か月目＝全員が家） */
const useStates = (res: TownResult, town: Box, pairs: Box | null, size: number) => useMemo(() => {
  const { pts, rings } = homes(res, town, size);
  if (!pairs) return { states: [pts, ...res.months.map(() => pts)], rings }; // ペアの置き場なし（始まる前の町だけを見せる）
  const slot = pairSlots(pairs, size, res.final.pairs.length);
  const states: Pt[][] = [pts];
  for (const m of res.months) {
    const pos = [...pts];
    m.pairs.forEach(([a, b], k) => { const [s1, s2] = slot(k); pos[a] = s1; pos[b] = s2; });
    states.push(pos);
  }
  return { states, rings };
}, [res, town.x, town.y, town.w, town.h, pairs?.x, pairs?.y, pairs?.w, pairs?.h, size]);

/**
 * 町を1か月ずつ動かす。start から fpm フレームごとに1か月進み、upto か月目で止まる（at を付けると、その月で止めた絵）。
 * 1か月の前半に出来事（引き合わせの線・飛ぶハート）、後半にペアになった2人が右へ歩く。
 */
export const Town: React.FC<{
  result: TownResult; box: Box; size?: number; start?: number; fpm?: number; upto?: number; at?: number;
  title?: string; tags?: Tag[]; events?: boolean; maxHearts?: number; split?: number; dimSingles?: boolean;
  compact?: boolean; // 見出しに「何か月目」を出さない（2つの町を並べるとき）
}> = ({ result, box, size = 1.05, start = 0, fpm = 75, upto = 12, at, title, tags = [], events = true, maxHearts = 40, split = 0.66, dimSingles = false, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = 104; // 見出し（町の名前・ペアの数）。追う人の輪が見出しにかからない高さ
  const noPairs = split >= 0.99; // split=1 なら町だけ（ペアの置き場を描かない）
  const town: Box = { x: box.x, y: box.y + head, w: noPairs ? box.w : box.w * split - 24, h: box.h - head };
  const pairs: Box = { x: box.x + box.w * split + 24, y: box.y + head, w: box.w * (1 - split) - 24, h: box.h - head };
  const { states, rings } = useStates(result, town, noPairs ? null : pairs, size);
  const el = frame - start;
  const fixed = at !== undefined;
  const m = fixed ? at : Math.max(0, Math.min(upto, el < 0 ? 0 : Math.floor(el / fpm) + 1)); // いまの月（0＝始まる前）
  const u = fixed ? 1 : el < 0 ? 0 : m >= upto && el >= upto * fpm ? 1 : (el % fpm) / fpm; // 月の中の進み（0〜1）
  const moveAt = start + (m - 1) * fpm + Math.round(fpm * 0.45);
  const tagOf = new Map(tags.map((t) => [t.id, t.label]));
  const paired = new Set(m > 0 ? result.months[m - 1].pairs.flat() : []);
  const people: Person[] = result.residents.map((a) => ({
    kind: a.kind, from: states[Math.max(0, m - 1)][a.id], to: fixed ? undefined : states[m][a.id],
    delay: Math.round((a.id % 20) * 0.6), highlight: tagOf.has(a.id), label: tagOf.get(a.id),
    dim: dimSingles && m >= upto && !paired.has(a.id) && !tagOf.has(a.id),
  }));
  const shown = fixed ? states[m] : states[m]; // 出来事の線は家の位置どうしで引く
  const month = m > 0 ? result.months[m - 1] : null;
  const pairsNow = !month ? 0 : fixed ? month.pairs.length
    : Math.round((m > 1 ? result.months[m - 2].pairs.length : 0) + month.newPairs.length * interpolate(frame - moveAt, [0, 24], [0, 1], clamp));
  const ev = !fixed && events && month && u < 0.62 ? interpolate(u, [0.02, 0.4], [0, 1], { ...clamp, easing: EASE }) : 0;
  const evFade = interpolate(u, [0.5, 0.62], [1, 0], clamp);
  const home = states[0];
  return (
    <>
      {/* 見出し：町の名前・何か月目・ペアの数 */}
      <div style={{ position: "absolute", left: box.x, top: box.y, display: "flex", gap: 24, alignItems: "center", whiteSpace: "nowrap" }}>
        {title && <span style={{ ...font("label", C.white), background: C.ink, borderRadius: R.sm, padding: "2px 16px" }}>{title}</span>}
        {m > 0 && !compact && <span style={font("value")}>{m}か月目</span>}
      </div>
      {!noPairs && <div style={{ position: "absolute", left: pairs.x, top: box.y, whiteSpace: "nowrap", ...font("value") }}>
        ペア {pairsNow}<span style={font("label")}>組</span>
      </div>}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* 知り合いの輪（紹介の町） */}
        {rings.map((r, i) => {
          const nx = rings[(i + 1) % rings.length];
          return (
            <g key={i}>
              <line x1={r.cx} y1={r.cy} x2={nx.cx} y2={nx.cy} stroke={C.ink2} strokeWidth={LINE.thin} strokeDasharray="3 13" strokeLinecap="round" />
              <ellipse cx={r.cx} cy={r.cy + 2 * size} rx={ringRx(size)} ry={ringRy(size)} fill={C.paper2} stroke={C.rest} strokeWidth={LINE.hair} />
            </g>
          );
        })}
        {!noPairs && <rect x={pairs.x - 24} y={pairs.y - 16} width={pairs.w + 24} height={pairs.h + 16} rx={R.lg} fill={C.white} stroke={C.rest} strokeWidth={LINE.hair} />}
        {/* 引き合わせの線（紹介の町） */}
        {ev > 0 && month?.intros?.map(([p, q, ok], k) => {
          const a = home[p], b = home[q];
          const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 70 * size;
          const len = Math.hypot(b.x - a.x, b.y - a.y) + 140;
          const t = Math.max(0, Math.min(1, ev * 1.4 - (k % 5) * 0.08));
          return (
            <g key={k} opacity={evFade}>
              <path d={`M${a.x} ${a.y - 30 * size} Q${mx} ${my} ${b.x} ${b.y - 30 * size}`} fill="none"
                stroke={ok ? C.ink : C.ink2} strokeWidth={ok ? LINE.thin : LINE.hair + 1} strokeDasharray={ok ? `${len * t} ${len}` : "6 8"}
                opacity={ok ? 1 : t * 0.8} strokeLinecap="round" />
              {ok && t > 0.95 && <Heart x={mx} y={(my + (a.y + b.y) / 2 - 30 * size) / 2} r={11} fill={C.ink} />}
            </g>
          );
        })}
        {/* 飛ぶハート（アプリの町）。多すぎると見えないので maxHearts 件まで */}
        {ev > 0 && month?.likes && month.likes.filter((_, k) => k % Math.max(1, Math.ceil(month.likes!.length / maxHearts)) === 0).map(([p, q], k) => {
          const a = home[p], b = home[q];
          const t = Math.max(0, Math.min(1, ev * 1.5 - (k % 10) * 0.05));
          if (t <= 0 || t >= 1) return null;
          const x = a.x + (b.x - a.x) * t, y = a.y - 40 * size + (b.y - a.y) * t - Math.sin(t * Math.PI) * 60;
          return <Heart key={k} x={x} y={y} r={9} fill={kindColor(result.residents[p].kind)} opacity={evFade} />;
        })}
        <Crowd people={people} start={moveAt} size={size} />
      </svg>
    </>
  );
};

/** HeartRows の並び：上の列が女性、下の列が男性。どちらも受け取ったいいねの多い順に左から */
export const heartRowLayout = (result: TownResult, received: Map<number, number>, box: Box, size = 1.05) => {
  const rows = (["female", "male"] as const).map((k) => result.residents.filter((a) => a.kind === k)
    .sort((a, b) => (received.get(b.id) ?? 0) - (received.get(a.id) ?? 0)));
  const dx = (box.w - 40) / 50;
  const base = [box.y + box.h * 0.45, box.y + box.h];
  const pos: Pt[] = result.residents.map(() => ({ x: 0, y: 0 }));
  rows.forEach((row, r) => row.forEach((a, i) => { pos[a.id] = { x: box.x + 20 + dx * (i + 0.5), y: base[r] - FOOT.bottom * size }; }));
  return { rows, dx, base, pos };
};

/** アプリの町の人を、受け取ったいいねの多い順に男女2列に並べ、頭の上にハートを積む（start から dur かけて積み上がる） */
export const HeartRows: React.FC<{
  result: TownResult; received: Map<number, number>; box: Box; perHeart?: number; size?: number;
  start?: number; dur?: number; tags?: Tag[]; bracketTop?: number; from?: Pt[];
  focus?: number; // この人以外を薄い色にする
  lines?: { from: number; to: number[]; start: number }; // from の人から to の人たちへ点線を引く（送ったいいねの行き先）
}> = ({ result, received, box, perHeart = 15, size = 1.05, start = 0, dur = 90, tags = [], bracketTop, from, focus, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { rows, dx, base, pos } = heartRowLayout(result, received, box, size);
  const tagOf = new Map(tags.map((t) => [t.id, t.label]));
  const grow = interpolate(frame - start - 30, [0, dur], [0, 1], { ...clamp, easing: EASE });
  // 名札は頭の上だとハートと重なるので、足元の下に出す（Figure の label は使わない）
  const people: Person[] = result.residents.map((a) => ({
    kind: a.kind, from: from ? from[a.id] : pos[a.id], to: from ? pos[a.id] : undefined, delay: Math.round((a.id % 25) * 0.5),
    highlight: tagOf.has(a.id), dim: focus !== undefined && focus !== a.id,
  }));
  const la = lines ? interpolate(frame - lines.start, [0, 30], [0, 1], clamp) : 0;
  const k = bracketTop ?? 0;
  const top = rows[1].slice(0, k).reduce((s, a) => s + (received.get(a.id) ?? 0), 0);
  const all = rows[1].reduce((s, a) => s + (received.get(a.id) ?? 0), 0);
  const br = sp("enter", frame - start - 30 - dur - 20, fps);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {result.residents.map((a) => {
        const n = Math.round(((received.get(a.id) ?? 0) / perHeart) * grow);
        const p = pos[a.id];
        const head = p.y - FOOT.top * size * (tagOf.has(a.id) ? 1.25 : 1) - 14;
        const dimmed = focus !== undefined && focus !== a.id;
        return (
          <g key={a.id} data-qa="mark" data-qa-label="ハートの山" opacity={dimmed ? 0.35 : 1}>
            {Array.from({ length: n }, (_, j) => <Heart key={j} x={p.x} y={head - j * 13} r={8} fill={kindColor(a.kind === "male" ? "female" : "male")} />)}
          </g>
        );
      })}
      {lines && la > 0 && lines.to.map((q, k) => {
        const a = pos[lines.from], b = pos[q];
        return <path key={k} d={`M${a.x} ${a.y + 12} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 40} ${b.x} ${b.y - FOOT.top * size - 6}`} fill="none"
          stroke={kindColor(result.residents[lines.from].kind)} strokeWidth={LINE.thin} strokeDasharray="10 8" opacity={la} />;
      })}
      <Crowd people={people} start={start} size={size} />
      {tags.map((t) => (
        <text key={t.id} x={pos[t.id].x} y={pos[t.id].y + 66} textAnchor="middle" style={font("label")} data-qa="label" data-qa-label="名札">{t.label}</text>
      ))}
      {k > 0 && br > 0.01 && (() => {
        const x1 = pos[rows[1][0].id].x - dx / 2, x2 = pos[rows[1][k - 1].id].x + dx / 2;
        const y = base[1] + 18;
        return (
          <g opacity={br} data-qa="label" data-qa-label="上位の括弧">
            <path d={`M${x1} ${y} v12 H${x2} v-12`} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
            <text x={x2 + 18} y={y + 40} style={font("label")}>{`上の${k}人で${Math.round((top / all) * 100)}%`}</text>
          </g>
        );
      })()}
    </svg>
  );
};

/** 100人を10×10に並べ、ペアになった人だけ色を付ける（ペアの2人は隣どうし）。数は from から count まで数え上がる */
export const PairPanel: React.FC<{
  result: TownResult; x: number; y: number; title: string; sub?: string; start?: number; dur?: number; size?: number;
  focus?: boolean; from?: number;
}> = ({ result, x, y, title, sub, start = 0, dur = 45, size = 0.8, focus = false, from = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = result.final.pairs.length;
  const t = interpolate(frame - start, [10, 10 + dur], [0, 1], { ...clamp, easing: EASE });
  const shown = Math.round(from + (n - from) * t);
  const ent = sp("enter", frame - start, fps);
  const order: { kind: "male" | "female"; paired: number }[] = [];
  result.final.pairs.forEach(([a, b], k) => { order.push({ kind: result.residents[a].kind, paired: k }, { kind: result.residents[b].kind, paired: k }); });
  for (const a of result.residents) if (!result.final.pairs.some((p) => p.includes(a.id))) order.push({ kind: a.kind, paired: -1 });
  const dx = (FOOT.w + GAP) * size * 1.25, dy = (FOOT.top + FOOT.bottom + GAP) * size;
  const gridTop = y + 150;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: ent }}>
      <div style={{ position: "absolute", left: x, top: y, width: dx * 10, whiteSpace: "nowrap" }}>
        <div style={{ ...font("label", focus ? C.white : C.ink), display: "inline-block", background: focus ? C.ink : C.paper2, borderRadius: R.sm, padding: "2px 14px" }}>{title}</div>
        <div style={{ ...font("value"), marginTop: 6 }}>{shown}<span style={font("label")}>組</span>{sub && <span style={{ ...font("label", C.ink2), marginLeft: 14 }}>{sub}</span>}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {order.map((o, i) => (
          <Figure key={i} kind={o.kind} size={size} x={x + dx * (i % 10) + dx / 2} y={gridTop + FOOT.top * size + dy * Math.floor(i / 10)}
            dim={o.paired < 0 || o.paired >= shown} />
        ))}
      </svg>
    </div>
  );
};
