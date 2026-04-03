// src/app/api/auth.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { teams, teamMembers } from '@/db/schema/team'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌟 権限名（ロール）を日本語ラベルに変換するヘルパー関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getRoleLabel = (role: string) => {
  switch (role.toUpperCase()) {
    case 'MANAGER': return '監督 / 代表';
    case 'COACH': return 'コーチ';
    case 'SCORER': return 'スコアラー';
    case 'STAFF': return 'スタッフ';
    case 'PLAYER': return '選手';
    default: return 'メンバー';
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✨ カスタム /me エンドポイント（D1データベース完全連携版）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/me', async (c) => {
  const auth = getAuth(c.env.DB, c.env)

  // 1. セッションの取得
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const userWithRole = session.user as any;
  const db = drizzle(c.env.DB);

  // 2. ⚾️ Drizzle ORMで所属チームをDBから取得！
  // team_members と teams をJOINし、自分が所属している(activeな)チームを取得
  const userTeams = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      role: teamMembers.role,
      status: teamMembers.status,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, userWithRole.id),
        eq(teamMembers.status, "active") // 承認済みのメンバーのみ
      )
    );

  // 3. フロントエンドが期待する形に整形
  const memberships = userTeams.map((t, index) => ({
    teamId: t.teamId,
    teamName: t.teamName,
    role: t.role,
    roleLabel: getRoleLabel(t.role),
    // 💡 とりあえず一番最初に取得できたチームをメインチームとして扱います
    isMainTeam: index === 0 
  }));

  // 4. クライアントへ返却
  return c.json({
    success: true,
    data: {
      id: userWithRole.id,
      name: userWithRole.name,
      email: userWithRole.email,
      avatarUrl: userWithRole.image || `/api/images/avatars/${userWithRole.id}.png`,
      
      role: userWithRole.role,
      systemRole: userWithRole.role,

      // 🔥 DBから取得した本物のチームデータを渡す！
      memberships: memberships,
    }
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 既存の認証ライブラリ用ハンドラー
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.all('/*', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  return auth.handler(c.req.raw)
})

export default app
