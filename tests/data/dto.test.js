$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    var dto1 = $.dto({"one":1, "two":2, "three":3}),
        dto2 = $.dto($.hash({"one":1, "two":2, "three":3})),
        dto3 = $.dto($.dto({"one":1, "two":2, "three":3}));

    module("dto");

    test("create", function() {
        expect(2);
        ok(dto1);
        ok(dto1.isTypeOf($.dto.Class));
    });

    test("replicate", function() {
        var rep1 = dto1.replicate().add("new", "new"),
            rep2 = dto2.replicate().add("new", "new"),
            rep3 = dto3.replicate().add("new", "new");
        
        equal(3, dto1.count(), "replicate");
        equal(3, dto2.count(), "replicate");
        equal(3, dto3.count(), "replicate");
        
        equal(4, rep1.count(), "replicate");
        equal(4, rep2.count(), "replicate");
        equal(4, rep3.count(), "replicate");
        
        ok(!dto1.containsKey("new"));
        ok(rep1.containsKey("new"));
    });

    test("parseJson", function() {
        var testSerialized = '{"a":"null","man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
            testDeserialized = {a:null, b:undefined, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

        expect(2);
        deepEqual($.dto.parseJson(testSerialized).toObject(), $.hash(testDeserialized).remove("b").toObject());
        equal($.dto(testDeserialized).toJson(), testSerialized);
    });
});