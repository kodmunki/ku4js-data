$(function() {

    module("large collection Test");

    function createObject(id) {
        return {
            "id": id,
            "firstName": $.uid(),
            "lastName": $.uid(),
            "emailAddress": $.uid()
        }
    }
    var collection = $.ku4collection("lgTest").store($.ku4localStorageStore()),
        data = [],
        objectNumber = $.math.round(Math.random() * 1000, 0),
        objectId;

    for(var i=0; i<1000; i++)  {
        var id = $.uid();

        if(i == objectNumber) objectId = id;
        data.push(createObject(id));
    }

    test("init", function() {
        expect(1);
        performanceOk(function() { collection.init(data).save(); }, 200);
    });

    test("find", function() {

        collection.init(data).save();

        expect(3);
        ok(collection.find({"id": objectId}).length == 1);
        equal(collection.find({"id": objectId})[0].id, objectId);
        performanceOk(function() { collection.find({"id": objectId}); }, 50);
    });

    test("remove", function() {

        collection.init(data).save();

        expect(4);
        ok(collection.find({"id": objectId}).length == 1);
        equal(collection.find({"id": objectId})[0].id, objectId);
        performanceOk(function() { collection.remove({"id": objectId}); }, 50);

        ok(collection.find({"id": objectId}).length == 0);
    });

    test("update", function() {

        collection.init(data).save();

        var testEmail = "test@email.com";

        expect(4);
        ok(collection.find({"id": objectId}).length == 1);
        performanceOk(function() { collection.update({"id": objectId}, {"email": testEmail}); }, 50);

        var obj = collection.find({"id": objectId})[0];
        equal(obj.id, objectId);
        equal(obj.email, testEmail);
    });

});