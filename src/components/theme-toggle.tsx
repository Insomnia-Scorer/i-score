// src/components/theme-toggle.tsx
"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // マウントされるまでは何も表示しない（ハイドレーションエラー防止）
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-8 w-[104px]" />; // プレースホルダー

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-muted/50 text-muted-foreground">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-1.5 rounded-full transition-all hover:text-foreground",
          theme === "light" && "bg-background text-foreground shadow-sm"
        )}
        title="ライトモード"
      >
        <Sun className="size-4" />
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-1.5 rounded-full transition-all hover:text-foreground",
          theme === "system" && "bg-background text-foreground shadow-sm"
        )}
        title="システム設定"
      >
        <Monitor className="size-4" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-1.5 rounded-full transition-all hover:text-foreground",
          theme === "dark" && "bg-background text-foreground shadow-sm"
        )}
        title="ダークモード"
      >
        <Moon className="size-4" />
      </button>
    </div>
  );
}