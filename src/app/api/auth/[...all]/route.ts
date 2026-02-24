// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Hono } from 'hono';
import { getAuth } from "@/lib/auth";

const app = new Hono<{ Bindings: { DB: D1Database } }>().basePath('/api/auth');

// 共通のハンドラー
const handler = async (req: Request) => {
  // 💡 OpenNext が注入するグローバルな env を直接参照
  const env = (process.env as any) || (globalThis as any).env;
  const d1 = env?.DB;

  if (!d1) {
    return new Response(JSON.stringify({
      error: "D1_BINDING_MISSING",
      availableKeys: Object.keys(env || {})
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const auth = getAuth(d1, env);
  return auth.handler(req);
};

// Next.js の各メソッドからこのハンドラーを呼ぶ
export const GET = handler;
export const POST = handler;