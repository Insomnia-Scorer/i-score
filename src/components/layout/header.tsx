// src/components/layout/header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Zap, LogOut, Settings, Users, Crown } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSession } from "@/types/auth";

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

        const json = await response.json();
        const result = json as AuthResponse;

        if (result.success) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    router.push("/login");
  };

  const activeTeam = user?.memberships?.find(m => m.teamId === user.currentTeamId)
    || user?.memberships?.find(m => m.isMainTeam)
    || user?.memberships?.[0];

  const isAdmin = (user as any)?.role === 'SYSTEM_ADMIN' || (user as any)?.systemRole === 'SYSTEM_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-3 sm:px-8">

        {/* 左側: モバイルロゴ & アプリタイトル */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="i-Score Logo"
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-lg sm:text-2xl font-black italic tracking-tighter text-foreground leading-none">
              i-Score
            </h1>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary fill-primary hidden sm:block" />
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-muted-foreground whitespace-nowrap hidden min-[380px]:block">
                野球の今を、次世代へ。
              </span>
            </div>
          </div>
        </div>

        {/* 右側: ツールエリア */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-hidden pl-2">

          <div className="hidden lg:block mr-2 shrink-0">
            <ThemeSwitcher variant="dropdown" />
          </div>

          {/* システム管理者バッジ (モバイル対応) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 mr-0.5 sm:mr-1 shadow-sm select-none max-w-[110px] sm:max-w-[200px]">
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-amber-500/30 bg-amber-500/20 flex items-center justify-center shrink-0">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Avatar>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase truncate leading-tight">
                  SYS ADMIN
                </span>
                <span className="text-[6px] sm:text-[7px] font-bold opacity-80 uppercase truncate leading-none mt-0.5">
                  運営管理者
                </span>
              </div>
            </div>
          )}

          {/* 🔥 チームバッジ C案 (モバイル対応のレスポンシブデザイン) */}
          {activeTeam && (
            <div
              onClick={() => router.push("/teams")}
              className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-border/50 text-foreground mr-0.5 sm:mr-1 shadow-sm hover:bg-background/80 hover:border-primary/30 transition-all cursor-pointer group max-w-[120px] min-[400px]:max-w-[150px] sm:max-w-[240px]"
              title="チームを切り替える"
            >
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-border/50 bg-primary/5 group-hover:border-primary/30 transition-colors shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-black text-[9px] sm:text-[10px]">
                  {((activeTeam as any).organizationName || activeTeam.teamName || "T").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-center overflow-hidden">
                {/* チーム名 (長ければ自動で...になる) */}
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase truncate leading-tight group-hover:text-primary transition-colors">
                  {(activeTeam as any).organizationName || activeTeam.teamName}
                </span>
                {/* 編成名 + 役割 */}
                <span className="text-[7px] font-bold text-muted-foreground uppercase truncate leading-none mt-0.5">
                  {(activeTeam as any).organizationName ? (
                    <>{activeTeam.teamName} <span className="opacity-60">({activeTeam.roleLabel})</span></>
                  ) : (
                    activeTeam.roleLabel
                  )}
                </span>
              </div>
            </div>
          )}

          <ThemeToggle variant="icon" />

          <button className="relative p-1.5 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90 shrink-0">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 border border-white dark:border-background animate-pulse" />
          </button>

          {/* アバター */}
          <div className="ml-0.5 sm:ml-2 flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-transform active:scale-95">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border/30 shadow-sm hover:scale-105 bg-background transition-transform">
                    {!isLoading && user ? (
                      <>
                        <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                          {(user.name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                        {isLoading ? "..." : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72 sm:w-64 rounded-xl border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl p-2 sm:p-1">
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal py-3 sm:py-1.5 px-3 sm:px-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base sm:text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-sm sm:text-xs leading-none text-muted-foreground mt-1">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />

                    {isAdmin && (
                      <div className="flex items-center gap-2 px-3 sm:px-2 py-3 sm:py-2 text-sm sm:text-xs bg-amber-500/10 dark:bg-amber-500/10 rounded-md mx-1 mb-1">
                        <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="font-semibold text-amber-600 dark:text-amber-400">システム管理者</span>
                        <span className="text-muted-foreground text-[10px] ml-auto">(i-Score運営)</span>
                      </div>
                    )}

                    {activeTeam && (
                      <div className="flex items-start gap-2 px-3 sm:px-2 py-3 sm:py-2 text-sm sm:text-xs bg-primary/10 dark:bg-primary/10 rounded-md mx-1 mb-1">
                        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-primary leading-tight">
                            {(activeTeam as any).organizationName || activeTeam.teamName}
                          </span>
                          <span className="text-muted-foreground text-[10px] font-bold">
                            {(activeTeam as any).organizationName ? (
                              <>{activeTeam.teamName} <span className="opacity-80">({activeTeam.roleLabel})</span></>
                            ) : (
                              activeTeam.roleLabel
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {(isAdmin || activeTeam) && <DropdownMenuSeparator className="bg-border/50" />}
                  </>
                )}

                <DropdownMenuItem className="cursor-pointer gap-3 sm:gap-2 rounded-lg py-3 sm:py-1.5 px-3 sm:px-2 text-base sm:text-sm" onClick={() => router.push("/profile")}>
                  <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>アカウント設定</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer gap-3 sm:gap-2 rounded-lg py-3 sm:py-1.5 px-3 sm:px-2 text-base sm:text-sm" onClick={() => router.push("/teams")}>
                  <Users className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>チーム・編成の管理</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                  className="cursor-pointer gap-3 sm:gap-2 text-red-500 focus:text-red-500 rounded-lg py-3 sm:py-1.5 px-3 sm:px-2 text-base sm:text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 sm:h-4 sm:w-4" />
                  <span className="font-bold sm:font-normal">ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </header>
  );
}