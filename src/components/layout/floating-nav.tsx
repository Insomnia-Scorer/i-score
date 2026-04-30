// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Trophy, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・サークルナビ（アイコン最大化エディション）
 * 中央のロゴを円いっぱいに広げ、現場での視認性とブランド力を最大化。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーション（パス変更）が発生したら自動で閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -140 },
    { icon: Trophy, label: "GAME", href: "/matches", angle: -110 },
    { icon: Users, label: "TEAM", href: "/teams", angle: -70 },
    { icon: Settings, label: "SETTING", href: "/settings", angle: -40 },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      {/* 🌟 背景オーバーレイ（脱・グラスモーフィズム：コントラスト重視） */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 z-[-1]" 
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        {/* 🌟 サブメニュー項目 */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  x: Math.cos((item.angle * Math.PI) / 180) * 110, // 距離を少し広げて視認性UP
                  y: Math.sin((item.angle * Math.PI) / 180) * 110,
                }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25, delay: index * 0.03 }}
                className="absolute"
              >
                <Link href={item.href} className="group flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all active:scale-90",
                    pathname === item.href 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-border text-foreground"
                  )}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-foreground bg-background px-2 py-0.5 rounded-full border border-border shadow-sm">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ⚾️ メイン・センターボタン（アイコンを円いっぱいに） */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(var(--primary),0.4)] transition-all active:scale-95 z-50 overflow-hidden",
            isOpen ? "bg-background border-4 border-primary" : "bg-primary"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                className="flex items-center justify-center"
              >
                <X className="w-10 h-10 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative w-full h-full p-1" // 💡 p-1 程度の微細な余白で円いっぱいに
              >
                <Image
                  src="/logo.webp"
                  alt="iScore"
                  fill
                  className="object-contain p-2" // 💡 画像自体のトリミングに合わせて調整
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 通知バッジ */}
          {!isOpen && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-destructive border-4 border-primary rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
