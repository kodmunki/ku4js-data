$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4dateQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4dateQueryStringSerializer())
    });

    test("serialize", function(){
        expect(7);
        equal($.ku4dateQueryStringSerializer().serialize(null), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(true), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(false), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(0), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(1), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(1397704242247), undefined);
        equal($.ku4dateQueryStringSerializer().serialize(new Date(2013, 1, 1)), "2013-02-01T06:00:00.000Z");


    });

    test("deserialize", function(){
        expect(7);
        equal($.ku4dateQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4dateQueryStringSerializer().deserialize("true"), undefined);
        equal($.ku4dateQueryStringSerializer().deserialize("false"), undefined);
        equal($.ku4dateQueryStringSerializer().deserialize("0"), undefined);
        equal($.ku4dateQueryStringSerializer().deserialize("1"), undefined);
        equal($.ku4dateQueryStringSerializer().deserialize("1397704242247"), undefined);
        deepEqual($.ku4dateQueryStringSerializer().deserialize("2013-02-01T06:00:00.000Z"), new Date(2013, 1, 1));
    });
});