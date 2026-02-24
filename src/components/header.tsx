// src/components/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { UserCircle, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // マウント前は静的なロゴ部分のみ表示し、フック(useSession/useRouter)の評価も避ける
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <span className="font-bold text-2xl tracking-tighter text-primary">i-Score</span>
            </Link>
          </div>
          <div className="h-8 w-8" /> {/* プレースホルダー */}
        </div>
      </header>
    );
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

        {/* 左側：アプリのロゴ / タイトル */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <span className="font-bold text-2xl tracking-tighter text-primary">
              i-Score
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary">
              ホーム
            </Link>
            {session && (
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                スコア登録
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
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">登録</Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}