// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Settings,
    Users,
    Info,
    RotateCcw,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string;
    opponent: string;
    date: string;
    location: string | null;
    matchType: string;
    battingOrder: string;
    status: string;
}

function MatchScoreContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // カウント状態の管理
    const [balls, setBalls] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [outs, setOuts] = useState(0);
    const [inning, setInning] = useState(1);
    const [isTop, setIsTop] = useState(true);

    // 💡 新追加：野球のルール連動ロジック
    const handleOut = () => {
        if (outs === 2) {
            // 3アウトチェンジ
            setOuts(0);
            setBalls(0);
            setStrikes(0);
            if (isTop) {
                setIsTop(false); // 表 -> 裏
            } else {
                setIsTop(true); // 裏 -> 次の回の表
                setInning(i => i + 1);
            }
        } else {
            setOuts(o => o + 1);
        }
    };

    const handleStrike = () => {
        if (strikes === 2) {
            // 見逃し/空振り三振（3ストライク）
            setBalls(0);
            setStrikes(0);
            handleOut(); // アウト処理を呼び出す
        } else {
            setStrikes(s => s + 1);
        }
    };

    const handleBall = () => {
        if (balls === 3) {
            // 四球（フォアボール）
            setBalls(0);
            setStrikes(0);
            // ※将来的にはここで「1塁にランナーを進める」処理を追加します
        } else {
            setBalls(b => b + 1);
        }
    };

    useEffect(() => {
        if (!matchId) return;
        const fetchMatch = async () => {
            try {
                const response = await fetch(`/api/matches/${matchId}`);
                if (!response.ok) throw new Error("Match not found");
                const data = await response.json() as Match;
                setMatch(data);
            } catch (error) {
                console.error("Failed to fetch match:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatch();
    }, [matchId]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">読み込み中...</div>;
    }

    if (!match) {
        return (
            <div className="p-8 text-center bg-slate-950 text-white h-screen flex flex-col items-center justify-center gap-4">
                <p>試合が見つかりませんでした。</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">ダッシュボードへ戻る</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">

            {/* 1. ヘッダー（スコアボード） */}
            <header className="bg-slate-900 border-b border-slate-800 p-4">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" className="text-slate-400" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            {match.matchType === 'practice' ? 'Practice Match' : 'Official Game'}
                        </span>
                        <h1 className="font-black text-sm tracking-tight flex items-center gap-2">
                            VS {match.opponent}
                        </h1>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>

                {/* スコア表示エリア */}
                <div className="grid grid-cols-3 items-center gap-4 bg-slate-950/50 rounded-2xl p-4 border border-white/5">
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Self</div>
                        <div className="text-4xl font-black text-primary">0</div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-white/5">
                        <div className="text-xl font-black tracking-tighter">
                            {inning}<span className="text-[10px] ml-0.5">{isTop ? '回表' : '回裏'}</span>
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Guest</div>
                        <div className="text-4xl font-black text-slate-400">0</div>
                    </div>
                </div>
            </header>

            {/* 2. メインエリア：ダイヤモンド & カウント */}
            <main className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-hidden">

                {/* BSO カウント */}
                <div className="absolute top-6 left-6 space-y-3">
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">B</span>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors duration-300", i < balls ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-transparent")} />
                        ))}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">S</span>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors duration-300", i < strikes ? "bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-transparent")} />
                        ))}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">O</span>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors duration-300", i < outs ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-transparent")} />
                        ))}
                    </div>
                </div>

                {/* ダイヤモンド表示 */}
                <div className="relative w-64 h-64 rotate-45 border-4 border-slate-800/50 rounded-lg scale-90 sm:scale-100">
                    {/* ベース */}
                    <div className="absolute -top-3 -left-3 h-8 w-8 bg-slate-900 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold text-slate-700">2</div>
                    <div className="absolute -bottom-3 -left-3 h-8 w-8 bg-slate-900 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold text-slate-700">3</div>
                    <div className="absolute -top-3 -right-3 h-8 w-8 bg-slate-900 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold text-slate-700">1</div>

                    {/* ホームベース */}
                    <div className="absolute -bottom-4 -right-4 h-10 w-10 bg-primary/20 border-4 border-primary/50 -rotate-45 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-sm animate-pulse" />
                    </div>

                    {/* ピッチャーズプレート */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-slate-800" />
                </div>

                {/* 現在の打者情報 */}
                <div className="absolute bottom-6 left-0 right-0 px-6">
                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-sm">3</div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Current Batter</div>
                                <div className="font-bold">山田 太郎</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Avg</div>
                            <div className="font-black text-primary">.324</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 3. 操作エリア：アクションボタン */}
            <footer className="bg-slate-900 border-t border-slate-800 p-6 pb-10">
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {/* 💡 ボタンの onClick を、新しく作った関数に置き換え */}
                    <Button
                        className="flex flex-col h-20 rounded-2xl bg-slate-800 hover:bg-slate-700 border-none group"
                        onClick={handleBall}
                    >
                        <span className="text-green-500 font-black text-xl group-active:scale-125 transition-transform">B</span>
                        <span className="text-[10px] font-bold text-slate-400">BALL</span>
                    </Button>
                    <Button
                        className="flex flex-col h-20 rounded-2xl bg-slate-800 hover:bg-slate-700 border-none group"
                        onClick={handleStrike}
                    >
                        <span className="text-yellow-500 font-black text-xl group-active:scale-125 transition-transform">S</span>
                        <span className="text-[10px] font-bold text-slate-400">STRIKE</span>
                    </Button>
                    <Button
                        className="flex flex-col h-20 rounded-2xl bg-slate-800 hover:bg-slate-700 border-none group"
                        onClick={handleOut}
                    >
                        <span className="text-red-500 font-black text-xl group-active:scale-125 transition-transform">O</span>
                        <span className="text-[10px] font-bold text-slate-400">OUT</span>
                    </Button>
                    <Button className="flex flex-col h-20 rounded-2xl bg-primary text-primary-foreground font-black shadow-[0_4px_20px_rgba(var(--primary),0.3)]">
                        <Check className="h-6 w-6 mb-1" />
                        <span className="text-[10px]">FIX</span>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-14 rounded-xl border-slate-700 bg-slate-800 text-white font-bold hover:bg-slate-700">
                        ヒット
                    </Button>
                    <Button variant="outline" className="h-14 rounded-xl border-slate-700 bg-slate-800 text-white font-bold hover:bg-slate-700">
                        バント
                    </Button>
                    <Button variant="outline" className="h-14 rounded-xl border-slate-700 bg-slate-800 text-white font-bold hover:bg-slate-700">
                        四球
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export default function MatchScorePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950 text-white">読み込み中...</div>}>
            <MatchScoreContent />
        </Suspense>
    );
}
