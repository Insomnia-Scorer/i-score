// src/app/action/match.ts
"use server";

import { getDb } from "@/db/drizzle";
import { matches } from "@/db/schema";

/**
 * 💡 試合作成のサーバーアクション
 * 注意: 現在の構成 (output: 'export') ではサーバーアクションは利用できません。
 * 本機能は Hono API (/api/matches) 経由で実装されています。
 */
export async function createMatchAction(data: {
    opponent: string;
    date: string;
    location?: string;
    matchType: string;
    battingOrder: string;
}) {
    try {
        const db = getDb();
        const matchId = crypto.randomUUID();

        await db.insert(matches).values({
            id: matchId,
            opponent: data.opponent,
            date: data.date,
            location: data.location || null,
            matchType: data.matchType,
            battingOrder: data.battingOrder,
            status: "scheduled",
        });

        return { success: true, matchId };
    } catch (error) {
        console.error("Failed to create match:", error);
        return { success: false, error: "データベースへの保存に失敗しました" };
    }
}
