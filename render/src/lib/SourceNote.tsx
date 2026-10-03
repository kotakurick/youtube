// 出典（グラフの左下、NOTE の区画。グラフと一緒に出て一緒に消える）。28px 以上、色は ink2。
// 書き方：「総務省『国勢調査』(2020)」。シミュレーションの場面は sim を付けて、実データと見分ける。
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, R, sp, Z } from "./theme";

export const SourceNote: React.FC<{ text?: string; sim?: boolean; x?: number; y?: number; start?: number }> = (
  { text, sim = false, x = Z.stage.x, y = Z.noteY, start = 0 },
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = sp("enter", frame - start, fps);
  if (!text && !sim) throw new Error("SourceNote: text（出典）か sim のどちらかが要ります。");
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 16, alignItems: "center", opacity: t, whiteSpace: "nowrap" }}>
      {sim && (
        <span style={{ ...font("note", C.ink), lineHeight: 1.05, background: C.paper2, border: `2px solid ${C.ink2}`, borderRadius: R.sm, padding: "0 12px" }}>
          シミュレーション（条件は概要欄）
        </span>
      )}
      {text && <span style={{ ...font("note", C.ink2), lineHeight: 1.05 }}>出典：{text}</span>}
    </div>
  );
};
