"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trophy, Users, ChevronRight, Sparkles, Loader2, TrendingUp, History, Activity, CalendarDays, Target, Zap, Clock, CloudSun, Wind, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Schema Protocol)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Match {
  id: string;
  opponentName: string;
  date: string;
  status: 'scheduled' | 'ongoing' | 'finished';
  myScore: number;
  opponentScore: number;
  venue: string;
  inning?: string;
}

interface DashboardData {
  success: boolean;
  matches: Match[];
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    avgRuns: number;
  };
}

interface GeminiAnalysisResponse {
  candidates?: { content?: { parts?: { text?: string; }[]; }; }[];
  error?: { message: string };
}

function DashboardContent() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ローカルストレージから「現在選択中のチームID」を取得
        const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

        if (!activeTeamId) {
          // チームが選ばれていない場合は空のデータをセット
          setData({
            success: true,
            matches: [],
            stats: { totalGames: 0, wins: 0, draws: 0, losses: 0, winRate: 0, avgRuns: 0 }
          });
          setIsLoading(false);
          return;
        }

        // 2. 最近の試合結果をAPIから取得（先ほど作ったAPI！）
        const matchesRes = await fetch(`/api/teams/${activeTeamId}/recent-matches`, { cache: "no-store" });
        if (!matchesRes.ok) throw new Error("試合取得失敗");
        const matchesData = await matchesRes.json() as any[];

        // APIのレスポンスをDashboardの型にマッピング
        const formattedMatches: Match[] = matchesData.map(m => ({
          id: m.id,
          opponentName: m.opponent,
          date: m.date,
          status: m.status,
          myScore: m.myScore,
          opponentScore: m.opponentScore,
          venue: m.matchType === 'official' ? "公式戦" : "練習試合", // UIの表示上、ここに試合タイプを入れます
          inning: "終了"
        }));

        // 3. 勝敗などの統計情報を計算（直近の試合から）
        let wins = 0, losses = 0, draws = 0, totalRuns = 0;
        formattedMatches.forEach(m => {
          if (m.myScore > m.opponentScore) wins++;
          else if (m.myScore < m.opponentScore) losses++;
          else draws++;
          totalRuns += m.myScore;
        });

        const totalGames = formattedMatches.length;
        // 勝率: (勝ち / (勝ち + 負け)) * 100。引き分けは除外するプロ野球方式
        const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
        const avgRuns = totalGames > 0 ? Number((totalRuns / totalGames).toFixed(1)) : 0;

        setData({
          success: true,
          matches: formattedMatches,
          stats: {
            totalGames, wins, draws, losses, winRate, avgRuns
          }
        });

      } catch (e) {
        console.error("Dashboard fetch error:", e);
        toast.error("データの取得に失敗しました");
        // エラー時は安全な空データをセット
        setData({
          success: false,
          matches: [],
          stats: { totalGames: 0, wins: 0, draws: 0, losses: 0, winRate: 0, avgRuns: 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateAiTip = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = ""; // ※ 本番では環境変数から読み込むよう修正してください（process.env.NEXT_PUBLIC_GEMINI_API_KEY など）
      if (!apiKey) {
        toast.error("APIキーが設定されていません。");
        setIsAnalyzing(false);
        return;
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const prompt = "野球チームの監督に、次の試合の勝利に向けた短い戦術的な一言を、プロの視点で日本語で生成してください。";

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "あなたはプロ野球の敏腕監督です。短く、情熱的で、かつ戦術的な助言を行ってください。" }] }
        })
      });
      const result = (await res.json()) as GeminiAnalysisResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiTip(text.trim());
        toast.success("AI監督からの助言を受信しました");
      }
    } catch (e) {
      toast.error("AI分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-transparent p-3 sm:p-6 md:p-10 space-y-8 md:space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/40 pb-8 md:pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </div>
            <Skeleton className="h-16 w-64 sm:h-20 sm:w-96 rounded-lg bg-white/5" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <Skeleton className="h-16 w-full sm:w-80 rounded-[20px] sm:rounded-2xl bg-white/5" />
            <Skeleton className="h-14 w-full sm:w-48 rounded-[24px] bg-primary/20" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-4 space-y-10">
            <Skeleton className="h-[320px] w-full rounded-[40px] bg-white/5" />
            <div className="space-y-3">
              <Skeleton className="h-[88px] w-full rounded-[32px] bg-white/5" />
              <Skeleton className="h-[88px] w-full rounded-[32px] bg-white/5" />
              <Skeleton className="h-[88px] w-full rounded-[32px] bg-white/5" />
            </div>
          </div>
          <div className="xl:col-span-8 space-y-10">
            <Skeleton className="h-[140px] w-full rounded-[32px] bg-white/5" />
            <div className="space-y-6 pt-4">
              <Skeleton className="h-6 w-48 bg-white/5" />
              <div className="space-y-4">
                <Skeleton className="h-[180px] w-full rounded-[40px] bg-white/5" />
                <Skeleton className="h-[180px] w-full rounded-[40px] bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-6 md:p-10 space-y-8 md:space-y-12 animate-in fade-in duration-1000">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-border/40 pb-8 md:pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
              Team Base
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
              <Flame className="h-3 w-3" /> Ready for next match
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase text-foreground leading-none">
            Team <span className="text-primary underline decoration-primary/20 underline-offset-8">Hub</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-3 sm:gap-5 font-bold sm:font-medium text-foreground/90 sm:text-foreground/80 bg-white/90 dark:bg-background/40 backdrop-blur-xl border border-white/10 rounded-[20px] sm:rounded-2xl px-3 py-4 sm:px-5 sm:py-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
              <span className="tabular-nums tracking-wider text-base sm:text-sm">
                {mounted ? `${formattedTime}` : "--:--:--"}
              </span>
            </div>
            <div className="w-px h-6 sm:h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CloudSun className="w-5 h-5 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-base sm:text-sm">22°C</span>
            </div>
            <div className="w-px h-6 sm:h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Wind className="w-5 h-5 sm:w-4 sm:h-4 text-sky-400" />
              <span className="text-base sm:text-sm whitespace-nowrap">南 5m/s</span>
            </div>
          </div>

          <Button
            onClick={() => router.push('/matches/create')}
            className="rounded-[24px] h-14 sm:h-14 px-8 bg-primary text-primary-foreground font-black text-xl sm:text-lg shadow-none border border-primary/20 hover:border-primary/40 hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center shrink-0"
          >
            <Plus className="h-6 w-6 sm:h-5 sm:w-5 stroke-[3px]" /> NEW MATCH
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* 左側: チームインテル */}
        <div className="xl:col-span-4 space-y-10">
          <Card className="p-0 gap-0 bg-white/90 dark:bg-card/30 backdrop-blur-xl border-border/40 rounded-[40px] overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-all hover:border-primary/30">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="stroke-muted/20 fill-none" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45"
                    className="stroke-primary fill-none transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (283 * data.stats.winRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tabular-nums tracking-tighter text-foreground">{data.stats.winRate}%</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Win Rate</span>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full pt-4">
                <div className="text-center">
                  <p className="text-xl font-black text-foreground">{data.stats.wins}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Won</p>
                </div>
                <div className="text-center border-x border-border/40">
                  <p className="text-xl font-black text-foreground">{data.stats.losses}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lost</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-foreground">{data.stats.avgRuns}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Runs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "選手名簿", icon: Users, path: "/team/players", sub: "Squad List" }, // 💡 リンクを実際のパスに合わせて修正
              { label: "チーム詳細", icon: Trophy, path: "/team", sub: "Team Profile" },
              { label: "シーズン分析", icon: TrendingUp, path: "/matches/stats", sub: "Analytics" },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.path)}
                className="flex items-center gap-5 p-6 rounded-[32px] bg-white/90 dark:bg-card/20 border border-border/40 hover:bg-card/40 hover:border-primary/40 transition-all group shadow-sm hover:shadow-md dark:shadow-none text-left w-full"
              >
                <div className="p-4 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black uppercase tracking-widest text-foreground truncate">{item.label}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase truncate">{item.sub}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* 右側: 試合オペレーション */}
        <div className="xl:col-span-8 space-y-10">

          <section className="p-0 gap-0 cursor-pointer group relative" onClick={!aiTip ? generateAiTip : undefined}>
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative bg-primary/5 border-primary/20 rounded-[32px] overflow-hidden border-dashed border-2 hover:bg-primary/10 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
              <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    {isAnalyzing ? <Loader2 className="h-10 w-10 animate-spin" /> : <Sparkles className="h-10 w-10" />}
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase px-2 rounded-md">AI Manager</Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Strategic Insight</span>
                  </div>
                  <h3 className="text-xl font-bold leading-relaxed text-foreground italic border-l-2 border-primary/20 pl-4">
                    {aiTip ? `"${aiTip}"` : "タップして、現在の戦績に基づいたAI監督からの戦術指南を受け取る。"}
                  </h3>
                </div>
                <Zap className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors hidden sm:block shrink-0" />
              </CardContent>
            </Card>
          </section>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Live & Recent Reports
              </h2>
              <Button variant="ghost" onClick={() => router.push('/matches')} className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary">
                View History
              </Button>
            </div>

            <div className="space-y-4">
              {data.matches.length > 0 ? (
                data.matches.map((match) => (
                  <Card
                    key={match.id}
                    onClick={() => router.push(match.status === 'finished' ? `/matches/result?id=${match.id}` : `/matches/score?id=${match.id}`)}
                    className={cn(
                      "p-0 gap-0",
                      "bg-white/90 dark:bg-card/20 dark:bg-zinc-900/10 backdrop-blur-md border-border/40 rounded-[40px] overflow-hidden transition-all duration-300 group hover:bg-card/40 hover:border-primary/30 cursor-pointer shadow-sm hover:shadow-md dark:shadow-none",
                      match.status === 'ongoing' ? "ring-1 ring-primary/40 bg-card/40" : ""
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-stretch">
                        <div className={cn(
                          "w-full sm:w-28 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border/40 gap-2 shrink-0",
                          match.status === 'ongoing' ? "bg-primary text-primary-foreground" : "bg-muted/30"
                        )}>
                          {match.status === 'ongoing' ? (
                            <>
                              <div className="relative h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">{match.inning}</span>
                            </>
                          ) : (
                            <>
                              <CalendarDays className="h-6 w-6 opacity-30" />
                              <span className="text-[10px] font-black opacity-40 uppercase tabular-nums tracking-widest">{match.date}</span>
                            </>
                          )}
                        </div>

                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between gap-4 sm:gap-6">
                          <div className="space-y-1 overflow-hidden">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Matchup</p>
                            <h3 className="text-2xl sm:text-3xl font-black italic text-foreground group-hover:text-primary transition-colors leading-none tracking-tighter truncate">
                              vs {match.opponentName}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground pt-1">
                              <Target className="h-3 w-3 text-primary/40 shrink-0" />
                              <span className="truncate">{match.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                            <div className="text-center space-y-1 hidden sm:block">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Score</p>
                              <div className="flex items-center gap-4">
                                <span className={cn(
                                  "text-4xl font-black tabular-nums tracking-tighter",
                                  match.myScore > match.opponentScore ? "text-primary" : "text-foreground"
                                )}>{match.myScore}</span>
                                <div className="h-8 w-px bg-border/40 rotate-[20deg]" />
                                <span className="text-4xl font-black tabular-nums tracking-tighter text-muted-foreground/40">
                                  {match.opponentScore}
                                </span>
                              </div>
                            </div>

                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted/40 flex items-center justify-center border border-border/40 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-inner shrink-0">
                              {match.status === 'finished' ? (
                                <History className="h-5 w-5 sm:h-6 sm:w-6" />
                              ) : (
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/40 rounded-[40px] bg-white/50 dark:bg-zinc-900/10 backdrop-blur-sm">
                  <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-black text-foreground">試合データがありません</p>
                  <p className="text-sm font-bold text-muted-foreground mt-1">「NEW MATCH」ボタンから新しい試合を記録しましょう！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-border/20 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.8em] text-muted-foreground uppercase">
          Tactical Intelligence • i-Score System OS
        </p>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}