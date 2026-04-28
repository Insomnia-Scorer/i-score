// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard({ variant }: { variant?: string }) {
  const { state } = useScore();

  // 💡 イニングスコアの表示用（9回まで）
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="h-full w-full bg-zinc-950 text-white flex flex-col shadow-2xl border-b border-white/5">

      {/* 🏟 メインスコア & BSO (上段) */}
      <div className="flex-1 flex items-center justify-between px-6 pt-4">
        {/* スコア */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">GUEST</span>
            <p className="text-5xl font-black italic tracking-tighter leading-none tabular-nums">{state.opponentScore}</p>
          </div>
          <div className="text-2xl font-black text-zinc-800 italic mt-2">VS</div>
          <div className="text-center">
            <span className="text-[8px] font-black text-primary uppercase tracking-widest">HOME</span>
            <p className="text-5xl font-black italic tracking-tighter leading-none tabular-nums text-primary">{state.myScore}</p>
          </div>
        </div>

        {/* BSOランプ */}
        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-2">
          {['B', 'S', 'O'].map((label) => {
            const count = label === 'B' ? state.balls : label === 'S' ? state.strikes : state.outs;
            const color = label === 'B' ? "bg-amber-500" : label === 'S' ? "bg-blue-500" : "bg-rose-500";
            const shadow = label === 'B' ? "shadow-[0_0_12px_rgba(245,158,11,0.6)]" : label === 'S' ? "shadow-[0_0_12px_rgba(59,130,246,0.6)]" : "shadow-[0_0_12px_rgba(244,63,94,0.6)]";
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={cn("text-[10px] font-black w-2.5 italic", label === 'B' ? "text-amber-500" : label === 'S' ? "text-blue-500" : "text-rose-500")}>{label}</span>
                <div className="flex gap-1.5">
                  {[...Array(label === 'B' ? 3 : 2)].map((_, i) => (
                    <div key={i} className={cn(
                      "w-3.5 h-3.5 rounded-full border border-white/10 transition-all duration-300",
                      i < count ? `${color} ${shadow}` : "bg-zinc-900 opacity-20"
                    )} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 イニングスコア (下段：Pixel 10 Proなら余裕で収まる) */}
      <div className="bg-white/5 py-3 px-4 overflow-x-auto scrollbar-hide shrink-0 border-t border-white/5">
        <table className="w-full text-center">
          <thead>
            <tr className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
              <th className="text-left pl-2 w-16">TEAM</th>
              {innings.map(i => <th key={i} className={cn("w-6", state.inning === i && "text-primary")}>{i}</th>)}
              <th className="w-8 border-l border-white/10">R</th>
            </tr>
          </thead>
          <tbody className="text-xs font-black italic tabular-nums">
            <tr>
              <td className="text-left pl-2 text-[10px] not-italic text-zinc-400">GUEST</td>
              {innings.map(i => <td key={i} className="text-zinc-600">{state.opponentInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-white/10 text-zinc-300">{state.opponentScore}</td>
            </tr>
            <tr>
              <td className="text-left pl-2 text-[10px] not-italic text-primary">HOME</td>
              {innings.map(i => <td key={i} className={cn(state.inning === i && "text-primary/80")}>{state.myInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-white/10 text-primary">{state.myScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}