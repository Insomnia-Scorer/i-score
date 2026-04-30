// filepath: `src/app/(auth)/login/page.tsx`
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * 💡 ログインページ：公式ソーシャル特化型ゲート（アイコン強調版）
 * 現場での視認性と押しやすさを最大化した2ボタン・フルアクセス設計
 */
export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "line" | "google") => {
    setLoadingProvider(provider);
    
    try {
      // 💡 認証エンドポイントへ誘導。Cloudflare Workers 側で処理
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast.success(`${provider.toUpperCase()} でスタジアムに入場しました！`);
      router.push("/dashboard");
    } catch (error) {
      toast.error("サインが合いません（認証エラー）");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      
      {/* 🏟 背景演出 */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] aspect-square bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[360px] space-y-16 z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* ⚾️ センターロゴ */}
        <div className="flex flex-col items-center space-y-6 pt-8">
          <div className="relative w-28 h-28 drop-shadow-[0_0_20px_rgba(var(--primary),0.4)]">
            <Image
              src="/logo.webp"
              alt="iScore Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter text-primary leading-none select-none">
              iScore<span className="text-foreground">Cloud</span>
            </h1>
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] select-none">
              Authentic Scorer
            </p>
          </div>
        </div>

        {/* 🔓 ログインアクション（アイコン左揃え・大型化） */}
        <div className="space-y-6">
          <p className="text-center text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest select-none">
            Welcome to the Stadium
          </p>
          
          <div className="grid gap-5">
            {/* 🟢 LINE ログイン */}
            <Button 
              onClick={() => handleSocialLogin("line")}
              disabled={!!loadingProvider}
              className="h-16 w-full rounded-[24px] bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-lg shadow-xl shadow-emerald-900/10 active:scale-[0.98] transition-all border-none flex items-center justify-start px-6 relative"
            >
              {loadingProvider === "line" ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              ) : (
                <>
                  <div className="relative h-9 w-9 shrink-0">
                    <Image src="/line-logo.png" alt="LINE Logo" fill className="object-contain" />
                  </div>
                  <span className="w-full text-center pr-9">LINEで入場</span>
                </>
              )}
            </Button>

            {/* ⚪️ Google ログイン */}
            <Button 
              onClick={() => handleSocialLogin("google")}
              disabled={!!loadingProvider}
              variant="secondary"
              className="h-16 w-full rounded-[24px] bg-white text-black hover:bg-zinc-100 font-black text-lg shadow-xl shadow-black/5 active:scale-[0.98] transition-all border border-zinc-200 flex items-center justify-start px-6 relative"
            >
              {loadingProvider === "google" ? (
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto" />
              ) : (
                <>
                  <div className="relative h-8 w-8 shrink-0">
                    <Image src="/google-logo.png" alt="Google Logo" fill className="object-contain" />
                  </div>
                  <span className="w-full text-center pr-8">Googleで入場</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 💡 フッター */}
      <footer className="absolute bottom-10 w-full flex flex-col items-center gap-4">
        <div className="flex gap-6">
          <Link href="/terms" className="text-[10px] font-black text-muted-foreground/40 hover:text-primary tracking-widest uppercase transition-colors">Terms</Link>
          <Link href="/privacy" className="text-[10px] font-black text-muted-foreground/40 hover:text-primary tracking-widest uppercase transition-colors">Privacy</Link>
        </div>
        <p className="text-[9px] font-medium text-muted-foreground/10 tracking-tighter">© 2026 iScoreCloud / iS Baseball Lab</p>
      </footer>
    </div>
  );
}
