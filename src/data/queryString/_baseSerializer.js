function baseQueryStringSerializer(serializer) {
    this._serializer = serializer;
}
baseQueryStringSerializer.prototype = {
    $canSerialize: function(obj) { return false; },
    $canDeserialize: function(obj) { return false; },
    $serialize: function(obj) { return; },
    $deserialize: function(str) { return; },
    serialize: function(obj) {
        if(this.$canSerialize(obj)) return this.$serialize(obj);
        else {
            var serializer = this._serializer;
            return ($.exists(serializer)) ? serializer.serialize(obj) : undefined;
        }
    },
    deserialize: function(str) {
        if(this.$canDeserialize(str))
            return this.$deserialize(str);
        else {
            var serializer = this._serializer;
            return ($.exists(serializer)) ? serializer.deserialize(str) : undefined;
        }
    }
};