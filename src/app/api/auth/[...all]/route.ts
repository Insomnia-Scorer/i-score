// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge";

// Next.js 15 + Cloudflare Pages で env を確実に捕まえる書き方
const handler = async (req: Request, ctx: any) => {
    // 執念で env を探す：ctx.context (Pages) または ctx (Workers)
    const env = ctx.context?.env || ctx.env || (process.env as any);

    if (!env?.DB) {
        console.error("Critical: D1 Database not found in any context.");
        return new Response("D1 Binding Missing", { status: 500 });
    }

    const auth = getAuth(env.DB);
    const authHandler = toNextJsHandler(auth);

    // Better Auth は内部でパスを解決するので、メソッドさえ合わせればOK
    if (req.method === "GET") return authHandler.GET(req);
    if (req.method === "POST") return authHandler.POST(req);
    
    return new Response("Method not allowed", { status: 405 });
};

export const GET = handler;
export const POST = handler;
