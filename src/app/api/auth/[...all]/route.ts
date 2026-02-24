// src/app/api/auth/[...all]/route.ts
//export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export default {
  async fetch(request: Request, env: any) {
    const d1 = env.DB;
    const auth = getAuth(d1);
    const authHandler = toNextJsHandler(auth);

    const method = request.method.toUpperCase();
    
    // 型安全にメソッドを特定して実行
    if (method in authHandler) {
      return (authHandler as any)[method](request);
    }

    return new Response(`Method ${method} Not Allowed`, { status: 405 });
  }
}
