function nullJsonSerializer(serializer) {
    nullJsonSerializer.base.call(this, serializer);
}
nullJsonSerializer.prototype = {
    $canSerialize: function(obj) { return obj === null; },
    $canDeserialize: function(str) { return $.isNull(str) || ($.isString(str) && /^null$/.test(str)); },
    $serialize: function(obj) { return '"' + obj + '"'; },
    $deserialize: function(str) { return null; }
};
$.Class.extend(nullJsonSerializer, baseJsonSerializer);
$.ku4nullJsonSerializer = function(serializer){ return new nullJsonSerializer(serializer); };