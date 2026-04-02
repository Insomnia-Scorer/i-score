// src/app/api/auth.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✨ 解決策: 認証ライブラリに渡す前にカスタムの /me を定義！
// フロントエンドの Header.tsx が期待するデータをここで返します。
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/me', async (c) => {
  const auth = getAuth(c.env.DB, c.env)

  // 1. ヘッダーのトークン/クッキーから現在のセッションを取得
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  // 未ログインの場合は 401 を返す
  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  // 💡 session.user を any にキャストすることで、
  // adminプラグインが追加した 'role' にアクセスできるようにします。
  const userWithRole = session.user as any;

  // 2. フロントエンドの UserSession 型に合わせてデータを整形して返す
  return c.json({
    success: true,
    data: {
      id: userWithRole.id,
      name: userWithRole.name,
      email: userWithRole.email,
      // 💡 R2アバターAPI連携: ユーザーの画像URLをセット！
      // (Better Auth 標準の image フィールドにURLが入っている想定、なければ R2 のパスを組み立てる)
      avatarUrl: userWithRole.image || `/api/images/avatars/${userWithRole.id}.png`,
      role: userWithRole.role, 
      systemRole: userWithRole.role,
      // ※チーム情報は別途D1から引くか、一旦空配列(またはモック)でエラーを防ぎます
      memberships: [],
    }
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 既存の認証ライブラリ用ハンドラー
// ※ 上の /me に一致しなかったもの（ログイン・ログアウト等）はここを通ります
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.all('/*', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  return auth.handler(c.req.raw)
})

export default app
