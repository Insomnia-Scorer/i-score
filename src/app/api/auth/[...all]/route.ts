// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge"; // ここでEdgeを指定

const handler = async (req: Request) => {
    // 1. まず process.env.DB を見る
    // 2. なければ req.context.env.DB を見る
    // 3. どちらもなければ ctx から探す
    const env = (process.env as any) || (req as any).context?.env;

    if (!env?.DB) {
        // デバッグ用：何が取れているかログに出す（Cloudflareのログで見れます）
        console.error("Available env keys:", Object.keys(process.env || {}));
        return new Response("D1 Database binding (DB) not found. Check wrangler.jsonc", { status: 500 });
    }

    const auth = getAuth(env.DB);
    const authHandler = toNextJsHandler(auth);

    if (req.method === "GET") return authHandler.GET(req);
    if (req.method === "POST") return authHandler.POST(req);
    
    return new Response("Method not allowed", { status: 405 });
};

export const GET = handler;
export const POST = handler;
