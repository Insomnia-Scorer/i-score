// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { user, teams, teamMembers, matches, atBats, pitches } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
import { canEditScore, canManageTeam } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// ==========================================
// 💡 チーム管理 API
// ==========================================

// 💡 自分の所属チーム一覧を取得
app.get('/api/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    // teamMembers テーブルを経由して、自分が所属しているチーム情報とロールを取得
    const myTeams = await db.select({
        id: teams.id,
        name: teams.name,
        myRole: teamMembers.role,
        isFounder: eq(teams.createdBy, session.user.id) // 自分が発起人かどうかのフラグ
    })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, session.user.id))
        .orderBy(desc(teams.createdAt))

    return c.json(myTeams)
})

// 💡 チームの新規作成（作成時に自分のロールを指定）
app.post('/api/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const teamId = crypto.randomUUID()

    try {
        // トランザクションに近い形で、チーム作成とメンバー登録を連続で行う
        await db.insert(teams).values({
            id: teamId,
            name: body.name,
            createdBy: session.user.id,
            createdAt: new Date(),
        })

        await db.insert(teamMembers).values({
            id: crypto.randomUUID(),
            teamId: teamId,
            userId: session.user.id,
            role: body.role || 'scorer', // 画面から選ばれたロール（デフォルトはスコアラー）
            joinedAt: new Date(),
        })

        return c.json({ success: true, teamId })
    } catch (e) {
        console.error("チーム作成エラー:", e)
        return c.json({ success: false, error: 'Failed to create team' }, 500)
    }
})

// 💡 チームの所属選手一覧を取得するAPI（背番号順に並べて返します）
app.get('/api/teams/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    try {
        // CASTを使って、背番号を数字として正しく並び替えます（例：1, 2, 10 の順）
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM players WHERE team_id = ? ORDER BY CAST(uniform_number AS INTEGER) ASC`
        ).bind(teamId).all();

        return c.json(results);
    } catch (e) {
        console.error("選手取得エラー:", e);
        return c.json({ error: '選手の取得に失敗しました' }, 500);
    }
});

// 💡 チームに新しい選手を登録するAPI
app.post('/api/teams/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const playerId = crypto.randomUUID();

    try {
        // データベースに背番号と名前を保存
        await c.env.DB.prepare(
            `INSERT INTO players (id, team_id, name, uniform_number, created_at) VALUES (?, ?, ?, ?, ?)`
        ).bind(playerId, teamId, body.name, body.uniformNumber, Date.now()).run();

        return c.json({ success: true, id: playerId });
    } catch (e) {
        console.error("選手登録エラー:", e);
        return c.json({ error: '選手の登録に失敗しました' }, 500);
    }
});

// ==========================================
// 💡 試合関連 API
// ==========================================

// 💡 試合一覧取得（※特定のチームに絞り込む）
app.get('/api/matches', async (c) => {
    const teamId = c.req.query('teamId')
    if (!teamId) return c.json({ error: 'Team ID is required' }, 400)

    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches)
        .where(eq(matches.teamId, teamId))
        .orderBy(desc(matches.createdAt))
    return c.json(result)
})

// 💡 試合詳細取得
app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()
    if (!result) return c.json({ error: 'Match not found' }, 404)
    return c.json(result)
})

// 💡 試合の新規作成（※teamId と season を必須に！）
app.post('/api/matches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    // 💡 ひとまずシステム全体の権限でチェック（後ほどチーム内の権限チェックに進化させます）
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    if (!body.teamId || !body.season) return c.json({ error: 'Team ID and Season are required' }, 400)

    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()

    try {
        await db.insert(matches).values({
            id: matchId,
            teamId: body.teamId,             // 💡 追加
            season: body.season,             // 💡 追加
            opponentTeamId: body.opponentTeamId || null, // 💡 追加（任意）
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

// 💡 1球ごとの記録（ピッチング）保存
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

// 💡 試合終了（ステータス更新）API
app.patch('/api/matches/:id/finish', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    const db = drizzle(c.env.DB)

    try {
        await db.update(matches)
            .set({
                status: 'completed', // ステータスを「完了」に変更
            })
            .where(eq(matches.id, matchId))

        return c.json({ success: true })
    } catch (e) {
        console.error("試合終了エラー:", e)
        return c.json({ success: false, error: '試合の終了処理に失敗しました' }, 500)
    }
})

// 💡 Undo（1球戻る）のための、最後の投球削除API
app.delete('/api/matches/:id/pitches/last', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')

    try {
        // 💡 D1の生SQL機能を使って、この試合の最新の1球だけを狙い撃ちで削除！
        await c.env.DB.prepare(`
            DELETE FROM pitches 
            WHERE id = (
                SELECT id FROM pitches 
                WHERE matchId = ? 
                ORDER BY createdAt DESC 
                LIMIT 1
            )
        `).bind(matchId).run()

        return c.json({ success: true })
    } catch (e) {
        console.error("Undoエラー:", e)
        return c.json({ success: false, error: '削除に失敗しました' }, 500)
    }
})

// ==========================================
// 💡 ユーザー管理 API
// ==========================================
app.get('/api/users', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canManageTeam(userRole)) return c.json({ error: '権限がありません' }, 403)
    const db = drizzle(c.env.DB)
    const allUsers = await db.select().from(user).orderBy(desc(user.createdAt))
    return c.json(allUsers)
})

app.patch('/api/users/:id/role', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canManageTeam(userRole)) return c.json({ error: '権限がありません' }, 403)
    const targetUserId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    try {
        await db.update(user).set({ role: body.role }).where(eq(user.id, targetUserId))
        return c.json({ success: true })
    } catch (e) {
        return c.json({ success: false, error: '更新に失敗しました' }, 500)
    }
})

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
        return env.ASSETS.fetch(request)
    }
}