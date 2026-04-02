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
  ShieldCheck,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 💡 トップページ (Landing Page)
 * 1. 透明ヘッダー: 画面上部にロゴとCTAを配置し、SaaSとしての風格を演出。
 * 2. 白浮き解消 (Light Mode): mix-blend-multiply で画像の暗い部分だけを白背景に焼き付け、クリアな視認性を実現。
 * 3. ラッキーセブン: 7つの特徴カード。
 */
export default function LandingPage() {
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

      {/* 🌟 究極の透明ヘッダー */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-24 bg-transparent">
        {/* ロゴエリア */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tighter">i-Score</span>
        </div>

        {/* PC用ナビゲーション (モバイルでは非表示) */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">機能</Link>
          <Link href="#" className="hover:text-foreground transition-colors">料金</Link>
          <Link href="#" className="hover:text-foreground transition-colors">サポート</Link>
        </nav>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-bold rounded-full px-6 hover:bg-background/40">
              ログイン
            </Button>
          </Link>
          <Link href="/login">
            <Button className="font-bold rounded-full px-6 shadow-md shadow-primary/20 hover:scale-105 transition-transform">
              無料で始める
            </Button>
          </Link>
        </div>
      </header>

      {/* 🌟 究極の背景セクション（白浮き完全解消版） */}
      <div className="absolute inset-0 z-0">
        {/* 💡 ライトモードの魔法: mix-blend-multiply
          白背景に対して画像の「暗い部分」だけを焼き付けるため、霧がかったような白浮きが消滅します！
          ダークモードでは通常のブレンド（mix-blend-normal）に戻し、ナイター照明を輝かせます。
        */}
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at center, transparent 0%, transparent 25%, hsl(var(--background)) 85%, hsl(var(--background)) 100%)" }}
        />
        {/* コンテンツとの境界を消すグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      {/* 💡 pt-32 にして、透明ヘッダーと文字が被らないように余白を調整 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* 🔥 魂のキャッチフレーズ */}
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
              />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

// 💡 マイクロカード用コンポーネント
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