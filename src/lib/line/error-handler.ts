// filepath: src/lib/line/error-handler.ts
/* 💡 iScoreCloud 規約: 
   1. LINE API の複雑なエラーを、スコアラーが直感的に理解できるメッセージに変換する。 */

export function parseLineError(status: number, errorBody: string): string {
  try {
    const error = JSON.parse(errorBody);
    const message = error.message || "";

    // 💡 現場でよくあるケースの切り分け
    if (status === 401) return "【認証エラー】LINEのアクセストークンが無効です。設定を見直してください。";
    if (status === 400 && message.includes("property 'to'")) return "【設定エラー】グループIDの形式が正しくありません。";
    if (status === 403) return "【権限エラー】Botがグループに招待されていないか、Push権限がありません。";
    if (status === 429) return "【制限エラー】メッセージ送信数が上限に達しました。";

    return `【LINE APIエラー】${message} (Status: ${status})`;
  } catch {
    return `【通信エラー】LINEサーバーからの応答が不正です (Status: ${status})`;
  }
}
