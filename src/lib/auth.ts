// src/lib/auth.ts
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  // 防衛ライン②: メール/パスワード認証のみ許可
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  // 防衛ライン③: セッション管理 (自動ログアウト)
  session: {
    expiresIn: 60 * 10, // 10分 (seconds)
    updateAge: 60 * 1, // 1分ごとに有効期限を更新
  },
  // 防衛ライン④: 認可 (Role管理)
  // NextAuthのように手動で型拡張せずとも、プラグインを入れるだけで完了
  plugins: [
    admin(),
    nextCookies(), // 常に配列の最後に配置
  ],
});


/*
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
*/