function indexedDbStore(name) {
    this._name = name || "ku4indexedDbStore";
}
indexedDbStore.prototype = {
    read: function(collectionName, callback) {
        var name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            db.transaction(collectionName)
                .objectStore(collectionName)
                .get(1)
                .onsuccess = function (event) {
                    var data = event.target.result,
                        collection = $.ku4collection(collectionName, data).store(me);
                    callback(null, collection);
                    db.close();
                };
        });
        return this;
    },
    write: function(collection, callback) {
        var storeName = collection.name(),
            name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) callback(err, null);
            else {
                var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(collection.toObject(), 1);
                request.onerror = function () {
                    callback(new Error("Error writing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    callback(null, me);
                    db.close();
                };
            }
        }, this, storeName);
        return this;
    },
    remove: function(collection, callback) {
        var storeName = collection.name(),
            name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) callback(err, null);
            else {
                var request = db.transaction([storeName], "readwrite").objectStore(storeName)["delete"](1);
                request.onerror = function () {
                    callback(new Error("Error removing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    callback(null, me);
                    db.close();
                };
            }
        }, this, storeName);
        return this;
    },
    __delete: function() {
        var idxdb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        idxdb.deleteDatabase(this._name);
        return this;
    }
};

$.ku4indexedDbStore = function(name) { return new indexedDbStore(name); };

function ku4indexedDbStore_openDb(name, callback, scope, storeName) {
    var idxdb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,
        request = idxdb.open(name, 101),
        scp = scope || window;

    request.error = function(){
        callback.call(scp, new Error("Error opening Indexed Database."), null);
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        db.createObjectStore(storeName, { autoIncrement: false });
    };

    request.onsuccess = function () {
        var db = request.result;
        callback.call(scp, null, db);
    };
}