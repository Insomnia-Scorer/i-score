// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";

function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [matchId, initMatch]);

  return (
    /**
     * 💡 修正ポイント:
     * - bg-background に戻し、ライト/ダーク両対応
     * - slide-in-from-bottom / duration-700 などのアニメーションクラスを再適用
     */
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none animate-in fade-in duration-500">

      {/* 💡 上から降りてくる掲示板 */}
      <header className="h-[22%] shrink-0 z-30 animate-in slide-in-from-top duration-700 ease-[0.22,1,0.36,1] fill-mode-forwards">
        <Scoreboard />
      </header>

      {/* 💡 中央：フィールドエリア */}
      <main className="flex-1 relative flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-forwards">
        <div className="w-full max-w-[300px] aspect-square scale-110">
          <PlayArea />
        </div>
        <div className="absolute bottom-4 w-full px-12 opacity-40">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 💡 下からせり上がるパネル */}
      <footer className="h-[25%] shrink-0 z-30 bg-card/80 backdrop-blur-3xl border-t border-border/40 px-4 pt-3 pb-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-700 ease-[0.22,1,0.36,1] fill-mode-forwards">
        <div className="max-w-md mx-auto h-full">
          <ControlPanel />
        </div>
      </footer>
    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background" />}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}