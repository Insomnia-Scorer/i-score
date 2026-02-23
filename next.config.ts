// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // これが Workers での外部パッケージ解決の鍵です
  serverExternalPackages: ["better-auth", "drizzle-orm", "@better-auth/cloudflare-d1"],
  // 💡 Turbopack を一旦完全にオフにし、安定した Webpack ビルドを強制します
  experimental: {},
  output: 'standalone',
  // Cloudflare の画像最適化機能を使わずに、標準の画像として扱います
  images: {
    unoptimized: true,
    loader: 'custom', // 💡 Cloudflare標準のloaderを使わせない
    loaderFile: './src/lib/dummy-loader.js', // 空のファイルを用意
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