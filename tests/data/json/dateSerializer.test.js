$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4dateJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4dateJsonSerializer())
    });

    test("serialize", function(){
        expect(7);
        equal($.ku4dateJsonSerializer().serialize(null), undefined);
        equal($.ku4dateJsonSerializer().serialize(true), undefined);
        equal($.ku4dateJsonSerializer().serialize(false), undefined);
        equal($.ku4dateJsonSerializer().serialize(0), undefined);
        equal($.ku4dateJsonSerializer().serialize(1), undefined);
        equal($.ku4dateJsonSerializer().serialize(1397704242247), undefined);
        equal($.ku4dateJsonSerializer().serialize(new Date(2013, 1, 1)), "\"2013-02-01T06:00:00.000Z\"");


    });

    test("deserialize", function(){
        expect(7);
        equal($.ku4dateJsonSerializer().deserialize("null"), undefined);
        equal($.ku4dateJsonSerializer().deserialize("true"), undefined);
        equal($.ku4dateJsonSerializer().deserialize("false"), undefined);
        equal($.ku4dateJsonSerializer().deserialize("0"), undefined);
        equal($.ku4dateJsonSerializer().deserialize("1"), undefined);
        equal($.ku4dateJsonSerializer().deserialize("1397704242247"), undefined);
        deepEqual($.ku4dateJsonSerializer().deserialize("2013-02-01T06:00:00.000Z"), new Date(2013, 1, 1));
    });
});