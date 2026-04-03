// src/app/(protected)/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Shield, Save, Crown, Loader2, Camera, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserSession } from "@/types/auth";

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch");
        const json = (await response.json()) as AuthResponse;
        if (json.success) {
          setUser(json.data);
          setName(json.data.name || "");
        }
      } catch (error) {
        toast.error("ユーザー情報の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("プロフィールを更新しました", {
      description: "ベンチに変更サインを伝達しました！"
    });
    // 本来はここでAPI経由で更新し、再取得または state 更新を行います
    if (user) setUser({ ...user, name });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = (user as any)?.role === 'SYSTEM_ADMIN' || (user as any)?.systemRole === 'SYSTEM_ADMIN';

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20 w-full animate-in fade-in duration-500">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヒーローセクション（ロッカーカバー画像）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative w-full h-40 sm:h-56 lg:h-72 bg-muted overflow-hidden rounded-b-[2rem] sm:rounded-b-none sm:rounded-3xl shadow-sm">
        {/* ベースのグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/20 to-background opacity-90" />
        {/* カバー画像（抽象的なスタジアムの光やロッカーの雰囲気） */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        {/* 装飾用の光 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. プロフィールヘッダー（オーバーラップ）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">

          {/* アバター（チームロゴと同じサイズ感ではみ出させる） */}
          <div className="relative group shrink-0 self-start sm:self-auto">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl bg-background">
              <AvatarImage src={user.avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="text-4xl sm:text-5xl font-black text-primary bg-primary/10">
                {(user.name || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* カメラアイコン */}
            <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2.5 sm:p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-background cursor-pointer">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* 名前＆基本情報 */}
          <div className="flex flex-col flex-1 pb-1 sm:pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
              {isAdmin && (
                <span className="flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs font-black tracking-widest uppercase border border-amber-500/20">
                  <Crown className="h-3 w-3 mr-1" />
                  System Admin
                </span>
              )}
              <span className="flex items-center text-muted-foreground text-[10px] sm:text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full">
                <Calendar className="h-3 w-3 mr-1" />
                Joined 2024
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {user.name}
            </h1>
            <p className="text-sm font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>

          {/* 保存ボタン（PC時は右端に配置） */}
          <div className="hidden sm:flex pb-3">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving || name === user.name}
              className="h-12 px-8 rounded-full font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {isSaving ? "更新中..." : "変更を保存"}
            </Button>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. 設定パネル（2カラム構成）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* 左側: フォーム入力エリア (2カラム分) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            <div className="p-5 sm:p-8 rounded-3xl bg-background border border-border/50 shadow-sm">
              <h2 className="text-lg font-black flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                基本情報
              </h2>

              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    表示名 (Display Name)
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-2xl border-border/50 bg-muted/30 text-lg font-bold focus-visible:ring-primary/50 transition-colors px-4"
                    placeholder="グラウンドでの名前を入力"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    メールアドレス (Email Address)
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="h-14 rounded-2xl border-border/50 bg-muted/50 text-lg font-bold text-muted-foreground cursor-not-allowed opacity-70 px-4"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-bold mt-1.5 ml-1">
                    ※ログインプロバイダーと紐づいているため変更できません。
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* 右側: ステータス＆権限エリア (1カラム分) */}
          <div className="space-y-4 sm:space-y-6">

            {/* アクティビティサマリー（Tinted Glass） */}
            <div className="p-5 sm:p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group">
              <Activity className="absolute -right-2 -bottom-2 h-20 w-20 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 relative z-10">Teams</span>
              <div className="flex items-baseline gap-1.5 relative z-10 mt-1">
                <span className="text-4xl font-black text-primary tracking-tighter">
                  {user.memberships?.length || 0}
                </span>
                <span className="text-xs font-bold text-primary/80">所属</span>
              </div>
            </div>

            {/* 権限情報パネル */}
            <div className="p-5 sm:p-6 rounded-3xl bg-background border border-border/50 shadow-sm">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 block">Account Role</span>

              <div className="flex items-start gap-3 sm:gap-4">
                {isAdmin ? (
                  <>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0">
                      <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">システム管理者</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-bold leading-relaxed">
                        i-Scoreの全ての機能と設定にアクセスできる最高権限です。
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm sm:text-base">一般ユーザー</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-bold leading-relaxed">
                        所属チームの権限（監督・選手・マネージャー）に基づき機能を利用できます。
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 🌟 モバイル用保存ボタン（画面下部に固定または最下部配置） */}
        <div className="mt-8 sm:hidden flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving || name === user.name}
            className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isSaving ? "更新中..." : "変更を保存"}
          </Button>
        </div>

      </div>
    </div>
  );
}