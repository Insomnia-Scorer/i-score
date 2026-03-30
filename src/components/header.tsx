// src/components/header.tsx
"use client";

import React from "react";
/**
 * 💡 究極のヘッダー (モバイル固定強化版)
 * 1. 修正: sticky top-0 を維持しつつ、モバイルでの視認性を向上。
 * 2. 意匠: 
 * - 背景を bg-background/60 (60%透過) にし、backdrop-blur-xl で強力にぼかす。
 * - 下部の境界線を 0.5px 相当の極細ライン (border-border/40) に。
 * 3. 応答性: モバイル時にロゴとタイトルが窮屈にならないよう微調整。
 */
import { usePathname } from "next/navigation";
import { Bell, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  const pathname = usePathname() || "";
  
  const getPageTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "(protected)" || segment === "protected") return "DASHBOARD";
    return segment.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* 左側: モバイルロゴ & タイトル */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="md:hidden h-8 w-8 rounded-lg bg-card border border-border/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src="/logo.png" alt="i-Score" className="h-5 w-5 object-contain" />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-foreground uppercase leading-none">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-1 opacity-40 md:hidden">
              <Zap className="h-2 w-2 text-primary" />
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">Live Operation</span>
            </div>
          </div>
        </div>

        {/* 右側: ツールエリア */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* PC版：カラーテーマ切り替え */}
          <div className="hidden lg:block mr-2">
            <ThemeSwitcher variant="dropdown" />
          </div>

          {/* PC版：所属チームバッジ */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary mr-1">
            <Shield className="h-3 w-3" />
            <span className="text-[9px] font-black tracking-widest uppercase whitespace-nowrap">Prime Bears</span>
          </div>

          <ThemeToggle variant="icon" />

          <button className="relative p-2 sm:p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          </button>
        </div>
      </div>

      {/* ヘッダー下部の Stadium Sync アクセントライン */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </header>
  );
}
