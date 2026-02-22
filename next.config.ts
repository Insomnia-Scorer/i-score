// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. これが Workers での外部パッケージ解決の鍵です
  serverExternalPackages: ["@better-auth/cloudflare-d1", "drizzle-orm"],

  experimental: {
    // 💡 Turbopack を一旦完全にオフにし、安定した Webpack ビルドを強制します
  },

  // 2. 余計な alias などを一旦削除し、Next.js 標準の挙動に戻します
  // Cloudflare のビルドプロセスが AWS 用のファイルを追いかけないようにします
};

export default nextConfig;


/*
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 1. 重いライブラリをビルドに含めず、外部参照（External）として扱う
    serverExternalPackages: ["@better-auth/cloudflare-d1", "drizzle-orm"],

    // 2. スタンドアロン出力はCloudflareでは逆に重くなる場合があるため一旦コメントアウト
    // output: "standalone", 

    experimental: {
        // パッケージのインポートを最適化
        optimizePackageImports: ["lucide-react", "better-auth"],
    },

    // 3. Webpackレベルで不要なバイナリ（OGP生成など）を物理的に消去する
    // webpack設定を関数形式ではなく、オブジェクトのキーとして残しつつ
    // Turbopackが動くときは無視されるようにします
    webpack: (config, { isServer }) => {
        if (isServer) {
          config.resolve.alias = {
            ...config.resolve.alias,
            "@vercel/og": false,
            "satori": false,
            "resvg": false,
          };
        }
        return config;
    },
};

export default nextConfig;

// Cloudflare Dev環境用
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
if (process.env.NODE_ENV === "development") {
    initOpenNextCloudflareForDev();
}
*/