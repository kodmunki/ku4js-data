var __ku4MemoryStore = $.dto();

function memoryStore() { }
memoryStore.prototype = {
    read: function(collectionName) {
        var collection = __ku4MemoryStore.find(collectionName);
        return ($.exists(collection))
            ? $.ku4collection.deserialize(collection)
            : $.ku4collection(collectionName);
    },
    write: function(collection) {
        __ku4MemoryStore.update(collection.name(), collection.serialize());
        return this;
    },
    remove: function(collection) {
        __ku4MemoryStore.remove(collection.name());
        return this;
    },
    __delete: function() {
        __ku4MemoryStore.clear();
        return this;
    }
};

$.ku4memoryStore = function() { return new memoryStore(); };
