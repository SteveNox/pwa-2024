//lifecycle event
self.addEventListener('install', function(event) {
    console.log('[SW]: Service worker installing...', event);
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
});

self.addEventListener('sync', function(event) {
    console.log('[SW]: Service worker syncing...', event);
});