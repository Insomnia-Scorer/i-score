// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
// 💡 重要：better-auth 本体ではなく、クッキー操作専用の軽量ツールだけを使う
import { getSessionCookie } from "better-auth/cookies";

export const runtime = "edge"; // experimental-edge より edge が安定します

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 公開パスの定義
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");

  // 2. 通行証（Cookie）の有無だけを確認（DB接続をしない！）
  const sessionCookie = getSessionCookie(request);

  // ケース1：未ログイン ＋ 公開パス以外
  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ケース2：ログイン済み ＋ 公開パス（逆流防止）
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ⚠️ ロール（Admin）判定について
  // Middleware でロールを厳密にチェックしようとすると DB 接続が必要になり、サイズが爆発します。
  // 管理者画面の「認可」は、/admin/page.tsx 内の Server Component で行うのが Edge のセオリーです。
  if (isAdminPath && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
