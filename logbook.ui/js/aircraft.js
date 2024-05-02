class aircraftPage {
    constructor() {
        this.aircraft = [];
        this.init();

        // handle event thrown by service worker, when db is complete 
        navigator.serviceWorker.ready.then(() => {
          navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data.action === 'sync-complete') {
              // Repaint the page here
              console.log('Data from network in event:', event.data.data);
              this.showWaitIndicator(true);
              this.init();
            }
          }.bind(this));
        });

        this.video = document.getElementById('player');
        this.canvas = document.getElementById('canvas');
        this.capture = document.getElementById('capture-button');
    }

    showWaitIndicator(value) {
        this.waitIndicator = !value;
        document.getElementById('waitIndicator').hidden=!value;
    };

    init() {
      try {

        var networkDataReceived = false;

        document.getElementById('aircraftForm').reset();
        this.showWaitIndicator(true);
        // Load from cache first
        if ('indexedDB' in window) {
          readAllData('aircraft-cache')
            .then(data => {
              if (!networkDataReceived) { // If network data hasn't already updated the display
                console.log('From cache', data);
                this.aircraft = data;
                this.render();
              }
            });
        }

        // Then fetch from network and update display
        fetch('http://localhost:5054/aircraft')
          .then(response => response.json())
          .then(data => {
            console.log('From network', data);
            this.aircraft = data;
            this.render();
          })
        
      } 
      catch (error) {
        console.error('Failed to initialize:', error);
      } 
      finally {
        this.showWaitIndicator(false);
      }
    }

    render() {
        const table = document.getElementById('aircraftTable');
        table.innerHTML = '<thead><tr><th scope="col">#</th><th scope="col">Callsign</th><th scope="col">Manufacturer</th><th scope="col">Model</th><th scope="col">Action</th></tr></thead>';
        table.innerHTML += '<tbody>';
        this.aircraft.forEach(aircraft => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aircraft.id}</td>
            <td>${aircraft.callsign}</td>
            <td>${aircraft.manufacturer}</td>
            <td>${aircraft.model}</td>
            <td><button type="button" class="btn btn-sm btn-danger" onclick="page.delete(${aircraft.id})">Delete</button>
            <button type="button" class="btn btn-sm btn-primary" onclick="page.edit(${aircraft.id})">Edit</button></td>
        `;
        table.appendChild(tr);
        });
        table.innerHTML += '</tbody>';
    }

    async post(event) {
        this.showWaitIndicator(true);
        event.preventDefault();
        
        const formData = {
            id: Number(document.getElementById('id').value),
            callsign: document.getElementById('callsign').value,
            manufacturer: document.getElementById('manufacturer').value,
            model: document.getElementById('model').value,
        };

        if('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready
            .then(sw => {
              writeData('aircraft-create', formData)
                .then(() => {
                  return sw.sync.register('sync-new-aircraft');
                })
                .then(() => {
                  writeData('aircraft-cache', formData).then(() => {this.init()});
                })
                .catch(function(err) {
                  console.log(err);
                }).finally(()=> {

                  this.showWaitIndicator(false);
                })
            })
        } else {
          try {
              const res = await fetch(
                'http://localhost:5054/aircraft',
                {
                  method: 'POST',
                  body: JSON.stringify(formData),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );
              console.log(res);
              const resData = await res.json();
              if (res.ok) {
                  this.init();
              }
              console.log(resData);
            } catch (err) {
              console.log(err.message);
            } finally {
              this.showWaitIndicator(false);
            }
        } 
    }

    async edit(id) {
        this.showWaitIndicator(true);
          try {
            const res = await fetch(
              'http://localhost:5054/aircraft/' + id,
              {
                method: 'GET',
              },
            );
            console.log(res);
            const resData = await res.json();
            if (res.ok) {
                document.getElementById('id').value = resData.id;
                document.getElementById('callsign').value = resData.callsign;
                document.getElementById('manufacturer').value = resData.manufacturer;
                document.getElementById('model').value = resData.model;
            }
            console.log(resData);
          } catch (err) {
            console.log(err.message);
          } finally {
            this.showWaitIndicator(false);
          }
    }

    async delete(id) {
      this.showWaitIndicator(true);

      if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(sw => {
            readItemFromData('aircraft-cache', id)
              .then((item)=>{
                console.log("ITEM TO DELETE", item);
                writeData('aircraft-delete', item)
                .then(() =>{
                  return sw.sync.register('sync-deleted-aircraft');
                })
                .then(() => {
                  deleteItemFromData('aircraft-cache', id);
                })
                .catch(function(err) {
                  console.log(err);
                }).finally(()=> {
                  this.showWaitIndicator(false);
                  this.init();
                }) 
              });
            
          })
      } else {
        try {
          const res = await fetch(
            'http://localhost:5054/aircraft/delete/' + id,
            {
              method: 'DELETE',
            },
          );
          if (res.ok) {
              this.init();
          }
        } catch (err) {
          console.log(err.message);
        } finally {
          this.showWaitIndicator(false);
        }
    }
  }
  askForNotificationPermission() {
    Notification.requestPermission(result => {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        this.displayConfirmNotification();
        this.configurePushsubscription();
      }
    });
  }

  displayConfirmNotification() {
      //const options = { body: "Hello World!" };
      const options = {
        body: 'hello world! You successfully subscribed to our Notification service!',
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

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then(sw => {
            sw.showNotification('Successfully subscribed!', options);
          });
      }

      // if ("Notification" in window) {
      //   if (Notification.permission === "granted") {
      //     new Notification('Successfully subscribed!', options);
      //   } else if (Notification.permission !== "denied") {
      //     Notification.requestPermission().then(permission => {
      //       if (permission === "granted") {
      //         new Notification('Successfully subscribed!', options);
      //       }
      //     });
      //   }
      // }

  }
  
  configurePushsubscription() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    var swRegistration;

    navigator.serviceWorker.ready
      .then(function(sw) {
        swRegistration = sw;
        return swRegistration.pushManager.getSubscription();
      })
      .then(function(subscription) {
        if (subscription === null) {
          //npm install web-push -g
          //web-push generate-vapid-keys --json
          // {"publicKey":"BLQ2M8Zcrr3T0HvQc1Y5i0MD-bZclVJnmr0aR04zEpBEfQaK9WOQvVISThPwD3YoTcGlcOGXH-a1TWU9YPj-zh4","privateKey":"CNFqf7btf6T_4BAUiy4ZUBZW-ImTyel777Azg7CZQoQ"}
          var vapidPublicKey = 'BLQ2M8Zcrr3T0HvQc1Y5i0MD-bZclVJnmr0aR04zEpBEfQaK9WOQvVISThPwD3YoTcGlcOGXH-a1TWU9YPj-zh4';
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
          // {"endpoint":"https://wns2-par02p.notify.windows.com/w/?token=BQYAAACORVzI9LgvqSkbqXRYfthDg3kwBu3ebRAalxbxZ3aWuvAGbVGtPT1RNkoKcsmW13rAvpC4pV%2bJR0GzX5O21MOysab6dMrf0Ew7nays%2fsApjvsA9mpLz5cYKTtXQ8rAJJPZAiFIacQ2HbKaTPiBXy%2fl4Y5P8DxlEwfPGVMz%2b2b1W5GUmCVxi5BP%2bmFEZafQgLSPZFB%2f5a%2bkiQxFz66ZxA7hEUbFCSwcs53%2b6iGet9qBUR7RbtABYrbEzeK1WDM9A70DJBsBe3n0RD3qUa%2biuFIQ5S6imboYxWkS6Gjdad%2bF4c2k6AmiUMunbWDdUYYFwDE%3d","expirationTime":null,"keys":{"p256dh":"BIELlCvOoC-LGcgOJNjkL9-1IDAQAkkAWhsfRFV9KLsWmWXQinNgHBy8ZQlQLxH7aG54djlM9SqRsNr-Bp_zZgE","auth":"80W0R_ZcZxh6NOazuOvr5g"}}
          swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          }).then(function(newSubscription) {
            //post to backend and save subscription
            console.log(JSON.stringify(newSubscription));
          });
        } else {
          //use existing subscription
          //backend: is registration correct?
          console.log(JSON.stringify(subscription));
        }
      });
  };

  initializeMedia() {
    if (!('mediaDevices' in navigator)) {
      navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented!'));
        }

        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
      .then(stream => {
        this.video.srcObject = stream;
      })
      .catch(err => {
        console.log(err.message);
      });

    this.capture.addEventListener('click', event => {
      this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.video.srcObject.getVideoTracks().forEach(track => {
        track.stop();
      });

      console.log('Picture', this.canvas.toDataURL());

      this.picture = dataURItoBlob(this.canvas.toDataURL());
      console.log('Picture BLOB', this.picture);
    });
  }

  initializeLocation() {
    if (!('geolocation' in navigator)) {
      // hide location button...
      return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      console.log('Current Position ->', position);
    }, function(error) {
      console.log('Error getting location ->', error);
    }, { timeout: 7000 });
  }
}