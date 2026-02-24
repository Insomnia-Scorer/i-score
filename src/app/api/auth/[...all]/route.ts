// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getAuth } from "@/lib/auth";

const app = new Hono<{ Bindings: { DB: D1Database } }>().basePath('/api/auth');

app.all('/*', async (c) => {
  const auth = getAuth(c.env.DB, c.env);
  return auth.handler(c.req.raw);
});

// 各メソッドを個別にエクスポート（Next.jsの制約）
const h = handle(app);
export const GET = h;
export const POST = h;
export const PATCH = h;
export const PUT = h;
export const DELETE = h;