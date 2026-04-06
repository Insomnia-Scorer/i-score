// src/app/(protected)/matches/create/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Save, Plus, MapPin, Calendar, Users, Trophy, Activity, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 💡 Suspenseで囲むためのメインコンテンツコンポーネント
function MatchCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // 'live' or 'quick'

  // --- State: 試合基本情報 ---
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");

  // --- State: スコアボード（爆速入力用） ---
  const [inningCount, setInningCount] = useState(7); // 初期は草野球標準の7回
  const [myInnings, setMyInnings] = useState<string[]>(Array(7).fill(""));
  const [opponentInnings, setOpponentInnings] = useState<string[]>(Array(7).fill(""));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState("自チーム");

  // 自チーム名の取得
  useEffect(() => {
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
    if (activeTeamId) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => {
          const current = data.find((t: any) => t.id === activeTeamId);
          if (current) setTeamName(current.name);
        }).catch(() => { });
    }
  }, []);

  // リアルタイム入力（Live）モードの場合は、まだ作っていないので一旦戻すかアラート
  if (mode === 'live') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="h-16 w-16 text-primary animate-pulse" />
        <h2 className="text-2xl font-black text-foreground">リアルタイム入力は開発中…</h2>
        <Button onClick={() => router.push('/dashboard')} variant="outline">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  // --- スコア計算ロジック ---
  const myTotalScore = myInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const opponentTotalScore = opponentInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  // --- イニング追加・削除 ---
  const addInning = () => {
    setInningCount(prev => prev + 1);
    setMyInnings(prev => [...prev, ""]);
    setOpponentInnings(prev => [...prev, ""]);
  };

  const removeInning = () => {
    if (inningCount <= 1) return;
    setInningCount(prev => prev - 1);
    setMyInnings(prev => prev.slice(0, -1));
    setOpponentInnings(prev => prev.slice(0, -1));
  };

  // --- 保存処理（爆速連携） ---
  const handleSave = async () => {
    if (!opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsSubmitting(true);
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

    try {
      // 1. 試合の「枠（基本情報）」を作成するAPI（POST /api/matches）
      const createRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: activeTeamId,
          opponent,
          date,
          matchType,
          battingOrder,
          location: venue, // UI側のvenueをAPIのlocation（surfaceDetails）に合わせる
          innings: inningCount
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) throw new Error(createData.error);
      const matchId = createData.matchId;

      // 2. 作成した試合を即座に「終了（スコア入力完了）」状態にするAPI（PATCH /api/matches/:id/finish）
      const finishRes = await fetch(`/api/matches/${matchId}/finish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myScore: myTotalScore,
          opponentScore: opponentTotalScore,
          myInningScores: myInnings.map(val => parseInt(val) || 0),
          opponentInningScores: opponentInnings.map(val => parseInt(val) || 0),
        }),
      });

      if (!finishRes.ok) throw new Error("スコアの保存に失敗しました");

      toast.success("試合結果を保存しました！🔥");
      router.push("/dashboard"); // 保存後はダッシュボードへ神速帰還

    } catch (error: any) {
      toast.error(error.message || "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-6 md:p-10 space-y-6 animate-in fade-in duration-500">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヘッダー
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              Quick Score Entry
              <span className="text-[10px] sm:text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                爆速入力モード
              </span>
            </h1>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="rounded-full px-6 font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          結果を保存
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pt-4">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. 基本情報入力（カード）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Card className="rounded-[32px] border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* 対戦相手 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Opponent Team
                </label>
                <Input
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="例: 東京ライオンズ"
                  className="h-14 rounded-2xl text-lg font-bold bg-background border-border/50"
                />
              </div>

              {/* 日付 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 rounded-2xl text-lg font-bold bg-background border-border/50"
                />
              </div>

              {/* 試合タイプ・先攻後攻トグル */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" /> Match Settings
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={matchType === 'official' ? 'default' : 'outline'}
                    onClick={() => setMatchType('official')}
                    className={cn("flex-1 h-14 rounded-2xl font-bold", matchType === 'official' && "bg-blue-600 hover:bg-blue-700")}
                  >
                    公式戦
                  </Button>
                  <Button
                    variant={matchType === 'practice' ? 'default' : 'outline'}
                    onClick={() => setMatchType('practice')}
                    className={cn("flex-1 h-14 rounded-2xl font-bold", matchType === 'practice' && "bg-emerald-600 hover:bg-emerald-700")}
                  >
                    練習試合
                  </Button>
                </div>
              </div>

              {/* 開催地（グラウンド） */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Venue
                </label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="例: 第一球場 A面"
                  className="h-14 rounded-2xl text-lg font-bold bg-background border-border/50"
                />
              </div>

            </div>

            {/* 先攻・後攻の切り替え */}
            <div className="pt-4 border-t border-border/40">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3 text-center">
                Batting Order (先攻・後攻)
              </label>
              <div className="flex items-center justify-center p-1 bg-muted/50 rounded-2xl max-w-sm mx-auto">
                <button
                  onClick={() => setBattingOrder('first')}
                  className={cn("flex-1 py-3 text-sm font-black rounded-xl transition-all", battingOrder === 'first' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  先攻 (Top)
                </button>
                <button
                  onClick={() => setBattingOrder('second')}
                  className={cn("flex-1 py-3 text-sm font-black rounded-xl transition-all", battingOrder === 'second' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  後攻 (Bottom)
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. 爆速スコアボードUI
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Card className="rounded-[32px] border-border/40 bg-background shadow-xl overflow-hidden">
          <div className="bg-zinc-900 text-zinc-100 p-4 sm:p-6 flex items-center justify-between">
            <h2 className="text-xl font-black italic tracking-wider flex items-center gap-2">
              SCOREBOARD
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={removeInning} disabled={inningCount <= 1} className="h-8 w-8 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-zinc-400 tabular-nums">{inningCount} INNINGS</span>
              <Button variant="outline" size="sm" onClick={addInning} className="h-8 w-8 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[600px]">

              {/* ヘッダー行（イニング数） */}
              <div className="flex items-center mb-4">
                <div className="w-32 sm:w-40 shrink-0" /> {/* チーム名が入る空白 */}
                <div className="flex-1 flex gap-2">
                  {Array.from({ length: inningCount }).map((_, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] font-black text-muted-foreground uppercase">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="w-16 sm:w-20 shrink-0 text-center text-xs font-black text-primary">R</div>
              </div>

              {/* --- 表: 1行目（先攻チーム） --- */}
              <div className="flex items-center mb-3">
                <div className="w-32 sm:w-40 shrink-0 font-black text-sm sm:text-base truncate pr-4">
                  {battingOrder === 'first' ? teamName : (opponent || 'Opponent')}
                </div>
                <div className="flex-1 flex gap-2">
                  {Array.from({ length: inningCount }).map((_, i) => {
                    const isMyTeam = battingOrder === 'first';
                    const value = isMyTeam ? myInnings[i] : opponentInnings[i];
                    const onChange = (e: any) => {
                      const val = e.target.value;
                      if (isMyTeam) {
                        const newScores = [...myInnings]; newScores[i] = val; setMyInnings(newScores);
                      } else {
                        const newScores = [...opponentInnings]; newScores[i] = val; setOpponentInnings(newScores);
                      }
                    };
                    return (
                      <Input
                        key={i} type="number" min="0" value={value} onChange={onChange}
                        className="flex-1 h-12 text-center text-lg font-black bg-muted/30 border-border/50 rounded-xl focus:bg-primary/10 focus:border-primary/50 transition-colors px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="-"
                      />
                    );
                  })}
                </div>
                <div className="w-16 sm:w-20 shrink-0 text-center text-3xl font-black text-foreground tabular-nums tracking-tighter">
                  {battingOrder === 'first' ? myTotalScore : opponentTotalScore}
                </div>
              </div>

              {/* --- 表: 2行目（後攻チーム） --- */}
              <div className="flex items-center">
                <div className="w-32 sm:w-40 shrink-0 font-black text-sm sm:text-base truncate pr-4">
                  {battingOrder === 'second' ? teamName : (opponent || 'Opponent')}
                </div>
                <div className="flex-1 flex gap-2">
                  {Array.from({ length: inningCount }).map((_, i) => {
                    const isMyTeam = battingOrder === 'second';
                    const value = isMyTeam ? myInnings[i] : opponentInnings[i];
                    const onChange = (e: any) => {
                      const val = e.target.value;
                      if (isMyTeam) {
                        const newScores = [...myInnings]; newScores[i] = val; setMyInnings(newScores);
                      } else {
                        const newScores = [...opponentInnings]; newScores[i] = val; setOpponentInnings(newScores);
                      }
                    };
                    return (
                      <Input
                        key={i} type="number" min="0" value={value} onChange={onChange}
                        className="flex-1 h-12 text-center text-lg font-black bg-muted/30 border-border/50 rounded-xl focus:bg-primary/10 focus:border-primary/50 transition-colors px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="-"
                      />
                    );
                  })}
                </div>
                <div className="w-16 sm:w-20 shrink-0 text-center text-3xl font-black text-foreground tabular-nums tracking-tighter">
                  {battingOrder === 'second' ? myTotalScore : opponentTotalScore}
                </div>
              </div>

            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

// Next.js の仕様（useSearchParams を使う場合は Suspense が必須）に対応
export default function MatchCreatePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <MatchCreateContent />
    </Suspense>
  );
}