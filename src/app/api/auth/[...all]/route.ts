// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = async (req: Request, ctx: any) => {
    // ctx.context.env (Pages) または ctx.env (Workers) から取得
    const env = ctx.context?.env || ctx.env;

    if (!env?.DB) {
        return new Response("D1 Database not found", { status: 500 });
    }

    const auth = getAuth(env.DB);
    const authHandler = toNextJsHandler(auth);

    // リクエストのメソッドに合わせて GET または POST を呼び出す
    if (req.method === "GET") return authHandler.GET(req);
    if (req.method === "POST") return authHandler.POST(req);
    
    return new Response("Method not allowed", { status: 405 });
};

export const GET = handler;
export const POST = handler;