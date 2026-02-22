// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1"; // D1用drizzle
import * as schema from "@/db/schema"; // schema全体をインポート

// 💡 関数化して、外部から D1 インスタンスを受け取れるようにします
export const getAuth = (d1: D1Database) => {
  // D1 インスタンスを Drizzle インスタンスに変換
  const db = drizzle(d1);

  return betterAuth({
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    // 防衛ライン③: セッション管理
    session: {
      expiresIn: 60 * 10, 
      updateAge: 60 * 1, 
    },
    // 防衛ライン④: 認可 (Role管理)
    plugins: [
      admin(),
      nextCookies(),
    ],
    socialProviders: {
      google: {
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
      line: {
          clientId: process.env.LINE_CLIENT_ID || "",
          clientSecret: process.env.LINE_CLIENT_SECRET || "",
      }
    }
  });
};
