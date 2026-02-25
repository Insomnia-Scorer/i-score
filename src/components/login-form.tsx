// src/components/login-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { FcGoogle } from "react-icons/fc"; // Google公式カラーアイコン
import { SiLine } from "react-icons/si";   // LINE公式アイコン

import { signIn } from "@/lib/auth-client"; // Client SDK

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  // 💡 どのプロバイダーでロード中かを判定するために string | null に変更します
  const [loadingProvider, setLoadingProvider] = useState<"google" | "line" | null>(null);

  const handleSocialLogin = async (provider: "google" | "line") => {
    setLoadingProvider(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/", // 💡 ログイン成功後に表示したい画面（例: "/", "/dashboard" など）
      });
    } catch (error) {
      toast.error(`${provider === 'google' ? 'Google' : 'LINE'}でのログインに失敗しました`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)} {...props}>
      <Card className="bg-background shadow-sm border-border">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">ログイン</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            i-Score にアクセスしてスコアを記録しましょう
          </CardDescription>
        </CardHeader>
        
        {/* 💡 フォームタグを削除し、ボタンを直接配置するシンプルな構造に */}
        <CardContent className="flex flex-col gap-4">
          
          {/* Googleボタン */}
          <Button
            type="button"
            variant="outline"
            disabled={loadingProvider !== null}
            className="relative w-full h-12 bg-background font-medium hover:bg-muted/50 transition-colors text-foreground border-border shadow-sm text-base"
            onClick={() => handleSocialLogin("google")}
          >
            <div className="absolute left-4 flex items-center justify-center">
              {loadingProvider === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FcGoogle style={{ width: '22px', height: '22px' }} />
              )}
            </div>
            Googleで続ける
          </Button>

          {/* LINEボタン */}
          <Button
            type="button"
            disabled={loadingProvider !== null}
            className="relative w-full h-12 bg-[#06C755] hover:bg-[#05b34c] text-white font-medium transition-colors border-none shadow-sm text-base"
            onClick={() => handleSocialLogin("line")}
          >
            <div className="absolute left-4 flex items-center justify-center">
              {loadingProvider === "line" ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <SiLine style={{ width: '24px', height: '24px' }} />
              )}
            </div>
            LINEで続ける
          </Button>

        </CardContent>
      </Card>

      <footer className="mt-4 text-xs text-center text-muted-foreground space-y-3">
        <div>
          <span>Developed by </span>
          <a
            href="https://github.com/Insomnia-Scorer/i-score"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground hover:underline transition-colors"
          >
            insomnia-Scorer
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 opacity-80">
          <span>Powered by</span>
          <span className="bg-foreground text-background px-1.5 py-0.5 rounded-sm font-semibold tracking-wide">Next.js</span>
          <span className="opacity-50">&</span>
          <span className="bg-[#06b6d4] text-white px-1.5 py-0.5 rounded-sm font-semibold tracking-wide">Tailwind</span>
        </div>
      </footer>
    </div>
  );
}
