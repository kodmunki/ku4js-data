var __ku4MemoryStore = $.dto();
function memoryStore() { }
memoryStore.prototype = {
    read: function(collectionName, callback) {
        var collection = __ku4MemoryStore.find(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this);

        if($.exists(callback)) callback(null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback) {
        __ku4MemoryStore.update(collection.name(), collection.serialize());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    remove: function(collection, callback) {
        __ku4MemoryStore.remove(collection.name());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    __delete: function(callback) {
        __ku4MemoryStore.clear();
        if($.exists(callback)) callback(null, this);
        return this;
    }
};
$.Class.extend(memoryStore, abstractStore);
$.ku4memoryStore = function() { return new memoryStore(); };
