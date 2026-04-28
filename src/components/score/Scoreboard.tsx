// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    /**
     * 💡 修正ポイント:
     * - bg-zinc-950(黒固定) をやめ、bg-card/50 + backdrop-blur でライトモードでも美しく
     * - 文字色を foreground に合わせて自動切り替え
     */
    <div className="h-full w-full bg-card/60 backdrop-blur-xl flex flex-col border-b border-border/40 shadow-sm">

      {/* 1. 最上段：大会名コンテキスト */}
      <div className="h-6 flex items-center justify-center bg-muted/50 border-b border-border/20">
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">
          2026 Spring Regional Championship
        </span>
      </div>

      {/* 2. 中段：メインスコア & BSO */}
      <div className="flex-1 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-muted-foreground uppercase">GUEST</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 mb-0.5 truncate max-w-[60px]">MARINES</span>
            <p className="text-4xl font-black italic tracking-tighter leading-none tabular-nums text-foreground">
              {state.opponentScore}
            </p>
          </div>
          <div className="text-xl font-black text-muted-foreground/10 italic mt-6">-</div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase">HOME</span>
            <span className="text-[10px] font-bold text-primary/60 mb-0.5 truncate max-w-[60px]">EAGLES</span>
            <p className="text-4xl font-black italic tracking-tighter leading-none tabular-nums text-primary">
              {state.myScore}
            </p>
          </div>
        </div>

        {/* BSOランプ */}
        <div className="flex flex-col gap-1.5 bg-muted/30 p-2.5 rounded-xl border border-border/40 shadow-inner">
          {['B', 'S', 'O'].map((label) => {
            const count = label === 'B' ? state.balls : label === 'S' ? state.strikes : state.outs;
            const color = label === 'B' ? "bg-amber-500" : label === 'S' ? "bg-blue-500" : "bg-rose-500";
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={cn("text-[9px] font-black w-2.5 italic",
                  label === 'B' ? "text-amber-500" : label === 'S' ? "text-blue-500" : "text-rose-500"
                )}>{label}</span>
                <div className="flex gap-1">
                  {[...Array(label === 'B' ? 3 : 2)].map((_, i) => (
                    <div key={i} className={cn(
                      "w-3 h-3 rounded-full border border-border/20 transition-all duration-300",
                      i < count ? `${color} shadow-[0_0_10px_rgba(var(--primary),0.5)]` : "bg-muted opacity-20"
                    )} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 下段：イニングスコア表 */}
      <div className="h-14 bg-muted/20 flex items-center px-4 overflow-hidden border-t border-border/20">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-[7px] font-black text-muted-foreground/60 uppercase">
              <th className="text-left w-10 opacity-0">TEAM</th>
              {innings.map(i => <th key={i} className={cn("w-6 sm:w-8", state.inning === i && "text-primary")}>{i}</th>)}
              <th className="w-8 border-l border-border/40 bg-muted/40 font-bold">R</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-black italic tabular-nums leading-none">
            <tr className="h-4">
              <td className="text-left text-[8px] not-italic text-muted-foreground uppercase">GUEST</td>
              {innings.map(i => <td key={i} className="text-muted-foreground/40">{state.opponentInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-border/40 bg-muted/40 text-muted-foreground">{state.opponentScore}</td>
            </tr>
            <tr className="h-4">
              <td className="text-left text-[8px] not-italic text-primary uppercase">HOME</td>
              {innings.map(i => <td key={i} className={cn(state.inning === i ? "text-primary" : "text-muted-foreground/40")}>{state.myInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-border/40 bg-muted/40 text-primary">{state.myScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}