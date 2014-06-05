$.ku4store = function() {
    if($.exists(localStorage)) return $.ku4localStorageStore();
    else return new $.ku4memoryStore();
};