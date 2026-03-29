// src/components/score/Scoreboard.tsx
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
/**
 * 💡 究極のスコアボード・コンポーネント
 * 1. 意匠: bg-card/40 と backdrop-blur-3xl で「スタジアムのガラス」のような質感を表現。
 * 2. 規則: 影なし。border-border/60。角丸40px。
 * 3. 整理: BSOカウントをアイコンではなく、高輝度な「光るドット」として再定義。
 */

export function Scoreboard() {
  const { state } = useScore();

  // BSOドットの描画
  const renderDots = (count: number, max: number, colorClass: string) => {
    return Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-3.5 w-3.5 rounded-full border-2 transition-all duration-500 shadow-none",
          i < count
            ? `${colorClass} border-transparent ring-4 ring-current/10 animate-pulse`
            : "bg-muted/20 border-border/40 opacity-20"
        )}
      />
    ));
  };

  const innings = Array.from({ length: Math.max(9, state.inning) }, (_, i) => i + 1);

  return (
    <Card className="bg-card/40 backdrop-blur-3xl border-border/60 rounded-[40px] overflow-hidden shadow-none transition-all duration-700">
      <CardContent className="p-0">
        {/* メインスコアエリア */}
        <div className="flex items-stretch divide-x divide-border/20">
          <div className="flex-1 grid grid-cols-1 divide-y divide-border/20">
            {/* 自チーム */}
            <div className={cn(
              "flex items-center justify-between px-8 py-5 transition-all",
              state.isTop ? "bg-primary/5" : "bg-transparent"
            )}>
              <span className={cn("font-black text-xs uppercase tracking-[0.2em]", state.isTop ? "text-primary" : "text-muted-foreground/40")}>Self</span>
              <span className={cn("text-5xl font-black tabular-nums tracking-tighter italic", state.isTop ? "text-foreground" : "text-muted-foreground/30")}>
                {state.myScore}
              </span>
            </div>
            {/* 相手チーム */}
            <div className={cn(
              "flex items-center justify-between px-8 py-5 transition-all",
              !state.isTop ? "bg-red-500/5" : "bg-transparent"
            )}>
              <span className={cn("font-black text-xs uppercase tracking-[0.2em]", !state.isTop ? "text-red-500" : "text-muted-foreground/40")}>Guest</span>
              <span className={cn("text-5xl font-black tabular-nums tracking-tighter italic", !state.isTop ? "text-foreground" : "text-muted-foreground/30")}>
                {state.opponentScore}
              </span>
            </div>
          </div>

          {/* イニング表示 */}
          <div className="w-32 bg-muted/10 flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Inning</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black italic tabular-nums leading-none tracking-tighter text-foreground">{state.inning}</span>
              <span className={cn("text-xl font-black", state.isTop ? "text-primary" : "text-red-500")}>
                {state.isTop ? "▲" : "▼"}
              </span>
            </div>
          </div>
        </div>

        {/* BSO カウント */}
        <div className="bg-muted/5 border-t border-border/20 grid grid-cols-3 divide-x divide-border/10">
          {[
            { label: "B", color: "bg-green-500", count: state.balls, max: 3 },
            { label: "S", color: "bg-yellow-500", count: state.strikes, max: 2 },
            { label: "O", color: "bg-red-600", count: state.outs, max: 2 },
          ].map((c) => (
            <div key={c.label} className="py-4 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{c.label}</span>
              <div className="flex gap-2.5">
                {renderDots(c.count, c.max, c.color)}
              </div>
            </div>
          ))}
        </div>

        {/* イニング詳細テーブル (横スクロール) */}
        <div className="overflow-x-auto bg-muted/10 border-t border-border/20 scrollbar-hide">
          <table className="w-full text-[10px] font-black uppercase tracking-widest">
            <tbody className="divide-y divide-border/10">
              <tr>
                <td className="px-6 py-2 border-r border-border/10 text-muted-foreground/60 bg-muted/10 sticky left-0 z-10">S</td>
                {innings.map((i) => (
                  <td key={i} className={cn("px-4 py-2 text-center tabular-nums", state.inning === i && state.isTop ? "text-primary bg-primary/5" : "text-muted-foreground")}>
                    {state.myInningScores[i - 1] ?? "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-2 border-r border-border/10 text-muted-foreground/60 bg-muted/10 sticky left-0 z-10">G</td>
                {innings.map((i) => (
                  <td key={i} className={cn("px-4 py-2 text-center tabular-nums", state.inning === i && !state.isTop ? "text-red-500 bg-red-500/5" : "text-muted-foreground")}>
                    {state.opponentInningScores[i - 1] ?? "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}