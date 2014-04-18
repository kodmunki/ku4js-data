function objectJsonSerializer(serializer) {
    objectJsonSerializer.base.call(this, serializer);
}
objectJsonSerializer.prototype = {
    $canSerialize: function(obj) { return $.isObject(obj); },
    $canDeserialize: function(str) {
        if ($.isObject(str)) return str;
        try {
            var value = eval("(" + str + ")");
            return $.isObject(value);
        }
        catch(e) { return false; }
    },
    $serialize: function(obj) {
        var serialized = $.list();
        $.hash(obj).each(function(item){
            var value = this.serialize(item.value);
            if(!$.isUndefined(value))
                serialized.add($.str.format('"{0}":{1}', item.key, value));
        }, this);
        return $.str.format("{{0}}", serialized.toArray());
    },
    $deserialize: function(str) {
        if($.isString(str) && /^\{\s*\}$/.test(str)) return {};
        else {
            var values = ($.isString(str)) ? eval("(" + str + ")") : str,
                deserialized = $.hash();

            $.hash(values).each(function(item) {
                var value = this.deserialize(item.value);
                if (!$.isUndefined(value))
                    deserialized.add(item.key, value);
            }, this);

            return deserialized.toObject();
        }
    }
};
$.Class.extend(objectJsonSerializer, baseJsonSerializer);
$.ku4objectJsonSerializer = function(serializer){ return new objectJsonSerializer(serializer); };