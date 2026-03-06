// public/sw.js
const CACHE_NAME = 'iscore-cache-v1';

// 1. インストール時：すぐに待機状態を解除して有効化
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. アクティベート時：古いバージョンのキャッシュがあれば綺麗に掃除する
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. 通信の傍受（ここがオフライン対応のコア！）
self.addEventListener('fetch', (event) => {
  // GETリクエスト（データ取得）以外は無視
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;

  // ⚾️ API（スコアや成績データ）は「Network First（通信優先、ダメならキャッシュ）」
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 通信成功したら、最新データをキャッシュに保存
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // オフライン（圏外）の場合は、前回保存したキャッシュを返す！
          return caches.match(event.request);
        })
    );
    return;
  }

  // ⚾️ 画面のHTMLや画像、CSSなどは「Stale-While-Revalidate（爆速キャッシュ表示＋裏で更新）」
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // オフライン時は何もしない（既存のキャッシュで耐える）
      });
      // キャッシュがあれば一瞬でそれを返し、無ければ通信を待つ
      return cachedResponse || fetchPromise;
    })
  );
});
