import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 公開パスの定義
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");

  // 2. Cookie の有無を「標準機能」だけでチェック
  // better-auth のデフォルト名は "better-auth.session_token" です
  const sessionToken = request.cookies.get("better-auth.session_token");

  // ケース1：未ログイン ＋ 公開パス以外
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ケース2：ログイン済み ＋ 公開パス（逆流防止）
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 管理者パスの簡易ガード（詳細な判定は Server Component で！）
  if (isAdminPath && !sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};