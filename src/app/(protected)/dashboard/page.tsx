// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canEditScore, isApprovedMember, ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, MapPin, Loader2, Users, CheckCircle2 } from "lucide-react";

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string | null;
  matchType: string;
  status: string;
  season: string;
}

interface Team {
  id: string;
  name: string;
  myRole: string;
  isFounder: boolean;
}

export default function DashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  // 状態管理
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // チーム作成用の状態
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

  // 1. チーム一覧の取得
  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json() as Team[];
        setTeams(data);
        if (data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(data[0].id); // 最初のチームをデフォルト選択
        }
      }
    } catch (error) {
      console.error("チーム取得エラー:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // 2. 選択されたチームの試合を取得
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchMatches = async () => {
      setIsLoadingMatches(true);
      try {
        const response = await fetch(`/api/matches?teamId=${selectedTeamId}`);
        if (response.ok) {
          const data = await response.json() as Match[];
          setMatches(data);
        }
      } catch (error) {
        console.error("試合取得エラー:", error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedTeamId]);

  // 3. チームの新規作成処理
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName, role: newTeamRole }),
      });

      if (response.ok) {
        setNewTeamName("");
        await fetchTeams(); // チーム一覧を再取得
      } else {
        alert("チームの作成に失敗しました");
      }
    } catch (error) {
      console.error("作成エラー:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isSessionLoading || isLoadingTeams) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // 現在選択中のチーム情報を取得
  const currentTeam = teams.find(t => t.id === selectedTeamId);
  // スコア編集権限があるか（チーム内ロールで判定）
  const canEdit = currentTeam ? canEditScore(currentTeam.myRole) : false;

  // =========================================================
  // 💡 パターンA：まだチームに所属していない場合（新規作成画面）
  // =========================================================
  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">ようこそ i-Score へ！</h1>
          <p className="text-muted-foreground">まずはあなたのチームを作成するか、管理者からの招待をお待ちください。</p>
        </div>

        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> チームを新規作成
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">チーム名</label>
                <input
                  type="text"
                  required
                  placeholder="例: 川崎中央シニア"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">あなたの役割（ロール）</label>
                <select
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer font-medium"
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value)}
                >
                  <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                  <option value={ROLES.COACH}>コーチ (Coach)</option>
                  <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                  <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> あなたは発起人として記録されます
                </p>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-4" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "チームを作成して始める"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================
  // 💡 パターンB：チームに所属している場合（通常のダッシュボード）
  // =========================================================
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">

      {/* 💡 チーム切り替えヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            現在の権限: <span className="text-primary font-bold">{currentTeam?.myRole}</span>
          </p>
        </div>

        {/* チーム切り替えドロップダウン */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted-foreground hidden sm:inline">対象チーム:</span>
          <select
            className="flex h-11 w-full sm:w-64 rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer shadow-sm"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} {team.isFounder ? '(設立)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canEdit && (
          // 💡 試合作成ページへ `teamId` をパラメータとして渡す！
          <Link href={`/matches/new?teamId=${selectedTeamId}`} className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
            <Card className="relative overflow-hidden group rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] cursor-pointer h-full">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-full"><Plus className="h-5 w-5" /></div>
                    新しい試合を記録
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">スコアブックの入力を開始します</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full rounded-xl h-12 text-base font-bold shadow-sm bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                    試合作成へ進む <ChevronRight className="ml-2 h-5 w-5" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        <Card className={`rounded-2xl border-border bg-background shadow-sm flex flex-col justify-center ${canEdit ? 'lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> 今シーズンの成績
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

      <div className="space-y-6">
        <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
          <History className="h-5 w-5 text-primary" /> 最近の試合
        </h2>

        {isLoadingMatches ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium mb-4">まだ試合の記録がありません。</p>
            {canEdit && <Button asChild variant="outline"><Link href={`/matches/new?teamId=${selectedTeamId}`}>最初の試合を記録する</Link></Button>}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <Link key={match.id} href={`/matches/score?id=${match.id}`} className="block group">
                <Card className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98] overflow-hidden relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${match.status === 'scheduled' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                  <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(match.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {/* 💡 シーズン表示を追加 */}
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold ml-2">
                            {match.season}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">進行中</span>
                    </div>
                    <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                      <div className="text-base font-extrabold w-1/3 text-center truncate">{currentTeam?.name}</div>
                      <div className="flex items-center justify-center gap-4 w-1/3">
                        <div className="text-3xl font-black">0</div>
                        <div className="text-muted-foreground font-bold">-</div>
                        <div className="text-3xl font-black">0</div>
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