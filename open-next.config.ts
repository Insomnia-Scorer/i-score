// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  default: {
    runtime: "edge",
    // 💡 これが肝！ 機能を分割して 1 ファイルあたりのサイズを劇的に減らします
    splitting: true, 
    minify: true,
  },
  // Middleware を別関数として抽出し、軽量化
  middleware: {
    external: ["better-auth/cookies"],
  }
};

export default config;

export default defineCloudflareConfig({
	// Uncomment to enable R2 cache,
	// It should be imported as:
	// `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache,
});
