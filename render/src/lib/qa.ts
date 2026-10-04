// 画面の品質チェック（重なり・文字の小ささ・はみ出し）。npm run check で使う（QAOverlay.tsx がブラウザの中で呼ぶ）。
//
// 部品は描いたものに印を付ける：data-qa="figure"（人型）／"gosa"（ゴサと吹き出し）／"mark"（グラフの棒・線・印・地図のマス）
//   ／"prop"（小道具）／"sub"（字幕の帯）／"bg"（背景。中は調べない）。文字は印がなくても自動で拾う。
// わざと重ねるところは data-qa-allow="figure mark" のように、重なってよい相手を書く（例：人型の名札は人に重なってよい）。
// 親子（入れ子）の関係にあるもの同士は調べない（カードの中の文字、スマホの画面の中の数字など）。

export type QAKind = "text" | "figure" | "gosa" | "mark" | "prop" | "sub";
export type QABox = { id: number; kind: QAKind; x: number; y: number; w: number; h: number; allow: string[]; label: string; fontPx?: number };
export type QAIssue = { level: "error" | "warn"; rule: string; message: string; boxes: QABox[] };

/** 重なってはいけない組み合わせ（どちらの順でも同じ）。ない組み合わせは調べない */
const RULES: Record<string, { level: "error" | "warn"; why: string }> = {
  "text|text": { level: "error", why: "文字と文字が重なっています" },
  "figure|text": { level: "error", why: "文字が人型に重なっています" },
  "gosa|text": { level: "error", why: "ゴサが文字に重なっています（ゴサは文字や数字に重ねない）" },
  "mark|text": { level: "warn", why: "文字がグラフの棒・線に重なっています" },
  "prop|text": { level: "error", why: "文字が小道具に重なっています" },
  "figure|gosa": { level: "error", why: "ゴサが人型に重なっています" },
  "gosa|mark": { level: "error", why: "ゴサがグラフに重なっています" },
  "gosa|prop": { level: "error", why: "ゴサが小道具に重なっています" },
  "figure|mark": { level: "warn", why: "人型がグラフに重なっています" },
  "sub|text": { level: "error", why: "字幕の帯に文字がかかっています" },
  "figure|sub": { level: "error", why: "字幕の帯に人型がかかっています" },
  "gosa|sub": { level: "error", why: "字幕の帯にゴサがかかっています" },
  "mark|sub": { level: "error", why: "字幕の帯にグラフがかかっています" },
  "prop|sub": { level: "error", why: "字幕の帯に小道具がかかっています" },
};

export const MIN_FONT_PX = 28;   // これより小さい文字は作らない（docs/brand.md）
const MIN_OVERLAP = 4;           // 4px 未満の接触は見逃す（線の太さの誤差）

const inter = (a: QABox, b: QABox) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w >= MIN_OVERLAP && h >= MIN_OVERLAP ? { w, h } : null;
};

/**
 * 箱の一覧から問題を探す。related(a, b) が true の組（親子など）は調べない。
 * canvas は画面の大きさ、unsafeBottom は文字を置かない下の帯（横長は80px）。
 */
export const checkBoxes = (
  boxes: QABox[], related: (a: QABox, b: QABox) => boolean,
  canvas: { w: number; h: number; unsafeBottom: number; fontScale: number },
): QAIssue[] => {
  const out: QAIssue[] = [];
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      const key = [a.kind, b.kind].sort().join("|");
      const rule = RULES[key];
      if (!rule) continue;
      if (a.allow.includes(b.kind) || b.allow.includes(a.kind)) continue;
      if (!inter(a, b) || related(a, b)) continue;
      out.push({ level: rule.level, rule: key, message: `${rule.why}：「${a.label}」と「${b.label}」`, boxes: [a, b] });
    }
    if (a.kind === "text") {
      if (a.fontPx !== undefined && a.fontPx < MIN_FONT_PX * canvas.fontScale - 0.5) {
        out.push({ level: "error", rule: "font", message: `文字が小さすぎます（${a.fontPx.toFixed(0)}px、${MIN_FONT_PX}px 以上）：「${a.label}」`, boxes: [a] });
      }
      if (a.x < -1 || a.y < -1 || a.x + a.w > canvas.w + 1 || a.y + a.h > canvas.h + 1) {
        out.push({ level: "error", rule: "edge", message: `文字が画面の外にはみ出しています：「${a.label}」`, boxes: [a] });
      } else if (canvas.unsafeBottom > 0 && a.y + a.h > canvas.h - canvas.unsafeBottom + 2) {
        out.push({ level: "error", rule: "bottom", message: `文字が再生バーの重なる下${canvas.unsafeBottom}pxに入っています：「${a.label}」`, boxes: [a] });
      }
    }
  }
  return out;
};
