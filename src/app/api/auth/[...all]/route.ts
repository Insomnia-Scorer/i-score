// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Next.js 15 + Cloudflare の標準的な書き方
const handler = async (req: Request, ctx: any) => {
    // CloudflareのBinding (DB) は ctx.context.env に入っています
    const auth = getAuth(ctx.context.env.DB);
    return toNextJsHandler(auth).GET(req);
};

export const GET = handler;
export const POST = handler;
