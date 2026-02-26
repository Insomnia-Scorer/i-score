// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
// 💡 新しく作った teams, teamMembers をインポートに追加
import { user, matches, atBats, pitches, teams, teamMembers } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
// 💡 ROLES を追加
import { canEditScore, canManageTeam, ROLES } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// ==========================================
// 💡 共通ヘルパー：ユーザーの【チーム内での権限】を取得する関数
// ==========================================
async function getTeamRole(db: any, userId: string, teamId: string) {
    const member = await db.select().from(teamMembers)
        .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))).get()
    return member?.role
}

// ==========================================
// 💡 新規追加：チーム管理 API
// ==========================================

// 1. 自分が所属しているチーム一覧を取得
app.get('/api/me/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    // 自分が所属しているチームをJOINして取得
    const myTeams = await db.select({
        id: teams.id,
        name: teams.name,
        role: teamMembers.role, // そのチームでの自分の権限
        joinedAt: teamMembers.joinedAt
    }).from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, session.user.id))
        .orderBy(desc(teams.createdAt))

    return c.json(myTeams)
})

// 2. 新しいチームを作成する
app.post('/api/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const teamId = crypto.randomUUID()
    const memberId = crypto.randomUUID()

    try {
        // チームを作成
        await db.insert(teams).values({
            id: teamId,
            name: body.name,
            createdAt: new Date(),
        })
        // 作成者を「監督 (manager)」として自動登録！
        await db.insert(teamMembers).values({
            id: memberId,
            teamId: teamId,
            userId: session.user.id,
            role: ROLES.MANAGER,
            joinedAt: new Date()
        })
        return c.json({ success: true, teamId })
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Failed to create team' }, 500)
    }
})

// 3. 特定のチームの試合一覧を取得
app.get('/api/teams/:teamId/matches', async (c) => {
    const teamId = c.req.param('teamId')
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    // そのチームのメンバーかどうかをチェック
    const role = await getTeamRole(db, session.user.id, teamId)
    if (!role) return c.json({ error: 'このチームのデータにアクセスする権限がありません' }, 403)

    const result = await db.select().from(matches)
        .where(eq(matches.teamId, teamId)) // 💡 そのチームの試合だけに絞り込む
        .orderBy(desc(matches.createdAt))
    return c.json(result)
})

// 4. 特定のチームに紐づく試合を作成
app.post('/api/teams/:teamId/matches', async (c) => {
    const teamId = c.req.param('teamId')
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    const role = await getTeamRole(db, session.user.id, teamId)

    // 💡 そのチームでスコア編集権限を持っているかチェック
    if (!canEditScore(role)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    const matchId = crypto.randomUUID()

    try {
        await db.insert(matches).values({
            id: matchId,
            teamId: teamId, // 💡 追加：どのチームの試合かを記録
            opponent: body.opponent,
            date: body.date,
            location: body.location || null,
            matchType: body.matchType,
            battingOrder: body.battingOrder,
            status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) {
        return c.json({ success: false, error: 'Failed to create match' }, 500)
    }
})

// ==========================================
// 既存の試合詳細・スコア記録 API
// ==========================================

// 試合詳細の取得（スコア画面用）
app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()
    if (!result) return c.json({ error: 'Match not found' }, 404)
    return c.json(result)
})

// 1球ごとの記録（ピッチング）を保存するAPI
app.post('/api/matches/:id/pitches', async (c) => {
    const matchId = c.req.param('id')
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)

    // 💡 まず対象の試合を取得して、どのチームの試合かを特定する
    const match = await db.select().from(matches).where(eq(matches.id, matchId)).get()
    if (!match) return c.json({ error: 'Match not found' }, 404)

    // 💡 そのチームでの権限をチェック
    const role = await getTeamRole(db, session.user.id, match.teamId)
    if (!canEditScore(role)) return c.json({ error: 'スコアを記録する権限がありません' }, 403)

    const body = await c.req.json()

    try {
        let currentAtBat = await db.select().from(atBats)
            .where(and(eq(atBats.matchId, matchId), eq(atBats.inning, body.inning), eq(atBats.isTop, body.isTop), isNull(atBats.result))).get()

        if (!currentAtBat) {
            const atBatId = crypto.randomUUID()
            await db.insert(atBats).values({ id: atBatId, matchId, inning: body.inning, isTop: body.isTop })
            currentAtBat = { id: atBatId, matchId, inning: body.inning, isTop: body.isTop, batterName: null, result: null, createdAt: new Date() }
        }

        const pitchId = crypto.randomUUID()
        await db.insert(pitches).values({
            id: pitchId, atBatId: currentAtBat.id, pitchNumber: body.pitchNumber,
            result: body.result, ballsBefore: body.ballsBefore, strikesBefore: body.strikesBefore,
        })

        if (body.atBatResult) {
            await db.update(atBats).set({ result: body.atBatResult }).where(eq(atBats.id, currentAtBat.id))
        }

        return c.json({ success: true, pitchId, atBatId: currentAtBat.id })
    } catch (e) {
        return c.json({ success: false, error: 'Failed to record pitch' }, 500)
    }
})

// ユーザー一覧（※これも本来は「チーム内のユーザー一覧」に変える必要がありますが、一旦保留します）
app.get('/api/users', async (c) => {
    const db = drizzle(c.env.DB)
    const allUsers = await db.select().from(user).orderBy(desc(user.createdAt))
    return c.json(allUsers)
})

app.get('/api/hello', (c) => c.json({ message: 'Hello from Hono!' }))

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
        return env.ASSETS.fetch(request)
    }
}