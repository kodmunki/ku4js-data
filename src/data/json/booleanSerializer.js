function booleanJsonSerializer(serializer) {
    booleanJsonSerializer.base.call(this, serializer);
}
booleanJsonSerializer.prototype = {
    $canSerialize: function(obj) { return /boolean/.test(typeof obj); },
    $canDeserialize: function(str) { return $.isBool(str) || ($.isString(str)  && /^true|false$/.test(str)); },
    $serialize: function(obj) { return obj.toString(); },
    $deserialize: function(str) { return $.isBool(str) ? str : /^true$/.test(str); }
};
$.Class.extend(booleanJsonSerializer, baseJsonSerializer);
$.ku4booleanJsonSerializer = function(serializer){ return new booleanJsonSerializer(serializer); };