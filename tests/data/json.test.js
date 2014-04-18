$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("json");

    test("parseJson", function() {
        var testSerialized = '{"a":null,"man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
            testDeserialized = {a:null, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

        expect(2);
        deepEqual($.dto.parseJson(testSerialized).toObject(), testDeserialized);
        equal($.dto(testDeserialized).toJson(), testSerialized);
    });

});