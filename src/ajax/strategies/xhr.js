function xhr(){
    xhr.base.call(this);
    this._isOk = function(status){ return /[23]\d{2}/.test(status) || this.context().isLocal(); }
    this._isAborted = function(status){ return !/\d{3}/.test(status); }
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
        var context = this.context(),
            isPost = context.isPost(),
            xhr = this._xhr,
            paramsExist = $.exists(params);
            format = (isPost || !paramsExist) ? "{0}" : "{0}?{1}",
            postParams = (isPost) ? params : null,
            paramLength = (paramsExist) ? params.length : 0;
            me = this;
            
        if(!$.exists(xhr)) context.error(new Error("Ajax not supported")); 
        xhr.open(context.verb(), $.str.format(format, context.uri(), params), context.isAsync());
        
        if(isPost){
            var contentType = (!settings.contentType) ? "application/x-www-form-urlencoded" : settings.contentType;
            xhr.setRequestHeader("Content-type", contentType);
            xhr.setRequestHeader("Content-length", paramLength);
            xhr.setRequestHeader("Connection", "close");
        }

        xhr.onreadystatechange = function(){
            if(xhr.readyState > 3) {
                var response = xhr[context.responseType()],
                    status = xhr.status;
                if(me._isAborted(status)) return;
                if(me._isOk(status)){
                    context.success(response).complete(response);
                    return;
                }
                if(me._attempts < context.maxAttempts()) {
                    me.call(params);
                    return;
                }
                context.error(response).complete(response);
            }
        }
        xhr.send(postParams);
    }
}
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