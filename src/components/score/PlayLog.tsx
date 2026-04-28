// filepath: `src/components/score/PlayLog.tsx`
"use client";

import { useEffect, useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import {
  History,
  Mic2,
  RefreshCcw,
  Trophy,
  ArrowUpRight,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ⚾️ 型定義
interface PlayLogItem {
  id: string;
  inningText: string;
  description: string;
  resultType: 'pitch' | 'hit' | 'out' | 'score' | string;
}

interface PlayLogResponse {
  success: boolean;
  logs: PlayLogItem[];
}

interface PlayLogProps {
  limit?: number; // 💡 これで TypeScript エラーが解消されます
}

export function PlayLog({ limit }: PlayLogProps) {
  const { state } = useScore();
  const [logs, setLogs] = useState<PlayLogItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    if (!state.matchId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/matches/${state.matchId}/logs`);
      if (res.ok) {
        const data = (await res.json()) as PlayLogResponse;
        if (data.success) {
          setLogs(limit ? data.logs.slice(0, limit) : data.logs);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [state.matchId, state.pitchCount, state.outs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={cn(
      "flex flex-col overflow-hidden transition-all duration-500",
      limit === 1
        ? "bg-transparent" // 💡 スコア画面での「チラ見せ」用
        : "bg-card/50 border-2 border-border/40 rounded-[40px] h-[400px] shadow-sm backdrop-blur-md"
    )}>
      {/* ヘッダー：詳細表示時のみ表示 */}
      {!limit && (
        <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Live Play Log</span>
          </div>
          <button onClick={fetchLogs} disabled={isFetching} className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto scrollbar-hide space-y-3",
          limit === 1 ? "p-0" : "p-6"
        )}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
            <History className="h-10 w-10 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">No Records Yet</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id || index}
              className={cn(
                "group relative animate-in slide-in-from-bottom-2 duration-500",
                limit === 1 ? "flex items-center gap-4" : "p-4 rounded-2xl bg-background/40 border border-border/20 shadow-xs"
              )}
            >
              {/* インジケーター */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-black italic text-primary/40 uppercase">
                  {log.inningText}
                </span>
                <Circle className={cn(
                  "h-2 w-2 fill-current",
                  log.resultType === 'score' ? "text-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" :
                    log.resultType === 'out' ? "text-rose-500" :
                      log.resultType === 'hit' ? "text-blue-500" : "text-muted-foreground/30"
                )} />
              </div>

              <p className={cn(
                "font-bold tracking-tight leading-tight flex-1",
                limit === 1 ? "text-xs text-muted-foreground italic truncate" : "text-sm text-foreground"
              )}>
                {log.description}
                {log.resultType === 'hit' && <ArrowUpRight className="inline ml-1 h-3 w-3 text-blue-500" />}
                {log.resultType === 'score' && <Trophy className="inline ml-1 h-3 w-3 text-primary" />}
              </p>
            </div>
          ))
        )}
      </div>

      {/* フッター：詳細表示時のみ表示 */}
      {!limit && (
        <div className="p-3 bg-muted/20 border-t border-border/20 text-center">
          <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.5em]">
            {logs.length} Actions Recorded
          </p>
        </div>
      )}
    </div>
  );
}