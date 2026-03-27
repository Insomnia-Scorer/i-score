// src/app/(protected)/teams/roster/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
/**
 * 💡 型安全プロトコル:
 * 1. UIの表示要素（ボタン、ラベル、統計指標）を日本語に統一。
 * 2. チームページと整合性のある、角丸40pxのカードとフラットなバッジデザイン。
 * 3. Gemini API を使用した日本語による AI スカウティング機能を搭載。
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
  MoreHorizontal,
  Target, 
  Zap, 
  Shield,
  Loader2,
  TrendingUp,
  Award,
  Activity,
  Star,
  Sparkles,
  MessageSquare,
  Trophy,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  condition: number;
  isCaptain?: boolean;
  status: 'active' | 'injured' | 'bench';
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: { message: string };
}

/**
 * ⚾️ 選手名簿コンポーネント
 */
function PlayerRosterContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("すべて");

  // AI 関連ステート
  const [analyzingPlayerId, setAnalyzingPlayerId] = useState<string | null>(null);
  const [scoutingReports, setScoutingReports] = useState<Record<string, string>>({});
  const [isTeamAnalyzing, setIsTeamAnalyzing] = useState(false);
  const [teamBriefing, setTeamBriefing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      // 実際には Firestore 等から取得。
      setTimeout(() => {
        setPlayers([
          { id: "1", name: "山田 太郎", nameKana: "ヤマダ タロウ", number: "01", position: "エース / 投手", mainPosition: 'P', battingAvg: ".285", hr: 2, rbi: 12, condition: 95, isCaptain: true, status: 'active' },
          { id: "2", name: "佐藤 次郎", nameKana: "サトウ ジロウ", number: "10", position: "正捕手", mainPosition: 'C', battingAvg: ".310", hr: 5, rbi: 20, condition: 82, status: 'active' },
          { id: "3", name: "鈴木 一郎", nameKana: "スズキ イチロウ", number: "51", position: "センター", mainPosition: 'OF', battingAvg: ".350", hr: 1, rbi: 15, condition: 88, status: 'active' },
          { id: "4", name: "田中 健太", nameKana: "タナカ ケンタ", number: "06", position: "ショート", mainPosition: 'IF', battingAvg: ".260", hr: 0, rbi: 8, condition: 42, status: 'injured' },
          { id: "5", name: "伊藤 誠", nameKana: "イトウ マコト", number: "18", position: "リリーフ / 投手", mainPosition: 'P', battingAvg: ".120", hr: 0, rbi: 2, condition: 60, status: 'bench' },
        ]);
        setIsLoading(false);
      }, 600);
    };
    fetchPlayers();
  }, []);

  // ✨ 個別選手のAI分析 (Gemini API)
  const generateScoutingReport = async (player: Player) => {
    setAnalyzingPlayerId(player.id);
    try {
      const prompt = `プロ野球のスカウトとして、以下の選手の短評を日本語で作成してください。
      名前: ${player.name} (${player.position})
      成績: 打率${player.battingAvg}, 本塁打${player.hr}, 打点${player.rbi}
      コンディション: ${player.condition}%
      内容: 100文字程度で、現状の評価と今後の期待について、監督への報告形式で書いてください。`;

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = (await res.json()) as GeminiResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setScoutingReports(prev => ({ ...prev, [player.id]: text.trim() }));
    } catch (e) {
      toast.error("分析に失敗しました");
    } finally {
      setAnalyzingPlayerId(null);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.nameKana.includes(searchQuery) || p.number.includes(searchQuery);
    const posLabel = { 'P': '投手', 'C': '捕手', 'IF': '内野手', 'OF': '外野手' };
    const matchesFilter = filter === "すべて" || posLabel[p.mainPosition] === filter;
    return matchesSearch && matchesFilter;
  });

  const getPositionBadge = (player: Player) => {
    let styles = "";
    switch(player.mainPosition) {
      case 'P': styles = "bg-blue-500/10 text-blue-500 border-blue-500/20"; break;
      case 'C': styles = "bg-orange-500/10 text-orange-500 border-orange-500/20"; break;
      case 'IF': styles = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"; break;
      case 'OF': styles = "bg-amber-500/10 text-amber-500 border-amber-500/20"; break;
    }
    return (
      <Badge variant="outline" className={cn("rounded-md text-[10px] font-black px-2 py-0.5 tracking-tighter border", styles)}>
        {player.position}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black rounded-md px-2">現役</Badge>;
      case 'injured': return <Badge className="bg-red-500 text-white border-none text-[9px] font-black rounded-md px-2">故障中</Badge>;
      case 'bench': return <Badge className="bg-zinc-500 text-white border-none text-[9px] font-black rounded-md px-2">控え</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative pb-20 overflow-x-hidden">
      
      {/* 💡 統一背景グラデーション */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-in fade-in duration-1000">
        
        {/* ヘッダーエリア */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                選手管理システム
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                <Activity className="h-3 w-3" /> データ同期済み
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none">
              選手<span className="text-primary">名簿</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl h-14 px-6 border-border bg-card/40 backdrop-blur-sm font-black text-xs tracking-widest uppercase hover:bg-muted shadow-sm transition-all active:scale-95">
              入部申請を確認
            </Button>
            <Button 
              className="rounded-2xl h-14 px-8 bg-primary text-primary-foreground font-black text-lg shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <UserPlus className="h-6 w-6 stroke-[3px]" /> 選手を追加
            </Button>
          </div>
        </div>

        {/* 検索・フィルタエリア */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="名前、背番号、フリガナで検索..." 
              className="h-14 pl-12 rounded-2xl bg-card/40 backdrop-blur-sm border-border focus:ring-primary/20 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-hide">
            {['すべて', '投手', '捕手', '内野手', '外野手'].map((pos) => (
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

        {/* 選手グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card 
              key={player.id} 
              className="bg-card/40 dark:bg-zinc-900/20 backdrop-blur-md border-border rounded-[40px] overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-sm border-t-primary/5"
            >
              <CardContent className="p-0">
                <div className="p-8 space-y-8">
                  {/* 選手基本情報 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-[22px] bg-muted flex items-center justify-center text-3xl font-black text-foreground border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 tabular-nums italic">
                          {player.number}
                        </div>
                        {player.isCaptain && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-xl shadow-lg ring-4 ring-background">
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{player.nameKana}</p>
                          {getStatusBadge(player.status)}
                        </div>
                        <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-none tracking-tighter italic">
                          {player.name}
                        </h3>
                        <div className="pt-1">
                          {getPositionBadge(player)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground/30 hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* 統計データセクション */}
                  <div className="grid grid-cols-3 gap-3 bg-muted/30 p-5 rounded-[24px] border border-border/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Zap className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">打率</p>
                      <p className="text-2xl font-black tabular-nums tracking-tighter text-foreground">{player.battingAvg}</p>
                    </div>
                    <div className="text-center border-x border-border/50 space-y-0.5">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">本塁打</p>
                      <p className="text-2xl font-black tabular-nums tracking-tighter text-foreground">{player.hr}</p>
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">打点</p>
                      <p className="text-2xl font-black tabular-nums tracking-tighter text-foreground">{player.rbi}</p>
                    </div>
                  </div>

                  {/* コンディション管理 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                        <Activity className="h-3.5 w-3.5" /> コンディション
                      </span>
                      <span className={cn(
                        "text-sm font-black tabular-nums",
                        player.condition > 80 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {player.condition}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          player.condition > 80 ? "bg-primary" : 
                          player.condition < 50 ? "bg-red-500" : "bg-zinc-400"
                        )}
                        style={{ width: `${player.condition}%` }} 
                      />
                    </div>
                  </div>

                  {/* AI スカウティングレポート表示 */}
                  {scoutingReports[player.id] && (
                    <div className="bg-primary/5 p-5 rounded-[24px] border border-primary/10 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">AI スカウティング分析</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed text-foreground italic border-l-2 border-primary/20 pl-4 py-0.5">
                        {scoutingReports[player.id]}
                      </p>
                    </div>
                  )}
                </div>

                {/* アクションボタンエリア */}
                <div className="flex border-t border-border/60">
                  <button 
                    onClick={() => generateScoutingReport(player)}
                    disabled={analyzingPlayerId === player.id}
                    className="flex-1 py-5 hover:bg-primary/5 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all border-r border-border/60 text-primary disabled:opacity-50"
                  >
                    {analyzingPlayerId === player.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    AI分析
                  </button>
                  <button className="flex-1 py-5 hover:bg-muted/30 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all text-muted-foreground group/btn">
                    詳細データ <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 検索結果なしの表示 */}
        {filteredPlayers.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
            <Trophy className="h-16 w-16" />
            <div className="space-y-1">
              <p className="font-black text-2xl italic uppercase tracking-tighter">対象者なし</p>
              <p className="text-sm font-bold">条件に合う選手が見つかりませんでした。</p>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-20 py-12 border-t border-border text-center opacity-30">
        <p className="text-[10px] font-black tracking-[0.6em] text-muted-foreground uppercase">
          Elite Performance Tracking • i-Score Pro
        </p>
      </footer>
    </div>
  );
}

export default function PlayerRoster() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>}>
      <PlayerRosterContent />
    </Suspense>
  );
}
