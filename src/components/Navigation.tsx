// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import NavLinks from './NavLinks';
import { Logout } from '@/components/logout'

export default async function Navigation({ session }: { session: any }) {
  if (!session) {
    return null; // セッションがない場合はナビゲーションを表示しない
  }
  const isUserAdmin = session?.user.role === "admin";
  const { name: userName, role: userRole } = session.user;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Better Auth Demo
          </Link>
          {/* ナビゲーションリンクは管理者とそれ以外で分ける  */}
          <NavLinks isAdmin={isUserAdmin} />
        </div>
        <div className="flex items-center gap-4">
          <>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {userName}
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {userRole}
              </span>
            </span>
            <Logout />
          </>
        </div>
      </div>
    </nav>
  );
}
