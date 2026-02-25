// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // 静的エクスポートでは Middleware や Server Components (SSR) が使えないため、
  // サーバー側の設定は最小限にします。
};

export default nextConfig;
