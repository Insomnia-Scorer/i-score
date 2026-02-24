// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = async (req: Request, context: any) => {
// 💡 Cloudflareの公式なやり方：context.params ではなく、第2引数そのものが env を含む場合があります
  // または、Next.js 15 ならば globalThis 経由で取得できる場合があります
  const env = (process.env as any).DB ? process.env : (context as any).env;
  const d1 = env?.DB;

  if (!d1) {
    // 最終手段：デバッグ用に env の中身を文字列化して出す
    const keys = Object.keys(process.env).join(", ");
    return new Response(`DB not found. Available keys: ${keys}`, { status: 500 });
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