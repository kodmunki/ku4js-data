$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("service");
    
    test("create", function() { ok($.service()); });
    
    var assertSuccess = function(response){
            ok(response.success);
            notOk(response.error);
            start();
        },
        assertError = function(response){
            ok(response.error);
            notOk(response.success);
            start();
        },
        service = $.service()
            .onSuccess(assertSuccess)
            .onError(assertError),
            
        runTest = function(type){
            service[type]().uri($.str.format("tests/ajax/{0}Test.js", type)).call();
        };

    asyncTest("xhr", function() { runTest("xhr"); });
    asyncTest("xss", function() { runTest("xss"); });
});