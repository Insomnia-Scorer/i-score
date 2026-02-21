import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// サーバー側のサイズを減らすための設定
    serverExternalPackages: ["@better-auth/cloudflare-d1"], 
    output: "standalone", // これを試すと、不要な依存関係が削られることがあります
    experimental: {
      // 必要なものだけに絞り込む
      optimizePackageImports: ["lucide-react", "better-auth"],
    },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
