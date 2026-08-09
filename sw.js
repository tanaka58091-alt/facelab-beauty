// ===================================================================
// FaceLab Service Worker — 最小構成
//
// キャッシュするのは「バージョン付きURLのCDN資産」(MediaPipeのwasm/モデル 約13MB)だけ。
// アプリ本体(HTML/JS/CSS)は一切キャッシュしない = 更新は今まで通り即時配信され、
// 「Service Workerのせいで古い画面が固定される」事故を構造的に起こさない。
//
// 効果: 2回目以降はモデルDLがオフライン/不安定回線でも安定。
// PWAインストール(ホーム画面に追加)の要件も満たす。
// ===================================================================
const CACHE = 'facelab-cdn-v1';
const CDN_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com'];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // CDN資産(不変・バージョン付き)のみキャッシュファースト。それ以外は素通し(=通常のネットワーク)。
  if (event.request.method !== 'GET' || !CDN_HOSTS.includes(url.hostname)) return;
  event.respondWith((async () => {
    try {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(event.request);
      if (hit) return hit;
      const res = await fetch(event.request);
      if (res && (res.ok || res.type === 'opaque')){
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      return fetch(event.request);
    }
  })());
});
