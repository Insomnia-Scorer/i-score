// filepath: src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { 
  PlayCircle, 
  ShieldCheck, 
  ArrowRight,
  Smartphone,
  Users,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/layout/hero-background";
import { FeatureCard } from "@/components/feature-card";

export default function LandingPage() {
  const features = [
    { icon: <Smartphone className="h-8 w-8 text-orange-500" />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。", glowColor: "rgba(249, 115, 22, 0.15)" },
    { icon: <FileSpreadsheet className="h-8 w-8 text-green-500" />, title: "早稲田式スコア出力", desc: "入力データを伝統的で美しいスコアブック形式に一発変換。", glowColor: "rgba(34, 197, 94, 0.15)" },
    { icon: <Zap className="h-8 w-8 text-amber-500" />, title: "1球速報システム", desc: "球場に来られないメンバーへプロ野球並みの速報を配信。", glowColor: "rgba(245, 158, 11, 0.15)" },
    { icon: <TrendingUp className="h-8 w-8 text-purple-500" />, title: "プロ級の成績分析", desc: "打率、防御率に加えOPSやWHIPなど高度指標を自動計算。", glowColor: "rgba(168, 85, 247, 0.15)" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-primary/30">
      <HeroBackground />

      {/* 🌟 ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.webp" alt="iScore Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          <span className="text-3xl font-black italic tracking-tighter text-white">iScore</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full max-w-6xl mx-auto pt-32 pb-24">
        
        {/* 🌟 ヒーローセクション */}
        <div className="text-center space-y-12 w-full max-w-4xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-48 h-48 mx-auto drop-shadow-[0_0_50px_rgba(var(--primary),0.3)]"
          >
            <img src="/logo.webp" alt="iScore Logo" className="object-contain w-full h-full" />
          </motion.div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
              NEXT-GEN <span className="text-primary underline decoration-8 underline-offset-[12px]">SCORING</span>
            </h1>
            <p className="text-zinc-400 font-bold text-lg md:text-xl tracking-widest max-w-2xl mx-auto">
              現場の熱気をそのままに。スマホ一台で、<br className="hidden md:block" />
              伝統とテクノロジーが融合した最高の一皿を。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button asChild size="lg" className="h-18 px-10 rounded-[30px] text-xl font-black italic gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-300">
              <Link href="/dashboard">
                <PlayCircle className="w-8 h-8" />
                PLAY BALL
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="h-18 px-10 rounded-[30px] border-zinc-800 bg-white/5 text-zinc-300 font-bold hover:bg-white/10 hover:text-white">
              <Link href="/login">ログイン</Link>
            </Button>
          </div>
        </div>

        {/* 🌟 特徴カードセクション */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                glowColor={feature.glowColor}
              />
            </motion.div>
          ))}
        </div>

        {/* 🌟 信頼のバッジ */}
        <div className="mt-24 flex items-center justify-center gap-3 text-[12px] text-zinc-500 font-black uppercase tracking-[0.3em]">
          <ShieldCheck className="w-4 h-4" />
          <span>Professional Field Accuracy</span>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-12">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="iScore Logo" className="h-6 w-6 grayscale" />
            <span className="text-xl font-black italic tracking-tighter">iScore</span>
          </div>
          <p className="text-xs font-bold tracking-widest text-zinc-400">
            © {new Date().getFullYear()} iS Baseball Lab. THE FIELD IS OUR STUDIO.
          </p>
        </div>
      </footer>
    </div>
  );
}
