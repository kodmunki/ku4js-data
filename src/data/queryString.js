if(!$.exists($.queryString)) $.queryString = {};
$.queryString.serialize = function(obj) {
    var r = "",
        e = encodeURIComponent;
    for (var n in obj)
        r += $.str.format("&{0}={1}", e(n), e($.json.serialize(obj[n])));
    return r.replace(/^\&/, "");
}
$.queryString.deserialize = function(str) {
    var q = str.replace(/.*\?/, ""), o = {}, kvs = q.split("&");
    if(!/\??\w+=\w+/.test(str)) return null;
    for (var n in kvs) {
        var d = decodeURIComponent, kv = (kvs[n]).split("=");
        o[d(kv[0])] = $.json.deserialize(d(kv[1]));
    }
    return o;
}