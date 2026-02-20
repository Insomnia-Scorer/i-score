import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

export const auth = (env: { DB: D1Database }) => betterAuth({
    database: drizzleAdapter(drizzle(env.DB), {
        provider: "sqlite", // D1は内部的にSQLite
    }),
    emailAndPassword: {
        enabled: true
    }
});

