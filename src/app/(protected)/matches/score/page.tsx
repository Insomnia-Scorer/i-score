// filepath: `src/components/score/TestDataGenerator.tsx`
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { DatabaseZap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation"; // 💡 追加
import { toast } from "sonner";

export function TestDataGenerator() {
  const { updateScore } = useScore();
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id"); // 💡 URLから直接取得

  const generateScenario = async () => {
    // 💡 state.matchId の代わりに URL の ID をチェック
    if (!matchId) {
      toast.error("URLに試合IDが含まれていません");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("熱戦のデータを注入中...");

    try {
      /**
       * 💡 7回裏 2死満塁シナリオ
       */
      await updateScore({
        matchId: matchId, // 💡 IDを明示的に指定
        inning: 7,
        isTop: false,
        myScore: 3,
        opponentScore: 5,
        myInningScores: [0, 1, 0, 0, 2, 0, 0],
        opponentInningScores: [2, 0, 0, 3, 0, 0, 0],
        runners: {
          base1: { id: "p1", name: "鈴木" },
          base2: { id: "p2", name: "佐藤" },
          base3: { id: "p3", name: "田中" },
        },
        balls: 3,
        strikes: 2,
        outs: 2
      });

      // ログの生成
      await fetch(`/api/matches/${matchId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inningText: "7回裏",
          resultType: "info",
          description: "🔥 2死満塁！一打逆転の絶好機！",
        }),
      });

      toast.dismiss(loadingToast);
      toast.success("ドラマチックな展開を生成しました！");
      
      // 💡 確実に反映させるため、少し待ってからリロード
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (e) {
      console.error(e);
      toast.dismiss(loadingToast);
      toast.error("データ生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateScenario}
      disabled={isGenerating}
      variant="destructive"
      className="h-12 px-6 rounded-xl shadow-lg border border-white/20 bg-red-600 hover:bg-red-500 text-white font-black italic gap-2 animate-pulse active:scale-90 transition-all"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      FILL DATA
    </Button>
  );
}
