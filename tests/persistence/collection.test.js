$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("collection Test");

    test("new", function() {
        expect(1);
        ok($.ku4collection("test"));
    });

    test("find", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "email@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john@email.com"
            },
            data3 = {
                "name": "Jane",
                "email": "email@email.com"
            },
            data4 = {
                "name": "Jane",
                "email": "email@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);
        collection.insert(data4);

        expect(4);
        equal(collection.find().length, 4);

        var test = collection.find({"name": "John"});
        equal(test.length, 2);
        equal(test[0].email, data1.email);
        equal(test[1].email, data2.email);
    });

    test("find with $criteria", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "email@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john@email.com"
            },
            data3 = {
                "name": "Jane",
                "email": "email@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(4);
        equal(collection.find().length, 3);

        var test = collection.find({$criteria:{"name": "John"}});
        equal(test.length, 2);
        equal(test[0].email, data1.email);
        equal(test[1].email, data2.email);
    });

    test("orderby ascending empty query", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "john.a@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john.c@email.com"
            },
            data3 = {
                "name": "John",
                "email": "john.b@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(5);
        equal(collection.find().length, 3);

        var test = collection.find({"$orderby": {"email": 1}});
        equal(test.length, 3);
        equal(test[0].email, data1.email);
        equal(test[1].email, data3.email);
        equal(test[2].email, data2.email);
    });

    test("orderby ascending", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "john.a@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john.c@email.com"
            },
            data3 = {
                "name": "John",
                "email": "john.b@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(5);
        equal(collection.find().length, 3);

        var test = collection.find({"name": "John", "$orderby": {"email": 1}});
        equal(test.length, 3);
        equal(test[0].email, data1.email);
        equal(test[1].email, data3.email);
        equal(test[2].email, data2.email);
    });

    test("orderby descending", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "john.a@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john.c@email.com"
            },
            data3 = {
                "name": "John",
                "email": "john.b@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(5);
        equal(collection.find().length, 3);

        var test = collection.find({"name": "John", "$orderby": {"email": -1}});
        equal(test.length, 3);
        equal(test[0].email, data2.email);
        equal(test[1].email, data3.email);
        equal(test[2].email, data1.email);
    });

    test("find in", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "john.a@email.com",
                "street1": "Street A11",
                "street2": "Street A22",
                "city": "City 1",
                "state": "AA",
                "zip": 11111
            },
            data2 = {
                "name": "Jim",
                "email": "john.c@email.com",
                "street1": "Street B11",
                "street2": "Street B22",
                "city": "City 2",
                "state": "BB",
                "zip": 22222
            },
            data3 = {
                "name": "Jane",
                "email": "john.b@email.com",
                "street1": "Street C11",
                "street2": "Street C22",
                "city": "City 3",
                "state": "CC",
                "zip": 33333
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(4);
        equal(collection.find().length, 3);

        var test = collection.find({"$in": {"name": ["John", "Jane"]}});
        equal(test.length, 2);
        equal(test[0].email, data1.email);
        equal(test[1].email, data3.email);
    });

    test("insert", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore());
        expect(3);

        ok(collection.isEmpty());

        collection.insert({
            "name": "John",
            "email": "john@email.com"
        });
        ok(!collection.isEmpty());
        equal(collection.count(), 1);
    });

    test("remove", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "email@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john@email.com"
            },
            data3 = {
                "name": "Jane",
                "email": "email@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(2);
        equal(collection.count(), 3);
        collection.remove({"name": "John"});
        equal(collection.count(), 1);
    });

    test("update", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()).init([
            {
                "name": "John",
                "email": "john@email.com"
            },
            {
                "name": "John",
                "email": "john1@email.com"
            },
            {
                "name": "Jane",
                "email": "jane@email.com"
            }]);

        expect(6);

        var entity = collection.find({"name": "John"})[0];
        equal(entity.email, "john@email.com");

        collection.update({"name": "John"}, {"name": "Bob"});

        equal(collection.find({"name": "John"}).length, 0);
        equal(collection.find({"name": "Bob"}).length, 2);
        equal(collection.find({"name": "Bob"})[0].email, "john@email.com");

        collection.update({"email": "john@email.com"}, {name: "Tester", email: "tester.test@email.com"});
        var entity2 = collection.find({"name": "Tester"})[0];
        equal(entity2.name, "Tester");
        equal(entity2.email, "tester.test@email.com");

    });

    test("join", function() {
        var collection1 = $.ku4collection("collection1").store($.ku4localStorageStore()).init([
                {
                    "id": 100,
                    "name": "myName1"
                },
                {
                    "id": 200,
                    "name": "myName2"
                },
                {
                    "id": 300,
                    "name": "myName3"
                }
            ]),
            collection2 = $.ku4collection("collection2").store($.ku4localStorageStore()).init([
                {
                    "id": 110,
                    "cid": 100,
                    "name": "otherName1"
                },
                {
                    "id": 120,
                    "cid": 200,
                    "name": "otherName1"
                },
                {
                    "id": 130,
                    "cid": 300,
                    "name": "otherName3"
                },
                {
                    "id": 230,
                    "cid": 300,
                    "name": "otherName3"
                }
            ]);

        var join = collection1.join(collection2, "id", "cid"),
            result = join.find({
                "collection1.name": "myName3",
                "collection2.name": "otherName3"
            });

        expect(10);
        equal(join.count(), 4);
        equal(result.length, 2);
        equal(result[0]["collection1.id"], 300);
        equal(result[0]["collection2.id"], 130);
        equal(result[0]["collection1.name"], "myName3");
        equal(result[0]["collection2.name"], "otherName3");
        equal(result[1]["collection1.id"], 300);
        equal(result[1]["collection2.id"], 230);
        equal(result[1]["collection1.name"], "myName3");
        equal(result[1]["collection2.name"], "otherName3");
    });

     test("join with function", function() {
        var collection1 = $.ku4collection("collection1").store($.ku4localStorageStore()).init([
                {
                    "id": 100,
                    "name": "myName1"
                },
                {
                    "id": 200,
                    "name": "myName2"
                },
                {
                    "id": 300,
                    "name": "myName3"
                }
            ]),
            collection2 = $.ku4collection("collection2").store($.ku4localStorageStore()).init([
                {
                    "id": 110,
                    "cid": 100,
                    "name": "otherName1"
                },
                {
                    "id": 120,
                    "cid": 200,
                    "name": "otherName1"
                },
                {
                    "id": 130,
                    "cid": 300,
                    "name": "otherName2"
                },
                {
                    "id": 230,
                    "cid": 300,
                    "name": "otherName3"
                }
            ]);

        var join = collection1.join(collection2, function(c1, c2) {
                var regexp = /Name3/;
                return  c1.id === c2.cid &&
                        regexp.test(c1.name) &&
                        regexp.test(c2.name);
            }),
            result = join.find();

        expect(6);
        equal(join.count(), 1);
        equal(result.length, 1);
        equal(result[0]["collection1.id"], 300);
        equal(result[0]["collection2.id"], 230);
        equal(result[0]["collection1.name"], "myName3");
        equal(result[0]["collection2.name"], "otherName3");
    });

    test("exec", function(){
        var collection = $.ku4collection("test").store($.ku4localStorageStore())
                            .exec(function(item){ return { "id": 1, "address": item.email } }),
            data1 = {
                "name": "John",
                "email": "email@email.com"
            },
            data2 = {
                "name": "John",
                "email": "john@email.com"
            },
            data3 = {
                "name": "Jane",
                "email": "email@email.com"
            },
            data4 = {
                "name": "Jane",
                "email": "email@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);
        collection.insert(data4);

        expect(6);
        equal(collection.find().length, 4);

        var test = collection.find({"name": "John"});
        equal(test.length, 2);
        equal(test[0].id, 1);
        equal(test[0].address, data1.email);
        equal(test[1].id, 1);
        equal(test[1].address, data2.email);
    });

    test("spec", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore()),
            data1 = {
                "name": "John",
                "email": "john.a@email.com",
                "street1": "Street A11",
                "street2": "Street A22",
                "city": "City 1",
                "state": "AA",
                "zip": 11111
            },
            data2 = {
                "name": "Jim",
                "email": "john.c@email.com",
                "street1": "Street B11",
                "street2": "Street B22",
                "city": "City 2",
                "state": "BB",
                "zip": 22222
            },
            data3 = {
                "name": "Jane",
                "email": "john.b@email.com",
                "street1": "Street C11",
                "street2": "Street C22",
                "city": "City 3",
                "state": "CC",
                "zip": 33333
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(6);
        equal(collection.find().length, 3);

        var test1 = collection.find({"$spec": $.spec(function(item) { return item.zip < 30000})});
        equal(test1.length, 2);
        equal(test1[0].email, data1.email);
        equal(test1[1].email, data2.email);

        var test2 = collection.find({"$spec": $.spec(function(item) { return item.zip > 30000})});
        equal(test2.length, 1);
        equal(test2[0].email, data3.email);
    });

    test("serialize", function() {
        var collection = $.ku4collection("test").store($.ku4localStorageStore())
                .insert({
                    "name": "Serial",
                    "email": "Seri@lize.com"
                })
                .insert({
                    "name": "Serial",
                    "email": "Seri@lize.com"
                }),
            regex = /\{"name":"test"\,"data":\{"[A-z0-9]{32}":\{"name":"Serial"\,"email":"Seri@lize.com"\}\,"[A-z0-9]{32}":\{"name":"Serial"\,"email":"Seri@lize.com"\}\}\}/;

        expect(1);
        ok(regex.test(collection.serialize()));
    });

    test("deserialize", function() {
        var data1 = {
                "name": "Serial",
                "email": "Seri@lize.com"
            },
            data2 = {
                "name": "Serial",
                "email": "Seri@lize.com"
            },
            collection = $.ku4collection("test").store($.ku4localStorageStore()).init([data1, data2]),
            regex = /\{"name":"test"\,"data":\{"[A-z0-9]{32}":\{"name":"Serial"\,"email":"Seri@lize.com"\}\,"[A-z0-9]{32}":\{"name":"Serial"\,"email":"Seri@lize.com"\}\}\}/,
            serialized = collection.serialize(),
            deserialized = $.ku4collection.deserialize(serialized),
            results = deserialized.find();

        expect(6);
        ok(regex.test(collection.serialize()));
        equal(results.length, 2);
        equal(results[0].name, data1.name);
        equal(results[0].email, data1.email);
        equal(results[1].name, data2.name);
        equal(results[1].email, data2.email);
    });

    test("__delete", function() {
        expect(2);
        $.ku4collection("test").store($.ku4localStorageStore()).insertList([
            {
                "name": "John",
                "email": "email@email.com"
            },
            {
                "name": "John",
                "email": "john@email.com"
            },
            {
                "name": "Jane",
                "email": "email@email.com"
            },
            {
                "name": "Jane",
                "email": "email@email.com"
            }
        ]).save();

        var results1 = $.ku4localStorageStore().read("test").find();
        equal(results1.length, 4);

        $.ku4localStorageStore().read("test").__delete();

        $.ku4collection("test").store($.ku4localStorageStore()).insertList([
            {
                "name": "John",
                "email": "email@email.com"
            },
            {
                "name": "John",
                "email": "john@email.com"
            },
            {
                "name": "Jane",
                "email": "email@email.com"
            },
            {
                "name": "Jane",
                "email": "email@email.com"
            }
        ]).save();

        var results2 = $.ku4localStorageStore().read("test").find();
        equal(results2.length, 4);
        $.ku4localStorageStore().read("test").__delete();
    });
});