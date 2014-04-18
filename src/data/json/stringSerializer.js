function stringJsonSerializer(serializer) {
    stringJsonSerializer.base.call(this, serializer);
}
stringJsonSerializer.prototype = {
    $canSerialize: function(obj) { return $.isString(obj); },
    $canDeserialize: function(str) {
        try {
            if($.isString(str) && /[\+\-\*\\\\(\)\{\}/]/.test(str)) return true;
            var value = eval("(" + str + ")");
            return $.exists(value) &&
                   $.isString(str) &&
                   !($.isBool(value) ||
                     $.isNumber(value) ||
                     $.isDate(value) ||
                     $.isArray(value) ||
                     $.isObject(value));
        }
        catch(e) { return $.isString(str); }
    },
    $serialize: function(obj) {
        var str = obj.replace(/\\/g,"\\\\")
                     .replace(/\"/g,"\\\"")
                     .replace(/\//g,"\/")
                     .replace(/\f/g,"\\f")
                     .replace(/\n/g,"\\n")
                     .replace(/\r/g,"\\r")
                     .replace(/\t/g,"\\t");
        return '"' + str + '"';
    },
    $deserialize: function(str) {
        str.replace(/\\\//g,"/")
           .replace(/\\\\f/g,"\\f")
           .replace(/\\\\n/g,"\\n")
           .replace(/\\\\r/g,"\\r")
           .replace(/\\\\t/g,"\\t");

        try {
            var value = eval("(" + str + ")");
            return $.isString(value) ? value : $.isString(str) ? str : undefined;
        }
        catch(e) { return $.isString(str) ? str : undefined; }
    }
};
$.Class.extend(stringJsonSerializer, baseJsonSerializer);
$.ku4stringJsonSerializer = function(serializer){ return new stringJsonSerializer(serializer); };