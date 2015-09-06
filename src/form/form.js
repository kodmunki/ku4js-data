function form(){
    form.base.call(this);
    this._onSubmit = $.observer();
    this._fields = $.hash();
}
form.prototype = {
    $submit: function(){ },
    name: function(name){ return this.property("name", name); },
    fields: function(){ return this._fields; },
    listFields: function(){ return $.list(this._fields.values()); },
    findField: function(name){ return this._fields.findValue(name); },
    isEmpty: function(){
        var v = true;
        $.list(this._fields.values()).each(function(f){ if(!f.isEmpty()) v = false; });
        return v;
    },
    isValid: function(){
        var v = true;
        $.list(this._fields.values()).each(function(f){ if(!f.isValid()) v = false; });
        return v;
    },
    submit: function(){
        var values = this.read();
        this._onSubmit.notify(this);
        this.$submit(values);
    },
    onSubmit: function(f, s, id){ this._onSubmit.add(f, s, id); return this; },
    add: function(n, f){ this._fields.add(n, f); return this; },
    remove: function(n){ this._fields.remove(n); return this; },
    clear: function(){
        this._fields.each(function(f){ f.value.clear(); });
        return this;
    },
    read: function(){
        var dto = $.dto();

        this._fields.each(function(o){
            var k = o.key, v = o.value;
            if($.exists(v.files())) $.list(v.files()).each(function(file) {
                dto.add(k, file);
            });
            else {
                if($.exists(v.read)) dto.merge(v.read());
                if($.exists(v.value)) dto.add(k, v.value());
            }
        });

        return dto;
    },
    readMultipartData: function()
    {
        var data = new FormData();
        this._fields.each(function(o){
            var k = o.key, v = o.value;
            if($.exists(v.files())) $.list(v.files()).each(function(file) {
                data.append(file.name, file );
            });
            else if($.exists(v.value)) data.append(k, v.value());
        });
        return data;
    },
    readAsyncMultipartData: function(func, scp)
    {
        var data = new FormData(),
            fileCount = 0,
            fieldsRead = false,
            scope = scp || this;

        function callback() { func.call(scope, data); }

        this._fields.each(function(o){
            var name = o.key, field = o.value;
            if($.exists(field.hasFiles) && field.hasFiles()) {
                fileCount += field.fileCount();
                field.readFiles(function (files) {
                    $.list(files).each(function(file) {
                        data.append(file.name, file);
                        fileCount --;
                    });
                    if(fieldsRead && fileCount < 1) callback();
                }, this);
            }
            else if($.exists(field.value)) data.append(name, field.value());
        });
        fieldsRead = true;
        if(fileCount < 1) callback();
    },
    write: function(obj){
        if(!$.exists(obj)) return this;
        var dto = ($.exists(obj.toObject)) ? obj : $.dto(obj);
        this._fields.each(function(o) {
            var field = o.value;
            if($.exists(field.write)) field.write(dto);
            if($.exists(field.value)) field.value(dto.find(o.key));
        });
        return this;
    },
    saveAs: function(name){
        this.read().saveAs(name);
        this._name = name;
        return this;
    },
    save: function(){
        var name = this._name || $.uid("form");
        this.saveAs(name);
        return name;
    },
    erase: function(){
        var name = this._name;
        if($.exists(name)) $.dto.serialize(name).erase();
        return this;
    },
    load: function(name){
        if($.isString(name)) this._name = name;
        var n = this._name;
        return ($.exists(n)) ? this.write($.dto.serialize(n)) : this;
    }
};
$.Class.extend(form, $.Class);
$.form = function() { return new form(); };
$.form.Class = form;