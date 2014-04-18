function stringQueryStringSerializer(serializer) {
    stringQueryStringSerializer.base.call(this, serializer);
}
stringQueryStringSerializer.prototype = {
    $canSerialize: function(obj) { return $.isString(obj); },
    $canDeserialize: function(str) {
        try {
            if(/[\+\-\*\\\/]/.test(str)) return true;
            var value = eval("(" + str + ")");
            return $.exists(value) &&
                   !($.isBool(value) ||
                     $.isNumber(value) ||
                     $.isDate(value) ||
                     $.isArray(value) ||
                     $.isObject(value));
        }
        catch(e) { return $.isString(str); }
    },
    $serialize: function(obj) { return obj; },
    $deserialize: function(str) { return str; }
};
$.Class.extend(stringQueryStringSerializer, baseQueryStringSerializer);
$.ku4stringQueryStringSerializer = function(serializer){ return new stringQueryStringSerializer(serializer); };