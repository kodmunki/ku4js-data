$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4objectQueryStringSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4objectQueryStringSerializer())
    });

    test("serialize", function(){
        expect(12);
        equal($.ku4objectQueryStringSerializer().serialize(null), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(true), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(false), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(0), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(1), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(1397704242247), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4objectQueryStringSerializer().serialize(new String("Test")), undefined);
        equal($.ku4objectQueryStringSerializer().serialize("test"), undefined);
        equal($.ku4objectQueryStringSerializer().serialize({}), "{}");
        equal($.ku4objectQueryStringSerializer().serialize({a:null, b:1, c:"a", d:new Date(2014, 1, 1), e:undefined}), "{}");
        deepEqual($.ku4objectQueryStringSerializer($.ku4stringQueryStringSerializer()).serialize({"a": "one", "b": "two"}), '{"a":"one","b":"two"}');
    });

    test("deserialize", function(){
        expect(20);
        equal($.ku4objectQueryStringSerializer().deserialize(null), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize(true), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize(false), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize(0), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize(new Date(2014, 1, 1)), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize([1,2,3,4]), undefined);
        deepEqual($.ku4objectQueryStringSerializer().deserialize({a:1, b:2, c:3}), {a:1, b:2, c:3});
        equal($.ku4objectQueryStringSerializer().deserialize("null"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("true"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("false"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("0"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("1"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("2013-02-01T06:00:00.000Z"), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("\"Test\""), undefined);
        equal($.ku4objectQueryStringSerializer().deserialize("'test'"), undefined);
        deepEqual($.ku4objectQueryStringSerializer().deserialize("{}"), {});
        deepEqual($.ku4objectQueryStringSerializer($.ku4stringQueryStringSerializer()).deserialize('{"a": "one", "b": "two"}'), {"a": "one", "b": "two"});
        deepEqual($.ku4objectQueryStringSerializer($.ku4arrayQueryStringSerializer($.ku4stringQueryStringSerializer()))
            .deserialize('{"a": "one", "b": "two"}'), {"a": "one", "b": "two"});
        deepEqual($.ku4objectQueryStringSerializer($.ku4arrayQueryStringSerializer($.ku4objectQueryStringSerializer($.ku4arrayQueryStringSerializer($.ku4stringQueryStringSerializer()))))
            .deserialize('{"a": "one", "b": "two", "c":["a", "b"], "d":{"a":[{a:"one"},["a","b"],"c"]}}'), {
                           "a":"one","b":"two","c":["a","b"],"d":{"a":[{"a": "one"},["a","b"],"c"]}});
    });
});