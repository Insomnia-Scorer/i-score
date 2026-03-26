// src/components/score/PlayLog.tsx
"use client";

import { useEffect, useState, useRef } from "react";
/**
 * 💡 エラー修正: 
 * ビルド環境でのパス解決を確実にするため、プロジェクト標準のエイリアス (@/) を使用します。
 */
import { useScore } from "@/contexts/ScoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    History,
    Mic2,
    RefreshCcw,
    Trophy,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義（型安全プロトコル適用）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PlayLogItem {
    id: string;
    inningText: string;
    description: string;
    resultType: 'pitch' | 'hit' | 'out' | 'score' | string;
    createdAt?: string;
}

interface PlayLogResponse {
    success: boolean;
    logs: PlayLogItem[];
    error?: string;
}

/**
 * ⚾️ 実況ログ・コンポーネント
 * 試合中の全プレイ履歴をリアルタイム（ポーリング）で表示します。
 */
export function PlayLog() {
    const { state } = useScore();
    const [logs, setLogs] = useState<PlayLogItem[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 💡 ログデータの取得
    const fetchLogs = async () => {
        if (!state.matchId) return;

        setIsFetching(true);
        try {
            const res = await fetch(`/api/matches/${state.matchId}/logs`);
            if (res.ok) {
                // 💡 型安全プロトコルに基づき、明示的にキャストを行い 'unknown' 型エラーを防止します
                const data = (await res.json()) as PlayLogResponse;
                if (data.success) {
                    setLogs(data.logs);
                }
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setIsFetching(false);
        }
    };

    // 試合IDが変わった時や、特定のプレイが行われた時にログを更新
    useEffect(() => {
        fetchLogs();

        // 簡易的なリアルタイム性のためのポーリング（10秒おき）
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, [state.matchId, state.pitchCount, state.outs]);

    // ログが更新されたら自動的に最新（一番下）へスクロール
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Card className="bg-zinc-950 border-zinc-900 rounded-[32px] flex flex-col h-[400px] sm:h-[600px] overflow-hidden shadow-2xl">
            <CardHeader className="p-5 border-b border-zinc-900 flex flex-row items-center justify-between bg-zinc-900/30">
                <CardTitle className="text-sm font-black flex items-center gap-2 tracking-widest text-zinc-400 uppercase">
                    <Mic2 className="h-4 w-4 text-primary animate-pulse" />
                    Live Play Log
                </CardTitle>
                <button
                    onClick={fetchLogs}
                    disabled={isFetching}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
                >
                    <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                </button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto p-4 space-y-3 scrollbar-hide"
                >
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                            <History className="h-12 w-12" />
                            <p className="text-sm font-bold">まだ実況ログがありません。<br />プレイを開始しましょう！</p>
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={log.id || index}
                                className={cn(
                                    "group relative pl-4 border-l-2 py-1 transition-all duration-300",
                                    log.resultType === 'score' ? "border-primary bg-primary/5" :
                                        log.resultType === 'out' ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                                                {log.inningText}
                                            </span>
                                            {log.resultType === 'score' && (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase">
                                                    <Trophy className="h-3 w-3" /> Score Update
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-sm font-bold leading-relaxed",
                                            log.resultType === 'score' ? "text-primary" : "text-zinc-300"
                                        )}>
                                            {log.description}
                                        </p>
                                    </div>
                                    {log.resultType === 'hit' && (
                                        <ArrowUpRight className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 下部へのグラデーション */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </CardContent>

            <div className="p-3 bg-zinc-900/50 text-center">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    {logs.length} Actions Recorded in this Match
                </p>
            </div>
        </Card>
    );
}