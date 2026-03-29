"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (究極の整理整頓版)
 * 1. 整理: メニュー定義を src/config/navigation.ts へ分離し、ロジックをクリーンに。
 * 2. レイアウト: padding-left (pl) による安全なサイドバー・オフセットで横溢れを防止。
 * 3. 意匠: 影なし・透過・Stadium Sync 背景を全画面で同期。
 * 4. 安定性: ビルドエラー回避のため、相対パスでのインポートを徹底。
 */
import { usePathname, useRouter } from "next/navigation";

// 💡 整理された設定とコンポーネントをインポート (相対パス)
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

  // 💡 UI状態管理
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 💡 セッション情報のモック (実際の実装に合わせて調整してください)
  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  /**
   * 💡 共通ナビゲーション処理
   */
  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false); // ナビゲーション実行時にドロワーを閉じる
  };

  const handleLogout = () => {
    console.log("Logout triggered");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col overflow-x-hidden">

      {/* 💻 PC版サイドバー (md以上) */}
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

      {/* 🏟 メインコンテンツエリア */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-screen",
        // サイドバーの幅に合わせてコンテンツの左側に余白 (padding) を確保
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>

        {/* 共通ヘッダー */}
        <Header />

        {/* モバイル時はボトムナビゲーション用に pb-24 の余白を確保し、
          コンテンツがナビゲーションの下に隠れないようにします。
        */}
        <main className="flex-1 pb-24 md:pb-8 relative">
          {/* STADIUM SYNC: 全画面共通背景グラデーション */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

          <div className="w-full h-full relative z-0">
            {children}
          </div>
        </main>
      </div>

      {/* 📱 モバイル：ボトムナビゲーション (md未満) */}
      <BottomNavigation
        activeTab={pathname}
        onNavigate={handleNavigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 📱 モバイル：設定ドロワー */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}