// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
    // 💡 これが「見えない壁」を壊す一撃です
    // Cloudflare の D1 バインディングを Edge Runtime に注入します
    bindings: {
        d1: ["DB"], // wrangler.jsonc の binding 名と一致させる
    },
} as any);
