// filepath: src/app/test/page.tsx
/* 💡 iScoreCloud 規約: 
   1. 現場視認性を重視したソリッドなテストページ。
   2. API ユニットの責務分離規約に基づき、update-line エンドポイントを叩く。 */

"use client";

import React, { useState } from "react";
import { LineSettingsCard } from "@/components/features/teams/line-settings-card";
import { TeamSettingsUpdatePayload, TeamSettingsUpdateResponse } from "@/api/teams/update-settings";
import { usePathname } from "next/navigation";

export default function LineIntegrationTestPage() {
  const [lastResult, setLastResult] = useState<string | null>(null);

  // 💡 テスト用の固定チームID（本番では params 等から取得）
  const testTeamId = "test-team-001";

  /**
   * 🌟 保存処理ハンドラ
   * API ユニットの責務分離規約に従い、update-settings.ts の型定義を使用する。
   */
  const handleSave = async (settings: { lineGroupId: string; isAutoReportEnabled: boolean }) => {
    setLastResult("保存中...");

    const payload: TeamSettingsUpdatePayload = {
      teamId: testTeamId,
      lineGroupId: settings.lineGroupId,
      isAutoReportEnabled: settings.isAutoReportEnabled,
    };

    try {
      // 💡 規約: 整理整頓された API ルートを叩く
      const res = await fetch("/api/teams/update-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 💡 規約: レスポンスを明示的に型キャスト
      const data = (await res.json()) as TeamSettingsUpdateResponse;

      if (data.success) {
        setLastResult(`✅ 保存成功! (ID: ${data.data?.updatedId})`);
      } else {
        setLastResult(`❌ エラー: ${data.error}`);
      }
    } catch (error) {
      setLastResult("❌ 通信エラーが発生しました");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 max-w-md mx-auto">
      <header className="space-y-2 pt-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">
          LINE Integration Test
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/20 inline-block px-2 py-1 rounded">
          Development Mode: D1 Connection
        </p>
      </header>

      <main className="space-y-6">
        {/* 💡 現場視認性重視のソリッドな設定カード */}
        <LineSettingsCard 
          teamId={testTeamId}
          initialGroupId="" 
          initialIsEnabled={false}
          // @ts-ignore: テスト用にプロパティを渡す
          onSave={handleSave}
        />

        {/* 💡 実行結果のフィードバックエリア（脱・グラスモーフィズム） */}
        {lastResult && (
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs font-black uppercase text-primary mb-1">Execution Status</p>
            <p className="font-mono text-sm break-all">{lastResult}</p>
          </div>
        )}
      </main>

      <footer className="pt-12 text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
          iScoreCloud Protocol v1.0
        </p>
      </footer>
    </div>
  );
}
