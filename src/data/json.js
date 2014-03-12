if(!$.exists($.json)) $.json = {};
$.json.serialize = function(obj) {
    if ($.isNull(obj)) return null;
    if ($.isUndefined(obj)) return undefined;
    if (!$.isArray(obj) && !$.isObject(obj))
        return obj.toString();
    var r = [],
        f = ($.isArray(obj)) ? "[{0}]" : "{{0}}";
    for (var n in obj) {
        var o = obj[n];
        if ($.isFunction(o)) continue;
        var v = ($.isUndefined(o))
                ? '"' + "undefined" + '"'
                : ($.isNumber(o))
                ? o
                : ($.isString(o))
                    ? '"' + json_serializeString(o) + '"'
                    : $.json.serialize(o);
        r[r.length] = (($.isObject(obj) && !$.isArray(obj))
            ? ("\"" + n + "\"" + ":")
            : "") + v;
    }
    return $.str.format(f, r);
}
$.json.deserialize = function(str) {
    if ($.isObject(str)) return str;
    if ($.isString(str))
        try {
            var obj = eval("(" + json_deserializeString(str) + ")");
            if(!$.exists(obj)) return obj;
            if($.isNullOrEmpty(obj.tagName)) return obj;
            return str;
        }
        catch (e) { return str; }
    return undefined;
}

function json_serializeString(str) {
    return str
        .replace(/\\/g,"\\\\")
        .replace(/\"/g,"\\\"")
        .replace(/\//g,"\/")
        .replace(/\f/g,"\\f")
        .replace(/\n/g,"\\n")
        .replace(/\r/g,"\\r")
        .replace(/\t/g,"\\t");
}
function json_deserializeString(str) {
    return str
        .replace(/\\\//g,"/")
        .replace(/\\\\f/g,"\\f")
        .replace(/\\\\n/g,"\\n")
        .replace(/\\\\r/g,"\\r")
        .replace(/\\\\t/g,"\\t");
}