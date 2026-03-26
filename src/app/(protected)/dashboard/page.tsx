"use client";

import React, { useEffect, useState } from "react";
// 💡 修正: 環境によって next/navigation が解決できない場合があるため、
// window.location を利用したナビゲーションへ移行し、エラーを回避します。
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  Sparkles,
  Loader2,
  TrendingUp,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義（型安全プロトコル適用）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Match {
  id: string;
  opponentName: string;
  date: string;
  status: 'scheduled' | 'ongoing' | 'finished';
  myScore: number;
  opponentScore: number;
  venue?: string;
}

interface DashboardData {
  success: boolean;
  matches: Match[];
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
  };
}

interface GeminiAnalysisResponse {
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
 * ⚾️ ダッシュボード・コンポーネント
 * 試合一覧、クイック統計、AIチーム分析を表示します。
 */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // 💡 ナビゲーション関数の定義 (window.location を使用)
  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  // 💡 データの取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 本来は Firebase や API から取得
        const res = await fetch('/api/dashboard/summary');
        // 型アサーションにより unknown 型エラーを防止
        const result = (await res.json()) as DashboardData;

        if (result.success) {
          setData(result);
        } else {
          // モックデータをセット（デモ用）
          setMockData();
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const setMockData = () => {
    setData({
      success: true,
      matches: [
        { id: "m1", opponentName: "ライオンズ", date: "2024-03-27", status: 'ongoing', myScore: 5, opponentScore: 3, venue: "第一球場" },
        { id: "m2", opponentName: "タイガース", date: "2024-03-24", status: 'finished', myScore: 2, opponentScore: 1, venue: "市民球場" },
        { id: "m3", opponentName: "ホークス", date: "2024-04-01", status: 'scheduled', myScore: 0, opponentScore: 0, venue: "河川敷A" },
      ],
      stats: { totalGames: 12, wins: 8, draws: 1, losses: 3 }
    });
  };

  // 💡 Gemini による「今日のチーム方針」生成
  const generateAiTip = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `現在の戦績は${data?.stats.wins}勝${data?.stats.losses}敗です。次の試合に向けて、チームの士気を高める短い格言またはアドバイスを1つ、野球の監督風に日本語で生成してください。`;
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "あなたは情熱的で信頼される野球チームの監督です。" }] }
        })
      });

      const result = (await res.json()) as GeminiAnalysisResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiTip(text.trim());
    } catch (e) {
      toast.error("AIアドバイスの生成に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヘッダー: 監督挨拶 & 新規試合
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="px-6 pt-10 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
              Manager Dashboard
            </h1>
            <p className="text-zinc-500 font-bold text-sm">Welcome back, Coach!</p>
          </div>
          <Button
            onClick={() => navigateTo('/matches/create')}
            className="rounded-2xl h-14 px-6 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> 新規試合
          </Button>
        </div>

        {/* 💡 AI チームアドバイス */}
        <Card className="border-primary/20 bg-primary/5 rounded-[32px] overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold leading-relaxed">
                {aiTip || "今日のチームへのアドバイスを生成しましょう。"}
              </p>
            </div>
            {!aiTip && (
              <Button size="sm" onClick={generateAiTip} disabled={isAnalyzing} variant="ghost" className="text-primary font-black text-xs shrink-0">
                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                分析
              </Button>
            )}
          </CardContent>
        </Card>
      </header>

      <main className="px-6 space-y-8">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. 統計サマリー
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Games", value: data.stats.totalGames, icon: History, color: "text-blue-500" },
            { label: "Wins", value: data.stats.wins, icon: Trophy, color: "text-yellow-500" },
            { label: "Draws", value: data.stats.draws, icon: Calendar, color: "text-zinc-500" },
            { label: "Win Rate", value: `${Math.round((data.stats.wins / data.stats.totalGames) * 100)}%`, icon: TrendingUp, color: "text-emerald-500" },
          ].map((item, i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 rounded-3xl">
              <CardContent className="p-5 flex flex-col items-center gap-2">
                <item.icon className={cn("h-5 w-5 opacity-50", item.color)} />
                <p className="text-2xl font-black tabular-nums">{item.value}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. 直近の試合リスト
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Recent Matches
            </h2>
            <Button variant="link" className="text-xs text-zinc-500 font-bold">すべて見る</Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.matches.map((match) => (
              <Card
                key={match.id}
                className="bg-zinc-900 border-zinc-800 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all group cursor-pointer"
                onClick={() => navigateTo(match.status === 'finished' ? `/matches/result?id=${match.id}` : `/matches/score?id=${match.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* ステータスバー */}
                    <div className={cn(
                      "w-2",
                      match.status === 'ongoing' ? "bg-primary" :
                        match.status === 'finished' ? "bg-zinc-700" : "bg-blue-500"
                    )} />

                    <div className="flex-1 p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "rounded-full text-[10px] font-black px-2 py-0",
                            match.status === 'ongoing' ? "border-primary text-primary bg-primary/5" : "text-zinc-500"
                          )}>
                            {match.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-bold text-zinc-500">{match.date} @ {match.venue}</span>
                        </div>
                        <h3 className="text-xl font-black">
                          vs <span className="text-white group-hover:text-primary transition-colors">{match.opponentName}</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score</p>
                          <p className="text-2xl font-black tabular-nums">
                            {match.myScore} - {match.opponentScore}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary transition-all">
                          {match.status === 'finished' ? (
                            <CheckCircle2 className="h-6 w-6 text-zinc-500 group-hover:text-primary-foreground" />
                          ) : (
                            <Play className="h-6 w-6 text-primary group-hover:text-primary-foreground fill-current" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. クイックメニュー
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => navigateTo('/players')}
            className="h-20 rounded-[28px] border-zinc-800 bg-zinc-900/50 font-black flex flex-col gap-1 transition-all hover:bg-zinc-800"
          >
            <Users className="h-5 w-5 text-zinc-500" />
            <span className="text-xs">選手名簿</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateTo('/stats/season')}
            className="h-20 rounded-[28px] border-zinc-800 bg-zinc-900/50 font-black flex flex-col gap-1 transition-all hover:bg-zinc-800"
          >
            <TrendingUp className="h-5 w-5 text-zinc-500" />
            <span className="text-xs">全体統計</span>
          </Button>
        </section>
      </main>

      {/* フッター装飾 */}
      <div className="mt-12 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase">i-Score Professional Baseball Analytics</p>
      </div>
    </div>
  );
}