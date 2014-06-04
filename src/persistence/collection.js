function collection(name, obj) {
    if(!$.exists(name))
        throw $.ku4exception("$.collection", $.str.format("Invalid name={0}. Must be unique", name));
    this._name = name;
    this._data = $.dto(obj);
    this._store = $.ku4store();
}
collection.prototype = {
    name: function() { return this._name; },
    isEmpty: function() { return this._data.isEmpty(); },
    count: function() { return this._data.count(); },
    store: function(store) { this._store = store; return this; },
    save: function(callback) { this._store.write(this, callback); return this; },
    init: function(list) {
        return this.__delete().insertList(list);
    },
    find: function(query) {
        if(!$.exists(query)) return this._data.values();

        var $in = query.$in,
            $spec = query.$spec,
            $orderby = query.$orderby,
            criteria = ($.exists(query.$criteria)) ? query.$criteria : query,
            dto = $.dto(criteria).remove("$in").remove("$spec").remove("$orderby"),
            results = ($.exists($in))
                ? collection_in(this._data, $in)
                : (dto.isEmpty())
                    ? this._data.values()
                    : collection_find(this._data, dto.toObject());

        if($.exists($spec)) results = collection_spec(results, $spec);
        return ($.exists($orderby)) ? collection_orderby(results, $orderby) : results;
    },
    insert: function(entity) {
        var ku4Id = $.uid(),
            dto = $.dto(entity),
            data = dto.toObject();
        this._data.add(ku4Id, data);
        return this;
    },
    insertList: function(list) {
        $.list(list).each(function(entity) { this.insert(entity); }, this);
        return this;
    },
    remove: function(criteria) {
        if(!$.exists(criteria)) this._data.clear();
        else this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(criteria)) this._data.remove(obj.key);
        }, this);
        return this;
    },
    update: function(current, updates) {
        var _updates = $.dto(updates).replicate();
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
    join: function(other, onKey, equalKey) {
        var thisResults = $.list(this.find()),
            otherResults = $.list(other.find()),
            thisName = this.name(),
            otherName = other.name(),
            func = ($.isFunction(onKey)) ? onKey : function(t, o) { return t[onKey] === o[equalKey]},
            join = $.hash();

        function addRecord(thisResult, otherResult) {
            var record = $.hash();
            $.hash(thisResult).each(function(obj) { record.add(thisName + "." + obj.key, obj.value); });
            $.hash(otherResult).each(function(obj) { record.add(otherName + "." + obj.key, obj.value); });
            join.add($.uid(), record.toObject());
        }

        thisResults.each(function(thisResult) {
            otherResults.each(function(otherResult) {
                if(func(thisResult, otherResult)) {
                    addRecord(thisResult, otherResult)
                }
            });
        });
        return $.ku4collection(thisName + "." + otherName, join.toObject());
    },
    exec: function(func) {
        if(!$.isFunction(func))
            throw $.ku4exception("$.collection", $.str.format("Invalid function={0}. exec method requires a function.", name));
        return new execCollection(this, func);
    },
    __delete: function(callback) {
        this.remove()._store.remove(this, callback);
        return this;
    },
    toObject: function() { return this._data.toObject(); },
    serialize: function() {
        var name = this._name,
            data = this.toObject();

        return $.json.serialize({ "name": name, "data": data });
    }
};
$.ku4collection = function(name, obj) { return new collection(name, obj); };
$.ku4collection.deserialize = function(serialized) {
    var obj = $.json.deserialize(serialized);
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

function collection_spec(arry, spec) {
    var results = $.list(),
        _spec = ($.exists(spec.isSatisfiedBy)) ? spec : $.spec(spec);
    $.list(arry).each(function(item){
        if(_spec.isSatisfiedBy(item)) results.add(item);
    });
    return results.toArray();
}

function collection_orderby(arry, criteria) {
    var key = $.obj.keys(criteria)[0],
        val = criteria[key],
        func = function(a, b) {
            return (a[key] < b[key]) ? -val : val;
        };
    return arry.sort(func);
}