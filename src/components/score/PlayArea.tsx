// src/components/score/PlayArea.tsx
"use client";

import { useScore } from "@/contexts/ScoreContext";
/**
 * 💡 プレイエリア・コンポーネント (究極UI版)
 * 1. 意匠: bg-card/20 と backdrop-blur-xl で「ダイヤモンド」を表現。
 * 2. 視覚: 芝生を感じさせる放射状のラインと、光り輝くベース。
 * 3. 規則: 影なし。角丸40px。border-border/40。
 * 4. 反応: ランナーの状態に合わせてベースが OKLCH Primary に発光。
 */
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export function PlayArea() {
  const { state } = useScore();

  const hasRunner1 = !!state.runners.base1;
  const hasRunner2 = !!state.runners.base2;
  const hasRunner3 = !!state.runners.base3;

  const Base = ({ active, label, className }: { active: boolean, label: string, className: string }) => (
    <div className={cn("absolute w-12 h-12 flex items-center justify-center transition-all duration-700", className)}>
      <div className={cn(
        "absolute inset-0 rotate-45 border-2 rounded-lg transition-all duration-500",
        active
          ? "bg-primary border-primary ring-8 ring-primary/10 scale-110"
          : "bg-background/40 border-border/40"
      )} />
      {active && (
        <div className="relative z-10 animate-in zoom-in duration-300">
          <User className="h-6 w-6 text-primary-foreground stroke-[3px]" />
        </div>
      )}
      <span className={cn(
        "absolute -bottom-7 text-[10px] font-black uppercase tracking-widest transition-opacity duration-500",
        active ? "text-primary opacity-100" : "text-muted-foreground opacity-30"
      )}>
        {label}
      </span>
    </div>
  );

  return (
    <Card className="bg-card/20 backdrop-blur-xl border-border/40 rounded-[40px] overflow-hidden shadow-none aspect-square max-w-sm mx-auto relative group">
      {/* 🏟 背景デザイン：芝生の同心円パターン */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_50%,transparent_0,transparent_40px,var(--primary)_41px,transparent_42px)]" />
      </div>

      <CardContent className="p-0 h-full flex items-center justify-center">
        <div className="relative w-64 h-64">

          {/* ダイヤモンドの境界線 (透過ライン) */}
          <div className="absolute inset-6 border border-dashed border-border/40 rotate-45 rounded-sm" />

          {/* 各塁の配置 */}
          <Base active={hasRunner2} label="2nd" className="top-0 left-1/2 -translate-x-1/2" />
          <Base active={hasRunner3} label="3rd" className="top-1/2 left-0 -translate-y-1/2" />
          <Base active={hasRunner1} label="1st" className="top-1/2 right-0 -translate-y-1/2" />

          {/* 本塁 (Home Plate) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-muted/40 backdrop-blur-md border border-border/40"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' }}
            />
            <span className="relative z-10 text-[9px] font-black text-muted-foreground/40 mt-1 uppercase tracking-widest">Home</span>
          </div>

          {/* マウンド (投手板) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-10 bg-border/20 rounded-full" />
        </div>
      </CardContent>

      {/* 状態ラベル */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className={cn(
          "px-5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] transition-all",
          (hasRunner1 || hasRunner2 || hasRunner3)
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted/10 text-muted-foreground/40 border-border/20"
        )}>
          {(hasRunner1 || hasRunner2 || hasRunner3) ? "Runners Occupied" : "Bases Empty"}
        </div>
      </div>
    </Card>
  );
}