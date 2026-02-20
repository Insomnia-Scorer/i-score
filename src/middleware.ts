// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    // セッションがあるかチェック（非常に軽量な処理です）
    const sessionCookie = getSessionCookie(request);
    
    // ログインしていないのに保護されたページに行こうとしたらリダイレクト
    // 例: /dashboard などを守る場合
    if (!sessionCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"], // 保護したいパスを指定
};