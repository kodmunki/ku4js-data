$.ku4store = function() {
    if($.exists(localStorage)) return $.ku4localStorageStore();
    else return new $.ku4memoryStore();
};

$.ku4AsyncStore = function() {
    var indexedDB, localStorage;
    if($.exists(indexedDB)) return $.ku4indexedDbStore();
    else if($.exists(localStorage)) return $.ku4localStorageStore();
    else return $.ku4memoryStore();
};