// src/app/actions/match.ts
"use server";

import { db } from "@/db"; // 💡 D1データベースのインスタンスをインポート（環境に合わせてパスを調整してください）
import { matches } from "@/db/schema";

export async function createMatchAction(data: {
    opponent: string;
    date: string;
    location?: string;
    matchType: string;
    battingOrder: string;
}) {
    try {
        // 💡 Cloudflare Workers でも動く標準の UUID 生成
        const matchId = crypto.randomUUID();

        // D1 データベースへ挿入
        await db.insert(matches).values({
            id: matchId,
            opponent: data.opponent,
            date: data.date,
            location: data.location || null, // 空文字の場合は null に
            matchType: data.matchType,
            battingOrder: data.battingOrder,
            status: "scheduled",
        });

        return { success: true, matchId };
    } catch (error) {
        console.error("試合の作成に失敗しました:", error);
        return { success: false, error: "データベースの保存に失敗しました" };
    }
}