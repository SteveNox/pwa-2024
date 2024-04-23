const cache_version = '-v19';
const staticCacheName = 'static' + cache_version;
const dynamicCacheName = 'dynamic' + cache_version;

//mycomment
const filesToCache = [
    '/',
    '/index.html',
    '/offline.html',
    '/app.js'
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
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cache) {
                if(cache !== staticCacheName && cache !== dynamicCacheName) {
                    console.log('[SW]: Cache deleted: ', cache);
                    return caches.delete(cache);
                }
            }));
        })
    )
    //ask the client to take control over the service worker
    //return self.clients.claim();
});


//cache first, then network with offline page
// self.addEventListener('fetch', function(event) {
//      console.log('[SW]: Service worker fetching...', event);
     
//      event.respondWith(
//         caches.match(event.request)
//             .then(function(cacheResponse) {
//                 if(cacheResponse) {
//                     //treffer im cache gefunden->zurückgeben
//                     return cacheResponse;
//                 } else {
//                     //treffer nicht gefunden->internet fragen...und dynamisch cachen
//                     return fetch(event.request)
//                         .then(function(responseFromInternet) {
//                             return caches.open(dynamicCacheName)
//                                 .then(function(dynamicCache) {
//                                     dynamicCache.put(event.request.url, responseFromInternet.clone());
//                                     return responseFromInternet;
//                                 })
//                         })
//                 }
//             })
//             .catch(function(error) {
//                 return caches.open(staticCacheName)
//                     .then(function(staticCache) {
//                         return staticCache.match('/offline.html');
//                     })
//             })
//      )     
// });

// cache only
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
    
//     event.respondWith(
//        caches.match(event.request)
//     );
// });

// network only
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
    
//     event.respondWith(
//        fetch(event.request)
//     );
// });

// network first, then cache
// self.addEventListener('fetch', function(event) {
//      console.log('[SW]: Service worker fetching...', event);
     
//      event.respondWith(
//         fetch(event.request)
//             .catch(function(error) {
//                 return caches.match(event.request)
//             }
//         )
//      )     
// });

//cache then network  and race condition
self.addEventListener('fetch', function(event) {
        console.log('[SW]: Service worker fetching...', event);
        if(event.request.url.indexOf('https://httpbin.org/get') > -1) {
            event.respondWith(
                caches.open(dynamicCacheName)
                    .then(function(dynamicCache) {
                        return fetch(event.request)
                            .then(function(responseFromInternet) {
                                dynamicCache.put(event.request.url, responseFromInternet.clone());
                                return responseFromInternet;
                            })
                    })
            );
        } else {
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
                    .catch(function(error) {
                        return caches.open(staticCacheName)
                            .then(function(staticCache) {
                                return staticCache.match('/offline.html');
                            })
                    })
            )              
        }
});

self.addEventListener('sync', function(event) {
    console.log('[SW]: Service worker syncing...', event);
});