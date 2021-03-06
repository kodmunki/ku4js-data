$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("queryString");

    var testSerialized = "sex=m&test=test&age=25&married=true&_uri=here%2Fto%2Fthere.go&date1=2014-3-25&date2=2014-02-01T06%3A00%3A00.000Z&number=23.45&_null=null",
        testDeserialized = {sex:"m", test: "test", age:25, married:true, "_uri":"here/to/there.go", "date1": "2014-3-25", "date2": new Date(2014, 1, 1), "number": 23.45, "_null": null};


    test("deserialize", function() {
        expect(1);
        deepEqual($.queryString.deserialize(testSerialized), testDeserialized);
    });

    test("serialize", function() {
        expect(1);
        equal($.queryString.serialize(testDeserialized), testSerialized);
    });
});