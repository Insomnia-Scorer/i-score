// src/components/score/PlayArea.tsx
import { cn } from "@/lib/utils";

interface PlayAreaProps {
    balls: number; strikes: number; outs: number;
    firstBase: boolean; secondBase: boolean; thirdBase: boolean;
    pitchX: number | null; pitchY: number | null;
    onZoneClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function PlayArea({
    balls, strikes, outs, firstBase, secondBase, thirdBase, pitchX, pitchY, onZoneClick
}: PlayAreaProps) {
    return (
        <main className="flex-1 relative px-4 pb-4 pt-1 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">

            {/* 💡 究極UI: 電光掲示板のように強烈に発光するBSOランプ */}
            <div className="absolute top-2 left-4 space-y-3 z-10 bg-background/80 p-3.5 rounded-2xl backdrop-blur-md border border-border/50 shadow-lg">
                <div className="flex gap-2 items-center">
                    <span className="w-4 text-[11px] font-black text-green-500/80 tracking-tighter">B</span>
                    {[...Array(3)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full transition-all duration-300", i < balls ? "bg-green-500 shadow-[0_0_12px_3px_rgba(34,197,94,0.6)] scale-110" : "bg-muted/50 border border-border/50 inset-shadow-sm")} />)}
                </div>
                <div className="flex gap-2 items-center">
                    <span className="w-4 text-[11px] font-black text-yellow-500/80 tracking-tighter">S</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full transition-all duration-300", i < strikes ? "bg-yellow-500 shadow-[0_0_12px_3px_rgba(234,179,8,0.6)] scale-110" : "bg-muted/50 border border-border/50 inset-shadow-sm")} />)}
                </div>
                <div className="flex gap-2 items-center">
                    <span className="w-4 text-[11px] font-black text-red-500/80 tracking-tighter">O</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full transition-all duration-300", i < outs ? "bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.6)] scale-110" : "bg-muted/50 border border-border/50 inset-shadow-sm")} />)}
                </div>
            </div>

            {/* 💡 究極UI: ネオンのように輝くダイヤモンド（塁） */}
            <div className="absolute top-2 right-4 z-10 bg-background/80 p-4 rounded-2xl backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center w-[100px] h-[100px]">
                <div className="relative w-12 h-12 rotate-45 border-[3px] border-border/60 rounded-sm transition-all">
                    {/* セカンド */}
                    <div className={cn("absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", secondBase ? "bg-yellow-400 border-2 border-white shadow-[0_0_15px_5px_rgba(250,204,21,0.5)] scale-[1.7] z-10" : "bg-muted border border-border/50")} />
                    {/* サード */}
                    <div className={cn("absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", thirdBase ? "bg-yellow-400 border-2 border-white shadow-[0_0_15px_5px_rgba(250,204,21,0.5)] scale-[1.7] z-10" : "bg-muted border border-border/50")} />
                    {/* ファースト */}
                    <div className={cn("absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", firstBase ? "bg-yellow-400 border-2 border-white shadow-[0_0_15px_5px_rgba(250,204,21,0.5)] scale-[1.7] z-10" : "bg-muted border border-border/50")} />
                    {/* ホームベース（うっすら鼓動する） */}
                    <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-primary/20 border-2 border-primary/50 -rotate-45 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-sm animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    </div>
                </div>
            </div>

            {/* 配球図エリア */}
            <div className="relative w-[75vw] max-w-[280px] aspect-[4/5] mt-2 mx-auto bg-muted/5 rounded-3xl cursor-crosshair touch-none overflow-hidden shadow-inner border-[3px] border-border/40" onClick={onZoneClick}>
                <div className="absolute top-[10%] bottom-[32%] left-[22%] right-[22%] border-2 border-foreground/40 grid grid-cols-3 grid-rows-3 pointer-events-none bg-primary/5 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-none">
                    {[...Array(9)].map((_, i) => <div key={i} className="border border-foreground/20" />)}
                </div>
                <div className="absolute top-[73%] left-[22%] right-[22%] pointer-events-none opacity-50">
                    <svg viewBox="0 0 100 30" className="w-full h-auto fill-background stroke-foreground/60 stroke-[2.5px] drop-shadow-md">
                        <polygon points="2,2 98,2 98,12 50,28 2,12" />
                    </svg>
                </div>
                {/* 💡 コースマーカーもアニメーションを強化 */}
                {pitchX !== null && pitchY !== null && (
                    <div className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-yellow-400 rounded-full border-[3px] border-zinc-900 shadow-[0_0_20px_5px_rgba(250,204,21,0.6)] z-20 flex items-center justify-center animate-in zoom-in-50 duration-200 pointer-events-none" style={{ left: `${pitchX * 100}%`, top: `${pitchY * 100}%` }}>
                        <div className="w-full h-[2px] bg-red-600/80 absolute rotate-45"></div>
                        <div className="w-full h-[2px] bg-red-600/80 absolute -rotate-45"></div>
                    </div>
                )}
                {pitchX === null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-pulse">
                        <span className="text-xs font-black text-muted-foreground bg-background/95 px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-border/50 tracking-wider">
                            コースをタップ
                        </span>
                    </div>
                )}
            </div>
        </main>
    );
}
