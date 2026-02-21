// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  default: {
    // 💡 1つの handler.mjs にまとめず、ページごとにファイルを分割する
    splitting: true,
    minify: true,
  },
  // 重いライブラリを「外部」として扱い、メインのバイナリから追い出す
  dangerous: {
    shards: {
      // 認証周りなど、特定の重い処理をさらに細かく分割したい場合に設定（まずはsplittingだけでOK）
    }
  }
});
