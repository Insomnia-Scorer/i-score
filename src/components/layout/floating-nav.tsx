// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Trophy, MoreHorizontal, UserSquare2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・マキシマム・ナビ（究極視認性・中央凝縮・パス修正版）
 * 5つのボタンを中央に寄せ、操作効率と視認性を最大化した i-Score の司令塔
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーションが発生したら自動で閉じる
  useEffect(() => setIsOpen(false), [pathname]);

  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -150 }, // 💡 チーム編成（/team）へ
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -120 },
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 },
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -60 }, // 💡 大会ページパス修正
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: -30 }, // 💡 MENU実装準備
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
      
      {/* 🌟 背景オーバーレイ：脱・グラスモーフィズム。極限まで濃くし視認性を死守 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-zinc-950/98 z-[-1] rounded-full shadow-2xl" 
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        
        {/* 🌟 5つのサブボタン：中央凝縮配置（半径125px / 角度-150~-30） */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  x: Math.cos((item.angle * Math.PI) / 180) * 125,
                  y: Math.sin((item.angle * Math.PI) / 180) * 125,
                }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 35, delay: index * 0.01 }}
                className="absolute"
              >
                <Link href={item.href} className="active:scale-90 transition-transform">
                  <div className={cn(
                    "w-18 h-18 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl border-[3px]",
                    pathname === item.href 
                      ? "bg-primary border-primary text-primary-foreground scale-110 ring-4 ring-primary/30" 
                      : "bg-white border-zinc-200 text-zinc-900" 
                  )}>
                    <item.icon className="w-7 h-7 stroke-[2.5]" />
                    <span className="text-[9px] font-black tracking-tighter leading-none uppercase">
                      {item.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ⚾️ センターボタン：w-24（96px）＋ 多層シャドウ ＋ 爆速アイコン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden",
            "shadow-[0_25px_60px_rgba(0,0,0,0.5),0_10px_25px_rgba(var(--primary),0.3)]",
            isOpen 
              ? "bg-white ring-[8px] ring-primary/60" 
              : "bg-primary"
          )}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                  transition={{ duration: 0.1, ease: "circOut" }}
                  className="flex items-center justify-center w-full h-full rounded-full"
                >
                  <X className="w-14 h-14 text-primary stroke-[5]" />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.1, ease: "circOut" }}
                  className="relative w-full h-full rounded-full"
                >
                  <Image
                    src="/logo.webp"
                    alt="iScore"
                    fill
                    className="object-contain p-0.5 rounded-full" 
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>
    </div>
  );
}
