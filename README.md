ku4jQuery-data
==============

kodmunki™ utilities for jQuery data.

This library includes Query String and JSON parsers, Data Transfer Objects, ajax services, and persistent, validatable, and transferable forms

#Dependencies
* ku4jQuery-kernel - https://github.com/kodmunki/ku4jQuery-kernel

#kodmunki™ build process

This build process is dependent upon yuicompressor and a specific directory structure:

* root
 *:_build (This build script and the yuicompressor)
 * bin (The compiled scripts will appear here)
 * src (All script files go here)

The following variables found in setup () are
expected to be changed by the developer running
this process:

* LIBRARY (The library to build for or {} for none)
* PROJNAME (The name of your project)
* STARTMSG (A message to echo at start of build)
* ENDMSG (A message to echo at end of build)

---

#Documentation
The following is documentation for each class in the ku4jQuery-data library organized by common domain to follow the
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
| find(query) | Array | Returns an array containing the results of the query. |
| insert(entity) | object | String | Inserts the entity into the collection |
| update(criteria, updates) | this | Updates all entities that satisfy the criteria with the data in updates. |
| remove(criteria) | this | Removes all entities that satisfy the criteria. |
| join(otherCollection, on, equals) | collection | Joins this collection with otherCollection on collection[on] == otherCollection[equals] |
| init(array) | this | Clears this collection and initializes it with the entities in the array. |
| save() | this | Saves this collection to localStorage (as available). |

###store
_Documentation Coming Soon_
