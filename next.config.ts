// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 serverExternalPackages は experimental の外に出します
  serverExternalPackages: ["better-auth"], 

  experimental: {
    // 他の実験的機能が必要なければ空、あるいはこのブロック自体消してもOKです
  },

  images: {
    unoptimized: true,
  },

  // 💡 Turbopack エラーを回避するため、Webpack 設定を一度最小限にするか
  // もしくは一旦コメントアウトして、Next.js 15 の標準ビルドに任せるのが安全です
  /*
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.mainFields = ['browser', 'module', 'main'];
    }
    return config;
  },
  */
};

export default nextConfig;