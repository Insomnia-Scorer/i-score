// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: Cloudflare Workers で実行。
   グループ招待時や特定のメッセージに反応して groupId を抽出する。 */

import { LineWebhookRequest, LinePostResponse } from "@/types/match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string; // 💡 wrangler secret 設定済み
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("OK", { status: 200 });

    try {
      // 💡 規約: Interface を定義し、明示的な型キャストを行う
      const body = (await request.json()) as LineWebhookRequest;

      for (const event of body.events) {
        // 1. グループに招待された場合、またはメッセージが来た場合
        if (event.source.type === 'group' && event.source.groupId) {
          const targetId = event.source.groupId;

          // 💡 現場デバッグ用: ログに出力（wrangler tail で確認可能）
          console.log(`🔥 Captured Group ID: ${targetId}`);

          // 2. 「ID」というメッセージに反応して、その場でIDを返信する（確認用）
          if (event.type === 'message' && event.message?.text === 'ID') {
            await fetch("https://api.line.me/v2/bot/message/reply", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: "text", text: `このグループのIDは:\n${targetId}` }],
              }),
            });
          }
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err: unknown) {
      console.error("Webhook Error:", err);
      return new Response("Internal Error", { status: 500 });
    }
  },
};
