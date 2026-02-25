// src/components/app-layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // すでにあるボタンコンポーネントを使用
import { 
  Menu, 
  Home, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  X 
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { name: "ダッシュボード", href: "/", icon: Home },
  { name: "試合・スコア", href: "/matches", icon: ClipboardList },
  { name: "チーム・選手", href: "/team", icon: Users },
  { name: "設定", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // 💡 モバイルメニューの開閉状態を管理する State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  // メニューを閉じる関数
  const closeMenu = () => setIsMobileMenuOpen(false);

  // 💡 ナビゲーションリンク（PC・モバイル共通）
  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMenu} // 💡 リンクをタップしたら自動でメニューを閉じる
            className={cn(
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
            )}
          >
            <item.icon
              className={cn(
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                "mr-3 h-5 w-5 flex-shrink-0"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      
      {/* 💡 PC用サイドバー (mdサイズ以上で表示) */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <span className="font-bold text-lg tracking-tight">i-Score</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            ログアウト
          </Button>
        </div>
      </aside>

      {/* モバイル＆メインコンテンツ領域 */}
      <div className="flex flex-1 flex-col md:pl-0">
        
        {/* 💡 モバイル用ヘッダー (mdサイズ未満で表示) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Button size="icon" variant="outline" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </Button>
          <span className="font-bold text-lg tracking-tight">i-Score</span>
        </header>

        {/* 💡 モバイル用: 背景の半透明オーバーレイ (メニューが開いている時だけ表示) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
            onClick={closeMenu}
          />
        )}

        {/* 💡 モバイル用: 左からスライドインするメニュー本体 */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="font-bold text-lg tracking-tight">i-Score</span>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-5 w-5" />
              <span className="sr-only">メニューを閉じる</span>
            </Button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <NavLinks />
          </div>
          <div className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </div>

        {/* 💡 メインコンテンツ (ダッシュボードの中身などがここに入ります) */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
