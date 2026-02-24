// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// OpenNextがグローバルに注入する型定義（必要に応じて）
declare global {
  var env: {
    DB: D1Database;
    [key: string]: any;
  };
}

const handler = async (req: Request, context: any) => {
// 💡 外部ライブラリを使わない D1 取得の決定版
  // OpenNext (opennextjs-cloudflare) は Workers の `env` を
  // globalThis.env または process.env にマッピングしようとします。
  const d1 = (process.env as any).DB || (globalThis as any).env?.DB;

  if (!d1) {
    // デバッグ情報を詳細化
    const debug = {
      hasProcessEnv: !!process.env,
      hasGlobalEnv: !!(globalThis as any).env,
      processEnvKeys: Object.keys(process.env || {}),
      globalEnvKeys: (globalThis as any).env ? Object.keys((globalThis as any).env) : [],
    };
    return new Response(`D1 NOT FOUND. Debug: ${JSON.stringify(debug)}`, { status: 500 });
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