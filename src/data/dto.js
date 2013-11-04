function dto(obj) {
    dto.base.call(this, obj);
}
dto.prototype = {
    name: function(name){ return this.set("name", name); },
    toJson: function() { return $.json.serialize(this.$h); },
    toQueryString: function() { return $.queryString.serialize(this.$h); },
    saveAs: function(name) {
        if(!name) throw $.exception("arg", "$.dto.saveAs requires a name");
        $.cookie(name).save(this.$h);
        this._name = name;
        return this;
    },
    save: function(){
        var name = this._name || $.uid("dto");
        this.saveAs(name);
        return name;
    },
    erase: function(){
        var name = this._name;
        if($.exists(name)) $.cookie.erase(name);
        return this;
    },
    replicate: function(){ return $.dto($.replicate(this.$h)); }
}
$.Class.extend(dto, $.hash.Class);

$.dto = function(obj){ return new dto(obj); }
$.dto.parseJson = function(str) { return $.dto($.json.deserialize(str)); }
$.dto.parseQueryString = function(str) { return $.dto($.queryString.deserialize(str)); }
$.dto.serialize = function(name) {
    try { return new dto($.cookie.deserialize($.cookie.find(name))).name(name); }
    catch(e) { return null; }
}