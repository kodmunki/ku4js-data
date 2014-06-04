$.ku4store = function() {
    var idxdb = indexedDB || webkitIndexedDB || mozIndexedDB;
    if($.exists(idxdb)) return $.ku4indexedDbStore();
    if($.exists(localStorage)) return $.ku4localStorageStore();
    else return new $.ku4memoryStore();
};