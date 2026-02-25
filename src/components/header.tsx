// src/components/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  ClipboardList 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // 💡 クラス結合用に追加

export function Header() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            {/* モバイル用ハンバーガーのプレースホルダー */}
            <div className="md:hidden h-10 w-10" />
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <span className="font-bold text-2xl tracking-tighter text-primary">i-Score</span>
            </Link>
          </div>
          <div className="h-8 w-8" />
        </div>
      </header>
    );
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  
  // 💡 モバイルメニューの開閉状態
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          closeMenu();
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

          {/* 左側：ハンバーガーボタン & ロゴ */}
          <div className="flex items-center gap-4">
            
            {/* 💡 モバイルのみ表示される「≡」ボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <span className="font-bold text-2xl tracking-tighter text-primary">
                i-Score
              </span>
            </Link>

            {/* 💡 PC用ナビゲーション (md以上で表示) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-4">
              <Link href="/" className="transition-colors hover:text-primary flex items-center gap-2">
                <Home className="h-4 w-4" /> ホーム
              </Link>
              {session && (
                <Link href="/dashboard" className="transition-colors hover:text-primary flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> スコア登録
                </Link>
              )}
            </nav>
          </div>

          {/* 右側：ユーザーメニュー & テーマ */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{session.user.name}</span>
                </div>
                {/* 💡 PC用のログアウトボタン */}
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex text-muted-foreground hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
               // 💡 ログインしていない時のボタン
              <div className="flex items-center gap-2">
                <Button size="sm" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================
          💡 モバイル用スライドメニュー (Drawer)
      ========================================= */}
      
      {/* 1. 背景の半透明オーバーレイ（メニューが開いている時だけ表示・クリックで閉じる） */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* 2. 左からスライドしてくるメニュー本体 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-3/4 max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* メニューのヘッダー部分 */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="font-bold text-xl text-primary tracking-tighter">i-Score</span>
          <button 
            onClick={closeMenu}
            className="p-2 -mr-2 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* メニューのリンク一覧 */}
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <nav className="flex flex-col gap-2 px-4">
            <Link 
              href="/" 
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              <Home className="h-5 w-5 text-muted-foreground" /> ホーム
            </Link>
            
            {session && (
              <Link 
                href="/dashboard" 
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-muted transition-colors"
              >
                <ClipboardList className="h-5 w-5 text-muted-foreground" /> スコア登録
              </Link>
            )}
          </nav>
        </div>

        {/* メニューのフッター（ログアウト/ユーザー情報） */}
        {session && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center gap-3 px-3">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">ログイン中</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
