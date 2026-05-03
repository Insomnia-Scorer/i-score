// filepath: src/app/test/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, ShieldCheck, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react"; // 💡 Motion v12
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { Match, LinePostResponse } from "@/types/match";
import { cn } from "@/lib/utils";

/**
 * 💡 iScoreCloud 規約:
 * 1. コンテキスト（パス）変化時に状態をリセットし、誤操作を防止。
 * 2. 脱・グラスモーフィズム: ソリッドな背景色で視認性を最大化。
 */
export default function TestPage() {
  const pathname = usePathname();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // 💡 規約: 背景コンテキストの変化（ページ遷移等）があった場合は状態をリセット
  useEffect(() => {
    setStatus('idle');
  }, [pathname]);

  // 🧪 テストデータ：サヨナラ勝ち（5x）のケースで野球特有の表記を検証
  const testMatch: Match = {
    id: "test-match-2026",
    opponent: "中原パイレーツ",
    date: "2026-05-03",
    myScore: 5,
    opponentScore: 4,
    status: 'finished',
    matchType: 'official',
    battingOrder: 'second',
    isWalkOff: true, // 💡 サヨナラ勝ちフラグ
  };

  const handleDirectPush = async () => {
    setStatus('sending');
    try {
      const res = await fetch("/api/matches/post-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          match: testMatch,
          targetId: "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // 💡 テスト用の送信先ID
        }),
      });
      
      // 💡 規約: 明示的な型キャストを行い、unknownエラーを防止
      const result = (await res.json()) as LinePostResponse;
      setStatus(result.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen p-6 pt-24 bg-background text-foreground selection:bg-primary/30">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* ヘッダー: プロトコル明示 */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              Debug<span className="text-primary italic">Console</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase">
              Messaging API / Direct Push Protocol
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <FeatureCard
            title="Messaging API 直送テスト"
            description="WorkersからLINEサーバーへ直接速報を飛ばします。ログイン画面と同じLINE公式カラーとアイコンを採用し、現場の信頼感を高めます。"
            icon={<Terminal className="w-8 h-8 text-orange-500" />}
            glowColor="rgba(249, 115, 22, 0.15)"
          />

          {/* 💡 脱・グラスモーフィズム: ソリッドな背景でコントラストを確保 */}
          <div className="bg-primary/5 border border-primary/20 rounded-[35px] p-10 space-y-6 shadow-2xl">
            <Button 
              onClick={handleDirectPush}
              disabled={status === 'sending'}
              className={cn(
                "h-20 w-full rounded-[30px] text-2xl font-black italic gap-4 transition-all duration-500 shadow-xl shadow-green-500/20",
                status === 'success' ? "bg-green-600" : "bg-[#06C755] hover:bg-[#05b34c]"
              )}
            >
              <AnimatePresence mode="wait">
                {status === 'sending' ? (
                  <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    送信中...
                  </motion.span>
                ) : (
                  <motion.div key="idle" className="flex items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <MessageCircle className="w-8 h-8 fill-white" />
                    <span>APIで直接LINEへ飛ばす</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <div className="flex justify-center min-h-[30px]">
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 text-green-500 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>送信成功！LINEグループを確認してください。</span>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-destructive font-bold">
                    <AlertCircle className="w-5 h-5" />
                    <span>送信エラー。API設定を確認してください。</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[11px] text-muted-foreground text-center italic leading-relaxed">
              ※本機能は Messaging API を使用します。送信先ID（targetId）が正しいことを確認してください。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
