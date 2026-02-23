// src/app/page.tsx
"use client";
import { createAuthClient } from "better-auth/react";

export default function Home() {
    // クライアント側でBetter Authを操作するためのツール
    const authClient = createAuthClient();

    const signUp = async () => {
        await authClient.signUp.email({
            email: "test@example.com",
            password: "password1234",
            name: "不眠スコアラー",
        });
        alert("登録完了！D1を確認してみてください！");
    };

    return (
        <main style={{ padding: "2rem" }}>
            <h1>i-Score 認証テスト</h1>
            <button onClick={signUp} style={{ padding: "1rem", cursor: "pointer" }}>
                テストユーザーでサインアップ
            </button>
        </main>
    );
}
