"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (デプロイ安定版)
 * 1. 修正: 背景グラデーションを HSL 形式に変更し、デプロイ環境での表示不良を解消。
 * 2. 修正: 画面の横揺れを防ぐため、最外枠に overflow-x-hidden を適用。
 * 3. 構造: サイドバー(fixed)とメインコンテンツ(padding-left制御)の分離を強化。
 * 4. 応答性: モバイル版ボトムナビの表示スペース (pb-24) を確実に確保。
 */
import { usePathname, useRouter } from "next/navigation";

// 💡 整理された設定とコンポーネントをインポート
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

  // UI状態管理
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // セッション情報のモック (実際の auth-client 等に合わせて調整)
  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  /**
   * 💡 共通ナビゲーション処理
   */
  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    console.log("Logout triggered");
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">

      {/* 1. 全画面共通：究極の5%背景グラデーション (Stadium Sync) 
          pointer-events-none を付与してクリック操作を邪魔しないようにします */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.05), transparent)'
        }}
      />

      {/* 💻 PC版サイドバー (fixed: z-50) */}
      <Sidebar
        session={session}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={isUploadingAvatar}
        onLogout={handleLogout}
      />

      {/* 🏟 メインコンテンツラッパー */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        // サイドバーの幅に応じてコンテンツを右に押し出す
        isCollapsed ? "md:ml-16" : "md:ml-56"
      )}>

        {/* 共通ヘッダー (sticky: z-40) */}
        <Header />

        {/* スクロール領域 */}
        <main className="flex-1 w-full relative">
          <div className={cn(
            "p-4 md:p-8 transition-all duration-500",
            // モバイルボトムナビ (h-16) のための余白
            "pb-24 md:pb-12"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* 📱 モバイル：ボトムナビゲーション (fixed: z-[100]) */}
      <BottomNavigation
        activeTab={pathname}
        onNavigate={handleNavigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 📱 モバイル：設定ドロワー (fixed: z-[110]) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}