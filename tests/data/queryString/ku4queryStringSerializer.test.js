$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("queryString");

    var obj = {sex:"m", test: "test", age:25, married:true, "_uri":"here/to/there.go", "date1": "2014-3-25", "date2": new Date(2014, 1, 1), "number": 23.45, "_undefined": undefined, "_null": null},
        str = "sex=m&test=test&age=25&married=true&_uri=here%2Fto%2Fthere.go&date1=2014-3-25&date2=2014-02-01T06%3A00%3A00.000Z&number=23.45&_null=null";

    test("serialize", function() {
        expect(1);
        equal($.queryString.serialize(obj), str);
    });
    test("deserialize", function() {
        expect(9);
        var o = $.queryString.deserialize(str);
        equal(o.sex, obj.sex);
        equal(o.age, obj.age);
        equal(o.married, obj.married);
        equal(o._uri, obj._uri);
        equal(o.date1, obj.date1);
        deepEqual(o.date2, obj.date2);
        equal(o.number, obj.number);
        equal(o._undefined, obj._undefined);
        equal(o._null, obj._null);
    });
});