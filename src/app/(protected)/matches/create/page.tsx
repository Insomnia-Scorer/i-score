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

function MatchCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");

  const [inningCount, setInningCount] = useState(7);
  const [myInnings, setMyInnings] = useState<string[]>(Array(7).fill(""));
  const [opponentInnings, setOpponentInnings] = useState<string[]>(Array(7).fill(""));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState("自チーム");

  useEffect(() => {
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
    if (activeTeamId) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => {
          const teamsData = data as any[];
          const current = teamsData.find((t: any) => t.id === activeTeamId);
          if (current) setTeamName(current.name);
        }).catch(() => { });
    }
  }, []);

  if (mode === 'live') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="h-16 w-16 text-primary animate-pulse" />
        <h2 className="text-2xl font-black text-foreground">リアルタイム入力は開発中…</h2>
        <Button onClick={() => router.push('/dashboard')} variant="outline">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  const myTotalScore = myInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const opponentTotalScore = opponentInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);

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

  const handleSave = async () => {
    if (!opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsSubmitting(true);
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

    try {
      const createRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: activeTeamId,
          opponent,
          date,
          matchType,
          battingOrder,
          location: venue,
          innings: inningCount
        }),
      });

      const createData = (await createRes.json()) as { success: boolean; matchId: string; error?: string };
      if (!createData.success) throw new Error(createData.error);
      const matchId = createData.matchId;

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
      router.push("/dashboard");

    } catch (error: any) {
      toast.error(error.message || "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 🌟 修正1: 全体の高さを 100dvh (スマホのアドレスバーを考慮した全画面) にし、余白を極限まで削る
    <div className="min-h-[100dvh] bg-transparent p-2 sm:p-4 space-y-3 flex flex-col animate-in fade-in duration-300 max-w-lg mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヘッダー (コンパクト化)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
            Quick Score
            <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded uppercase tracking-widest hidden sm:inline-block">
              爆速入力
            </span>
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          size="sm"
          className="rounded-full px-4 h-8 font-bold shadow-md hover:scale-105 transition-transform text-xs"
        >
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
          保存
        </Button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. 基本情報入力 (2カラム高密度配置)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="rounded-[24px] border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm shrink-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">

            {/* 対戦相手 (全幅) */}
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Opponent
              </label>
              <Input
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="対戦相手名"
                className="h-10 rounded-xl text-sm font-bold bg-background border-border/50"
              />
            </div>

            {/* 日付 (半幅) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-xl text-sm font-bold bg-background border-border/50 px-2.5"
              />
            </div>

            {/* 試合タイプ (半幅) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Type
              </label>
              <div className="flex gap-1">
                <Button
                  variant={matchType === 'official' ? 'default' : 'outline'}
                  onClick={() => setMatchType('official')}
                  className={cn("flex-1 h-10 px-0 rounded-xl text-xs font-bold", matchType === 'official' && "bg-blue-600 hover:bg-blue-700")}
                >
                  公式
                </Button>
                <Button
                  variant={matchType === 'practice' ? 'default' : 'outline'}
                  onClick={() => setMatchType('practice')}
                  className={cn("flex-1 h-10 px-0 rounded-xl text-xs font-bold", matchType === 'practice' && "bg-emerald-600 hover:bg-emerald-700")}
                >
                  練習
                </Button>
              </div>
            </div>

            {/* 開催地 (半幅) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Venue
              </label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="球場・グラウンド"
                className="h-10 rounded-xl text-xs font-bold bg-background border-border/50"
              />
            </div>

            {/* 先攻/後攻トグル (半幅) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Batting
              </label>
              <div className="flex items-center p-0.5 bg-muted/50 rounded-xl border border-border/50">
                <button
                  onClick={() => setBattingOrder('first')}
                  className={cn("flex-1 h-8 text-[11px] font-black rounded-lg transition-all", battingOrder === 'first' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  先攻
                </button>
                <button
                  onClick={() => setBattingOrder('second')}
                  className={cn("flex-1 h-8 text-[11px] font-black rounded-lg transition-all", battingOrder === 'second' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  後攻
                </button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. 爆速スコアボード (極限まで要素を削ぎ落とした表)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="rounded-[24px] border-border/40 bg-background shadow-xl overflow-hidden flex-1 flex flex-col">

        {/* 電光掲示板ヘッダー */}
        <div className="bg-zinc-900 text-zinc-100 p-2 sm:p-3 px-4 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-black italic tracking-wider flex items-center gap-2">
            SCOREBOARD
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={removeInning} disabled={inningCount <= 1} className="h-7 w-7 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              <X className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-bold text-zinc-400 tabular-nums w-12 text-center">{inningCount} INN</span>
            <Button variant="outline" size="sm" onClick={addInning} className="h-7 w-7 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* スコア入力エリア (横スクロール対応だが7回までは1画面に収まる設計) */}
        <div className="p-3 overflow-x-auto flex-1">
          <div className="min-w-max">

            {/* ヘッダー行（イニング数） */}
            <div className="flex items-center mb-2">
              <div className="w-16 sm:w-24 shrink-0" /> {/* チーム名が入る空白 */}
              <div className="flex gap-1.5">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <div key={i} className="w-9 text-center text-[10px] font-black text-muted-foreground uppercase">
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="w-10 shrink-0 text-center text-[10px] font-black text-primary">R</div>
            </div>

            {/* --- 表: 1行目（先攻チーム） --- */}
            <div className="flex items-center mb-2">
              <div className="w-16 sm:w-24 shrink-0 text-xs font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'first' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1.5">
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
                      key={i}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={value}
                      onChange={onChange}
                      className="w-9 h-10 text-center text-sm font-black bg-muted/30 border-border/50 rounded-xl focus:bg-primary/10 focus:border-primary/50 transition-colors px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                      placeholder="-"
                    />
                  );
                })}
              </div>
              <div className="w-10 shrink-0 text-center text-xl font-black text-foreground tabular-nums tracking-tighter">
                {battingOrder === 'first' ? myTotalScore : opponentTotalScore}
              </div>
            </div>

            {/* --- 表: 2行目（後攻チーム） --- */}
            <div className="flex items-center">
              <div className="w-16 sm:w-24 shrink-0 text-xs font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'second' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1.5">
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
                      key={i}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={value}
                      onChange={onChange}
                      className="w-9 h-10 text-center text-sm font-black bg-muted/30 border-border/50 rounded-xl focus:bg-primary/10 focus:border-primary/50 transition-colors px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                      placeholder="-"
                    />
                  );
                })}
              </div>
              <div className="w-10 shrink-0 text-center text-xl font-black text-foreground tabular-nums tracking-tighter">
                {battingOrder === 'second' ? myTotalScore : opponentTotalScore}
              </div>
            </div>

          </div>
        </div>
      </Card>

    </div>
  );
}

export default function MatchCreatePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <MatchCreateContent />
    </Suspense>
  );
}