// src/app/(protected)/dashboard/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    // 💡 全体にたっぷりの余白(py-8 px-4)と、最大幅(max-w-5xl)を設定して画面の中央に配置します
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">

      {/* ページヘッダー */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground font-medium">チームの最新の状況と試合記録を確認しましょう。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 💡 クイックアクション：グラデーションと大きな丸み(rounded-2xl)で特別感を演出 */}
        <Card className="relative overflow-hidden group rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all hover:shadow-md hover:border-primary/40">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
            {/* 💡 ボタンも角丸(rounded-xl)にして高さを出し、押しやすく */}
            <Button className="w-full rounded-xl h-12 text-base font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
              <Link href="../matches/new">
                試合作成へ進む <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 💡 スタッツサマリー：こちらも角丸で統一 */}
        <Card className="rounded-2xl border-border bg-background shadow-sm lg:col-span-2 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              今シーズンの成績
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <div className="text-4xl font-extrabold tracking-tighter">
              12<span className="text-2xl text-muted-foreground font-bold mx-1">勝</span>
              4<span className="text-2xl text-muted-foreground font-bold mx-1">敗</span>
            </div>
            <p className="text-sm text-muted-foreground font-bold mb-1.5 bg-muted px-2 py-1 rounded-md">勝率 .750</p>
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
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground font-medium" asChild>
            <Link href="/matches">すべて見る <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 💡 試合カード全体を Link で囲み、カードのどこをタップしても遷移するように変更 */}
          <Link href="/matches/1" className="block group">
            <Card className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98] overflow-hidden relative">
              {/* 左側のステータスカラーバー */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500" />
              <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">

                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                      <Calendar className="h-3.5 w-3.5" /> 2026年2月22日
                      <span className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold">練習試合</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> 多摩川グラウンド
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-extrabold text-green-700 ring-1 ring-inset ring-green-600/20">
                    勝利
                  </span>
                </div>

                {/* 💡 スコア部分を専用の背景色(bg-muted/30)で囲み、情報を見やすく整理 */}
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                  <div className="text-base font-extrabold w-1/3 text-center truncate">自チーム</div>
                  <div className="flex items-center justify-center gap-4 w-1/3">
                    <div className="text-3xl font-black text-primary">5</div>
                    <div className="text-muted-foreground font-bold">-</div>
                    <div className="text-3xl font-black text-muted-foreground">2</div>
                  </div>
                  <div className="text-base font-bold text-muted-foreground w-1/3 text-center truncate">相手チーム</div>
                </div>

              </CardContent>
            </Card>
          </Link>

          <Link href="/matches/2" className="block group">
            <Card className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98] overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-destructive" />
              <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">

                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                      <Calendar className="h-3.5 w-3.5" /> 2026年2月15日
                      <span className="bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold">春季大会</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> 等々力球場
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-extrabold text-destructive ring-1 ring-inset ring-destructive/20">
                    敗北
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                  <div className="text-base font-extrabold w-1/3 text-center truncate">自チーム</div>
                  <div className="flex items-center justify-center gap-4 w-1/3">
                    <div className="text-3xl font-black text-muted-foreground">1</div>
                    <div className="text-muted-foreground font-bold">-</div>
                    <div className="text-3xl font-black text-foreground">3</div>
                  </div>
                  <div className="text-base font-bold text-muted-foreground w-1/3 text-center truncate">相手チーム</div>
                </div>

              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  );
}
