// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. パスパラメータ :teamId を使用して対象チームを特定する。
   2. Hono の c.req.param() を活用。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsUpdateSettings = new Hono<{ Bindings: WorkerEnv }>();

// 🌟 修正：エンドポイントをパスパラメータ方式に変更
teamsUpdateSettings.post('/:teamId/line', async (c) => {
  const db = drizzle(c.env.DB);
  const teamId = c.req.param('teamId'); // 💡 URLからIDを抽出

  try {
    const body = await c.req.json();
    
    await db.update(teams)
      .set({ 
        lineGroupId: body.lineGroupId?.trim() || null, 
        isAutoReportEnabled: body.isAutoReportEnabled ?? false 
      })
      .where(eq(teams.id, teamId)); // 💡 パラメータのIDを使用

    return c.json({ success: true, data: { updatedId: teamId } });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "DB Error";
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

export default teamsUpdateSettings;
