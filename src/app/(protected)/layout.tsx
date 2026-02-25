"use client";

import { AppLayout } from "@/components/app-layout";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import React from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">読み込み中...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <AppLayout>{children}</AppLayout>
    </>
  );
}
