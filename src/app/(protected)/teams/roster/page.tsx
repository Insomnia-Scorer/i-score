// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Users, Edit2, Trash2, Check, X } from "lucide-react"; // 💡 アイコンを追加

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

function RosterContent() {
    const searchParams = useSearchParams();
    const teamId = searchParams.get("id");

    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newNumber, setNewNumber] = useState("");
    const [newName, setNewName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 💡 編集用の状態管理を追加
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editNumber, setEditNumber] = useState("");
    const [editName, setEditName] = useState("");

    const fetchPlayers = async () => {
        if (!teamId) return;
        try {
            const res = await fetch(`/api/teams/${teamId}/players`);
            if (res.ok) {
                const data = (await res.json()) as Player[];
                setPlayers(data);
            }
        } catch (error) {
            console.error("選手の取得に失敗しました:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, [teamId]);

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNumber || !newName || !teamId) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/teams/${teamId}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uniformNumber: newNumber, name: newName }),
            });

            if (res.ok) {
                setNewNumber("");
                setNewName("");
                fetchPlayers();
            } else {
                alert("選手の登録に失敗しました");
            }
        } catch (error) {
            console.error("登録エラー:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 💡 編集モード開始
    const startEdit = (player: Player) => {
        setEditingPlayerId(player.id);
        setEditNumber(player.uniformNumber);
        setEditName(player.name);
    };

    // 💡 編集キャンセル
    const cancelEdit = () => {
        setEditingPlayerId(null);
        setEditNumber("");
        setEditName("");
    };

    // 💡 選手情報の更新
    const handleUpdatePlayer = async (playerId: string) => {
        if (!editNumber || !editName || !teamId) return;

        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uniformNumber: editNumber, name: editName }),
            });

            if (res.ok) {
                setEditingPlayerId(null);
                fetchPlayers();
            } else {
                alert("選手の更新に失敗しました");
            }
        } catch (error) {
            console.error("更新エラー:", error);
        }
    };

    // 💡 選手情報の削除
    const handleDeletePlayer = async (playerId: string) => {
        if (!confirm("本当にこの選手を削除しますか？\n（※すでに試合に出場している場合は削除しないことを推奨します）")) return;
        if (!teamId) return;

        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchPlayers();
            } else {
                alert("選手の削除に失敗しました");
            }
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <header className="bg-muted/30 border-b border-border p-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-black text-xl tracking-tight flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            選手名簿 (Roster)
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">登録人数: {players.length}名</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-8 mt-4">
                <section className="bg-muted/20 border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <UserPlus className="h-4 w-4" />
                        Add New Player
                    </h2>
                    <form onSubmit={handleAddPlayer} className="flex gap-3">
                        <div className="w-20 shrink-0">
                            <input
                                type="number"
                                placeholder="背番号"
                                value={newNumber}
                                onChange={(e) => setNewNumber(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-3 text-center text-lg font-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                placeholder="選手名 (例: 山田 太郎)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-bold rounded-xl px-6 h-auto shadow-sm">
                                追加
                            </Button>
                        </div>
                    </form>
                </section>

                <section>
                    {players.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                            <Users className="h-10 w-10 mx-auto opacity-20 mb-3" />
                            <p className="text-sm font-medium">まだ選手が登録されていません</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {players.map((player) => (
                                <div key={player.id} className="flex items-center gap-4 bg-background border border-border rounded-xl p-3 shadow-sm hover:border-primary/50 transition-colors group">
                                    {/* 💡 編集モードと通常モードの切り替え */}
                                    {editingPlayerId === player.id ? (
                                        <div className="flex w-full items-center gap-2 animate-in fade-in zoom-in duration-200">
                                            <input
                                                type="number"
                                                value={editNumber}
                                                onChange={(e) => setEditNumber(e.target.value)}
                                                className="w-16 h-10 bg-background border border-primary/50 rounded-lg px-2 text-center text-base font-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                autoFocus
                                            />
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 h-10 bg-background border border-primary/50 rounded-lg px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <div className="flex gap-1 shrink-0">
                                                <Button size="icon-sm" className="h-9 w-9 bg-green-500 hover:bg-green-600 text-white rounded-lg" onClick={() => handleUpdatePlayer(player.id)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-lg" onClick={cancelEdit}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                <span className="text-lg font-black text-primary group-hover:text-primary-foreground">{player.uniformNumber}</span>
                                            </div>
                                            <h3 className="font-bold text-base truncate flex-1">{player.name}</h3>

                                            {/* 💡 編集・削除ボタン (スマホでは常に薄く表示、PCではホバー時表示) */}
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg" onClick={() => startEdit(player)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDeletePlayer(player.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default function TeamRosterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>}>
            <RosterContent />
        </Suspense>
    );
}