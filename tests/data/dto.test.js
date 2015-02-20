$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    var dto1 = $.dto({"one":1, "two":2, "three":3}),
        dto2 = $.dto($.hash({"one":1, "two":2, "three":3})),
        dto3 = $.dto($.dto({"one":1, "two":2, "three":3}));

    module("dto");

    test("create", function() {
        expect(1);
        ok(dto1);
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

    test("filter", function() {
        var dto = $.dto({
            "zero": 0,
            "empty": "",
            "date": new Date(2013, 1, 1)
        }).filter("zero", "empty");
    
        expect(5);
        ok(dto.containsKey("zero"), "containsKey(\"zero\")");
        ok(dto.containsKey("empty"), "containsKey(\"empty\")");
        equal(dto.count(), 2, "count");
        equal(dto.find("zero"), 0);
        equal(dto.toJson(), "{\"zero\":0,\"empty\":\"\"}");
    });

    test("filterNullOrEmpty", function() {
        var dto = $.dto({
            "zero": 0,
            "empty": "",
            "date": new Date(2013, 1, 1)
        }).filterNullOrEmpty();

        expect(7);
        ok(dto.containsKey("zero"), "containsKey(\"zero\")");
        ok(!dto.containsKey("empty"), "!containsKey(\"empty\")");
        ok(dto.containsKey("date"), "containsKey(\"date\")");
        equal(dto.count(), 2, "count");
        equal(dto.find("zero"), 0);
        deepEqual(dto.find("date"), new Date(2013, 1, 1));
        equal(dto.toJson(), "{\"zero\":0,\"date\":\"2013-02-01T06:00:00.000Z\"}");
    });

    test("toFormData", function() {
        var testDeserialized = {a:null, b:undefined, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

        expect(2);
        ok($.dto(testDeserialized).toFormData() instanceof FormData);

        performanceOk(function() { $.dto(testDeserialized).toFormData(); }, 5);
    });

    test("parseJson", function() {
        var testSerialized = '{"a":null,"man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
            testDeserialized = {a:null, b:undefined, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

        expect(4);
        equal($.dto(testDeserialized).toJson(), testSerialized, "Serialize");
        deepEqual($.dto.parseJson(testSerialized).toObject(), $.hash(testDeserialized).remove("b").toObject(), "Deserialize");

        performanceOk(function() { $.dto(testDeserialized).toJson(); }, 5);
        performanceOk(function() { $.dto.parseJson(testSerialized).toObject(), $.hash(testDeserialized).remove("b").toObject() }, 1);
    });

    test("parseQueryString", function() {
        var testSerialized = "sex=m&test=test&age=25&married=true&_uri=here%2Fto%2Fthere.go&date1=2014-3-25&date2=2014-02-01T06%3A00%3A00.000Z&number=23.45&_null=null",
            testDeserialized = {sex:"m", test: "test", age:25, married:true, "_uri":"here/to/there.go", "date1": "2014-3-25", "date2": new Date(2014, 1, 1), "number": 23.45, "_undefined": undefined, "_null": null};

        expect(4);
        equal($.dto(testDeserialized).toQueryString(), testSerialized, "Serialize");
        deepEqual($.dto.parseQueryString(testSerialized).toObject(), $.hash(testDeserialized).remove("_undefined").toObject(), "Deserialize");

        performanceOk(function() { $.dto(testDeserialized).toQueryString(); }, 5);
        performanceOk(function() { $.dto.parseQueryString(testSerialized).toObject() }, 5);
    });

    test("parseJsonArray", function() {
        var testSerialized = '[{"a":null,"man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}]',
            testDeserialized = [{a:null, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"}];

        expect(4    );
        equal($.dto(testDeserialized).toJson(), testSerialized, "Serialize");
        deepEqual($.dto.parseJson(testSerialized).toObject(), $.list(testDeserialized).toArray(), "Deserialize");

        performanceOk(function() { $.dto(testDeserialized).toJson(); }, 5);
        performanceOk(function() { $.dto.parseJson(testSerialized).toObject(); }, 5);
    });
});