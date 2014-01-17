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
}

$.ku4store = function() {
    if(!$.exists(localStorage)) throw new Error("This browser does not support $.store");
    else return new store();
}