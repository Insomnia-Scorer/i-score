// filepath: src/app/test/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SnsShareButton } from "@/components/matches/sns-share-button";
import { FeatureCard } from "@/components/feature-card";
import { Terminal, TestTube2, ShieldCheck } from "lucide-react";

/**
 * 💡 iScoreCloud 規約:
 * 開発中の新機能（SNS連携等）を安全に検証するためのテストページ。
 * パス（pathname）が変化した際は、バグ防止のためページ内の状態をリセットする。
 */
export default function TestPage() {
  const pathname = usePathname();
  const [isTestRunning, setIsTestRunning] = useState(false);

  // 💡 規約: 背景コンテキスト（パス）が変化した場合はオーバーレイや状態をリセット
  useEffect(() => {
    setIsTestRunning(false);
  }, [pathname]);

  // 🧪 実戦想定のテストMatchデータ（サヨナラ勝ちケース）
  const testMatch = {
    homeTeamName: "川崎シャークス",
    awayTeamName: "中原パイレーツ",
    scores: { home: 5, away: 4 },
    inning: "9回裏",
    lastAction: "劇的なサヨナラタイムリーヒット！",
    isWalkOff: true
  };

  return (
    <main className="min-h-screen p-6 pt-24 bg-background text-foreground selection:bg-primary/30">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* ヘッダーセクション */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              Debug<span className="text-primary italic">Console</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
              Internal Sandbox / Protocol 2.0
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground tracking-widest">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>FIELD UNIT READY</span>
          </div>
        </div>

        {/* 🌟 LINE投稿テストセクション */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 text-primary font-bold">
            <TestTube2 className="w-5 h-5" />
            <h2 className="tracking-tight text-lg">SNS連携ユニット・テスト</h2>
          </div>

          <FeatureCard
            title="LINE Match速報送信テスト"
            description="iScoreCloudのMatch状況をLINEへ投稿できるか確認します。サヨナラ勝ちの『x』表記も検証対象です。"
            icon={<Terminal className="w-8 h-8 text-orange-500" />}
            glowColor="rgba(249, 115, 22, 0.15)"
          />

          <div className="bg-primary/5 border border-primary/20 rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between text-sm font-bold opacity-70">
              <span>TEST DATA SOURCE</span>
              <span className="text-primary tracking-widest">LIVE SIMULATION</span>
            </div>
            
            <div className="py-2">
              <SnsShareButton 
                homeTeamName={testMatch.homeTeamName}
                awayTeamName={testMatch.awayTeamName}
                scores={testMatch.scores}
                inning={testMatch.inning}
                lastAction={testMatch.lastAction}
                isWalkOff={testMatch.isWalkOff}
              />
            </div>
            
            <p className="text-[11px] text-muted-foreground text-center italic leading-relaxed">
              ※ボタンをタップするとLINEアプリが起動し、<br />
              フォーマット済みのMatch速報テキストが入力欄にセットされます。
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
