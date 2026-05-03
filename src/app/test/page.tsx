// filepath: src/app/test/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, ShieldCheck, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { Match, LinePostResponse } from "@/types/match";
import { cn } from "@/lib/utils";

export default function TestPage() {
  const pathname = usePathname();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // 💡 規約: パス変更時に状態をリセット（コンテキスト保護）
  useEffect(() => {
    setStatus('idle');
  }, [pathname]);

  // 🧪 テスト用データ：サヨナラ勝ち（5x）のケース
  const testMatch: Match = {
    id: "test-001",
    opponent: "中原パイレーツ",
    date: "2026-05-03",
    myScore: 5,
    opponentScore: 4,
    status: 'finished',
    matchType: 'official',
    battingOrder: 'second',
    isWalkOff: true
  };

  const handleDirectPush = async () => {
    setStatus('sending');
    try {
      // 💡 Workers API へのリクエスト（Drizzle/D1 連携想定）
      const res = await fetch("/api/matches/post-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match: testMatch }),
      });
      
      const result = (await res.json()) as LinePostResponse;
      setStatus(result.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen p-6 pt-24 bg-background text-foreground">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              Debug<span className="text-primary italic">Console</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-[0.3em] uppercase">Protocol: Messaging API Direct</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <FeatureCard
            title="Messaging API 直送テスト"
            description="LINEアプリを開かずに、Workersから指定グループへ速報をプッシュ送信します。"
            icon={<Terminal className="w-8 h-8 text-orange-500" />}
            glowColor="rgba(249, 115, 22, 0.15)"
          />

          <div className="bg-primary/5 border border-primary/20 rounded-[35px] p-10 space-y-6 shadow-2xl">
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-[10px] font-black text-muted-foreground tracking-widest">TRANSMISSION UNIT</span>
              <div className="w-12 h-1.5 bg-primary/20 rounded-full" />
            </div>

            <Button 
              onClick={handleDirectPush}
              disabled={status === 'sending'}
              className={cn(
                "h-20 w-full rounded-[30px] text-2xl font-black italic gap-4 transition-all duration-500 shadow-xl shadow-green-500/20",
                status === 'success' ? "bg-green-600" : "bg-[#06C755] hover:bg-[#05b34c]"
              )}
            >
              {status === 'sending' ? (
                "送信中..."
              ) : (
                <>
                  <MessageCircle className="w-8 h-8 fill-white" />
                  APIで直接LINEへ飛ばす
                </>
              )}
            </Button>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-500 font-bold justify-center">
                  <CheckCircle2 className="w-5 h-5" /> 送信成功！グループを確認してください。
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-destructive font-bold justify-center">
                  <AlertCircle className="w-5 h-5" /> 送信エラー。APIキーを確認してください。
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
