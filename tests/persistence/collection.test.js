$(function(){
    function notOk(s, m) {equal(s,false,m);}

    module("collection Test");

    test("new", function() {
        expect(1);
        ok($.ku4collection("testCollection"));
    });

    test("findByKu4Id", function() {
        var collection = $.ku4collection("testCollection"),
            data = {
                "name": "John",
                "email": "email@email.com"
            },
            entity = collection.insert(data),
            test = collection.findByKu4Id(entity._ku4Id);
        expect(2);
        equal(data.name, test.name);
        equal(data.email, test.email);
    });

    test("find", function() {
        var collection = $.ku4collection("testCollection"),
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

        var test = collection.find({"name": "John"});
        equal(test.length, 2);
        equal(test[0].email, data1.email);
        equal(test[1].email, data2.email);
    });

    test("find with $criteria", function() {
        var collection = $.ku4collection("testCollection"),
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

    test("orderby ascending", function() {
        var collection = $.ku4collection("testCollection"),
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
        var collection = $.ku4collection("testCollection"),
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
        var collection = $.ku4collection("testCollection"),
            data1 = {
                "name": "John",
                "email": "john.a@email.com"
            },
            data2 = {
                "name": "Jim",
                "email": "john.c@email.com"
            },
            data3 = {
                "name": "Jane",
                "email": "john.b@email.com"
            };
        collection.insert(data1);
        collection.insert(data2);
        collection.insert(data3);

        expect(4);
        equal(collection.find().length, 3);

        var test = collection.find({"$in": {"name": ["John", "Jane"]}, "$orderby": {"name": 1}});
        equal(test.length, 2);
        equal(test[0].email, data3.email);
        equal(test[1].email, data1.email);
    });

    test("insert", function() {
        var collection = $.ku4collection("testCollection");
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
        var collection = $.ku4collection("testCollection"),
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
        var collection = $.ku4collection("testCollection"),
            data1 = collection.insert({
                "name": "John",
                "email": "john@email.com"
            }),
            data2 = collection.insert({
                "name": "John",
                "email": "john1@email.com"
            }),
            data3 = collection.insert({
                "name": "Jane",
                "email": "jane@email.com"
            });

        expect(7);

        var entity = collection.find({"name": "John"})[0];
        equal(entity.email, "john@email.com");

        collection.update({"name": "John"}, {"name": "Bob"});

        equal(collection.find({"name": "John"}).length, 0);
        equal(collection.find({"name": "Bob"}).length, 2);
        equal(collection.find({"name": "Bob"})[0].email, "john@email.com");

        collection.update({"_ku4Id": data1._ku4Id}, {name: "Tester", email: "tester.test@email.com"});
        var entity2 = collection.find({"_ku4Id": data1._ku4Id})[0];
        equal(entity2._ku4Id, data1._ku4Id);
        equal(entity2.name, "Tester");
        equal(entity2.email, "tester.test@email.com");

    });

    test("serialize", function() {
        var collection = $.ku4collection("testCollection"),
            entity = collection.insert({
                "name": "John",
                "email": "john@email.com"
            }),
            data = $.dto().add(entity._ku4Id, entity).toObject(),
            serialized = $.dto({
                "name": "testCollection",
                "data": data
            }).toJson();
        expect(1);
        deepEqual(collection.serialize(), serialized);
    });

    test("deserialize", function() {
        var collection = $.ku4collection("testCollection"),
            entity = collection.insert({
                "name": "John",
                "email": "john@email.com"
            }),
            data = $.dto().add(entity._ku4Id, entity).toObject(),
            serialized = $.dto({
                "name": "testCollection",
                "data": data
            }).toJson();
        expect(4);
        deepEqual(collection.serialize(), serialized);

        var newCollection = $.ku4collection.deserialize(serialized),
            test = newCollection.findByKu4Id(entity._ku4Id);

        equal(entity._ku4Id, test._ku4Id);
        equal(entity.name, test.name);
        equal(entity.email, test.email);
    });
});