"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && session && session.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) return <div className="p-10 text-center">読み込み中...</div>;
  if (!session || (session.user as any).role !== "admin") return null;

  const { name, email } = session.user as any;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center pt-12 p-4 md:p-8">
      <main className="w-full max-w-3xl space-y-6">
        <Alert variant="destructive" className="border-2">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="font-bold">admin Role有効</AlertTitle>
          <AlertDescription>
            「認可」は正常に処理されました。このセグメント内のリソースはすべて保護されています。
          </AlertDescription>
        </Alert>

        <Card className="border-t-4 border-t-destructive shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                  管理者専用コンソール
                </CardTitle>
              </div>
              <Badge variant="destructive" className="animate-pulse">
                Admin Mode
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            <div className="rounded-lg bg-zinc-950 p-6 text-zinc-50 dark:bg-zinc-900">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-200">
                管理者認証プロファイル
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-200">管理者名</dt>
                  <dd className="text-sm font-semibold">{name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-200">登録メールアドレス</dt>
                  <dd className="text-sm font-semibold">{email}</dd>
                </div>
              </dl>
            </div>
            <Separator />

            <div className="flex justify-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">トップページへ戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}