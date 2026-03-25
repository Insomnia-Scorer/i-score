// src/app/(protected)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Users, ShieldCheck, Plus, ArrowRight, X, UserPlus } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { toast } from "sonner";

// チームの型定義
interface Team {
  id: string;
  name: string;
  year: number;
  tier: string | null;
  myRole?: string;
  status?: string; // 💡 追加：pending(申請中)かactive(参加中)か
}

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 参加申請モーダル用のステート
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTeam, setSearchTeam] = useState<Team | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json() as Team[];
        setTeams(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 招待IDでチームを検索する
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSearchTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setSearchTeam(null);
    try {
      const res = await fetch(`/api/teams/search/${searchId.trim()}`);
      const data = await res.json() as { success: boolean; team: Team; error?: string };
      if (res.ok && data.success) {
        setSearchTeam(data.team);
        toast.success("チームが見つかりました！");
      } else {
        toast.error(data.error || "チームが見つかりません。IDを確認してください。");
      }
    } catch (e) {
      toast.error("検索中にエラーが発生しました");
    } finally {
      setIsSearching(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 見つかったチームに参加申請を送る
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleJoinTeam = async () => {
    if (!searchedTeam) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/teams/${searchedTeam.id}/join`, { method: 'POST' });
      const data = await res.json() as { success: boolean; message: string; error?: string };
      if (res.ok && data.success) {
        toast.success("監督に参加申請を送信しました！承認をお待ちください。");
        setIsJoinModalOpen(false);
        setSearchId("");
        setSearchTeam(null);
        fetchMyTeams(); // 一覧を再取得して「申請中」を表示
      } else {
        toast.error(data.error || "参加申請に失敗しました");
      }
    } catch (e) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden p-4 sm:p-6 max-w-5xl mx-auto w-full mt-4">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 💡 初期状態（チームが0件の時のウェルカム画面） */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 sm:py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mb-8 border border-primary/20 shadow-inner rotate-3">
            <RiTeamFill className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">i-score へようこそ！</h1>
          <p className="text-muted-foreground font-bold text-center mb-12 max-w-md">
            スコアの入力や成績の確認を行うには、まずチームを作成するか、既存のチームに参加してください。
          </p>

          <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* アクション1：既存チームに参加する（保護者・選手向けメイン導線） */}
            <Card className="rounded-[32px] border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group shadow-sm" onClick={() => setIsJoinModalOpen(true)}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="p-4 bg-primary/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-black mb-2 text-primary">チームに参加する</h3>
                <p className="text-sm font-bold text-primary/70 mb-6">
                  監督から共有された「招待ID」を使って、既存のチームに参加申請を送ります。
                </p>
                <Button variant="default" className="mt-auto rounded-full w-full font-black">
                  IDを入力する <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* アクション2：新しくチームを作る（監督・代表者向け導線） */}
            <Card className="rounded-[32px] border-border/50 bg-card hover:border-primary/30 transition-colors cursor-pointer group shadow-sm" onClick={() => router.push('/teams')}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="p-4 bg-muted rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black mb-2">チームを新しく作る</h3>
                <p className="text-sm font-bold text-muted-foreground mb-6">
                  あなたが監督や代表者として、新しいチームを作成してメンバーを招待します。
                </p>
                <Button variant="outline" className="mt-auto rounded-full w-full font-black border-2">
                  作成画面へ <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* 💡 チーム所属済みのダッシュボード（既存実装のプレースホルダー） */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black">あなたのチーム</h1>
            <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="rounded-full font-bold">
              <UserPlus className="h-4 w-4 mr-2" /> 他のチームに参加
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {teams.map(team => (
              <Card key={team.id} className="rounded-[24px] border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => {
                // 申請中は入れないようにするガード
                if (team.status === 'pending') {
                  toast.info("現在、監督の承認待ちです。");
                  return;
                }
                localStorage.setItem("iScore_selectedTeamId", team.id);
                router.push('/teams');
              }}>
                <CardContent className="p-6">
                  {team.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-3">
                      ⏳ 承認待ち
                    </span>
                  )}
                  <h3 className="text-xl font-black">{team.name}</h3>
                  <p className="text-sm text-muted-foreground font-bold mt-1">{team.year}年度 {team.tier ? `/ ${team.tier}` : ''}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 💡 チーム参加申請モーダル（美しいDrawer風） */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsJoinModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/50 sm:hidden" />

            <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-border/50">
              <h2 className="text-xl font-black flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary"><Search className="h-5 w-5" /></div>
                チームを探す
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsJoinModalOpen(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>

            <div className="relative z-10 p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSearchTeam} className="space-y-4">
                <label className="text-sm font-black">監督から共有された招待ID</label>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    placeholder="例: a1b2c3d4-..."
                    className="h-12 rounded-[16px] font-mono text-sm bg-background border-border/50"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    disabled={isSearching || isJoining}
                  />
                  <Button type="submit" disabled={isSearching || isJoining || !searchId.trim()} className="h-12 px-6 rounded-[16px] font-black">
                    {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "検索"}
                  </Button>
                </div>
              </form>

              {/* チームが見つかった時の表示エリア */}
              {searchedTeam && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="p-5 bg-primary/5 border border-primary/20 rounded-[20px] text-center space-y-3 mb-4 shadow-inner">
                    <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-black text-primary/70 uppercase tracking-widest">チームが見つかりました</p>
                    <h3 className="text-2xl font-black text-foreground">{searchedTeam.name}</h3>
                    <p className="text-sm font-bold text-muted-foreground">{searchedTeam.year}年度 {searchedTeam.tier ? `/ ${searchedTeam.tier}` : ''}</p>
                  </div>
                  <Button onClick={handleJoinTeam} disabled={isJoining} className="w-full h-14 rounded-[20px] text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                    {isJoining ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "このチームに参加申請を送る"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}