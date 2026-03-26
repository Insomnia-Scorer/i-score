// src/components/score/PlayArea.tsx
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

/**
 * ⚾️ プレイエリア・コンポーネント
 * 野球のダイヤモンドを視覚的に表現し、ランナーの状況を表示します。
 */
export function PlayArea() {
    const { state } = useScore();

    // 各塁のランナー存在確認（型安全プロトコル適用）
    const hasRunner1 = !!state.runners.base1;
    const hasRunner2 = !!state.runners.base2;
    const hasRunner3 = !!state.runners.base3;

    /**
     * 💡 ベース（塁）を描画するサブコンポーネント
     */
    const Base = ({
        active,
        label,
        className
    }: {
        active: boolean;
        label: string;
        className: string
    }) => (
        <div className={cn(
            "absolute w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500",
            className
        )}>
            {/* ベースの四角形（45度回転させてダイヤ型に） */}
            <div className={cn(
                "absolute inset-0 rotate-45 border-2 rounded-sm sm:rounded-md transition-all duration-300",
                active
                    ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] scale-110"
                    : "bg-zinc-800 border-zinc-700"
            )} />

            {/* ランナーアイコン（アクティブ時のみ表示） */}
            {active && (
                <User className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground animate-in zoom-in duration-300" />
            )}

            {/* 塁のラベル（1, 2, 3） */}
            <span className={cn(
                "absolute -bottom-6 text-[10px] font-black uppercase tracking-tighter",
                active ? "text-primary" : "text-zinc-600"
            )}>
                {label}
            </span>
        </div>
    );

    return (
        <Card className="bg-zinc-950 border-zinc-900 rounded-[32px] overflow-hidden shadow-xl">
            <CardContent className="p-8 sm:p-12">
                <div className="relative aspect-square max-w-[240px] mx-auto">

                    {/* 💡 ダイヤモンドのライン（芝生・土のイメージ） */}
                    <div className="absolute inset-4 border-2 border-dashed border-zinc-800 rotate-45 rounded-sm" />

                    {/* 2塁 (Second Base) */}
                    <Base
                        active={hasRunner2}
                        label="2nd"
                        className="top-0 left-1/2 -translate-x-1/2"
                    />

                    {/* 3塁 (Third Base) */}
                    <Base
                        active={hasRunner3}
                        label="3rd"
                        className="top-1/2 left-0 -translate-y-1/2"
                    />

                    {/* 1塁 (First Base) */}
                    <Base
                        active={hasRunner1}
                        label="1st"
                        className="top-1/2 right-0 -translate-y-1/2"
                    />

                    {/* 本塁 (Home Plate) */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                        {/* 五角形を模したホームベース（簡易版） */}
                        <div className="absolute inset-0 bg-zinc-700 clip-path-home-plate"
                            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' }} />
                        <span className="relative z-10 text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-tighter">Home</span>
                    </div>

                    {/* 💡 投手板（中心点） */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-zinc-800 rounded-full shadow-inner" />

                </div>

                {/* 💡 ステータステキスト */}
                <div className="mt-8 flex justify-center gap-4">
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-colors",
                        (hasRunner1 || hasRunner2 || hasRunner3)
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600"
                    )}>
                        {(hasRunner1 || hasRunner2 || hasRunner3) ? "RUNNER ON BASE" : "NO RUNNERS"}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}