$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4booleanQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4booleanQueryStringSerializer())
    });

    test("serialize", function(){
        expect(3);
        equal($.ku4booleanQueryStringSerializer().serialize(null), undefined);
        equal($.ku4booleanQueryStringSerializer().serialize(true), "true");
        equal($.ku4booleanQueryStringSerializer().serialize(false), "false");
    });

    test("deserialize", function(){
        expect(3);
        equal($.ku4booleanQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4booleanQueryStringSerializer().deserialize("true"), true);
        equal($.ku4booleanQueryStringSerializer().deserialize("false"), false);
    });
});