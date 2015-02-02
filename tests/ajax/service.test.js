$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("service");
    
    test("create", function() { ok($.service()); });

    var service = $.service("test")
            .onSuccess(function(response){
                var data = $.dto.parseJson(response).toObject();
                equal(data.message, "testMessage");
                start();
            }),
        runTest = function(type){
            service[type]().uri($.str.format("stubs/ajax/{0}Test.js", type)).call();
        };

    asyncTest("xhr", function() { runTest("xhr"); });
    asyncTest("xss", function() { runTest("xss"); });
});