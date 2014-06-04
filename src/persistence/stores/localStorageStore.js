function localStorageStore() { }
localStorageStore.prototype = {
    read: function(collectionName, callback) {
        var collection = localStorage.getItem(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this);

        if($.exists(callback)) callback(null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback) {
        localStorage.setItem(collection.name(), collection.serialize());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    remove: function(collection, callback) {
        localStorage.removeItem(collection.name());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    __delete: function(callback) {
        localStorage.clear();
        if($.exists(callback)) callback(null, this);
        return this;
    }
};
$.ku4localStorageStore = function() { return new localStorageStore(); };
