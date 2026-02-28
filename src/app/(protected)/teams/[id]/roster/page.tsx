// src/app/(protected)/teams/[id]/roster/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

export default function TeamRosterPage() {
    const params = useParams();
    const teamId = params.id as string;

    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // フォームの入力状態
    const [newNumber, setNewNumber] = useState("");
    const [newName, setNewName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 選手の取得処理
    const fetchPlayers = async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}/players`);
            if (res.ok) {
                const data = await res.json() as Player[];
                setPlayers(data);
            }
        } catch (error) {
            console.error("選手の取得に失敗しました:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (teamId) fetchPlayers();
    }, [teamId]);

    // 選手の登録処理
    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNumber || !newName) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/teams/${teamId}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uniformNumber: newNumber, name: newName }),
            });

            if (res.ok) {
                setNewNumber(""); // 入力欄をクリア
                setNewName("");
                fetchPlayers(); // リストを再取得して画面を更新
            } else {
                alert("選手の登録に失敗しました");
            }
        } catch (error) {
            console.error("登録エラー:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            {/* ヘッダー部分 */}
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

                {/* 新規登録フォーム */}
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
                                className="w-full bg-background border border-border rounded-xl px-3 py-3 text-center text-lg font-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-normal placeholder:text-sm"
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
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl px-6 h-auto shadow-md transition-all active:scale-95"
                            >
                                追加
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 登録済み選手リスト */}
                <section>
                    {players.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                            <Users className="h-10 w-10 mx-auto opacity-20 mb-3" />
                            <p className="text-sm font-medium">まだ選手が登録されていません</p>
                            <p className="text-xs mt-1 opacity-70">上のフォームから背番号と名前を追加してください</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-4 bg-background border border-border rounded-xl p-3 shadow-sm hover:border-primary/50 transition-colors group"
                                >
                                    {/* ユニフォーム風の背番号アイコン */}
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                                        <span className="text-lg font-black text-primary group-hover:text-primary-foreground transition-colors">
                                            {player.uniformNumber}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base truncate">{player.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}