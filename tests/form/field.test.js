$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("field Test");
    
    test("create", function() {
        raises(function(){ $.field(); });
        ok($.field("#Field"));;
    });
    
    var field = $.field("#Field");
    
    test("value", function() {
        field.value("Test");
        equal(field.value(), "Test");
    });
    
    test("clear", function() {
        field.clear();
        equal(field.value(), "");
    });
    
    test("isValid", function(){
        field.value("a").spec($.spec(function(v){ return true; }));
        ok(field.isValid());
        
        field.value("a").spec($.spec(function(v){ return false; }));
        notOk(field.isValid());
        
        field.spec($.spec(function(v){ return /Test/.test(v); }));
        ok(field.value("Test").isValid());
    });
    
    test("optional", function() {
        field.optional();
        notOk(field.value("test").isValid());
        ok(field.value("Test").isValid());
        ok(field.clear().isValid());
    });
    
    test("required", function() {
        field.required();
        notOk(field.value("test").isValid());
        ok(field.value("Test").isValid());
        notOk(field.clear().isValid());
    });
});