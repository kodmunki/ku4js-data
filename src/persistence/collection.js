function collection(name, obj) {
    if(!$.exists(name))
        throw $.ku4exception("$.collection", $.str.format("Invalid name={0}. Must be unique", name));
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
    find: function(query) {
        if(!$.exists(query)) return this._data.values();

        var $in = query.$in,
            $orderby = query.$orderby,
            criteria = ($.exists(query.$criteria)) ? query.$criteria : query,
            dto = $.dto(criteria).remove("$in").remove("$orderby"),
            results = ($.exists($in))
                ? collection_in(this._data, $in)
                : (dto.isEmpty())
                    ? this._data.values()
                    : collection_find(this._data, dto.toObject());

        return ($.exists($orderby)) ? collection_orderby(results, $orderby) : results;
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
        var _updates = $.dto(updates).replicate().remove("_ku4Id");
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
$.ku4collection = function(name, obj) { return new collection(name, obj); };
$.ku4collection.deserialize = function(serialized) {
    var obj = $.dto.parseJson(serialized).toObject();
    return new collection(obj.name, obj.data);
};

function collection_find(data, criteria) {
    var entities = $.list();
    data.each(function(obj) {
        var entity = obj.value;
        if($.dto(entity).contains(criteria)) entities.add(entity);
    });
    return entities.toArray();
}

function collection_in(data, criteria) {
    var key = $.obj.keys(criteria)[0],
        ins = $.list(criteria[key]),
        results = [];
   ins.each(function(value) {
        results = results.concat(collection_find(data, $.hash().add(key, value).toObject()));
    });
    return results;
}

function collection_orderby(arry, criteria) {
    var key = $.obj.keys(criteria)[0],
        val = criteria[key],
        func = function(a, b) {
            return (a[key] < b[key]) ? -val : val;
        };
    return arry.sort(func);
}