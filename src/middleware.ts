// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "experimental-edge"; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");

  // 💡 修正の核心：HTTPS環境とHTTP環境の両方のCookie名に対応
  const sessionToken = 
    request.cookies.get("__Secure-better-auth.session_token") || 
    request.cookies.get("better-auth.session_token");

  // 未ログイン ＋ 公開パス以外 ＝ ログイン画面へ
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済み ＋ 公開パス（逆流防止） ＝ トップへ
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 管理者パスのガード
  if (isAdminPath && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 💡 Better-AuthのAPI処理自体をMiddlewareが邪魔しないよう、api/auth も除外リストに含めるのが安全です
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};