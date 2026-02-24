// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = async (req: Request) => {
  const d1 = (process.env as any).DB as D1Database;

  if (!d1) {
    return new Response("D1 Database (DB) not found in process.env", { status: 500 });
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