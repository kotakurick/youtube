// メールの受信箱（検索窓と、見つかったメールの行）。7本目「情報漏えい」の冒頭で作った（2026-10-07）。
// 決まり：
//   - 実在のメールの画面に似せない（ロゴ・配色・ボタンの形をまねない）。色は墨・白・紙色だけ。
//   - 送り主は会社名を書かず、一般名（「焼肉の店のアプリ」など）と目印（Icons.tsx）で見せる。
//   - x,y は左上、w は幅。行の高さは 120px。文字は 40px（送り主）と 30px（件名・日付）。28px 未満にしない。
//   - rows の mark でその行を墨の太い枠に（いま読んでいる行）、dim で薄い文字（話の外）。
//   - icon は行の目印を描く関数（中心の座標を受け取る）。
//   - 印：画面全体が data-qa="prop"。中の文字は入れ子なので重なりを調べない。
import React from "react";
import { C, font, LINE, R } from "./theme";

export type InboxRow = { from: string; subject: string; date: string; icon?: (x: number, y: number) => React.ReactNode; mark?: boolean; dim?: boolean };

export const INBOX_ROW_H = 120;

export const Inbox: React.FC<{ x: number; y: number; w?: number; query: string; rows: InboxRow[]; count?: string; title?: string }> = (
  { x, y, w = 1300, query, rows, count, title = "受信トレイ" },
) => {
  const head = 84, search = 104;
  const h = head + search + rows.length * INBOX_ROW_H + 24;
  return (
    <g data-qa="prop" data-qa-label="受信箱">
      <rect x={x} y={y} width={w} height={h} rx={R.lg} fill={C.white} stroke={C.ink} strokeWidth={LINE.thin} />
      <path d={`M${x} ${y + head} V${y + R.lg} Q${x} ${y} ${x + R.lg} ${y} H${x + w - R.lg} Q${x + w} ${y} ${x + w} ${y + R.lg} V${y + head} Z`} fill={C.ink} />
      <text x={x + 36} y={y + 56} style={font("label", C.white)}>{title}</text>
      {/* 検索窓 */}
      <rect x={x + 32} y={y + head + 20} width={w - 64 - (count ? 200 : 0)} height={68} rx={34} fill={C.bg} stroke={C.ink2} strokeWidth={LINE.hair} />
      <circle cx={x + 76} cy={y + head + 50} r={14} fill="none" stroke={C.ink} strokeWidth={LINE.thin} />
      <path d={`M${x + 86} ${y + head + 60} L${x + 98} ${y + head + 72}`} stroke={C.ink} strokeWidth={LINE.thin} strokeLinecap="round" />
      <text x={x + 120} y={y + head + 68} style={font("label")} fontWeight={900}>{query}</text>
      {count && <text x={x + w - 40} y={y + head + 68} textAnchor="end" style={font("label", C.ink2)}>{count}</text>}
      {rows.map((r, i) => {
        const ry = y + head + search + i * INBOX_ROW_H;
        const tc = r.dim ? C.rest : C.ink;
        return (
          <g key={i}>
            {i > 0 && <line x1={x + 32} x2={x + w - 32} y1={ry} y2={ry} stroke={C.paper2} strokeWidth={LINE.hair} />}
            {r.mark && <rect x={x + 16} y={ry + 6} width={w - 32} height={INBOX_ROW_H - 12} rx={R.md} fill="none" stroke={C.ink} strokeWidth={LINE.base} />}
            {r.icon?.(x + 90, ry + INBOX_ROW_H / 2)}
            <text x={x + 160} y={ry + 48} style={font("label", tc)} fontWeight={900}>{r.from}</text>
            <text x={x + 160} y={ry + 100} style={{ ...font("note", r.dim ? C.rest : C.ink2), fontSize: 30 }}>{r.subject}</text>
            <text x={x + w - 48} y={ry + 52} textAnchor="end" style={{ ...font("note", r.dim ? C.rest : C.ink2), fontSize: 30 }}>{r.date}</text>
          </g>
        );
      })}
    </g>
  );
};
