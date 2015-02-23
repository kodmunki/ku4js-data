function localStorageStore() { }
localStorageStore.prototype = {
    read: function(collectionName, callback, scope) {
        var collection = localStorage.getItem(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this),
            scp = scope || this;

        if($.exists(callback)) callback.call(scp, null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback, scope) {
        var scp = scope || this;
        localStorage.setItem(collection.name(), collection.serialize());
        if($.exists(callback)) callback.call(scp, null, this, collection);
        return this;
    },
    remove: function(collection, callback, scope) {
        var scp = scope || this;
        localStorage.removeItem(collection.name());
        if($.exists(callback)) callback.call(scp, null, this, collection);
        return this;
    },
    __delete: function(callback, scope) {
        var scp = scope || this;
        localStorage.clear();
        if($.exists(callback)) callback.call(scp, null, this);
        return this;
    }
};
$.Class.extend(localStorageStore, abstractStore);
$.ku4localStorageStore = function() { return new localStorageStore(); };
