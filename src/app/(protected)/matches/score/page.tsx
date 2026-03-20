// src/app/(protected)/matches/score/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Scoreboard } from "@/components/score/Scoreboard";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { ControlPanel } from "@/components/score/ControlPanel";
import { ScoreProvider } from "@/contexts/ScoreContext";

function ScoreContent() {
    const searchParams = useSearchParams();
    const currentMatchId = searchParams.get("id") || "match_test_001";

    return (
        <ScoreProvider matchId={currentMatchId}>
            <div className="min-h-screen bg-background text-foreground pb-[220px] sm:pb-[260px] relative selection:bg-primary/20">

                {/* 💡 変更1: max-w-5xl を消して、PC画面で横幅を広く使えるようにする */}
                <main className="px-4 sm:px-6 max-w-[1600px] mx-auto w-full pt-4 sm:pt-6 relative z-10">

                    {/* 💡 変更2: スマホは縦並び (flex-col)、PC(lg以上)は横並び (flex-row) にする！ */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">

                        {/* ⚾️ 左側メインエリア (スコアボード ＆ プレイエリア) */}
                        <div className="flex-1 w-full flex flex-col gap-2 sm:gap-4">
                            <Scoreboard />
                            <PlayArea />
                        </div>

                        {/* 📝 右側サイドエリア (プレイログ) */}
                        {/* 💡 PCの時は幅を固定し、スクロールしても画面内に追従する (sticky) ように設定！ */}
                        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 lg:sticky lg:top-6">
                            <PlayLog />
                        </div>

                    </div>
                </main>

                <ControlPanel />
            </div>
        </ScoreProvider>
    );
}

export default function ScorePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-bold text-muted-foreground">試合データを読み込み中...</div>}>
            <ScoreContent />
        </Suspense>
    );
}