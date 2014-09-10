$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("multipartForm");

    test("create", function() {
        expect(1);
        ok($.multipartForm());
    });

    test("read", function() {
        var form = $.multipartForm()
                        .addData("jsonData", $.dto({"one":1, "two":2}).toJson())
                        .addTextFile("textFile", "text.txt", "text/plain", "Here is the data");

        console.log(form.read())

        equal(form.read(), "");
    });
});