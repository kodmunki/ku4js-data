function collection(name, obj) {
    if(!$.exists(name)) throw new Error($.str.format("$.collection requires a valid unique name. name = {0}", name));
    this._name = name;
    this._data = $.dto(obj);
}
collection.prototype = {
    name: function() { return this._name; },
    isEmpty: function() { return this._data.isEmpty(); },
    count: function() { return this._data.count(); },
    store: function(store) { this._store = store; return this; },
    save: function() { this._store.write(this); return this; },
    findByKu4Id: function(ku4Id) {
        return this._data.findValue(ku4Id);
    },
    find: function(criteria) {
        if(!$.exists(criteria)) return this._data.values();

        var entities = $.list();
        this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(criteria)) entities.add(entity);
        });
        return entities.toArray();
    },
    insert: function(entity) {
        var ku4Id = $.uid(),
            dto = $.dto(entity);
        if(!$.exists(entity._ku4Id)) dto.merge({"_ku4Id": ku4Id});

        var data = dto.toObject();
        this._data.add(ku4Id, data);
        return data;
    },
    remove: function(criteria) {
        if(!$.exists(criteria)) this._data.clear();
        else this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(criteria)) this._data.remove(entity._ku4Id);
        }, this);
        return this;
    },
    update: function(current, updates) {
        var _updates = $.dto(updates).remove("_ku4Id");
        if(!$.exists(current) || !$.exists(updates)) return;
        else this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(current)) {
                var newValue = $.dto(entity).merge(_updates).toObject();
                this._data.update(obj.key, newValue);
            }
        }, this);
        return this;
    },
    __delete: function() {
        this._store.remove(this);
        return this;
    },
    serialize: function() {
        var name = this._name,
            data = this._data.toObject();
        return $.dto({ "name": name, "data": data }).toJson();
    }
}
$.ku4collection = function(name, obj) { return new collection(name, obj); }
$.ku4collection.deserialize = function(serialized) {
    var obj = $.dto.parseJson(serialized).toObject();
    return new collection(obj.name, obj.data); }