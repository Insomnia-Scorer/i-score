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

// 試合テーブル
export const matches = sqliteTable("matches", {
    // 💡 idはランダムな文字列（UUIDやCUID）を使用
    id: text("id").primaryKey(),
    // フォームで入力する項目
    teamId: text('team_id').notNull().references(() => teams.id), // どのチームの試合かを紐づけ
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

// 💡 打席（At Bat）テーブル
export const atBats = sqliteTable("at_bats", {
    id: text("id").primaryKey(),
    matchId: text("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }), // 試合が消えたら連動して消える

    inning: integer("inning").notNull(), // 何回か (1, 2, 3...)
    isTop: integer("is_top", { mode: "boolean" }).notNull(), // 表(true)か裏(false)か

    batterName: text("batter_name"), // 打者の名前（将来的に選手マスタと紐づけることも可能）

    // 打席の結果（打席が完了した時に記録）
    // 例: 'strikeout', 'walk', 'single', 'ground_out' など
    result: text("result"),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// 💡 1球ごとの投球（Pitch）テーブル
export const pitches = sqliteTable("pitches", {
    id: text("id").primaryKey(),
    atBatId: text("at_bat_id").notNull().references(() => atBats.id, { onDelete: "cascade" }),

    pitchNumber: integer("pitch_number").notNull(), // その打席の何球目か (1, 2, 3...)

    // 投球の結果
    // 例: 'ball', 'strike_looking'(見逃し), 'strike_swinging'(空振り), 'foul', 'in_play' など
    result: text("result").notNull(),

    // 投球前のカウント状態（分析用）
    ballsBefore: integer("balls_before").notNull().default(0),
    strikesBefore: integer("strikes_before").notNull().default(0),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// 💡 新規追加：チームを管理するテーブル
export const teams = sqliteTable('teams', {
    id: text('id').primaryKey(), // チームID
    name: text('name').notNull(), // チーム名（例：川崎中央シニアA）
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 💡 新規追加：ユーザーとチームを紐づける中間テーブル
// 「Aさんは、川崎シニアでは監督(manager)だけど、別のチームでは保護者(viewer)」という管理が可能になります。
export const teamMembers = sqliteTable('team_members', {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id),
    userId: text('user_id').notNull().references(() => user.id),
    role: text('role').notNull(), // 💡 ここにチーム内での権限（manager, scorerなど）が入ります
    joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
});

export const schema = {
    user,
    session,
    account,
    verification,
    matches,
    atBats,
    pitches,
    teams,
    teamMembers,
};
