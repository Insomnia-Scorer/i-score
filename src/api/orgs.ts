import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { organizations, organizationMembers, teams } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

app.get('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    const myOrgs = await db.select({
        id: organizations.id,
        name: organizations.name,
        myRole: organizationMembers.role,
    })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(eq(organizationMembers.userId, session.user.id))
        .orderBy(desc(organizations.createdAt))

    return c.json(myOrgs)
})

app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const orgId = crypto.randomUUID()

    try {
        await db.insert(organizations).values({
            id: orgId,
            name: body.name,
            createdAt: new Date(),
        })

        await db.insert(organizationMembers).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: session.user.id,
            role: 'OWNER',
            createdAt: new Date(),
        })

        return c.json({ success: true, orgId })
    } catch (e) {
        console.error("組織作成エラー:", e)
        return c.json({ success: false, error: 'Failed to create organization' }, 500)
    }
})

app.get('/:orgId/teams', async (c) => {
    const orgId = c.req.param('orgId')
    const db = drizzle(c.env.DB)

    const orgTeams = await db.select()
        .from(teams)
        .where(eq(teams.organizationId, orgId))
        .orderBy(desc(teams.createdAt))

    return c.json(orgTeams)
})

export default app