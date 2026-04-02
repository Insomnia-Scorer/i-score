// src/app/page.tsx
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Users,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  BrainCircuit,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";

/**
 * 💡 トップページ (Landing Page)
 * 1. 背景のすりガラス効果: 画像の存在感を40%に保ちつつ、backdrop-blurで文字を確実に読ませる。
 * 2. 究極のラッキーセブン: 白を排除！グローバルテーマに沿った鮮やかな7色をスポットライトに設定！
 */
export default function LandingPage() {
  // 🔥 真・ラッキーセブン！白を排除し、美しく意味のある7色に完全対応！
  const features = [
    { icon: <Smartphone className="h-6 w-6 text-orange-500" />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。", glowColor: "rgba(249, 115, 22, 0.15)" }, // Orange
    { icon: <Users className="h-6 w-6 text-blue-500" />, title: "チーム完全連携", desc: "マネージャーも監督も。リアルタイムでスタッツと戦況を共有。", glowColor: "rgba(59, 130, 246, 0.15)" }, // Blue
    { icon: <FileSpreadsheet className="h-6 w-6 text-green-500" />, title: "早稲田式スコア出力", desc: "入力されたデータを、伝統的で美しいスコアブック形式に一発変換。", glowColor: "rgba(34, 197, 94, 0.15)" }, // Green
    { icon: <Zap className="h-6 w-6 text-amber-500" />, title: "1球速報システム", desc: "球場に来られないメンバーへ。プロ野球のような1球速報を配信。", glowColor: "rgba(245, 158, 11, 0.15)" }, // Amber (Yellow)
    { icon: <TrendingUp className="h-6 w-6 text-purple-500" />, title: "プロ級の成績分析", desc: "打率や防御率だけでなく、OPSやWHIPなど高度な指標を自動計算。", glowColor: "rgba(168, 85, 247, 0.15)" }, // Purple
    { icon: <BrainCircuit className="h-6 w-6 text-cyan-500" />, title: "AI戦況アシスト", desc: "次のプレイの予測や、打者の傾向分析をAIがベンチにアドバイス。", glowColor: "rgba(6, 182, 212, 0.15)" }, // Cyan
    { icon: <ShieldCheck className="h-6 w-6 text-rose-500" />, title: "鉄壁のセキュリティ", desc: "ゲスト権限と承認フローにより、チームの機密データを安全に保護。", glowColor: "rgba(244, 63, 94, 0.15)" }, // Rose (Red)
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 overflow-hidden">

      {/* 🌟 究極の透明ヘッダー */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-24 bg-transparent">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="i-Score Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-3xl font-black italic tracking-tighter text-foreground drop-shadow-sm">
            i-Score
          </span>
        </Link>
        <div className="flex items-center">
          <Link href="/login">
            <Button size="lg" className="font-bold rounded-full px-8 shadow-md shadow-primary/20 hover:scale-105 transition-transform duration-300">
              無料で始める
            </Button>
          </Link>
        </div>
      </header>

      {/* 🌟 究極の背景セクション（すりガラス・リベンジ版！） */}
      <div className="absolute inset-0 z-0">
        {/* 1. スタジアム画像（存在感を完全復活！） */}
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-75 dark:opacity-50" />

        {/* 2. 新魔法：薄い「すりガラス」を全体にかける */}
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[4px] dark:bg-background/10" />

        {/* 3. 周囲のエッジだけを背景色に自然に溶け込ませる */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, transparent 0%, transparent 40%, hsl(var(--background)) 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-6 text-center w-full max-w-4xl">
          <h1 className="text-5xl md:text-[5rem] lg:text-7xl md:leading-[1.1] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm md:whitespace-nowrap">
            野球の<span className="text-primary drop-shadow-md">今</span>を、<br className="md:hidden" />
            <span className="text-primary drop-shadow-md">次世代</span>へ。
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-widest mt-6">
            草野球・アマチュア野球のための究極のスコアブック。
            <br className="hidden md:block" />
            現場の熱気をそのままに、指先一つでプロ並みのデータ分析を。
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              無料で始める
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold bg-background/50 backdrop-blur-md hover:bg-background/80 transition-colors duration-300">
              機能を見る
            </Button>
          </Link>
        </div>

        {/* 🌟 究極の7つの特徴（スポットライト搭載版） */}
        <div id="features" className="mt-28 w-full max-w-5xl flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                glowColor={feature.glowColor}
              />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}