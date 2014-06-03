function localStorageStore() { }
localStorageStore.prototype = {
    read: function(collectionName) {
        var collection = localStorage.getItem(collectionName);
        return ($.exists(collection))
            ? $.ku4collection.deserialize(collection)
            : $.ku4collection(collectionName);
    },
    write: function(collection) {
        localStorage.setItem(collection.name(), collection.serialize());
        return this;
    },
    remove: function(collection) {
        localStorage.removeItem(collection.name());
        return this;
    },
    __delete: function() {
        localStorage.clear();
        return this;
    }
};
$.ku4localStorageStore = function() { return new localStorageStore(); };
