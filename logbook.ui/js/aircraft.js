class aircraftPage {
    constructor() {
        this.aircraft = [];
        this.init();

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
                  writeData('aircraft-cache', formData).then(() => {this.init});
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
        body: 'You successfully subscribed to our Notification service!',
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
          var vapidPublicKey = 'BFOTzhZHGeTcfb1RHWbHsJ6QArYb6TVFplPDoa-0oMoejmHe317rxngcSLFq7Fsfd3Nm3qWl2mcIS8053cPo62E';
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

          swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          }).then(function(newSubscription) {
            console.log(JSON.stringify(newSubscription));
          });
        } else {
          //use existing subscription
          console.log(JSON.stringify(subscription));
        }
      });
    };
}