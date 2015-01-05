function field(selector){
    field.base.call(this);

    var node = queryDom(selector);
    this.dom(node)
        .spec($.spec(function(){ return true; }))
        .optional();
}
field.prototype = {
    $read: function(){ return this.dom().value },
    $write: function(value){ this.dom().value = value; },
    $clear: function(){ this.dom().value = ""; return this; },
    $readFiles: function(func, scp) {
        var scope = scp || this;
        return func.call(scope, this.files());
    },
    dom: function(dom){ return this.property("dom", dom); },
    hasFiles: function() { return $.exists(this.dom().files); },
    fileCount: function() { return (!this.hasFiles) ? 0 : this.files().length; },
    files: function() { return this.dom().files; },
    readFiles: function(func, scp) { return this.$readFiles(func, scp); }
 };
$.Class.extend(field, abstractField);
$.field = function(selector){ return new field(selector); };
$.field.Class = field;

//TODO: This method should be moved if/when ku4js supports further DOM features.
function queryDom(selector)
{
    var query;
    try {
        query = document.querySelectorAll(selector);
    }
    catch(e) {
        if($.exists(selector.ownerDocument)) { return selector; }
        else  { throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}", selector)); }
    }

    if(query.length > 1)
        throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}. Requires unique node", selector));
    if(!$.exists(query[0]))
        throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}", selector));
    return query[0];
}