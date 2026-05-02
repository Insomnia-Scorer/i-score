// filepath: src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sun, Moon, Monitor, PlayCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react"; // 💡 Motion v12 規約
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

/**
 * 💡 i-score Evolution Landing Page (v12)
 * AI生成された「サイバー・スタジアム」と高速交差パルスの融合。
 * テーマ管理を完全復活させ、現場視認性を最大化する。
 */
export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // 💡 パルス生成：無差別に交差する光の神経系
  const pulses = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 0.8 + Math.random() * 1.5, // 💡 素早く流れる
    delay: Math.random() * 5,
    type: i % 3 === 0 ? "h" : i % 3 === 1 ? "v" : "d",
  })), []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("iscore-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("iscore-theme", theme);
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background selection:bg-primary/30">
      
      {/* 🌟 AI背景 & 高速パルスレイヤー */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* AI生成画像（ここに差し替え） */}
        <div 
          className="absolute inset-0 bg-[url('/cyber-stadium.webp')] bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ filter: theme === 'light' ? 'invert(1) opacity(0.05)' : 'opacity(0.3) contrast(1.1)' }}
        />
        
        {/* 💡 高速無差別パルス（神経系エフェクト） */}
        {pulses.map((p) => (
          <motion.div
            key={p.id}
            initial={p.type === "h" ? { x: "-100%", y: p.top } : p.type === "v" ? { y: "-100%", x: p.left } : { x: "-50%", y: "-50%", opacity: 0 }}
            animate={p.type === "h" ? { x: "200%" } : p.type === "v" ? { y: "200%" } : { x: "150%", y: "150%", opacity: [0, 1, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "circIn", delay: p.delay }}
            className={cn(
              "absolute blur-[1px] shadow-[0_0_10px_rgba(var(--primary),0.6)]",
              p.type === "h" ? "h-[1.5px] w-64 bg-gradient-to-r from-transparent via-primary/80 to-transparent" :
              p.type === "v" ? "w-[1.5px] h-64 bg-gradient-to-b from-transparent via-primary/80 to-transparent" :
              "w-48 h-[1px] bg-gradient-to-br from-transparent via-primary/80 to-transparent rotate-45"
            )}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
      </div>

      {/* 🌟 復活：タクティカル・テーマセレクター */}
      <header className="fixed top-6 right-8 z-[60]">
        <div className="flex items-center p-1 border border-border/40 rounded-full bg-background/40 backdrop-blur-md">
          {(["light", "system", "dark"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "p-2.5 rounded-full transition-all duration-300",
                theme === t ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              {t === "light" && <Sun className="h-4 w-4" />}
              {t === "system" && <Monitor className="h-4 w-4" />}
              {t === "dark" && <Moon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </header>

      {/* 🌟 メイン・ヒーロー */}
      <main className="z-10 flex flex-col items-center gap-14 max-w-4xl w-full px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-56 h-56 drop-shadow-[0_0_60px_rgba(var(--primary),0.3)]"
        >
          <img src="/logo.webp" alt="iScore Logo" className="w-full h-full object-contain" />
        </motion.div>

        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none text-foreground drop-shadow-lg">
            i-SCORE <span className="text-primary underline decoration-8 underline-offset-8">X</span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg md:text-xl tracking-[0.4em] uppercase">
            Evolution of Tactical Analysis
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
          <Button asChild size="lg" className="h-20 rounded-[30px] text-2xl font-black italic gap-4 shadow-2xl shadow-primary/30 hover:scale-105 transition-all bg-primary">
            <Link href="/dashboard">
              <PlayCircle className="w-9 h-9" />
              PLAY BALL
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs font-black text-muted-foreground tracking-[0.3em] pt-12">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>FIELD LOGIC SYSTEM PROTOCOL</span>
        </div>
      </main>
    </div>
  );
}
