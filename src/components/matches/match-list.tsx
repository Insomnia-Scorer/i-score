// src/components/matches/match-list.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Trophy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  tournamentName?: string;
  date: string;
  myScore: number;
  opponentScore: number;
  matchType: 'official' | 'practice';
  battingOrder: 'first' | 'second';
  surfaceDetails?: string;
  // 🌟 追加：イニングごとの詳細（APIから取得、またはpropsで渡す想定）
  myInningScores?: number[];
  opponentInningScores?: number[];
}

export function MatchList({ matches, isLoading }: { matches: Match[], isLoading: boolean }) {
  const router = useRouter();
  // 🌟 展開されているカードのID
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // 🌟 スワイプ状態の管理
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;

  // --- スワイプ制御ロジック ---
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setStartX(e.touches[0].clientX);
    setSwipeId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // 最大スワイプ幅を制限（ボタン2個分くらい）
    if (Math.abs(diff) < 100) setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    if (offsetX > 50) setOffsetX(80); // 右スワイプ固定
    else if (offsetX < -50) setOffsetX(-80); // 左スワイプ固定
    else { setOffsetX(0); setSwipeId(null); }
  };

  return (
    <div className="space-y-3 overflow-hidden">
      {matches.map((match) => {
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;
        const isExpanded = expandedId === match.id;
        const isSwiping = swipeId === match.id;

        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;

        return (
          <div key={match.id} className="relative">
            {/* 🌟 背面に配置されたアクションボタン（スワイプで露出） */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <Button
                variant="default"
                size="icon"
                onClick={() => router.push(`/matches/edit?id=${match.id}`)}
                className="bg-blue-600 text-white rounded-xl h-12 w-12 shadow-lg"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => console.log("Delete", match.id)}
                className="rounded-xl h-12 w-12 shadow-lg"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* 🌟 メインのカード本体 */}
            <div
              onTouchStart={(e) => handleTouchStart(e, match.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ transform: isSwiping ? `translateX(${offsetX}px)` : 'translateX(0)' }}
              className={cn(
                "relative z-10 rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 shadow-sm transition-transform duration-200 ease-out",
                isExpanded && "ring-2 ring-primary/20 shadow-md"
              )}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  if (Math.abs(offsetX) < 10) setExpandedId(isExpanded ? null : match.id);
                  setOffsetX(0); setSwipeId(null);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                        match.matchType === 'official' ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      )}>
                        {match.matchType === 'official' ? '公式戦' : '練習'}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">{match.date}</span>
                    </div>
                    <h3 className="text-base font-black truncate">vs {match.opponent}</h3>
                    {match.matchType === 'official' && (
                      <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                        <Trophy className="h-3 w-3" /> {match.tournamentName || "大会名未登録"}
                      </p>
                    )}
                  </div>

                  {/* スコア ＆ 勝敗バッジ（集約表示） */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-full text-center">
                      {isWin && <span className="block w-full bg-blue-600 text-white text-[9px] font-black py-0.5 rounded-sm">WIN</span>}
                      {isLoss && <span className="block w-full bg-red-600 text-white text-[9px] font-black py-0.5 rounded-sm">LOSE</span>}
                      {isDraw && <span className="block w-full bg-zinc-500 text-white text-[9px] font-black py-0.5 rounded-sm">DRAW</span>}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl border border-border/20">
                      <span className="text-lg font-black tabular-nums">{firstScore}</span>
                      <span className="text-xs text-muted-foreground/40">-</span>
                      <span className="text-lg font-black tabular-nums">{secondScore}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>

                {/* 🌟 展開時：イニングスコアを表示 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/40 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 overflow-x-auto">
                      <table className="w-full text-center">
                        <thead>
                          <tr className="text-[8px] font-black text-muted-foreground uppercase">
                            <th className="text-left font-bold">TEAM</th>
                            {Array.from({ length: 9 }).map((_, i) => <th key={i} className="w-6">{i + 1}</th>)}
                            <th className="w-8 text-primary">R</th>
                          </tr>
                        </thead>
                        <tbody className="text-[11px] font-black tabular-nums">
                          <tr className="border-b border-border/20">
                            <td className="text-left py-1 text-muted-foreground">先攻</td>
                            {Array.from({ length: 9 }).map((_, i) => <td key={i}>{i < 7 ? (match.battingOrder === 'first' ? "0" : "0") : "-"}</td>)}
                            <td className="text-primary">{firstScore}</td>
                          </tr>
                          <tr>
                            <td className="text-left py-1 text-muted-foreground">後攻</td>
                            {Array.from({ length: 9 }).map((_, i) => <td key={i}>{i < 7 ? (match.battingOrder === 'second' ? "0" : "0") : "-"}</td>)}
                            <td className="text-primary">{secondScore}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-[8px] text-muted-foreground mt-2 text-center">* 詳細スコアは試合詳細から編集可能です</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}