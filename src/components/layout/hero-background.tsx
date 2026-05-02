// filepath: src/components/layout/hero-background.tsx
/* 💡 現場視認性ルール: グリッドを「確実に見える」レベルまでコントラスト強化。脱・グラスモーフィズム。 */
"use client";

import React from "react";
/** 
 * 💡 Motion v12 規約: React 向けには 'motion/react' を使用
 */
import { motion } from "motion/react";

export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#09090b]">
      {/* 🌟 究極のダイヤモンド・グリッド (SVG Pattern)
          CSSの細い線ではなく、SVGで「1pxの明示的な線」を描画。
          透過度を 0.15 に設定し、黒背景に対して確実なコントラストを確保。 */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern 
            id="diamond-grid" 
            width="100" 
            height="173.2" 
            patternUnits="userSpaceOnUse"
            patternTransform="scale(0.8)"
          >
            {/* スコアブックのマス目を形作るダイヤモンド・パス */}
            <path 
              d="M 50 0 L 100 86.6 L 50 173.2 L 0 86.6 Z" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamond-grid)" />
      </svg>

      {/* 🌟 データのパルス (Motion v12): 
          光の帯を太く(4px)、明るく(primary/60)し、アニメーションを強調。 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.8, 0] }}
          transition={{ 
            duration: 12 + i * 4, 
            repeat: Infinity, 
            ease: "linear", 
            delay: i * 2 
          }}
          className="absolute h-[4px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent blur-[2px]"
          style={{ top: `${25 + i * 25}%` }}
        />
      ))}

      {/* 🌟 センター・スポットライト: 
          マウンドを照らすカクテル光線のように、中央のロゴエリアを強調。 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.2)_0%,transparent_70%)]" />

      {/* 🌟 ヴィネットエフェクト: 四隅を落として奥行きを演出 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.8)_90%)]" />
    </div>
  );
}
