function field(selector){
    field.base.call(this);

    var query = $(selector);
    if(query.length > 1) $.str.format("$.field requires unique and disparate node.")
    this.dom($.refcheck(query[0], $.str.format("$.DomClass requires valid DOM node.")))
        .spec($.spec(function(){ return true; }))
        .optional();
}
field.prototype = {
    $read: function(){ return this.dom().value },
    $write: function(value){ this.dom().value = value; },
    $clear: function(){ this.dom().value = ""; return this; },
    dom: function(dom){ return this.property("dom", dom); }
 }
$.Class.extend(field, abstractField);
$.field = function(selector){ return new field(selector); }
$.field.Class = field;