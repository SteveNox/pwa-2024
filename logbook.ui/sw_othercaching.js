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