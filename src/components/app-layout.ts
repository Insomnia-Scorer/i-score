// src/components/app-layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// 💡 スコアブックアプリ用のメニュー項目
const navigation = [
  { name: "ダッシュボード", href: "/", icon: Home },
  { name: "試合・スコア", href: "/matches", icon: ClipboardList },
  { name: "チーム・選手", href: "/team", icon: Users },
  { name: "設定", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  // 💡 メニューのリスト部分（PC・モバイル共通で使用）
  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
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

      {/* 💡 モバイル用ヘッダー＆スライドメニュー (mdサイズ未満で表示) */}
      <div className="flex flex-1 flex-col md:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            {/* 左側からスライドインする設定 (side="left") */}
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>
              <div className="flex h-14 items-center border-b px-4">
                <span className="font-bold text-lg tracking-tight">i-Score</span>
              </div>
              <div className="flex flex-col h-[calc(100vh-3.5rem)] justify-between">
                <div className="overflow-y-auto">
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
            </SheetContent>
          </Sheet>
          {/* モバイルヘッダーのタイトル */}
          <span className="font-bold text-lg sm:hidden">i-Score</span>
        </header>

        {/* 💡 メインコンテンツ領域 */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
