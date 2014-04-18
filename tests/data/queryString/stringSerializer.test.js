$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4stringQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4stringQueryStringSerializer())
    });

    test("serialize", function(){
        expect(10);
        equal($.ku4stringQueryStringSerializer().serialize(null), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(true), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(false), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(0), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(1), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(1397704242247), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4stringQueryStringSerializer().serialize(new String("Test")), "Test");
        equal($.ku4stringQueryStringSerializer().serialize("test"), "test");
        equal($.ku4stringQueryStringSerializer().serialize("<html>"), "<html>");
    });

    test("deserialize", function(){
        expect(11);
        equal($.ku4stringQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("true"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("false"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("0"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("1"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4stringQueryStringSerializer().deserialize("2014-3-25"), "2014-3-25");
        equal($.ku4stringQueryStringSerializer().deserialize("2013-02-01T06:00:00.000Z"), "2013-02-01T06:00:00.000Z");
        equal($.ku4stringQueryStringSerializer().deserialize("Test"), "Test");
        equal($.ku4stringQueryStringSerializer().deserialize("test"), "test");
        equal($.ku4stringQueryStringSerializer().deserialize("<html>"), "<html>");
    });
});