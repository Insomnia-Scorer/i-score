// filepath: src/app/test/page.tsx
/* 💡 iScoreCloud 規約: 
   1. 現場視認性重視。脱・グラスモーフィズムのソリッドなUI。
   2. update-settings.ts の型をインポートし、型安全な通信を行う。 */

"use client";

import React, { useState } from "react";
import { LineSettingsCard } from "@/components/features/teams/line-settings-card";
import { TeamSettingsUpdatePayload, TeamSettingsUpdateResponse } from "@/api/teams/update-settings";

export default function LineIntegrationTestPage() {
  const [status, setStatus] = useState<string | null>(null);

  // 💡 テスト用 ID（DBに存在するID、またはシードデータを使用）
  const testTeamId = "test-team-001";

  const handleSave = async (settings: { lineGroupId: string; isAutoReportEnabled: boolean }) => {
    setStatus("⏳ D1へ書き込み中...");

    const payload: TeamSettingsUpdatePayload = {
      teamId: testTeamId,
      lineGroupId: settings.lineGroupId,
      isAutoReportEnabled: settings.isAutoReportEnabled,
    };

    try {
      const res = await fetch("/api/teams/update-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 💡 規約: インターフェースによる型キャスト
      const data = (await res.json()) as TeamSettingsUpdateResponse;

      if (data.success) {
        setStatus(`✅ 保存完了! (TeamID: ${data.data?.updatedId})`);
      } else {
        setStatus(`❌ 保存失敗: ${data.error}`);
      }
    } catch (err) {
      setStatus("❌ ネットワークエラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 max-w-md mx-auto">
      <header className="space-y-2 pt-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">
          D1 Persistence Test
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block">
          Drizzle ORM Connection
        </p>
      </header>

      <main className="space-y-6">
        <LineSettingsCard 
          teamId={testTeamId}
          initialGroupId="" 
          initialIsEnabled={false}
          // @ts-ignore: テスト用。実際はコンポーネント側のProps型と一致させる
          onSave={handleSave}
        />

        {status && (
          <div className="bg-secondary p-5 rounded-[30px] border-2 border-border animate-in fade-in slide-in-from-bottom-2 shadow-sm">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Database Status</p>
            <p className="font-mono text-xs font-bold text-primary break-all leading-relaxed">
              {status}
            </p>
          </div>
        )}
      </main>

      <footer className="pt-12 text-center opacity-40">
        <p className="text-[10px] font-black italic tracking-widest uppercase">
          iScoreCloud System Test Protocol
        </p>
      </footer>
    </div>
  );
}
