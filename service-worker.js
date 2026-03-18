const CACHE_NAME = 'elm-fankoush-v1';

const ASSETS_TO_CACHE = [
  '/elm-fankoush/',
  '/elm-fankoush/index.html',
  '/elm-fankoush/manifest.json'
  // لو عندك CSS أو JS خارجي، ضيفه هنا
];

// تنزيل الملفات في الكاش أول ما الـ SW يتنزل
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتيجية: النت أولاً، لو مفيش نت يرجع للكاش
self.addEventListener('fetch', event => {
  // الفيديوهات دايماً من النت
  if (event.request.url.includes('.mp4') || event.request.url.includes('youtube')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
