function abstractField(){
    abstractField.base.call(this);
    this._onIsValid = $.observer();
    this._onInvalid = $.observer();
    this.spec($.spec(function(){ return true; })).optional()
}
abstractField.prototype = {
    $read: function() { },
    $write: function() { },
    $clear: function() { },
    value: function(value){
        if(!$.exists(value)) return this.$read();
        this.$write(value);
        return this;
    },
    clear: function(){ return this.$clear(); },
    optional: function(){ this._optionSpec = $.fields.specs.optional; this._operand = "or"; return this; },
    required: function(){ this._optionSpec = $.fields.specs.required; this._operand = "and"; return this; },
    spec: function(spec){ return this.property("spec", spec); },
    isValid: function(){
        var b = this._optionSpec[this._operand](this.spec()).isSatisfiedBy(this.value()),
            o = (b) ? this._onIsValid : this._onInvalid;
        o.notify(this);
        return b;
    },
    isEmpty: function(){ return $.isEmpty(this.value()); },
    onIsValid: function(f, s, id){ this._onIsValid.add(f, s, id); return this; },
    onInvalid: function(f, s, id){ this._onInvalid.add(f, s, id); return this; }
 };
$.Class.extend(abstractField, $.Class);