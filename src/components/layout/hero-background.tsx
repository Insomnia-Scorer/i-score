// filepath: src/components/layout/hero-background.tsx
"use client";

import React from "react";
/** 
 * 💡 Motion v12 規約: React 向けには 'motion/react' を使用
 */
import { motion } from "motion/react";

/**
 * 💡 i-score Data-Viz Stadium 背景
 * 屋外視認性を考慮し、背景を漆黒(bg-zinc-950)に固定しつつ、
 * スコアブックの幾何学グリッドを「見える」レベルまでコントラスト強化
 */
export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      
      {/* 🌟 究極のダイヤモンド・グリッド
          opacity を 0.1 → 0.3 に引き上げ、線の色をグレー(slate-500)系で明示 */}
      <div 
        className="absolute inset-0 opacity-[0.25]" 
        style={{ 
          backgroundImage: `
            linear-gradient(30deg, #64748b 1.5px, transparent 1.5px), 
            linear-gradient(150deg, #64748b 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100px 173.2px',
          backgroundPosition: 'center'
        }} 
      />

      {/* 🌟 データのパルス（動く光のライン）
          線の太さを 2px にし、発光感(blur)を追加して「真っ黒」を回避 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.7, 0] }}
          transition={{ 
            duration: 15 + i * 5, 
            repeat: Infinity, 
            ease: "linear", 
            delay: i * 2 
          }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent blur-[1px]"
          style={{ top: `${25 + i * 30}%` }}
        />
      ))}

      {/* 🌟 中央のマウンド・ライト
          ロゴ周辺に Primary カラーの柔らかな光を敷き、奥行きを演出 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(var(--primary),0.1)_0%,transparent_70%)]" />

      {/* 🌟 画面端の「絞り」エフェクト */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(9,9,11,0.8)_85%,rgba(9,9,11,1)_100%)]" />
    </div>
  );
}
