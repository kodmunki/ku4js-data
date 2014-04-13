$(function(){
    function notOk(s, m) {equal(s,false,m);}

    var testSerialized = '{"a":null,"b":"undefined","man":{"sex":"m","age":25,"married":true,"children":["Tom","Dick","Jane"],"contact":{"home":9998887777}},"date":"1906-08-04T05:00:00.000Z","multiline":"Here is\\\\ \/ a multiline\\f\\nparagraph\\rfor\\ttesting","html":"<html class=\\\"css-class\\\"></html>"}',
        testDeserialized = {a:null, b:undefined, man:{sex:"m", age:25, married:true, children:["Tom","Dick","Jane"],contact:{"home":9998887777}},"date":new Date(1,1,2011),"multiline":"Here is\\ / a multiline\f\nparagraph\rfor\ttesting","html":"<html class=\"css-class\"></html>"};

    module("json");

    test("serialize", function() {
        expect(1);
        equal($.json.serialize(testDeserialized), testSerialized);
    });
    test("deserialize", function() {
        expect(8);
        var man = $.json.deserialize(testSerialized);
        equal(man.man.sex, testDeserialized.man.sex);
        equal(man.man.age, testDeserialized.man.age);
        equal(man.man.married, testDeserialized.man.married);
        deepEqual(man.man.children, testDeserialized.man.children);
        equal(man.man.contact.home, testDeserialized.man.contact.home);
        deepEqual(man.date, testDeserialized.date);
        equal(man.multiline, testDeserialized.multiline);
        equal(man.html, testDeserialized.html);
    });
});