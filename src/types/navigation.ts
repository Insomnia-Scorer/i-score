import React from "react";

/**
 * 💡 ナビゲーション・アイテム定義
 * 1. 互換性: 既存の (name, href, icon, show, exact) を完全継承。
 * 2. 拡張性: 通知バッジ (badge) や、特定の権限が必要な場合 (requiredRole) にも対応可能。
 */
export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    show: boolean;
    exact?: boolean;
    badge?: number;
}

/**
 * 💡 PC用サイドバー・プロパティ
 */
export interface SidebarProps {
    session: any; // 認証セッション情報
    pathname: string;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    mainNavItems: NavItem[];
    bottomNavItems: NavItem[];
    onClickAvatar: () => void;
    isUploadingAvatar: boolean;
    onLogout: () => void;
}

/**
 * 💡 モバイル用ボトムナビゲーション・プロパティ
 */
export interface BottomNavigationProps {
    activeTab: string; // 現在の pathname
    onNavigate: (path: string, id: string) => void;
    onOpenDrawer: () => void;
}

/**
 * 💡 モバイル用ドロワー・プロパティ
 */
export interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string, id: string) => void;
}

/**
 * 💡 ヘッダー・プロパティ (将来的な拡張用)
 */
export interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    onBack?: () => void;
}