function indexedDbStore(name) {
    this._name = name || "ku4indexedDbStore";
}
indexedDbStore.prototype = {
    read: function(collectionName, callback, scope) {
        if(!$.isFunction(callback)) throw $.ku4exception("$.ku4indexedDbStore", "Invalid callback parameter at read");
        var name = this._name,
            scp = scope || this,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            db.transaction(collectionName)
                .objectStore(collectionName)
                .get(1)
                .onsuccess = function (event) {
                    var data = event.target.result,
                        collection = $.ku4collection(collectionName, data).store(me);
                    if($.exists(callback)) callback.call(scp, null, collection);
                    db.close();
                };
        }, collectionName);
        return this;
    },
    write: function(collection, callback, scope) {
        if(!$.isFunction(callback)) throw $.ku4exception("$.ku4indexedDbStore", "Invalid callback parameter at write");
        var collectionName = collection.name(),
            name = this._name,
            scp = scope || this,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) {
                if($.exists(callback)) callback.call(scp, err, me, collection);
            }
            else {
                var request = db.transaction([collectionName], "readwrite").objectStore(collectionName).put(collection.toObject(), 1);
                request.onerror = function () {
                    if($.exists(callback)) callback.call(scp, new Error("Error writing data to indexedDbStore"), me, collection);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback.call(scp, null, me, collection);
                    db.close();
                };
            }
        }, collectionName);
        return this;
    },
    remove: function(collection, callback, scope) {
        if(!$.isFunction(callback)) throw $.ku4exception("$.ku4indexedDbStore", "Invalid callback parameter at remove");
        var collectionName = collection.name(),
            name = this._name,
            scp = scope || this,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) callback.call(scp, err, me, collection);
            else {
                var request = db.transaction([collectionName], "readwrite").objectStore(collectionName)["delete"](1);
                request.onerror = function () {
                    if($.exists(callback)) callback.call(scp, new Error("Error removing data to indexedDbStore"), me, collection);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback.call(scp, null, me, collection);
                    db.close();
                };
            }
        }, collectionName);
        return this;
    },
    __delete: function(callback, scope) {
        if(!$.isFunction(callback)) throw $.ku4exception("$.ku4indexedDbStore", "Invalid callback parameter at __delete");
        var idxdb = indexedDB || webkitIndexedDB || mozIndexedDB,
            request = idxdb.deleteDatabase(this._name),
            scp = scope || this,
            me = this;

        request.onerror = function() {
            if($.exists(callback))
                callback.call(scp, new Error("Error deleting indexedDbStore.", me))}
        ;
        request.onsuccess = function() {
            if($.exists(callback))
                callback.call(scp, null, me);
        };
        return this;
    },
    __reset: function(callback, scope) {
        if(!$.isFunction(callback)) throw $.ku4exception("$.ku4indexedDbStore", "Invalid callback parameter at __reset");
        var scp = scope || this;
        this.__delete(function(err, store) {
            __ku4indexedDbStoreVersion = 0;
            if($.exists(callback)) callback.call(scp, err, store);
        });
    }
};
$.Class.extend(indexedDbStore, abstractStore);
$.ku4indexedDbStore = function(name) { return new indexedDbStore(name); };

var __ku4indexedDbStoreVersion = 0;
var __ku4indexedDbStorage;
function ku4indexedDbStore_openDb(name, callback, collectionName) {
    var idxdb = ku4indexedDbStore_getIdbx(),
        request = (__ku4indexedDbStoreVersion < 1)
                    ? idxdb.open(name)
                    : idxdb.open(name, __ku4indexedDbStoreVersion);

    request.error = function(){
        callback(new Error("Error opening Indexed Database."), null);
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        db.createObjectStore(collectionName, { autoIncrement: false });
    };

    request.onsuccess = function () {
        var db = request.result;
        __ku4indexedDbStoreVersion = db.version;
        try {
            db.transaction(collectionName);
            callback(null, db);
        }
        catch(e)
        {
            __ku4indexedDbStoreVersion++;
            ku4indexedDbStore_openDb(name, callback, collectionName);
        }
    };
}

function ku4indexedDbStore_getIdbx()
{
    if($.exists(__ku4indexedDbStorage)) return __ku4indexedDbStorage;
    else {
        try {
            __ku4indexedDbStorage = indexedDB || webkitIndexedDB || mozIndexedDB;
        }
        catch (e) {
            try {
            __ku4indexedDbStorage = webkitIndexedDB || mozIndexedDB;
            }
            catch (e) {
                try {
                    __ku4indexedDbStorage = mozIndexedDB;
                }
                catch (e) {
                    throw $.ku4exception("Unsupported Exception", "Browser or Process does not support IndexedDB -- 500");
                }
            }
        }
        if($.exists(__ku4indexedDbStorage)) return __ku4indexedDbStorage;
        throw $.ku4exception("Unsupported Exception", "Browser or Process does not support IndexedDB -- 404");
    }
}