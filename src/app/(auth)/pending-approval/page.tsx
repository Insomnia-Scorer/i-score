// 💡 src/app/(auth)/pending-approval/page.tsx
// GUESTユーザー向けの待合室画面

import React from "react";
import { ShieldAlert, Clock, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout"; // 既存のログアウトボタン等のコンポーネント

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* 背景の装飾（グラスモーフィズムの土台） */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[80px] -z-10" />

      <div className="w-full max-w-md p-8 rounded-[40px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <ShieldAlert className="w-16 h-16 text-primary" />
            <Clock className="absolute -bottom-2 -right-2 w-8 h-8 text-yellow-500 bg-background rounded-full p-1" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">承認待ちです</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            セキュリティ保護のため、アカウントは現在<strong className="text-foreground">GUEST（ゲスト）権限</strong>となっています。
            <br />
            i-Scoreの機能を利用するには、チーム管理者からの招待、またはIT管理者の承認が必要です。
          </p>
        </div>

        <div className="p-4 bg-background/50 rounded-2xl border border-border">
          <p className="text-xs text-muted-foreground font-medium">
            💡 チームの監督やマネージャーに、「i-Scoreにログインした」とお伝えください！
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          {/* ログアウトして別アカウントで入り直す導線も用意 */}
          <LogoutButton className="text-muted-foreground hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}