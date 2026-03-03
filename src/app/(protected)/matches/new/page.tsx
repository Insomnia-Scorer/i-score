// src/app/(protected)/matches/new/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CalendarPlus, Trophy, Users, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

function NewMatchForm() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchType, setMatchType] = useState("practice");

  // 💡 追加：イニング数（デフォルトは7回制）
  const [innings, setInnings] = useState<number>(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          season,
          opponent,
          date,
          matchType,
          battingOrder: "9",
          innings, // 💡 追加：イニング数を送信
        }),
      });

      if (res.ok) {
        const data = await res.json() as { matchId: string };
        router.push(`/matches/lineup?id=${data.matchId}&teamId=${teamId}`);
      } else {
        alert("試合の作成に失敗しました");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
      setIsLoading(false);
    }
  };

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground font-bold">チーム情報が取得できませんでした。</p>
        <Button asChild variant="outline"><Link href="/dashboard">ダッシュボードに戻る</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
      <PageHeader
        href="/dashboard"
        icon={CalendarPlus}
        title="試合の新規作成"
        subtitle="試合情報の入力と設定をしてください。"
      />

      <main className="flex-1 px-4 pb-4 pt-2 max-w-2xl mx-auto w-full mt-6 animate-in fade-in duration-500">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* シーズン選択 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> シーズン・大会名
                </label>
                <input type="text" required className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" placeholder="例: 2026, 2026-春季大会" value={season} onChange={(e) => setSeason(e.target.value)} />
              </div>

              {/* 対戦相手 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> 対戦相手
                </label>
                <input type="text" required className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" placeholder="例: 横浜ボーイズ" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
              </div>

              {/* 試合日 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">試合日</label>
                <input type="date" required className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              {/* 試合種別 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" /> 試合種別
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${matchType === 'practice' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                    <input type="radio" name="matchType" value="practice" className="sr-only" checked={matchType === 'practice'} onChange={() => setMatchType('practice')} />
                    <span className="font-bold">練習試合</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${matchType === 'official' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                    <input type="radio" name="matchType" value="official" className="sr-only" checked={matchType === 'official'} onChange={() => setMatchType('official')} />
                    <span className="font-bold">公式戦</span>
                  </label>
                </div>
              </div>

              {/* 💡 追加：イニング数の設定 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> 規定イニング数
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[6, 7, 9].map(num => (
                    <label key={num} className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 cursor-pointer transition-all ${innings === num ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                      <input type="radio" name="innings" value={num} className="sr-only" checked={innings === num} onChange={() => setInnings(num)} />
                      <span className="font-bold text-lg">{num}回</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl shadow-md mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "試合を作成してスコアを入力する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <NewMatchForm />
    </Suspense>
  );
}