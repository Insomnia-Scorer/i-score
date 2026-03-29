// src/components/header.tsx
"use client";

import React from "react";
/**
 * 💡 究極のヘッダー・コンポーネント
 * 1. 役割: 現在のページタイトルの表示、通知、テーマ切り替え、チーム情報の集約。
 * 2. 意匠: 影を排除し、背景透過 (bg-background/40) とブラー (backdrop-blur-md) で質感を表現。
 * 3. 連携: ThemeToggle を組み込み、PC版でのクイックなモード変更を実現。
 * 4. 応答性: モバイル時はコンパクトなロゴを表示し、デスクトップ時はチームバッジを表示。
 */
import { usePathname } from "next/navigation";
import { Bell, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname() || "";

  // パス名から現在のページタイトルを抽出 (例: /dashboard -> DASHBOARD)
  const getPageTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "(protected)" || segment === "protected") return "DASHBOARD";
    return segment.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/40 backdrop-blur-md border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            左側: ロゴ (モバイル用) & タイトル
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex items-center gap-4">
          {/* モバイル用ミニロゴ: PCサイドバーが隠れている時に表示 */}
          <div className="md:hidden h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src="/logo.png" alt="i-Score" className="h-6 w-6 object-contain" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter text-foreground uppercase leading-none">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-1 opacity-40 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest">Tactical Hub</span>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            右側: ツールエリア (テーマ・通知・チーム)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex items-center gap-2">

          {/* PC版：所属チームバッジ */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary mr-2 transition-colors hover:bg-primary/10">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black tracking-[0.15em] uppercase whitespace-nowrap">Prime Bears</span>
          </div>

          {/* 🌗 究極UI: テーマ切り替え (PC版はアイコン循環型) */}
          <ThemeToggle variant="icon" />

          {/* 通知ボタン */}
          <button className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90 shadow-none border-none">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {/* 通知バッジ (Stadium Sync 赤) */}
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          </button>

        </div>
      </div>

      {/* ヘッダー下部の微細なアクセントライン (Stadium Sync) */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-50" />
    </header>
  );
}