$(function() {
    function notOk(s, m) { equal(s, false, m); }

    module("ku4objectJsonSerializer");

    test("new", function(){
        expect(1);
        ok($.ku4objectJsonSerializer());
    });

    test("serialize", function(){
        expect(12);
        equal($.ku4objectJsonSerializer().serialize(null), undefined);
        equal($.ku4objectJsonSerializer().serialize(true), undefined);
        equal($.ku4objectJsonSerializer().serialize(false), undefined);
        equal($.ku4objectJsonSerializer().serialize(0), undefined);
        equal($.ku4objectJsonSerializer().serialize(1), undefined);
        equal($.ku4objectJsonSerializer().serialize(1397704242247), undefined);
        equal($.ku4objectJsonSerializer().serialize(new Date(2013, 1, 1)), undefined);
        equal($.ku4objectJsonSerializer().serialize(new String("Test")), undefined);
        equal($.ku4objectJsonSerializer().serialize("test"), undefined);
        equal($.ku4objectJsonSerializer().serialize({}), "{}");
        equal($.ku4objectJsonSerializer().serialize({a:null, b:1, c:"a", d:new Date(2014, 1, 1), e:undefined}), "{}");
        deepEqual($.ku4objectJsonSerializer($.ku4stringJsonSerializer()).serialize({"a": "one", "b": "two"}), '{"a":"one","b":"two"}');
    });

    test("deserialize", function(){
        expect(20);
        equal($.ku4objectJsonSerializer().deserialize(null), undefined);
        equal($.ku4objectJsonSerializer().deserialize(true), undefined);
        equal($.ku4objectJsonSerializer().deserialize(false), undefined);
        equal($.ku4objectJsonSerializer().deserialize(0), undefined);
        equal($.ku4objectJsonSerializer().deserialize(new Date(2014, 1, 1)), undefined);
        equal($.ku4objectJsonSerializer().deserialize([1,2,3,4]), undefined);
        deepEqual($.ku4objectJsonSerializer().deserialize({a:1, b:2, c:3}), {});
        equal($.ku4objectJsonSerializer().deserialize("null"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("true"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("false"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("0"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("1"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("1397704242247"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("2013-02-01T06:00:00.000Z"), undefined);
        equal($.ku4objectJsonSerializer().deserialize("\"Test\""), undefined);
        equal($.ku4objectJsonSerializer().deserialize("'test'"), undefined);
        deepEqual($.ku4objectJsonSerializer().deserialize("{}"), {});
        deepEqual($.ku4objectJsonSerializer($.ku4stringJsonSerializer()).deserialize('{"a": "one", "b": "two"}'), {"a": "one", "b": "two"});
        deepEqual($.ku4objectJsonSerializer($.ku4arrayJsonSerializer($.ku4stringJsonSerializer()))
            .deserialize('{"a": "one", "b": "two"}'), {"a": "one", "b": "two"});
       deepEqual($.ku4objectJsonSerializer($.ku4arrayJsonSerializer($.ku4objectJsonSerializer($.ku4arrayJsonSerializer($.ku4stringJsonSerializer()))))
            .deserialize('{"a": "one", "b": "test", "c":["a", "b"], "d":{"a":[{a:"one"},["a","b"],"c"]}}'), {
                           "a":"one","b":"test","c":["a","b"],"d":{"a":[{"a": "one"},["a","b"],"c"]}});
    });
});