function cors(){
    cors.base.call(this);
    this._isOk = function(status){ return /[23]\d{2}/.test(status) || this.context().isLocal(); };
    this._isAborted = function(status){ return !/\d{3}/.test(status); };
    this._attempts = 0;
}
cors.prototype = {
    context: function(context){ return this.property("context", context); },
    abort: function(){
        try { this._cors.abort(); }
        catch(e){ /*Fail*/ }
    },
    call: function(params, settings){
        this._cors = cors_createCors();
        var paramsExist = $.exists(params),
            requestHeaders = settings.requestHeaders,
            context = this.context(),
            isPost = context.isPost(),
            isMultipart = params instanceof FormData,
            hasQuery = !isPost && paramsExist,
            noCache = context._noCache,
            cacheParam = $.str.format("__ku4nocache={0}", $.uid()),
            postParams = (isPost) ? params : null,
            format = (hasQuery && noCache) ? "{0}?{1}&{2}" : hasQuery ? "{0}?{1}" : noCache ? "{0}?{2}" : "{0}",
            cors = this._cors,
            me = this;

        if(!$.exists(cors)) context.error(new Error("CORS not supported"));
        if($.exists(settings.withCredentials)) this._cors.withCredentials = settings.withCredentials;
        cors.open(context.verb(), $.str.format(format, context.uri(), params, cacheParam), context.isAsync());

        if(isPost && !isMultipart){
            var contentType = (!$.exists(settings.contentType)) ? "application/x-www-form-urlencoded" : settings.contentType;
            cors.setRequestHeader("Content-Type", contentType);
        }

        if(!requestHeaders.isEmpty()) requestHeaders.each(function(header) {
            cors.setRequestHeader(header.key, header.value);
        });

        cors.onload = function() {
            var response = this[context.responseType()],
                status = this.status;

            if(me._isAborted(status)) return;
            if(me._isOk(status)){
                context.success(response).complete(response);
                return;
            }
            if(me._attempts < context.maxAttempts()) me.call(params);
            else context.error(response).complete(response);
        };

        cors.onerror = function() {
            var response = this[context.responseType()];
            if(me._attempts < context.maxAttempts()) me.call(params);
            else context.error(response).complete(response);
        };

        if($.exists(postParams)) cors.send(postParams);
        else cors.send();
    }
};
$.Class.extend(cors, $.Class);

function cors_createCors(){

    var xhr = $.exists(XMLHttpRequest) ? new XMLHttpRequest() : null;

    return ("withCredentials" in xhr)
        ? xhr
        : ($.exists(XDomainRequest))
            ? new XDomainRequest()
            : null;
}