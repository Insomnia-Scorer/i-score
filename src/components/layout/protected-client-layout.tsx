"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/config/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileDrawer } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

// ❌ ここにあった Header と BottomNavigation のインポートを削除しました！

export function ProtectedClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const { data: session, isPending } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session || !session.user) {
        router.replace("/login");
      } else if (session.user.role === "GUEST") {
        router.replace("/pending-approval");
      }
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    toast.info("ログアウトしています...", {
      description: "お疲れ様でした。ゲートへ戻ります。",
      duration: 1500
    });
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      toast.error("ログアウトに失敗しました。");
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  if (isPending || !session || session.user.role === "GUEST") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[60px] -z-10" />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userSession = {
    user: {
      name: session.user.name,
      role: session.user.role,
      image: session.user.image,
    }
  };

  return (
    // 💡 min-h-screen を外して、AppShellに高さを委ねます
    <div className="relative flex w-full bg-transparent text-foreground selection:bg-primary/20">

      {/* PC用サイドバー */}
      <Sidebar
        session={userSession}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={false}
        onLogout={handleLogout}
      />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>
        {/* ❌ ここにあった <Header /> を削除！ (AppShellが上から被せてくれます) */}

        <main className="flex-1 w-full relative z-0">
          <div className={cn("w-full max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-12")}>
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden">
        {/* ❌ ここにあった <BottomNavigation /> を削除！ (AppShellが下から被せてくれます) */}

        {/* モバイル用ドロワーメニュー */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}