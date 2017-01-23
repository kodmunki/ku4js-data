if(!$.exists($.json)) $.json = {};
$.json.serialize = function(obj) {
    if ($.isUndefined(obj)) return undefined;
    if ($.isNull(obj)) return null;
    if (!$.isArray(obj) && !$.isObject(obj))
        return obj.toString();
    var r = [],
        f = ($.isArray(obj)) ? "[{0}]" : "{{0}}";
    for (var n in obj) {
        var o = $.obj.ownProp(obj, n);
        if ($.isUndefined(o) && $.isFunction(o)) continue;
        var v = ($.isNumber(o))
                ? o
                : ($.isDate(o))
                ? '"' + o.toJSON() + '"'
                : ($.isString(o))
                ? '"' + json_serializeString(o) + '"'
                : $.json.serialize(o);
         if($.isUndefined(v)) continue;
        r[r.length] = (($.isObject(obj) && !$.isArray(obj))
            ? ("\"" + n + "\"" + ":")
            : "") + v;
    }
    return $.str.format(f, r);
};

$.json.deserialize = function(str, isTimeZoneAgnostic) {
    return (/function|(=$)/i.test(str)) ? str : $.json.deserialize.unsafe(str, isTimeZoneAgnostic);
};

$.json.deserialize.unsafe = function(str, isTimeZoneAgnostic) {
    var datePattern = /\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
    try {
        var obj = ($.isString(str)) ? eval("(" + json_deserializeString(str) + ")") : str;
        if($.isFunction(obj)) obj = str;
        if(!$.exists(obj)) return obj;
        if($.isNullOrEmpty(obj.tagName) &&
            ($.isObject(obj) || $.isArray(obj))) {
            for (var n in obj) {
                var value = $.obj.ownProp(obj, n);
                if ($.isObject(value) || $.isArray(value)) obj[n] = $.json.deserialize(value, isTimeZoneAgnostic);
                if(datePattern.test(value)) {
                    obj[n] = isTimeZoneAgnostic ? $.dayPoint.parse(value).toDate() : new Date(value);
                }
            }
            return obj;
        }
        if(datePattern.test(obj)) return isTimeZoneAgnostic ? $.dayPoint.parse(obj).toDate() : new Date(obj);
        return obj;
    }
    catch (e) { return str; }
};

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
