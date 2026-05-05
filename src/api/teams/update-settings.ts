// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers + Drizzle ORM で実装。
   2. チーム設定（lineGroupId, isAutoReportEnabled）を D1 に保存。
   3. API ユニットの責務分離規約に基づき、更新（Write）に特化する。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsUpdateSettings = new Hono<{ Bindings: WorkerEnv }>();

/** 💡 リクエストペイロードの型定義 */
export interface TeamSettingsUpdatePayload {
  teamId: string;
  lineGroupId: string;
  isAutoReportEnabled: boolean;
}

/** 💡 レスポンスの型定義 */
export interface TeamSettingsUpdateResponse {
  success: boolean;
  data?: { updatedId: string };
  error?: string;
}

// 🌟 POST /api/teams/update-line へのマウントを想定
teamsUpdateSettings.post('/update-line', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const body = (await c.req.json()) as TeamSettingsUpdatePayload;
    const { teamId, lineGroupId, isAutoReportEnabled } = body;

    // 💡 現場対応：空文字は null として保存し、連携解除を可能にする
    await db.update(teams)
      .set({ 
        lineGroupId: lineGroupId.trim() || null, 
        isAutoReportEnabled: isAutoReportEnabled,
      })
      .where(eq(teams.id, teamId));

    const res: TeamSettingsUpdateResponse = { 
      success: true, 
      data: { updatedId: teamId } 
    };
    return c.json(res);

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "D1 Update Failed";
    console.error(`[D1 Error]: ${errorMsg}`);
    const res: TeamSettingsUpdateResponse = { success: false, error: errorMsg };
    return c.json(res, 500);
  }
});

export default teamsUpdateSettings;
