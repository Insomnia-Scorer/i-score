// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Users, Shield, Plus, ChevronRight, X, Building2, ChevronLeft } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Organization {
    id: string;
    name: string;
    myRole: string;
}

interface Team {
    id: string;
    name: string;
    organizationId: string | null;
}

export default function TeamsPage() {
    const router = useRouter();

    // 💡 画面の状態（クラブ一覧 or チーム一覧）
    const [view, setView] = useState<'orgs' | 'teams'>('orgs');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    // データState
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    // クラブ（組織）作成State
    const [showOrgCreate, setShowOrgCreate] = useState(false);
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");

    // チーム作成State
    const [showTeamCreate, setShowTeamCreate] = useState(false);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

    // 💡 1. 所属クラブ（組織）を取得
    const fetchOrgs = async () => {
        setIsLoadingOrgs(true);
        try {
            const res = await fetch('/api/organizations');
            if (res.ok) setOrgs(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingOrgs(false); }
    };

    // 💡 2. 選択したクラブの所属チームを取得
    const fetchTeams = async (orgId: string) => {
        setIsLoadingTeams(true);
        try {
            const res = await fetch(`/api/organizations/${orgId}/teams`);
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingTeams(false); }
    };

    useEffect(() => { fetchOrgs(); }, []);

    // アクション：クラブを選択してチーム一覧へ進む
    const handleSelectOrg = (org: Organization) => {
        setSelectedOrg(org);
        setView('teams');
        setShowTeamCreate(false);
        fetchTeams(org.id);
    };

    // アクション：クラブ一覧へ戻る
    const handleBackToOrgs = () => {
        setView('orgs');
        setSelectedOrg(null);
        setShowOrgCreate(false);
    };

    // アクション：チームを選択してダッシュボードへ飛ぶ
    const handleTeamClick = (teamId: string) => {
        localStorage.setItem("iScore_selectedTeamId", teamId);
        // ※組織IDも持たせておくと今後のダッシュボード改修で便利です
        if (selectedOrg) localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
        router.push('/dashboard');
    };

    // API：クラブを作成
    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setIsCreatingOrg(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName }),
            });
            if (res.ok) {
                toast.success("クラブを作成しました！");
                setNewOrgName("");
                setShowOrgCreate(false);
                fetchOrgs();
            } else {
                toast.error("クラブの作成に失敗しました");
            }
        } catch (e) { console.error(e); }
        finally { setIsCreatingOrg(false); }
    };

    // API：チームを作成（選択中のクラブにぶら下げる）
    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim() || !selectedOrg) return;
        setIsCreatingTeam(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTeamName,
                    role: newTeamRole,
                    organizationId: selectedOrg.id
                }),
            });
            if (res.ok) {
                const data = await res.json() as { teamId: string };
                toast.success("チームを作成しました！");
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
                router.push('/dashboard');
            } else {
                toast.error("チームの作成に失敗しました");
            }
        } catch (e) { console.error(e); }
        finally { setIsCreatingTeam(false); }
    };

    if (isLoadingOrgs && view === 'orgs') {
        return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
            <PageHeader
                href="/dashboard"
                icon={Building2}
                title="クラブ・チーム選択"
                subtitle="所属するクラブとチームの管理"
            />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    💡 View 1: クラブ（組織）一覧画面
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {view === 'orgs' && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                                <Building2 className="h-6 w-6 text-blue-500" />
                                所属クラブ <span className="text-muted-foreground/50 text-base sm:text-lg">({orgs.length})</span>
                            </h2>
                            {!showOrgCreate && (
                                <Button onClick={() => setShowOrgCreate(true)} className="font-extrabold rounded-full shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:-translate-y-0.5 active:scale-95 h-10 sm:h-12 px-5 sm:px-6">
                                    <Plus className="h-5 w-5 mr-1" /> <span className="hidden sm:inline">新しく作る</span><span className="sm:hidden">新規</span>
                                </Button>
                            )}
                        </div>

                        {showOrgCreate && (
                            <Card className="mb-8 rounded-[32px] border-blue-500/30 bg-blue-500/5 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
                                <CardHeader className="pt-8 pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                                        <div className="p-2.5 bg-blue-500/20 rounded-2xl text-blue-600"><Building2 className="h-6 w-6" /></div>
                                        クラブを新しく作る
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-blue-500/10 text-muted-foreground transition-all" onClick={() => setShowOrgCreate(false)}>
                                        <X className="h-6 w-6" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-2 pb-8">
                                    <form onSubmit={handleCreateOrg} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-extrabold text-foreground tracking-wide pl-1">クラブ（組織）名</label>
                                            {/* 💡 究極化した Input を利用！ */}
                                            <Input required placeholder="例: 川崎中央シニア" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} autoFocus />
                                        </div>
                                        <Button type="submit" className="w-full h-14 text-base font-extrabold rounded-2xl mt-8 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:-translate-y-1 active:scale-[0.98]" disabled={isCreatingOrg}>
                                            {isCreatingOrg ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "クラブを作成する"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {orgs.length === 0 && !showOrgCreate ? (
                            <div className="text-center py-20 bg-muted/10 rounded-[32px] border border-dashed border-border/60 mt-6 shadow-sm">
                                <div className="h-20 w-20 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-500/10">
                                    <Building2 className="h-10 w-10 text-blue-500/40" />
                                </div>
                                <p className="text-muted-foreground font-extrabold text-lg mb-6">所属しているクラブがありません</p>
                                <Button onClick={() => setShowOrgCreate(true)} className="font-extrabold rounded-full h-12 px-8 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 transition-all">最初のクラブを作成する</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                                {orgs.map((org) => (
                                    <Card
                                        key={org.id}
                                        onClick={() => handleSelectOrg(org)}
                                        className="group relative overflow-hidden rounded-[28px] border-border/50 bg-background shadow-sm transition-all duration-200 hover:shadow-lg hover:border-blue-500/40 active:border-blue-500/40 active:scale-[0.96] cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[120px] -mr-8 -mt-8 transition-transform duration-300 group-hover:scale-[1.3] group-hover:bg-blue-500/10 group-active:scale-[1.3] group-active:bg-blue-500/10" />

                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 group-active:bg-blue-500/10 group-active:text-blue-600 transition-colors duration-200 shadow-sm border border-border/50 group-hover:border-blue-500/20 group-active:border-blue-500/20">
                                                    <Building2 className="h-7 w-7" />
                                                </div>
                                                <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-blue-500/10 group-hover:text-blue-600 group-active:bg-blue-500/10 group-active:text-blue-600 transition-colors duration-200 border border-border/50 group-hover:border-blue-500/20 group-active:border-blue-500/20 shadow-sm">
                                                    {org.myRole}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-blue-600 group-active:text-blue-600 transition-colors duration-200 drop-shadow-sm mt-auto">
                                                {org.name}
                                            </h3>

                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-blue-600/80 group-active:text-blue-600/80 transition-colors duration-200">
                                                チーム一覧を開く <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    💡 View 2: 選択したクラブ内の「チーム」一覧画面
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {view === 'teams' && selectedOrg && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* 戻るボタンとクラブ名 */}
                        <div className="mb-6 flex flex-col items-start gap-4">
                            <Button variant="ghost" onClick={handleBackToOrgs} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold">
                                <ChevronLeft className="h-5 w-5 mr-1" /> クラブ一覧へ戻る
                            </Button>

                            <div className="flex items-center justify-between w-full pl-2">
                                <div>
                                    <div className="text-xs font-black text-blue-600 tracking-wider uppercase mb-1">{selectedOrg.name}</div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                                        <Shield className="h-6 w-6 text-primary" />
                                        所属チーム <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                                    </h2>
                                </div>
                                {!showTeamCreate && (
                                    <Button onClick={() => setShowTeamCreate(true)} className="font-extrabold rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:-translate-y-0.5 active:scale-95 h-10 sm:h-12 px-5 sm:px-6">
                                        <Plus className="h-5 w-5 mr-1" /> <span className="hidden sm:inline">チーム追加</span><span className="sm:hidden">追加</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {showTeamCreate && (
                            <Card className="mb-8 rounded-[32px] border-border/40 bg-background/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary" />
                                <CardHeader className="pt-8 pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary"><Shield className="h-6 w-6" /></div>
                                        チームを新しく追加
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all" onClick={() => setShowTeamCreate(false)}>
                                        <X className="h-6 w-6" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-2 pb-8">
                                    <form onSubmit={handleCreateTeam} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-extrabold text-foreground tracking-wide pl-1">チーム名</label>
                                            {/* 💡 究極化した Input を利用！ */}
                                            <Input required placeholder="例: 1軍 / ジュニア" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} autoFocus />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-extrabold text-foreground tracking-wide pl-1">あなたの役割（ロール）</label>
                                            {/* 💡 究極化した Select を利用！ */}
                                            <Select value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value)}>
                                                <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                                                <option value={ROLES.COACH}>コーチ (Coach)</option>
                                                <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                                                <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                                            </Select>
                                        </div>
                                        <Button type="submit" className="w-full h-14 text-base font-extrabold rounded-2xl mt-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-1 active:scale-[0.98]" disabled={isCreatingTeam}>
                                            {isCreatingTeam ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "チームを追加してダッシュボードへ"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {isLoadingTeams ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                        ) : teams.length === 0 && !showTeamCreate ? (
                            <div className="text-center py-20 bg-muted/10 rounded-[32px] border border-dashed border-border/60 mt-6 shadow-sm">
                                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/10">
                                    <Shield className="h-10 w-10 text-primary/40" />
                                </div>
                                <p className="text-muted-foreground font-extrabold text-lg mb-6">このクラブにはまだチームがありません</p>
                                <Button onClick={() => setShowTeamCreate(true)} className="font-extrabold rounded-full h-12 px-8 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">最初のチームを追加する</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                                {teams.map((team) => (
                                    <Card
                                        key={team.id}
                                        onClick={() => handleTeamClick(team.id)}
                                        className="group relative overflow-hidden rounded-[28px] border-border/50 bg-background shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[120px] -mr-8 -mt-8 transition-transform duration-300 group-hover:scale-[1.3] group-hover:bg-primary/10 group-active:scale-[1.3] group-active:bg-primary/10" />

                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-200 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                                    <Shield className="h-7 w-7" />
                                                </div>
                                                <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-200 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm">
                                                    TEAM
                                                </div>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-200 drop-shadow-sm mt-auto">
                                                {team.name}
                                            </h3>

                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-200">
                                                ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}