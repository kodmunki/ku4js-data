function booleanQueryStringSerializer(serializer) {
    booleanQueryStringSerializer.base.call(this, serializer);
}
booleanQueryStringSerializer.prototype = {
    $canSerialize: function(obj) { return /boolean/.test(typeof obj); },
    $canDeserialize: function(str) { return $.isBool(str) || ($.isString(str)  && /^true|false$/.test(str)); },
    $serialize: function(obj) { return obj.toString(); },
    $deserialize: function(str) { return $.isBool(str) ? str : /^true$/.test(str); }
};
$.Class.extend(booleanQueryStringSerializer, baseQueryStringSerializer);
$.ku4booleanQueryStringSerializer = function(serializer){ return new booleanQueryStringSerializer(serializer); };