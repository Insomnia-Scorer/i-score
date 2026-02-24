import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// その他の API
app.get('/api/hello', (c) => {
    return c.json({ message: 'Hello from Hono!' })
})

// 静的資産へのフォールバック
app.all('*', async (c) => {
    return c.env.ASSETS.fetch(c.req.raw)
})

export default app
