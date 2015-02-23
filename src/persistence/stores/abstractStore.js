function abstractStore(name) {
    this._name = name || "ku4indexedDbStore";
}
abstractStore.prototype = {
    read: function(collectionName, callback, scope) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    write: function(collection, callback, scope) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    remove: function(collection, callback, scope) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __delete: function(callback, scope) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __reset: function(callback, scope) {
        return this.__delete(callback, scope);
    }
};