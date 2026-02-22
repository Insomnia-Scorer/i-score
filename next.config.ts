// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // これが Workers での外部パッケージ解決の鍵です
  serverExternalPackages: ["better-auth", "drizzle-orm", "@better-auth/cloudflare-d1"],

  experimental: {
    // 💡 Turbopack を一旦完全にオフにし、安定した Webpack ビルドを強制します
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.mangle = false; // 名前を勝手に書き換えない
      config.optimization.minimize = false; // サーバーサイドは圧縮しない
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