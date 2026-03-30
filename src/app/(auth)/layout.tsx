// src/app/(auth)/layout.tsx
"use client";

import React from "react";
/**
 * 💡 認証ページ共通レイアウト
 * 1. 意匠: (protected) 側と同様に bg-transparent を維持し、globals.css の背景を透過。
 * 2. 構造: ログイン・登録画面を中央に配置するための Flexbox コンテナ。
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-transparent overflow-hidden">
      {/* 🏟 コンテンツ本体 */}
      <main className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {children}
      </main>
      
      {/* 下部のブランド装飾 */}
      <div className="absolute bottom-8 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] font-black tracking-[1em] uppercase text-foreground">
          i-Score Tactical Intelligence
        </p>
      </div>
    </div>
  );
}
