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

/**
 * 💡 トップページ (Landing Page)
 * 1. キャッチフレーズ修正: PC表示時に1行で美しく収まるように幅と折り返しを調整。
 * 2. 7つの特徴 (Lucky 7): i-Scoreの7つの強みを、7つのテーマカラーで表現！
 * 3. 最後のカードを自動で中央配置する Flex レイアウトを採用。
 */
export default function LandingPage() {
  // 🔥 ラッキーセブン！7つの特徴と7つのテーマカラー
  const features = [
    { icon: <Smartphone className="h-6 w-6 text-primary" />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。" },
    { icon: <Users className="h-6 w-6 text-blue-500" />, title: "チーム完全連携", desc: "マネージャーも監督も。リアルタイムでスタッツと戦況を共有。" },
    { icon: <FileSpreadsheet className="h-6 w-6 text-green-500" />, title: "早稲田式スコア出力", desc: "入力されたデータを、伝統的で美しいスコアブック形式に一発変換。" },
    { icon: <Zap className="h-6 w-6 text-amber-500" />, title: "1球速報システム", desc: "球場に来られないメンバーへ。プロ野球のような1球速報を配信。" },
    { icon: <TrendingUp className="h-6 w-6 text-purple-500" />, title: "プロ級の成績分析", desc: "打率や防御率だけでなく、OPSやWHIPなど高度な指標を自動計算。" },
    { icon: <BrainCircuit className="h-6 w-6 text-cyan-500" />, title: "AI戦況アシスト", desc: "次のプレイの予測や、打者の傾向分析をAIがベンチにアドバイス。" },
    { icon: <ShieldCheck className="h-6 w-6 text-rose-500" />, title: "鉄壁のセキュリティ", desc: "ゲスト権限と承認フローにより、チームの機密データを安全に保護。" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 overflow-hidden">

      {/* 🌟 究極の背景セクション */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-60 dark:opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at center, transparent 0%, transparent 20%, hsl(var(--background)) 90%, hsl(var(--background)) 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-20 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* 🔥 魂のキャッチフレーズ（改行位置・幅チューニング版） */}
        {/* 💡 max-w-4xl に広げ、md:whitespace-nowrap でPCでの強制1行化を実現！ */}
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

        {/* コールトゥアクション（CTA）ボタン */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              プレイボール (ログイン)
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold bg-background/50 backdrop-blur-md hover:bg-background/80 transition-colors duration-300">
              機能を見る
            </Button>
          </Link>
        </div>

        {/* 🌟 7つの特徴（ラッキーセブン） */}
        <div id="features" className="mt-24 w-full max-w-5xl flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              // 💡 モバイルは1列、タブレットは2列、PCは3列。最後の要素も自動で中央に寄る魔法のクラス！
              className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
              />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

// 💡 マイクロカード用コンポーネント (高さを 100% にして列を揃える)
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="h-full flex flex-col items-center text-center p-6 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl hover:-translate-y-1 transition-transform duration-300">
      <div className="p-3 bg-background/80 rounded-full shadow-sm mb-4 border border-border/30">
        {icon}
      </div>
      <h3 className="text-lg font-black tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}