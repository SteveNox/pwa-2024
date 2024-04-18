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