importScripts('js/idb.js');
importScripts('js/indexedDbHelpers.js');

const cache_version = '-v2';
const staticCacheName = 'static' + cache_version;
const dynamicCacheName = 'dynamic' + cache_version;

//mycomment
const filesToCache = [
    '/',
    '/index.html',
    '/aircraft.html',
    '/offline.html',
    'js/app.js',
    'js/aircraft.js',
  ];

self.addEventListener('notificationclose', function(event) {
    console.log('[SW]: Notification closed...', event);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[SW]: Notification clicked...', event);
    
    if (event.action === 'confirm') {
        console.log('[SW]: Confirm was chosen...');
    } else { 
        console.log(event.action);
    }
    event.notification.close();
});

self.addEventListener('push', function(event) {
    console.log('[SW]: Service worker push event received...', event);


    var data = { title: 'New!', content: 'Something new happened!' };

    if(event.data) {
        data = JSON.parse(event.data.text());
    }

    console.log(data);
    
    const options = {
        body: data.content,
        icon: 'images/icons/icon-96x96.png',
        image: 'images/icons/icon-284x284.png',
        dir: 'ltr',
        lang: 'en-US', // BCP 47
        vibrate: [100, 50, 200],
        badge: 'images/icons/icon-96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        //only works via service worker
        actions: [
        { action: 'confirm', title: 'Okay', icon: 'images/icons/icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: 'images/icons/icon-96x96.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
    
    //do not wait for page-reload
    //return self.skipWaiting();
});


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

//cache then network  and race condition
self.addEventListener('fetch', function(event) {
    console.log('[SW]: Service worker fetching...', event);
    if(event.request.url.indexOf('http://localhost:5054/aircraft') > -1) {
        event.respondWith(
            fetch(event.request)
            .then(function(responseFromInternet) {
                var clonedResponse = responseFromInternet.clone();
                clearAllData('aircraft-cache')
                    .then(function() {
                        return clonedResponse.json();
                    })
                    .then(function(data) { 
                        for (var key in data) {
                            writeData('aircraft-cache', data[key]);
                        }
                    });
                
                return responseFromInternet;
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
    
    if(event.tag === 'sync-new-aircraft') {
        console.log('[SW]: Sync new aircraft...', event);

        event.waitUntil(
            readAllData('aircraft-create')
                .then(function(data) {
                    for (var key in data) {
                        fetch(
                            'http://localhost:5054/aircraft',
                            {
                                method: 'POST',
                                body: JSON.stringify(data[key]),
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        )
                        .then(function(response) {
                            console.log(response);
                            if(response.ok) {
                                deleteItemFromData('aircraft-create', data[key].id);

                                //throws event to notify clients about sync completion
                                self.clients.matchAll().then(function(clients) {
                                    clients.forEach(function(client) {
                                        client.postMessage({
                                            action: 'sync-complete',
                                            data: data[key]
                                        });
                                    });
                                });     

                            }
                        })
                        .catch(function(err) {
                            console.log(err.message);
                        })
                    }
                })
        );
    }

        if(event.tag === 'sync-deleted-aircraft') {
            console.log('[SW]: Delete aircraft...', event);

            event.waitUntil(
                readAllData('aircraft-delete')
                    .then(function(data) {
                        for (var key in data) {
                            fetch(
                                'http://localhost:5054/aircraft/delete/' + data[key].id,
                                {
                                    method: 'DELETE',
                                },
                            )
                            .then(function(response) {
                                console.log(response);
                                if(response.ok) {
                                    deleteItemFromData('aircraft-delete', data[key].id);
                                    self.clients.matchAll().then(all => all.map(client => client.postMessage('sync-complete')));
                                }
                            })
                            .catch(function(err) {
                                console.log(err.message);
                            })
                        }
                    })
            );
        };

});


