// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// 💡 Activity(ピッチャー用) と ChevronRight(Next用) を追加
import { ArrowLeft, Settings, RotateCcw, User, Maximize, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string; opponent: string; date: string;
    location: string | null; matchType: string; status: string; season: string;
}

interface LineupPlayer {
    batting_order: number; playerName: string; uniformNumber: string; position: string;
}

interface GameStateSnapshot {
    selfScore: number; guestScore: number;
    inning: number; isTop: boolean;
    balls: number; strikes: number; outs: number;
    firstBase: boolean; secondBase: boolean; thirdBase: boolean;
    myBatterIndex: number;
    selfInningScores: number[];
    guestInningScores: number[];
    selfPitchCount: number;  // 💡 Undo用に投球数も記憶
    guestPitchCount: number; // 💡 Undo用に投球数も記憶
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

    const [guestInningScores, setGuestInningScores] = useState<number[]>([0, ...Array(8).fill(null)]);
    const [selfInningScores, setSelfInningScores] = useState<number[]>(Array(9).fill(null));

    // 💡 新機能：ピッチャーの投球数カウンター
    const [selfPitchCount, setSelfPitchCount] = useState(0);
    const [guestPitchCount, setGuestPitchCount] = useState(0);

    const [balls, setBalls] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [outs, setOuts] = useState(0);

    const [firstBase, setFirstBase] = useState(false);
    const [secondBase, setSecondBase] = useState(false);
    const [thirdBase, setThirdBase] = useState(false);

    const [myLineup, setMyLineup] = useState<LineupPlayer[]>([]);
    const [myBatterIndex, setMyBatterIndex] = useState(0);

    const [pitchX, setPitchX] = useState<number | null>(null);
    const [pitchY, setPitchY] = useState<number | null>(null);

    const [history, setHistory] = useState<GameStateSnapshot[]>([]);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log("フルスクリーンにできませんでした", err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const saveStateToHistory = () => {
        setHistory(prev => [...prev, {
            selfScore, guestScore, inning, isTop,
            balls, strikes, outs,
            firstBase, secondBase, thirdBase, myBatterIndex,
            selfInningScores: [...selfInningScores],
            guestInningScores: [...guestInningScores],
            selfPitchCount, guestPitchCount // 💡 保存
        }]);
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setSelfScore(prev.selfScore); setGuestScore(prev.guestScore);
        setInning(prev.inning); setIsTop(prev.isTop);
        setBalls(prev.balls); setStrikes(prev.strikes); setOuts(prev.outs);
        setFirstBase(prev.firstBase); setSecondBase(prev.secondBase); setThirdBase(prev.thirdBase);
        setMyBatterIndex(prev.myBatterIndex);
        setSelfInningScores(prev.selfInningScores);
        setGuestInningScores(prev.guestInningScores);
        setSelfPitchCount(prev.selfPitchCount); // 💡 復元
        setGuestPitchCount(prev.guestPitchCount); // 💡 復元
        setPitchX(null); setPitchY(null);

        setHistory(h => h.slice(0, -1));

        if (matchId) {
            try { await fetch(`/api/matches/${matchId}/pitches/last`, { method: 'DELETE' }); }
            catch (e) { console.error(e); }
        }
    };

    const recordPitchAPI = async (pitchResult: string, atBatResult: string | null = null) => {
        if (!matchId) return;
        try {
            // 💡 投球されるたびにカウントを＋1する
            if (isTop) setSelfPitchCount(prev => prev + 1); // 守備時なら自分のピッチャー
            else setGuestPitchCount(prev => prev + 1);      // 攻撃時なら相手のピッチャー

            await fetch(`/api/matches/${matchId}/pitches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inning, isTop,
                    pitchNumber: balls + strikes + 1,
                    result: pitchResult, ballsBefore: balls, strikesBefore: strikes, atBatResult,
                    zoneX: pitchX, zoneY: pitchY
                }),
            });
        } catch (e) { console.error(e); }
        setPitchX(null);
        setPitchY(null);
    };

    const advanceBatter = () => {
        if (!isTop && myLineup.length > 0) {
            setMyBatterIndex(prev => (prev + 1) % myLineup.length);
        }
    };

    const addScore = (runs: number) => {
        if (runs <= 0) return;
        if (isTop) {
            setGuestScore(s => s + runs);
            setGuestInningScores(prev => {
                const newScores = [...prev];
                newScores[inning - 1] = (newScores[inning - 1] || 0) + runs;
                return newScores;
            });
        } else {
            setSelfScore(s => s + runs);
            setSelfInningScores(prev => {
                const newScores = [...prev];
                newScores[inning - 1] = (newScores[inning - 1] || 0) + runs;
                return newScores;
            });
        }
    };

    const processOuts = (addedOuts: number) => {
        const newOuts = outs + addedOuts;
        if (newOuts >= 3) {
            setOuts(0); setBalls(0); setStrikes(0);
            setFirstBase(false); setSecondBase(false); setThirdBase(false);
            if (isTop) {
                setIsTop(false);
                setSelfInningScores(prev => {
                    const newScores = [...prev];
                    newScores[inning - 1] = 0;
                    return newScores;
                });
            } else {
                setIsTop(true);
                setInning(i => {
                    const next = i + 1;
                    setGuestInningScores(prev => {
                        const newScores = [...prev];
                        newScores[next - 1] = 0;
                        return newScores;
                    });
                    return next;
                });
            }
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
        saveStateToHistory(); processOuts(1); advanceBatter();
    };

    const handleStrike = async () => {
        saveStateToHistory();
        if (strikes === 2) {
            await recordPitchAPI('strike', 'strikeout');
            setBalls(0); setStrikes(0); processOuts(1); advanceBatter();
        } else {
            await recordPitchAPI('strike'); setStrikes(s => s + 1);
        }
    };

    const handleWalk = async () => {
        saveStateToHistory();
        await recordPitchAPI('ball', 'walk');
        let runs = 0; let newFirst = true; let newSecond = secondBase; let newThird = thirdBase;

        if (firstBase) { newSecond = true; if (secondBase) { newThird = true; if (thirdBase) runs++; } }
        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0); advanceBatter();
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
        addScore(runs); setBalls(0); setStrikes(0); advanceBatter();
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
        setBalls(0); setStrikes(0); processOuts(addedOuts); advanceBatter();
    };

    const handleZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setPitchX(x); setPitchY(y);
    };

    useEffect(() => {
        if (!matchId) return;
        const fetchData = async () => {
            try {
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (matchRes.ok) setMatch(await matchRes.json());

                const lineupRes = await fetch(`/api/matches/${matchId}/lineup`);
                if (lineupRes.ok) {
                    const lineupData = (await lineupRes.json()) as LineupPlayer[];
                    setMyLineup(lineupData);
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [matchId]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-foreground">読み込み中...</div>;
    if (!match) return <div className="p-8 text-center bg-background text-foreground h-screen flex flex-col items-center justify-center"><p>試合が見つかりません</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard">戻る</Link></Button></div>;

    // 💡 選手情報の取得ロジック
    // 現在のバッター
    const currentBatter = myLineup.length > 0 ? myLineup[myBatterIndex] : null;
    // NEXTバッター
    const nextBatter = myLineup.length > 0 ? myLineup[(myBatterIndex + 1) % myLineup.length] : null;
    // 自チームのピッチャー（ポジションが「1」「投手」「P」のいずれか。見つからなければ一旦1番を仮表示）
    const currentPitcher = myLineup.find(p => p.position === '1' || p.position === '投手' || p.position.toUpperCase() === 'P') || myLineup[0];

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <header className="bg-muted/10 border-b border-border p-4 pb-1 shrink-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted -ml-2" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                            {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                        </span>
                        <h1 className="font-black text-sm tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleFullScreen}>
                            <Maximize className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button onClick={handleFinishMatch} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 sm:px-4 shadow-sm text-xs">試合終了</Button>
                    </div>
                </div>

                <div className="relative -mx-4 mb-4 mt-2">
                    <div className="bg-background border-y border-border overflow-x-auto scrollbar-hide pb-3">
                        <div className="min-w-[360px] px-2 pt-2">
                            <table className="w-full text-center text-sm table-fixed">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border text-[10px] sm:text-xs">
                                        <th className="text-left font-medium pb-1 pl-3 w-16 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">TEAM</th>
                                        {[...Array(9)].map((_, i) => (
                                            <th key={i} className={cn("font-medium pb-1 w-7", inning === i + 1 ? "text-primary font-black" : "")}>{i + 1}</th>
                                        ))}
                                        <th className="font-black pb-1 w-8 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">R</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-xs sm:text-sm">
                                    <tr className="border-b border-border/50">
                                        <td className="text-left py-2 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                            <span className="truncate max-w-[55px] inline-block align-middle">{match.opponent}</span>
                                        </td>
                                        {[...Array(9)].map((_, i) => (
                                            <td key={i} className={cn("py-2", inning === i + 1 && isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                                {guestInningScores[i] !== null ? guestInningScores[i] : '-'}
                                            </td>
                                        ))}
                                        <td className="py-2 text-sm text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{guestScore}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-left py-2 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                            <span className="truncate max-w-[55px] inline-block align-middle text-primary">Self</span>
                                        </td>
                                        {[...Array(9)].map((_, i) => (
                                            <td key={i} className={cn("py-2", inning === i + 1 && !isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                                {selfInningScores[i] !== null ? selfInningScores[i] : '-'}
                                            </td>
                                        ))}
                                        <td className="py-2 text-sm text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{selfScore}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 💡 攻守に応じたバッジの表示切り替えエリア */}
                    <div className="absolute -bottom-3 left-0 right-0 flex justify-center items-end gap-2 px-2 z-20 pointer-events-none">
                        {isTop ? (
                            /* ⚾️ 守備時（表）：ピッチャーと投球数 */
                            currentPitcher && (
                                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                    <Activity className="h-3.5 w-3.5" />
                                    P: {currentPitcher.playerName}
                                    <span className="bg-blue-800/60 px-1.5 py-0.5 rounded text-[10px] ml-1">{selfPitchCount}球</span>
                                </div>
                            )
                        ) : (
                            /* ⚾️ 攻撃時（裏）：バッターとNextバッター */
                            <>
                                {currentBatter && (
                                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                        <User className="h-3.5 w-3.5" />
                                        {currentBatter.batting_order}番 {currentBatter.playerName}
                                    </div>
                                )}
                                {nextBatter && (
                                    <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2 opacity-95">
                                        <span className="text-primary font-black ml-0.5">NEXT</span>
                                        <ChevronRight className="h-3 w-3 -mx-1 opacity-50" />
                                        {nextBatter.batting_order}番 {nextBatter.playerName}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </header>

            <main className="flex-1 relative p-4 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">

                {/* カウント表示 */}
                <div className="absolute top-4 left-4 space-y-3 z-10 bg-muted/30 p-3 rounded-xl backdrop-blur-sm border border-border shadow-sm">
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

                {/* 塁状況（ランナー）表示 */}
                <div className="absolute top-4 right-4 z-10 bg-muted/30 p-4 rounded-xl backdrop-blur-sm border border-border shadow-sm flex items-center justify-center w-[100px] h-[100px]">
                    <div className="relative w-12 h-12 rotate-45 border-[3px] border-border rounded-sm transition-all">
                        <div className={cn("absolute -top-1.5 -left-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", secondBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                        <div className={cn("absolute -bottom-1.5 -left-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", thirdBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                        <div className={cn("absolute -top-1.5 -right-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", firstBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                        <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-primary/20 border-2 border-primary/50 -rotate-45 rounded-sm flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-sm animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* 中央：配球図全体 */}
                <div
                    className="relative w-[75vw] max-w-[280px] aspect-[4/5] mt-6 mx-auto bg-muted/5 rounded-2xl cursor-crosshair touch-none overflow-hidden shadow-inner border-2 border-border/50"
                    onClick={handleZoneClick}
                >
                    <div className="absolute top-[10%] bottom-[32%] left-[22%] right-[22%] border-2 border-foreground/50 grid grid-cols-3 grid-rows-3 pointer-events-none bg-primary/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-none">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="border border-foreground/30" />
                        ))}
                    </div>

                    <div className="absolute top-[73%] left-[22%] right-[22%] pointer-events-none opacity-60">
                        <svg viewBox="0 0 100 30" className="w-full h-auto fill-background stroke-foreground/70 stroke-[2.5px] drop-shadow-sm">
                            <polygon points="2,2 98,2 98,12 50,28 2,12" />
                        </svg>
                    </div>

                    {pitchX !== null && pitchY !== null && (
                        <div
                            className="absolute w-6 h-6 -ml-3 -mt-3 bg-yellow-400 rounded-full border-2 border-zinc-900 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-20 flex items-center justify-center animate-in zoom-in pointer-events-none"
                            style={{ left: `${pitchX * 100}%`, top: `${pitchY * 100}%` }}
                        >
                            <div className="w-full h-[2px] bg-red-600/50 absolute rotate-45"></div>
                            <div className="w-full h-[2px] bg-red-600/50 absolute -rotate-45"></div>
                        </div>
                    )}

                    {pitchX === null && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <span className="text-xs font-bold text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                                コースをタップ
                            </span>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-muted/20 border-t border-border p-3 sm:p-5 pb-6 shrink-0 space-y-2 z-10 relative">
                <div className="grid grid-cols-4 gap-2">
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleBall}>
                        <span className="text-green-500 font-black text-xl group-active:scale-125 transition-transform">B</span>
                    </Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleStrike}>
                        <span className="text-yellow-500 font-black text-xl group-active:scale-125 transition-transform">S</span>
                    </Button>
                    <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleManualOut}>
                        <span className="text-red-500 font-black text-xl group-active:scale-125 transition-transform">O</span>
                    </Button>
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