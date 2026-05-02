// filepath: src/components/layout/hero-background.tsx
"use client";

import React from "react";
import { motion } from "motion/react";

export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      {/* 🌟 ダイヤモンド・グリッド：透過度を 0.1 → 0.2 に強化し、線をハッキリ見せます */}
      <div 
        className="absolute inset-0 opacity-[0.2]" 
        style={{ 
          backgroundImage: `
            linear-gradient(30deg, rgba(255,255,255,0.2) 1px, transparent 1px), 
            linear-gradient(150deg, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 173px',
          backgroundPosition: 'center'
        }} 
      />

      {/* 🌟 データのパルス：光の強度を上げ、現場の躍動感を視覚化 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 12 + i * 4, repeat: Infinity, ease: "linear", delay: i * 2 }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          style={{ top: `${20 + i * 30}%` }}
        />
      ))}

      {/* 🌟 中央を照らすライトエフェクト：ここがロゴとナビの「マウンド」になります */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.15)_0%,transparent_70%)]" />
    </div>
  );
}
