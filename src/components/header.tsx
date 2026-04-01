// src/components/header.tsx
"use client";

import React from "react";
/**
 * 💡 究極のヘッダー (モバイル固定強化版 + 屋外視認性アップ✨)
 * 1. 修正: sticky top-0 を維持しつつ、ライトモード時は bg-white/95 で白をパキッと強調し、太陽光下での視認性を極限まで高める🔥
 * 2. 意匠: ダークモード時は従来の bg-background/60 + backdrop-blur-xl を維持。
 * 3. 機能: 右上にログインユーザーのアバターを配置し、現在のアカウント（記録者）を一目で確認できるように！
 */
import { usePathname } from "next/navigation";
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

// 呼び出し元(Layout等)から user を受け取れるようにPropsを拡張
interface HeaderProps {
  user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname() || "";
  
  const getPageTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "(protected)" || segment === "protected") return "DASHBOARD";
    return segment.toUpperCase();
  };

  return (
    // ✨ 変更点: ライトモード時は bg-white/95、ダークモード時は dark:bg-background/60 となるように修正
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* 左側: モバイルロゴ & タイトル */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="md:hidden h-8 w-8 rounded-lg bg-white dark:bg-card border border-border/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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

          {/* PC版：所属チームバッジ (userプロパティがあればそれを優先表示) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-primary/5 border border-primary/20 text-primary mr-1 shadow-sm dark:shadow-none">
            <Shield className="h-3 w-3" />
            <span className="text-[9px] font-black tracking-widest uppercase whitespace-nowrap">
              {user?.teamName || "Prime Bears"}
            </span>
          </div>

          <ThemeToggle variant="icon" />

          {/* 通知ベル（ライトモード時の視認性を上げるためhover時の背景色を調整） */}
          <button className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-background animate-pulse" />
          </button>

          {/* ✨ 追加: ログインアバター */}
          <div className="ml-1 sm:ml-2">
            {user ? (
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm transition-transform hover:scale-105 dark:border-border/50 cursor-pointer">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              // 未ログイン/データ取得中のフォールバックUI（現場でのチラつき防止）
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
