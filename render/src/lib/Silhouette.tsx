// 比較的リアルな人のシルエット（2026-10-06 オーナー「シルエットはデータで語る棒人間のようにリアルな形」）。サムネイル用。
// 関節の位置から、先細りの手足（2つの円をつないだ形）・胴・頭・髪を組み立てて、1色で塗る。
// 体の向きや姿勢は J（関節の座標）で決める。座標は足元を (0,0) とし、身長がおよそ 1000（上がマイナス）。size で拡大する。
import React from "react";

type P = [number, number];
/** 2つの円（中心 a・半径 ra と 中心 b・半径 rb）をなめらかにつないだ形（円2つと、外側の接線でつないだ四角形） */
const Limb: React.FC<{ a: P; ra: number; b: P; rb: number }> = ({ a, ra, b, rb }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  const pts = [[a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], [b[0] - nx * rb, b[1] - ny * rb], [a[0] - nx * ra, a[1] - ny * ra]];
  return (
    <>
      <polygon points={pts.map((q) => q.join(",")).join(" ")} />
      <circle cx={a[0]} cy={a[1]} r={ra} /><circle cx={b[0]} cy={b[1]} r={rb} />
    </>
  );
};

export type Joints = {
  head: P; headR: [number, number]; headTilt?: number; // 頭（楕円の半径 x,y と傾き）
  neck: P;
  shoulderL: P; shoulderR: P; hipL: P; hipR: P; waist?: number; // 胴のくびれ（0〜1。女性は大きく）
  elbowL: P; handL: P; elbowR: P; handR: P;
  kneeL: P; footL: P; kneeR: P; footR: P;
  hair?: "short" | "long";
  skirt?: boolean;
};

const mid = (a: P, b: P, t = 0.5): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const Silhouette: React.FC<{ j: Joints; x: number; y: number; size?: number; color?: string; gap?: string; flip?: boolean; children?: React.ReactNode }> = (
  { j, x, y, size = 1, color = "#FFFFFF", gap = "rgba(0,0,0,.35)", flip = false, children },
) => {
  const w = j.waist ?? 0.12;
  const sL = j.shoulderL, sR = j.shoulderR, hL = j.hipL, hR = j.hipR;
  const wL = mid(sL, hL, 0.6), wR = mid(sR, hR, 0.6);
  const inward = (p: P, toward: P): P => [p[0] + (toward[0] - p[0]) * w, p[1]];
  const wLi = inward(wL, wR), wRi = inward(wR, wL);
  // 胴：肩・くびれ・腰を結ぶ多角形。同じ色の太い線（stroke）で角を丸める
  // なで肩：首の付け根（肩より上）から肩へ下がる
  const nL: P = [j.neck[0] - 34, sL[1] - 26], nR: P = [j.neck[0] + 34, sR[1] - 26];
  const torso = [nL, nR, [sR[0], sR[1] + 18], wRi, hR, hL, wLi, [sL[0], sL[1] + 18]].map((q) => q.join(",")).join(" ");
  const skirt = j.skirt ? `M${[hL[0] - 6, hL[1] - 10]} L${[hR[0] + 6, hR[1] - 10]} L${[j.kneeR[0] + 40, j.kneeR[1] + 20]} L${[j.kneeL[0] - 40, j.kneeL[1] + 20]} Z` : "";
  const [hx, hy] = j.head, [rx, ry] = j.headR;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -size : size},${size})`} fill={color}>
      {/* 脚 */}
      <Limb a={hL} ra={31} b={j.kneeL} rb={23} /><Limb a={j.kneeL} ra={25} b={j.footL} rb={15} />
      <Limb a={hR} ra={31} b={j.kneeR} rb={23} /><Limb a={j.kneeR} ra={25} b={j.footR} rb={15} />
      <ellipse cx={j.footL[0] - 10} cy={j.footL[1] - 6} rx={30} ry={12} /><ellipse cx={j.footR[0] + 10} cy={j.footR[1] - 6} rx={30} ry={12} />
      {skirt && <path d={skirt} />}
      {/* 胴と首 */}
      <polygon points={torso} stroke={color} strokeWidth={26} strokeLinejoin="round" />
      <Limb a={j.neck} ra={22} b={mid(sL, sR)} rb={30} />
      {/* 腕（肩→ひじ→手）。胴との間を地の色の細い線で分ける */}
      {([[sL, j.elbowL, j.handL], [sR, j.elbowR, j.handR]] as const).map(([s0, e, h], i) => (
        <g key={i}>
          <g fill={gap} stroke={gap} strokeWidth={6}><Limb a={s0} ra={24} b={e} rb={18} /><Limb a={e} ra={18} b={h} rb={13} /></g>
          <Limb a={s0} ra={24} b={e} rb={18} /><Limb a={e} ra={18} b={h} rb={13} /><circle cx={h[0]} cy={h[1]} r={17} />
        </g>
      ))}
      {/* 頭と髪 */}
      <ellipse cx={hx} cy={hy} rx={rx} ry={ry} transform={`rotate(${j.headTilt ?? 0} ${hx} ${hy})`} />
      {j.hair === "long" && <path d={`M${hx - rx - 6} ${hy - 10} C${hx - rx - 30} ${hy + 120} ${hx - 40} ${hy + 190} ${hx + 10} ${hy + 200} C${hx + rx + 20} ${hy + 160} ${hx + rx + 14} ${hy + 60} ${hx + rx + 6} ${hy - 10} Z`} />}
      {children}
    </g>
  );
};

/** うつむいてスマホを見る男性（正面。頭を落とし、ひじを内に入れる）。両手は腹の前（スマホ） */
export const MAN_SLUMP: Joints = {
  head: [0, -838], headR: [56, 58], neck: [4, -800],
  shoulderL: [-98, -772], shoulderR: [98, -772], hipL: [-64, -470], hipR: [64, -470], waist: 0.05,
  elbowL: [-118, -600], handL: [-14, -628], elbowR: [116, -600], handR: [16, -630],
  kneeL: [-48, -240], footL: [-58, 0], kneeR: [50, -240], footR: [62, 0],
  hair: "short",
};
/** スマホを顔の前に持ち、片手を額に当てて困る女性（正面）。髪は長い */
export const WOMAN_PHONE: Joints = {
  head: [0, -905], headR: [52, 64], headTilt: -10, neck: [0, -828],
  shoulderL: [-80, -782], shoulderR: [80, -782], hipL: [-72, -480], hipR: [72, -480], waist: 0.22,
  elbowL: [-125, -735], handL: [-46, -895], elbowR: [112, -615], handR: [14, -700],
  kneeL: [-40, -240], footL: [-46, 0], kneeR: [40, -240], footR: [46, 0],
  hair: "long", skirt: true,
};
