ku4js-data
==============

kodmunki™ utilities for JavaScript data.

This library includes Query String and JSON parsers, Data Transfer Objects, ajax services, and persistent, validatable, and transferable forms

#Dependencies
* ku4js-kernel - https://github.com/kodmunki/ku4js-kernel

#kodmunki™ build process

This build process is dependent upon yuicompressor and a specific directory structure:

* root
 *:_build (This build script and the yuicompressor)
 * bin (The compiled scripts will appear here)
 * src (All script files go here)

The following variables found in setup () are
expected to be changed by the developer running
this process:

* PROJNAME (The name of your project)
* STARTMSG (A message to echo at start of build)
* ENDMSG (A message to echo at end of build)

---

#Documentation
The following is documentation for each class in the ku4js-data library organized by common domain to follow the
directory structure found in /src. All constructors are empty unless otherwise noted.

##Ajax

###serivce
| API | Return | Description |
| --- | --- | --- |
| processId | uid |  |
| GET | this |  |
| POST | this |  |
| PUT | this |  |
| HEAD | this |  |
| OPTIONS | this |  |
| DELETE | this |  |
| TRACE | this |  |
| CONNECT | this |  |
| xhr | this |  |
| xss | this |  |
| sync | this |  |
| async | this |  |
| text | this |  |
| xml | this |  |
| verb | this |  |
| uri | this |  |
| contentType | this |  |
| responseType | this |  |
| strategy | this |  |
| maxAttempts | this |  |
| isLocal | Boolean |  |
| isAsync | Boolean |  |
| isLocked | Boolean |  |
| isBusy | Boolean |  |
| lock | this |  |
| unlock | this |  |
| onSuccess | this |  |
| onError | this |  |
| onComplete | this |  |
| removeListener | this |  |
| clearListeners | this |  |

##Data

###cookie
_Documentation Coming Soon_

###dto

| API | Return | Description |
| --- | --- | --- |
| toJson() | String | Returns the dto key, value pairs as a JSON string. |
| toQueryString() | String | Returns the dto key, value pairs as a Query String |
| saveAs(name:_String_) | this | Saves the dto key, value pairs to a cookie with name. |
| save() | String | Saves the dto key, value pairs to a cookie with name. |
| erase() | this | Erases the current dto from the cookie. |

###json
_Documentation Coming Soon_

###queryString
_Documentation Coming Soon_

##Form

###field
_Documentation Coming Soon_

###form
_Documentation Coming Soon_

###specs
_Documentation Coming Soon_

###Fields

####checkbox
_Documentation Coming Soon_

####radioset
_Documentation Coming Soon_

####select
_Documentation Coming Soon_

##Persistence

###collection
| API | Return | Description |
| --- | --- | --- |
| find(query) | Array | Returns an array containing the results of the query. More on find below. |
| insert(entity) | object | String | Inserts the entity into the collection |
| update(criteria, updates) | this | Updates all entities that satisfy the criteria with the data in updates. |
| remove(criteria) | this | Removes all entities that satisfy the criteria. |
| join(otherCollection, on, equals) | collection | Joins this collection with otherCollection on collection[on] == otherCollection[equals] |
| join(otherCollection, function) | collection | Joins this collection with otherCollection based upon the boolean return value of the passed function. The passed function will receive two parameters for each possibility combination of joins that can be used to evaluate the intention ot join. |
| exec(function) | collection | Runs the function for each item in the results passing the result as the argument to the function. Then function should return a value as that value will be the value in the find results. |
| init(array) | this | Clears this collection and initializes it with the entities in the array. |
| save() | this | Saves this collection to localStorage (as available). |

####Find
The find method is the means by which you can query your collections. There are many ways to query a collection from
simple to complex. These methods are described below:

#####Simple Find
The first method of querying is the most simple. It is a direct query in which you are saying, "Give me
the objects in the collection that exactly match my query." To do this you pass an object containing the keys that you
would like to query and have values equal to that, that you are expecting. For example
```javascript
myCollection.find({"name": "myName"}).;
```
This specifies that you would like to get back all records that have a "name" with value "myName".

#####$in Find
This find allows you to specify that you are intersted in values that exist in a set. For example you may
have a collection of people, all of which have a firstName. You could then find all of the people in a set by doing the following
which will return all records where the firstName is "Alex" or "Joe" or "Erin".
```javascript
myCollection.find({"$in": ["Alex", "Joe", "Erin"]});
```

#####$spec Find
This find allows you to specify a policy that must be satisfied for the item to be included in the results.
Let's say, for example, that you have a collection of cars. These cars all have doors and a price. If you want to find
all cars that have 4 doors and are less than $30,000.00 you could do the following:
```javascript
myCollection.find({"$spec": function(item) {
  return item.doors == 4 && item.price < 300000;
}});
```
You can also pass a $.spec if you are using ku4js-kernel.
```javascript
myCollection.find({"$spec": $.spec(function(item) {
  return item.doors == 4 && item.price < 300000;
})}.
```
For those unfamiliar with spec, this may look like an unnecessary step and you can simply stick to functions.
For those who have harnessed the power of specs know that you can safely pass them in a $spec find.

#####$orderby Find
This allows you to order your results in ascending or descending order. To ascend you pass 1 to descend you pass -1. You
will pass the 1 or -1 as a value of the key on which you want to order by.
```javascript
myCollection.find({"$orderby": {"price": -1}});
```

#####Complex Find
You can use all of the various finds together as well! But they will run in a specified order. First a simple find or
an $in runs. Then the $spec will run on the results of the simple find or $in results. Finally, $orderby will run to
sort the results accordingly. For example, let's say we have a collection of cars and we want to find all cars of make:
BMW, Volvo, or Honda that have a price between 30000 and 60000 and we want to order them.
```javascript
myCollection.find({
 "$in": {"make": ["BMW", "Volvo", "Honda"]},
 "$spec": function(item){ return item.price > 30000 && item.price < 60000; },
 "$orderby": {"price": -1}
});
```

###store
_Documentation Coming Soon_
