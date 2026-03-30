// src/app/(protected)/layout.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (透過背景・決定版)
 * 1. 修正: 最外枠の `bg-background` を削除し、`bg-transparent` に変更。
 * 2. 修正: 独自に追加していた背景グラデーションの div を撤去し、globals.css に一任。
 * これにより、全画面で globals.css の「光彩＋波紋」が完璧に表示されます。
 */
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "../../config/navigation";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";
import { BottomNavigation } from "../../components/bottom-navigation";
import { MobileDrawer } from "../../components/mobile-drawer";
import { cn } from "../../lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    // 💡 bg-background を削除し、背景を完全に透過させます
    <div className="relative flex min-h-screen w-full bg-transparent text-foreground selection:bg-primary/20">
      
      {/* 💻 PC版サイドバー (z-50) */}
      <Sidebar
        session={session}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={isUploadingAvatar}
        onLogout={() => console.log("Logout")}
      />

      {/* 🏟 メインコンテンツラッパー */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>
        
        {/* 🏆 ヘッダー */}
        <Header />

        {/* コンテンツ本体 */}
        <main className="flex-1 w-full relative z-0">
          <div className={cn(
            "w-full max-w-7xl mx-auto p-4 md:p-8",
            "pb-24 md:pb-12"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* 📱 モバイルパーツ */}
      <div className="md:hidden">
        <BottomNavigation
          activeTab={pathname}
          onNavigate={handleNavigate}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
