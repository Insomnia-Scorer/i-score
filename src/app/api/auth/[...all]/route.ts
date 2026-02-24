// src/app/api/auth/[...all]/route.ts
export const dynamic = 'force-dynamic';
import { getAuth } from "@/lib/auth";

const handler = async (req: Request) => {
  // 1. 標準的な取得（一応残す）
  const processEnv = process.env as any;
  let d1 = (globalThis as any).env?.DB || processEnv?.DB;

  // 💡 2. 真の解決策: OpenNextの内部ストレージから強制取得
  if (!d1) {
    const als = (globalThis as any).__openNextAls;
    if (als) {
      // OpenNext v3+ の内部コンテキストにアクセス
      const store = als.getStore();
      d1 = store?.env?.DB;
    }
  }

  // 💡 3. 最後の手段: リクエストオブジェクトに隠されている場合がある
  if (!d1) {
    d1 = (req as any).context?.env?.DB;
  }

  if (!d1) {
    // これでダメなら、もはや Cloudflare 側のバインディング自体が死んでいます
    return new Response(JSON.stringify({
      error: "CRITICAL_D1_MISSING",
      hint: "Dashboard > Settings > Bindings で DB が存在するか、再度目視してください。",
      alsDetected: !!(globalThis as any).__openNextAls
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const auth = getAuth(d1, processEnv);
  return auth.handler(req);
};

export const GET = handler;
export const POST = handler;