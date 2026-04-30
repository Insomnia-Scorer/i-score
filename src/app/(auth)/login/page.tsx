// filepath: `src/app/(auth)/login/page.tsx`
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Chrome, Loader2, Trophy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * 💡 ログインページ：ソーシャル特化型ゲート
 * 現場での誤操作を防ぐため、入力を排除した2ボタン・フルアクセス設計
 */
export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "line" | "google") => {
    setLoadingProvider(provider);
    
    // 💡 Cloudflare Workers 側の認証エンドポイントへ誘導[cite: 1]
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // 通信擬似待ち
      toast.success(`${provider.toUpperCase()} でスタジアムに入場しました！`);
      router.push("/dashboard");
    } catch (error) {
      toast.error("サインが合いません（認証エラー）");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      
      {/* 🏟 背景演出：ナイターの照明と芝生をイメージしたオーロラ */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] aspect-square bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[360px] space-y-12 z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* ⚾️ センターロゴ */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-24 h-24 drop-shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-transform duration-700 hover:scale-110">
            <Image
              src="/logo.webp"
              alt="iScore Logo"
              fill
              className="object-contain text-transparent" // webp対応
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter text-primary leading-none select-none">
              iScore<span className="text-foreground">Cloud</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[1px] w-4 bg-muted-foreground/30" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                Authentic Scorer
              </p>
              <div className="h-[1px] w-4 bg-muted-foreground/30" />
            </div>
          </div>
        </div>

        {/* 🔓 ログインアクション：脱・透過で最強の視認性[cite: 1] */}
        <div className="space-y-4">
          <p className="text-center text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest mb-6">
            Quick Entry to Stadium
          </p>
          
          <div className="grid gap-4">
            {/* LINE ログイン */}
            <Button 
              onClick={() => handleSocialLogin("line")}
              disabled={!!loadingProvider}
              className="h-16 w-full rounded-[20px] bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-base gap-4 shadow-xl shadow-emerald-900/10 active:scale-95 transition-all border-none"
            >
              {loadingProvider === "line" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <MessageCircle className="h-6 w-6 fill-white text-[#06C755]" />
                </div>
              )}
              LINEで入場
            </Button>

            {/* Google ログイン */}
            <Button 
              onClick={() => handleSocialLogin("google")}
              disabled={!!loadingProvider}
              variant="secondary"
              className="h-16 w-full rounded-[20px] bg-white text-black hover:bg-zinc-100 font-black text-base gap-4 shadow-xl shadow-black/5 active:scale-95 transition-all border border-zinc-200"
            >
              {loadingProvider === "google" ? (
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              ) : (
                <div className="bg-zinc-100 p-1.5 rounded-lg">
                  <Chrome className="h-6 w-6 text-[#4285F4]" />
                </div>
              )}
              Googleで入場
            </Button>
          </div>
        </div>

        {/* 🏆 ベネフィット */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/40">
          {[
            { icon: Trophy, label: "本格スコア" },
            { icon: ShieldCheck, label: "安全管理" },
            { icon: Image, label: "画像出力" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <item.icon className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 💡 規約・ポリシーリンク */}
      <footer className="absolute bottom-8 w-full flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500">
        <div className="flex gap-6">
          <Link href="/terms" className="text-[10px] font-black text-muted-foreground/40 hover:text-primary tracking-widest uppercase transition-colors">Terms</Link>
          <Link href="/privacy" className="text-[10px] font-black text-muted-foreground/40 hover:text-primary tracking-widest uppercase transition-colors">Privacy</Link>
        </div>
        <p className="text-[9px] font-medium text-muted-foreground/20 tracking-tighter">© 2026 iS Baseball Lab / iScoreCloud</p>
      </footer>
    </div>
  );
}
