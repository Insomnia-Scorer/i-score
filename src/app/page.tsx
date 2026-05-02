// filepath: src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/layout/hero-background";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <HeroBackground />

      {/* 🌟 メインコンテンツ・エリア */}
      <div className="z-10 space-y-12 max-w-4xl w-full">
        
        {/* 新ロゴ・セクション（浮遊アニメーション付き） */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-48 h-48 mx-auto drop-shadow-[0_0_40px_rgba(var(--primary),0.3)]"
        >
          <Image
            src="/logo.webp"
            alt="i-score Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* キャッチコピー：NEXT-GEN SCORING */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white leading-tight">
            NEXT-GEN <span className="text-primary underline decoration-8 underline-offset-[12px]">SCORING</span>
          </h1>
          <p className="text-zinc-400 font-bold text-lg md:text-xl tracking-[0.2em]">
            現場の熱狂を、そのままデジタルへ。
          </p>
        </div>

        {/* アクションボタン：PLAY BALL */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <Button asChild size="lg" className="h-18 px-12 rounded-[30px] text-xl font-black italic gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-300">
            <Link href="/dashboard">
              <PlayCircle className="w-8 h-8" />
              PLAY BALL
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg" className="h-18 px-12 rounded-[30px] border-zinc-800 bg-white/5 text-zinc-300 font-bold hover:bg-white/10 hover:text-white transition-colors">
            <Link href="/login">
              ログイン
            </Link>
          </Button>
        </div>

        {/* 信頼の証 */}
        <div className="flex items-center justify-center gap-3 text-[12px] text-zinc-500 font-black uppercase tracking-[0.3em] pt-12">
          <ShieldCheck className="w-4 h-4" />
          <span>Professional Field Accuracy</span>
        </div>
      </div>
    </main>
  );
}
