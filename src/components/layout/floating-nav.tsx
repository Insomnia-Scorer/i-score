// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
/** 
 * 💡 Motion v12 規約: 
 * React 向けには 'motion/react' からインポートを行う。
 */
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Users, Trophy, MoreHorizontal, UserSquare2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・マキシマム・ナビ（Motion v12 / 100px 超広角・座標固定エディション）
 * 画像 image_f110b9.png の配置バグを完全に修正。
 * 半径100px、-175度〜45度の範囲を数学的に正確に埋める。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: 画面遷移が発生したらオーバーレイを自動クローズ。
  useEffect(() => setIsOpen(false), [pathname]);

  /**
   * 🏟️ 角度の絶対定義規約
   * 扇状に均等にならないバグを防ぐため、計算値を直接割り当て。
   */
  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -175 },
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -132.5 },
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 }, // ⭐真上
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -47.5 }, // 💡-90と45のバランスを再調整
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: 45 },      // 右下
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">

      {/* 🌟 背景オーバーレイ：脱・グラスモーフィズム。漆黒(bg-zinc-950/98)で視認性最大化。 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-zinc-950/98 z-[-1] rounded-full shadow-2xl"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">

        {/* 🌟 サブボタン：半径100px、全 w-18 (72px) 固定 */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              // 💡 半径100pxを定数として保持
              const RADIUS = 100;
              const radian = (item.angle * Math.PI) / 180;
              const x = Math.cos(radian) * RADIUS;
              const y = Math.sin(radian) * RADIUS;

              return (
                <motion.div
                  key={item.href}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x, y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30,
                    delay: index * 0.01
                  }}
                  className="absolute"
                >
                  <Link href={item.href} className="relative flex items-center justify-center group active:scale-95 transition-transform">

                    {/* 💡 ソーラーエフェクト（Solar Ripple） */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          className="absolute w-full h-full rounded-full bg-primary/40"
                          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                        <div className="absolute inset-[-4px] rounded-full border-2 border-primary/60" />
                      </div>
                    )}

                    <div className={cn(
                      "w-18 h-18 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl border-[3px] transition-colors relative z-10",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white border-zinc-200 text-zinc-900 shadow-black/10"
                    )}>
                      <item.icon className="w-7 h-7 stroke-[2.5]" />
                      <span className="text-[8px] font-black tracking-tighter leading-none uppercase">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* ⚾️ センターボタン：w-24（96px）＋ 爆速ハンドリング */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden",
            "shadow-[0_25px_60px_rgba(0,0,0,0.5),0_10px_25px_rgba(var(--primary),0.3)]",
            isOpen ? "bg-white ring-[8px] ring-primary/60" : "bg-primary ring-0"
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
                  className="relative w-full h-full"
                >
                  <Image
                    src="/logo.webp"
                    alt="iScore"
                    fill
                    className="object-contain p-0.5"
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