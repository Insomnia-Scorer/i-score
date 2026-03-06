// src/components/pwa-register.tsx
"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    // ブラウザが Service Worker に対応しているかチェック
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker 登録成功:", registration.scope);
          })
          .catch((error) => {
            console.error("Service Worker 登録失敗:", error);
          });
      });
    }
  }, []);

  // 画面には何も表示しない裏方コンポーネントです
  return null;
}
