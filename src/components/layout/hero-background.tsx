// filepath: src/components/layout/hero-background.tsx
/* 💡 現場視認性ルール: グリッドを「物理的な太さ」と「発光」で確実に描画。暗闇を払拭する Data-Viz デザイン。 */
"use client";

import React from "react";
/** 
 * 💡 Motion v12 規約: React 向けには 'motion/react' からインポートを行う。
 */
import { motion } from "motion/react";

export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* 🌟 究極のダイヤモンド・グリッド (SVG Pattern)
          線の太さを 2px に、色を純白に近い Slate-200 に設定。
          さらに微細なドロップシャドウ（filter）を加え、線そのものが浮き出るように設計。 */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern 
            id="diamond-grid" 
            width="120" 
            height="207.8" 
            patternUnits="userSpaceOnUse"
            patternTransform="scale(0.8) rotate(0)"
          >
            {/* スコアブックのマス目：視認性向上のため strokeWidth を 2.0 まで強化 */}
            <path 
              d="M 60 0 L 120 103.9 L 60 207.8 L 0 103.9 Z" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="2.0"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamond-grid)" />
      </svg>

      {/* 🌟 データのハイウェイ（パルス）: 
          厚みを 6px に強化し、Primaryカラーの強力なネオンエフェクトを追加。 */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 1, 0] }}
          transition={{ 
            duration: 10 + i * 4, 
            repeat: Infinity, 
            ease: "linear", 
            delay: i * 2.5 
          }}
          className="absolute h-[6px] w-full bg-gradient-to-r from-transparent via-primary to-transparent blur-[4px] shadow-[0_0_20px_rgba(var(--primary),0.8)]"
          style={{ top: `${15 + i * 25}%` }}
        />
      ))}

      {/* 🌟 中央のマウンド・ライト（結界）
          Primaryカラーの光をより広範囲(80%)に、より明るく(0.3)照射し、黒背景を「濃紺の空間」へ。 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.3)_0%,rgba(var(--primary),0.05)_50%,transparent_80%)]" />

      {/* 🌟 コーナー・シャドウ（ヴィネット）
          周辺を絞ることで、中央のダイヤモンド・グリッドが光り輝いて見える対比を作る。 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
}
