// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
// 💡 user テーブルを新しくインポートに追加
import { user, matches, atBats, pitches } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
// 💡 canManageTeam を新しくインポートに追加
import { canEditScore, canManageTeam } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// ==========================================
// 💡 ユーザー管理 API（管理者）
// ==========================================

// 1. ユーザー一覧の取得
app.get('/api/users', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    
    // チーム管理権限（admin, manager）がない場合は弾く
    if (!session || !canManageTeam(userRole)) {
        return c.json({ error: '権限がありません' }, 403)
    }

    const db = drizzle(c.env.DB)
    const allUsers = await db.select().from(user).orderBy(desc(user.createdAt))
    return c.json(allUsers)
})

// 2. ユーザーの権限（ロール）の更新
app.patch('/api/users/:id/role', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    
    if (!session || !canManageTeam(userRole)) {
        return c.json({ error: '権限がありません' }, 403)
    }

    const targetUserId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        await db.update(user)
            .set({ role: body.role })
            .where(eq(user.id, targetUserId))
        return c.json({ success: true })
    } catch (e) {
        console.error("権限更新エラー:", e)
        return c.json({ success: false, error: '更新に失敗しました' }, 500)
    }
})

// ==========================================
// 既存の試合・スコア関連 API
// ==========================================

app.get('/api/matches', async (c) => {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).orderBy(desc(matches.createdAt))
    return c.json(result)
})

app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()
    if (!result) return c.json({ error: 'Match not found' }, 404)
    return c.json(result)
})

app.post('/api/matches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()

    try {
        await db.insert(matches).values({
            id: matchId, opponent: body.opponent, date: body.date,
            location: body.location || null, matchType: body.matchType,
            battingOrder: body.battingOrder, status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) {
        return c.json({ success: false, error: 'Failed to create match' }, 500)
    }
})

app.post('/api/matches/:id/pitches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

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

app.get('/api/hello', (c) => c.json({ message: 'Hello from Hono!' }))

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
        return env.ASSETS.fetch(request)
    }
}
