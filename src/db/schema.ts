// src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    role: text("role").notNull().default("user"),
    banned: integer("banned", { mode: "boolean" }), // 💡 ユーザー停止フラグ
    banReason: text("ban_reason"),                 // 💡 停止理由
    banExpires: integer("ban_expires", { mode: "timestamp" }), // 💡 停止期限
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const matches = sqliteTable("matches", {
    // 💡 idはランダムな文字列（UUIDやCUID）を使用
    id: text("id").primaryKey(),

    // フォームで入力する項目
    opponent: text("opponent").notNull(), // 対戦相手
    date: text("date").notNull(), // 試合日 (YYYY-MM-DD形式)
    location: text("location"), // 場所（任意なので notNull を外す）
    matchType: text("match_type").notNull(), // 'practice' または 'official'
    battingOrder: text("batting_order").notNull(), // 'first'(先攻) または 'second'(後攻)

    // 試合の進行状態を管理するカラム（後々スコア入力画面で使います）
    status: text("status").notNull().default("scheduled"), // 'scheduled', 'in_progress', 'finished'

    // 作成日時
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

export const schema = {
    user,
    session,
    account,
    verification,
    matches
};