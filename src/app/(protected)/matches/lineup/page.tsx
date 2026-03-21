// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2, Save, Users, Shield, ArrowRight, Swords, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 💡 守備位置のマスターデータ
const POSITIONS = [
    { id: "1", name: "投 (1)", short: "P" },
    { id: "2", name: "捕 (2)", short: "C" },
    { id: "3", name: "一 (3)", short: "1B" },
    { id: "4", name: "二 (4)", short: "2B" },
    { id: "5", name: "三 (5)", short: "3B" },
    { id: "6", name: "遊 (6)", short: "SS" },
    { id: "7", name: "左 (7)", short: "LF" },
    { id: "8", name: "中 (8)", short: "CF" },
    { id: "9", name: "右 (9)", short: "RF" },
    { id: "DH", name: "指 (DH)", short: "DH" },
];

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

interface LineupEntry {
    order: number;
    position: string;
    playerId: string;
    playerName: string; // 対戦相手の手入力用
}

function LineupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [roster, setRoster] = useState<Player[]>([]);

    // 💡 タブ切り替え（自チーム vs 対戦相手）
    const [activeTab, setActiveTab] = useState<"myTeam" | "opponent">("myTeam");

    // 💡 スタメンデータ（1番〜9番の初期枠を用意）
    const initialLineup = Array.from({ length: 9 }, (_, i) => ({
        order: i + 1, position: "", playerId: "", playerName: ""
    }));

    const [myLineup, setMyLineup] = useState<LineupEntry[]>(initialLineup);
    const [opponentLineup, setOpponentLineup] = useState<LineupEntry[]>(initialLineup);

    useEffect(() => {
        if (!matchId || !teamId) {
            router.push("/dashboard");
            return;
        }
        fetchRoster();
    }, [matchId, teamId]);

    const fetchRoster = async () => {
        setIsLoading(true);
        try {
            // 自チームの選手名簿を取得（ドロップダウン用）
            const res = await fetch(`/api/teams/${teamId}/players`);
            if (res.ok) {
                setRoster(await res.json());
            }
            // ※ 既存のスタメンデータがあればここで取得してセットする処理を後で追加できます
        } catch (error) {
            toast.error("名簿データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMyLineupChange = (index: number, field: keyof LineupEntry, value: string) => {
        const newLineup = [...myLineup];
        newLineup[index] = { ...newLineup[index], [field]: value };

        // 選手IDが選ばれたら、名前も自動補完する
        if (field === "playerId") {
            const player = roster.find(p => p.id === value);
            if (player) newLineup[index].playerName = player.name;
        }
        setMyLineup(newLineup);
    };

    const handleOpponentLineupChange = (index: number, field: keyof LineupEntry, value: string) => {
        const newLineup = [...opponentLineup];
        newLineup[index] = { ...newLineup[index], [field]: value };
        setOpponentLineup(newLineup);
    };

    const handleSaveAndStart = async () => {
        setIsSaving(true);
        try {
            // ※ ここでAPIにスタメンデータ（myLineup, opponentLineup）を保存する処理を追加します
            // await fetch(`/api/matches/${matchId}/lineup`, { ... })
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            // 💡 1. URLに matchId を含める
            const res = await fetch(`${apiUrl}/api/matches/${matchId}`, {
                // 💡 2. 更新なので PATCH メソッドを使う！
                method: "PATCH", 
                // 💡 3. 認証Cookieを含める
                credentials: "include", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    battingOrder: myLineup, // 入力したスタメンの配列
                }),
            });

            if (res.ok) {
                toast.success("スタメンを登録しました！試合を開始します！");
                // スコア画面へ遷移！
                router.push(`/matches/score?id=${matchId}`);
            } else {
                toast.error("スタメンの保存に失敗しました");
            }
        } catch (error) {
            toast.error("保存に失敗しました");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden">
            <main className="flex-1 px-4 sm:px-6 max-w-3xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

                {/* 1. ヘッダー部分 */}
                <div className="mb-8 flex flex-col items-start gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                        <ChevronLeft className="h-5 w-5 mr-1" /> 戻る
                    </Button>
                    <div className="flex flex-col gap-2 w-full">
                        {/* 💡 基準1: ページタイトル H1 */}
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            スタメンの登録
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground ml-1">
                            試合開始前のスターティングメンバーをセットします。
                        </p>
                    </div>
                </div>

                {/* 2. タブ切り替え（自チーム vs 対戦相手） */}
                <div className="flex bg-muted/30 p-1.5 rounded-[20px] border border-border/50 mb-6 shadow-inner relative z-10">
                    <button
                        onClick={() => setActiveTab("myTeam")}
                        className={cn("flex-1 py-3.5 text-base font-black rounded-[16px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "myTeam" ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}
                    >
                        <Shield className="h-5 w-5" /> 自チーム
                    </button>
                    <button
                        onClick={() => setActiveTab("opponent")}
                        className={cn("flex-1 py-3.5 text-base font-black rounded-[16px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "opponent" ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}
                    >
                        <Swords className="h-5 w-5" /> 対戦相手
                    </button>
                </div>

                {/* 3. スタメン入力リスト */}
                <Card className="rounded-[32px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                    <CardContent className="p-4 sm:p-8 relative z-10 space-y-3">
                        {/* 見出し行（PCなど横幅がある時用） */}
                        <div className="hidden sm:flex px-2 pb-2">
                            <div className="w-16"></div>
                            <div className="w-32 text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">守備</div>
                            <div className="flex-1 text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">選手名</div>
                        </div>

                        {(activeTab === "myTeam" ? myLineup : opponentLineup).map((entry, index) => (
                            <div key={index} className="flex flex-row items-center gap-3 sm:gap-4 bg-muted/20 p-3 sm:p-2 rounded-[20px] sm:bg-transparent sm:border-none border border-border/50">
                                {/* 打順バッジ */}
                                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg sm:text-xl shadow-md border border-primary/20">
                                    {entry.order}
                                </div>

                                <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {/* 守備位置（セレクトボックス） */}
                                    <div className="w-full sm:w-32 shrink-0">
                                        <label className="sm:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">守備</label>
                                        <select
                                            className="flex h-12 w-full appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-8 text-base font-black shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
                                            value={entry.position}
                                            onChange={(e) => activeTab === "myTeam" ? handleMyLineupChange(index, "position", e.target.value) : handleOpponentLineupChange(index, "position", e.target.value)}
                                        >
                                            <option value="" disabled>守備</option>
                                            {POSITIONS.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                        </select>
                                    </div>

                                    {/* 選手名（自チームは名簿から選択、相手は手入力可） */}
                                    <div className="flex-1">
                                        <label className="sm:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">選手名</label>
                                        {activeTab === "myTeam" ? (
                                            <select
                                                className="flex h-12 w-full appearance-none rounded-[16px] border border-primary/30 bg-primary/5 px-4 pr-8 text-base font-black shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
                                                value={entry.playerId}
                                                onChange={(e) => handleMyLineupChange(index, "playerId", e.target.value)}
                                            >
                                                <option value="" disabled>選手を選択</option>
                                                {roster.map(player => (
                                                    <option key={player.id} value={player.id}>
                                                        {player.uniformNumber} : {player.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                type="text"
                                                placeholder="相手選手名を入力"
                                                className="h-12 rounded-[16px] border-border/50 bg-background text-base font-black focus-visible:ring-primary/50 shadow-inner"
                                                value={entry.playerName}
                                                onChange={(e) => handleOpponentLineupChange(index, "playerName", e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </CardContent>
                </Card>

                {/* 4. プレイボールボタン (下部固定) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40 flex justify-center md:pl-[280px] transition-[padding]">
                    <Button
                        onClick={handleSaveAndStart}
                        disabled={isSaving}
                        className="w-full max-w-3xl h-16 rounded-[24px] text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        {isSaving ? (
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        ) : (
                            <>プレイボール！ (スコア入力へ) <ArrowRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default function LineupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LineupContent />
        </Suspense>
    );
}
