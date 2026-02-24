// src/app/api/auth/[...all]/route.ts
export const dynamic = 'force-dynamic';
import { getAuth } from "@/lib/auth";

const handler = async (req: Request) => {
  // 💡 パターンA: Workersネイティブのグローバル変数から取得
  // 💡 パターンB: Node.js互換レイヤーの process.env から取得
  // 💡 パターンC: OpenNextがリクエストに紐付けたコンテキストから取得
  
  const globalEnv = (globalThis as any).env;
  const processEnv = process.env as any;
  
  // D1を探す (優先順位: グローバル > process.env)
  const d1 = globalEnv?.DB || processEnv?.DB;

  if (!d1) {
    // 最終手段：OpenNextの内部ストレージ（AsyncLocalStorage）を覗き見る
    const als = (globalThis as any).__openNextAls;
    const store = als?.getStore();
    const finalD1 = store?.env?.DB || (req as any).context?.env?.DB;

    if (!finalD1) {
      return new Response(JSON.stringify({
        error: "D1_BINDING_MISSING",
        message: "Wrangler recognizes DB, but OpenNext dropped it.",
        availableGlobalKeys: Object.keys(globalThis).filter(k => k.includes('env') || k.startsWith('__')),
        availableProcessKeys: Object.keys(processEnv).filter(k => !k.startsWith('NEXT_'))
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // 見つかった場合はそれを使用
    const auth = getAuth(finalD1, processEnv);
    return auth.handler(req);
  }

  const auth = getAuth(d1, processEnv);
  return auth.handler(req);
};

export const GET = handler;
export const POST = handler;