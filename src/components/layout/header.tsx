// src/components/layout/header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Crown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { UserSession } from "@/types/auth";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localActiveTeamId, setLocalActiveTeamId] = useState<string | null>(null);

  useEffect(() => {
    setLocalActiveTeamId(localStorage.getItem("iScore_selectedTeamId"));

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        const json = await response.json() as AuthResponse;
        if (json.success) setUser(json.data);
      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => router.push("/login");

  const handleTeamSwitch = (teamId: string, orgId?: string) => {
    localStorage.setItem("iScore_selectedTeamId", teamId);
    if (orgId) localStorage.setItem("iScore_selectedOrgId", orgId);
    setLocalActiveTeamId(teamId);
    window.location.href = "/dashboard"; // リロードして状態を最新化
  };

  const activeTeam = user?.memberships?.find(m => m.teamId === localActiveTeamId)
    || user?.memberships?.find(m => m.teamId === user.currentTeamId)
    || user?.memberships?.find(m => m.isMainTeam)
    || user?.memberships?.[0];

  const isAdmin = (user as any)?.role === 'SYSTEM_ADMIN' || (user as any)?.systemRole === 'SYSTEM_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 sm:h-20 items-center justify-between px-3 sm:px-8">

        {/* 左側: モバイルロゴ & アプリタイトル */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <img src="/logo.png" alt="i-Score Logo" className="md:hidden h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/dashboard')} />
          <div className="flex flex-col justify-center cursor-pointer" onClick={() => router.push('/dashboard')}>
            <h1 className="text-xl sm:text-3xl font-black italic tracking-tighter text-foreground leading-none">i-Score</h1>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 md:hidden">
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary fill-primary hidden sm:block" />
              <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-muted-foreground whitespace-nowrap hidden min-[380px]:block">野球の今を、次世代へ。</span>
            </div>
          </div>
        </div>

        {/* 右側: ツールエリア (切り出したコンポーネントを配置！) */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 w-full justify-end">

          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm select-none">
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-amber-500/30 bg-amber-500/20 flex items-center justify-center shrink-0">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Avatar>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase truncate leading-tight">SYS ADMIN</span>
                <span className="text-[6px] sm:text-[7px] font-bold opacity-80 uppercase truncate leading-none mt-0.5">運営管理者</span>
              </div>
            </div>
          )}

          {/* チームスイッチャー（子コンポーネント） */}
          <TeamSwitcher
            activeTeam={activeTeam}
            memberships={user?.memberships || []}
            onTeamSwitch={handleTeamSwitch}
          />

          {/* ユーザープロファイルメニュー（子コンポーネント） */}
          <UserProfileMenu
            user={user}
            isLoading={isLoading}
            onLogout={handleLogout}
          />

        </div>
      </div>
      <div className="h-[1px] sm:h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </header>
  );
}