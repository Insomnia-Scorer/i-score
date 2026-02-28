// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Save } from "lucide-react";

const POSITIONS = [
    { value: "1", label: "1 (投)" }, { value: "2", label: "2 (捕)" },
    { value: "3", label: "3 (一)" }, { value: "4", label: "4 (二)" },
    { value: "5", label: "5 (三)" }, { value: "6", label: "6 (遊)" },
    { value: "7", label: "7 (左)" }, { value: "8", label: "8 (中)" },
    { value: "9", label: "9 (右)" }, { value: "DH", label: "DH (指)" },
];

interface Player { id: string; name: string; uniformNumber: string; }
interface LineupEntry { battingOrder: number; playerId: string; position: string; }

function LineupContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([]);
    const [lineup, setLineup] = useState<LineupEntry[]>(
        Array.from({ length: 9 }, (_, i) => ({ battingOrder: i + 1, playerId: "", position: "" }))
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!matchId || !teamId) return;
        const fetchPlayers = async () => {
            try {
                const res = await fetch(`/api/teams/${teamId}/players`);
                if (res.ok) setPlayers(await res.json());
            } catch (error) { console.error(error); }
        };
        const fetchLineup = async () => {
            try {
                const res = await fetch(`/api/matches/${matchId}/lineup`);
                if (res.ok) {
                    const data = (await res.json()) as any[];
                    if (data.length > 0) {
                        const formatted = data.map(d => ({ battingOrder: d.batting_order, playerId: d.player_id, position: d.position }));
                        setLineup(prev => prev.map(p => formatted.find(f => f.battingOrder === p.battingOrder) || p));
                    }
                }
            } catch (error) { console.error(error); }
        };
        fetchPlayers();
        fetchLineup();
    }, [matchId, teamId]);

    const handleLineupChange = (order: number, field: 'playerId' | 'position', value: string) => {
        setLineup(prev => prev.map(entry => entry.battingOrder === order ? { ...entry, [field]: value } : entry));
    };

    const handleSave = async () => {
        if (!matchId) return;
        const validLineup = lineup.filter(entry => entry.playerId !== "");
        setIsSaving(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/lineup`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validLineup),
            });
            if (res.ok) {
                alert("スタメンを保存しました！");
                router.push(`/matches/score?id=${matchId}`);
            }
        } catch (error) { console.error(error); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <header className="bg-muted/30 border-b border-border p-4 sticky top-0 z-10 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <h1 className="font-black text-xl tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" /> スタメン登録
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground font-bold rounded-xl px-4 flex items-center gap-2">
                    <Save className="h-4 w-4" />{isSaving ? "保存中..." : "保存"}
                </Button>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-3 mt-4">
                {lineup.map((entry) => (
                    <div key={entry.battingOrder} className="flex items-center gap-3 bg-muted/10 border border-border rounded-xl p-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
                            <span className="text-lg font-black text-primary">{entry.battingOrder}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-2">
                            <div className="col-span-3">
                                <Select value={entry.playerId} onChange={(e) => handleLineupChange(entry.battingOrder, 'playerId', e.target.value)}>
                                    <option value="" disabled hidden>選手を選択...</option>
                                    {players.map(p => <option key={p.id} value={p.id} className="bg-background">背番号{p.uniformNumber} - {p.name}</option>)}
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Select value={entry.position} onChange={(e) => handleLineupChange(entry.battingOrder, 'position', e.target.value)}>
                                    <option value="" disabled hidden>守備...</option>
                                    {POSITIONS.map(pos => <option key={pos.value} value={pos.value} className="bg-background">{pos.label}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

// 💡 こちらも Suspense でラップ
export default function MatchLineupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>}>
            <LineupContent />
        </Suspense>
    );
}