$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4numberJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4numberJsonSerializer())
    });

    test("serialize", function(){
        expect(6);
        equal($.ku4numberJsonSerializer().serialize(null), undefined);
        equal($.ku4numberJsonSerializer().serialize(true), undefined);
        equal($.ku4numberJsonSerializer().serialize(false), undefined);
        equal($.ku4numberJsonSerializer().serialize(0), "0");
        equal($.ku4numberJsonSerializer().serialize(1), "1");
        equal($.ku4numberJsonSerializer().serialize(123456789.98765), "123456789.98765");
    });

    test("deserialize", function(){
        expect(6);
        equal($.ku4numberJsonSerializer().deserialize("null"), undefined);
        equal($.ku4numberJsonSerializer().deserialize("true"), undefined);
        equal($.ku4numberJsonSerializer().deserialize("false"), undefined);
        equal($.ku4numberJsonSerializer().deserialize("0"), 0);
        equal($.ku4numberJsonSerializer().deserialize("1"), 1);
        equal($.ku4numberJsonSerializer().deserialize("123456789.98765"), 123456789.98765);
    });
});