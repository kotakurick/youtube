// 動画（コンポジション）ごとに、フォントの読み込みを待ってから描く。Root.tsx がすべての動画と静止画をこれで包む。
import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { ensureFont } from "./theme";

export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("フォント（Noto Sans JP）の読み込み"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureFont().then(() => { setReady(true); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [handle]);
  return ready ? <>{children}</> : null;
};

/** 部品を FontGate で包む（props はそのまま渡す） */
export const withFont = <P extends object>(C: React.ComponentType<P>): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => <FontGate><C {...props} /></FontGate>;
  return Wrapped;
};
