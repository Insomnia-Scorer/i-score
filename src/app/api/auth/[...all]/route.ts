// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = async (req: Request, context: any) => {
  // 💡 OpenNext + Next.js 15 における D1 取得の全パターンを網羅
  const d1 = 
    (process.env as any).DB ||           // パターン1: 標準env
    context?.env?.DB ||                  // パターン2: OpenNextのコンテキスト
    (globalThis as any).env?.DB ||       // パターン3: グローバル
    (req as any).context?.env?.DB;       // パターン4: リクエスト内継承

  if (!d1) {
    // 🔍 犯人探しのための最終手段：何が届いているか全部出す
    const debugInfo = {
      hasProcessEnvDB: !!(process.env as any).DB,
      hasContextEnvDB: !!context?.env?.DB,
      contextKeys: Object.keys(context || {}),
      envKeys: Object.keys((process.env) || {}),
    };
    return new Response(`D1 NOT FOUND. Debug: ${JSON.stringify(debugInfo)}`, { status: 500 });
  }
  const auth = getAuth(d1);
  const authHandler = toNextJsHandler(auth);

  // 💡 ここが修正ポイントです
  // authHandler は { GET, POST, ... } というオブジェクトなので、
  // リクエストのメソッドに応じて適切な関数を呼び出します
  const method = req.method.toUpperCase();
  
  // 型安全にメソッドを特定して実行
  if (method in authHandler) {
    return (authHandler as any)[method](req);
  }

  return new Response(`Method ${method} Not Allowed`, { status: 405 });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;