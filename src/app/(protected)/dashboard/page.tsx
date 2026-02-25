// src/app/(protected)/dashboard/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, MapPin } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ページヘッダー */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">チームの最新の状況と試合記録を確認しましょう。</p>
      </div>

      {/* 💡 クイックアクション（一番目立つように配置） */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Plus className="h-5 w-5" />
              新しい試合を記録
            </CardTitle>
            <CardDescription>
              スコアブックの入力を開始します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full rounded-full shadow-sm hover:scale-[1.02] transition-transform" asChild>
              <Link href="/matches/new">
                試合作成へ進む <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 💡 スタッツサマリー */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              今シーズンの成績
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">12勝 4敗</div>
            <p className="text-xs text-muted-foreground mt-1">勝率 .750</p>
          </CardContent>
        </Card>
      </div>

      {/* 💡 最近の試合一覧（ダミーデータでレイアウトを確認） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            最近の試合
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/matches">すべて見る</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 試合カードのモック 1 */}
          <Card className="hover:bg-muted/50 transition-colors shadow-sm cursor-pointer border-l-4 border-l-green-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="h-3 w-3" /> 2026年2月22日
                    <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">練習試合</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" /> 多摩川グラウンド
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    勝利
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-lg font-bold">自チーム</div>
                <div className="text-3xl font-extrabold text-primary">5</div>
                <div className="text-muted-foreground font-medium px-4">-</div>
                <div className="text-3xl font-extrabold text-muted-foreground">2</div>
                <div className="text-lg font-bold text-muted-foreground">相手チーム</div>
              </div>
            </CardContent>
          </Card>
          
          {/* 試合カードのモック 2 */}
           <Card className="hover:bg-muted/50 transition-colors shadow-sm cursor-pointer border-l-4 border-l-red-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="h-3 w-3" /> 2026年2月15日
                    <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">春季大会</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" /> 等々力球場
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    敗北
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-lg font-bold">自チーム</div>
                <div className="text-3xl font-extrabold text-muted-foreground">1</div>
                <div className="text-muted-foreground font-medium px-4">-</div>
                <div className="text-3xl font-extrabold text-foreground">3</div>
                <div className="text-lg font-bold text-muted-foreground">相手チーム</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
