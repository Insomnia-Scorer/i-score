// src/app/(auth)/login/page.tsx
import React from "react";
import { LoginForm } from "@/components/login-form";

/**
 * 💡 ログイン画面
 * - ロゴ不要、スクロールなしのシンプルで美しいカードデザイン。
 * - 認証レイアウト(AuthLayout)内で中央配置されます。
 */
export default function LoginPage() {
  return (
    <div className="w-full p-8 rounded-[40px] bg-card/60 backdrop-blur-2xl border border-border/50 shadow-2xl flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">

      {/* 🌟 タイトルエリア（ロゴ画像の代わり） */}
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary">
          i-Score
        </h1>
        <p className="text-sm text-muted-foreground font-bold tracking-widest">
          PLAY BALL!
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-center text-xs font-medium text-muted-foreground">
          SNSアカウントで安全にサインイン
        </p>
        {/* 💡 実際のログイン処理（SNSボタン等）は既存の LoginForm コンポーネントに委譲 */}
        <LoginForm />
      </div>

    </div>
  );
}