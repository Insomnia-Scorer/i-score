// src/app/(protected)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// 💡 Building2 (チームアイコン用) を追加
import { ArrowLeft, Users, ShieldAlert, Shield, Search, Trash2, User as UserIcon, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AppUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

// 💡 チーム用の型定義を追加
interface AppTeam {
    id: string;
    name: string;
    memberCount: number;
    createdAt: string;
}

export default function AdminPage() {
    // 💡 タブの状態管理（"users" か "teams" か）
    const [activeTab, setActiveTab] = useState<"users" | "teams">("users");

    const [users, setUsers] = useState<AppUser[]>([]);
    const [teams, setTeams] = useState<AppTeam[]>([]); // 💡 チーム一覧
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // ユーザー一覧の取得
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("ユーザー取得エラー:", error);
        }
    };

    // 💡 チーム一覧の取得
    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/admin/teams');
            if (res.ok) setTeams(await res.json());
        } catch (error) {
            console.error("チーム取得エラー:", error);
        }
    };

    // 初回マウント時、またはタブが切り替わった時にデータを取得
    useEffect(() => {
        setIsLoading(true);
        setSearchTerm(""); // タブを切り替えたら検索文字をリセット
        if (activeTab === "users") {
            fetchUsers().finally(() => setIsLoading(false));
        } else {
            fetchTeams().finally(() => setIsLoading(false));
        }
    }, [activeTab]);

    // ユーザーの権限変更
    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                alert("権限の更新に失敗しました");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ユーザーの削除
    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`⚠️ 本当にユーザー「${userName}」を削除しますか？\nこの操作は取り消せません。`)) return;
        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) setUsers(users.filter(u => u.id !== userId));
            else alert("ユーザーの削除に失敗しました");
        } catch (e) {
            console.error(e);
        }
    };

    // 💡 チームの削除（管理者の特権行使）
    const handleDeleteTeam = async (teamId: string, teamName: string) => {
        if (!confirm(`🚨 本当にチーム「${teamName}」を削除しますか？\n所属選手、試合、スコアなどのすべてのデータがシステムから完全に消去されます。`)) return;
        try {
            const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
            if (res.ok) setTeams(teams.filter(t => t.id !== teamId));
            else alert("チームの削除に失敗しました");
        } catch (e) {
            console.error(e);
        }
    };

    // 検索フィルター（タブに応じてフィルタリング対象を変える）
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeams = teams.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const adminCount = users.filter(u => u.role === 'admin').length;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <header className="bg-muted/30 border-b border-border p-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-black text-xl tracking-tight flex items-center gap-2 text-primary">
                            <ShieldAlert className="h-5 w-5" />
                            システム管理 (Admin)
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">全ユーザーとチームの管理</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6 mt-2">
                
                {/* 💡 タブ切り替えUI */}
                <div className="flex bg-muted/30 p-1.5 rounded-xl border border-border shadow-inner">
                    <button 
                        onClick={() => setActiveTab("users")}
                        className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "users" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        <Users className="h-4 w-4" /> ユーザー
                    </button>
                    <button 
                        onClick={() => setActiveTab("teams")}
                        className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "teams" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        <Building2 className="h-4 w-4" /> チーム
                    </button>
                </div>

                {/* サマリーカード (Usersタブの時だけ表示) */}
                {activeTab === "users" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-muted/20 border border-border rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
                            <Users className="h-6 w-6 text-muted-foreground mb-2" />
                            <div className="text-3xl font-black text-foreground">{users.length}</div>
                            <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mt-1">Total Users</div>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
                            <Shield className="h-6 w-6 text-primary mb-2" />
                            <div className="text-3xl font-black text-primary">{adminCount}</div>
                            <div className="text-xs font-bold text-primary/70 tracking-widest uppercase mt-1">Admins</div>
                        </div>
                    </div>
                )}

                {/* 検索バー */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={activeTab === "users" ? "名前やメールアドレスで検索..." : "チーム名で検索..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* リスト表示エリア */}
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : activeTab === "users" ? (
                    /* 👥 ユーザー一覧 */
                    filteredUsers.length === 0 ? (
                        <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">ユーザーが見つかりません</div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2", user.role === 'admin' ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground")}>
                                            {user.role === 'admin' ? <Shield className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-base truncate flex items-center gap-2">
                                                {user.name}
                                                {user.role === 'admin' && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded leading-none uppercase font-black">Admin</span>}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">登録: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0">
                                        <Select 
                                            value={user.role || 'user'} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="h-9 w-[120px] rounded-lg border-border bg-muted/30 text-xs font-bold cursor-pointer"
                                        >
                                            <option value="user">一般ユーザー</option>
                                            <option value="admin">システム管理者</option>
                                        </Select>
                                        <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg shrink-0" onClick={() => handleDeleteUser(user.id, user.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* 🏢 チーム一覧 */
                    filteredTeams.length === 0 ? (
                        <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">チームが見つかりません</div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {filteredTeams.map((team) => (
                                <div key={team.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border-2 border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-base truncate tracking-tight">{team.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {team.memberCount}名
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60">
                                                    設立: {new Date(team.createdAt).toLocaleDateString('ja-JP')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0">
                                        <Button size="sm" variant="outline" className="h-9 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white rounded-lg font-bold transition-colors" onClick={() => handleDeleteTeam(team.id, team.name)}>
                                            <Trash2 className="h-4 w-4 mr-1.5" /> チームを強制削除
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
