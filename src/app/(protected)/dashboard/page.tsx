// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, MapPin, Loader2 } from "lucide-react";

// 💡 データベースから取得する試合データの型定義
interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string | null;
  matchType: string;
  status: string;
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 コンポーネントがマウントされた時に Cloudflare Workers API からデータを取得
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        if (!response.ok) throw new Error('Failed to fetch matches');
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("試合データの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">
      
      {/* ページヘッダー */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground font-medium">チームの最新の状況と試合記録を確認しましょう。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* クイックアクション */}
        <Link href="/matches/new" className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
          <Card className="relative overflow-hidden group rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] cursor-pointer">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Plus className="h-5 w-5" />
                  </div>
                  新しい試合を記録
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                  スコアブックの入力を開始します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full rounded-xl h-12 text-base font-bold shadow-sm bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                  試合作成へ進む <ChevronRight className="ml-2 h-5 w-5" />
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>

        {/* スタッツサマリー (※現状はダミー。将来的に全試合のスコアから計算します) */}
        <Card className="rounded-2xl border-border bg-background shadow-sm lg:col-span-2 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              今シーズンの成績（※準備中）
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <div className="text-4xl font-extrabold tracking-tighter opacity-50">
              --<span className="text-2xl text-muted-foreground font-bold mx-1">勝</span>
              --<span className="text-2xl text-muted-foreground font-bold mx-1">敗</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の試合一覧 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
            <History className="h-5 w-5 text-primary" />
            最近の試合
          </h2>
        </div>

        {/* 💡 データ読み込み中の表示 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          /* 💡 試合データが0件の場合の表示 */
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium mb-4">まだ試合の記録がありません。</p>
            <Button asChild variant="outline">
              <Link href="/matches/new">最初の試合を記録する</Link>
            </Button>
          </div>
        ) : (
          /* 💡 取得した試合データをマッピングして表示 */
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <Link key={match.id} href={`/matches/score?id=${match.id}`} className="block group">
                <Card className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98] overflow-hidden relative">
                  
                  {/* ステータスに応じた左側のライン色 */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${match.status === 'scheduled' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                  
                  <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                          <Calendar className="h-3.5 w-3.5" /> 
                          {/* 日付をフォーマット (YYYY-MM-DD -> YYYY年MM月DD日) */}
                          {new Date(match.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                          <span className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold">
                            {match.matchType === 'practice' ? '練習試合' : '公式戦'}
                          </span>
                        </div>
                        {match.location && (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {match.location}
                          </div>
                        )}
                      </div>
                      
                      {/* 試合のステータスバッジ */}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset ${
                        match.status === 'scheduled' 
                          ? 'bg-slate-50 text-slate-700 ring-slate-600/20' 
                          : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      }`}>
                        {match.status === 'scheduled' ? '試合前' : '進行中'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                      <div className="text-base font-extrabold w-1/3 text-center truncate">自チーム</div>
                      <div className="flex items-center justify-center gap-4 w-1/3">
                        <div className="text-3xl font-black text-foreground">0</div>
                        <div className="text-muted-foreground font-bold">-</div>
                        <div className="text-3xl font-black text-foreground">0</div>
                      </div>
                      <div className="text-base font-bold text-muted-foreground w-1/3 text-center truncate">{match.opponent}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
