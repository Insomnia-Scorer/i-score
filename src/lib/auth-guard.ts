// src/lib/auth-guard.ts
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 💡 Workers 環境では、ビルド設定によって env が process.env に注入されます
export async function requireSession() {
  // Workers 用の DB バインディング取得
  // (もしこれで見つからない場合は、引数で env を渡す構造にする必要があります)
  const db = (process.env as any).DB as D1Database;

  if (!db) {
    console.error("D1 Database 'DB' is not bound to process.env");
    throw new Error("Database connection failed");
  }

  const auth = getAuth(db);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}