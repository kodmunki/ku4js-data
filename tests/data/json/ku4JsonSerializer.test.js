$(function(){
    function notOk(s, m) {equal(s,false,m);}

    var testSerialized = '{"a":"null","man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
        testDeserialized = {a:null, b:undefined, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

    module("ku4JsonSerializer|json");

    test("serialize", function() {
        expect(1);
        equal($.json.serialize(testDeserialized), testSerialized);
    });
    test("deserialize", function() {
        expect(8);
        var obj = $.json.deserialize(testSerialized);
        equal(obj.man.sex, testDeserialized.man.sex);
        equal(obj.man.age, testDeserialized.man.age);
        equal(obj.man.married, testDeserialized.man.married);
        deepEqual(obj.man.children, testDeserialized.man.children);
        equal(obj.man.contact.home, testDeserialized.man.contact.home);
        deepEqual(obj.date, testDeserialized.date);
        equal(obj.multiline, testDeserialized.multiline);
        equal(obj.html, testDeserialized.html);
    });

    test("deserialize empty collection", function(){
        var deserialized = $.json.deserialize('{"name":"test","data":{}}'),
            obj = { "name": "test", "data": { } };
        expect(1);
        deepEqual(deserialized, obj);
    })
});