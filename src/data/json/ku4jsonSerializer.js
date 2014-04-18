function ku4JsonSerializer() {
    var nullSerializer = $.ku4nullJsonSerializer(),
        stringSerializer = $.ku4stringJsonSerializer(nullSerializer),
        booleanSerializer = $.ku4booleanJsonSerializer(stringSerializer),
        numberSerializer = $.ku4numberJsonSerializer(booleanSerializer),
        dateSerializer = $.ku4dateJsonSerializer(numberSerializer),
        arraySerializer = $.ku4arrayJsonSerializer(dateSerializer),
        objectSerializer = $.ku4objectJsonSerializer(arraySerializer),
        arrayCollectionSerializer = $.ku4arrayJsonSerializer(objectSerializer),
        objectCollectionSerializer = $.ku4objectJsonSerializer(arrayCollectionSerializer);

    ku4JsonSerializer.base.call(this, objectCollectionSerializer);
}
$.Class.extend(ku4JsonSerializer, baseJsonSerializer);
$.ku4JsonSerializer = function(){ return new ku4JsonSerializer(); };

if(!$.exists($.json)) $.json = {
    serialize: function(obj) {
        return $.ku4JsonSerializer().serialize(obj);
    },
    deserialize: function(str) {
        try { return $.ku4JsonSerializer().deserialize(eval("(" + str + ")")); }
        catch(e) { return; }

    }
};