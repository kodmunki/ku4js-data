$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("indexedDbStore Test");

    test("new", function() {
        expect(1);
        ok($.ku4indexedDbStore())
    });

    asyncTest("read/write/remove/delete 'async'", function() {
        var store = $.ku4indexedDbStore();

        expect(10);
        store.read("testCollection", function(err, collection) {
            ok(collection);
            collection
                .insert({
                    "name": "John",
                    "email": "john@email.com"
                })
                .insert({
                    "name": "John",
                    "email": "john1@email.com"
                })
                .insert({
                    "name": "Jane",
                    "email": "jane@email.com"
                })
                .save(function(err, store) {

                    store.read("testCollection", function(err, collection) {
                        ok(collection.count(), 3);

                        var entities2 = collection.find({"name": "John"});
                        equal(entities2.length, 2);
                        equal(entities2[0].name, "John");
                        equal(entities2[0].email, "john@email.com");

                        collection
                            .remove({"name": "John"})
                            .save(function(err, store) {

                                store.read("testCollection", function(err, collection) {
                                    ok(collection.count(), 1);

                                    var entities3 = collection.find({"name": "Jane"});
                                    equal(entities3.length, 1);
                                    equal(entities3[0].name, "Jane");
                                    equal(entities3[0].email, "jane@email.com");

                                    collection.__delete(function(err, store) {
                                        store.read("testCollection", function(err, collection){
                                            equal(collection.count(), 0);
                                            start();
                                        });
                                    });
                                });
                            });
                    });
                });
        });
    });
});