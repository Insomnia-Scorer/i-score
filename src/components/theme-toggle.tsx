// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
/**
 * 💡 テーマトグル・コンポーネント (再構築版)
 * 1. 役割: next-themes と連携し、外観モードを切り替える。
 * 2. 意匠: 
 * - icon variant: ヘッダー用。Sun/Moonが入れ替わるアニメーション。
 * - segmented variant: ドロワー用。3つの選択肢をカプセル型に配置。
 */
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "segmented" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // クライアントサイドでのマウントを待機 (Hydrationエラー防止)
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💻 PC版: アイコン循環トグル
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (variant === "icon") {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-all active:scale-90 group shadow-none border-none overflow-hidden"
        aria-label="テーマを切り替える"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:text-primary" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:text-primary" />
      </button>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📱 モバイル版: セグメント・コントロール
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="flex p-1 bg-muted/20 rounded-2xl border border-border/40 w-full backdrop-blur-sm">
      {[
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "Auto" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setTheme(item.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-300",
            theme === item.id
              ? "bg-background text-primary shadow-sm ring-1 ring-border/10"
              : "text-muted-foreground opacity-40 hover:opacity-100"
          )}
        >
          <item.icon className={cn("h-4 w-4", theme === item.id && "animate-in zoom-in-75 duration-300")} />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}