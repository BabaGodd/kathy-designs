/* =============================================
   SERVICE WORKER — Kathy Designs PWA
   v3 — Forces fresh cache, removes Children
   ============================================= */

const CACHE_NAME = 'kathy-designs-v3';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/men.html',
  '/bags-shoes.html',
  '/fabrics.html',
  '/accessories.html',
  '/cart.html',
  '/checkout.html',
  '/order-confirm.html',
  '/wishlist.html',
  '/about.html',
  '/track-order.html',
  '/styles.css',
  '/script.js',
  '/cart-page.js',
  '/checkout.js',
  '/order-confirm.js',
  '/wishlist.js',
  '/search.js',
  '/products-data.js',
  '/js/cart.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install — cache fresh assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate — delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});