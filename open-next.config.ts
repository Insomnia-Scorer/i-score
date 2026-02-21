// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  default: {
    runtime: "edge",
    // 💡 splitting を true にしつつ、minify を OpenNext 側に任せすぎない設定に
    splitting: true,
    minify: true,
  },
  // ⚠️ 複雑な依存関係を少し整理
  dangerous: {
    // もしメモリ不足で落ちるなら、ここを調整しますが、まずはこのままで！
  }
});

