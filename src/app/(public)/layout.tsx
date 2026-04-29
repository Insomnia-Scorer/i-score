// filepath: `src/app/(public)/layout.tsx`
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* 🚀 LP共通ヘッダー：トップページと全く同じデザインを適用 */}
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black italic tracking-tighter text-primary hover:opacity-80 transition-opacity">
            iScoreCloud
          </Link>
          {/* デスクトップ向けの簡易ナビ（必要なら） */}
          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">FEATURES</Link>
            <Link href="/#pricing" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">PRICING</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-xs font-bold">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button size="sm" asChild className="text-xs font-bold rounded-full px-5">
            <Link href="/register">無料で始める</Link>
          </Button>
        </div>
      </header>

      {/* 🏟 コンテンツエリア：余白を抑えつつ、背景との一体感を出す */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-10 px-4">
        {/* 背景のグロー（LPの雰囲気を踏襲） */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="relative">
          {children}
        </div>
      </main>

      {/* 🚀 LP共通フッター：トップページのフッター構造と同期 */}
      <footer className="border-t border-border/40 bg-muted/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-xl font-black italic tracking-tighter text-primary">
                iScoreCloud
              </Link>
              <p className="mt-4 text-xs text-muted-foreground max-w-xs leading-relaxed">
                野球スコアの記録を、究極の体験へ。
                Pixel 10 Pro に最適化された次世代のスコアリングプラットフォーム。
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black tracking-widest text-foreground mb-4 uppercase">Product</h4>
              <ul className="space-y-2 text-xs text-muted-foreground font-bold">
                <li><Link href="/#features" className="hover:text-primary transition-colors">機能</Link></li>
                <li><Link href="/#pricing" className="hover:text-primary transition-colors">料金プラン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black tracking-widest text-foreground mb-4 uppercase">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground font-bold">
                <li><Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-8 text-center">
            <p className="text-[10px] text-muted-foreground/60 font-medium">
              © 2026 iScoreCloud. Baseball Evolution Starts Here.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
