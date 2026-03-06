// public/sw.js
const CACHE_NAME = 'iscore-v4'; // 💡 v4にして強制アップデートさせます

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      // ⚾️ 常に最新データを取得し、成功したらキャッシュを更新（通信優先）
      const res = await fetch(req);
      if (res && res.status === 200) {
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      // 🚨 通信失敗（オフライン・圏外）時はここに来る！

      // 1. 保存されているキャッシュを探す
      // 💡 ignoreSearch: true を付けることで、Next.js特有の複雑なパラメータを無視してヒットさせます
      let cachedRes = await cache.match(req, { ignoreSearch: true });
      if (cachedRes) return cachedRes;

      // 2. スマホのホーム画面から起動した時やリロード時（HTMLの要求）の最終手段
      if (req.mode === 'navigate') {
        // ダッシュボードかホーム画面のキャッシュを強制的に探して返す！
        cachedRes = await cache.match('/dashboard', { ignoreSearch: true }) 
                 || await cache.match('/', { ignoreSearch: true });
        if (cachedRes) return cachedRes;
      }

      throw err;
    }
  })());
});
