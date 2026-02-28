// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, RotateCcw, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string; opponent: string; date: string;
    location: string | null; matchType: string; status: string; season: string;
}

// 💡 スタメン選手の型
interface LineupPlayer {
    batting_order: number;
    playerName: string;
    uniformNumber: string;
    position: string;
}

interface GameStateSnapshot {
    selfScore: number; guestScore: number;
    inning: number; isTop: boolean;
    balls: number; strikes: number; outs: number;
    firstBase: boolean; secondBase: boolean; thirdBase: boolean;
    myBatterIndex: number; // 💡 Undo用に現在の打順も記憶する！
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

    // 💡 スタメンと現在の打順ステート
    const [myLineup, setMyLineup] = useState<LineupPlayer[]>([]);
    const [myBatterIndex, setMyBatterIndex] = useState(0); // 0〜8 (1番〜9番)

    const [history, setHistory] = useState<GameStateSnapshot[]>([]);

    const saveStateToHistory = () => {
        setHistory(prev => [...prev, {
            selfScore, guestScore, inning, isTop,
            balls, strikes, outs,
            firstBase, secondBase, thirdBase,
            myBatterIndex // 💡 履歴に保存
        }]);
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setSelfScore(prev.selfScore); setGuestScore(prev.guestScore);
        setInning(prev.inning); setIsTop(prev.isTop);
        setBalls(prev.balls); setStrikes(prev.strikes); setOuts(prev.outs);
        setFirstBase(prev.firstBase); setSecondBase(prev.secondBase); setThirdBase(prev.thirdBase);
        setMyBatterIndex(prev.myBatterIndex); // 💡 打順も元に戻る！

        setHistory(h => h.slice(0, -1));

        if (matchId) {
            try { await fetch(`/api/matches/${matchId}/pitches/last`, { method: 'DELETE' }); }
            catch (e) { console.error(e); }
        }
    };

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
        } catch (e) { console.error(e); }
    };

    // 💡 打席完了時に次のバッターへ進める関数
    const advanceBatter = () => {
        // 自チームの攻撃（裏）の時だけ打順を進める
        if (!isTop && myLineup.length > 0) {
            setMyBatterIndex(prev => (prev + 1) % myLineup.length);
        }
    };

    const addScore = (runs: number) => {
        if (runs <= 0) return;
        if (isTop) setGuestScore(s => s + runs);
        else setSelfScore(s => s + runs);
    };

    const processOuts = (addedOuts: number) => {
        const newOuts = outs + addedOuts;
        if (newOuts >= 3) {
            setOuts(0); setBalls(0); setStrikes(0);
            setFirstBase(false); setSecondBase(false); setThirdBase(false);
            if (isTop) setIsTop(false);
            else { setIsTop(true); setInning(i => i + 1); }
        } else {
            setOuts(newOuts);
        }
    };

    const handleFinishMatch = async () => {
        if (!window.confirm("試合を終了してダッシュボードに戻りますか？")) return;
        try {
            const res = await fetch(`/api/matches/${matchId}/finish`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ myScore: selfScore, opponentScore: guestScore })
            });
            if (res.ok) router.push('/dashboard');
        } catch (e) { console.error(e); }
    };

    const handleManualOut = () => {
        saveStateToHistory();
        processOuts(1);
        advanceBatter(); // 💡 アウトになったら次へ
    };

    const handleStrike = async () => {
        saveStateToHistory();
        if (strikes === 2) {
            await recordPitchAPI('strike', 'strikeout');
            setBalls(0); setStrikes(0);
            processOuts(1);
            advanceBatter(); // 💡 三振で次へ
        } else {
            await recordPitchAPI('strike');
            setStrikes(s => s + 1);
        }
    };

    const handleWalk = async () => {
        saveStateToHistory();
        await recordPitchAPI('ball', 'walk');
        let runs = 0;
        let newFirst = true; let newSecond = secondBase; let newThird = thirdBase;

        if (firstBase) { newSecond = true; if (secondBase) { newThird = true; if (thirdBase) runs++; } }
        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0);
        advanceBatter(); // 💡 四死球で次へ
    };

    const handleBall = async () => {
        if (balls === 3) await handleWalk();
        else { saveStateToHistory(); await recordPitchAPI('ball'); setBalls(b => b + 1); }
    };

    const handleHit = async (bases: 1 | 2 | 3 | 4) => {
        saveStateToHistory();
        const hitTypes = { 1: 'single', 2: 'double', 3: 'triple', 4: 'home_run' };
        await recordPitchAPI('in_play', hitTypes[bases]);

        let runs = 0; let newFirst = false; let newSecond = false; let newThird = false;

        if (bases === 1) { if (thirdBase) runs++; if (secondBase) newThird = true; if (firstBase) newSecond = true; newFirst = true; }
        else if (bases === 2) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) newThird = true; newSecond = true; }
        else if (bases === 3) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) runs++; newThird = true; }
        else if (bases === 4) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) runs++; runs++; }

        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0);
        advanceBatter(); // 💡 ヒットで次へ
    };

    const handleInPlayOut = async (outType: 'groundout' | 'flyout' | 'double_play') => {
        saveStateToHistory();
        await recordPitchAPI('in_play', outType);
        let addedOuts = 1;
        if (outType === 'double_play') {
            if (firstBase || secondBase || thirdBase) {
                addedOuts = 2;
                if (firstBase) setFirstBase(false); else if (secondBase) setSecondBase(false); else if (thirdBase) setThirdBase(false);
            }
        }
        setBalls(0); setStrikes(0); processOuts(addedOuts);
        advanceBatter(); // 💡 ゴロ・フライで次へ
    };

    useEffect(() => {
        if (!matchId) return;
        const fetchData = async () => {
            try {
                // 試合情報を取得
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (matchRes.ok) setMatch(await matchRes.json());

                // スタメン情報を取得
                const lineupRes = await fetch(`/api/matches/${matchId}/lineup`);
                if (lineupRes.ok) {
                    const lineupData = await lineupRes.json() as LineupPlayer[];
                    setMyLineup(lineupData);
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [matchId]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>;
    if (!match) return <div className="p-8 text-center bg-background text-foreground h-screen flex flex-col items-center justify-center"><p>試合が見つかりません</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard">戻る</Link></Button></div>;

    // 現在のバッター情報
    const currentBatter = myLineup.length > 0 ? myLineup[myBatterIndex] : null;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <header className="bg-muted/30 border-b border-border p-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                        </span>
                        <h1 className="font-black text-sm tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><Settings className="h-5 w-5" /></Button>
                        <Button onClick={handleFinishMatch} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 shadow-sm">試合終了</Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4 bg-muted/20 rounded-2xl p-4 border border-border shadow-inner relative">
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Guest (表)</div>
                        <div className="text-4xl font-black text-muted-foreground/70">{guestScore}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-border">
                        <div className="text-xl font-black tracking-tighter">
                            {inning}<span className="text-[10px] ml-0.5">{isTop ? '回表' : '回裏'}</span>
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-bold text-primary uppercase">Self (裏)</div>
                        <div className="text-4xl font-black text-primary">{selfScore}</div>
                    </div>

                    {/* 💡 現在のバッター表示バー（自チームの攻撃の時だけ表示） */}
                    {!isTop && currentBatter && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                            <User className="h-3 w-3" />
                            {currentBatter.batting_order}番 {currentBatter.playerName} <span className="opacity-70 text-[10px]">({currentBatter.position})</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 relative p-4 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
                <div className="absolute top-2 left-4 space-y-3 z-10 bg-muted/30 p-3 rounded-xl backdrop-blur-sm border border-border">
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-muted-foreground">B</span>
                        {[...Array(3)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < balls ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-background")} />)}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-muted-foreground">S</span>
                        {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < strikes ? "bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-background")} />)}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <span className="w-4 text-[10px] font-black text-muted-foreground">O</span>
                        {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < outs ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-background")} />)}
                    </div>
                </div>

                <div className="relative w-48 h-48 sm:w-64 sm:h-64 rotate-45 border-4 border-border rounded-lg transition-all mt-6">
                    <div className={cn("absolute -top-3 -left-3 h-8 w-8 border-4 border-border -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", secondBase ? "bg-yellow-400 text-zinc-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-muted text-muted-foreground")}>2</div>
                    <div className={cn("absolute -bottom-3 -left-3 h-8 w-8 border-4 border-border -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", thirdBase ? "bg-yellow-400 text-zinc-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-muted text-muted-foreground")}>3</div>
                    <div className={cn("absolute -top-3 -right-3 h-8 w-8 border-4 border-border -rotate-45 flex items-center justify-center text-[10px] font-bold transition-all duration-300", firstBase ? "bg-yellow-400 text-zinc-900 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" : "bg-muted text-muted-foreground")}>1</div>
                    <div className="absolute -bottom-4 -right-4 h-10 w-10 bg-primary/20 border-4 border-primary/50 -rotate-45 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-sm animate-pulse" />
                    </div>
                </div>
            </main>

            <footer className="bg-muted/20 border-t border-border p-3 sm:p-5 pb-6 shrink-0 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleBall}><span className="text-green-500 font-black text-xl group-active:scale-125 transition-transform">B</span></Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleStrike}><span className="text-yellow-500 font-black text-xl group-active:scale-125 transition-transform">S</span></Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleManualOut}><span className="text-red-500 font-black text-xl group-active:scale-125 transition-transform">O</span></Button>
                    <Button onClick={handleUndo} disabled={history.length === 0} className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 border border-border hover:bg-muted text-foreground font-black shadow-sm disabled:opacity-40 transition-all active:scale-95">
                        <RotateCcw className="h-4 w-4 mb-0.5" />
                        <span className="text-[10px]">1球戻る</span>
                    </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={() => handleHit(1)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">単打</Button>
                    <Button onClick={() => handleHit(2)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">二塁打</Button>
                    <Button onClick={() => handleHit(3)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">三塁打</Button>
                    <Button onClick={() => handleHit(4)} variant="outline" className="h-10 sm:h-12 rounded-lg border-orange-500/50 text-orange-500 font-black hover:bg-orange-600 hover:text-white active:scale-95 text-xs sm:text-sm shadow-[0_0_10px_rgba(249,115,22,0.1)]">本塁打</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button onClick={handleWalk} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold active:scale-95 text-xs sm:text-sm">四死球</Button>
                    <Button variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold active:scale-95 text-xs sm:text-sm">バント</Button>
                    <Button variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold active:scale-95 text-xs sm:text-sm">盗塁/進塁</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleInPlayOut('groundout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/30 text-red-500 font-bold hover:bg-red-900/20 active:scale-95 text-xs sm:text-sm">ゴロアウト</Button>
                    <Button onClick={() => handleInPlayOut('flyout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/30 text-red-500 font-bold hover:bg-red-900/20 active:scale-95 text-xs sm:text-sm">フライ/直直</Button>
                    <Button onClick={() => handleInPlayOut('double_play')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/50 bg-red-950/20 text-red-500 font-black hover:bg-red-900 hover:text-white active:scale-95 text-xs sm:text-sm">併殺打(ゲッツー)</Button>
                </div>
            </footer>
        </div>
    );
}

export default function MatchScorePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>}>
            <MatchScoreContent />
        </Suspense>
    );
}