// src/app/(protected)/layout.tsx
import React from "react";
import { ProtectedClientLayout } from "@/components/layout/protected-client-layout";

/**
 * 💡 保護ルート共通レイアウト
 * セッションの検証やリダイレクト処理は、すべてクライアント側(ProtectedClientLayout)で
 * useSession を用いて安全に実行されます。
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedClientLayout>{children}</ProtectedClientLayout>;
}