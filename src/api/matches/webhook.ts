// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers で実行。
   2. Messaging API Webhook を受け取り、groupId を安全に抽出する。
   3. パス（pathname）判定を行い、404エラーを回避する。 */

import { LineWebhookRequest } from "@/types/match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string; // 💡 Cloudflare Secrets に設定済み
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 💡 404回避ロジック: リクエストのパスが正しいか厳密にチェック
    if (url.pathname !== "/api/matches/webhook") {
      return new Response("Not Found", { status: 404 });
    }

    // 💡 Webhook は LINE 側からの POST リクエストのみ受け付ける
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 💡 規約: src/types/match.ts の型定義を使用して明示的にキャスト
      const body = (await request.json()) as LineWebhookRequest;

      // LINE側からの「検証（Verification）」リクエストを考慮
      if (!body.events || body.events.length === 0) {
        return new Response("OK", { status: 200 });
      }

      for (const event of body.events) {
        // 🌟 グループ内でのイベント（メッセージや招待）から groupId を抽出
        if (event.source.type === 'group' && event.source.groupId) {
          const capturedGroupId = event.source.groupId;
          
          // 現場デバッグ用ログ（wrangler tail で確認）
          console.log(`[iScoreCloud] Target Group ID: ${capturedGroupId}`);

          // 🧪 「ID」というメッセージに反応して返信するデバッグ機能
          if (
            event.type === 'message' && 
            event.message?.type === 'text' && 
            event.message.text === 'ID'
          ) {
            await fetch("https://api.line.me/v2/bot/message/reply", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: "text",
                    text: `【iScoreCloud システム通知】\nCaptured Group ID:\n${capturedGroupId}`
                  }
                ],
              }),
            });
          }
        }
      }

      return new Response("OK", { status: 200 });

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Webhook processing failed";
      console.error("[iScoreCloud Webhook Error]:", errorMsg);
      return new Response("Internal Error", { status: 500 });
    }
  },
};
