$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4nullQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4nullQueryStringSerializer())
    });

    test("serialize", function(){
        expect(2);
        equal($.ku4nullQueryStringSerializer().serialize(undefined), undefined);
        equal($.ku4nullQueryStringSerializer().serialize(null), "null");
    });

    test("deserialize", function(){
        expect(2);
        equal($.ku4nullQueryStringSerializer().deserialize([]), undefined);
        equal($.ku4nullQueryStringSerializer().deserialize("null"), null);
    });
});