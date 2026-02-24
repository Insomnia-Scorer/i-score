// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getAuth } from "@/lib/auth";

const app = new Hono<{ Bindings: { DB: D1Database; [key: string]: any } }>().basePath('/api/auth');

app.all('/*', async (c) => {
  // c.env を渡すことで、D1 とソーシャルログインの ID 類を両方解決
  const auth = getAuth(c.env.DB, c.env);
  return auth.handler(c.req.raw);
});

export const GET = handle(app);
export const POST = handle(app);