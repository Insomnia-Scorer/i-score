// src/lib/auth-guard.ts
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

// 💡 headers は呼び出し元の Server Component から引数として受け取る
export async function requireSession(headerList: Headers) {
  // Workers 環境での D1 取得
  const db = (process.env as any).DB as D1Database;

  if (!db) {
    console.error("D1 Database 'DB' is not bound to process.env");
    throw new Error("Database connection failed");
  }

  const auth = getAuth(db);

  // 引数で受け取った headerList を使用
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(headerList: Headers) {
  // session 取得時にも headerList を引き継ぐ
  const session = await requireSession(headerList);

  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}