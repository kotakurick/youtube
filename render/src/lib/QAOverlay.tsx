// チェックの画面（npm run check のときだけ出る）。描き終わった画面から、文字・人型・ゴサ・グラフなどの箱を実際の位置で測り、
// qa.ts の決まりで問題を探す。問題のある箱を赤（直すもの）と橙（確かめるもの）の枠で囲み、結果を "QA:" で始まる1行で書き出す。
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
import { checkBoxes, checkSeriesColors, QABox, QAIssue, QAKind } from "./qa";

export const qaEnabled = () => {
  try { return Boolean((getInputProps() as { qa?: boolean }).qa); } catch { return false; }
};

/** 祖先まで含めた見え方（opacity の積）。0.2 未満は「まだ見えていない」として調べない */
const visible = (el: Element) => {
  let o = 1;
  for (let e: Element | null = el; e; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.display === "none" || s.visibility === "hidden") return false;
    o *= Number(s.opacity || 1);
  }
  return o >= 0.2;
};

const short = (s: string) => (s.length > 14 ? s.slice(0, 14) + "…" : s);

const collect = (): { boxes: QABox[]; els: Element[] } => {
  const root = document.body;
  const boxes: QABox[] = [];
  const els: Element[] = [];
  const push = (el: Element, kind: QAKind, r: DOMRect, label: string, fontPx?: number) => {
    if (r.width < 1 || r.height < 1) return;
    // 重なってよい相手は、自分と親の印をすべて合わせる（例：寄りの画面の中の、名札つきの人型）
    const allow: string[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) allow.push(...(e.getAttribute("data-qa-allow") ?? "").split(/\s+/).filter(Boolean));
    boxes.push({ id: boxes.length, kind, x: r.left, y: r.top, w: r.width, h: r.height, allow, label, fontPx });
    els.push(el);
  };
  // 印の付いた部品
  root.querySelectorAll("[data-qa]").forEach((el) => {
    const kind = el.getAttribute("data-qa") as QAKind | "bg" | "qa";
    if (kind === "bg" || kind === "qa" || el.parentElement?.closest("[data-qa=bg],[data-qa=qa]")) return;
    if (!visible(el) || el.closest("[data-qa-skip]")) return; // 動いている途中のものは調べない
    // 入れ子の同じ種類（人型の中の人型など）は外側だけ
    if (el.parentElement?.closest(`[data-qa=${kind}]`)) return;
    push(el, kind as QAKind, el.getBoundingClientRect(), el.getAttribute("data-qa-label") ?? kind);
  });
  // 文字（印がなくても拾う）。背景・字幕・ゴサの吹き出し・チェックの画面の中は除く
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent?.trim();
    const el = n.parentElement;
    if (!text || !el || el.closest("[data-qa=bg],[data-qa=sub],[data-qa=gosa],[data-qa=qa],style,script,title")) continue;
    if (!visible(el) || el.closest("[data-qa-skip]")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    // 画面上の文字の大きさ（拡大・縮小を含む）
    const size = parseFloat(getComputedStyle(el).fontSize || "0");
    let scale = 1;
    if (el instanceof SVGGraphicsElement) scale = el.getScreenCTM()?.a ?? 1;
    else { const b = el.getBoundingClientRect(); scale = (el as HTMLElement).offsetWidth ? b.width / (el as HTMLElement).offsetWidth : 1; }
    const fs = size * scale;
    // 文字の箱は、フォントの上下の余白を除いた「字の形」の高さにする（Noto Sans JP は行の箱が字より約1.45倍高い）
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const line of Array.from(range.getClientRects())) {
      if (line.width < 1) continue;
      const top = line.top + Math.max(0, (line.height - fs) * 0.62), h = Math.min(line.height, fs);
      x0 = Math.min(x0, line.left); x1 = Math.max(x1, line.right); y0 = Math.min(y0, top); y1 = Math.max(y1, top + h);
    }
    if (x0 === Infinity) continue;
    push(el, "text", new DOMRect(x0, y0, x1 - x0, y1 - y0), short(text), fs);
  }
  return { boxes, els };
};

export const QAOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [issues, setIssues] = useState<QAIssue[]>([]);
  useEffect(() => {
    const handle = delayRender("画面のチェック");
    // 描き終わってから測る（2回分の描画を待つ）
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const { boxes, els } = collect();
      const related = (a: QABox, b: QABox) => els[a.id].contains(els[b.id]) || els[b.id].contains(els[a.id]);
      const vertical = height > width;
      const found = checkBoxes(boxes, related, { w: width, h: height, unsafeBottom: vertical ? 0 : 80, fontScale: width < 1900 && !vertical ? width / 1920 : 1 });
      // 折れ線（data-qa-label が「線：」で始まる polyline）を、グラフ（svg）ごとにまとめて色を調べる
      const groups = new Map<Element, { box: QABox; rgb: [number, number, number] }[]>();
      boxes.forEach((b, i) => {
        const el = els[i];
        if (el.tagName.toLowerCase() !== "polyline" || !b.label.startsWith("線：")) return;
        const m = getComputedStyle(el).stroke.match(/\d+(\.\d+)?/g);
        const svg = (el as SVGElement).ownerSVGElement;
        if (!m || !svg) return;
        groups.set(svg, [...(groups.get(svg) ?? []), { box: b, rgb: [Number(m[0]), Number(m[1]), Number(m[2])] }]);
      });
      found.push(...checkSeriesColors([...groups.values()]));
      setIssues(found);
      console.debug("QA:" + JSON.stringify({ frame, issues: found.map((f) => ({ level: f.level, rule: f.rule, message: f.message })) }));
      requestAnimationFrame(() => continueRender(handle));
    }));
  }, [frame, width, height]);
  return (
    <div data-qa="qa" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {issues.map((f, i) => f.boxes.map((b, k) => (
        <div key={`${i}-${k}`} style={{ position: "absolute", left: b.x - 3, top: b.y - 3, width: b.w + 6, height: b.h + 6,
          border: `4px solid ${f.level === "error" ? "#FF1F1F" : "#FF9F1A"}`, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", left: -4, top: -30, background: f.level === "error" ? "#FF1F1F" : "#FF9F1A", color: "#fff",
            font: "700 20px sans-serif", padding: "1px 6px" }}>{i + 1}</div>
        </div>
      )))}
    </div>
  );
};
