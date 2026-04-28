// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";

function ScorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, state } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden">

      {/* 💡 上から降りてくるスコアボード (32%) */}
      <header className="h-[32%] shrink-0 z-20 animate-in slide-in-from-top duration-700 ease-out-expo">
        <Scoreboard variant="ultimate" />
      </header>

      {/* 💡 中央：フィールドエリア (43%) */}
      <main className="flex-1 relative flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in-95 duration-1000 delay-300">
        <div className="w-full max-w-[280px] aspect-square">
          <PlayArea />
        </div>
        <div className="absolute bottom-2 w-full px-10 opacity-30">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 💡 下からせり上がるコントロールパネル (25%) */}
      <footer className="h-[25%] shrink-0 z-20 bg-card/90 backdrop-blur-2xl border-t border-border/40 px-4 pt-3 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-700 ease-out-expo">
        <ControlPanel />
      </footer>

    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}