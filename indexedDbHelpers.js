var dbPromise = idb.open('testStore', 1, function(db) {
    if (!db.objectStoreNames.contains('apiData')) {
        db.createObjectStore('apiData', {keyPath: 'date'});
        db.createObjectStore('myData', {keyPath: 'name'});
    }
});

//CRUD
//Create
//Read
//Update
//Delete
//Upsert

function writeData(st, data) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite'); //or readonly
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
}

function clearAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        });
}

function readAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        });
}

function deleteItemFromData(st, id) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(function() {
            console.log('Item deleted!');
        });
}