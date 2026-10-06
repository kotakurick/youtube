// 車の中（前から見た図）。物語の場面で、家族が車に乗っている情景（4本目「40代、夫婦の満足」で作った。2026-10-06）。
// 日本の車（右ハンドル）なので、前から見ると運転席は画面の左、助手席は画面の右。後ろの席は前の席のあいだに小さく見える。
// 重ね順：空と道 → 車の外側 → 後ろの席の人（back）→ 前の席の背もたれ → 前の席の人（front）→ ダッシュボード・ハンドル・ボンネット。
// 人は猫（Cat）を CAR の座標に置いて back / front に渡す。下半身はダッシュボードに隠れる。
// 色：車は白と墨（データの色は使わない）。信号だけは意味のある色（赤＝C.debt、青＝C.teal。日本の信号は横に 青・黄・赤）。
// 印：車と背景は data-qa="bg"（文字を重ねてよい背景）。信号とカーナビは "prop"（文字を重ねない）。
// 信号の赤・青（debt・teal）は、この回では意味の色ではなく現実の物の色。ほかの場面で teal・debt を使わない（意味が混ざる）。
// 2026-10-06 第2版（絵コンテの3役の見直し）：
//   - ダッシュボードはガラスの内側の下の帯に（ガラスより左右に広い帯は、車の外の部品に見えた）。ハンドルの上の弧がガラスの中に見える。
//   - 夕方の進み（time 0〜1）：0＝日が半分ビルに沈む、1＝上の端だけ・空の帯が下へ広がり・ビルの窓に明かり。色は増やさない。
//   - カーナビの地図の線は数字を横切らない（取り消し線に見えた）。右上の角に小さな道の印だけ。
import React from "react";
import { C, font, LINE, R } from "./theme";

/** 置き場所（猫の足元）。driver＝運転席、passenger＝助手席、back＝後ろの席（左・右） */
export const CAR = {
  driver: { x: 690, y: 645 }, passenger: { x: 1150, y: 645 },
  backL: { x: 872, y: 600 }, backR: { x: 968, y: 600 },
  size: { front: 4.6, back: 2.5 },
  dash: 618,   // ダッシュボードの上の線
  roof: 250,
  navi: { x: 920, y: 603 }, // ダッシュボードの真ん中のカーナビ（小さい画面）
  signal: { x: 1560, y: 120 },
};

const GLASS = "#CFE0EE"; // 窓（Backdrop の窓と同じ色）

export type Signal = "red" | "green" | "none";

/** 信号（横に 青・黄・赤）。x,y は箱の左上 */
export const TrafficSignal: React.FC<{ x: number; y: number; on: Signal }> = ({ x, y, on }) => (
  <g data-qa="prop" data-qa-label="信号">
    <rect x={x + 150} y={y + 70} width={18} height={560} fill={C.ink2} />
    <rect x={x} y={y} width={320} height={110} rx={R.md} fill={C.ink} />
    {(["green", "yellow", "red"] as const).map((k, i) => {
      const lit = (k === "green" && on === "green") || (k === "red" && on === "red");
      const color = k === "green" ? C.teal : k === "red" ? C.debt : C.marker;
      return (
        <g key={k}>
          {lit && <circle cx={x + 58 + i * 102} cy={y + 55} r={50} fill={color} opacity={0.3} />}
          <circle cx={x + 58 + i * 102} cy={y + 55} r={36} fill={lit ? color : C.ink2} />
        </g>
      );
    })}
  </g>
);

/** カーナビの画面（大きく見せるとき）。lines は上から（2行目が主役の文字） */
export const Navi: React.FC<{ x: number; y: number; w?: number; lines: [string, string]; from?: { x: number; y: number } }> = ({ x, y, w = 420, lines, from }) => {
  const h = 210;
  return (
    <g>
      {from && <path d={`M${from.x} ${from.y} L${x + w / 2} ${y + h}`} stroke={C.ink2} strokeWidth={LINE.hair} strokeDasharray="8 8" fill="none" />}
      <g data-qa="prop" data-qa-label="カーナビ">
        <rect x={x} y={y} width={w} height={h} rx={R.md} fill={C.ink} />
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={R.sm} fill={C.night} />
        {/* 地図の道の印（右上の角だけ。文字を横切らない） */}
        <path d={`M${x + w - 120} ${y + 84} L${x + w - 84} ${y + 56} L${x + w - 48} ${y + 70}`} stroke={C.ink2} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x + w - 48} cy={y + 70} r={9} fill={C.paper2} />
        <text x={x + 40} y={y + 76} style={font("label", C.paper2)}>{lines[0]}</text>
        <text x={x + 40} y={y + 160} style={{ ...font("value", C.white) }}>{lines[1]}</text>
      </g>
    </g>
  );
};

export const CarFront: React.FC<{
  signal?: Signal; back?: React.ReactNode; front?: React.ReactNode;
  dusk?: boolean; // 夕方（空に低い日）
  time?: number;  // 夕方の進み（0＝冒頭、1＝家に近い）
}> = ({ signal = "red", back, front, dusk = true, time = 0 }) => {
  const top = CAR.roof, dash = CAR.dash;
  // 窓（台形）：上の辺は狭く、下の辺は広い
  const wTop = [520, 1320], wBot = [380, 1460], wy0 = top + 50;
  return (
    <g>
      {/* 空と道 */}
      <g data-qa="bg">
        <rect x={0} y={0} width={1920} height={1080} fill={C.wall} />
        {/* 空の上の帯（夕方が進むと下へ広がる） */}
        {dusk && <rect x={0} y={0} width={1920} height={200 + 200 * time} fill={C.paper2} />}
        {dusk && <circle cx={250} cy={440 + 90 * time} r={120} fill={C.white} />}
        {/* 街並み（遠くのビル）。日はビルの後ろに沈む */}
        {[[40, 480, 150], [210, 520, 110], [1500, 420, 150], [1680, 350, 200]].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={880 - by} fill={C.paper2} />
            {dusk && time > 0.5 && Array.from({ length: 6 }, (_, j) => (
              <rect key={j} x={bx + 22 + (j % 2) * (bw / 2 - 10)} y={by + 30 + Math.floor(j / 2) * 70} width={28} height={34} fill={C.white} />
            ))}
          </g>
        ))}
        <rect x={0} y={760} width={1920} height={320} fill={C.floor} />
        {/* 横断歩道 */}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 170 - 20} y={940} width={100} height={40} fill={C.white} opacity={0.8} />)}
      </g>
      {signal !== "none" && <TrafficSignal x={CAR.signal.x} y={CAR.signal.y} on={signal} />}
      <g data-qa="bg">
        {/* 車体（屋根から窓のまわり） */}
        <path d={`M${wTop[0] - 70} ${top} H${wTop[1] + 70} Q${wTop[1] + 120} ${top} ${wBot[1] + 110} ${dash + 40} H${wBot[0] - 110} Q${wTop[0] - 120} ${top} ${wTop[0] - 70} ${top} Z`}
          fill={C.white} stroke={C.ink} strokeWidth={LINE.base} strokeLinejoin="round" />
        {/* フロントガラス */}
        <path d={`M${wTop[0]} ${wy0} H${wTop[1]} L${wBot[1]} ${dash} H${wBot[0]} Z`} fill={GLASS} stroke={C.ink} strokeWidth={LINE.thin} strokeLinejoin="round" />
        {/* 車の中の天井の影と後ろの窓 */}
        <path d={`M${wTop[0] + 60} ${wy0 + 40} H${wTop[1] - 60} V${wy0 + 150} H${wTop[0] + 60} Z`} fill={C.white} opacity={0.5} />
        {/* 後ろの席の背もたれ */}
        <rect x={760} y={dash - 150} width={320} height={150} rx={R.lg} fill={C.rest} />
      </g>
      {back}
      <g data-qa="bg">
        {/* 前の席の背もたれ（運転席・助手席）。頭は猫が隠すので、肩から下だけ見える */}
        {[CAR.driver.x, CAR.passenger.x].map((sx) => (
          <rect key={sx} x={sx - 130} y={dash - 230} width={260} height={260} rx={R.lg} fill={C.ink2} />
        ))}
      </g>
      {front}
      <g data-qa="bg">
        {/* ダッシュボード（ガラスの内側の下の帯） */}
        {(() => {
          const dy = dash - 30, f = (dy - wy0) / (dash - wy0);
          const l = wTop[0] + (wBot[0] - wTop[0]) * f, r = wTop[1] + (wBot[1] - wTop[1]) * f;
          return <path d={`M${l} ${dy} H${r} L${wBot[1]} ${dash} H${wBot[0]} Z`} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.hair} strokeLinejoin="round" />;
        })()}
        {/* カーナビ（小） */}
        <rect x={CAR.navi.x - 70} y={CAR.navi.y - 12} width={140} height={24} rx={6} fill={C.night} stroke={C.ink} strokeWidth={3} />
        {/* ハンドル（運転席＝画面の左）。上の弧がガラスの中に見え、下はボンネットに隠れる */}
        <g transform={`translate(${CAR.driver.x},${dash + 34})`}>
          <ellipse rx={150} ry={64} fill="none" stroke={C.ink} strokeWidth={22} />
          <path d="M-140 10 Q0 50 140 10" stroke={C.ink} strokeWidth={18} fill="none" />
        </g>
        {/* ボンネットとライト（ガラスの下の辺から） */}
        <path d={`M${wBot[0] - 120} ${dash} H${wBot[1] + 120} L${wBot[1] + 140} ${dash + 120} L${wBot[1] + 200} 900 H${wBot[0] - 200} L${wBot[0] - 140} ${dash + 120} Z`} fill={C.white} stroke={C.ink} strokeWidth={LINE.base} strokeLinejoin="round" />
        <path d={`M${wBot[0] - 140} ${dash + 120} H${wBot[1] + 140}`} stroke={C.ink} strokeWidth={LINE.hair} />
        {[wBot[0] - 60, wBot[1] - 120].map((lx) => <rect key={lx} x={lx} y={dash + 160} width={180} height={60} rx={30} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.thin} />)}
        <rect x={820} y={dash + 175} width={200} height={70} rx={R.sm} fill={C.paper2} stroke={C.ink} strokeWidth={LINE.hair} />
        <rect x={wBot[0] - 200} y={880} width={wBot[1] - wBot[0] + 400} height={30} fill={C.ink2} />
      </g>
    </g>
  );
};
