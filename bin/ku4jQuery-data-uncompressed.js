(function(l){ $=l;
function service(){
    service.base.call(this);
    this._processId = $.uid("svc");
    this._onSuccess = $.observer();
    this._onError = $.observer();
    this._onComplete = $.observer();
    this._lock = $.lock();
    this._isLocal = false;
    
    this.GET().text().xhr().async().unlock();
}
service.prototype = {
    processId: function(){ return this.get("processId"); },
    verb: function(verb){ return this.property("verb", verb); },
    callType: function(callType){ return this.property("callType", callType); },
    responseType: function(responseType){ return this.property("responseType", responseType); },
    uri: function(uri){ return this.property("uri", uri); },
    contentType: function(contentType){ return this.property("contentType", contentType); },
    maxAttempts: function(maxAttempts){ return this.property("maxAttempts", maxAttempts); },
    isLocal: function(isLocal){ return this.property("isLocal", isLocal); },
    strategy: function(strategy){
        if($.exists(strategy)) strategy.context(this);
        return this.property("strategy", strategy);
    },
    isAsync: function(){ return /ASYNC/i.test(this.callType()); },
    isPost: function(){ return /POST/i.test(this.verb()); },
    isLocked: function(){ return this._lock.isLocked(); },
    isBusy: function(){ return this._isBusy; },
    
    onSuccess: function(f, s, id){ this._onSuccess.add(f, s, id); return this; },
    onError: function(f, s, id){ this._onError.add(f, s, id); return this; },
    onComplete: function(f, s, id){ this._onComplete.add(f, s, id); return this; },    
    removeListener: function(id){
        this._onSuccess.add(id);
        this._onError.add(id);
        this._onComplete.add(id);
        return this;
    },
    clearListeners: function(){
         this._onSuccess.clear();
        this._onError.clear();
        this._onComplete.clear();
        return this;
    },
    OPTIONS: function(){ return this.verb("OPTIONS"); },
    GET: function(){ return this.verb("GET"); },
    HEAD: function(){ return this.verb("HEAD"); },
    POST: function(){ return this.verb("POST"); },
    PUT: function(){ return this.verb("PUT"); },
    DELETE: function(){ return this.verb("DELETE"); },
    TRACE: function(){ return this.verb("TRACE"); },
    CONNECT: function(){ return this.verb("CONNECT"); },
    
    xhr: function(){ return this.strategy(new xhr()); },
    xss: function(){ return this.strategy(new xss()); },
    sync: function(){ return this.callType("sync"); },
    async: function(){ return this.callType("async"); },
    text: function(){ return this.responseType("responseText"); },
    xml: function(){ return this.responseType("responseXML"); },
    
    success: function(response){ this._onSuccess.notify(response, this._processId); return this; },
    error: function(response){ this._onError.notify(response, this._processId); return this; },
    complete: function(response){
        this._onComplete.notify(response, this._processId);
        this._isBusy = false;
        return this;
    },
    
    lock: function(){ this._lock.lock(); return this; },
    unlock: function(){ this._lock.unlock(); return this; },
    
    abort: function(){
        if(!this._isBusy) return this;
        this.strategy().abort();
        return this;
    },
    call: function(params){
        if(this.isLocked()) return this;
        this._isBusy = true;
        this.strategy().call(params, this._readSettings());
        return this;
    },
    _readSettings: function() {
        return { "contentType": this._contentType }
    }
}
$.Class.extend(service, $.Class);
$.service = function(){ return new service(); }

$.service.noCache = function(dto) {
    var noCache = $.dto({"noCache": $.uid()});
    if(!$.exists(dto)) return noCache;
    return dto.merge(noCache);
}

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

function xss(){
    xss.base.call(this);
    this._head = document.documentElement.getElementsByTagName("head")[0];
}
xss.prototype = {
    context: function(context){ return this.property("context", context); },
    abort: function(){
        try { this._head.removeChild(this._script); }
        catch(e){ /*Fail*/ }
    },
    call: function(params){
        var context = this.context(),
            head = document.documentElement.getElementsByTagName("head")[0],
            format = "{0}?ku4jXssOnSuccess=kodmunki.{1}&ku4jXssOnError=kodmunki.{2}&ku4jXssOnComplete=kodmunki.{3}{4}",
            procId = context.processId(),
            success = procId + "_success",
            error = procId + "_error",
            complete = procId + "_complete",
            parameters = ($.exists(params)) ? "&" + params : "",
            location = $.str.format(format, context.uri(), success, error, complete, parameters);
            
        this._script = $.create({script:{src:location, language:"javascript", type:"text/javascript"}});

        kodmunki[success] = function(){ context.success.apply(context, arguments); };
        kodmunki[error] = function(){ context.error.apply(context, arguments); };
        kodmunki[complete] = function(){ context.complete.apply(context, arguments); };
            
        this._head.appendChild(this._script);
    }
}
$.Class.extend(xss, $.Class);

function cookie() { cookie.base.call(this); }
cookie.prototype = {
    name: function(name) { return this.property("name", name); },
    expires: function(expires) { return this.property("expires", expires); },
    domain: function(domain) { return this.property("domain", domain); },
    path: function(path) { return this.property("path", path); },
    isSecure: function(isSecure) { return this.property("isSecure", isSecure); },
    erase: function() {
        this.expires(new Date("1/1/2000"));
        this.save();
        return this;
    },
    save: function(obj) {
        document.cookie = $.cookie.serialize(obj,
            {   name: this._name,
                expires: this._expires,
                path: this._path,
                domain: this._domain,
                isSecure: this._isSecure } );
        return this;
    }
}
$.Class.extend(cookie, $.Class);

$.cookie = function(params){
    var p = params || {},
        o = ($.isString(p))
            ? cookie_defaultParams.replicate().merge({name:p}).toObject()
            : cookie_defaultParams.replicate().merge(p).toObject();
    return (new cookie())
                .name(o.name)
                .expires(o.expires)
                .path(o.path)
                .domain(o.domain)
                .isSecure(o.isSecure);
}

$.cookie.erase = function(name){
    $.cookie.load(name).erase();
}

$.cookie.load = function(name){
    var o = ($.isObject(name)) ? name : { name: name };
        p = cookie_defaultParams.replicate().merge(o).toObject()
    return $.cookie(p);
}

$.cookie.find = function(name){
    var c = document.cookie.split("; "), i = c.length;
    while (i--) {
        var cke = c[i].split("=");
        if (cke[0] === name) return c[i];
    }
    return null;
}

$.cookie.serialize = function(obj, params) {
    var pms = params || {},
        o = cookie_defaultParams.replicate().merge(pms).toObject(),
        n = o.name,
        e = o.expires,
        p = o.path,
        d = o.domain,
        s = o.isSecure,
        I = cookie_buildInfoPair(n, escape($.json.serialize(obj))),
        E = ($.isDate(e)) ? cookie_buildInfoPair("; expires", e.toGMTString()) : "",
        P = (!p) ? "" : cookie_buildInfoPair("; path", escape(p)),
        D = (!d) ? "" : cookie_buildInfoPair("; domain", escape(d)),
        S = (!s) ? "" : "; secure";
    return I + E + P + D + S;
}

$.cookie.deserialize = function(cookie) {
    try {
        var ck = (/;/.test(cookie))
            ? cookie.substring(0, cookie.search(";")).split("=")
            : cookie.split("="),
            kv = { key: ck[0], value: ck[1] };
        return $.json.deserialize(unescape(kv.value));
    }
    catch(e){ throw $.exception("arg", $.str.format("Cannot deserialize {0}", cookie)); }
}

var cookie_defaultParams = $.hash({name:$.uid("COOKIE"),
                expires: $.dayPoint.today().nextYear().toDate(),
                path:"/",
                domain:null,
                isSecure:false });
var cookie_buildInfoPair = function(k, v) { return k + "=" + v; };

function dto(obj) {
    dto.base.call(this, obj);
}
dto.prototype = {
    name: function(name){ return this.set("name", name); },
    toJson: function() { return $.json.serialize(this.$h); },
    toQueryString: function() { return $.queryString.serialize(this.$h); },
    saveAs: function(name) {
        if(!name) throw $.exception("arg", "$.dto.saveAs requires a name");
        $.cookie(name).save(this.$h);
        this._name = name;
        return this;
    },
    save: function(){
        var name = this._name || $.uid("dto");
        this.saveAs(name);
        return name;
    },
    erase: function(){
        var name = this._name;
        if($.exists(name)) $.cookie.erase(name);
        return this;
    },
    replicate: function(){ return $.dto($.replicate(this.$h)); }
}
$.Class.extend(dto, $.hash.Class);

$.dto = function(obj){ return new dto(obj); }
$.dto.parseJson = function(str) { return $.dto($.json.deserialize(str)); }
$.dto.parseQueryString = function(str) { return $.dto($.queryString.deserialize(str)); }
$.dto.serialize = function(name) {
    try { return new dto($.cookie.deserialize($.cookie.find(name))).name(name); }
    catch(e) { return null; }
}

if(!$.exists($.json)) $.json = {};
$.json.serialize = function(obj) {
    if ($.isNull(obj)) return null;
    if ($.isUndefined(obj)) return undefined;
    if (!$.isArray(obj) && !$.isObject(obj))
        return obj.toString();
    var r = [],
        f = ($.isArray(obj)) ? "[{0}]" : "{{0}}";
    for (var n in obj) {
        var o = obj[n];
        if ($.isFunction(o)) continue;
        var v = ($.isUndefined(o))
                ? '"' + "undefined" + '"'
                : ($.isNumber(o))
                ? o
                : ($.isString(o))
                    ? '"' + json_serializeString(o) + '"'
                    : $.json.serialize(o);
        r[r.length] = (($.isObject(obj) && !$.isArray(obj))
            ? ("\"" + n + "\"" + ":")
            : "") + v;
    }
    return $.str.format(f, r);
}
$.json.deserialize = function(str) {
    if ($.isObject(str)) return str;
    if ($.isString(str))
        try { return eval("(" + json_deserializeString(str) + ")"); }
        catch (e) { return str; }
    return undefined;
}

function json_serializeString(str) {
    return str
        .replace(/\\/g,"\\\\")
        .replace(/\"/g,"\\\"")
        .replace(/\//g,"\/")
        .replace(/\f/g,"\\f")
        .replace(/\n/g,"\\n")
        .replace(/\r/g,"\\r")
        .replace(/\t/g,"\\t");
}
function json_deserializeString(str) {
    return str
        .replace(/\\\//g,"/")
        .replace(/\\\\f/g,"\\f")
        .replace(/\\\\n/g,"\\n")
        .replace(/\\\\r/g,"\\r")
        .replace(/\\\\t/g,"\\t");
}

if(!$.exists($.queryString)) $.queryString = {};
$.queryString.serialize = function(obj) {
    var r = "",
        e = encodeURIComponent;
    for (var n in obj)
        r += $.str.format("&{0}={1}", e(n), e($.json.serialize(obj[n])));
    return r.replace(/^\&/, "");
}
$.queryString.deserialize = function(str) {
    var q = str.replace(/.*\?/, ""), o = {}, kvs = q.split("&");
    if(!/\??\w+=\w+/.test(str)) return null;
    for (var n in kvs) {
        var d = decodeURIComponent, kv = (kvs[n]).split("=");
        o[d(kv[0])] = $.json.deserialize(d(kv[1]));
    }
    return o;
}


})(jQuery);
