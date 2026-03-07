// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, Users, Shield, Plus, ChevronRight, X } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Team {
    id: string;
    name: string;
    myRole: string;
    isFounder: boolean;
}

export default function TeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/teams');
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTeams(); }, []);

    const handleTeamClick = (teamId: string) => {
        localStorage.setItem("iScore_selectedTeamId", teamId);
        router.push('/dashboard');
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName, role: newTeamRole }),
            });
            if (res.ok) {
                const data = await res.json() as { teamId: string };
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                router.push('/dashboard');
            } else {
                alert("チームの作成に失敗しました");
            }
        } catch (e) { console.error(e); }
        finally { setIsCreating(false); }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
            <PageHeader 
                href="/dashboard" 
                icon={Shield} 
                title="マイチーム一覧" 
                subtitle="所属チームの切り替えと新規作成" 
            />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500 relative z-10">
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                        <Users className="h-6 w-6 text-primary" /> 
                        所属チーム <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                    </h2>
                    {!showCreateForm && (
                        <Button 
                            onClick={() => setShowCreateForm(true)} 
                            className="font-extrabold rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:-translate-y-0.5 active:scale-95 h-10 sm:h-12 px-5 sm:px-6"
                        >
                            <Plus className="h-5 w-5 mr-1" /> <span className="hidden sm:inline">新しく作る</span><span className="sm:hidden">新規</span>
                        </Button>
                    )}
                </div>

                {showCreateForm && (
                    <Card className="mb-8 rounded-[32px] border-border/40 bg-background/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary" />
                        <CardHeader className="pt-8 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl font-black">
                                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary"><Plus className="h-6 w-6" /></div>
                                チームを新しく作る
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all" onClick={() => setShowCreateForm(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-2 pb-8">
                            <form onSubmit={handleCreateTeam} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-extrabold text-foreground tracking-wide pl-1">チーム名</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="例: 川崎中央シニア" 
                                        className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-xs focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" 
                                        value={newTeamName} 
                                        onChange={(e) => setNewTeamName(e.target.value)} 
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-extrabold text-foreground tracking-wide pl-1">あなたの役割（ロール）</label>
                                    <Select 
                                        className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-xs focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" 
                                        value={newTeamRole} 
                                        onChange={(e) => setNewTeamRole(e.target.value)}
                                    >
                                        <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                                        <option value={ROLES.COACH}>コーチ (Coach)</option>
                                        <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                                        <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full h-14 text-base font-extrabold rounded-2xl mt-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-1 active:scale-[0.98]" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "チームを作成してダッシュボードへ"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {teams.length === 0 && !showCreateForm ? (
                    <div className="text-center py-20 bg-muted/10 rounded-[32px] border border-dashed border-border/60 mt-6 shadow-sm">
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/10">
                            <Shield className="h-10 w-10 text-primary/40" />
                        </div>
                        <p className="text-muted-foreground font-extrabold text-lg mb-6">現在所属しているチームはありません</p>
                        <Button onClick={() => setShowCreateForm(true)} className="font-extrabold rounded-full h-12 px-8 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">最初のチームを作成する</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                        {teams.map((team) => (
                            <Card
                                key={team.id}
                                onClick={() => handleTeamClick(team.id)}
                                /* 💡 hoverだけでなく、スマホ用に active クラスを追加 */
                                className="group relative overflow-hidden rounded-[28px] border-border/50 bg-background shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer"
                            >
                                {/* 💡 スマホのタップ時（group-active）にも背景の円が広がるように！ */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[120px] -mr-8 -mt-8 transition-transform duration-300 group-hover:scale-[1.3] group-hover:bg-primary/10 group-active:scale-[1.3] group-active:bg-primary/10" />
                                
                                <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                    <div className="flex justify-between items-start mb-6">
                                        {/* 💡 アイコンの背景色もタップで変わる！ */}
                                        <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-200 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                            <Shield className="h-7 w-7" />
                                        </div>
                                        {/* 💡 ロールバッジの色もタップで変わる！ */}
                                        <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-200 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm">
                                            {team.myRole}
                                        </div>
                                    </div>
                                    
                                    {/* 💡 チーム名もタップで光る！ */}
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-200 drop-shadow-sm mt-auto">
                                        {team.name}
                                    </h3>
                                    
                                    {/* 💡 矢印もタップでスッと動く！ */}
                                    <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-200">
                                        ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
