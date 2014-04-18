function arrayJsonSerializer(serializer) {
    arrayJsonSerializer.base.call(this, serializer);
}
arrayJsonSerializer.prototype = {
    $canSerialize: function(obj) { return $.isArray(obj); },
    $canDeserialize: function(str) {
        return $.isArray(str) || ($.isString(str) && /^\[.*\]$/.test(str));
    },
    $serialize: function(obj) {
        var serialized = $.list();
        $.list(obj).each(function(item){
            var value = this.serialize(item);
            if(!$.isUndefined(value))
                serialized.add(value);
        }, this);
        return $.str.format("[{0}]", serialized.toArray());
    },
    $deserialize: function(str) {
        if($.isArray(str)) return str;
        if(/\[\s*\]/.test(str)) return [];
        else {
            var values = str.replace(/^\[/, "").replace(/\]$/, "").split(","),
                deserialized = $.list();

            $.list(values).each(function (item) {
                var value = this.deserialize(item);
                if(!$.isUndefined(value))
                    deserialized.add(value);
            }, this);

            return deserialized.toArray();
        }
    }
};
$.Class.extend(arrayJsonSerializer, baseJsonSerializer);
$.ku4arrayJsonSerializer = function(serializer){ return new arrayJsonSerializer(serializer); };