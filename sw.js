const CACHE_NAME = 'alharamain-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './peta.html',
  './style.css',
  './script.js',
  './masjidil-haram-data.js',
  './chatbot_core.js?v=6.0',
  './chatbot_rag.js',
  './kaaba_illustration_1770741171195.png',
  './black_stone_illustration_1770741195739.png',
  './gate_illustration_1770741218993.png',
  './assets/bg.png',
  './favicon-32x32.png',
  './favicon.png',
  './apple-touch-icon.png',
  './manifest.json',
  './osm_data/haram-routing-graph-v2.js'
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Outfit:wght@300;400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local assets
      const localCache = cache.addAll(ASSETS_TO_CACHE);
      // Cache external assets (one by one to avoid total failure if one fails)
      const externalCache = Promise.all(
        EXTERNAL_ASSETS.map(url => {
          return fetch(url, { mode: 'no-cors' }).then(response => {
            return cache.put(url, response);
          }).catch(err => console.log('Failed to cache external:', url, err));
        })
      );
      return Promise.all([localCache, externalCache]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Cache First for static assets, Network First for others
  const url = new URL(event.request.url);

  // For Map Tiles, always try network first but fallback to cache if available
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('arcgisonline.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        // Cache new successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Final fallback for HTML pages
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
