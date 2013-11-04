$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("queryString");

    var obj = {sex:"m", age:25, married:true, "_uri":"here/to/there.go"},
        str = "sex=m&age=25&married=true&_uri=here%2Fto%2Fthere.go";

    test("serialize", function() {
        expect(1);
        equal($.queryString.serialize(obj), str);
    });
    test("deserialize", function() {
        expect(4);
        var o = $.queryString.deserialize(str);
        equal(o.sex, obj.sex);
        equal(o.age, obj.age);
        equal(o.married, obj.married);
        equal(o._uri, obj._uri);
    });
});