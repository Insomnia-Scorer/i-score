// filepath: src/api/matches/post-line.ts
/* 💡 iScoreCloud 規約: Cloudflare Workers で実行。
   APIレスポンスはInterfaceを定義し明示的な型キャストを行う。 */

import { Match, LinePostResponse } from "@/types/match";
import { generateMatchReport } from "@/lib/utils/format-match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
      // 💡 規約: チーム固有の targetGroupId を受け取る
      const body = (await request.json()) as { match: Match; targetGroupId: string };
      const { match, targetGroupId } = body;

      if (!targetGroupId) throw new Error("送信先グループが設定されていません");

      const reportText = generateMatchReport(match);

      // 🌟 指定されたグループIDへ Push 送信
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: targetGroupId, // 💡 ここで Aチーム/Bチーム のグループを切り替え
          messages: [{ type: "text", text: reportText }],
        }),
      });

      const result = (await response.json()) as any;
      
      const resData: LinePostResponse = {
        success: response.ok,
        messageId: result.sentMessages?.[0]?.id,
        error: response.ok ? undefined : result.message
      };

      return Response.json(resData);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Internal Error";
      return Response.json({ success: false, error: msg }, { status: 500 });
    }
  },
};
