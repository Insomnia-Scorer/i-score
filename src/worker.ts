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
