$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4nullJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4nullJsonSerializer())
    });

    test("serialize", function(){
        expect(2);
        equal($.ku4nullJsonSerializer().serialize(undefined), undefined);
        equal($.ku4nullJsonSerializer().serialize(null), '"null"');
    });

    test("deserialize", function(){
        expect(2);
        equal($.ku4nullJsonSerializer().deserialize([]), undefined);
        equal($.ku4nullJsonSerializer().deserialize("null"), null);
    });
});