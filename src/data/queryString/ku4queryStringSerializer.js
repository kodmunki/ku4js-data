function ku4QueryStringSerializer() {
    var nullSerializer = $.ku4nullQueryStringSerializer(),
        stringSerializer = $.ku4stringQueryStringSerializer(nullSerializer),
        booleanSerializer = $.ku4booleanQueryStringSerializer(stringSerializer),
        numberSerializer = $.ku4numberQueryStringSerializer(booleanSerializer),
        dateSerializer = $.ku4dateQueryStringSerializer(numberSerializer),
        arraySerializer = $.ku4arrayQueryStringSerializer(dateSerializer),
        objectSerializer = $.ku4objectQueryStringSerializer(arraySerializer),
        arrayCollectionSerializer = $.ku4arrayQueryStringSerializer(objectSerializer),
        objectCollectionSerializer = $.ku4objectQueryStringSerializer(arrayCollectionSerializer);

    ku4QueryStringSerializer.base.call(this, objectCollectionSerializer);
}
$.Class.extend(ku4QueryStringSerializer, baseQueryStringSerializer);
$.ku4QueryStringSerializer = function(){ return new ku4QueryStringSerializer(); };

if(!$.exists($.queryString)) $.queryString = {
    serialize: function(obj) {
        var queryString = "";
        $.hash(obj).each(function(item){
            var value = $.ku4QueryStringSerializer().serialize(item.value);
            if($.isUndefined(value)) return;
            queryString += $.str.format("&{0}={1}", encodeURIComponent(item.key), encodeURIComponent(value));
        });
        return queryString.replace(/^\&/, "");
    },
    deserialize: function(str) {
        var values= str.split("&"),
            hash = $.hash();
        $.list(values).each(function(item){
            if($.isUndefined(item)) return;
            var kv = item.split("="),
                kv0 = kv[0],
                kv1 = kv[1];

            if($.isUndefined(kv0) || $.isUndefined(kv1)) return;
            var key = decodeURIComponent(kv0),
                value = $.ku4QueryStringSerializer().deserialize(decodeURIComponent(kv1));

            if($.isUndefined(key) || $.isUndefined(value)) return;
            hash.add(key, value);
        });
        return hash.toObject();
    }
};