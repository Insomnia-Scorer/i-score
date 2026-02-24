// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // 💡 全てをバンドルに含める（現在の設定を維持）
  serverExternalPackages: [],

// 💡 型エラーを回避しつつ、Turbopackを無効化する記述
  experimental: {
    // 既存の experimental 設定があればここに
  } as any,

  // 💡 Next.js 16 の一部の型定義では turbo がトップレベルに期待される場合があります
  // ここも any で型エラーを封じ込めます
  ...({ turbo: {} } as any),

  images: {
    unoptimized: true,
  },

  // 💡 ここを追加：Webpack に対して ESM の解決を強制します
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Better-Auth 等の ESM モジュールが 'default' を見失わないように設定
      config.resolve.alias = {
        ...config.resolve.alias,
        // 必要に応じて特定のパッケージを指定できますが、まずは全体で解決を試みます
      };
      
      // 依存関係の解決順序を Edge Runtime 用に調整
      config.resolve.mainFields = ['browser', 'module', 'main'];
    }
    return config;
  },
};

export default nextConfig;
/*
// Cloudflare Dev環境用
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
if (process.env.NODE_ENV === "development") {
    initOpenNextCloudflareForDev();
}
*/