/* =============================================
   SERVICE WORKER — Kathy Designs PWA
   ============================================= */

const CACHE_NAME = 'kathy-designs-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/men.html',
  '/children.html',
  '/bags-shoes.html',
  '/fabrics.html',
  '/accessories.html',
  '/cart.html',
  '/checkout.html',
  '/order-confirm.html',
  '/wishlist.html',
  '/about.html',
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

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
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

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and Supabase API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});