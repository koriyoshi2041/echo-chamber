/**
 * Echo Chamber //回声室 - Service Worker
 * Provides offline functionality and performance optimization
 */

const CACHE_PREFIX = 'echo-chamber';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v1.3.0`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-v1.3.0`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/styles/main.css',
  '/js/echo-chamber.js',
  '/assets/css/philosophical-portal.css',
  '/assets/js/philosophical-portal.js',
  '/manifest.json',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/9o9xlPa/index.html',
  '/9o9xlPa/style.css',
  '/9o9xlPa/main.js',
  '/9o9xlPa/game_texts.js',
  '/9o9xlPa/scenes/rhizome_labyrinth.js',
  '/9o9xlPa/scenes/symbol_theatre.js',
  '/9o9xlPa/utils/visual_effects.js',
  '/9o9xlPa/utils/animations.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v1.3.0...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v1.3.0...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url } = request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other special URLs
  if (!url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', url);
          return cachedResponse;
        }
        
        // Create a new request with proper redirect mode
        const fetchRequest = new Request(request, {
          redirect: 'follow'
        });
        
        // Fetch from network and cache for future use
        return fetch(fetchRequest)
          .then((response) => {
            // Don't cache if not successful or if it's a redirect
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response as it can only be consumed once
            const responseToCache = response.clone();
            
            // Determine which cache to use
            const cacheName = STATIC_ASSETS.includes(url) ? STATIC_CACHE : DYNAMIC_CACHE;
            
            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                console.log('Service Worker: Caching new resource', url);
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed for', url, error);
            
            // Return offline fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
            
            // Return a fallback response for other requests
            return new Response('Offline - Echo Chamber content unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for echoes (when online again)
self.addEventListener('sync', (event) => {
  if (event.tag === 'echo-sync') {
    console.log('Service Worker: Syncing echoes...');
    event.waitUntil(syncEchoes());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: 'New philosophical thoughts await in the Echo Chamber',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Thoughts',
        icon: '/assets/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Echo Chamber //回声室', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Helper function to sync echoes when back online
async function syncEchoes() {
  try {
    // In a real app, this would sync stored echoes with the server
    console.log('Service Worker: Echo sync complete');
  } catch (error) {
    console.error('Service Worker: Echo sync failed', error);
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      cache.keys()
        .then((requests) => {
          if (requests.length > 50) {
            // Remove oldest entries if cache is getting large
            cache.delete(requests[0]);
          }
        });
    });
}, 60000); // Check every minute 