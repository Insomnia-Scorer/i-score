// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
// 💡 atBats と pitches を追加でインポートします
import { matches, atBats, pitches } from '@/db/schema'
// 💡 and と isNull を追加でインポートします
import { desc, eq, and, isNull } from 'drizzle-orm'

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

// 💡 【新規追加】1球ごとの記録（ピッチング）を保存するAPI
app.post('/api/matches/:id/pitches', async (c) => {
    const matchId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        // 1. まず、現在の「進行中の打席（resultが空）」を探す
        let currentAtBat = await db.select().from(atBats)
            .where(
                and(
                    eq(atBats.matchId, matchId),
                    eq(atBats.inning, body.inning),
                    eq(atBats.isTop, body.isTop),
                    isNull(atBats.result) // まだ結果が出ていない（進行中）の打席
                )
            ).get()

        // 2. もし進行中の打席がなければ、新しく「打席」を開始する
        if (!currentAtBat) {
            const atBatId = crypto.randomUUID()
            await db.insert(atBats).values({
                id: atBatId,
                matchId: matchId,
                inning: body.inning,
                isTop: body.isTop,
            })
            // 後続の処理のために仮のオブジェクトを作っておく
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

        // 3. その打席に対して、今回の「1球」を記録する
        const pitchId = crypto.randomUUID()
        await db.insert(pitches).values({
            id: pitchId,
            atBatId: currentAtBat.id,
            pitchNumber: body.pitchNumber, // その打席の何球目か
            result: body.result, // 'strike', 'ball', 'foul' など
            ballsBefore: body.ballsBefore, // 投げる前のボールカウント
            strikesBefore: body.strikesBefore, // 投げる前のストライクカウント
        })

        // 打席が終わった場合（三振や四球など）は、打席テーブルの結果も更新する
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
