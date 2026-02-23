// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/d1';

export const getDb = () => {
  // 💡 プランA（純正）では、環境変数プロセスから直接 DB を取得できる構成が一般的です
  // もし getRequestContext を使う場合は 'next/dist/server/web/spec-extension/adapters/request-cookies' などが必要ですが、
  // 最もシンプルなのは以下の形です。
  
  const db = process.env.DB as unknown as D1Database;
  
  if (!db) {
    throw new Error("D1 database binding 'DB' not found.");
  }
  
  return drizzle(db);
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