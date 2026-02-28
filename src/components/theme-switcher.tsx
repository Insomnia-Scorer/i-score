// src/components/theme-switcher.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { name: "default", color: "bg-zinc-900 dark:bg-zinc-100" },
  { name: "theme-blue", color: "bg-[#0284c7]" },
  { name: "theme-red", color: "bg-[#e11d48]" },
  { name: "theme-green", color: "bg-[#16a34a]" },
  { name: "theme-orange", color: "bg-[#ea580c]" },
  { name: "theme-teal", color: "bg-[#0d9488]" },
  { name: "theme-purple", color: "bg-[#7c3aed]" },
  { name: "theme-indigo", color: "bg-[#4338ca]" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [mounted, setMounted] = useState(false);

  // 💡 初回マウント時にlocalStorageからテーマを復元
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("i-score-color-theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      // SPA遷移時などのために念のため再適用
      changeTheme(savedTheme, false);
    }
  }, []);

  // 💡 テーマを変更し、同時にブラウザに記憶させる
  const changeTheme = (themeName: string, save: boolean = true) => {
    const htmlElement = document.documentElement;

    // 古いテーマのクラスをすべて削除
    themes.forEach((t) => {
      if (t.name !== "default") htmlElement.classList.remove(t.name);
    });

    // default以外なら新しいテーマのクラスを追加
    if (themeName !== "default") {
      htmlElement.classList.add(themeName);
    }

    setCurrentTheme(themeName);
    if (save) {
      localStorage.setItem("i-score-color-theme", themeName); // 💾 ここで保存！
    }
  };

  // Hydration（サーバーとクライアントの不一致）エラーを防ぐプレースホルダー
  if (!mounted) return <div className="h-8" />;

  return (
    <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border">
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => changeTheme(theme.name)}
          className={cn(
            "w-5 h-5 rounded-full transition-all duration-300 hover:scale-125 shadow-sm border border-border/50",
            theme.color,
            currentTheme === theme.name
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
              : "opacity-60 hover:opacity-100 grayscale-[0.3] hover:grayscale-0"
          )}
          aria-label={`${theme.name}に変更`}
        />
      ))}
    </div>
  );
}