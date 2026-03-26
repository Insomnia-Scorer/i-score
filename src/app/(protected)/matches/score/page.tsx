// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
/**
 * 💡 型安全プロトコル: 
 * プロジェクト標準のエイリアス (@/) を使用して各コンポーネントとコンテキストを統合します。
 */
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { AIAssistant } from "@/components/score/AIAssistant";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * ⚾️ スコア入力メインコンテンツ
 * 試合IDの取得、初期化、および全スコアリングコンポーネントのレイアウトを管理します。
 */
function ScorePageContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const { initMatch, isLoading, state } = useScore();

    // 💡 試合の初期化
    useEffect(() => {
        if (matchId) {
            initMatch(matchId);
        }
    }, [matchId, initMatch]);

    // 1. 試合IDがない場合の警告
    if (!matchId) {
        return (
            <div className="flex h-screen items-center justify-center p-6 bg-background">
                <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 rounded-[32px]">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <h2 className="text-xl font-black text-foreground">試合IDが見つかりません</h2>
                        <p className="text-sm text-muted-foreground font-bold">
                            正しいリンクからアクセスするか、ダッシュボードから試合を選択し直してください。
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 2. ロード中の表示
    if (isLoading && !state.matchId) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-2 rounded-full border-4 border-primary/10 border-b-primary animate-spin-reverse" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-xl tracking-tighter">PLAY BALL</p>
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">試合データを読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-12">
            {/* 📱 モバイルファーストのレイアウト
          最大幅 4xl (約896px) で中央寄せ 
      */}
            <main className="max-w-4xl mx-auto p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. スコアボード（最上部：点数と回） */}
                <Scoreboard />

                {/* 2. AIアシスタント（戦略アドバイス） */}
                <AIAssistant />

                {/* 3. 中段エリア：グラウンド表示と実況ログの2カラム（デスクトップ時） */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* ダイヤモンド表示（3スパン） */}
                    <div className="lg:col-span-3">
                        <PlayArea />
                    </div>

                    {/* 実況ログ（2スパン） */}
                    <div className="lg:col-span-2">
                        <PlayLog />
                    </div>
                </div>

                {/* 4. 操作パネル（最下部：アクションボタン） */}
                <div className="sticky bottom-4 z-20 md:relative md:bottom-0">
                    <ControlPanel />
                </div>

            </main>

            {/* 背景の装飾的な要素（スタジアムの雰囲気） */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />
        </div>
    );
}

/**
 * ⚾️ ページエクスポート
 * Suspense と ScoreProvider でラップして、副作用やコンテキストを安全に扱います。
 */
export default function ScorePage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ScoreProvider>
                <ScorePageContent />
            </ScoreProvider>
        </Suspense>
    );
}