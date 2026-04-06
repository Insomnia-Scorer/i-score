// src/components/matches/match-list.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  tournamentName?: string; // 🌟 追加：大会名
  date: string;
  myScore: number;
  opponentScore: number;
  status: string;
  matchType: 'official' | 'practice'; // 🌟 復活
  battingOrder: 'first' | 'second';
  surfaceDetails?: string;
}

export function MatchList({ matches, isLoading }: { matches: Match[], isLoading: boolean }) {
  const router = useRouter();

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;

        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;

        return (
          <div key={match.id} className="group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between gap-4">

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {/* 🌟 視認性を強化した勝敗バッジ */}
                  {isWin && <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm ring-1 ring-blue-400/50">WIN</span>}
                  {isLoss && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm ring-1 ring-red-400/50">LOSE</span>}
                  {isDraw && <span className="bg-zinc-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm">DRAW</span>}

                  {/* 🌟 試合タイプ復活 */}
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                    match.matchType === 'official' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  )}>
                    {match.matchType === 'official' ? '公式戦' : '練習試合'}
                  </span>

                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0">
                    <Calendar className="h-3 w-3" /> {match.date}
                  </span>
                </div>

                <h3 className="text-base font-black truncate text-foreground mb-0.5">
                  vs {match.opponent}
                </h3>

                {/* 🌟 公式戦のみ大会名を表示 */}
                {match.matchType === 'official' && match.tournamentName && (
                  <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mb-1 italic">
                    <Trophy className="h-3 w-3" /> {match.tournamentName}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {match.surfaceDetails || "球場未設定"}
                  </span>
                </div>
              </div>

              {/* スコア表示（先攻・後攻） */}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/40 rounded-xl border border-border/20 shrink-0">
                <div className="text-center w-8">
                  <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">先攻</p>
                  <p className="text-xl font-black tabular-nums mt-1">{firstScore}</p>
                </div>
                <div className="text-lg font-black text-muted-foreground/30 self-end mb-0.5">-</div>
                <div className="text-center w-8">
                  <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">後攻</p>
                  <p className="text-xl font-black tabular-nums mt-1">{secondScore}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={() => router.push(`/matches/edit?id=${match.id}`)} className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors shrink-0">
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}