// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canEditScore } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, MapPin, Loader2, Building2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  role: string;
}

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string | null;
  matchType: string;
  status: string;
}

export default function DashboardPage() {
  // 💡 チーム管理用の状態を追加
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // チーム新規作成用の状態
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // 1. 自分が所属しているチーム一覧を取得
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/me/teams');
        if (response.ok) {
          const data = await response.json() as Team[];
          setTeams(data);
          // チームがあれば、自動的に一番最初のチームを選択状態にする
          if (data.length > 0) {
            setSelectedTeamId(data[0].id);
          }
        }
      } catch (error) {
        console.error("チーム取得エラー:", error);
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  // 2. 選択されたチームが切り替わったら、そのチームの試合を取得
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchMatches = async () => {
      setIsLoadingMatches(true);
      try {
        const response = await fetch(`/api/teams/${selectedTeamId}/matches`);
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

    setIsCreatingTeam(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (response.ok) {
        const result = await response.json() as { teamId: string };
        // 新しいチームをリストの先頭に追加し、選択状態にする
        const newTeam: Team = {
          id: result.teamId,
          name: newTeamName,
          role: "manager", // 💡 作成した人は自動的に監督（Manager）になる！
        };
        setTeams([newTeam, ...teams]);
        setSelectedTeamId(newTeam.id);
        setNewTeamName("");
      }
    } catch (error) {
      console.error("チーム作成エラー:", error);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  if (isLoadingTeams) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // ===============================================================
  // 💡 チームに1つも所属していない場合（初回ログイン時の画面）
  // ===============================================================
  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 flex flex-col items-center text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">チームを作成しましょう</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          まずは管理するチームを作成してください。<br />作成すると、あなたがチームの「監督（管理者）」となり、試合の作成やスコアの記録ができるようになります。
        </p>

        <Card className="w-full shadow-md border-primary/20">
          <CardContent className="p-6">
            <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="例：川崎中央シニア レギュラー"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                required
              />
              <Button type="submit" size="lg" className="rounded-xl h-12 font-bold" disabled={isCreatingTeam || !newTeamName.trim()}>
                {isCreatingTeam ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "チームを作成"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===============================================================
  // 💡 チームに所属している場合の通常のダッシュボード
  // ===============================================================

  // 現在選択されているチームの情報と権限を取得
  const currentTeam = teams.find(t => t.id === selectedTeamId);
  const userRole = currentTeam?.role;
  const canEdit = canEditScore(userRole);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">

      {/* 💡 ヘッダー＆チーム切り替えドロップダウン */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">ダッシュボード</h1>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            現在の権限: <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{userRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <select
            value={selectedTeamId || ""}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-background border border-input text-base font-bold rounded-xl focus:ring-primary focus:border-primary block w-full sm:w-64 p-2.5 shadow-sm cursor-pointer"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canEdit && (
          // 💡 リンク先に選択中の teamId を渡してあげる
          <Link href={`/matches/new?teamId=${selectedTeamId}`} className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
            <Card className="relative overflow-hidden group rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] cursor-pointer h-full">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-full"><Plus className="h-5 w-5" /></div>
                    新しい試合を記録
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">選択中のチームの試合を作成します</CardDescription>
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
              <Trophy className="h-4 w-4 text-yellow-500" /> {currentTeam?.name} の成績
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

      {/* 試合一覧 */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
          <History className="h-5 w-5 text-primary" /> {currentTeam?.name} の試合一覧
        </h2>

        {isLoadingMatches ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium mb-4">まだこのチームの試合記録がありません。</p>
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