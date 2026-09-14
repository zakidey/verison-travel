const CACHE_NAME = 'verison-travel-v1';
const assetsToCache = [
  '/',
  '/admin.html',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// تثبيت ملف الخدمة وتخزين الملفات مؤقتاً (كل ملف على حدة، بلا ما يوقف الباقي)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('تعذر تخزين الملف مؤقتاً:', url, err);
          });
        })
      );
    })
  );
});

// تشغيل الملفات المخزنة عند انقطاع الإنترنت أو للسرعة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});