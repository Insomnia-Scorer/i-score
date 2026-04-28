// src/app/(protected)/matches/score/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { AIAssistant } from "@/components/score/AIAssistant";
import { Loader2, AlertCircle, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function ScorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, isLoading, state } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);
  }, [matchId, initMatch]);

  if (!matchId) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="max-w-md w-full border-2 border-dashed border-border/40 bg-card/50 rounded-[40px] shadow-none">
          <CardContent className="pt-10 flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-rose-500/50" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Match ID Missing</h2>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-widest">
              正しい試合データが見つかりません。<br />ダッシュボードからやり直してください。
            </p>
            <Button onClick={() => router.push('/dashboard')} className="rounded-full px-8 font-black">BACK TO DASHBOARD</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !state.matchId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/30 mx-auto" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Entering Stadium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent flex flex-col overflow-hidden animate-in fade-in duration-700">

      {/* 🏟 ミニマル・ヘッダー */}
      <header className="px-6 pt-4 flex justify-between items-center shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Live Operations</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      {/* 1. スコアボード (BSOランプ込み) */}
      <section className="px-4 py-2 shrink-0">
        <Scoreboard />
      </section>

      {/* 2. フィールド & AIアシスタント */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 w-full px-6 z-10">
          <AIAssistant />
        </div>

        <div className="w-full max-w-sm aspect-square p-4 flex items-center justify-center">
          <PlayArea />
        </div>

        {/* プレイログ（直近1件のみ表示して空間を稼ぐ） */}
        <div className="w-full px-8 opacity-40">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 3. 究極のアクションコントロール (黄金の親指ゾーン) */}
      <footer className="px-4 pb-10 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0">
        <ControlPanel />
        <div className="mt-6 flex justify-center items-center gap-4 opacity-10">
          <span className="h-px w-8 bg-foreground" />
          <p className="text-[8px] font-black tracking-[0.8em] uppercase italic">iScore Tactics</p>
          <span className="h-px w-8 bg-foreground" />
        </div>
      </footer>

    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}