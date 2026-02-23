// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// 💡 審判（Next.js）の指示通りに書き換え
export const runtime = "experimental-edge"; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 公開パスの定義
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");

  // 2. Cookie の有無を「標準機能」だけでチェック
  // .get("名前") で取得。better-auth の標準トークン名を確認してください
  const sessionToken = request.cookies.get("better-auth.session_token");

  // 未ログイン ＋ 公開パス以外
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済み ＋ 公開パス（逆流防止）
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 管理者パスの簡易ガード
  if (isAdminPath && !sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 静的ファイルやAPIを除外する設定
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
