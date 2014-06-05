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
                    if($.exists(callback)) callback(null, collection);
                    db.close();
                };
        }, this, collectionName);
        return this;
    },
    write: function(collection, callback) {
        var storeName = collection.name(),
            name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) {
                if($.exists(callback)) callback(err, null);
            }
            else {
                var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(collection.toObject(), 1);
                request.onerror = function () {
                    if($.exists(callback)) callback(new Error("Error writing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback(null, me);
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
                    if($.exists(callback)) callback(new Error("Error removing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback(null, me);
                    db.close();
                };
            }
        }, this, storeName);
        return this;
    },
    __delete: function(callback) {
        var idxdb = indexedDB || webkitIndexedDB || mozIndexedDB,
            request = idxdb.deleteDatabase(this._name),
            me = this;

        request.onerror = function() { if($.exists(callback)) callback(new Error("Error deleting indexedDbStore.", me))};
        request.onsuccess = function() { if($.exists(callback)) callback(null, me); };
        return this;
    }
};

$.ku4indexedDbStore = function(name) { return new indexedDbStore(name); };

function ku4indexedDbStore_openDb(name, callback, scope, storeName) {
    var idxdb = indexedDB || webkitIndexedDB || mozIndexedDB,
        request = idxdb.open(name, 1),
        scp = scope || window;

    request.error = function(){
        callback.call(scp, new Error("Error opening Indexed Database."), null);
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result,
            objectStore = db.createObjectStore(storeName, { autoIncrement: false });
    };

    request.onsuccess = function () {
        var db = request.result;
        callback.call(scp, null, db);
    };
}