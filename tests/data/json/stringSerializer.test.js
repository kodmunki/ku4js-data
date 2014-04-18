$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4stringJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4stringJsonSerializer());
    });

    test("serialize", function(){
        expect(10);
        equal($.ku4stringJsonSerializer().serialize(null), undefined);
        equal($.ku4stringJsonSerializer().serialize(true), undefined);
        equal($.ku4stringJsonSerializer().serialize(false), undefined);
        equal($.ku4stringJsonSerializer().serialize(0), undefined);
        equal($.ku4stringJsonSerializer().serialize(1), undefined);
        equal($.ku4stringJsonSerializer().serialize(1397704242247), undefined);
        equal($.ku4stringJsonSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4stringJsonSerializer().serialize(new String("Test")), "\"Test\"");
        equal($.ku4stringJsonSerializer().serialize("test"), "\"test\"");
        equal($.ku4stringJsonSerializer().serialize("<html>"), "\"<html>\"");
    });

    test("deserialize", function(){
        expect(10);
        equal($.ku4stringJsonSerializer().deserialize("null"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("true"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("false"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("0"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("1"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4stringJsonSerializer().deserialize("2013-02-01T06:00:00.000Z"), "2013-02-01T06:00:00.000Z");
        equal($.ku4stringJsonSerializer().deserialize("\"Test\""), "Test");
        equal($.ku4stringJsonSerializer().deserialize("'test'"), "test");
        equal($.ku4stringJsonSerializer().deserialize("\"<html>\""), "<html>");
    });
});