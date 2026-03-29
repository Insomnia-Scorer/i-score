// src/worker.ts
import { Hono } from 'hono'
import authRoute from './app/api/auth'
import orgsRoute from './app/api/orgs'
import teamsRoute from './app/api/teams'
import matchesRoute from './app/api/matches'
import adminRoute from './app/api/admin'
import imagesRouter from './app/api/images'
import seed from './app/api/seed'
import tournaments from './app/api/tournaments'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// 💡 整理整頓された美しいルーティング（各ファイルを特定パスにマウント）
app.route('/api/auth', authRoute)
app.route('/api/organizations', orgsRoute)
app.route('/api/teams', teamsRoute)
app.route('/api/matches', matchesRoute)
app.route('/api/admin', adminRoute)
app.route('/api/images', imagesRouter)
app.route('/api/seed', seed)
app.route('/api/tournaments', tournaments)

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
        return env.ASSETS.fetch(request)
    }
}
