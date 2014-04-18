$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4numberQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4numberQueryStringSerializer())
    });

    test("serialize", function(){
        expect(6);
        equal($.ku4numberQueryStringSerializer().serialize(null), undefined);
        equal($.ku4numberQueryStringSerializer().serialize(true), undefined);
        equal($.ku4numberQueryStringSerializer().serialize(false), undefined);
        equal($.ku4numberQueryStringSerializer().serialize(0), "0");
        equal($.ku4numberQueryStringSerializer().serialize(1), "1");
        equal($.ku4numberQueryStringSerializer().serialize(123456789.98765), "123456789.98765");
    });

    test("deserialize", function(){
        expect(6);
        equal($.ku4numberQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4numberQueryStringSerializer().deserialize("true"), undefined);
        equal($.ku4numberQueryStringSerializer().deserialize("false"), undefined);
        equal($.ku4numberQueryStringSerializer().deserialize("0"), 0);
        equal($.ku4numberQueryStringSerializer().deserialize("1"), 1);
        equal($.ku4numberQueryStringSerializer().deserialize("123456789.98765"), 123456789.98765);
    });
});