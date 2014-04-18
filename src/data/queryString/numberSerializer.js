function numberQueryStringSerializer(serializer) {
    numberQueryStringSerializer.base.call(this, serializer);
}
numberQueryStringSerializer.prototype = {
    $canSerialize: function(obj) { return /number/.test(typeof obj); },
    $canDeserialize: function(str) { return $.isNumber(str) || ($.isString(str) && /^[0-9]+(\.([0-9]+)?)?$/.test(str)); },
    $serialize: function(obj) { return obj.toString(); },
    $deserialize: function(str) { return $.isNumber(str) ? str : (/\./.test(str)) ? parseFloat(str) : parseInt(str); }
};
$.Class.extend(numberQueryStringSerializer, baseQueryStringSerializer);
$.ku4numberQueryStringSerializer = function(serializer){ return new numberQueryStringSerializer(serializer); };