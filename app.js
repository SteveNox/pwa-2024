//Standardpromiseaufruf
// promise.then(function(text) {
//     console.log(text);
// }).catch(function(error) {
//     console.log(error);
// })

if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('[SW]: Service worker registered!');
        });
};

// var raceCondition = false;

// //cache first and update with network if possible whichever is faster
// fetch('https://httpbin.org/get')
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         raceCondition = true;
//         console.log('from web', data);
//     });

// if ('caches' in window) {
//     caches.match('https://httpbin.org/get')
//         .then(function(response) {
//             if(response) {
//                 return response.json();
//             }
//         })
//         .then(function(data) {
//             if(!raceCondition) {
//                 console.log('from cache', data);
//             }
//         })
// }


// if('caches' in window) {
//     fetch('https://httpbin.org/get')
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         console.log('from web', data);
//         caches.open('immutable')
//             .then(function(immutableCache) {
//                 immutableCache.put('https://httpbin.org/get', data);
//             })        
//     });
// }
// fetch('https://httpbin.org/get')
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         raceCondition = true;
//         console.log('from web', data);
//     });

// console.log("1 BEFORE TIMEOUT!")
// setTimeout(function() {
//     console.log("2 TIMEOUT COMPLETE")
// }, 5000);
// console.log("3 AFTER TIMEOUT!")
// console.log('1 BEFORE TIMEOUT!')

// var promise = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         //resolve('2 TIMEOUT COMPLETE')
//         reject('Absichtlicher Fehler')
//     }, 3000);
// });

// promise.then(res => {
//     console.log(res);
// }).catch(err => {
//     console.log(err);
// }).finally(() => {
//     console.log('Finally!')
// });

// awaitingTest();
// async function awaitingTest() {
//     try {
//         const result = await promise;
//         console.log(result);
//     } catch(error) {
//         console.log(error);
//     } finally {
//         console.log('Finally!')
//     }
// }

// fetch('http://httpbin.org/ip')
//     .then(function(response) {
//         console.log(response);
//         return response.json();
//     })
//     .then(function(result) {
//         console.log(result);
//     })
//     .catch(function(error) {
//         console.log("FEHLER->", error);
//     });