// 画面の品質チェック（重なり・文字の小ささ・はみ出し）。npm run check で使う（QAOverlay.tsx がブラウザの中で呼ぶ）。
//
// 部品は描いたものに印を付ける：data-qa="figure"（人型）／"gosa"（ゴサと吹き出し）／"mark"（グラフの棒・線・印・地図のマス）
//   ／"prop"（小道具）／"sub"（字幕の帯）／"bg"（背景。中は調べない）。文字は印がなくても自動で拾う。
// わざと重ねるところは data-qa-allow="figure mark" のように、重なってよい相手を書く（例：人型の名札は人に重なってよい）。
// 親子（入れ子）の関係にあるもの同士は調べない（カードの中の文字、スマホの画面の中の数字など）。

export type QAKind = "text" | "figure" | "gosa" | "mark" | "prop" | "sub";
export type QABox = { id: number; kind: QAKind; x: number; y: number; w: number; h: number; allow: string[]; label: string; fontPx?: number; context?: string }; // context：文字のまわり（親の要素）の文字全部
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
  "figure|figure": { level: "warn", why: "人型どうしが重なっています（群衆は Crowd が止める。1人ずつ置いた人型は間を空ける）" },
  "sub|text": { level: "error", why: "字幕の帯に文字がかかっています" },
  "figure|sub": { level: "error", why: "字幕の帯に人型がかかっています" },
  "gosa|sub": { level: "error", why: "字幕の帯にゴサがかかっています" },
  "mark|sub": { level: "error", why: "字幕の帯にグラフがかかっています" },
  "prop|sub": { level: "error", why: "字幕の帯に小道具がかかっています" },
};

export const MIN_FONT_PX = 28;   // これより小さい文字は作らない（docs/brand.md）
/** 字幕の帯の上に空ける間（px）。帯のすぐ上に出典や文字があると、字幕とくっついて読みにくい（2026-10-05 オーナー） */
export const SUB_GAP = 28;
const MIN_OVERLAP = 4;           // 4px 未満の接触は見逃す（線の太さの誤差）
/** 上下に並んだ文字の間に空ける間（px）。これより近いと詰まって見える（2026-10-06 オーナー「文字の間隔が限りなく近い」） */
export const TEXT_GAP = 16;
/** 大きな数字（この大きさ以上）には単位を付ける（2026-10-06 オーナー「約73 では何か分からない。73% と書く」） */
const BIG_NUMBER_PX = 56;
const UNIT = /[%％倍人組件歳年月日円万億割位回個分秒点枚通位つ]/; // つ：「0つ」の数の札（2026-10-07 7本目）

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
      // 字幕の帯は、上に SUB_GAP だけ広げて調べる（帯にくっついているものも直すものにする）
      const grow = (q: QABox) => (q.kind === "sub" ? { ...q, y: q.y - SUB_GAP, h: q.h + SUB_GAP } : q);
      if (!inter(grow(a), grow(b)) || related(a, b)) continue;
      const near = (a.kind === "sub" || b.kind === "sub") && !inter(a, b);
      out.push({ level: rule.level, rule: key, message: near ? `字幕の帯に近すぎます（上に${SUB_GAP}px空ける）：「${a.label}」と「${b.label}」` : `${rule.why}：「${a.label}」と「${b.label}」`, boxes: [a, b] });
    }
    if (a.kind === "text") {
      // 単位のない大きな数字（目盛りのような小さな数字は見ない。単位が隣の文字に分かれていれば、まわりの文字で見る）
      if (/^約?[\d.,]+$/.test(a.label) && (a.fontPx ?? 0) >= BIG_NUMBER_PX * canvas.fontScale && !UNIT.test(a.context ?? "")) {
        out.push({ level: "warn", rule: "unit", message: `大きな数字に単位がない（%・人・組 などを付ける）：「${a.label}」`, boxes: [a] });
      }
      if (a.fontPx !== undefined && a.fontPx < MIN_FONT_PX * canvas.fontScale - 0.5) {
        out.push({ level: "error", rule: "font", message: `文字が小さすぎます（${a.fontPx.toFixed(0)}px、${MIN_FONT_PX}px 以上）：「${a.label}」`, boxes: [a] });
      }
      // 画面に出入りする途中（章の扉のワイプなど）は data-qa-allow="edge" で見逃す（2026-10-10）
      if (!a.allow.includes("edge") && (a.x < -1 || a.y < -1 || a.x + a.w > canvas.w + 1 || a.y + a.h > canvas.h + 1)) {
        out.push({ level: "error", rule: "edge", message: `文字が画面の外にはみ出しています：「${a.label}」`, boxes: [a] });
      } else if (canvas.unsafeBottom > 0 && a.y + a.h > canvas.h - canvas.unsafeBottom + 2) {
        out.push({ level: "error", rule: "bottom", message: `文字が再生バーの重なる下${canvas.unsafeBottom}pxに入っています：「${a.label}」`, boxes: [a] });
      }
    }
  }
  return out;
};

/** 色が墨・灰に近いか（彩度が低い）。rgb は 0〜255 */
const neutral = ([r, g, b]: [number, number, number]) => Math.max(r, g, b) - Math.min(r, g, b) < 48;

/**
 * 比べる線（同じグラフの折れ線2〜4本）が、墨・灰の濃淡だけで描き分けられていないか（2026-10-06 オーナー「黒系だとわかりにくい」）。
 * 1本だけ目立たせて残りを灰にする形（注目の1本＋背景）は、線が5本以上のときだけ許す。
 */
export const checkSeriesColors = (groups: { box: QABox; rgb: [number, number, number] }[][]): QAIssue[] =>
  groups.filter((g) => g.length >= 2 && g.length <= 4 && g.every((s) => neutral(s.rgb))).map((g) => ({
    level: "warn" as const, rule: "series-color",
    message: `比べる線が墨・灰の濃淡だけで見分けにくい（意味の色を付ける）：${g.map((s) => `「${s.box.label}」`).join("と")}`,
    boxes: g.map((s) => s.box),
  }));

/**
 * 上下に並んだ文字が近すぎないか。横に重なっていて、上下の間が TEXT_GAP 未満の組を「確かめる」にする。
 * 同じ札・同じ表の行の中（親子）は related で除く。
 */
export const checkTextGaps = (boxes: QABox[], related: (a: QABox, b: QABox) => boolean, scale = 1): QAIssue[] => {
  const t = boxes.filter((b) => b.kind === "text");
  const out: QAIssue[] = [];
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) {
    const [a, b] = t[i].y <= t[j].y ? [t[i], t[j]] : [t[j], t[i]];
    const wide = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const gap = b.y - (a.y + a.h);
    if (wide < 40 || gap < 0 || gap >= TEXT_GAP * scale || related(a, b)) continue;
    out.push({ level: "warn", rule: "gap", message: `文字の上下が近すぎます（${gap.toFixed(0)}px、${TEXT_GAP}px 以上空ける）：「${a.label}」と「${b.label}」`, boxes: [a, b] });
  }
  return out;
};

/** 「模式図」と書いた画面に、数字（%・倍など）がひとつもないか（2026-10-06 オーナー「パーセントの数字はスライドに入れよう」） */
export const checkSchematic = (boxes: QABox[]): QAIssue[] => {
  const texts = boxes.filter((b) => b.kind === "text");
  const note = texts.find((b) => (b.context ?? b.label).includes("模式図"));
  if (!note) return [];
  const hasNumber = texts.some((b) => /\d+(\.\d+)?\s*[%％倍]/.test(b.context ?? b.label));
  return hasNumber ? [] : [{ level: "warn", rule: "schematic", message: "模式図に数字がない。論文の数字（%・倍など）を画面に入れる", boxes: [note] }];
};
