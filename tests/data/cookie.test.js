$(function(){
    function notOk(s, m) {equal(s,false,m);}

    var n = "testCookie",
        cookie = $.cookie({name:n}),
        dto = $.dto();

    module("cookie");

    test("create", function() {
        expect(1);
        ok(cookie);
    });
    
    test("save", function() {
        expect(1);
    dto.add("key", "value");
    cookie.save(dto.toObject());
        ok(cookie);
    });
    
    test("find", function() {
        expect(1);
        ok($.cookie.find(n));
    });
    
    test("load", function() {
        expect(1);
        ok($.cookie.load(n));
    });
    
    test("erase", function() {
        expect(1);
        ok(cookie.erase(n));
    });
});