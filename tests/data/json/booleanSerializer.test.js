$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4booleanJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4booleanJsonSerializer())
    });

    test("serialize", function(){
        expect(3);
        equal($.ku4booleanJsonSerializer().serialize(null), undefined);
        equal($.ku4booleanJsonSerializer().serialize(true), "true");
        equal($.ku4booleanJsonSerializer().serialize(false), "false");
    });

    test("deserialize", function(){
        expect(3);
        equal($.ku4booleanJsonSerializer().deserialize("null"), undefined);
        equal($.ku4booleanJsonSerializer().deserialize("true"), true);
        equal($.ku4booleanJsonSerializer().deserialize("false"), false);
    });
});