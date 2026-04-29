// filepath: `src/app/(public)/layout.tsx`
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 💡 シンプルな共通ヘッダー（ボトムナビはここには含めない） */}
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link href="/" className="text-xl font-black italic tracking-tighter text-primary hover:opacity-80 transition-opacity">
          iScoreCloud
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-xs font-bold">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button size="sm" asChild className="text-xs font-bold rounded-full">
            <Link href="/register">新機能を試す</Link>
          </Button>
        </div>
      </header>

      {/* 💡 コンテンツエリア：読みやすさを重視した幅設定 */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-16 px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* 💡 シンプルなフッター */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 iScoreCloud. Baseball Scorekeeping Evolution.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">プライバシーポリシー</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
