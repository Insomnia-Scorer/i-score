// filepath: src/api/matches/update-score.ts
/* 💡 iScoreCloud 規約: 
   1. 試合データ更新(D1)とLINE速報(Messaging API)をアトミックに実行する。
   2. チーム設定で `isAutoReportEnabled` が ON の場合のみ送信する。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { matches } from '@/db/schema/match';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import { sendLinePushMessage } from '@/lib/line/push';
import { formatMatchLineReport } from '@/lib/utils/format-sns';
import type { WorkerEnv } from '@/types/api';

const matchesApi = new Hono<{ Bindings: WorkerEnv }>();

matchesApi.post('/update-score', async (c) => {
  const db = drizzle(c.env.DB);
  const { matchId, homeScore, awayScore, inning, isBottom, action } = await c.req.json();

  try {
    // 1. 試合情報を更新
    await db.update(matches)
      .set({ homeScore, awayScore, currentInning: inning, isBottom })
      .where(eq(matches.id, matchId));

    // 2. チームの設定（LINEグループID等）を取得するために紐付け
    // 💡 試合データからホームチームの情報を取得
    const matchData = await db.select().from(matches).where(eq(matches.id, matchId)).get();
    const teamData = await db.select().from(teams).where(eq(teams.id, matchData.homeTeamId)).get();

    // 3. LINE速報の条件判定（設定がONで、グループIDがある場合）
    if (teamData?.lineGroupId && teamData.isAutoReportEnabled) {
      const message = formatMatchLineReport(
        teamData.name,
        "対戦相手", // 本来は matchData から相手チーム名を取得
        { home: homeScore, away: awayScore },
        { number: inning, isBottom },
        action,
        'live'
      );

      // 非同期でLINE送信（試合更新のレスポンスを待たせない）
      c.executionCtx.waitUntil(
        sendLinePushMessage(teamData.lineGroupId, message, c.env.LINE_CHANNEL_ACCESS_TOKEN)
      );
    }

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: "更新失敗" }, 500);
  }
});

export default matchesApi;
