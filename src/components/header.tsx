// src/components/header.tsx
/* 💡 究極のヘッダー (ブランド固定＆視認性強化版✨)
 * 1. 修正: ロゴの枠を外し、画像自体を少し大きく（h-8 w-8程度）表示して存在感をアップ。
 * 2. 修正: タイトルを "i-Score" に固定。各ページのタイトルはページ内のヘッダーに任せる。
 * 3. 意匠: サブタイトルに「野球の「今」を次世代の形へ」をセット。
 * 4. 継承: ライトモード時の屋外視認性アップ（bg-white/95）と右上のログインアバターは維持。
 */
"use client";

import React from "react";
import { Bell, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSwitcher } from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ユーザー情報の型定義 (any排除・安全確実な運用のため)
export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  teamName?: string;
}

interface HeaderProps {
  user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  // ※ タイトル固定のため、usePathname の呼び出しを削除しスッキリさせました！

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* 左側: モバイルロゴ & アプリタイトル (固定化) */}
        <div className="flex items-center gap-3">
          {/* ✨ 修正: 枠を削除し、ロゴ画像を直接配置してサイズアップ */}
          <img 
            src="/logo.png" 
            alt="i-Score Logo" 
            className="md:hidden h-9 w-9 object-contain shrink-0 drop-shadow-sm" 
          />
          
          <div className="flex flex-col justify-center">
            {/* ✨ 修正: タイトルを i-Score に固定し、ブランド感を強調 */}
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-foreground leading-none">
              i-Score
            </h1>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary fill-primary" />
              {/* ✨ 修正: サブタイトルを更新。英語にする場合はここを差し替えてください！ */}
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground whitespace-nowrap">
                野球の「今」を次世代の形へ
              </span>
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-primary/5 border border-primary/20 text-primary mr-1 shadow-sm dark:shadow-none">
            <Shield className="h-3 w-3" />
            <span className="text-[9px] font-black tracking-widest uppercase whitespace-nowrap">
              {user?.teamName || "Prime Bears"}
            </span>
          </div>

          <ThemeToggle variant="icon" />

          {/* 通知ベル */}
          <button className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-background animate-pulse" />
          </button>

          {/* ログインアバター */}
          <div className="ml-1 sm:ml-2">
            {user ? (
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm transition-transform hover:scale-105 dark:border-border/50 cursor-pointer">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm dark:border-border/50">
                 <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                   ?
                 </AvatarFallback>
              </Avatar>
            )}
          </div>

        </div>
      </div>

      {/* ヘッダー下部の Stadium Sync アクセントライン */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </header>
  );
}
