// 質屋（盗んだ物・情報をお金に換える所）の比喩の部品（7本目「情報漏えい」で作った。2026-10-07）。
//   - Pawnshop：「質」の看板と暖簾の小さな店。state で 開いている（open）／シャッターが半分（half）／閉まった（closed）を見せる。
//               第2版（2026-10-07）：開いている＝暖簾・金の縁の看板・金の窓と床の金の光／半分＝シャッター65%・暖簾なし・床の光は小さく
//               ／閉まった＝店ごと灰・シャッター全部・「閉」の札。お金に換える店なので、開いている店にだけ金を入れる。
//               下に何を換える質屋かの名札（label）。名札の文字は店の大きさによらず40px（28px 未満にしない）。
//   - Stall   ：闇の売り場（抽象的な屋台と棚）。実在のサイトの画面に似せない。棚に盗品（Loot）を並べ、値札（tag）を下げる。
//   - Loot    ：盗品の目印（カード・身分証・名簿・鍵＝パスワード）。情報なので意味の色の青緑（C.teal）で塗る。
//   - Coins   ：お金に換わった額（積んだ硬貨）。意味の色の金（C.gold）。
// 決まり：
//   - 屋台は墨の線・紙色・白だけ。質屋は「換えられる度合い」を金の明かりで見せる（開＞半分＞閉）。盗品＝青緑、硬貨＝金。
//   - 攻撃の手口は描かない（偽の画面・手順を描かない）。店は「換えられる／換えられない」の状態だけを見せる。
//   - 原点は地面の中央（x, y）。s は倍率（s=1 で店の幅360・高さ約330）。店の中の文字が28px 未満にならないよう s は 0.6 以上。
//   - 印：店・屋台は data-qa="prop"、盗品・硬貨も "prop"。名札の文字は prop の外（下。地面から 30*s+50）に置く。
import React from "react";
import { C, font, LINE, R } from "./theme";

const st = { stroke: C.ink, strokeWidth: LINE.thin, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const ns = { vectorEffect: "non-scaling-stroke" as const };

export type ShopState = "open" | "half" | "closed";

export const Pawnshop: React.FC<{
  x: number; y: number; s?: number; state?: ShopState; label?: string; note?: string;
  big?: boolean; // 名札を太字で大きく（その場面の主役の店）
}> = ({ x, y, s = 1, state = "open", label, note, big = false }) => {
  // 形（s=1）：本体 幅360・高さ240、屋根の上に看板
  const W = 360, H = 240, dw = 200, dh = 170;
  const shutter = state === "closed" ? 1 : state === "half" ? 0.65 : 0;
  const closed = state === "closed";
  return (
    <g>
      <g data-qa="prop" data-qa-label={`質屋：${label ?? ""}`} transform={`translate(${x},${y}) scale(${s})`}>
        {/* 床の金の光（開いている＝大きく、半分＝小さく、閉まった＝なし） */}
        {state === "open" && <path d={`M${-dw / 2} 0 L${-dw / 2 - 70} 30 H${dw / 2 + 70} L${dw / 2} 0 Z`} fill={C.gold} opacity={0.45} />}
        {state === "half" && <path d={`M${-dw / 2 + 20} 0 L${-dw / 2 - 10} 24 H${dw / 2 + 10} L${dw / 2 - 20} 0 Z`} fill={C.goldTint} />}
        {/* 本体（閉まった店は灰） */}
        <rect x={-W / 2} y={-H} width={W} height={H} fill={closed ? C.otherTint : C.wall} {...st} {...ns} />
        {/* 屋根（瓦の帯） */}
        <path d={`M${-W / 2 - 30} ${-H} L${-W / 2 + 10} ${-H - 46} H${W / 2 - 10} L${W / 2 + 30} ${-H} Z`} fill={closed ? C.other : C.ink2} {...st} {...ns} />
        {/* 看板「質」（開いている店は金の縁） */}
        <rect x={-46} y={-H - 128} width={92} height={86} rx={R.sm} fill={closed ? C.rest : C.white} stroke={closed ? C.ink2 : state === "open" ? C.gold : C.ink} strokeWidth={state === "open" ? LINE.base : LINE.thin} {...ns} />
        <text x={0} y={-H - 62} textAnchor="middle" style={{ ...font("value", closed ? C.ink2 : C.ink), fontSize: 60 }}>質</text>
        {/* 入口（開いている店の中は明るい金） */}
        <rect x={-dw / 2} y={-dh} width={dw} height={dh} fill={closed ? C.rest : state === "open" ? C.goldTint : C.white} {...st} {...ns} />
        {!closed && <rect x={-dw / 2 + 20} y={-60} width={dw - 40} height={20} fill={C.paper2} stroke={C.ink2} strokeWidth={LINE.hair} {...ns} />}
        {/* シャッター（上から下りる。半分＝65%） */}
        {shutter > 0 && <g>
          <rect x={-dw / 2} y={-dh} width={dw} height={dh * shutter} fill={closed ? C.other : C.rest} stroke={C.ink} strokeWidth={LINE.thin} {...ns} />
          {Array.from({ length: Math.floor((dh * shutter) / 18) }, (_, i) => (
            <line key={i} x1={-dw / 2 + 6} x2={dw / 2 - 6} y1={-dh + 18 * (i + 1)} y2={-dh + 18 * (i + 1)} stroke={C.ink2} strokeWidth={LINE.hair} {...ns} />
          ))}
          {!closed && <rect x={-18} y={-dh + dh * shutter - 10} width={36} height={8} rx={3} fill={C.ink} />}
        </g>}
        {/* 閉まった店の札「閉」 */}
        {closed && <g>
          <path d="M-34 -150 L0 -176 L34 -150" fill="none" stroke={C.ink} strokeWidth={LINE.hair} {...ns} />
          <rect x={-44} y={-150} width={88} height={84} rx={R.sm} fill={C.white} {...st} {...ns} />
          <text x={0} y={-90} textAnchor="middle" style={{ ...font("value"), fontSize: 56 }}>閉</text>
        </g>}
        {/* 暖簾（開いている店だけ。無地の墨に白い丸） */}
        {state === "open" && <g>
          {[-1, 0, 1].map((k) => (
            <g key={k}>
              <rect x={k * 68 - 32} y={-dh - 4} width={64} height={92} fill={C.ink} />
              <circle cx={k * 68} cy={-dh + 50} r={12} fill={C.white} />
            </g>
          ))}
        </g>}
        {/* 窓（左右。開いている店は金の明かり） */}
        {[-1, 1].map((k) => <rect key={k} x={k * 140 - 22} y={-H + 40} width={44} height={56} fill={closed ? C.rest : state === "open" ? C.gold : C.goldTint} stroke={C.ink2} strokeWidth={LINE.hair} {...ns} />)}
      </g>
      {/* 名札は入口の明かり（地面から 30*s 下まで）の下に置く */}
      {label && <text x={x} y={y + 30 * s + 50} textAnchor="middle" style={font("label")} fontWeight={big ? 900 : 700}>{label}</text>}
      {note && <text x={x} y={y + 30 * s + (label ? 96 : 50)} textAnchor="middle" style={font("note", C.ink2)}>{note}</text>}
    </g>
  );
};

export type LootKind = "card" | "id" | "list" | "key" | "point";
/** 盗品の目印（原点＝中心、s=1 で幅約72）。情報なので青緑。point（ポイント）はお金に近いので金 */
export const Loot: React.FC<{ x: number; y: number; s?: number; kind?: LootKind; label?: string }> = ({ x, y, s = 1, kind = "card", label }) => {
  const fill = kind === "point" ? C.gold : C.teal;
  return (
    <g data-qa="prop" data-qa-label={label ?? `盗品：${kind}`} transform={`translate(${x},${y}) scale(${s})`}>
      {kind === "card" && <>
        <rect x={-36} y={-23} width={72} height={46} rx={7} fill={fill} {...st} {...ns} />
        <rect x={-26} y={-10} width={16} height={12} rx={2} fill={C.goldTint} />
        <path d="M-26 12 H20" stroke={C.white} strokeWidth={4} strokeLinecap="round" />
      </>}
      {kind === "id" && <>
        <rect x={-36} y={-24} width={72} height={48} rx={6} fill={C.white} {...st} {...ns} />
        <rect x={-30} y={-16} width={22} height={28} rx={3} fill={fill} />
        <path d="M0 -10 H26 M0 0 H22 M0 10 H18" stroke={fill} strokeWidth={5} strokeLinecap="round" />
      </>}
      {kind === "list" && <>
        <rect x={-28} y={-34} width={56} height={68} rx={5} fill={C.white} {...st} {...ns} />
        {[-18, -4, 10, 24].map((yy) => <path key={yy} d={`M-18 ${yy} H18`} stroke={fill} strokeWidth={5} strokeLinecap="round" />)}
      </>}
      {kind === "key" && <>
        <circle cx={-16} cy={0} r={16} fill={fill} {...st} {...ns} />
        <circle cx={-16} cy={0} r={6} fill={C.bg} />
        <path d="M0 0 H36 M24 0 V12 M32 0 V10" stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      </>}
      {kind === "point" && <>
        <circle r={28} fill={fill} {...st} {...ns} />
        <text x={0} y={13} textAnchor="middle" style={{ ...font("label", C.white), fontSize: 36 }}>P</text>
      </>}
    </g>
  );
};

/** 積んだ硬貨（お金に換わった額）。n 枚を stacks 列に積む。原点＝いちばん下の中央 */
export const Coins: React.FC<{ x: number; y: number; n?: number; stacks?: number; s?: number; label?: string }> = ({ x, y, n = 6, stacks = 2, s = 1, label }) => {
  const per = Math.ceil(n / stacks);
  return (
    <g data-qa="prop" data-qa-label={label ?? "硬貨"} transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({ length: n }, (_, i) => {
        const col = Math.floor(i / per), row = i % per;
        const cx = (col - (stacks - 1) / 2) * 70, cy = -12 - row * 16;
        return <g key={i}>
          <ellipse cx={cx} cy={cy + 6} rx={30} ry={10} fill={C.gold} {...st} {...ns} />
          <ellipse cx={cx} cy={cy} rx={30} ry={10} fill={C.goldTint} {...st} {...ns} />
        </g>;
      })}
    </g>
  );
};

/** 闇の売り場（抽象的な屋台）。原点＝地面の中央、s=1 で幅420。items は棚に並べる盗品、tag は値札の文字 */
export const Stall: React.FC<{ x: number; y: number; s?: number; items?: LootKind[]; tag?: string; label?: string }> = (
  { x, y, s = 1, items = ["card", "card", "id", "list", "card", "key"], tag, label },
) => {
  const W = 420;
  return (
    <g>
      <g data-qa="prop" data-qa-label={label ?? "闇の売り場"} transform={`translate(${x},${y}) scale(${s})`}>
        {/* 柱 */}
        <path d={`M${-W / 2 + 20} 0 V-300 M${W / 2 - 20} 0 V-300`} stroke={C.ink} strokeWidth={LINE.base} {...ns} />
        {/* 日よけ（墨と紙色のしま、裾は波） */}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${-W / 2 + i * (W / 6)} -330 h${W / 6} v56 q${-W / 24} 22 ${-W / 12} 0 q${-W / 24} 22 ${-W / 12} 0 Z`} fill={i % 2 ? C.paper2 : C.ink2} stroke={C.ink} strokeWidth={LINE.hair} {...ns} />
        ))}
        {/* 棚と台 */}
        <rect x={-W / 2 + 30} y={-200} width={W - 60} height={10} fill={C.paper2} {...st} {...ns} />
        <rect x={-W / 2} y={-96} width={W} height={96} fill={C.paper2} {...st} {...ns} />
      </g>
      {/* 盗品（棚の上に3つ、台の上に3つ） */}
      {items.slice(0, 6).map((k, i) => (
        <Loot key={i} kind={k} s={s * 0.85} x={x + s * (-120 + (i % 3) * 120)} y={y + s * (i < 3 ? -232 : -128)} label={`売り場の盗品${i + 1}`} />
      ))}
      {tag && <g data-qa="prop" data-qa-label={`値札：${tag}`}>
        <line x1={x + s * (W / 2 - 20)} y1={y - s * 270} x2={x + s * (W / 2 + 40)} y2={y - s * 220} stroke={C.ink} strokeWidth={LINE.hair} />
        <rect x={x + s * (W / 2 + 10)} y={y - s * 220} width={tag.length * 40 + 48} height={64} rx={R.sm} fill={C.white} stroke={C.gold} strokeWidth={LINE.base} />
        <text x={x + s * (W / 2 + 10) + 24} y={y - s * 220 + 46} style={font("label")} fontWeight={900} data-qa-allow="prop">{tag}</text>
      </g>}
    </g>
  );
};
