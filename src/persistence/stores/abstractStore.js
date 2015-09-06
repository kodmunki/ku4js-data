function abstractStore(name) {
    this._name = name || "ku4indexedDbStore";
}
abstractStore.prototype = {
    read: function(collectionName, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    write: function(collection, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    remove: function(collection, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __delete: function(callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __reset: function(callback) {
        return this.__delete(callback);
    }
};