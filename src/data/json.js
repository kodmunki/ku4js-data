if(!$.exists($.json)) $.json = {};
$.json.serialize = function(obj) {
    if ($.isUndefined(obj)) return undefined;
    if ($.isNull(obj)) return null;
    if (!$.isArray(obj) && !$.isObject(obj))
        return obj.toString();
    var r = [],
        f = ($.isArray(obj)) ? "[{0}]" : "{{0}}";
    for (var n in obj) {
        var o = obj[n];
        if ($.isUndefined(o) && $.isFunction(o)) continue;
        var v = ($.isNumber(o))
                ? o
                : ($.isDate(o))
                ? '"' + $.dayPoint.parse(o).toJson() + '"'
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
$.json.deserialize = function(str) {
    if ($.isObject(str)) return str;
    if ($.isString(str))
        try {
            var obj = eval("(" + json_deserializeString(str) + ")");
            if(!$.exists(obj)) return obj;
            if($.isNullOrEmpty(obj.tagName) &&
                ($.isObject(obj) || $.isArray(obj))) {
                for (var n in obj) {
                    var value = obj[n];
                    if(/\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(obj[n]))
                        obj[n] = $.dayPoint.parse(value).toDate();
                }
                return obj;
            }
            console.log("STR == ", obj)
            return (/\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(obj))
                    ? $.dayPoint.parse(obj).toDate()
                    : obj;
        }
        catch (e) { console.log(e); return str; }
    return undefined;
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