// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canEditScore, canManageTeam, isApprovedMember, ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, Loader2, Users, CheckCircle2, ClipboardList, Edit2, Trash2, Check, X } from "lucide-react";

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string | null;
  matchType: string;
  status: string;
  season: string;
  myScore: number;
  opponentScore: number;
}

interface Team {
  id: string;
  name: string;
  myRole: string;
  isFounder: boolean;
}

export default function DashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  // ユーザーのシステムロールを取得
  const userRole = (session?.user as any)?.role;
  
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

  // 💡 チーム編集・削除用の状態と処理
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");

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

  // 💡 チーム編集開始
  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
  };

  // 💡 チーム更新処理
  const handleUpdateTeam = async () => {
    if (!editTeamName.trim() || !editingTeamId) return;
    try {
      const res = await fetch(`/api/teams/${editingTeamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName })
      });
      if (res.ok) {
        setEditingTeamId(null);
        await fetchTeams(); // 最新状態を再取得
      } else {
        alert('チーム名の更新に失敗しました');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 💡 チーム削除処理
  const handleDeleteTeam = async (targetTeamId: string) => {
    if (!confirm('⚠️ 本当にこのチームを削除しますか？\n（所属選手やこれまでの試合データがすべて完全に消去されます！）')) return;
    try {
      const res = await fetch(`/api/teams/${targetTeamId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedTeamId === targetTeamId) setSelectedTeamId("");
        await fetchTeams();
      } else {
        alert('チームの削除に失敗しました');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isSessionLoading || isLoadingTeams) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // 現在選択中のチーム情報を取得
  const currentTeam = teams.find(t => t.id === selectedTeamId);
  // スコア編集権限があるか（チーム内ロールで判定）
  const canEdit = currentTeam ? canEditScore(currentTeam.myRole) : false;

  // 💡 成績の自動計算
  const completedMatches = matches.filter(match => match.status === 'completed');
  const wins = completedMatches.filter(match => match.myScore > match.opponentScore).length;
  const losses = completedMatches.filter(match => match.myScore < match.opponentScore).length;
  const draws = completedMatches.filter(match => match.myScore === match.opponentScore).length;
  const totalGames = completedMatches.length;
  const winRate = totalGames > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

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
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">あなたの役割（ロール）</label>
                <Select
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer font-medium"
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value)}
                >
                  <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                  <option value={ROLES.COACH}>コーチ (Coach)</option>
                  <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                  <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                </Select>
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
          <Select
            className="flex h-11 w-full sm:w-64 rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer shadow-sm"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} {team.isFounder ? '(設立)' : ''}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canEdit && (
          // 💡 試合作成ページへ `teamId` をパラメータとして渡す
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

        {/* 💡 チーム成績・管理カード */}
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden relative md:col-span-2">
          {/* 背景の装飾 */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

          <CardContent className="p-6 sm:p-8 relative z-10 h-full flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">

              {/* チーム情報と編集機能 */}
              <div className="space-y-2 w-full sm:w-auto">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold bg-primary/20 text-primary uppercase tracking-wider">
                  2026 Season
                </span>

                {/* 💡 編集モードと通常モードの切り替え */}
                {editingTeamId === currentTeam?.id ? (
                  <div className="flex items-center gap-2 mt-2 animate-in fade-in zoom-in duration-200">
                    <input
                      type="text"
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="bg-slate-900/50 border border-white/20 rounded-lg px-3 py-1 text-2xl sm:text-3xl font-black w-full outline-none focus:border-primary text-white"
                      autoFocus
                    />
                    <Button size="icon" className="bg-green-500 hover:bg-green-600 text-white shrink-0 rounded-lg" onClick={handleUpdateTeam}>
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="shrink-0 text-white hover:bg-white/10 rounded-lg" onClick={() => setEditingTeamId(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group mt-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{currentTeam?.name}</h2>
                    {/* 監督(Manager)や管理者のみ編集・削除ボタンを表示 */}
                    {(canManageTeam(currentTeam?.myRole) || userRole === ROLES.ADMIN) && (
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => currentTeam && startEditTeam(currentTeam)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-full" onClick={() => currentTeam && handleDeleteTeam(currentTeam.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 💡 選手名簿へのボタン（teamId を連携） */}
                <div className="pt-2">
                  <Button asChild variant="secondary" size="sm" className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Link href={`/teams/roster?id=${currentTeam?.id}`}>
                      <Users className="h-4 w-4 mr-2" />
                      選手名簿の管理
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 💡 自動計算された成績表示エリア */}
              <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto mt-4 sm:mt-0">
                <div className="text-center px-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Wins</div>
                  <div className="text-3xl font-black text-primary">{wins}</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center px-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Losses</div>
                  <div className="text-3xl font-black text-slate-300">{losses}</div>
                </div>
                {/* 引き分けが1以上ある場合のみ表示 */}
                {draws > 0 && (
                  <>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-center px-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Draws</div>
                      <div className="text-3xl font-black text-slate-400">{draws}</div>
                    </div>
                  </>
                )}
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center px-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Win %</div>
                  <div className="text-3xl font-black text-white">{winRate}<span className="text-sm ml-0.5 text-slate-400">%</span></div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の試合リスト */}
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
              <Card key={match.id} className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${match.status === 'scheduled' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(match.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold ml-2">
                          {match.season}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
                      {match.status === 'completed' ? '試合終了' : '進行中'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                    <div className="text-base font-extrabold w-1/3 text-center truncate">{currentTeam?.name}</div>
                    <div className="flex items-center justify-center gap-4 w-1/3">
                      <div className="text-3xl font-black">{match.myScore || 0}</div>
                      <div className="text-muted-foreground font-bold">-</div>
                      <div className="text-3xl font-black">{match.opponentScore || 0}</div>
                    </div>
                    <div className="text-base font-bold text-muted-foreground w-1/3 text-center truncate">{match.opponent}</div>
                  </div>

                  {/* 💡 ここにボタンエリアを配置 */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 justify-end">
                    <Button asChild variant="outline" size="sm" className="rounded-lg font-bold shadow-sm">
                      {/* 💡 teamId のパラメータを付与 */}
                      <Link href={`/matches/lineup?id=${match.id}&teamId=${currentTeam?.id}`}>
                        <ClipboardList className="h-4 w-4 mr-1.5" />
                        スタメン
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-lg font-bold bg-primary text-primary-foreground shadow-sm">
                      <Link href={`/matches/score?id=${match.id}`}>スコア入力</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
