// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = async (req: Request, ctx: any) => {
    const env = ctx.env;

    if (!env?.DB) {
        return new Response("D1 Database (DB) not found in env", { status: 500 });
    }

    const auth = getAuth(env.DB);
    const authHandler = toNextJsHandler(auth);

    // 💡 リクエストのメソッド（GET/POSTなど）に合わせて適切なハンドラーを呼び出す
    const method = req.method.toUpperCase();

    // TypeScriptの型エラーを回避しつつ、メソッドを振り分けます
    if (method === "GET") return authHandler.GET(req);
    if (method === "POST") return authHandler.POST(req);
    if (method === "PATCH") return authHandler.PATCH(req);
    if (method === "PUT") return authHandler.PUT(req);
    if (method === "DELETE") return authHandler.DELETE(req);

    return new Response("Method Not Allowed", { status: 405 });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
