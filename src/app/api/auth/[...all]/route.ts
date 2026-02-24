// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Hono } from 'hono';
import { handle } from 'hono/vercel'; // Next.js App Routerとの互換性のために使用
import { getAuth } from "@/lib/auth";

// 型定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api/auth');

// 全ての認証リクエストをHonoが受け取る
app.all('/*', async (c) => {
  // Honoのコンテキスト (c.env) からは確実に DB が取得できます
  const auth = getAuth(c.env.DB);
  
  // Better Auth のハンドラーを実行
  return auth.handler(c.req.raw);
});