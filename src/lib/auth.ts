// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

// auth 本体をエクスポートするのではなく、envを受け取ってbetterAuthを返す関数を作る
export const getAuth = (db: D1Database) => betterAuth({
    database: drizzleAdapter(drizzle(db), {
        provider: "sqlite",
        schema: {
            ...schema,
        },
    }),
    emailAndPassword: {
        enabled: true
    }
});
