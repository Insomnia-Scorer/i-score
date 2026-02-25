import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { matches } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// 試合一覧取得
app.get('/api/matches', async (c) => {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).orderBy(desc(matches.createdAt))
    return c.json(result)
})

// 試合詳細取得
app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()

    if (!result) {
        return c.json({ error: 'Match not found' }, 404)
    }
    return c.json(result)
})

// 試合の新規作成
app.post('/api/matches', async (c) => {
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
        // Hono のミドルウェアやルーティングをバイパスすることで CPU 時間を節約
        return env.ASSETS.fetch(request)
    }
}
