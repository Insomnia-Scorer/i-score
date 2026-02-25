// src/app/(protected)/matches/new/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Shield, Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

import { createMatchAction } from "@/app/actions/match";
import { toast } from "sonner";

export default function NewMatchPage() {
  const router = useRouter();

  // 💡 スマホでタップしやすいように、状態として管理する項目
  const [matchType, setMatchType] = useState<"practice" | "official">("practice");
  const [battingOrder, setBattingOrder] = useState<"first" | "second">("first");
  const [isLoading, setIsLoading] = useState(false);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      opponent: formData.get("opponent") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      matchType,
      battingOrder,
    };

    try {
      const result = await createMatchAction(data);

      if (result.success) {
        toast.success("試合を作成しました。");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "試合の作成に失敗しました。");
      }
    } catch (error) {
      toast.error("ネットワークエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">

      {/* 💡 ヘッダー：戻るボタンとタイトルをスッキリ配置 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-extrabold tracking-tight">新しい試合を作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-2xl border-border/50 bg-background/50 shadow-sm overflow-hidden backdrop-blur-sm">
          <CardContent className="p-6 space-y-8">

            {/* 1. 対戦相手 */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Swords className="h-4 w-4 text-primary" /> 対戦相手
              </label>
              <Input
                name="opponent"
                required
                placeholder="例: 多摩川イーグルス"
                className="h-14 text-lg rounded-xl px-4 bg-background border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary"
              />
            </div>

            {/* 2. 試合日 & 場所 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                  <Calendar className="h-4 w-4 text-primary" /> 試合日
                </label>
                {/* 💡 スマホのネイティブカレンダー入力(type="date")を活用 */}
                <Input
                  name="date"
                  required
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]} // 今日をデフォルトに
                  className="h-14 text-lg rounded-xl px-4 bg-background border-border/50 focus-visible:ring-primary/20 block w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                  <MapPin className="h-4 w-4 text-primary" /> 場所 (任意)
                </label>
                <Input
                  name="location"
                  placeholder="例: 等々力球場"
                  className="h-14 text-lg rounded-xl px-4 bg-background border-border/50 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* 3. 試合種別 (セレクトボックスの代わりにタップしやすいボタン) */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Trophy className="h-4 w-4 text-primary" /> 試合種別
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMatchType("practice")}
                  className={cn(
                    "h-12 rounded-xl text-sm font-bold transition-all duration-200",
                    matchType === "practice"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  練習試合
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType("official")}
                  className={cn(
                    "h-12 rounded-xl text-sm font-bold transition-all duration-200",
                    matchType === "official"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  公式戦 / 大会
                </button>
              </div>
            </div>

            {/* 4. 先攻・後攻 */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Shield className="h-4 w-4 text-primary" /> 先攻・後攻
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setBattingOrder("first")}
                  className={cn(
                    "h-12 rounded-xl text-sm font-bold transition-all duration-200",
                    battingOrder === "first"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  先攻 (Bat First)
                </button>
                <button
                  type="button"
                  onClick={() => setBattingOrder("second")}
                  className={cn(
                    "h-12 rounded-xl text-sm font-bold transition-all duration-200",
                    battingOrder === "second"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  後攻 (Field First)
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 💡 送信ボタン：画面下部に大きく固定的なレイアウトで配置 */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-xl text-lg font-extrabold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "準備中..." : "この内容で試合を開始する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
