$(function(){
    function notOk(s, m) {equal(s,false,m);}
    
    module("form Test");
    
    test("create", function() {
        ok($.form());
    });
    
    var firstName = $.field($("#FirstName")[0]).spec($.fields.specs.alpha),
        lastName = $.field($("#LastName")[0]).spec($.fields.specs.alpha),
        date = $.field($("#Birthday")[0]).spec($.fields.specs.date),
        currency = $.field($("#Salary")[0]).spec($.fields.specs.currency),
        title = $.select($("#Title")[0]).spec($.spec(function(v){ return /[0-2]/.test(v)})),
        form = $.form()
            .add("firstName", firstName)
            .add("lastName", lastName)
            .add("date", date)
            .add("currency", currency)
            .add("title", title);
    
    test("optional fields", function() {
         
        form.clear();
        ok(form.isValid());
        
        firstName.value("John");
        lastName.value("Doe");
        date.value("11/12/2011");
        currency.value("$50,000.00");
        title.value("1");
        ok(form.isValid());
        
        form.clear();
    });
    
    test("required fields", function() {
         
        firstName.required();
        lastName.required();
        date.required();
        currency.required();
         
        form.clear();
        notOk(form.isValid());
        
        firstName.value("John");
        lastName.value("Doe");
        date.value("11/12/2011");
        currency.value("$50,000.00");
        title.value("1");
        ok(form.isValid());
        
        form.clear();
    });
    
    test("read", function() {
        firstName.value("John");
        lastName.value("Doe");
        date.value("11/12/2011");
        currency.value("$50,000.00");
        title.value("1");
        
        var dto = form.read();
        
        equal(dto.find("firstName"), "John");
        equal(dto.find("lastName"), "Doe");
        equal(dto.find("date"), "11/12/2011");
        equal(dto.find("currency"), "$50,000.00");
        equal(dto.find("title"), "1");
    });
    
    test("write", function() {
        form.clear();
        
        ok($.isNullOrEmpty(firstName.value()));
        ok($.isNullOrEmpty(lastName.value()));
        ok($.isNullOrEmpty(date.value()));
        ok($.isNullOrEmpty(currency.value()));
        ok($.isNullOrEmpty(title.value()));
        
        var dto = $.dto()
            .add("firstName", "Jane")
            .add("lastName", "Doedett")
            .add("date", "1/1/2012")
            .add("currency", "$80,000.00")
            .add("title", "0");
        
        form.write(dto);
        
        equal(dto.find("firstName"), "Jane");
        equal(dto.find("lastName"), "Doedett");
        equal(dto.find("date"), "1/1/2012");
        equal(dto.find("currency"), "$80,000.00");
        equal(dto.find("title"), "0");
    });
    
    test("save", function() {
        $.cookie.erase("myForm");
        equal($.cookie.find("myForm"), null);
        
        form.saveAs("myForm");
        ok($.cookie.find("myForm"));
    });
    
    test("load", function() {
        form.clear();
        
        ok($.isNullOrEmpty(firstName.value()));
        ok($.isNullOrEmpty(lastName.value()));
        ok($.isNullOrEmpty(date.value()));
        ok($.isNullOrEmpty(currency.value()));
        ok($.isNullOrEmpty(title.value()));
        
        var dto = $.dto()
            .add("firstName", "Jane")
            .add("lastName", "Doedett")
            .add("date", "1/1/2012")
            .add("currency", "$80,000.00")
            .add("title", "0");
            
        form.load("myForm");
        
        equal(dto.find("firstName"), "Jane");
        equal(dto.find("lastName"), "Doedett");
        equal(dto.find("date"), "1/1/2012");
        equal(dto.find("currency"), "$80,000.00");
        equal(dto.find("title"), "0");
    });  
});