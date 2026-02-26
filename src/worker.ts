// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { matches, atBats, pitches } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
// 💡 先ほど作った権限チェック関数をインポート！
import { canEditScore } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// 試合一覧取得（※閲覧は全員OK）
app.get('/api/matches', async (c) => {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).orderBy(desc(matches.createdAt))
    return c.json(result)
})

// 試合詳細取得（※閲覧は全員OK）
app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()

    if (!result) {
        return c.json({ error: 'Match not found' }, 404)
    }
    return c.json(result)
})

// 💡 試合の新規作成（※権限チェック追加！）
app.post('/api/matches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    
    // スコア編集権限（admin, manager, coach, scorer）がない場合は弾く
    if (!session || !canEditScore(session.user.role)) {
        return c.json({ error: '試合を作成する権限がありません' }, 403)
    }

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()

    try {
        await db.insert(matches).values({
            id: matchId,
            opponent: body.opponent,
            date: body.date,
            location: body.location || null,
            matchType: body.matchType,
            battingOrder: body.battingOrder,
            status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) {
        console.error(e)
        return c.json({ success: false, error: 'Failed to create match' }, 500)
    }
})

// 💡 1球ごとの記録（ピッチング）を保存するAPI（※権限チェック追加！）
app.post('/api/matches/:id/pitches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    
    // スコア編集権限がない場合は弾く
    if (!session || !canEditScore(session.user.role)) {
        return c.json({ error: 'スコアを記録する権限がありません' }, 403)
    }

    const matchId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        let currentAtBat = await db.select().from(atBats)
            .where(
                and(
                    eq(atBats.matchId, matchId),
                    eq(atBats.inning, body.inning),
                    eq(atBats.isTop, body.isTop),
                    isNull(atBats.result) // まだ結果が出ていない（進行中）の打席
                )
            ).get()

        if (!currentAtBat) {
            const atBatId = crypto.randomUUID()
            await db.insert(atBats).values({
                id: atBatId,
                matchId: matchId,
                inning: body.inning,
                isTop: body.isTop,
            })
            currentAtBat = { 
                id: atBatId, 
                matchId, 
                inning: body.inning, 
                isTop: body.isTop, 
                batterName: null, 
                result: null, 
                createdAt: new Date() 
            }
        }

        const pitchId = crypto.randomUUID()
        await db.insert(pitches).values({
            id: pitchId,
            atBatId: currentAtBat.id,
            pitchNumber: body.pitchNumber,
            result: body.result,
            ballsBefore: body.ballsBefore,
            strikesBefore: body.strikesBefore,
        })

        if (body.atBatResult) {
             await db.update(atBats)
                .set({ result: body.atBatResult })
                .where(eq(atBats.id, currentAtBat.id))
        }

        return c.json({ success: true, pitchId, atBatId: currentAtBat.id })
    } catch (e) {
        console.error("ピッチ記録エラー:", e)
        return c.json({ success: false, error: 'Failed to record pitch' }, 500)
    }
})

// その他の API
app.get('/api/hello', (c) => {
    return c.json({ message: 'Hello from Hono!' })
})

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)

        // API リクエストの場合のみ Hono を起動
        if (url.pathname.startsWith('/api/')) {
            return app.fetch(request, env, ctx)
        }

        // それ以外（静的資産など）は直接 ASSETS 経由で返却
        return env.ASSETS.fetch(request)
    }
}
