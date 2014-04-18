function dateJsonSerializer(serializer) {
    dateJsonSerializer.base.call(this, serializer);
}
dateJsonSerializer.prototype = {
    $canSerialize: function(obj) { return $.isDate(obj); },
    $canDeserialize: function(str) { return $.isDate(str) || ($.isString(str) && /^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str)); },
    $serialize: function(obj) { return '"' + $.dayPoint.parse(obj).toJson() + '"'; },
    $deserialize: function(str) { return ($.isDate(str)) ? str : $.dayPoint.parse(str).toDate(); }
};
$.Class.extend(dateJsonSerializer, baseJsonSerializer);
$.ku4dateJsonSerializer = function(serializer){ return new dateJsonSerializer(serializer); };