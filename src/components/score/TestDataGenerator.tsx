// src/components/score/TestDataGenerator.tsx
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { DatabaseZap } from "lucide-react";
import { toast } from "sonner";

export function TestDataGenerator() {
  const { state, recordInPlay } = useScore();

  const generateScenario = async () => {
    if (!state.matchId) {
      toast.error("Match IDが見つかりません。初期化後に実行してください。");
      return;
    }

    toast.loading("ドラマチックな試合データを生成中...");

    try {
      // 1. 1回表：先制点 (2点)
      await recordInPlay("2-run Home Run", 2, []);
      
      // 2. 3回裏：相手の反撃 (1点)
      // ※ Contextの仕様上、isTopを切り替える必要がありますが、
      // ここでは簡易的に現在の攻撃側にスコアを足していきます。
      await recordInPlay("RBI Single", 1, []);
      
      // 3. 4回表：追加点 (3点)
      await recordInPlay("Bases-clearing Double", 3, []);

      // 4. ダミーログの直接挿入（APIを叩く）
      await fetch(`/api/matches/${state.matchId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          inningText: "5回裏",
          resultType: "out",
          description: "4-6-3のダブルプレー！ピンチを凌ぐ！",
        }),
      });

      toast.success("テストデータの注入が完了しました！");
      // 画面をリロードして反映
      window.location.reload();
    } catch (e) {
      toast.error("生成に失敗しました");
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[200]">
      <Button 
        onClick={generateScenario}
        variant="destructive"
        className="rounded-full shadow-2xl gap-2 font-black italic animate-pulse"
      >
        <DatabaseZap className="h-4 w-4" />
        DEBUG: FILL DATA
      </Button>
    </div>
  );
}
