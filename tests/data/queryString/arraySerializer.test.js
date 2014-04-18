$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4arrayQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4arrayQueryStringSerializer())
    });

    test("serialize", function(){
        expect(12);
        equal($.ku4arrayQueryStringSerializer().serialize(null), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(true), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(false), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(0), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(1), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(1397704242247), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize(new String("Test")), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize("test"), undefined);
        equal($.ku4arrayQueryStringSerializer().serialize([]), "[]");
        equal($.ku4arrayQueryStringSerializer().serialize([undefined, undefined]), "[]");
        equal($.ku4arrayQueryStringSerializer().serialize([null, 1, "a", new Date(2014, 1, 1)]), "[]");
    });

    test("deserialize", function(){
        expect(17);
        equal($.ku4arrayQueryStringSerializer().deserialize(null), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize(true), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize(false), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize(0), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize(new Date(2014, 1, 1)), undefined);
        deepEqual($.ku4arrayQueryStringSerializer().deserialize([1,2,3,4]), [1,2,3,4]);
        equal($.ku4arrayQueryStringSerializer().deserialize({a:1, b:2, c:3}), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("true"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("false"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("0"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("1"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("2013-02-01T06:00:00.000Z"), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("\"Test\""), undefined);
        equal($.ku4arrayQueryStringSerializer().deserialize("'test'"), undefined);
        deepEqual($.ku4arrayQueryStringSerializer().deserialize("[]"), []);
    });
});