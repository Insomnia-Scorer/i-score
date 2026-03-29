// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * 💡 究極のテーマトグル
 * PC版（アイコン循環）とモバイル版（セグメント制御）の両方に対応できるよう設計。
 */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "segmented" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  // PC版: シンプルなアイコン切り替え
  if (variant === "icon") {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-all active:scale-90 group"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:text-primary" />
        <Moon className="absolute top-2.5 left-2.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:text-primary" />
      </button>
    );
  }

  // モバイル版: セグメントコントロール
  return (
    <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/40 w-full">
      {[
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "Auto" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setTheme(item.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            theme === item.id
              ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
              : "text-muted-foreground opacity-50 hover:opacity-100"
          )}
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
        </button>
      ))}
    </div>
  );
}