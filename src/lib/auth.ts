// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1"; // D1用drizzle
import * as schema from "@/db/schema"; // schema全体をインポート

let authCache: ReturnType<typeof betterAuth> | null = null;
let lastD1: D1Database | null = null;

export const getAuth = (d1: D1Database, env?: any) => {
  // 💡 パフォーマンス最適化: ID が同じならキャッシュを返す (CPU 制限対策)
  if (authCache && lastD1 === d1) {
    return authCache;
  }

  const db = drizzle(d1);
  authCache = betterAuth({
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    session: {
      expiresIn: 60 * 10,
      updateAge: 60 * 1,
    },
    plugins: [
      admin(),
    ],
    socialProviders: {
      ...(env?.GOOGLE_CLIENT_ID ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        },
      } : {}),
      ...(env?.LINE_CLIENT_ID ? {
        line: {
          clientId: env.LINE_CLIENT_ID,
          clientSecret: env.LINE_CLIENT_SECRET || "",
        },
      } : {}),
    }
  });

  lastD1 = d1;
  return authCache;
};
