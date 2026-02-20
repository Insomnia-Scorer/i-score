import { requireSession } from "@/lib/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Info } from "lucide-react";

export default async function Home() {
  // 認証ガード
  const session = await requireSession();
  const { name, email, role } = session.user;
  const roleVariant = role === "admin" ? "destructive" : "secondary";

  return (
    <div className="flex min-h-[calc(100-vh-4rem)] flex-col items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-2xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            認証済みダッシュボード
          </h1>
          <p className="text-muted-foreground">Better Auth による堅牢なセッション管理デモ</p>
        </header>

        <Card className="border-2 shadow-xl">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="grid gap-1">
              <CardTitle className="text-2xl">{name} さん</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 mt-4">
            <Separator />

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">現在の権限（Role）</span>
              </div>
              <Badge variant={roleVariant} className="px-3 py-1 text-sm capitalize">
                {role}
              </Badge>
            </div>

            <div className="flex items-start space-x-3 text-sm text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-100 dark:border-blue-900">
              <Info className="h-5 w-5 mt-0.5 text-blue-600 shrink-0" />
              <p>
                あなたの権限は「<span className="font-bold text-foreground">{role}</span>
                」として識別されています。
                システムアーキテクチャに基づき、上部メニューから権限に応じた管理リソースへアクセス可能です。
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          セッションID: <span className="font-mono">{session.session.id.slice(0, 12)}...</span>
        </p>
      </main>
    </div>
  );
}
