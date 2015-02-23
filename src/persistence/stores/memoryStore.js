var __ku4MemoryStore = $.dto();
function memoryStore() { }
memoryStore.prototype = {
    read: function(collectionName, callback, scope) {
        var collection = __ku4MemoryStore.find(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this),
            scp = scope || this;

        if($.exists(callback)) callback.call(scp, null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback, scope) {
        var scp = scope || this;
        __ku4MemoryStore.update(collection.name(), collection.serialize());
        if($.exists(callback)) callback.call(scp, null, this, collection);
        return this;
    },
    remove: function(collection, callback, scope) {
        var scp = scope || this;
        __ku4MemoryStore.remove(collection.name());
        if($.exists(callback)) callback.call(scp, null, this, collection);
        return this;
    },
    __delete: function(callback, scope) {
        var scp = scope || this;
        __ku4MemoryStore.clear();
        if($.exists(callback)) callback.call(scp, null, this);
        return this;
    }
};
$.Class.extend(memoryStore, abstractStore);
$.ku4memoryStore = function() { return new memoryStore(); };
