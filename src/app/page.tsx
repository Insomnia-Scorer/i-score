// filepath: src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Monitor, PlayCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/layout/hero-background";

type Theme = "light" | "dark" | "system";

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark"); // 💡 デフォルトはダーク推奨

  // 💡 テーマ管理ロジック復活
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: Theme) => {
      root.classList.remove("light", "dark");
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(isDark ? "dark" : "light");
      } else {
        root.classList.add(t);
      }
    };
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <HeroBackground />

      {/* 🌟 タクティカル・テーマセレクター（ヘッダー） */}
      <header className="fixed top-6 right-8 z-[60]">
        <div className="flex items-center p-1.5 border border-primary/20 rounded-full bg-background/40 backdrop-blur-md shadow-2xl">
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

      {/* 🌟 ヒーローコンテンツ */}
      <main className="z-10 flex flex-col items-center gap-10 max-w-4xl w-full px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-56 h-56 drop-shadow-[0_0_60px_rgba(var(--primary),0.4)]"
        >
          <img src="/logo.webp" alt="Logo" className="w-full h-full object-contain" />
        </motion.div>

        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none text-foreground">
            i-SCORE <span className="text-primary block md:inline">EVOLUTION</span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg tracking-[0.3em] uppercase">
            Data Architecture for Victory
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <Button asChild size="lg" className="h-20 rounded-[30px] text-2xl font-black italic gap-4 shadow-[0_20px_50px_rgba(var(--primary),0.4)] hover:scale-105 transition-all">
            <Link href="/dashboard">
              <PlayCircle className="w-10 h-10" />
              PLAY BALL
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="h-20 rounded-[30px] border-primary/20 bg-background/20 backdrop-blur-md text-xl font-bold hover:bg-primary/10">
            <Link href="/login">LOG IN</Link>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs font-black text-muted-foreground tracking-widest pt-10">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>EST. 2026 / KAWASAKI FIELD UNIT</span>
        </div>
      </main>
    </div>
  );
}

import { cn } from "@/lib/utils";
