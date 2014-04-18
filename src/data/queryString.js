if(!$.exists($.queryString)) $.queryString = {};
$.queryString.serialize = function(obj) {
    var result = "";
    $.hash(obj).each(function(item){
        var value = item.value,
            serializeValue = $.isDate(value) ? $.dayPoint.parse(value).toJson() : value;
        result += $.str.format("&{0}={1}", encodeURIComponent(item.key), encodeURIComponent($.json.serialize(serializeValue)));
    });
    return result.replace(/^\&/, "");
};
$.queryString.deserialize = function(str) {
    if(!/\??\w+=\w+/.test(str)) return;
    var queryString = str.replace(/.*\?/, ""),
        keyValuePairs = queryString.split("&"),
        result = $.hash();

    $.list(keyValuePairs).each(function(item) {
        var pair = item.split("="),
            key = pair[0],
            value = pair[1],
            deserializeValue = (/^null$|^true$|^false$|^\d+(\.\d+?)?$|^\[.*\]$|^\{.*\}$/.test(value))
                                ? value
                                : '"' + value + '"';

        result.add(decodeURIComponent(key), $.json.deserialize(decodeURIComponent(deserializeValue)));
    });

    return result.toObject();
};