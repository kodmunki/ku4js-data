(function(l){
function service(name){
    service.base.call(this);

    var processId = name || $.uid(),
        format = "ku4service_{0}_{1}";

    this._onSuccess = $.observer($.str.format(format, processId, "onSuccess"));
    this._onError = $.observer($.str.format(format, processId, "onError"));
    this._onComplete = $.observer($.str.format(format, processId, "onComplete"));
    this._lock = $.lock();
    this._noCache = false;
    this._isLocal = false;
    this._processId = processId;
    
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
    cache: function(){ this._noCache = false; return this; },
    noCache: function(){ this._noCache = true; return this; },
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
    cors: function(){ return this.strategy(new cors()); },
    withCredentials: function(){ return this.property("withCredentials", true); },
    withoutCredentials: function(){ return this.property("withCredentials", false); },

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
        return {
            "contentType": this._contentType,
            "withCredentials": this._withCredentials
        }
    }
};
$.Class.extend(service, $.Class);
$.service = function(name){ return new service(name); };

$.service.noCache = function(dto) {
    var noCache = $.dto({"noCache": $.uid()});
    if(!$.exists(dto)) return noCache;
    return dto.merge(noCache);
};

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

        cors.onreadystatechange = function(){
            if(cors.readyState > 3) {
                var response = cors[context.responseType()],
                    status = cors.status;
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
        };

//        cors.onload = function() { };
//        cors.onerror = function() { };


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
            context = this.context(),
            isPost = context.isPost(),
            isMultipart = params instanceof FormData,
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
};
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
};
$.cookie.Class = cookie;

$.cookie.erase = function(name){
    $.cookie.load(name).erase();
};

$.cookie.load = function(name){
    var o = ($.isObject(name)) ? name : { name: name };
        p = cookie_defaultParams.replicate().merge(o).toObject()
    return $.cookie(p);
};

$.cookie.find = function(name){
    var c = document.cookie.split("; "), i = c.length;
    while (i--) {
        var cke = c[i].split("=");
        if (cke[0] === name) return c[i];
    }
    return null;
};

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
};

$.cookie.deserialize = function(cookie) {
    try {
        var ck = (/;/.test(cookie))
            ? cookie.substring(0, cookie.search(";")).split("=")
            : cookie.split("="),
            kv = { key: ck[0], value: ck[1] };
        return $.json.deserialize(unescape(kv.value));
    }
    catch(e){ throw $.exception("arg", $.str.format("Cannot deserialize {0}", cookie)); }
};

var cookie_defaultParams = $.hash({name:$.uid("COOKIE"),
                expires: $.dayPoint.today().nextYear().toDate(),
                path:"/",
                domain:null,
                isSecure:false });
var cookie_buildInfoPair = function(k, v) { return k + "=" + v; };

function dto(obj) {
    this._isArray = ($.isArray(obj) || obj instanceof $.list.Class);
    dto.base.call(this, obj);
}
dto.prototype = {
    name: function(name){ return this.set("name", name); },
    toJson: function() { return $.json.serialize(this.toObject()); },
    toQueryString: function() { return $.queryString.serialize(this.$h); },
    toFormData: function() {
        var data = new FormData();
        this.each(function(obj) {  data.append(obj.key, obj.value); });
        return data;
    },
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
    replicate: function(){ return $.dto($.replicate(this.$h)); },
    toObject: function() { return (this._isArray) ? this.values() : this.$h; },
    filter: function() {
        return $.dto(dto.base.prototype.filter.apply(this, arguments));
    },
    filterNullOrEmpty: function()
    {
        var keys = $.list.parseArguments(arguments);
        this.each(function(obj) {
            if(!$.isNullOrEmpty(obj.value)) keys.add(obj.key);
        });
        return this.filter.apply(this, keys.toArray());
    }
};
$.Class.extend(dto, $.hash.Class);

$.dto = function(obj){ return new dto(obj); };
$.dto.Class = dto;

$.dto.parseJson = function(str) { return $.dto($.json.deserialize(str)); };
$.dto.parseQueryString = function(str) { return $.dto($.queryString.deserialize(str)); };
$.dto.serialize = function(name) {
    try { return new dto($.cookie.deserialize($.cookie.find(name))).name(name); }
    catch(e) { return null; }
};

if(!$.exists($.json)) $.json = {};
$.json.serialize = function(obj) {
    if ($.isUndefined(obj)) return undefined;
    if ($.isNull(obj)) return null;
    if (!$.isArray(obj) && !$.isObject(obj))
        return obj.toString();
    var r = [],
        f = ($.isArray(obj)) ? "[{0}]" : "{{0}}";
    for (var n in obj) {
        var o = obj[n];
        if ($.isUndefined(o) && $.isFunction(o)) continue;
        var v = ($.isNumber(o))
                ? o
                : ($.isDate(o))
                ? '"' + $.dayPoint.parse(o).toJson() + '"'
                : ($.isString(o))
                ? '"' + json_serializeString(o) + '"'
                : $.json.serialize(o);
         if($.isUndefined(v)) continue;
        r[r.length] = (($.isObject(obj) && !$.isArray(obj))
            ? ("\"" + n + "\"" + ":")
            : "") + v;
    }
    return $.str.format(f, r);
};
$.json.deserialize = function(str) {
    if(/function|(=$)/i.test(str)) return str;
    try {
        var obj = ($.isString(str)) ? eval("(" + json_deserializeString(str) + ")") : str;
        if(!$.exists(obj)) return obj;
        if($.isNullOrEmpty(obj.tagName) &&
            ($.isObject(obj) || $.isArray(obj))) {
            for (var n in obj) {
                var value = obj[n];
                if ($.isObject(value) || $.isArray(value)) obj[n] = $.json.deserialize(value);
                if(/\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value) && $.dayPoint.canParse(value)) {
                    obj[n] = $.dayPoint.parse(value).toDate();
                }
            }
            return obj;
        }
        return (/\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(obj))
                ? $.dayPoint.parse(obj).toDate()
                : obj;
    }
    catch (e) { console.log(e); return str; }
};

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
    var result = "";
    $.hash(obj).each(function(item){
        var value = item.value,
            serializeValue = $.isDate(value) ? $.dayPoint.parse(value).toJson() : value;
        result += $.str.format("&{0}={1}", encodeURIComponent(item.key), encodeURIComponent($.json.serialize(serializeValue)));
    });
    return result.replace(/^\&/, "");
};
$.queryString.deserialize = function(str) {
    if(!/\??\w+=\w+/.test(str)) return;
    var queryString = str.replace(/.*\?/, ""),
        keyValuePairs = queryString.split("&"),
        result = $.hash();

    $.list(keyValuePairs).each(function(item) {
        var pair = item.split("="),
            key = pair[0],
            value = pair[1],
            deserializeValue = (/^null$|^true$|^false$|^\d+(\.\d+?)?$|^\[.*\]$|^\{.*\}$/.test(value))
                                ? value
                                : '"' + value + '"';

        result.add(decodeURIComponent(key), $.json.deserialize(decodeURIComponent(deserializeValue)));
    });

    return result.toObject();
};

function binaryFile(data) {
    this._data = data;
}
binaryFile.prototype = {
    getByteAt: function(index) { return this._data.charCodeAt(index); },
    getLength: function() { return this._data.length; },
    getStringAt: function(a, b) { return this._data.substring(a, a + b); },
    getShortAt: function(offset, isBigEndian) {
        var data = this._data,
            intShort = isBigEndian
                ? (data.charCodeAt(offset) << 8) + data.charCodeAt(offset + 1)
                : (data.charCodeAt(offset + 1) << 8) + data.charCodeAt(offset);

        return (intShort < 0) ? intShort + 65536 : intShort;
    },
    getLongAt: function(offset, isBigEndian) {
        var data = this._data,
            byte1 = data.charCodeAt(offset),
            byte2 = data.charCodeAt(offset + 1),
            byte3 = data.charCodeAt(offset + 2),
            byte4 = data.charCodeAt(offset + 3),
            intLong = isBigEndian
                ? (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4
                : (((((byte4 << 8) + byte3) << 8) + byte2) << 8) + byte1;

        return (intLong < 0) ? intLong + 4294967296 : intLong;
    },
    getSLongAt: function(offset, isBigEndian) {
        var uintLong = this.getLongAt(offset, isBigEndian);
        return (uintLong > 2147483647) ? uintLong - 4294967296 : uintLong;
    }
};

binaryFile.parseImageResult = function(result) {
    var base64Data = result.replace(/data:image\/.*;base64,/, ""),
        data = $.str.decodeBase64(base64Data);

    return new binaryFile(data);
};

$.blob = {
    create: function(binaryArray, mimeType) {
        try{
          return new Blob([binaryArray], { type: mimeType });
        }
        catch(e){
            var blobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder,
                isTypeError = e.name == "TypeError",
                isInvalidState = e.name == "InvalidStateError";

            if(isTypeError && $.exists(blobBuilder)){
                var builder = new blobBuilder();
                builder.append(binaryArray.buffer);
                return builder.getBlob(mimeType);
            }

            return (isInvalidState)
                ? new Blob([binaryArray.buffer], {type : mimeType})
                : null;
        }
    },
    parseDataUrl: function(dataUrl) {
        var dataArray = dataUrl.split(','),
            byteString = (dataArray[0].indexOf('base64') >= 0)
                ? $.str.decodeBase64(dataArray[1])
                : decodeURIComponent(dataArray[1]),

            dataLength = byteString.length,
            mimeString = dataArray[0].split(':')[1].split(';')[0],
            unitArray = new Uint8Array(dataLength);

        for (var i = 0; i < dataLength; i++)
            unitArray[i] = byteString.charCodeAt(i);

        return $.blob.create(unitArray, mimeString);
    }
};

var exif = {
    isValidJpeg: function(file) {
        return $.exists(file) && (file.getByteAt(0) == 0xFF || file.getByteAt(1) == 0xD8);
    },

    readExifDataInImageResult: function(result) {
        if(!$.exists(result)) throw $.ku4exception("EXIF", "Cannot get exif data for an invalid image result.");
        var file = binaryFile.parseImageResult(result);
        return exif.readExifDataInJpeg(file);
    },

    readExifDataInJpeg: function (file) {

        if(!exif.isValidJpeg(file)) return invalidExifReturnValue();

        var fileLength = file.getLength(), offset = 2, marker;

        function isValidMarkerOffset(file, offset) { return file.getByteAt(offset) == 0xFF }

        function isFfe1Marker(marker) { return marker == 22400 || marker == 225; }

        while (offset < fileLength) {
            if (!isValidMarkerOffset(file, offset)) return invalidExifReturnValue();;

            marker = file.getByteAt(offset + 1);

            var offsetPlus4 = offset + 4,
                intShort = file.getShortAt(offset + 2, true),
                intShortPlus2 = intShort + 2,
                intShortMinus2 = intShort - 2;

            if (isFfe1Marker(marker))
                return exif.readExifData(file, offsetPlus4, intShortMinus2);

            offset += intShortPlus2;
        }

        return invalidExifReturnValue();
    },

    readExifData: function (file, start) {

        if(!isValidExif(file, start)) return {};

        var tiffOffset = start + 6,
            isBigEndian = file.getShortAt(tiffOffset) == 0x4D4D;

        if (!isValidTiff(file, tiffOffset, isBigEndian)) return {};

        //NOTE: tags should be a property and return the valid tags.

        var tiffTags = exif.readTiffTags(file, tiffOffset, isBigEndian),

            exifTags = ($.exists(tiffTags.ExifIFDPointer))
                ? exif.readExifTags(file, tiffOffset, tiffTags.ExifIFDPointer, isBigEndian) : {},

            gpsTags = ($.exists(tiffTags.GPSInfoIFDPointer))
                ? exif.readGpsTags(file, tiffOffset, tiffTags.GPSInfoIFDPointer, isBigEndian) : {};

        return $.hash().merge(tiffTags).merge(exifTags).merge(gpsTags).toObject();
    },

    readTiffTags: function(file, offset, isBigEndian) {
        return exif.readTags(file, offset, offset + 8, TIFF_TAGS, isBigEndian);
    },

    readExifTags: function(file, offset, exifIfdPointer, isBigEndian) {
        var exifTags = exif.readTags(file, offset, offset + exifIfdPointer, EXIF_TAGS, isBigEndian),
            tags = {};

        for (var tag in exifTags) {
            if(exifTags.hasOwnProperty(tag)) {
                var data = exifTags[tag];
                if(!$.exists(data)) continue;
                switch (tag) {
                    case "FileSource" :
                        exifTags[tag] = META_TAGS[tag][data];
                        break;
                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifTags[tag] = String.fromCharCode(data[0], data[1], data[2], data[3]);
                        break;
                    case "ComponentsConfiguration" :
                        var components = META_TAGS.Components;
                        exifTags[tag] = components[data[0]] + components[data[1]] + components[data[2]] + components[data[3]];
                        break;
                }
                tags[tag] = exifTags[tag];
            }
        }
        return tags;
    },

    readGpsTags: function(file, offset, gpsInfoIfdPointer, isBigEndian) {
        var gpsTags = exif.readTags(file, offset, offset + gpsInfoIfdPointer, GPS_TAGS, isBigEndian),
            tags = {};

        for (var tag in gpsTags) {
            if (gpsTags.hasOwnProperty(tag)) {
                var data = gpsTags[tag];
                if(!$.exists(data)) continue;
                switch (tag) {
                    case "GPSVersionID" :
                        gpsTags[tag] = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                        break;
                }
                tags[tag] = gpsTags[tag];
            }
        }
        return tags
    },

    readTags: function(file, tiffStart, dirStart, strings, isBigEndian) {
        var entries = file.getShortAt(dirStart, isBigEndian),
            tags = {},
            entryOffset, tag;

        for (var i = 0; i < entries; i++) {
            entryOffset = dirStart + i * 12 + 2;

            tag = strings[file.getShortAt(entryOffset, isBigEndian)] || "UNDEF_Proprietary_data_" + dirStart + "_" + i;
            tags[tag] = exif.readTagValue(file, entryOffset, tiffStart, dirStart, isBigEndian);
        }
        return tags;
    },

    readTagValue: function (file, entryOffset, tiffStart, dirStart, isBigEndian) {
        var type = file.getShortAt(entryOffset + 2, isBigEndian),
            numValues = file.getLongAt(entryOffset + 4, isBigEndian),
            valueOffset = file.getLongAt(entryOffset + 8, isBigEndian) + tiffStart,
            offset, numerator, denominator, vals, i;

        switch (type) {
            case 2:
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return file.getStringAt(offset, numValues - 1);
            case 3: //NOTE: intShort, 16 bit int
                if (numValues == 1) {
                    return file.getShortAt(entryOffset + 8, isBigEndian);
                }
                else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (i = 0; i < numValues; i++) {

                        vals[i] = file.getShortAt(offset + 2 * i, isBigEndian);
                    }
                    return vals;
                }
            case 4: //NOTE: long, 32 bit int
                if (numValues == 1) {
                    return file.getLongAt(entryOffset + 8, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getLongAt(valueOffset + 4 * i, isBigEndian);
                    }
                    return vals;
                }
            case 5: //NOTE: rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getLongAt(valueOffset, isBigEndian);
                    denominator = file.getLongAt(valueOffset + 4, isBigEndian);
                    return numerator/denominator;
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        numerator = file.getLongAt(valueOffset + 8 * i, isBigEndian);
                        denominator = file.getLongAt(valueOffset + 4 + 8 * i, isBigEndian);
                        vals[i] = numerator/denominator;
                    }
                    return vals;
                }
            case 7:
                if (numValues == 1) {
                    return file.getByteAt(entryOffset + 8, isBigEndian);
                }
                else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getByteAt(offset + i);
                    }
                    return vals;
                }
            case 9:
                if (numValues == 1) {
                    return file.getSLongAt(entryOffset + 8, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getSLongAt(valueOffset + 4 * i, isBigEndian);
                    }
                    return vals;
                }
            case 10:
                if (numValues == 1) {
                    return file.getSLongAt(valueOffset, isBigEndian) / file.getSLongAt(valueOffset + 4, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[n] = file.getSLongAt(valueOffset + 8 * i, isBigEndian) / file.getSLongAt(valueOffset + 4 + 8 * i, isBigEndian);
                    }
                    return vals;
                }
            default: return null
        }
    }
};

function isValidExif (file, charIndex) {
    return (file.getStringAt(charIndex, 4) == "Exif");
}

function isValidTiff (file, offset, isBigEndian) {
    return (file.getShortAt(offset + 2, isBigEndian) == 0x002A) ||
           (file.getLongAt(offset + 4, isBigEndian) == 0x00000008)
}

function invalidExifReturnValue () {
    return { "__INVALID_FILE__": "Cannot read EXIF data." };
}

$.exif = function() {
    return exif;
};

var EXIF_TAGS = {
    0x9000: "ExifVersion",
    0xA000: "FlashpixVersion",
    0xA001: "ColorSpace",
    0xA002: "PixelXDimension",
    0xA003: "PixelYDimension",
    0x9101: "ComponentsConfiguration",
    0x9102: "CompressedBitsPerPixel",
    0x927C: "MakerNote",
    0x9286: "UserComment",
    0xA004: "RelatedSoundFile",
    0x9003: "DateTimeOriginal",
    0x9004: "DateTimeDigitized",
    0x9290: "SubsecTime",
    0x9291: "SubsecTimeOriginal",
    0x9292: "SubsecTimeDigitized",
    0x829A: "ExposureTime",
    0x829D: "FNumber",
    0x8822: "ExposureProgram",
    0x8824: "SpectralSensitivity",
    0x8827: "ISOSpeedRatings",
    0x8828: "OECF",
    0x9201: "ShutterSpeedValue",
    0x9202: "ApertureValue",
    0x9203: "BrightnessValue",
    0x9204: "ExposureBias",
    0x9205: "MaxApertureValue",
    0x9206: "SubjectDistance",
    0x9207: "MeteringMode",
    0x9208: "LightSource",
    0x9209: "Flash",
    0x9214: "SubjectArea",
    0x920A: "FocalLength",
    0xA20B: "FlashEnergy",
    0xA20C: "SpatialFrequencyResponse",     
    0xA20E: "FocalPlaneXResolution",
    0xA20F: "FocalPlaneYResolution",
    0xA210: "FocalPlaneResolutionUnit",
    0xA214: "SubjectLocation",
    0xA215: "ExposureIndex",
    0xA217: "SensingMethod",
    0xA300: "FileSource",
    0xA301: "SceneType",
    0xA302: "CFAPattern",
    0xA401: "CustomRendered",
    0xA402: "ExposureMode",
    0xA403: "WhiteBalance",
    0xA404: "DigitalZoomRation",
    0xA405: "FocalLengthIn35mmFilm",
    0xA406: "SceneCaptureType",
    0xA407: "GainControl",
    0xA408: "Contrast",
    0xA409: "Saturation",
    0xA40A: "Sharpness",
    0xA40B: "DeviceSettingDescription",      
    0xA40C: "SubjectDistanceRange",          
    0xA005: "InteroperabilityIFDPointer",
    0xA420: "ImageUniqueID"                  
};

var GPS_TAGS = {
    0x0000: "GPSVersionID",
    0x0001: "GPSLatitudeRef",
    0x0002: "GPSLatitude",
    0x0003: "GPSLongitudeRef",
    0x0004: "GPSLongitude",
    0x0005: "GPSAltitudeRef",
    0x0006: "GPSAltitude",
    0x0007: "GPSTimeStamp",
    0x0008: "GPSSatellites",
    0x0009: "GPSStatus",
    0x000A: "GPSMeasureMode",
    0x000B: "GPSDOP",
    0x000C: "GPSSpeedRef",
    0x000D: "GPSSpeed",
    0x000E: "GPSTrackRef",
    0x000F: "GPSTrack",
    0x0010: "GPSImgDirectionRef",
    0x0011: "GPSImgDirection",
    0x0012: "GPSMapDatum",
    0x0013: "GPSDestLatitudeRef",
    0x0014: "GPSDestLatitude",
    0x0015: "GPSDestLongitudeRef",
    0x0016: "GPSDestLongitude",
    0x0017: "GPSDestBearingRef",
    0x0018: "GPSDestBearing",
    0x0019: "GPSDestDistanceRef",
    0x001A: "GPSDestDistance",
    0x001B: "GPSProcessingMethod",
    0x001C: "GPSAreaInformation",
    0x001D: "GPSDateStamp",
    0x001E: "GPSDifferential"
};

var META_TAGS = {
    ExposureProgram: {
        0: "Not defined",
        1: "Manual",
        2: "Normal program",
        3: "Aperture priority",
        4: "Shutter priority",
        5: "Creative program",
        6: "Action program",
        7: "Portrait mode",
        8: "Landscape mode"
    },
    MeteringMode: {
        0: "Unknown",
        1: "Average",
        2: "CenterWeightedAverage",
        3: "Spot",
        4: "MultiSpot",
        5: "Pattern",
        6: "Partial",
        255: "Other"
    },
    LightSource: {
        0: "Unknown",
        1: "Daylight",
        2: "Fluorescent",
        3: "Tungsten (incandescent light)",
        4: "Flash",
        9: "Fine weather",
        10: "Cloudy weather",
        11: "Shade",
        12: "Daylight fluorescent (D 5700 - 7100K)",
        13: "Day white fluorescent (N 4600 - 5400K)",
        14: "Cool white fluorescent (W 3900 - 4500K)",
        15: "White fluorescent (WW 3200 - 3700K)",
        17: "Standard light A",
        18: "Standard light B",
        19: "Standard light C",
        20: "D55",
        21: "D65",
        22: "D75",
        23: "D50",
        24: "ISO studio tungsten",
        255: "Other"
    },
    Flash: {
        0x0000: "Flash did not fire",
        0x0001: "Flash fired",
        0x0005: "Strobe return light not detected",
        0x0007: "Strobe return light detected",
        0x0009: "Flash fired, compulsory flash mode",
        0x000D: "Flash fired, compulsory flash mode, return light not detected",
        0x000F: "Flash fired, compulsory flash mode, return light detected",
        0x0010: "Flash did not fire, compulsory flash mode",
        0x0018: "Flash did not fire, auto mode",
        0x0019: "Flash fired, auto mode",
        0x001D: "Flash fired, auto mode, return light not detected",
        0x001F: "Flash fired, auto mode, return light detected",
        0x0020: "No flash function",
        0x0041: "Flash fired, red-eye reduction mode",
        0x0045: "Flash fired, red-eye reduction mode, return light not detected",
        0x0047: "Flash fired, red-eye reduction mode, return light detected",
        0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
        0x004D: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
        0x004F: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
        0x0059: "Flash fired, auto mode, red-eye reduction mode",
        0x005D: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
        0x005F: "Flash fired, auto mode, return light detected, red-eye reduction mode"
    },
    SensingMethod: {
        1: "Not defined",
        2: "One-chip color area sensor",
        3: "Two-chip color area sensor",
        4: "Three-chip color area sensor",
        5: "Color sequential area sensor",
        7: "Trilinear sensor",
        8: "Color sequential linear sensor"
    },
    SceneCaptureType: {
        0: "Standard",
        1: "Landscape",
        2: "Portrait",
        3: "Night scene"
    },
    SceneType: {
        1: "Directly photographed"
    },
    CustomRendered: {
        0: "Normal process",
        1: "Custom process"
    },
    WhiteBalance: {
        0: "Auto white balance",
        1: "Manual white balance"
    },
    GainControl: {
        0: "None",
        1: "Low gain up",
        2: "High gain up",
        3: "Low gain down",
        4: "High gain down"
    },
    Contrast: {
        0: "Normal",
        1: "Soft",
        2: "Hard"
    },
    Saturation: {
        0: "Normal",
        1: "Low saturation",
        2: "High saturation"
    },
    Sharpness: {
        0: "Normal",
        1: "Soft",
        2: "Hard"
    },
    SubjectDistanceRange: {
        0: "Unknown",
        1: "Macro",
        2: "Close view",
        3: "Distant view"
    },
    FileSource: {
        3: "DSC"
    },
    Components: {
        0: "",
        1: "Y",
        2: "Cb",
        3: "Cr",
        4: "R",
        5: "G",
        6: "B"
    }
};

var TIFF_TAGS = {
    0x0100: "ImageWidth",
    0x0101: "ImageHeight",
    0x8769: "ExifIFDPointer",
    0x8825: "GPSInfoIFDPointer",
    0xA005: "InteroperabilityIFDPointer",
    0x0102: "BitsPerSample",
    0x0103: "Compression",
    0x0106: "PhotometricInterpretation",
    0x0112: "Orientation",
    0x0115: "SamplesPerPixel",
    0x011C: "PlanarConfiguration",
    0x0212: "YCbCrSubSampling",
    0x0213: "YCbCrPositioning",
    0x011A: "XResolution",
    0x011B: "YResolution",
    0x0128: "ResolutionUnit",
    0x0111: "StripOffsets",
    0x0116: "RowsPerStrip",
    0x0117: "StripByteCounts",
    0x0201: "JPEGInterchangeFormat",
    0x0202: "JPEGInterchangeFormatLength",
    0x012D: "TransferFunction",
    0x013E: "WhitePoint",
    0x013F: "PrimaryChromaticities",
    0x0211: "YCbCrCoefficients",
    0x0214: "ReferenceBlackWhite",
    0x0132: "DateTime",
    0x010E: "ImageDescription",
    0x010F: "Make",
    0x0110: "Model",
    0x0131: "Software",
    0x013B: "Artist",
    0x8298: "Copyright"
};

function abstractField(){
    abstractField.base.call(this);
    this._onIsValid = $.observer();
    this._onInvalid = $.observer();
    this.spec($.spec(function(){ return true; })).optional()
}
abstractField.prototype = {
    $read: function(){ return; },
    $write: function(){ return; },
    $clear: function(){ return; },
    value: function(value){
        if(!$.exists(value)) return this.$read();
        this.$write(value);
        return this;
    },
    clear: function(){ return this.$clear(); },
    optional: function(){ this._optionSpec = $.fields.specs.optional; this._operand = "or"; return this; },
    required: function(){ this._optionSpec = $.fields.specs.required; this._operand = "and"; return this; },
    spec: function(spec){ return this.property("spec", spec); },
    isValid: function(){
        var b = this._optionSpec[this._operand](this.spec()).isSatisfiedBy(this.value()),
            o = (b) ? this._onIsValid : this._onInvalid;
        o.notify(this);
        return b;
    },
    isEmpty: function(){ return $.isEmpty(this.value()); },
    onIsValid: function(f, s, id){ this._onIsValid.add(f, s, id); return this; },
    onInvalid: function(f, s, id){ this._onInvalid.add(f, s, id); return this; }
 };
$.Class.extend(abstractField, $.Class);

function field(selector){
    field.base.call(this);
    var node = queryDom(selector);
    this.dom(node).format(function(value) { return value; });
}
field.prototype = {
    $read: function(){ return this._format(this.dom().value); },
    $write: function(value){ this.dom().value = value; },
    $clear: function(){ this.dom().value = ""; return this; },
    $readFiles: function(func, scp) {
        var scope = scp || this;
        return func.call(scope, this.files());
    },
    format: function(func) { this._format = func; return this; },
    dom: function(dom){ return this.property("dom", dom); },
    hasFiles: function() { return $.exists(this.dom().files); },
    fileCount: function() { return (!this.hasFiles) ? 0 : this.files().length; },
    files: function() { return this.dom().files; },
    readFiles: function(func, scp) { return this.$readFiles(func, scp); }
 };
$.Class.extend(field, abstractField);
$.field = function(selector){ return new field(selector); };
$.field.Class = field;

//TODO: This method should be moved if/when ku4js supports further DOM features.
function queryDom(selector)
{
    var query;
    try {
        query = document.querySelectorAll(selector);
    }
    catch(e) {
        if($.exists(selector.ownerDocument)) { return selector; }
        else  { throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}", selector)); }
    }

    if(query.length > 1)
        throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}. Requires unique node", selector));
    if(!$.exists(query[0]))
        throw $.ku4exception("$.field", $.str.format("Invalid DOM selector= {0}", selector));
    return query[0];
}

function checkbox(selector){
    checkbox.base.call(this, selector);
}
checkbox.prototype = {
    $read: function(){
        var d = this.dom();
        return (d.checked) ? d.value : "";
    },
    $write: function(value){
        var d = this.dom();
        d.checked = (d.value == value);
    },
    $clear: function(){ this.uncheck(); return this; },
    check: function(){ this.dom().checked = true; return this; },
    uncheck: function(){ this.dom().checked = false; return this; }
};
$.Class.extend(checkbox, field);
$.checkbox = function(selector){ return new checkbox(selector); };
$.checkbox.Class = checkbox;

function imageFileField(selector) {
    imageFileField.base.call(this, selector);
}

imageFileField.prototype = {
    maxDims: function(value) { return this.property("maxDims", $.point.parse(value)); },
    $readFiles: function(func, scp) {
        var files = $.list(this.files()),
            maxDims = this._maxDims,
            resizedFiles = $.list(),
            fileCount = this.fileCount(),
            scope = scp || this;

        if(!$.exists(maxDims) || files.isEmpty()) func.call(scope, this.files());
        else
        {
            function callback() { func.call(scope, resizedFiles.toArray()); }

            files.each(function (file) {

                var image = document.createElement("img"),
                    sourceCanvas = document.createElement("canvas"),
                    sourceContext = sourceCanvas.getContext("2d"),
                    reader = new FileReader();

                reader.onload = function (e) {
                    fileCount --;


                    //NEED to pull this so that you can use it for ajax functions in the browser plugin
                    image.src = e.target.result;
                    image.onload = function() {

                        sourceContext.drawImage(image, 0, 0);

                        var exif = $.exif().readExifDataInImageResult(e.target.result),
                            orientation = exif.Orientation,
                            maxRect = $.rectangle($.point.zero(), maxDims),
                            imageWidth = ($.exists(image.naturalWidth)) ? image.naturalWidth : image.width,
                            imageHeight = ($.exists(image.naturalHeight)) ? image.naturalHeight : image.height,
                            imageRect = $.rectangle($.point.zero(), $.point(imageWidth, imageHeight)),
                            aspectDims = imageRect.aspectToFit(maxRect).dims(),
                            aspectWidth = aspectDims.x(),
                            aspectHeight = aspectDims.y(),
                            aspectCanvasWidth = (orientation == 6 || orientation == 8) ? aspectHeight : aspectWidth,
                            aspectCanvasHeight = (orientation == 6 || orientation == 8) ? aspectWidth : aspectHeight,
                            aspectCanvas = document.createElement("canvas");

                        aspectCanvas.width = aspectCanvasWidth;
                        aspectCanvas.height = aspectCanvasHeight;

                        var aspectContext = aspectCanvas.getContext("2d");

                        if(!$.isNumber(orientation) || orientation == 1) {
                            aspectContext.drawImage(image, 0, 0, aspectWidth, aspectHeight);
                        }
                        else {
                            var radians = Math.PI/180, rotation;

                            switch (orientation) {
                                case 3: rotation = 180 * radians; break;
                                case 6: rotation = 90 * radians; break;
                                case 8: rotation = -90 * radians; break;
                                default: rotation = 0;
                            }
                            aspectContext.translate(aspectCanvasWidth/2, aspectCanvasHeight/2);
                            aspectContext.rotate(rotation);
                            aspectContext.drawImage(image, -aspectCanvasHeight/2, -aspectCanvasWidth/2, aspectWidth, aspectHeight);
                        }

                        var dataUrl = aspectCanvas.toDataURL("image/jpeg", 1.0),
                            blob = $.blob.parseDataUrl(dataUrl);

                        blob.lastModified = file.lastModified;
                        blob.lastModifiedDate = file.lastModifiedDate;
                        blob.name = file.name;

                        resizedFiles.add(blob);
                        if (fileCount < 1) callback();
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }
};
$.Class.extend(imageFileField, field);
$.imageFileField = function(selector){ return new imageFileField(selector); };
$.imageFileField.Class = imageFileField;

function radioset(){
    radioset.base.call(this);
    this._radios = $.list();
}
radioset.prototype = {
    $read: function(){
        var rv = [];
        this._radios.each(function(r){ if(r.checked) rv.push(r.value); });
        return rv.toString();
    },
    $write: function(value){
        var v = ($.isString(value)) ? value.split(",") : value,
            vlist = $.list(v);
        this._radios.each(function(r){ r.checked = vlist.contains(r.value); });
    },
    $clear: function(){
        this._radios.each(function(r){ r.checked = false; });
    },
    add: function(dom){
        this._radios.add(dom);
        return this;
    },
    listNodes: function(){ return this._radios; } 
};
$.Class.extend(radioset, abstractField);
$.radioset = function(){ return new radioset(); };
$.radioset.Class = radioset;

function select(selector){
    select.base.call(this, selector);
    this._opts = function(){ return $.list(this.dom().options); };
    if(this.dom().multiple) this.multiple();
    else this.single();
}
select.prototype = {
    $read: function(){
        var rv = [];
        this._opts().each(function(opt){ if(opt.selected) rv.push(opt.value); });
        return rv.toString();
    },
    $write: function(value){
        return (this._multiple) ? select_writeMultiple(this, value) : select_writeSingle(this, value);
    },

    multiple: function(){ this._multiple = true; return this; },
    single: function(){ this._multiple = false; return this; },
	addOptgroup: function(){
		this.dom().appendChild(document.createElement('optgroup'));
		return this;
	},
    addOption: function(k, v, index, isOptGroup){
        var dom = this.dom(),
            option = document.createElement('option'),
            idx = index || null,
            opt = ($.exists(idx)) ? dom.options[idx] : null;
        option.text = k;
        option.value = v;
		
		if(isOptGroup) 
			dom.getElementsByTagName("optgroup")[index].appendChild(option);
		else {
			try { dom.add(option, opt); }
			catch(ex) { dom.add(option, idx); }
		}
        return this;
    },
    removeOption: function(index){
      this.dom().remove(index);
      return this;
    }
};
$.Class.extend(select, field);
$.select = function(selector){ return new select(selector); };
$.select.Class = select;

function select_writeSingle(select, value){
    select._opts().each(function(opt){
        opt.selected = (opt.value == value);
    });
    return select;
}
function select_writeMultiple(select, value){
    var v = ($.isString(value)) ? value.split(",") : value,
        vlist = $.list(v);
    select._opts().each(function(opt){
        opt.selected = vlist.contains(opt.value);
    });
    return select;
}

function form(){
    form.base.call(this);
    this._onSubmit = $.observer();
    this._fields = $.hash();
}
form.prototype = {
    $submit: function(){ return; },
    name: function(name){ return this.property("name", name); },
    fields: function(){ return this._fields; },
    listFields: function(){ return $.list(this._fields.values()); },
    findField: function(name){ return this._fields.findValue(name); },
    isEmpty: function(){
        var v = true;
        $.list(this._fields.values()).each(function(f){ if(!f.isEmpty()) v = false; });
        return v;
    },
    isValid: function(){
        var v = true;
        $.list(this._fields.values()).each(function(f){ if(!f.isValid()) v = false; });
        return v;
    },
    submit: function(){
        var values = this.read();
        this._onSubmit.notify(this);
        this.$submit(values);
    },
    onSubmit: function(f, s, id){ this._onSubmit.add(f, s, id); return this; },
    add: function(n, f){ this._fields.add(n, f); return this; },
    remove: function(n){ this._fields.remove(n); return this; },
    clear: function(){
        this._fields.each(function(f){ f.value.clear(); });
        return this;
    },
    read: function(){
        var dto = $.dto();
        this._fields.each(function(o){
            var k = o.key, v = o.value;
            if($.exists(v.read)) dto.merge(v.read());
            if($.exists(v.value)) dto.add(k, v.value());
        });
        return dto;
    },
    readMultipartData: function()
    {
        var data = new FormData();
        this._fields.each(function(o){
            var k = o.key, v = o.value;
            if($.exists(v.files())) $.list(v.files()).each(function(file) {
                data.append(file.name, file );
            });
            else if($.exists(v.value)) data.append(k, v.value());
        });
        return data;
    },
    readAsyncMultipartData: function(func, scp)
    {
        var data = new FormData(),
            fileCount = 0,
            fieldsRead = false,
            scope = scp || this;

        function callback() { func.call(scope, data); }

        this._fields.each(function(o){
            var name = o.key, field = o.value;
            if($.exists(field.hasFiles) && field.hasFiles()) {
                fileCount += field.fileCount();
                field.readFiles(function (files) {
                    $.list(files).each(function(file) {
                        data.append(file.name, file);
                        fileCount --;
                    });
                    if(fieldsRead && fileCount < 1) callback();
                }, this);
            }
            else if($.exists(field.value)) data.append(name, field.value());
        });
        fieldsRead = true;
        if(fileCount < 1) callback();
    },
    write: function(obj){
        if(!$.exists(obj)) return this;
        var dto = ($.exists(obj.toObject)) ? obj : $.dto(obj);
        this._fields.each(function(o) {
            var field = o.value;
            if($.exists(field.write)) field.write(dto);
            if($.exists(field.value)) field.value(dto.find(o.key));
        });
        return this;
    },
    saveAs: function(name){
        this.read().saveAs(name);
        this._name = name;
        return this;
    },
    save: function(){
        var name = this._name || $.uid("form");
        this.saveAs(name);
        return name;
    },
    erase: function(){
        var name = this._name;
        if($.exists(name)) $.dto.serialize(name).erase();
        return this;
    },
    load: function(name){
        if($.isString(name)) this._name = name;
        var n = this._name;
        return ($.exists(n)) ? this.write($.dto.serialize(n)) : this;
    }
};
$.Class.extend(form, $.Class);
$.form = function() { return new form(); };
$.form.Class = form;

$.fields = {
    specs: (function(){
        var value = {};
        try {
            value.required = $.spec(function(v){ return (!$.isNullOrEmpty(v)) && /^.+$/.test(v); }),
            value.optional = $.spec(function(v){ return $.isNullOrEmpty(v); }),
            
            value.currency = $.spec(function(v){ return /^[\w\$]?(\d+|(\d{1,3}(,\d{3})*))(\.\d{2})?$/.test(v); });
            value.date = $.spec(function(v){ return /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(v); });
            value.alpha = $.spec(function(v){ return /^[A-Za-z]+$/.test(v); });
            value.numeric = $.spec(function(v){ return /^\d+$/.test(v); });
            value.alphaNumeric = $.spec(function(v){ return /^[A-Za-z\d]+$/.test(v); });
            value.phone = $.spec(function(v){ return /^\d{10,11}|(((1\s)?\(\d{3}\)\s?)|((1\-)?\d{3}\-))\d{3}\-\d{4}$/.test(v); });
            value.ssn = $.spec(function(v){ return /^(\d{9}|(\d{3}\-\d{2}\-\d{4}))$/.test(v); });
            value.email = $.spec(function(v){ return /^\w+(\.\w+)?@\w+(\.\w+)?\.[A-Za-z0-9]{2,}$/.test(v); });
        }
        catch(e) { }
        finally { return value; }
    })()
};

function collection(name, obj) {
    if(!$.exists(name))
        throw $.ku4exception("$.collection", $.str.format("Invalid name={0}. Must be unique", name));
    this._name = name;
    this._data = $.dto(obj);

    try {
        this._store = $.ku4store();
    }
    catch(e) {
        this._store = $.ku4memoryStore();
    }
}
collection.prototype = {
    name: function() { return this._name; },
    isEmpty: function() { return this._data.isEmpty(); },
    count: function() { return this._data.count(); },
    store: function(store) { this._store = collection_getStore(store); return this; },
    save: function(callback) { this._store.write(this, callback); return this; },
    init: function(list) { return this.remove().insertList(list); },
    find: function(query) {
        if(!$.exists(query)) return this._data.values();
        var $in = query.$in,
            $spec = query.$spec,
            $orderby = query.$orderby,
            criteria = ($.exists(query.$criteria)) ? query.$criteria : query,
            dto = $.dto(criteria).remove("$in").remove("$spec").remove("$orderby"),
            results = ($.exists($in))
                ? collection_in(this._data, $in)
                : (dto.isEmpty())
                    ? this._data.values()
                    : collection_find(this._data, dto.toObject());

        if($.exists($spec)) results = collection_spec(results, $spec);
        return ($.exists($orderby)) ? collection_orderby(results, $orderby) : results;
    },
    insert: function(entity) {
        var ku4Id = $.uid(),
            dto = $.dto(entity),
            data = dto.toObject();
        this._data.add(ku4Id, data);
        return this;
    },
    insertList: function(list) {
        $.list(list).each(function(entity) { this.insert(entity); }, this);
        return this;
    },
    remove: function(criteria) {
        if(!$.exists(criteria)) this._data.clear();
        else this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(criteria)) this._data.remove(obj.key);
        }, this);
        return this;
    },
    update: function(current, updates) {
        var _updates = $.dto(updates).replicate();
        if(!$.exists(current) || !$.exists(updates)) return;
        else this._data.each(function(obj) {
            var entity = obj.value;
            if($.dto(entity).contains(current)) {
                var newValue = $.dto(entity).merge(_updates).toObject();
                this._data.update(obj.key, newValue);
            }
        }, this);
        return this;
    },
    join: function(other, onKey, equalKey, direction) {
        var thisResults = $.list(this.find()),
            otherResults = $.list(other.find()),
            thisName = this.name(),
            otherName = other.name(),
            func = ($.isFunction(onKey)) ? onKey : function(t, o) { return t[onKey] === o[equalKey]},
            outerDirection = ($.isFunction(onKey)) ? equalKey : direction,
            join = $.hash();

        function addRecord(thisResult, otherResult) {
            var record = $.hash();
            if($.exists(thisResult)) $.hash(thisResult).each(function(obj) { record.add(thisName + "." + obj.key, obj.value); });
            if($.exists(otherResult)) $.hash(otherResult).each(function(obj) { record.add(otherName + "." + obj.key, obj.value); });
            join.add($.uid(), record.toObject());
        }

        //NOTE: This ensures that a right outer join on an empty set returns the join data.
        if(thisResults.isEmpty() && outerDirection === ">") {
            otherResults.each(function (otherResult) {
                addRecord(null, otherResult)
            });
        }
        else {
            var isOuterJoin = $.exists(outerDirection);
            if(isOuterJoin) {
                //NOTE: This performs the outer join.
                var isRight = outerDirection === ">",
                    leftCollection = (isRight) ? otherResults : thisResults,
                    rightCollection = (isRight) ? thisResults : otherResults;

                leftCollection.each(function (thisResult) {
                    var didAddThisResult = false;
                    rightCollection.each(function (otherResult) {
                        if (isRight) {
                            if (func(otherResult, thisResult)) {
                                addRecord(otherResult, thisResult);
                                didAddThisResult = true;
                            }
                        }
                        else {
                            if (func(thisResult, otherResult)) {
                                addRecord(thisResult, otherResult);
                                didAddThisResult = true;
                            }
                        }
                    });
                    if (!didAddThisResult) {
                        if (isRight) addRecord(null, thisResult);
                        else addRecord(thisResult, null);
                    }
                });
            }
            else thisResults.each(function(thisResult) {
                otherResults.each(function(otherResult) {
                    if(func(thisResult, otherResult)) {
                        addRecord(thisResult, otherResult)
                    }
                });
            });
        }
        return $.ku4collection(thisName + "." + otherName, join.toObject());
    },
    exec: function(func) {
        if(!$.isFunction(func))
            throw $.ku4exception("$.collection", $.str.format("Invalid function={0}. exec method requires a function.", name));
        return new execCollection(this, func);
    },
    __delete: function(callback) {
        this.remove()._store.remove(this, callback);
        return this;
    },
    toObject: function() { return this._data.toObject(); },
    serialize: function() {
        var name = this._name,
            data = this.toObject();

        return $.json.serialize({ "name": name, "data": data });
    }
};
$.ku4collection = function(name, obj) { return new collection(name, obj); };
$.ku4collection.deserialize = function(serialized) {
    var obj = $.json.deserialize(serialized);
    return new collection(obj.name, obj.data);
};

function collection_getStore(store) {
    if($.isString(store)) {
        switch (store) {
            case "$.ku4indexedDbStore":
                return $.ku4indexedDbStore();
            case "$.ku4localStorageStore":
                return $.ku4localStorageStore();
            default:
                return $.ku4memoryStore();
        }
    }
    return store;
}

function collection_find(data, criteria) {
    var entities = $.list();
    data.each(function(obj) {
        var entity = obj.value;
        if($.dto(entity).contains(criteria)) entities.add(entity);
    });
    return entities.toArray();
}

function collection_in(data, criteria) {
    var key = $.obj.keys(criteria)[0],
        ins = $.list(criteria[key]),
        results = [];
   ins.each(function(value) {
        results = results.concat(collection_find(data, $.hash().add(key, value).toObject()));
    });
    return results;
}

function collection_spec(arry, spec) {
    var results = $.list(),
        _spec = ($.exists(spec.isSatisfiedBy)) ? spec : $.spec(spec);
    $.list(arry).each(function(item){
        if(_spec.isSatisfiedBy(item)) results.add(item);
    });
    return results.toArray();
}

function collection_orderby(arry, criteria) {
    var key = $.obj.keys(criteria)[0],
        val = criteria[key],
        func = ($.isFunction(val))
                ? function(a, b) { return val(a[key], b[key]); }
                : function(a, b) { return (a[key] < b[key]) ? -val : val; };

    return arry.sort(func);
}

function execCollection(collection, exec) {
    this._collection = collection;
    this._exec = exec;
}
execCollection.prototype = {
    name: function() { return this._collection.name(); },
    isEmpty: function() { return this._collection.isEmpty(); },
    count: function() { return this._collection.count(); },
    store: function(store) { this._collection.store(store); return this; },
    save: function(callback) { this._collection.save(callback); return this; },
    init: function(list) {
        this._collection.init(list);
        return this;
    },
    find: function(query) {
        var values = this._collection.find(query),
            results = $.list();
        $.list(values).each(function(item){
            results.add(this._exec(item));
        }, this);
        return results.toArray();
    },
    insert: function(entity) {
        this._collection.insert(entity);
        return this;
    },
    remove: function(criteria) {
        this._collection.remove(criteria);
        return this;
    },
    update: function(current, updates) {
        this._collection.update(current, updates);
        return this;
    },
    join: function(other, onKey, equalKey) {
        return new execCollection(this._collection.join(other, onKey, equalKey));
    },
    exec: function(func) {
        return this._collection.exec(func);
    },
    __delete: function(callback) {
        this._collection.__delete(callback);
        return this;
    },
    serialize: function() {
        return this._collection.serialize();
    }
};

function abstractStore(name) {
    this._name = name || "ku4indexedDbStore";
}
abstractStore.prototype = {
    read: function(collectionName, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    write: function(collection, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    remove: function(collection, callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __delete: function(callback) {
        callback(new Error("Not Implemented"), null);
        return this;
    },
    __reset: function(callback) {
        return this.__delete(callback);
    }
};

function indexedDbStore(name) {
    this._name = name || "ku4indexedDbStore";
}
indexedDbStore.prototype = {
    read: function(collectionName, callback) {
        var name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            db.transaction(collectionName)
                .objectStore(collectionName)
                .get(1)
                .onsuccess = function (event) {
                    var data = event.target.result,
                        collection = $.ku4collection(collectionName, data).store(me);
                    if($.exists(callback)) callback(null, collection);
                    db.close();
                };
        }, collectionName);
        return this;
    },
    write: function(collection, callback) {
        var collectionName = collection.name(),
            name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) {
                if($.exists(callback)) callback(err, null);
            }
            else {
                var request = db.transaction([collectionName], "readwrite").objectStore(collectionName).put(collection.toObject(), 1);
                request.onerror = function () {
                    if($.exists(callback)) callback(new Error("Error writing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback(null, me);
                    db.close();
                };
            }
        }, collectionName);
        return this;
    },
    remove: function(collection, callback) {
        var collectionName = collection.name(),
            name = this._name,
            me = this;

        ku4indexedDbStore_openDb(name, function (err, db) {
            if($.exists(err)) callback(err, null);
            else {
                var request = db.transaction([collectionName], "readwrite").objectStore(collectionName)["delete"](1);
                request.onerror = function () {
                    if($.exists(callback)) callback(new Error("Error removing data to indexedDbStore"), me);
                    db.close();
                };
                request.onsuccess = function () {
                    if($.exists(callback)) callback(null, me);
                    db.close();
                };
            }
        }, collectionName);
        return this;
    },
    __delete: function(callback) {
        var idxdb = indexedDB || webkitIndexedDB || mozIndexedDB,
            request = idxdb.deleteDatabase(this._name),
            me = this;

        request.onerror = function() { if($.exists(callback)) callback(new Error("Error deleting indexedDbStore.", me))};
        request.onsuccess = function() { if($.exists(callback)) callback(null, me); };
        return this;
    },
    __reset: function(callback) {
        this.__delete(function(err, store) {
            __ku4indexedDbStoreVersion = 0;
            if($.exists(callback)) callback(err, store);
        });
    }
};
$.Class.extend(indexedDbStore, abstractStore);
$.ku4indexedDbStore = function(name) { return new indexedDbStore(name); };

var __ku4indexedDbStoreVersion = 0;
var __ku4indexedDbStorage;
function ku4indexedDbStore_openDb(name, callback, collectionName) {
    var idxdb = ku4indexedDbStore_getIdbx(),
        request = (__ku4indexedDbStoreVersion < 1)
                    ? idxdb.open(name)
                    : idxdb.open(name, __ku4indexedDbStoreVersion);

    request.error = function(){
        callback(new Error("Error opening Indexed Database."), null);
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        db.createObjectStore(collectionName, { autoIncrement: false });
    };

    request.onsuccess = function () {
        var db = request.result;
        __ku4indexedDbStoreVersion = db.version;
        try {
            db.transaction(collectionName);
            callback(null, db);
        }
        catch(e)
        {
            __ku4indexedDbStoreVersion++;
            ku4indexedDbStore_openDb(name, callback, collectionName);
        }
    };
}

function ku4indexedDbStore_getIdbx()
{
    if($.exists(__ku4indexedDbStorage)) return __ku4indexedDbStorage;
    else {
        try {
            __ku4indexedDbStorage = indexedDB || webkitIndexedDB || mozIndexedDB;
        }
        catch (e) {
            try {
            __ku4indexedDbStorage = webkitIndexedDB || mozIndexedDB;
            }
            catch (e) {
                try {
                    __ku4indexedDbStorage = mozIndexedDB;
                }
                catch (e) {
                    throw $.ku4exception("Unsupported Exception", "Browser or Process does not support IndexedDB -- 500");
                }
            }
        }
        if($.exists(__ku4indexedDbStorage)) return __ku4indexedDbStorage;
        throw $.ku4exception("Unsupported Exception", "Browser or Process does not support IndexedDB -- 404");
    }
}

function localStorageStore() { }
localStorageStore.prototype = {
    read: function(collectionName, callback) {
        var collection = localStorage.getItem(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this);

        if($.exists(callback)) callback(null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback) {
        localStorage.setItem(collection.name(), collection.serialize());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    remove: function(collection, callback) {
        localStorage.removeItem(collection.name());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    __delete: function(callback) {
        localStorage.clear();
        if($.exists(callback)) callback(null, this);
        return this;
    }
};
$.Class.extend(localStorageStore, abstractStore);
$.ku4localStorageStore = function() { return new localStorageStore(); };


var __ku4MemoryStore = $.dto();
function memoryStore() { }
memoryStore.prototype = {
    read: function(collectionName, callback) {
        var collection = __ku4MemoryStore.find(collectionName),
            ku4collection =  ($.exists(collection))
                ? $.ku4collection.deserialize(collection).store(this)
                : $.ku4collection(collectionName).store(this);

        if($.exists(callback)) callback(null, ku4collection);
        return ku4collection;
    },
    write: function(collection, callback) {
        __ku4MemoryStore.update(collection.name(), collection.serialize());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    remove: function(collection, callback) {
        __ku4MemoryStore.remove(collection.name());
        if($.exists(callback)) callback(null, this);
        return this;
    },
    __delete: function(callback) {
        __ku4MemoryStore.clear();
        if($.exists(callback)) callback(null, this);
        return this;
    }
};
$.Class.extend(memoryStore, abstractStore);
$.ku4memoryStore = function() { return new memoryStore(); };


$.ku4store = function() {
    if($.exists(localStorage)) return $.ku4localStorageStore();
    else return new $.ku4memoryStore();
};

})();
