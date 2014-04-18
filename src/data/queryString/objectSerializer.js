function objectQueryStringSerializer(serializer) {
    objectQueryStringSerializer.base.call(this, serializer);
}
objectQueryStringSerializer.prototype = {
    $canSerialize: function(obj) {
        return $.exists(obj) &&
               $.isObject(obj) &&
                !($.isBool(obj) ||
                  $.isNumber(obj) ||
                  $.isDate(obj) ||
                  $.isArray(obj) ||
                  $.isString(obj) ||
                  $.isFunction(obj));
    },
    $canDeserialize: function(str) {
        return $.exists(str) &&
               $.isObject(str) &&
               !($.isBool(str) ||
                 $.isNumber(str) ||
                 $.isDate(str) ||
                 $.isArray(str) ||
                 $.isString(str)) ||
               ($.isString(str) && /^\{.*\}$/.test(str));
    },
    $serialize: function(obj) {
        var serialized = $.list();
        $.hash(obj).each(function(item){
            var value = this.serialize(item.value);
            if(!$.isUndefined(value)) {
                var _value = ($.isString(value)) ? '"' + value + '"' : value;
                serialized.add($.str.format('"{0}":{1}', item.key, _value));
            }
        }, this);
        return $.str.format("{{0}}", serialized.toArray());
    },
    $deserialize: function(str) {
        if($.isObject(str)) return str;
        if($.isString(str) && /\{\s*\}/.test(str)) return {};
        else {
            var values = eval("(" + str + ")"),
                deserialized = $.hash();

            $.hash(values).each(function(item) {
                var value = this.deserialize(item.value);
                if (!$.isUndefined(value))
                    deserialized.add(item.key, value);
            }, this);

            return deserialized.toObject();
        }
    }
};
$.Class.extend(objectQueryStringSerializer, baseQueryStringSerializer);
$.ku4objectQueryStringSerializer = function(serializer){ return new objectQueryStringSerializer(serializer); };