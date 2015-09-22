function collection(name, obj, isAsync) {
    if(!$.exists(name))
        throw $.ku4exception("$.collection", $.str.format("Invalid name={0}. Must be unique", name));
    this._name = name;
    this._data = $.dto(obj);
    this._store = (isAsync) ? $.ku4AsyncStore() : $.ku4store();

}
collection.prototype = {
    name: function() { return this._name; },
    isEmpty: function() { return this._data.isEmpty(); },
    count: function() { return this._data.count(); },
    store: function(store) { this._store = collection_getStore(store); return this; },
    save: function(callback, scope) { this._store.write(this, callback, scope); return this; },
    init: function(list) { return this.remove().insertList(list); },
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
    join: function(other, onKey, equalKey, direction) {
        var thisResults = $.list(this.find()),
            otherResults = $.list(other.find()),
            thisName = this.name(),
            otherName = other.name(),
            func = ($.isFunction(onKey)) ? onKey : function(t, o) { return t[onKey] === o[equalKey]},
            outerDirection = ($.isFunction(onKey)) ? equalKey : direction,
            join = $.hash();

        function addRecord(thisResult, otherResult) {
            var record = $.hash();
            if($.exists(thisResult)) $.hash(thisResult).each(function(obj) { record.add(thisName + "." + obj.key, obj.value); });
            if($.exists(otherResult)) $.hash(otherResult).each(function(obj) { record.add(otherName + "." + obj.key, obj.value); });
            join.add($.uid(), record.toObject());
        }

        //NOTE: This ensures that a right outer join on an empty set returns the join data.
        if(thisResults.isEmpty() && outerDirection === ">") {
            otherResults.each(function (otherResult) {
                addRecord(null, otherResult)
            });
        }
        else {
            var isOuterJoin = $.exists(outerDirection);
            if(isOuterJoin) {
                //NOTE: This performs the outer join.
                var isRight = outerDirection === ">",
                    leftCollection = (isRight) ? otherResults : thisResults,
                    rightCollection = (isRight) ? thisResults : otherResults;

                leftCollection.each(function (thisResult) {
                    var didAddThisResult = false;
                    rightCollection.each(function (otherResult) {
                        if (isRight) {
                            if (func(otherResult, thisResult)) {
                                addRecord(otherResult, thisResult);
                                didAddThisResult = true;
                            }
                        }
                        else {
                            if (func(thisResult, otherResult)) {
                                addRecord(thisResult, otherResult);
                                didAddThisResult = true;
                            }
                        }
                    });
                    if (!didAddThisResult) {
                        if (isRight) addRecord(null, thisResult);
                        else addRecord(thisResult, null);
                    }
                });
            }
            else thisResults.each(function(thisResult) {
                otherResults.each(function(otherResult) {
                    if(func(thisResult, otherResult)) {
                        addRecord(thisResult, otherResult)
                    }
                });
            });
        }
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
$.ku4collection = function(name, obj, isAsync) { return new collection(name, obj, isAsync); };
$.ku4collection.Class = collection;

$.ku4collection.deserialize = function(serialized) {
    var obj = $.json.deserialize(serialized);
    return new collection(obj.name, obj.data);
};

function collection_getStore(store) {
    if($.isString(store)) {
        switch (store) {
            case "$.ku4indexedDbStore":
                return $.ku4indexedDbStore();
            case "$.ku4localStorageStore":
                return $.ku4localStorageStore();
            default:
                return $.ku4memoryStore();
        }
    }
    return store;
}

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
        func = ($.isFunction(val))
                ? function(a, b) { return val(a[key], b[key]); }
                : function(a, b) { return (a[key] < b[key]) ? -val : val; };

    return arry.sort(func);
}