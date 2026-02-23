// src/components/header.tsx
"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  // 💡 sticky で上部固定、backdrop-blur で背面を美しくぼかします
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        
        {/* 左側：アプリのロゴ / タイトル */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <span className="font-bold text-xl tracking-tight text-foreground">
              i-Score
            </span>
          </Link>
        </div>

        {/* 右側：テーマ切り替えトグル（＆将来のユーザーメニュー） */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
        
      </div>
    </header>
  );
}