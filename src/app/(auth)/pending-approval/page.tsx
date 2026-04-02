// src/app/(auth)/pending-approval/page.tsx
import React from "react";
import { ShieldAlert, Clock } from "lucide-react";
import { LogoutButton } from "@/components/logout";

/**
 * 💡 承認待ち（待合室）画面
 * - ログイン画面と共通のカードデザインで統一感を持たせる。
 * - スクロールなしで画面中央に鎮座します。
 */
export default function PendingApprovalPage() {
  return (
    <div className="w-full p-8 rounded-[40px] bg-card/60 backdrop-blur-2xl border border-border/50 shadow-2xl flex flex-col gap-8 text-center animate-in fade-in zoom-in-95 duration-500">

      <div className="flex justify-center">
        <div className="relative">
          <ShieldAlert className="w-16 h-16 text-primary" />
          <Clock className="absolute -bottom-2 -right-2 w-8 h-8 text-yellow-500 bg-background rounded-full p-1 border-2 border-background" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-black tracking-tight">承認待ちです</h1>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          現在は<strong className="text-foreground">GUEST（ゲスト）権限</strong>です。
          <br />
          チーム管理者からの招待、または承認をお待ちください。
        </p>
      </div>

      <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
        <p className="text-xs text-muted-foreground font-bold">
          💡 監督やマネージャーに「ログインしたよ！」とお伝えください。
        </p>
      </div>

      <div className="pt-2 flex justify-center w-full">
        <LogoutButton className="w-full rounded-full h-12 text-sm font-bold active:scale-95 transition-transform" variant="outline" />
      </div>

    </div>
  );
}