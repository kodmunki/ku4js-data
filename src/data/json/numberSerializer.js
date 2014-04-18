function numberJsonSerializer(serializer) {
    numberJsonSerializer.base.call(this, serializer);
}
numberJsonSerializer.prototype = {
    $canSerialize: function(obj) { return /number/.test(typeof obj); },
    $canDeserialize: function(str) { return $.isNumber(str) || ($.isString(str) && /^[0-9]+(\.([0-9]+)?)?$/.test(str)); },
    $serialize: function(obj) { return obj.toString(); },
    $deserialize: function(str) { return $.isNumber(str) ? str : (/\./.test(str)) ? parseFloat(str) : parseInt(str); }
};
$.Class.extend(numberJsonSerializer, baseJsonSerializer);
$.ku4numberJsonSerializer = function(serializer){ return new numberJsonSerializer(serializer); };