// src/components/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 💡 usePathname を追加
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
import { cn } from "@/lib/utils";

// 💡 メニューの項目を配列で管理してスッキリさせます
const NAV_ITEMS = [
  { name: "ホーム", href: "/", icon: Home },
  { name: "スコア登録", href: "/dashboard", icon: ClipboardList },
];

export function Header() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="md:hidden h-10 w-10" />
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tighter text-primary">i-Score</span>
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
  const pathname = usePathname(); // 💡 現在のURLパスを取得
  
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
      {/* 💡 PC・モバイル共通ヘッダー： backdrop-blur-md で美しいすりガラスに */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground transition-all duration-300">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

          <div className="flex items-center gap-4">
            {/* モバイル用「≡」ボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-full text-foreground hover:bg-muted/80 transition-all active:scale-95"
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center space-x-2 group">
              <span className="font-extrabold text-2xl tracking-tighter text-primary group-hover:opacity-80 transition-opacity">
                i-Score
              </span>
            </Link>

            {/* 💡 PC用ナビゲーション */}
            <nav className="hidden md:flex items-center gap-2 ml-6 text-sm font-medium">
              {NAV_ITEMS.map((item) => {
                // セッションがない時は「スコア登録」を隠す
                if (item.href === "/dashboard" && !session) return null;
                const isActive = pathname === item.href;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" /> 
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                  <UserCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{session.user.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button size="sm" className="rounded-full px-6 shadow-sm transition-transform hover:scale-105" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================
          💡 モバイル用スライドメニュー (Drawer)
      ========================================= */}
      
      {/* 背景オーバーレイ */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* 💡 スライドメニュー本体： bg-background/95 と backdrop-blur-xl で高級感を演出 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-background/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 pt-2">
          <span className="font-extrabold text-2xl text-primary tracking-tighter">i-Score</span>
          <button 
            onClick={closeMenu}
            className="p-2 -mr-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6">
          <nav className="flex flex-col gap-2 px-4">
            {NAV_ITEMS.map((item) => {
              if (item.href === "/dashboard" && !session) return null;
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md transform scale-[1.02]" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} /> 
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 💡 リッチなユーザープロフィールカード */}
        {session && (
          <div className="p-4 pb-8">
            <div className="rounded-2xl bg-muted/50 border border-border/50 p-4 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
