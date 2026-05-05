// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. API ユニットの責務分離規約に基づき、Payload と Response 型を明示的に export する。
   2. フロントエンド（Next.js）での型安全なインポートを保証する。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsUpdateSettings = new Hono<{ Bindings: WorkerEnv }>();

/** 🌟 エラー解消の鍵：明示的に export をつける */
export interface TeamSettingsUpdatePayload {
  teamId: string;
  lineGroupId: string;
  isAutoReportEnabled: boolean;
}

/** 🌟 レスポンス型も export して共有 */
export interface TeamSettingsUpdateResponse {
  success: boolean;
  data?: { updatedId: string };
  error?: string;
}

// 💡 既存の POST ハンドラ
teamsUpdateSettings.post('/update-line', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const body = (await c.req.json()) as TeamSettingsUpdatePayload;
    const { teamId, lineGroupId, isAutoReportEnabled } = body;

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
    const errorMsg = err instanceof Error ? err.message : "Update Failed";
    const res: TeamSettingsUpdateResponse = { success: false, error: errorMsg };
    return c.json(res, 500);
  }
});

export default teamsUpdateSettings;