import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Cloudflare Workers の環境型定義
export interface Env {
  DB: D1Database;  // wrangler.toml で定義した binding 名
}

// Drizzle ORM インスタンスを作成する関数
export function getDB(env: Env) {
  return drizzle(env.DB);
}

export const db = async () => {
    try {
        return (getDB(getCloudflareContext().env as any));
    } catch (e) {
        console.error(e)
        return null
    }
}
