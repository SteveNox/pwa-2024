const staticCacheName = 'my-static-cache';
const dynamicCacheName = 'my-dynamic-cache';

const filesToCache = [
    '/',
    '/index.html',
    '/app.js',
  ];

self.addEventListener('install', function(event) {
    console.log('[SW]: Service worker installing...', event);
    event.waitUntil(
        caches.open(staticCacheName)
            .then(function(cache) {
                console.log('[SW]: Cache opened: ', staticCacheName);
                return cache.addAll(filesToCache);   
            })
    );
    //do not wait for page-reload
    //return self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[SW]: Service worker activating...', event);
    //ask the client to take control over the service worker
    //return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
     console.log('[SW]: Service worker fetching...', event);
     
     event.respondWith(
        caches.match(event.request)
            .then(function(cacheResponse) {
                if(cacheResponse) {
                    //treffer im cache gefunden->zurückgeben
                    return cacheResponse;
                } else {
                    //treffer nicht gefunden->internet fragen...und dynamisch cachen
                    return fetch(event.request)
                        .then(function(responseFromInternet) {
                            return caches.open(dynamicCacheName)
                                .then(function(dynamicCache) {
                                    dynamicCache.put(event.request.url, responseFromInternet.clone());
                                    return responseFromInternet;
                                })
                        })
                }
            })
     )     
});

self.addEventListener('sync', function(event) {
    console.log('[SW]: Service worker syncing...', event);
});