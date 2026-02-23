// src/app/(protected)/layout.tsx
import { headers } from "next/headers";
import { requireSession } from "@/lib/auth-guard";
import Navigation from "@/components/Navigation";

export default async function ProtectedLayout({children}: {children: React.ReactNode}) {
  // 💡 Server Component なので headers() が使える！
  // ログイン必須でない場合は getSession に変えてもOKです
  const session = await requireSession(await headers());
  return (
    <>
      {/* 認証者へのみナビゲーションを表示する */}
      <Navigation session={session} />
      {children}
    </>
  );
}
