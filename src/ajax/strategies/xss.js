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
            format = "{0}?ku4jXssOnSuccess=ku4jsXss.{1}&ku4jXssOnError=ku4jsXss.{2}&ku4jXssOnComplete=ku4jsXss.{3}{4}",
            procId = context.processId(),
            success = procId + "_success",
            error = procId + "_error",
            complete = procId + "_complete",
            parameters = ($.exists(params)) ? "&" + params : "",
            location = $.str.format(format, context.uri(), success, error, complete, parameters),
            scriptTag = document.createElement("script");

        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("language", "javascript");
        scriptTag.setAttribute("src", location);

        ku4jsXss[success] = function(){ context.success.apply(context, arguments); };
        ku4jsXss[error] = function(){ context.error.apply(context, arguments); };
        ku4jsXss[complete] = function(){ context.complete.apply(context, arguments); };
            
        this._head.appendChild(scriptTag);
    }
};
$.Class.extend(xss, $.Class);

ku4jsXss = {};