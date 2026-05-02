// filepath: src/components/layout/hero-background.tsx
"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * 💡 i-score Data-Viz Stadium 背景
 * スコアブックの幾何学グリッドを基調とした漆黒の動的背景。
 * motion/react v12 を使用し、データの流動性を視覚化。
 */
export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      {/* 🌟 ダイヤモンド・グリッドレイヤー（スコアブックのマス目） */}
      <div 
        className="absolute inset-0 opacity-[0.08]" 
        style={{ 
          backgroundImage: `
            linear-gradient(30deg, #ffffff 0.5px, transparent 0.5px), 
            linear-gradient(150deg, #ffffff 0.5px, transparent 0.5px)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: 'center'
        }} 
      />

      {/* 🌟 データの光（モーショナル・パルス）: 横方向に走り抜けるライン */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.4, 0] }}
          transition={{ 
            duration: 12 + i * 3, 
            repeat: Infinity, 
            ease: "linear", 
            delay: i * 4 
          }}
          className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          style={{ top: `${20 + i * 20}%` }}
        />
      ))}

      {/* 🌟 スキャニング・エフェクト: 現場の分析感を出す上下の光帯 */}
      <motion.div
        animate={{ y: ["-10%", "110%", "-10%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 h-40 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 blur-3xl pointer-events-none opacity-30"
      />

      {/* 🌟 放射状グラデーション: 中央のコンテンツを浮き上がらせる */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(9,9,11,0.7)_70%,rgba(9,9,11,1)_100%)]" />
    </div>
  );
}
