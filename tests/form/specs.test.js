$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("specs Test");
    
    function pass(spec, value){ ok(spec.isSatisfiedBy(value)); }
    function fail(spec, value){ notOk(spec.isSatisfiedBy(value)); }
    
    test("required", function() {
        var spec = $.fields.specs.required;
        pass(spec, " ");
        pass(spec, "a");
        pass(spec, "b");

        fail(spec, "");
        fail(spec, null);
        fail(spec, undefined);
    });
    test("optional", function() {
        var spec = $.fields.specs.optional;
        pass(spec, "");
        pass(spec, null);
        pass(spec, undefined);
        
        fail(spec, " ");
        fail(spec, "a");
        fail(spec, "b");
    });
    test("currency", function() {
        var spec = $.fields.specs.currency;
        pass(spec, "0");
        pass(spec, "1");
        pass(spec, "1.00");
        pass(spec, "99999999.00");
        pass(spec, "$99999999.00");
        pass(spec, "$99,999,999.00");
        pass(spec, "$99,999,999.00");

        fail(spec, "");
        fail(spec, " ");
        fail(spec, "Alpha");
        fail(spec, "0.0.0");
        fail(spec, "1,1,1");
        fail(spec, "$1,1,1");
        fail(spec, "1,1,1$");
        fail(spec, "1,111,1");
        fail(spec, "1 1 1");
        fail(spec, "1.001");
    });
    test("date", function() {
        var spec = $.fields.specs.date;
        pass(spec, "12/12/2000");
        pass(spec, "12/12/00");
        pass(spec, "1/1/00");
        pass(spec, "12/1/2000");
        pass(spec, "1/12/2000");
        pass(spec, "12/1/00");
        pass(spec, "1/12/00");
        
        fail(spec, "");
        fail(spec, " ");
        fail(spec, "Alpha");
        fail(spec, "0/0/0");
        fail(spec, "1/1/111");
        fail(spec, "mm/dd/yy");
        fail(spec, "1/12");
        fail(spec, "12.12.2000");
        fail(spec, "12-12-2000");
    });
    test("alpha", function() {
        var spec = $.fields.specs.alpha;
        pass(spec, "a");
        pass(spec, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
        
        fail(spec, "");
        fail(spec, " ");
        fail(spec, "_");
        fail(spec, "1");
        fail(spec, "@");
    });
    test("numeric", function() {
        var spec = $.fields.specs.numeric;
        pass(spec, "1");
        pass(spec, "0123456789");
        
        fail(spec, "");
        fail(spec, " ");
        fail(spec, "a");
        fail(spec, ".0123456789");
        fail(spec, "0123456.789");
    });
    test("alphaNumeric", function() {
        var spec = $.fields.specs.alphaNumeric;
        pass(spec, "a");
        pass(spec, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");pass(spec, "1");
        pass(spec, "0123456789");
        
        fail(spec, "");
        fail(spec, ".0123456789");
        fail(spec, "0123456.789");
        fail(spec, " ");
        fail(spec, "_");
        fail(spec, "@");
    });
    test("phone", function() {
        var spec = $.fields.specs.phone;
        pass(spec, "2223334444");
        pass(spec, "222-333-4444");
        pass(spec, "(222)333-4444");
        pass(spec, "(222) 333-4444");
        
        fail(spec, "");
        fail(spec, "222.333.4444");
    });
    test("ssn", function() {
        var spec = $.fields.specs.ssn;
        pass(spec, "222334444");
        pass(spec, "222-33-4444");
        
        fail(spec, "");
        fail(spec, "2233444");
        fail(spec, "2223344444");
        fail(spec, "222.33.4444");
        fail(spec, "222/33/4444");
    });
    test("email", function() {
        var spec = $.fields.specs.email;
        pass(spec, "j@b.cc");
        pass(spec, "j@b.com");
        pass(spec, "j@b.corp");
        pass(spec, "j.b@j.b.corp");
        pass(spec, "j_b@j_b.b.corp");
        
        fail(spec, "");
        fail(spec, "j");
        fail(spec, "jbcom");
        fail(spec, ".jb@com");
        fail(spec, "j.@b.cc");
        fail(spec, "j@.b.cc");
        fail(spec, "j.b@b.com.");
        fail(spec, "j..b@b.com");
        fail(spec, "j.b@@b.com");
        fail(spec, "j.b@b._com");
        fail(spec, "j.b@b.c_om");
    });
});