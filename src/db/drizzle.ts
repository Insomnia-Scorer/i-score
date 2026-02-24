// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/d1';

export const getDb = () => {
  // 💡 実行時の process.env を直接参照する
  // 実行時（リクエスト時）であれば、Workersが注入した D1 がここに入っています
  const d1 = (process.env as any).DB as D1Database;

  if (!d1) {
    throw new Error("D1 database binding 'DB' not found in process.env. Check wrangler.jsonc.");
  }

  return drizzle(d1);
};


/*
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
*/