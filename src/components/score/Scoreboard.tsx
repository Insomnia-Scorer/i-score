// src/components/score/Scoreboard.tsx
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Scoreboard() {
    const { state } = useScore();

    // BSOのドットを描画するヘルパー
    const renderDots = (count: number, max: number, activeColor: string) => {
        return Array.from({ length: max }).map((_, i) => (
            <div
                key={i}
                className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all duration-200",
                    i < count
                        ? `${activeColor} border-transparent scale-110`
                        : "bg-zinc-800 border-zinc-700"
                )}
            />
        ));
    };

    // ラインスコア（1〜9回＋α）の表示用配列を作成
    const maxInnings = Math.max(9, state.inning, state.myInningScores.length, state.opponentInningScores.length);
    const inningsArray = Array.from({ length: maxInnings }, (_, i) => i + 1);

    return (
        <Card className="bg-zinc-950 border-zinc-800 text-white overflow-hidden shadow-2xl">
            <CardContent className="p-0">
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                1. メインスコア & イニング表示
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="flex items-stretch border-b border-zinc-800">
                    {/* 左側：チーム名と合計得点 */}
                    <div className="flex-1 grid grid-cols-1 divide-y divide-zinc-800">
                        {/* 自チーム（Self） */}
                        <div className={cn(
                            "flex items-center justify-between px-4 py-3 transition-colors",
                            state.isTop ? "bg-primary/10" : "bg-transparent"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-1.5 h-8 rounded-full",
                                    state.isTop ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.6)]" : "bg-zinc-800"
                                )} />
                                <span className="font-black text-zinc-400 text-sm uppercase tracking-tighter">Self</span>
                            </div>
                            <span className="text-4xl font-black tabular-nums tracking-tighter">{state.myScore}</span>
                        </div>
                        {/* 相手チーム（Guest） */}
                        <div className={cn(
                            "flex items-center justify-between px-4 py-3 transition-colors",
                            !state.isTop ? "bg-red-500/10" : "bg-transparent"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-1.5 h-8 rounded-full",
                                    !state.isTop ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "bg-zinc-800"
                                )} />
                                <span className="font-black text-zinc-400 text-sm uppercase tracking-tighter">Guest</span>
                            </div>
                            <span className="text-4xl font-black tabular-nums tracking-tighter">{state.opponentScore}</span>
                        </div>
                    </div>

                    {/* 右側：現在の回表示 */}
                    <div className="w-24 bg-zinc-900 flex flex-col items-center justify-center border-l border-zinc-800">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Inning</span>
                        <div className="flex items-baseline">
                            <span className="text-4xl font-black tabular-nums">{state.inning}</span>
                            <span className={cn(
                                "text-xl ml-1 font-black",
                                state.isTop ? "text-primary" : "text-red-500"
                            )}>
                                {state.isTop ? "▲" : "▼"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                2. ラインスコア（回別得点）※横スクロール可能
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="overflow-x-auto bg-zinc-900/50">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800/50">
                                <th className="px-2 py-1 text-[10px] font-black text-zinc-600 uppercase">Team</th>
                                {inningsArray.map(i => (
                                    <th key={i} className={cn(
                                        "px-2 py-1 text-[10px] font-black min-w-[28px]",
                                        state.inning === i ? "text-white bg-zinc-800" : "text-zinc-600"
                                    )}>{i}</th>
                                ))}
                                <th className="px-3 py-1 text-[10px] font-black text-zinc-600 border-l border-zinc-800">R</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold tabular-nums text-sm">
                            <tr className="border-b border-zinc-800/30">
                                <td className="text-[10px] text-zinc-500 px-2 font-black uppercase text-left">S</td>
                                {inningsArray.map((_, i) => (
                                    <td key={i} className={cn(
                                        "py-1",
                                        state.inning === i + 1 && state.isTop ? "text-primary" : "text-zinc-400"
                                    )}>
                                        {state.myInningScores[i] ?? (state.inning > i + 1 ? 0 : "-")}
                                    </td>
                                ))}
                                <td className="bg-zinc-800/30 font-black px-3 border-l border-zinc-800">{state.myScore}</td>
                            </tr>
                            <tr>
                                <td className="text-[10px] text-zinc-500 px-2 font-black uppercase text-left">G</td>
                                {inningsArray.map((_, i) => (
                                    <td key={i} className={cn(
                                        "py-1",
                                        state.inning === i + 1 && !state.isTop ? "text-red-500" : "text-zinc-400"
                                    )}>
                                        {state.opponentInningScores[i] ?? (state.inning > i + 1 || (state.inning === i + 1 && !state.isTop) ? 0 : "-")}
                                    </td>
                                ))}
                                <td className="bg-zinc-800/30 font-black px-3 border-l border-zinc-800">{state.opponentScore}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                3. BSO カウントエリア
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="p-4 grid grid-cols-3 gap-2 bg-zinc-950">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black text-zinc-600 tracking-tighter">BALL</span>
                        <div className="flex gap-1.5">
                            {renderDots(state.balls, 3, "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]")}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 border-x border-zinc-900">
                        <span className="text-xs font-black text-zinc-600 tracking-tighter">STRIKE</span>
                        <div className="flex gap-1.5">
                            {renderDots(state.strikes, 2, "bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]")}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black text-zinc-600 tracking-tighter">OUT</span>
                        <div className="flex gap-1.5">
                            {renderDots(state.outs, 2, "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]")}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}