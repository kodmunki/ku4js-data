$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4arrayJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4arrayJsonSerializer())
    });

    test("serialize", function(){
        expect(12);
        equal($.ku4arrayJsonSerializer().serialize(null), undefined);
        equal($.ku4arrayJsonSerializer().serialize(true), undefined);
        equal($.ku4arrayJsonSerializer().serialize(false), undefined);
        equal($.ku4arrayJsonSerializer().serialize(0), undefined);
        equal($.ku4arrayJsonSerializer().serialize(1), undefined);
        equal($.ku4arrayJsonSerializer().serialize(1397704242247), undefined);
        equal($.ku4arrayJsonSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4arrayJsonSerializer().serialize(new String("Test")), undefined);
        equal($.ku4arrayJsonSerializer().serialize("test"), undefined);
        equal($.ku4arrayJsonSerializer().serialize([]), "[]");
        equal($.ku4arrayJsonSerializer().serialize([undefined, undefined]), "[]");
        equal($.ku4arrayJsonSerializer().serialize([null, 1, "a", new Date(2014, 1, 1)]), "[]");
    });

    test("deserialize", function(){
        expect(17);
        equal($.ku4arrayJsonSerializer().deserialize(null), undefined);
        equal($.ku4arrayJsonSerializer().deserialize(true), undefined);
        equal($.ku4arrayJsonSerializer().deserialize(false), undefined);
        equal($.ku4arrayJsonSerializer().deserialize(0), undefined);
        equal($.ku4arrayJsonSerializer().deserialize(new Date(2014, 1, 1)), undefined);
        deepEqual($.ku4arrayJsonSerializer().deserialize([1,2,3,4]), [1,2,3,4]);
        equal($.ku4arrayJsonSerializer().deserialize({a:1, b:2, c:3}), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("null"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("true"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("false"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("0"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("1"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("2013-02-01T06:00:00.000Z"), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("\"Test\""), undefined);
        equal($.ku4arrayJsonSerializer().deserialize("'test'"), undefined);
        deepEqual($.ku4arrayJsonSerializer().deserialize("[]"), []);
    });
});