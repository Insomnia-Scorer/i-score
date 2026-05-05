// filepath: src/app/test/page.tsx
/* 💡 iScoreCloud 規約: 
   1. 他のAPIと足並みを揃え、リソースID (teamId) はPOSTボディで送信する。
   2. 脱・グラスモーフィズム。現場視認性を最優先したソリッドUI。
   3. APIユニットの責務分離規約に基づき、更新専用エンドポイント /update-line を使用。 */

"use client";

import React, { useState } from "react";
import { LineSettingsCard } from "@/components/features/teams/line-settings-card";
import { TeamSettingsUpdatePayload, TeamSettingsUpdateResponse } from "@/api/teams/update-settings";

export default function LineIntegrationTestPage() {
  const [status, setStatus] = useState<string | null>(null);

  // 💡 テスト用 ID (DBに存在するチームIDを指定してください)
  const testTeamId = "test-team-001";

  /**
   * 🌟 保存処理ハンドラ
   * URLパラメータではなく、ボディに全ての情報を詰め込む「iScoreCloud標準プロトコル」
   */
  const handleSave = async (settings: { lineGroupId: string; isAutoReportEnabled: boolean }) => {
    setStatus("⏳ D1へ送信中...");

    // 💡 規約: Payload型に基づきボディを作成
    const payload: TeamSettingsUpdatePayload = {
      teamId: testTeamId,
      lineGroupId: settings.lineGroupId,
      isAutoReportEnabled: settings.isAutoReportEnabled,
    };

    try {
      // 💡 規約: パスは固定 (/api/teams/update-line)
      const res = await fetch("/api/teams/update-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 💡 規約: レスポンスを明示的に型キャスト
      const data = (await res.json()) as TeamSettingsUpdateResponse;

      if (data.success) {
        setStatus(`✅ 保存完了! (Updated: ${data.data?.updatedId})`);
      } else {
        // API側で「no such column」ヒントを出すようにしているので、そのまま表示
        setStatus(`❌ エラー: ${data.error}`);
      }
    } catch (err) {
      setStatus("❌ ネットワークエラー: Workerの起動またはエンドポイントを確認してください");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 max-w-md mx-auto">
      <header className="space-y-2 pt-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">
          LINE Integration
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block">
          D1 POST Body Protocol
        </p>
      </header>

      <main className="space-y-6">
        {/* 現場視認性重視のカード */}
        <LineSettingsCard
          teamId={testTeamId}
          initialGroupId=""
          initialIsEnabled={false}
          // @ts-ignore: テスト用。LineSettingsCard側のonSave型定義に合わせて調整
          onSave={handleSave}
        />

        {/* 実行結果のソリッド表示エリア */}
        {status && (
          <div className="bg-secondary p-5 rounded-[30px] border-2 border-border animate-in fade-in slide-in-from-bottom-2 shadow-sm">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">System Status</p>
            <p className="font-mono text-xs font-bold text-primary break-all leading-relaxed">
              {status}
            </p>
          </div>
        )}
      </main>

      <footer className="pt-12 text-center opacity-30">
        <p className="text-[10px] font-black italic tracking-widest uppercase">
          iScoreCloud Quality Assurance
        </p>
      </footer>
    </div>
  );
}