// src/app/(protected)/admin/page.tsx
export const runtime = 'edge';
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 💡 テンプレートのように、直接 D1 (process.env.DB) を触ってみる
  const db = (process.env as any).DB as D1Database;
  
  if (!db) {
    return <div>D1 Database がバインドされていません。</div>;
  }

  // テストクエリを実行（テーブル名はご自身のものに合わせてください。例: user）
  const { results } = await db.prepare("SELECT count(*) as count FROM user").all();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">管理者疎通テスト</h1>
      <p className="mt-4">D1からの応答: {JSON.stringify(results)}</p>
      <p className="mt-2 text-green-600">この画面が出れば、Next.jsとD1の接続は完璧です！</p>
    </div>
  );
}


/*
// src/app/(protected)/admin/page.tsx
export const runtime = 'edge';
// 💡 ビルド時に DB を見に行こうとして落ちるのを防ぎます
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  // 認証+認可(admin)ガード
  const session = await requireAdmin(await headers());
  const { name, email } = session.user;

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
*/