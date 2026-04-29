// filepath: `src/components/score/TestDataGenerator.tsx`
"use client";

import { Button } from "@/components/ui/button";
import { DatabaseZap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function TestDataGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");

  const generateScenario = async () => {
    if (!matchId) {
      toast.error("URLに試合IDが見つかりません (?id=xxx を確認してください)");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("DBにドラマチックな展開を直接注入中...");

    try {
      // 💡 1. スコアデータを直接API経由で上書き
      // ※ エンドポイント名はプロジェクトの構成に合わせて適宜調整してください
      const scoreRes = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inning: 7,
          isTop: false,
          myScore: 3,
          opponentScore: 5,
          myInningScores: [0, 1, 0, 0, 2, 0, 0],
          opponentInningScores: [2, 0, 0, 3, 0, 0, 0],
          balls: 3,
          strikes: 2,
          outs: 2,
          // 走者状態の強制注入
          runners: {
            base1: { id: "p1", name: "鈴木" },
            base2: { id: "p2", name: "佐藤" },
            base3: { id: "p3", name: "田中" },
          }
        }),
      });

      if (!scoreRes.ok) throw new Error("スコア更新に失敗しました");

      // 💡 2. 熱い実況ログも直接注入
      await fetch(`/api/matches/${matchId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inningText: "7回裏",
          resultType: "info",
          description: "🔥 2死満塁！一打逆転の絶好機！(iscorecloud.com Debug)",
        }),
      });

      toast.dismiss(loadingToast);
      toast.success("データ注入完了！戦況をロードします...");
      
      // 💡 3. DBが変わったので、強制リロードして Context を再起動させる
      setTimeout(() => {
        window.location.reload();
      }, 800);
      
    } catch (e) {
      console.error(e);
      toast.dismiss(loadingToast);
      toast.error("APIエラー: DBへの注入に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateScenario}
      disabled={isGenerating}
      variant="destructive"
      className="h-10 px-4 rounded-xl shadow-xl border border-white/20 bg-red-600 hover:bg-red-500 text-white font-black italic gap-2 animate-pulse active:scale-95 transition-all"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      FILL DATA
    </Button>
  );
}
