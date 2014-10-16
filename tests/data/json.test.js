$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("json");

    var testSerialized = '{"a":null,"man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","dateArray":["1906-08-04T05:00:00.000Z"],"multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
        testDeserialized = {a:null, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"dateArray":[new Date(1,1,2011)],"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

    test("serialize", function() {
        expect(1);
        equal($.json.serialize(testDeserialized), testSerialized);
    });

    test("deserialize", function() {
        expect(1);
        deepEqual($.json.deserialize(testSerialized), testDeserialized);
    });

    test("deserialize malice", function() {
        expect(2);
        var malice1 = "{goober:(function(){alert('malice!');})}",
            malice2 = (function(){ return $.str.encodeBase64("(function(alert('malice!'))()"); })();

        deepEqual($.json.deserialize(malice1), malice1);
        deepEqual($.json.deserialize(malice2), $.str.encodeBase64("(function(alert('malice!'))()"));
    });
});