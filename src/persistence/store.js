function store() { }
store.prototype = {
    read: function(collectionName) {
        var collection = localStorage.getItem(collectionName);
        return ($.exists(collection))
            ? $.ku4collection.deserialize(collection).store(this)
            : $.ku4collection(collectionName).store(this);
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

function tempStore() { }
tempStore.prototype = {
    read: function(collectionName) {
        var collection = __ku4tempStore.find(collectionName);
        return ($.exists(collection))
            ? $.ku4collection.deserialize(collection).store(this)
            : $.ku4collection(collectionName).store(this);
    },
    write: function(collection) {
        __ku4tempStore.update(collection.name(), collection.serialize());
        return this;
    },
    remove: function(collection) {
        __ku4tempStore.remove(collection.name());
        return this;
    },
    __delete: function() {
        __ku4tempStore.clear();
        return this;
    }
};
var __ku4tempStore = $.dto();

$.ku4store = function() {
    if(!$.exists(localStorage)) return new tempStore();
    else return new store();
};