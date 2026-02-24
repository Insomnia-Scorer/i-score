// src/app/api/auth/[...all]/route.ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { getAuth } from "@/lib/auth"

export const runtime = 'edge' // 💡 これがCloudflareで動かす肝です

const app = new Hono<{ Bindings: { DB: D1Database } }>().basePath('/api/auth')

app.all('/*', async (c) => {
  // 💡 Honoのハンドラーなら、c.env.DB が直接取れる可能性が極めて高い
  const auth = getAuth(c.env.DB, c.env)
  return auth.handler(c.req.raw)
})

export const GET = handle(app)
export const POST = handle(app)
