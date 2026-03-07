// src/app/(protected)/matches/result/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Newspaper, Trophy, Download, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import * as htmlToImage from 'html-to-image';
import { toast } from "sonner";

interface Match {
    id: string; opponent: string; date: string; season: string; status: string;
    myScore: number; opponentScore: number;
    myInningScores: string; opponentInningScores: string;
    innings?: number;
}

interface AtBat {
    inning: number; isTop: number; batterName: string; result: string | null;
}

const resultLabels: Record<string, string> = {
    'single': '単打', 'double': '二塁打', 'triple': '三塁打', 'home_run': '本塁打',
    'walk': '四死球', 'strikeout': '三振', 'groundout': 'ゴロ', 'flyout': '飛・直', 'double_play': '併殺打',
};

// 💡 究極UI: ただの色文字ではなく、美しい「ソリッドバッジ」で結果を表現
const getResultBadge = (result: string | null) => {
    if (!result) return <span className="text-muted-foreground font-bold">-</span>;
    
    const text = resultLabels[result] || result;
    
    if (['single', 'double', 'triple', 'home_run'].includes(result)) {
        return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[8px] bg-[#3b82f6]/10 text-[#2563eb] dark:bg-[#3b82f6]/20 dark:text-[#60a5fa] font-black text-[11px] whitespace-nowrap tracking-wider border border-[#3b82f6]/20">{text}</span>;
    }
    if (result === 'walk') {
        return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[8px] bg-[#10b981]/10 text-[#059669] dark:bg-[#10b981]/20 dark:text-[#34d399] font-black text-[11px] whitespace-nowrap tracking-wider border border-[#10b981]/20">{text}</span>;
    }
    if (['strikeout', 'double_play'].includes(result)) {
        return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[8px] bg-[#ef4444]/10 text-[#dc2626] dark:bg-[#ef4444]/20 dark:text-[#f87171] font-black text-[11px] whitespace-nowrap tracking-wider border border-[#ef4444]/20">{text}</span>;
    }
    // 普通のアウト（ゴロ・フライ）は目立たせすぎないグレー
    return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground font-bold text-[11px] whitespace-nowrap tracking-wider border border-border/50">{text}</span>;
};

function MatchResultContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");

    const [match, setMatch] = useState<Match | null>(null);
    const [atBats, setAtBats] = useState<AtBat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!matchId) return;
        const fetchData = async () => {
            try {
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (matchRes.ok) setMatch(await matchRes.json());

                const boxscoreRes = await fetch(`/api/matches/${matchId}/boxscore`);
                if (boxscoreRes.ok) setAtBats(await boxscoreRes.json());
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [matchId]);

    const handleDownloadImage = async () => {
        if (!captureRef.current || !match) return;
        setIsDownloading(true);
        toast.info("画像を生成しています...", { id: "download-toast" });

        try {
            const dataUrl = await htmlToImage.toPng(captureRef.current, {
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#ffffff',
                pixelRatio: 2, // 💡 画質を少し上げて、文字をくっきり綺麗に
                style: {
                    margin: '0',
                }
            });

            const link = document.createElement("a");
            link.download = `試合結果_${match.opponent}戦_${match.date}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("画像を保存しました！シェアしてみましょう！", { id: "download-toast" });
        } catch (error: any) {
            console.error("画像化エラー:", error);
            toast.error(`画像の保存に失敗しました。\n詳細: ${error?.message || error}`, { id: "download-toast" });
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!match) return <div className="flex h-screen items-center justify-center font-bold">試合が見つかりません</div>;

    const battersMap = new Map<string, AtBat[]>();
    let maxAtBatsCount = 0;
    atBats.forEach(ab => {
        if (!battersMap.has(ab.batterName)) battersMap.set(ab.batterName, []);
        battersMap.get(ab.batterName)!.push(ab);
        if (battersMap.get(ab.batterName)!.length > maxAtBatsCount) {
            maxAtBatsCount = battersMap.get(ab.batterName)!.length;
        }
    });
    const batters = Array.from(battersMap.entries());

    const guestScores: (number | null)[] = match.opponentInningScores ? JSON.parse(match.opponentInningScores) : [];
    const selfScores: (number | null)[] = match.myInningScores ? JSON.parse(match.myInningScores) : [];

    let maxInning = match.innings || 9;
    guestScores.forEach((s, i) => { if (s !== null) maxInning = Math.max(maxInning, i + 1); });
    selfScores.forEach((s, i) => { if (s !== null) maxInning = Math.max(maxInning, i + 1); });
    const inningsCount = maxInning;

    const isWin = match.myScore > match.opponentScore;
    const isDraw = match.myScore === match.opponentScore;

    return (
        <div className="flex flex-col min-h-screen bg-muted/20 text-foreground pb-24">
            <PageHeader
                href="/dashboard"
                icon={Newspaper}
                title={`試合結果 vs ${match.opponent}`}
                subtitle={`${new Date(match.date).toLocaleDateString('ja-JP')} • ${match.season}`}
            />

            <main className="max-w-4xl mx-auto w-full px-4 mt-6">
                {/* 💡 追従するダウンロードボタン */}
                <div className="flex justify-end mb-4 sticky top-4 z-50">
                    <Button 
                        onClick={handleDownloadImage} 
                        disabled={isDownloading} 
                        className="rounded-full h-12 px-6 font-extrabold shadow-lg shadow-blue-500/20 bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all active:scale-95"
                    >
                        {isDownloading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 生成中...</> : <><Download className="mr-2 h-5 w-5" /> 結果を画像で保存</>}
                    </Button>
                </div>

                {/* 💡 画像生成のターゲットエリア（透明度を使わずソリッドに構築） */}
                <div 
                    ref={captureRef} 
                    className="bg-background border border-border/50 rounded-[32px] shadow-sm overflow-hidden"
                >
                    {/* ヘッダー部分：スポーツ新聞の「見出し」のような大迫力デザイン */}
                    <div className="bg-primary text-primary-foreground p-8 sm:p-10 text-center relative overflow-hidden">
                        {/* 背景の装飾 */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                            <Trophy className="w-64 h-64" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black bg-primary-foreground/20 text-primary-foreground uppercase tracking-[0.2em] mb-4">
                                {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 drop-shadow-md leading-tight">
                                vs {match.opponent}
                            </h1>
                            <p className="text-primary-foreground/80 font-bold tracking-widest">{new Date(match.date).toLocaleDateString('ja-JP')}</p>
                            
                            {/* 勝敗バッジ */}
                            <div className="mt-6 flex items-center justify-center gap-4 bg-background/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-primary-foreground/20">
                                <span className="text-2xl font-black">{match.opponentScore}</span>
                                <span className="text-primary-foreground/50 font-black">-</span>
                                <span className="text-2xl font-black">{match.myScore}</span>
                                <div className="w-px h-6 bg-primary-foreground/30 mx-2" />
                                <span className={cn("text-lg font-black tracking-widest", isWin ? "text-yellow-300" : isDraw ? "text-primary-foreground/70" : "text-red-300")}>
                                    {isWin ? "WIN" : isDraw ? "DRAW" : "LOSE"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 space-y-10">
                        {/* 💡 スコアボード（ランニングスコア） */}
                        <section>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-4 text-foreground">
                                <Activity className="h-5 w-5 text-primary" /> ランニングスコア
                            </h2>
                            <div className="border border-border rounded-2xl overflow-hidden bg-background">
                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-center text-sm min-w-[500px]">
                                        <thead>
                                            <tr className="bg-muted border-b border-border">
                                                <th className="text-left font-black py-3 pl-4 w-28 text-muted-foreground tracking-wider">TEAM</th>
                                                {[...Array(inningsCount)].map((_, i) => (
                                                    <th key={i} className="font-bold py-3 w-10 text-muted-foreground">{i + 1}</th>
                                                ))}
                                                <th className="font-black py-3 w-12 text-primary bg-primary/5">R</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-black text-base divide-y divide-border">
                                            <tr>
                                                <td className="text-left py-3.5 pl-4 text-muted-foreground">
                                                    <span className="truncate max-w-[90px] inline-block align-middle">{match.opponent}</span>
                                                </td>
                                                {[...Array(inningsCount)].map((_, i) => (
                                                    <td key={i} className="py-3.5 text-muted-foreground/80">
                                                        {guestScores[i] !== null && guestScores[i] !== undefined ? guestScores[i] : '-'}
                                                    </td>
                                                ))}
                                                <td className="py-3.5 text-xl bg-primary/5 text-foreground">{match.opponentScore}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left py-3.5 pl-4 text-primary">
                                                    Self
                                                </td>
                                                {[...Array(inningsCount)].map((_, i) => (
                                                    <td key={i} className="py-3.5 text-muted-foreground/80">
                                                        {selfScores[i] !== null && selfScores[i] !== undefined ? selfScores[i] : '-'}
                                                    </td>
                                                ))}
                                                <td className="py-3.5 text-xl bg-primary/5 text-primary">{match.myScore}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 💡 ボックススコア（打撃成績） */}
                        <section>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-4 text-foreground">
                                <Target className="h-5 w-5 text-primary" /> ボックススコア
                            </h2>
                            <div className="border border-border rounded-2xl overflow-hidden bg-background">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left whitespace-nowrap min-w-[600px]">
                                        <thead className="bg-muted border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 font-black text-muted-foreground tracking-wider">打者名</th>
                                                {[...Array(Math.max(maxAtBatsCount, 3))].map((_, i) => (
                                                    <th key={i} className="px-4 py-3 text-center font-bold text-muted-foreground">第{i + 1}打席</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {batters.length === 0 ? (
                                                <tr>
                                                    <td colSpan={maxAtBatsCount + 1} className="text-center py-10 text-muted-foreground font-bold bg-muted/30">打席データがありません</td>
                                                </tr>
                                            ) : (
                                                batters.map(([name, abs], idx) => (
                                                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-3.5 font-extrabold text-foreground border-r border-border/50 bg-muted/10">
                                                            {name}
                                                        </td>
                                                        {[...Array(Math.max(maxAtBatsCount, 3))].map((_, i) => {
                                                            const ab = abs[i];
                                                            return (
                                                                <td key={i} className="px-4 py-3.5 text-center">
                                                                    {ab ? (
                                                                        <div className="flex flex-col items-center gap-1.5">
                                                                            <span className="text-[10px] text-muted-foreground font-bold tracking-tighter leading-none">{ab.inning}回{ab.isTop ? '表' : '裏'}</span>
                                                                            {getResultBadge(ab.result)}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground/30 font-black">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* フッター署名 */}
                        <div className="pt-6 border-t border-border flex items-center justify-center gap-2">
                            <Trophy className="h-4 w-4 text-primary/50" />
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Powered by i-Score</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function MatchResultPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <MatchResultContent />
        </Suspense>
    );
}
