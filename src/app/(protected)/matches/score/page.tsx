// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string;
    opponent: string;
    date: string;
    location: string | null;
    matchType: string;
    status: string;
    season: string;
}

function MatchScoreContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selfScore, setSelfScore] = useState(0);
    const [guestScore, setGuestScore] = useState(0);
    const [inning, setInning] = useState(1);
    const [isTop, setIsTop] = useState(true);

    const [balls, setBalls] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [outs, setOuts] = useState(0);

    const [firstBase, setFirstBase] = useState(false);
    const [secondBase, setSecondBase] = useState(false);
    const [thirdBase, setThirdBase] = useState(false);

    const recordPitchAPI = async (pitchResult: string, atBatResult: string | null = null) => {
        if (!matchId) return;
        try {
            await fetch(`/api/matches/${matchId}/pitches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inning, isTop,
                    pitchNumber: balls + strikes + 1,
                    result: pitchResult, ballsBefore: balls, strikesBefore: strikes, atBatResult
                }),
            });
        } catch (error) {
            console.error("投球の記録に失敗しました:", error);
        }
    };

    const addScore = (runs: number) => {
        if (runs <= 0) return;
        if (isTop) setGuestScore(s => s + runs);
        else setSelfScore(s => s + runs);
    };

    // 💡 アウト処理の共通化（3アウトチェンジの判定）
    const processOuts = (addedOuts: number) => {
        const newOuts = outs + addedOuts;
        if (newOuts >= 3) {
            // 3アウトチェンジ
            setOuts(0); setBalls(0); setStrikes(0);
            setFirstBase(false); setSecondBase(false); setThirdBase(false); // ランナーリセット
            if (isTop) setIsTop(false);
            else { setIsTop(true); setInning(i => i + 1); }
        } else {
            setOuts(newOuts);
        }
    };

    // 💡 手動アウト（Oボタンを押した時）
    const handleManualOut = () => {
        processOuts(1);
    };

    const handleStrike = async () => {
        if (strikes === 2) {
            await recordPitchAPI('strike', 'strikeout');
            setBalls(0); setStrikes(0);
            processOuts(1); // 三振アウト
        } else {
            await recordPitchAPI('strike');
            setStrikes(s => s + 1);
        }
    };

    const handleWalk = async () => {
        await recordPitchAPI('ball', 'walk');
        let runs = 0;
        let newFirst = true;
        let newSecond = secondBase;
        let newThird = thirdBase;

        if (firstBase) {
            newSecond = true;
            if (secondBase) {
                newThird = true;
                if (thirdBase) runs++;
            }
        }
        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0);
    };

    const handleBall = async () => {
        if (balls === 3) await handleWalk();
        else { await recordPitchAPI('ball'); setBalls(b => b + 1); }
    };

    const handleHit = async (bases: 1 | 2 | 3 | 4) => {
        const hitTypes = { 1: 'single', 2: 'double', 3: 'triple', 4: 'home_run' };
        await recordPitchAPI('in_play', hitTypes[bases]);

        let runs = 0;
        let newFirst = false; let newSecond = false; let newThird = false;

        if (bases === 1) {
            if (thirdBase) runs++;
            if (secondBase) newThird = true;
            if (firstBase) newSecond = true;
            newFirst = true;
        } else if (bases === 2) {
            if (thirdBase) runs++;
            if (secondBase) runs++;
            if (firstBase) newThird = true;
            newSecond = true;
        } else if (bases === 3) {
            if (thirdBase) runs++;
            if (secondBase) runs++;
            if (firstBase) runs++;
            newThird = true;
        } else if (bases === 4) {
            if (thirdBase) runs++;
            if (secondBase) runs++;
            if (firstBase) runs++;
            runs++;
        }

        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0);
    };

    // 💡 新規：打ってアウトの処理（ゴロ、フライ、併殺打）
    const handleInPlayOut = async (outType: 'groundout' | 'flyout' | 'double_play') => {
        await recordPitchAPI('in_play', outType);

        let addedOuts = 1;

        if (outType === 'double_play') {
            // 併殺打：ランナーがいる場合のみ有効
            if (firstBase || secondBase || thirdBase) {
                addedOuts = 2; // 一気に2アウト！

                // 簡易的な処理：フォース状態になりやすい1塁ランナーを優先して消す
                if (firstBase) setFirstBase(false);
                else if (secondBase) setSecondBase(false);
                else if (thirdBase) setThirdBase(false);
            }
        }

        // バッターのアウト処理とカウントリセット
        setBalls(0);
        setStrikes(0);
        processOuts(addedOuts);
    };

    // 💡 試合終了処理
    const handleFinishMatch = async () => {
        // 確認ダイアログを出す
        if (!window.confirm("試合を終了してダッシュボードに戻りますか？\n（※後からでも修正可能です）")) {
            return;
        }

        try {
            const response = await fetch(`/api/matches/${matchId}/finish`, {
                method: 'PATCH',
            });

            if (response.ok) {
                // 成功したらダッシュボードへ帰還！
                router.push('/dashboard');
            } else {
                alert("試合の終了処理に失敗しました");
            }
        } catch (error) {
            console.error("終了処理エラー:", error);
            alert("通信エラーが発生しました");
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

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">読み込み中...</div>;
    if (!match) return <div className="p-8 text-center bg-slate-950 text-white h-screen flex flex-col items-center justify-center"><p>試合が見つかりません</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard">戻る</Link></Button></div>;

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
            {/* ヘッダー */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800 rounded-full" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                        </span>
                        <h1 className="font-black text-sm tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800 rounded-full hidden sm:flex">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={handleFinishMatch}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 shadow-sm transition-all active:scale-95"
                        >
                            試合終了
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4 bg-slate-950/50 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Guest (表)</div>
                        <div className="text-4xl font-black text-slate-400">{guestScore}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-white/5">
                        <div className="text-xl font-black tracking-tighter">
                            {inning}<span className="text-[10px] ml-0.5">{isTop ? '回表' : '回裏'}</span>
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Self (裏)</div>
                        <div className="text-4xl font-black text-primary">{selfScore}</div>
                    </div>
                </div>
            </header>

            {/* メインエリア：ダイヤモンド & カウント */}
            <main className="flex-1 relative p-4 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
                <div className="absolute top-2 left-4 space-y-3 z-10 bg-slate-900/50 p-3 rounded-xl backdrop-blur-sm border border-slate-800/50">
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">B</span>
                        {[...Array(3)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors", i < balls ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-slate-950/50")} />)}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">S</span>
                        {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors", i < strikes ? "bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-slate-950/50")} />)}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-slate-500">O</span>
                        {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-slate-800 transition-colors", i < outs ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-slate-950/50")} />)}
                    </div>
                </div>

                <div className="relative w-48 h-48 sm:w-64 sm:h-64 rotate-45 border-4 border-slate-800/50 rounded-lg transition-all mt-6">
                    <div className={cn("absolute -top-3 -left-3 h-8 w-8 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", secondBase ? "bg-yellow-400 text-slate-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-slate-900 text-slate-700")}>2</div>
                    <div className={cn("absolute -bottom-3 -left-3 h-8 w-8 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", thirdBase ? "bg-yellow-400 text-slate-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-slate-900 text-slate-700")}>3</div>
                    <div className={cn("absolute -top-3 -right-3 h-8 w-8 border-4 border-slate-800 -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", firstBase ? "bg-yellow-400 text-slate-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-slate-900 text-slate-700")}>1</div>
                    <div className="absolute -bottom-4 -right-4 h-10 w-10 bg-primary/20 border-4 border-primary/50 -rotate-45 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-sm animate-pulse" />
                    </div>
                </div>
            </main>

            {/* 操作エリア（4段構成に拡張！） */}
            <footer className="bg-slate-900 border-t border-slate-800 p-3 sm:p-5 pb-6 shrink-0 space-y-2">

                {/* 1段目：カウント */}
                <div className="grid grid-cols-4 gap-2">
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 border-none group" onClick={handleBall}>
                        <span className="text-green-500 font-black text-xl group-active:scale-125 transition-transform">B</span>
                    </Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 border-none group" onClick={handleStrike}>
                        <span className="text-yellow-500 font-black text-xl group-active:scale-125 transition-transform">S</span>
                    </Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 border-none group" onClick={handleManualOut}>
                        <span className="text-red-500 font-black text-xl group-active:scale-125 transition-transform">O</span>
                    </Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-primary text-primary-foreground font-black shadow-md">
                        <Check className="h-5 w-5 mb-0.5" />
                        <span className="text-[10px]">FIX</span>
                    </Button>
                </div>

                {/* 2段目：ヒット系 */}
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={() => handleHit(1)} variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/80 text-white font-bold hover:bg-blue-600 hover:border-blue-500 active:scale-95 transition-all text-xs sm:text-sm">単打</Button>
                    <Button onClick={() => handleHit(2)} variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/80 text-white font-bold hover:bg-blue-600 hover:border-blue-500 active:scale-95 transition-all text-xs sm:text-sm">二塁打</Button>
                    <Button onClick={() => handleHit(3)} variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/80 text-white font-bold hover:bg-blue-600 hover:border-blue-500 active:scale-95 transition-all text-xs sm:text-sm">三塁打</Button>
                    <Button onClick={() => handleHit(4)} variant="outline" className="h-10 sm:h-12 rounded-lg border-orange-700/50 bg-orange-900/20 text-orange-400 font-black hover:bg-orange-600 hover:text-white active:scale-95 transition-all text-xs sm:text-sm shadow-[0_0_10px_rgba(249,115,22,0.1)]">本塁打</Button>
                </div>

                {/* 3段目：その他の結果 */}
                <div className="grid grid-cols-3 gap-2">
                    <Button onClick={handleWalk} variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 transition-all text-xs sm:text-sm">四死球</Button>
                    <Button variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 transition-all text-xs sm:text-sm">バント</Button>
                    <Button variant="outline" className="h-10 sm:h-12 rounded-lg border-slate-700 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 transition-all text-xs sm:text-sm">盗塁/進塁</Button>
                </div>

                {/* 💡 4段目：アウトのバリエーション（新設！） */}
                <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleInPlayOut('groundout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/40 bg-red-950/30 text-red-400 font-bold hover:bg-red-900/50 active:scale-95 transition-all text-xs sm:text-sm">ゴロアウト</Button>
                    <Button onClick={() => handleInPlayOut('flyout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/40 bg-red-950/30 text-red-400 font-bold hover:bg-red-900/50 active:scale-95 transition-all text-xs sm:text-sm">フライ/直直</Button>
                    <Button onClick={() => handleInPlayOut('double_play')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/60 bg-red-900/40 text-red-300 font-black hover:bg-red-800 hover:text-white active:scale-95 transition-all text-xs sm:text-sm shadow-[0_0_10px_rgba(220,38,38,0.1)]">併殺打(ゲッツー)</Button>
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