function xhr(){
    xhr.base.call(this);
    this._isOk = function(status){ return /[23]\d{2}/.test(status) || this.context().isLocal(); };
    this._isAborted = function(status){ return !/\d{3}/.test(status); };
    this._attempts = 0;
}
xhr.prototype = {
    context: function(context){ return this.property("context", context); },
    abort: function(){
        try { this._xhr.abort(); }
        catch(e){ /*Fail*/ }
    },
    call: function(params, settings){
        this._xhr = xhr_createXhr();
        var paramsExist = $.exists(params),
            requestHeaders = settings.requestHeaders,
            context = this.context(),
            isPost = context.isPost(),
            isMultipart = (function() { try { return ($.exists(FormData) && (params instanceof FormData)) } catch(e) { return false; } })(),
            hasQuery = !isPost && paramsExist,
            noCache = context._noCache,
            cacheParam = $.str.format("__ku4nocache={0}", $.uid()),
            postParams = (isPost) ? params : null,
            format = (hasQuery && noCache) ? "{0}?{1}&{2}" : hasQuery ? "{0}?{1}" : noCache ? "{0}?{2}" : "{0}",
            xhr = this._xhr,
            me = this;

        if(!$.exists(xhr)) context.error(new Error("Ajax not supported")); 
        xhr.open(context.verb(), $.str.format(format, context.uri(), params, cacheParam), context.isAsync());
        
        if(isPost && !isMultipart){
            var contentType = (!$.exists(settings.contentType)) ? "application/x-www-form-urlencoded" : settings.contentType;
            xhr.setRequestHeader("Content-Type", contentType);
        }

        if(!requestHeaders.isEmpty()) requestHeaders.each(function(header) {
            xhr.setRequestHeader(header.key, header.value);
        });

        xhr.onreadystatechange = function(){
            if(xhr.readyState > 3) {
                var response = xhr[context.responseType()],
                    status = xhr.status;
                if(me._isAborted(status)) return;
                if(me._isOk(status)){
                    context.success(response).complete(response);
                    return;
                }
                if(me._attempts < context.maxAttempts()) me.call(params);
                else context.error(response).complete(response);
            }
        };
        xhr.onerror = function() {
            var response = this[context.responseType()];
            if(me._attempts < context.maxAttempts()) me.call(params);
            else context.error(response).complete(response);
        };

        if($.exists(postParams)) xhr.send(postParams);
        else xhr.send();
    }
};
$.Class.extend(xhr, $.Class);

function xhr_createXhr(){
    return ($.exists(XMLHttpRequest))
        ? new XMLHttpRequest()
        : ($.exists(window.ActiveXObject))
            ? (function(){
                    var v = ["MSXML2.Http6.0", "MSXML2.Http5.0", "MSXML2.Http4.0", "MSXML2.Http3.0", "MSXML2.Http"];
                    for(var n in v) {
                        try{ return new ActiveXObject(v[n]); }
                        catch(e){ }
                    }
                    return null;
                })()
            : null;
}