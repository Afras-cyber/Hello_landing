
// Enhanced Service Worker with version control and cache busting
const CACHE_VERSION = 'v' + Date.now(); // Dynamic version based on deployment time
const STATIC_CACHE = `blondify-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `blondify-images-${CACHE_VERSION}`;
const HTML_CACHE = `blondify-html-${CACHE_VERSION}`;

// Critical resources - these will use network-first strategy
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Static assets that can be cached longer
const STATIC_PATTERNS = [
  /\.(css|js|woff2|woff|ttf)$/,
  /\/assets\//
];

// Image patterns for aggressive caching
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  /supabase\.co.*\.(png|jpg|jpeg|webp|avif)/,
  /images\.unsplash\.com/,
  /img\.youtube\.com/
];

// Install event - prepare caches
self.addEventListener('install', (event) => {
  console.log(`SW: Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(HTML_CACHE)
    ]).then(() => {
      console.log(`SW: Caches created for version ${CACHE_VERSION}`);
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log(`SW: Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter(cacheName => {
            // Delete all caches except current version
            return !cacheName.includes(CACHE_VERSION) && 
                   (cacheName.includes('blondify-static-') || 
                    cacheName.includes('blondify-images-') || 
                    cacheName.includes('blondify-html-'));
          })
          .map(cacheName => {
            console.log(`SW: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log(`SW: Cache cleanup complete for version ${CACHE_VERSION}`);
        return self.clients.claim();
      })
  );
});

// Network-first strategy for HTML files
const networkFirstStrategy = async (request) => {
  const cache = await caches.open(HTML_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Update cache with fresh content
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Fallback to cache if network fails
    return await cache.match(request) || networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response if nothing works
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
};

// Cache-first strategy for static assets
const cacheFirstStrategy = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
};

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external domains except known image CDNs
  if (url.origin !== location.origin && 
      !IMAGE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return;
  }

  // Network-first for HTML files and critical resources
  if (request.headers.get('accept')?.includes('text/html') || 
      CRITICAL_RESOURCES.some(resource => url.pathname === resource)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Aggressive caching for images
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname + url.search))) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Cache-first for static assets
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Default to network for everything else
  event.respondWith(fetch(request));
});

// Listen for version update messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Notify clients of updates
self.addEventListener('controlling', () => {
  console.log('SW: Now controlling all clients');
});
