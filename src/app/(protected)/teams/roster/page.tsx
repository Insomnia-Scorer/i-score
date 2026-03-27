// src/app/(protected)/teams/roster/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
/**
 * 💡 型安全プロトコル:
 * 参加申請機能を切り離し、純粋な「チーム戦力管理」に特化。
 * 5%濃度の背景グラデーションと、影を抑えたフラットデザインを継承。
 */
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  MoreVertical, 
  Target, 
  Zap, 
  Shield,
  Loader2,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Award,
  Activity,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Schema Protocol)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Player {
  id: string;
  name: string;
  nameKana: string;
  number: string;
  position: string;
  mainPosition: 'P' | 'C' | 'IF' | 'OF';
  battingAvg: string;
  hr: number;
  rbi: number;
  condition: number; // 0-100
  isCaptain?: boolean;
  status: 'active' | 'injured' | 'bench';
}

/**
 * ⚾️ 選手名簿（戦力分析モード）
 * 申請機能を排除し、既存戦力の最大化を図るためのプロフェッショナル・ビュー。
 */
function PlayerRosterContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    // 💡 データの取得（モック）
    const fetchPlayers = async () => {
      // 実際には Firestore 等から取得
      setTimeout(() => {
        setPlayers([
          { id: "1", name: "山田 太郎", nameKana: "ヤマダ タロウ", number: "1", position: "エース / 投手", mainPosition: 'P', battingAvg: ".285", hr: 2, rbi: 12, condition: 95, isCaptain: true, status: 'active' },
          { id: "2", name: "佐藤 次郎", nameKana: "サトウ ジロウ", number: "10", position: "正捕手", mainPosition: 'C', battingAvg: ".310", hr: 5, rbi: 20, condition: 80, status: 'active' },
          { id: "3", name: "鈴木 一郎", nameKana: "スズキ イチロウ", number: "51", position: "中堅手", mainPosition: 'OF', battingAvg: ".350", hr: 1, rbi: 15, condition: 88, status: 'active' },
          { id: "4", name: "田中 健太", nameKana: "タナカ ケンタ", number: "6", position: "遊撃手", mainPosition: 'IF', battingAvg: ".260", hr: 0, rbi: 8, condition: 45, status: 'injured' },
          { id: "5", name: "伊藤 誠", nameKana: "イトウ マコト", number: "18", position: "右腕 / 投手", mainPosition: 'P', battingAvg: ".120", hr: 0, rbi: 2, condition: 60, status: 'bench' },
        ]);
        setIsLoading(false);
      }, 600);
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.nameKana.includes(searchQuery) || p.number.includes(searchQuery);
    const matchesFilter = filter === "ALL" || p.mainPosition === filter;
    return matchesSearch && matchesFilter;
  });

  const getPositionStyles = (pos: string) => {
    switch(pos) {
      case 'P': return "text-blue-500 border-blue-500/20 bg-blue-500/5";
      case 'C': return "text-orange-500 border-orange-500/20 bg-orange-500/5";
      case 'IF': return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
      case 'OF': return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      default: return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase">Active</Badge>;
      case 'injured': return <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-black uppercase">Injured</Badge>;
      case 'bench': return <Badge className="bg-zinc-500/10 text-zinc-500 border-none text-[9px] font-black uppercase">Bench</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative pb-20 overflow-x-hidden">
      
      {/* 💡 背景グラデーション: Dashboard等と完全に同期 */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-in fade-in duration-1000">
        
        {/* HEADER: 戦術的な風格 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
                Tactical Roster
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                <Activity className="h-3 w-3" /> All Players Ready
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none">
              Team <span className="text-primary underline decoration-primary/20 underline-offset-8">Roster</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* 💡 申請画面へのリンクボタン（切り離された先） */}
            <Button variant="outline" className="rounded-2xl h-14 px-6 border-border bg-card/50 backdrop-blur-sm font-black text-xs tracking-widest uppercase hover:bg-muted">
              Applications
            </Button>
            <Button 
              className="rounded-2xl h-14 px-8 bg-primary text-primary-foreground font-black text-lg shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <UserPlus className="h-6 w-6 stroke-[3px]" /> ADD PLAYER
            </Button>
          </div>
        </div>

        {/* CONTROLS: 高速アクセス */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by Name, Number, or Kana..." 
              className="h-14 pl-12 rounded-2xl bg-card/40 backdrop-blur-sm border-border focus:ring-primary/20 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-hide">
            {['ALL', 'P', 'C', 'IF', 'OF'].map((pos) => (
              <Button 
                key={pos}
                variant={filter === pos ? "default" : "outline"}
                onClick={() => setFilter(pos)}
                className={cn(
                  "h-14 px-8 rounded-2xl font-black text-xs tracking-widest transition-all shrink-0",
                  filter === pos ? "bg-primary shadow-md shadow-primary/10" : "bg-card/40 backdrop-blur-sm border-border"
                )}
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>

        {/* PLAYER LIST: グリッドレイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card 
              key={player.id} 
              className="bg-card/40 dark:bg-zinc-900/20 backdrop-blur-md border-border rounded-[32px] overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-sm"
            >
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  {/* アバター & 基本ステータス */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl font-black text-muted-foreground border border-border group-hover:border-primary/30 transition-colors tabular-nums">
                          {player.number}
                        </div>
                        {player.isCaptain && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1 rounded-lg shadow-lg">
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{player.nameKana}</p>
                          {getStatusBadge(player.status)}
                        </div>
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight tracking-tighter italic">
                          {player.name}
                        </h3>
                        <Badge variant="outline" className={cn("mt-1 rounded-full text-[9px] font-black px-2 py-0 uppercase border-none", getPositionStyles(player.mainPosition))}>
                          {player.position}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground/50 hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* パフォーマンス・マトリックス */}
                  <div className="grid grid-cols-3 gap-2 bg-muted/20 p-4 rounded-2xl border border-border/50">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">AVG</p>
                      <p className="text-lg font-black tabular-nums">{player.battingAvg}</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">HR</p>
                      <p className="text-lg font-black tabular-nums">{player.hr}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">RBI</p>
                      <p className="text-lg font-black tabular-nums">{player.rbi}</p>
                    </div>
                  </div>

                  {/* コンディション・トラッカー */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-60">
                        <TrendingUp className="h-3 w-3" /> Readiness
                      </span>
                      <span className={cn(
                        "text-xs font-black tabular-nums",
                        player.condition > 80 ? "text-primary" : 
                        player.condition < 50 ? "text-red-500" : "text-amber-500"
                      )}>
                        {player.condition}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          player.condition > 80 ? "bg-primary" : 
                          player.condition < 50 ? "bg-red-500" : "bg-amber-500"
                        )}
                        style={{ width: `${player.condition}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                <button className="w-full py-4 bg-muted/10 border-t border-border hover:bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all group/btn text-muted-foreground hover:text-primary">
                  SCOUNTING REPORT <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredPlayers.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
            <Target className="h-16 w-16" />
            <div className="space-y-1">
              <p className="font-black text-2xl italic uppercase tracking-tighter">No Athletes Found</p>
              <p className="text-sm font-bold">検索条件を調整するか、新しい選手を登録してください。</p>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-20 py-12 border-t border-border text-center opacity-30">
        <p className="text-[10px] font-black tracking-[0.6em] text-muted-foreground uppercase">
          Squad Intelligence • i-Score Professional
        </p>
      </footer>
    </div>
  );
}

export default function PlayerRoster() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <PlayerRosterContent />
    </Suspense>
  );
}
