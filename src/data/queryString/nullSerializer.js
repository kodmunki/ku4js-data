function nullQueryStringSerializer(serializer) {
    nullQueryStringSerializer.base.call(this, serializer);
}
nullQueryStringSerializer.prototype = {
    $canSerialize: function(obj) { return obj === null; },
    $canDeserialize: function(str) { return $.isNull(str) || ($.isString(str) && /^null$/.test(str)); },
    $serialize: function(obj) { return obj + ""; },
    $deserialize: function(str) { return null; }
};
$.Class.extend(nullQueryStringSerializer, baseQueryStringSerializer);
$.ku4nullQueryStringSerializer = function(serializer){ return new nullQueryStringSerializer(serializer); };